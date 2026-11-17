from typing import List, Optional, Literal, Dict
from uuid import UUID
from pydantic import BaseModel

BrainArea = Literal[
    "visual_cortex", "wernicke_area", "broca_area", "prefrontal_cortex"
]

class Highlight(BaseModel):
    text: str
    color_code: str = "#fde047"
    reason: str = ""
    highlight_type: str = ""

class SynapseRoute(BaseModel):
    from_area: BrainArea
    to_area: BrainArea
    signal_intensity: float = 1.0

class CognitiveModel(BaseModel):
    semantic_complexity_score: int = 5
    working_memory_load: str = "Normál terhelés"
    highlights: List[Highlight] = []
    synapse_routes: List[SynapseRoute] = []
    brain_activation: Optional[Dict[str, float]] = None

class SimplifiedText(BaseModel):
    simplified_version: str
    key_takeaways: List[str] = []

class DocumentResponse(BaseModel):
    id: UUID
    name: str
    size: str
    type: str
    uploadedAt: str
    content: str
    cognitive_model: CognitiveModel = CognitiveModel()
    simplified_text: Optional[SimplifiedText] = None
