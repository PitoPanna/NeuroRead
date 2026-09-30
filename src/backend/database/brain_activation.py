from typing import TYPE_CHECKING
import uuid
from sqlalchemy import Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from src.backend.database.connection import Base

if TYPE_CHECKING:
    from src.backend.database.text_segment import TextSegment

class BrainActivation(Base):
    __tablename__ = "brain_activations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    segment_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("text_segments.id", ondelete="CASCADE"), nullable=False, unique=True)
    prefrontal_cortex: Mapped[float] = mapped_column(Float, nullable=False)
    wernicke_area: Mapped[float] = mapped_column(Float, nullable=False)
    broca_area: Mapped[float] = mapped_column(Float, nullable=False)
    visual_cortex: Mapped[float] = mapped_column(Float, nullable=False)

    segment: Mapped["TextSegment"] = relationship("TextSegment", back_populates="brain_activation")
