from pydantic import BaseModel
from src.ai_engine.nlp_processor import TextProcessor
from src.ai_engine.llm_analyzer import (
    model_cognitive_process, 
    simplify_text_on_demand, 
    CognitiveModeling, 
    SimplifiedText
)
spacy_processor = TextProcessor()

class FullCognitiveReport(BaseModel):
    language: str
    sentence_count: int
    word_count: int
    avg_sentence_length: float
    spacy_highlights: list[str]
    cognitive_model: CognitiveModeling


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