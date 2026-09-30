from token import OP
import uuid
from typing import TYPE_CHECKING, Optional, Any, Dict, List
from pydantic import Json
from sqlalchemy import String, Float, Integer, ForeignKey, Text, JSON, CheckConstraint, null
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.backend.database.connection import Base

if TYPE_CHECKING:
    from src.backend.database.analysis_session import AnalysisSession
    from src.backend.database.brain_activation import BrainActivation

class TextSegment(Base):
    __tablename__ = "text_segments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("analysis_session.id", ondelete="CASCADE"), nullable=False, index=True)
    segment_id: Mapped[int] = mapped_column(Integer, nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    difficulty_score: Mapped[float] = mapped_column(Float, nullable=False)
    color_code: Mapped[str] = mapped_column(String, nullable=False)
    factors: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, nullable=False, default=list)
    simplification_suggestion: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    __table_args__ = (CheckConstraint('difficulty_score >= 0.0 AND difficulty_score <= 10.0', name='check_difficulty_range'))

    session: Mapped["AnalysisSession"] = relationship("AnalysesSession", back_populates="segments")
    brain_activation: Mapped[Optional["BrainActivation"]] = relationship("BrainActivation", back_populates="segment", cascade="all, delete-orphan")