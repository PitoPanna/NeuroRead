from datetime import datetime
from typing import Dict, Any, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from src.backend.routers import auth, documents
from src.backend.parsers.txt_parser import TXTParser
from src.backend.parsers.docx_parser import DOCXParser
from src.backend.parsers.pdf_parser import PDFParser

app = FastAPI(title="NeuroRead API")

app.include_router(auth.router)
app.include_router(documents.router)

# CORS Beállítások
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://localhost:80",
        "http://localhost",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Parser példányok
txt_parser = TXTParser()
docx_parser = DOCXParser()
pdf_parser = PDFParser()

class RawSimplifyRequest(BaseModel):
    text: str
    language: Optional[str] = "hu"

@app.get("/")
def read_root():
    return {"message": "NeuroRead API fut!"}

@app.post("/api/documents/upload")
async def upload_document(file: UploadFile = File(...)) -> Dict[str, Any]:
    try:
        file_bytes = await file.read()
        filename = file.filename.lower()

        if filename.endswith(".txt"):
            parsed_data = txt_parser.parse(file_bytes)
        elif filename.endswith(".docx"):
            parsed_data = docx_parser.parse(file_bytes)
        elif filename.endswith(".pdf"):
            parsed_data = pdf_parser.parse(file_bytes)
        else:
            raise HTTPException(
                status_code=400, 
                detail="Nem támogatott fájlformátum. Csak .txt, .docx és .pdf fogadható el."
            )

        extracted_text = parsed_data.get("text", "")
        metadata = parsed_data.get("metadata", {})

        # Aktuális időpontok generálása
        now = datetime.now()
        formatted_time = now.strftime("%H:%M")
        formatted_datetime = now.strftime("%Y-%m-%d %H:%M")
        iso_time = now.isoformat()

        from src.backend.routers.documents import _build_cognitive_model
        cog_model = _build_cognitive_model(extracted_text)

        # Egyszerűsített szöveg előkészítése
        simplified_dict = None
        if extracted_text:
            try:
                from src.ai_engine.main_engine import request_simplification
                sim = request_simplification(extracted_text, language="hu")
                simplified_dict = {
                    "simplified_version": sim.simplified_version,
                    "key_takeaways": getattr(sim, "key_takeaways", [])
                }
            except Exception:
                from src.ai_engine.llm_analyzer import heuristic_simplify
                sim = heuristic_simplify(extracted_text, language="hu")
                simplified_dict = {
                    "simplified_version": sim.simplified_version,
                    "key_takeaways": getattr(sim, "key_takeaways", [])
                }

        return {
            "status": "success",
            "filename": file.filename,
            "name": file.filename,
            "text": extracted_text,
            "content": extracted_text,
            "size": len(file_bytes),
            "type": metadata.get("file_type", filename.split(".")[-1]),
            
            # Időbélyegek minden lehetséges mezőnévvel
            "uploaded_at": formatted_time,
            "upload_time": formatted_datetime,
            "created_at": iso_time,
            "timestamp": iso_time,
            
            "data": parsed_data,
            "metadata": metadata,
            "cognitive_model": cog_model.model_dump(),
            "simplified_text": simplified_dict
        }

    except Exception as e:
        print(f"Hiba a fájl feldolgozása során: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Fájlfeldolgozási hiba: {str(e)}")

@app.post("/api/documents/simplify")
async def api_simplify_direct(payload: RawSimplifyRequest):
    """Közvetlen kognitív egyszerűsítési végpont."""
    text = payload.text
    if not text:
        raise HTTPException(status_code=400, detail="A szöveg üres.")

    try:
        from src.ai_engine.main_engine import request_simplification
        sim = request_simplification(text, language=payload.language or "hu")
        return {
            "status": "success",
            "simplified_version": sim.simplified_version,
            "key_takeaways": getattr(sim, "key_takeaways", [])
        }
    except Exception as e:
        from src.ai_engine.llm_analyzer import heuristic_simplify
        sim = heuristic_simplify(text, language=payload.language or "hu")
        return {
            "status": "success",
            "simplified_version": sim.simplified_version,
            "key_takeaways": getattr(sim, "key_takeaways", [])
        }
