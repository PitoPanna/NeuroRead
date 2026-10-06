import os
import shutil
from pathlib import Path
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from src.backend.database.connection import get_db
from src.backend.database.models.document import Document
from src.backend.database.models.user import User
from src.backend.routers.auth import get_current_user

router = APIRouter(prefix="/documents", tags=["Documents"])

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    allowed_extensions = {".pdf", ".txt", ".epub"}
    file_ext = Path(file.filename).suffix.lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Nem támogatott fájlformátum. Megengedett: {', '.join(allowed_extensions)}"
        )

    safe_filename = f"{current_user.id}_{file.filename}"
    file_path = UPLOAD_DIR / safe_filename

    # Fájl lemezre mentése és méretének kiszámítása
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        file_size = os.path.getsize(file_path)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail=f"Hiba a fájl mentése során: {str(e)}"
        )

    # Mentés a DB-be a te Document modelled mezőivel
    db_document = Document(
        filename=file.filename,
        file_type=file_ext.replace(".", ""),
        file_size=file_size,
        storage_path=str(file_path),
        user_id=current_user.id
    )
    
    db.add(db_document)
    db.commit()
    db.refresh(db_document)

    return {
        "message": "A dokumentum sikeresen feltöltve!",
        "id": db_document.id,
        "filename": db_document.filename,
        "status": db_document.status
    }