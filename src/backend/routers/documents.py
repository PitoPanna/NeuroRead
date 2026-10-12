import os
import shutil
from datetime import datetime
from pathlib import Path

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

# Csak azok, amiket a ParserFactory is ismer
ALLOWED_EXTENSIONS = {".pdf", ".txt", ".docx"}


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

    # Szövegkinyerés a ParserFactoryval (még az adatbázis előtt,
    # hogy hiba esetén ne maradjon árva rekord)
    try:
        parser = ParserFactory.get_parser(file.filename)
        result = parser.parse(file_path.read_bytes())
    except ValueError as e:
        file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        file_path.unlink(missing_ok=True)
        raise HTTPException(status_code=422, detail=f"Nem sikerült kinyerni a szöveget: {e}")

    # a parse dict-et ad vissza, nem szöveget
    print("PARSER RESULT KEYS:", result.keys() if isinstance(result, dict) else type(result))
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
        uploadedAt=datetime.now().strftime("%Y-%m-%d %H:%M"),
        content=content or "",
    )
