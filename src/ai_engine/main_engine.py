from pydantic import BaseModel
from src.ai_engine.nlp_processor import TextProcessor
from src.ai_engine.llm_analyzer import (
    model_cognitive_process, 
    simplify_text_on_demand, 
    CognitiveModeling, 
    SimplifiedText,
    HighlightedSegment
)
spacy_processor = TextProcessor()

class FullCognitiveReport(BaseModel):
    language: str
    sentence_count: int
    word_count: int
    avg_sentence_length: float
    spacy_highlights: list[str]
    cognitive_model: CognitiveModeling

def combine_all_highlights(spacy_words: list[str], llm_highlights: list[HighlightedSegment]) -> list[HighlightedSegment]:
    """
    Egyesíti a SpaCy által megjelölt nehéz szavakat (sárga) 
    és az LLM által azonosított kognitív elemeket (narancs/piros).
    """
    final_highlights: list[HighlightedSegment] = []
    seen_texts = set()

    # LLM - kognitiv nehezseg  (Narancs / Piros)
    for segment in llm_highlights:
        if segment.text and segment.text not in seen_texts:
            final_highlights.append(segment)
            seen_texts.add(segment.text)

    # SpaCy - nehez szavak (SÁRGA - #EAB308)
    for word in spacy_words:
        if word not in seen_texts:
            final_highlights.append(
                HighlightedSegment(
                    text=word,
                    color_code="#EAB308",
                    highlight_type="spacy_difficult",
                    reason="Hosszú vagy összetett szakszó"
                )
            )
            seen_texts.add(word)

    return final_highlights

def run_full_analysis(text: str, language: str = "hu") -> FullCognitiveReport:

    # 1. SpaCy elemzes
    spacy_stats = spacy_processor.analyze_stats(text, language)
    
    # 2. LLM kognitiv feldolgozas
    llm_data = model_cognitive_process(text, language)

    return FullCognitiveReport(
        language=language,
        sentence_count=spacy_stats["sentence_count"],
        word_count=spacy_stats["word_count"],
        avg_sentence_length=spacy_stats["avg_sentence_length"],
        spacy_highlights=spacy_stats["difficult_words"],
        cognitive_model=llm_data
    )

#gombnyomasos egyszerusites 
def request_simplification(text: str, language: str = "hu") -> SimplifiedText:
    return simplify_text_on_demand(text, language)