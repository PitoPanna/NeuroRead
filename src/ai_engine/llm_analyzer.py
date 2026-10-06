from pydantic import BaseModel, Field
import instructor
from openai import OpenAI

class HighlightedSegment(BaseModel):
    text: str = Field(
        description="A kiemelendő szó, kifejezés vagy tagmondat pontos szövege az eredeti szövegből."
    )
    color_code: str = Field(
        description="HEX színkód: '#F97316' (narancs: munkamemóriát terhelő kifejezés) vagy '#EF4444' (piros: összetett mondatszerkezet/elakadási pont)."
    )
    highlight_type: str = Field(
        default="llm_cognitive",
        description="A kiemelés típusa, értéke: 'llm_cognitive'."
    )
    reason: str = Field(
        description="Rövid kognitív indoklás (pl. 'Magas munkamemória-terhelés', 'Összetett syntaxis')."
    )
class CognitiveModeling(BaseModel):
    semantic_complexity_score: int = Field(
        description="A szöveg fogalmi nehézsége 1-től 10-ig."
    )
    working_memory_load: str = Field(
        description="A munkamemória várható terhelése (alacsony, közepes, magas) és annak leírása."
    )
    cognitive_friction_points: list[str] = Field(
        description="Az agyi feldolgozás során felmerülő lehetséges elakadások vagy fókuszvesztési pontok."
    )
    highlighted_terms: list[str] = Field(
        description="A kifestendő / kiemelendő nehéz szavak, szakzsargonok listája."
    )

class SimplifiedText(BaseModel):
    simplified_version: str = Field(
        description="A szöveg közérthető, egyszerűsített átfogalmazása PONTOSAN UGYANAZON A NYELVEN, mint az eredeti szöveg."
    )
    key_takeaways: list[str] = Field(
        description="A legfontosabb gondolatok vázlatos felsorolása az eredeti szöveg nyelvén."
    )


# instructor Kliens Beállítása

client = instructor.from_openai(
    OpenAI(
        base_url="http://localhost:11434/v1",
        api_key="ollama",
    ),
    mode=instructor.Mode.JSON,
)


# 3. Modulok

#elküldi az Ollamanak a promttal, megjelöli nehézségi pontokat, és visszakapja a kognitív feldolgozás elemzését
def model_cognitive_process(text: str, language: str = "hu") -> CognitiveModeling:
 
    lang_names = {
        "hu": "magyar (Hungarian)",
        "ro": "román (Romanian)",
        "en": "angol (English)"
    }
    target_lang = lang_names.get(language, "magyar")

    prompt = f"""
    Egy kognitív idegkutató és olvasás-pszichológiai AI asszisztens vagy.
    Elemzed az alábbi szöveget {target_lang} nyelven, és lemodellezed, milyen kognitív folyamatokat vált ki az olvasó agyában.
    Azonosítsd a kifestendő (kiemelendő) nehéz szavakat és a munkamemóriát terhelő pontokat.
    
    Elemzendő szöveg:
    "{text}"
    """
    
    response = client.chat.completions.create(
        model="llama3",
        response_model=CognitiveModeling,
        messages=[
            {"role": "system", "content": "Válaszolj szigorúan strukturált JSON formátumban."},
            {"role": "user", "content": prompt},
        ],
    )
    return response

#egyszerűsíti a szöveget, ha a felhasználó megnyomja az "Egyszerűsítés" gombot
def simplify_text_on_demand(text: str, language: str = "hu") -> SimplifiedText:
  
    lang_names = {
        "hu": "magyar (Hungarian)",
        "ro": "román (Romanian)",
        "en": "angol (English)"
    }
    target_lang = lang_names.get(language, "magyar")

    prompt = f"""
    CRITICAL INSTRUCTION: You MUST respond strictly in {target_lang}. Do NOT translate to English.
    
    Feladat: Fogalmazd át az alábbi szöveget {target_lang} nyelven úgy, hogy az kognitív szempontból a lehető legkönnyebben feldolgozható és közérthető legyen.
    
    Eredeti szöveg:
    "{text}"
    """
    
    response = client.chat.completions.create(
        model="llama3",
        response_model=SimplifiedText,
        messages=[
            {
                "role": "system", 
                "content": f"Egy  kognitív szövegegyszerűsítő asszisztens vagy. KIZÁRÓLAG {target_lang} nyelven válaszolhatsz, angol használata SZIGORÚAN TILOS!"
            },
            {"role": "user", "content": prompt},
        ],
    )
    return response
