import uuid
from datetime import date, datetime, timezone
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import String, Float, Integer, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.backend.database.connection import Base

if TYPE_CHECKING:
    from src.backend.database.models.document import Document
    from src.backend.database.models.text_segment import TextSegment

class AnalysisSession(Base):
    __tablename__ = "analysis_session"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    started_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))
    finished_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    overall_difficulty: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    total_segments: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(String, default="pending")
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    document: Mapped["Document"] = relationship("Document", back_populates="analysis_sessions")
    segments: Mapped[List["TextSegment"]] = relationship("TextSegment", back_populates="session", cascade="all, delete-orphan")