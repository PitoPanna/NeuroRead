from pydantic import BaseModel, Field
from typing import List, Dict

#cognitive modeling and brain activation schema
class BrainActivation(BaseModel):
    prefrontal_cortex: float = Field(..., description="Load score 0.0 - 1.0 (Working Memory/Logic)")
    wernicke_area: float = Field(..., description="Load score 0.0 - 1.0 (Lexical/Semantics)")
    broca_area: float = Field(..., description="Load score 0.0 - 1.0 (Syntax/Grammar)")
    visual_cortex: float = Field(..., description="Load score 0.0 - 1.0 (Visualizing imagery)")

class SynapseRoute(BaseModel):
    from_area: str = Field(
        ..., 
        description="Kiinduló agyterület: 'visual_cortex' | 'wernicke_area' | 'broca_area' | 'prefrontal_cortex'"
    )
    to_area: str = Field(
        ..., 
        description="Cél agyterület: 'visual_cortex' | 'wernicke_area' | 'broca_area' | 'prefrontal_cortex'"
    )
    signal_intensity: float = Field(
        ..., 
        description="A szinaptikus jel intenzitása és sebessége 0.0 és 1.0 között"
    )

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

#highlighting and cognitive modeling
class HighlightedSegment(BaseModel):
    text: str = Field(..., description="A kiemelendő szó vagy kifejezés pontos szövege")
    color_code: str = Field(..., description="HEX színkód: #EAB308 (sárga: nehéz szó), #F97316 (narancs: kognitív terhelés), #EF4444 (piros: összetett mondat)")
    highlight_type: str = Field(..., description="A kiemelés típusa: 'spacy_difficult' vagy 'llm_cognitive'")
    reason: str = Field(..., description="A kiemelés rövid indoklása")

class CognitiveModeling(BaseModel):
    semantic_complexity_score: int = Field(default=5, description="A szöveg fogalmi nehézsége 1-től 10-ig.")
    working_memory_load: str = Field(..., description="Munkamemória terhelésének szintje")
    cognitive_friction_points: List[str] = Field(default=[], description="Elakadási pontok listája")
    key_takeaways: List[str] = Field(default=[], description="A szöveg fő gondolatai")
    brain_activation: BrainActivation = Field(
        default_factory=lambda: BrainActivation(
            prefrontal_cortex=0.5,
            wernicke_area=0.5,
            broca_area=0.5,
            visual_cortex=0.5
        ),
        description="Agyterületi terhelési értékek a 3D modellhez"
    )
    synapse_routes: List[SynapseRoute] = Field(
        default=[], 
        description="Aktív szinaptikus kapcsolódási útvonalak a 3D-s agymodellhez"
    )
    highlights: List[HighlightedSegment] = Field(default=[], description="A színesen kiemelendő elemek listája")

class SimplifiedText(BaseModel):
    original_text: str
    simplified_version: str
    key_takeaways: List[str]