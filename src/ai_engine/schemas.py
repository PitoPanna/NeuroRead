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