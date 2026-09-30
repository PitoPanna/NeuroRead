from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from src.ai_engine.schemas import DocumentAnalysisResponse, TextSegmentAnalysis, BrainActivation

#ai motor funkcioi
from src.ai_engine.main_engine import (
    run_full_analysis, 
    request_simplification, 
    FullCognitiveReport, 
    SimplifiedText
)
app = FastAPI(title="NeuroRead API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "NeuroRead Backend API Running"}

# Mock endpoint a frontend független fejlesztéséhez
@app.get("/api/documents/{doc_id}/result", response_model=DocumentAnalysisResponse)
def get_mock_document_analysis(doc_id: str):
    return DocumentAnalysisResponse(
        document_id=doc_id,
        overall_difficulty=6.5,
        total_segments=1,
        segments=[
            TextSegmentAnalysis(
                segment_id=1,
                text="Ez egy teszt bekezdés a kognitív terhelés elemzéséhez.",
                difficulty_score=5.0,
                color_code="#EAB308",
                factors=["moderate_vocabulary"],
                simplification_suggestion="Ez egy egyszerűbb mondat.",
                brain_activation=BrainActivation(
                    prefrontal_cortex=0.4,
                    wernicke_area=0.6,
                    broca_area=0.3,
                    visual_cortex=0.2
                )
            )
        ]
    )

#AI elemzes es egyszerusites 

class AnalysisRequest(BaseModel):
    text: str = Field(..., description="Az elemzendő nyers szöveg")
    language: str = Field(default="hu", description="A nyelv kódja: 'hu', 'ro', vagy 'en'")

#SpaCy elemzes
@app.post("/api/analyze", response_model=FullCognitiveReport)
def analyze_text(request: AnalysisRequest):
    try:
        return run_full_analysis(request.text, request.language)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#egyszerusites gombnyomasra
@app.post("/api/simplify", response_model=SimplifiedText)
def simplify_text(request: AnalysisRequest):
    try:
        return request_simplification(request.text, request.language)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))