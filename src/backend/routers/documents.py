import os
import shutil
from datetime import datetime
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from src.backend.database.connection import get_db
from src.backend.database.models.document import Document
from src.backend.database.models.user import User
from src.backend.parsers.factory import ParserFactory
from src.backend.routers.auth import get_current_user
from src.backend.schemas.document import DocumentResponse

router = APIRouter(prefix="/documents", tags=["Documents"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Támogatott kiterjesztések (.epub is hozzáadható, ha a ParserFactory támogatja)
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
        # Ha a parser elhasalna olvasáskor, fallback szöveges beolvasás txt/md esetén
        try:
            return file_path.read_text(encoding="utf-8")
        except Exception:
            return ""

@router.post(
    "/upload",
    status_code=status.HTTP_201_CREATED,
    response_model=DocumentResponse,
)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
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

    # Fájlnév tisztítása
    clean_filename = Path(file.filename).name.replace(" ", "_")
    safe_filename = f"{current_user.id}_{clean_filename}"
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

    # Adatbázisba mentés
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

    return DocumentResponse(
        id=db_document.id,
        name=db_document.filename,
        size=f"{file_size / 1024:.1f} KB",
        type=file_ext.replace(".", ""),
        uploadedAt=db_document.created_at.strftime("%Y-%m-%d %H:%M") if hasattr(db_document, 'created_at') and db_document.created_at else datetime.now().strftime("%Y-%m-%d %H:%M"),
        content=content or "",
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
        created_date = doc.created_at.strftime("%Y-%m-%d %H:%M") if hasattr(doc, 'created_at') and doc.created_at else datetime.now().strftime("%Y-%m-%d %H:%M")
        
        response_list.append(
            DocumentResponse(
                id=doc.id,
                name=doc.filename,
                size=f"{doc.file_size / 1024:.1f} KB" if doc.file_size else "0 KB",
                type=doc.file_type,
                uploadedAt=created_date,
                content=content,
            )
        )
    
    return response_list

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document_by_id(
    document_id: int,
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
    created_date = doc.created_at.strftime("%Y-%m-%d %H:%M") if hasattr(doc, 'created_at') and doc.created_at else datetime.now().strftime("%Y-%m-%d %H:%M")

    return DocumentResponse(
        id=doc.id,
        name=doc.filename,
        size=f"{doc.file_size / 1024:.1f} KB" if doc.file_size else "0 KB",
        type=doc.file_type,
        uploadedAt=created_date,
        content=content,
    )

@router.post("/{document_id}/analyze")
async def analyze_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="A dokumentum nem található.",
        )

    content = _read_document_content(doc.storage_path, doc.filename)

    # Mock / Dinamikus kognitív elemzés válasz a frontend 3D Viewer és TextHighlighter számára
    analysis_payload = {
        "document_id": doc.id,
        "cognitive_model": {
            "highlights": [
                {"text": content[:50] if content else "Kiemelt részlet", "category": "primary_concept", "color": "#38bdf8"}
            ]
        },
        "synapses": [
            {"from_area": "visual_cortex", "to_area": "wernicke_area"},
            {"from_area": "wernicke_area", "to_area": "broca_area"},
            {"from_area": "broca_area", "to_area": "prefrontal_cortex"}
        ],
        "simplified_text": {
            "simplified_version": content if content else "Nincs megjeleníthető szöveg."
        }
    }

    return analysis_payload

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    doc = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user.id).first()
    
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="A törlendő dokumentum nem található.",
        )

    # Fizikai fájl eltávolítása a meghajtóról
    file_path = Path(doc.storage_path)
    file_path.unlink(missing_ok=True)

    # Adatbázis rekord törlése
    db.delete(doc)
    db.commit()

    return None