from pydantic import BaseModel, Field
from typing import List, Dict

class BrainActivation(BaseModel):
    prefrontal_cortex: float = Field(..., description="Load score 0.0 - 1.0 (Working Memory/Logic)")
    wernicke_area: float = Field(..., description="Load score 0.0 - 1.0 (Lexical/Semantics)")
    broca_area: float = Field(..., description="Load score 0.0 - 1.0 (Syntax/Grammar)")
    visual_cortex: float = Field(..., description="Load score 0.0 - 1.0 (Visualizing imagery)")

class TextSegmentAnalysis(BaseModel):
    segment_id: int
    text: str
    difficulty_score: float = Field(..., description="Score 1.0 - 10.0")
    color_code: str = Field(..., description="HEX or classification: easy | moderate | hard")
    factors: List[str] = Field(..., description="e.g., ['deep_syntax', 'rare_vocabulary']")
    simplification_suggestion: str
    brain_activation: BrainActivation

class DocumentAnalysisResponse(BaseModel):
    document_id: str
    overall_difficulty: float
    total_segments: int
    segments: List[TextSegmentAnalysis]

#highlighting
class HighlightedSegment(BaseModel):
    text: str = Field(..., description="A kiemelendő szó vagy kifejezés pontos szövege")
    color_code: str = Field(..., description="HEX színkód: #EAB308 (sárga: nehéz szó), #F97316 (narancs: kognitív terhelés), #EF4444 (piros: összetett mondat)")
    highlight_type: str = Field(..., description="A kiemelés típusa: 'spacy_difficult' vagy 'llm_cognitive'")
    reason: str = Field(..., description="A kiemelés rövid indoklása")

class CognitiveModeling(BaseModel):
    working_memory_load: str = Field(..., description="Munkamemória terhelésének szintje")
    key_takeaways: List[str] = Field(default=[], description="A szöveg fő gondolatai")
    highlights: List[HighlightedSegment] = Field(default=[], description="A színesen kiemelendő elemek listája")

class SimplifiedText(BaseModel):
    original_text: str
    simplified_version: str
    key_takeaways: List[str]