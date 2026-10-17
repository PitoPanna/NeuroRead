import os
import shutil
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from src.backend.database.connection import get_db
from src.backend.database.models.document import Document
from src.backend.database.models.user import User
from src.backend.parsers.factory import ParserFactory
from src.backend.routers.auth import get_current_user, get_optional_current_user
from src.backend.schemas.document import (
    DocumentResponse,
    CognitiveModel,
    Highlight,
    SynapseRoute,
    SimplifiedText
)

router = APIRouter(prefix="/documents", tags=["Documents"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Támogatott kiterjesztések
ALLOWED_EXTENSIONS = {".pdf", ".txt", ".docx", ".epub"}

def _read_document_content(file_path_str: str, filename: str) -> str:
    """Segédfüggvény a fájl tartalmának biztonságos beolvasásához a lemezről."""
    file_path = Path(file_path_str)
    if not file_path.exists():
        return ""
    try:
        parser = ParserFactory.get_parser(filename)
        result = parser.parse(file_path.read_bytes())
        return result.get("text", "") if isinstance(result, dict) else str(result)
    except Exception:
        try:
            return file_path.read_text(encoding="utf-8")
        except Exception:
            return ""

def _build_cognitive_model(content: str) -> CognitiveModel:
    """Kognitív modell heurisztikus előállítása a szöveg komplexitása alapján."""
    if not content:
        return CognitiveModel()

    words = content.split()
    avg_len = sum(len(w) for w in words) / max(1, len(words))
    is_hard = avg_len > 7.5 or len(words) > 40

    highlights = []
    seen = set()

    for w in words:
        clean = w.strip('.,/#!$%^&*;:{}=\\-_`~()?"\'')
        if len(clean) >= 11 and clean.lower() not in seen:
            seen.add(clean.lower())
            highlights.append(
                Highlight(
                    text=clean,
                    color_code="#EF4444" if len(clean) >= 14 else "#F97316",
                    highlight_type="llm_cognitive" if len(clean) >= 14 else "spacy_difficult",
                    reason="Összetett kognitív elakadás" if len(clean) >= 14 else "Munkamemória terhelés"
                )
            )
            if len(highlights) >= 15:
                break

    synapse_routes = [
        SynapseRoute(from_area="visual_cortex", to_area="wernicke_area", signal_intensity=0.9),
        SynapseRoute(from_area="wernicke_area", to_area="broca_area", signal_intensity=0.85),
        SynapseRoute(from_area="broca_area", to_area="prefrontal_cortex", signal_intensity=0.95),
        SynapseRoute(from_area="prefrontal_cortex", to_area="wernicke_area", signal_intensity=0.8),
    ] if is_hard else [
        SynapseRoute(from_area="visual_cortex", to_area="wernicke_area", signal_intensity=0.8),
        SynapseRoute(from_area="wernicke_area", to_area="prefrontal_cortex", signal_intensity=0.6),
    ]

    return CognitiveModel(
        semantic_complexity_score=8 if is_hard else 4,
        working_memory_load="Magas terhelés (Rekurzív hurok)" if is_hard else "Alacsony terhelés (Folyékony olvasás)",
        highlights=highlights,
        synapse_routes=synapse_routes
    )

@router.post(
    "/upload",
    status_code=status.HTTP_201_CREATED,
    response_model=DocumentResponse,
)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nincs kiválasztva fájl.",
        )

    file_ext = Path(file.filename).suffix.lower()

    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Nem támogatott fájlformátum: '{file_ext}'. "
            f"Megengedett: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    clean_filename = Path(file.filename).name.replace(" ", "_")
    user_prefix = str(current_user.id) if current_user else f"guest_{uuid.uuid4().hex[:8]}"
    safe_filename = f"{user_prefix}_{clean_filename}"
    file_path = UPLOAD_DIR / safe_filename

    # Fájl lemezre mentése
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        file_size = os.path.getsize(file_path)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Hiba a fájl mentése során: {e}",
        )

    # Szövegkinyerés a ParserFactoryval
    try:
        parser = ParserFactory.get_parser(file.filename)
        result = parser.parse(file_path.read_bytes())
    except ValueError as e:
        file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=422, detail=f"Nem sikerült kinyerni a szöveget: {e}")

    content = result.get("text", "") if isinstance(result, dict) else str(result)
    cognitive_data = _build_cognitive_model(content)

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")

    # Ha be van jelentkezve a felhasználó, mentjük az adatbázisba
    if current_user:
        db_document = Document(
            filename=file.filename,
            file_type=file_ext.replace(".", ""),
            file_size=file_size,
            storage_path=str(file_path),
            user_id=current_user.id,
        )
        db.add(db_document)
        db.commit()
        db.refresh(db_document)
        doc_id = db_document.id
    else:
        doc_id = uuid.uuid4()

    return DocumentResponse(
        id=doc_id,
        name=file.filename,
        size=f"{file_size / 1024:.1f} KB",
        type=file_ext.replace(".", ""),
        uploadedAt=now_str,
        content=content or "",
        cognitive_model=cognitive_data
    )

@router.get("", response_model=List[DocumentResponse])
async def get_user_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    documents = db.query(Document).filter(Document.user_id == current_user.id).all()
    
    response_list = []
    for doc in documents:
        content = _read_document_content(doc.storage_path, doc.filename)
        created_date = doc.upload_date.strftime("%Y-%m-%d %H:%M") if hasattr(doc, 'upload_date') and doc.upload_date else datetime.now().strftime("%Y-%m-%d %H:%M")
        
        response_list.append(
            DocumentResponse(
                id=doc.id,
                name=doc.filename,
                size=f"{doc.file_size / 1024:.1f} KB" if doc.file_size else "0 KB",
                type=doc.file_type,
                uploadedAt=created_date,
                content=content,
                cognitive_model=_build_cognitive_model(content)
            )
        )
    
    return response_list

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document_by_id(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="A dokumentum nem található, vagy nincs hozzá jogosultságod.",
        )

    content = _read_document_content(doc.storage_path, doc.filename)
    created_date = doc.upload_date.strftime("%Y-%m-%d %H:%M") if hasattr(doc, 'upload_date') and doc.upload_date else datetime.now().strftime("%Y-%m-%d %H:%M")

    return DocumentResponse(
        id=doc.id,
        name=doc.filename,
        size=f"{doc.file_size / 1024:.1f} KB" if doc.file_size else "0 KB",
        type=doc.file_type,
        uploadedAt=created_date,
        content=content,
        cognitive_model=_build_cognitive_model(content)
    )

@router.post("/{document_id}/analyze")
async def analyze_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    content = ""
    filename = "document.txt"

    if current_user:
        doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
        if doc:
            content = _read_document_content(doc.storage_path, doc.filename)
            filename = doc.filename

    # Kognitív elemzés futtatása
    try:
        from src.ai_engine.main_engine import run_full_analysis
        report = run_full_analysis(content, language="hu")
        cognitive_model = report.cognitive_model
    except Exception as e:
        print(f"AI elemzés nem futtatható ({e}), automatikus kognitív modell aktiválva.")
        cognitive_model = _build_cognitive_model(content)

    return {
        "document_id": document_id,
        "cognitive_model": cognitive_model,
        "simplified_text": {
            "simplified_version": content if content else "Nincs megjeleníthető szöveg."
        }
    }

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: str,  
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = db.query(Document).filter(
        Document.id == document_id, 
        Document.user_id == current_user.id
    ).first()
    
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="A törlendő dokumentum nem található.",
        )

    file_path = Path(doc.storage_path)
    file_path.unlink(missing_ok=True)

    db.delete(doc)
    db.commit()

    return None