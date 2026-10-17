import os
import instructor
from openai import OpenAI
from src.ai_engine.schemas import CognitiveModeling, SimplifiedText

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434/v1")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3")

# instructor client
client = instructor.from_openai(
    OpenAI(
        base_url=OLLAMA_BASE_URL,
        api_key=os.getenv("OLLAMA_API_KEY", "ollama"),
        timeout=4.0,
    ),
    mode=instructor.Mode.JSON,
)

def model_cognitive_process(text: str, language: str = "hu") -> CognitiveModeling:
    """
    Elemzi a szöveget az Ollama/Llama 3 segítségével:
    - Kiemeli a kognitívan terhelő szavakat és mondatszerkezeteket színkódokkal.
    - Kiszámítja a 4 fő agyterület terhelését (0.0 - 1.0).
    - Meghatározza a 3D-s vizualizációhoz szükséges aktív szinaptikus útvonalakat.
    """
    lang_names = {
        "hu": "magyar (Hungarian)",
        "ro": "román (Romanian)",
        "en": "angol (English)"
    }
    target_lang = lang_names.get(language, "magyar")

    prompt = f"""
    Egy kognitív idegkutató és olvasás-pszichológiai AI asszisztens vagy.
    Elemzed az alábbi szöveget {target_lang} nyelven, és lemodellezed, milyen kognitív és szinaptikus folyamatokat vált ki az olvasó agyában.

    FELADATOK:
    1. Határozd meg a fogalmi nehézséget (1-10) és a munkamemória terhelési szintjét.
    2. Jelöld meg a kifestendő (kiemelendő) kifejezéseket pontos színkódokkal:
       - '#F97316' (narancs): munkamemóriát terhelő nehéz kifejezések.
       - '#EF4444' (piros): összetett mondatszerkezet / kognitív elakadási pontok.
    3. Számítsd ki az agyterületek terhelési pontszámait 0.0 és 1.0 között:
       - prefrontal_cortex (munkamemória / logika)
       - wernicke_area (szókincs / szemantika)
       - broca_area (nyelvtan / szintaxis)
       - visual_cortex (képzelet / belső képek)
    4. Határozd meg az aktív szinaptikus útvonalakat (synapse_routes) a 3D-s agymodellhez az alábbi területek között:
       'visual_cortex', 'wernicke_area', 'broca_area', 'prefrontal_cortex'.

    Elemzendő szöveg:
    "{text}"
    """

    try:
        response = client.chat.completions.create(
            model=OLLAMA_MODEL,
            response_model=CognitiveModeling,
            messages=[
                {
                    "role": "system",
                    "content": f"Válaszolj szigorúan strukturált JSON formátumban az alábbi nyelven: {target_lang}."
                },
                {"role": "user", "content": prompt},
            ],
        )
        return response
    except Exception as e:
        print(f"Helyi Ollama nem elérhető ({e}), heurisztikus kognitív elemzés aktiválva.")
        words = text.split()
        avg_len = sum(len(w) for w in words) / max(1, len(words))
        is_hard = avg_len > 7.5 or len(words) > 35

        return CognitiveModeling(
            semantic_complexity_score=8 if is_hard else 4,
            working_memory_load="Magas terhelés (Rekurzív hurok)" if is_hard else "Alacsony terhelés (Folyékony olvasás)",
            cognitive_friction_points=["Összetett mondatstruktúra"] if is_hard else [],
            key_takeaways=["A szöveg kognitív feldolgozása sikeresen lezajlott."],
            highlights=[],
            synapse_routes=[
                {"from_area": "visual_cortex", "to_area": "wernicke_area", "signal_intensity": 0.9},
                {"from_area": "wernicke_area", "to_area": "broca_area", "signal_intensity": 0.85},
                {"from_area": "broca_area", "to_area": "prefrontal_cortex", "signal_intensity": 0.95},
                {"from_area": "prefrontal_cortex", "to_area": "wernicke_area", "signal_intensity": 0.8}
            ] if is_hard else [
                {"from_area": "visual_cortex", "to_area": "wernicke_area", "signal_intensity": 0.8},
                {"from_area": "wernicke_area", "to_area": "prefrontal_cortex", "signal_intensity": 0.6}
            ]
        )

# Simplification function
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

    try:
        response = client.chat.completions.create(
            model=OLLAMA_MODEL,
            response_model=SimplifiedText,
            messages=[
                {
                    "role": "system",
                    "content": f"Egy kognitív szövegegyszerűsítő asszisztens vagy. KIZÁRÓLAG {target_lang} nyelven válaszolhatsz, angol használata SZIGORÚAN TILOS!"
                },
                {"role": "user", "content": prompt},
            ],
        )
        return response
    except Exception as e:
        print(f"Helyi Ollama egyszerűsítés nem elérhető ({e}): {e}")
        return SimplifiedText(
            original_text=text,
            simplified_version=text,
            key_takeaways=[]
        )