import io
import docx
from typing import Dict, Any
from src.backend.parsers.base import BaseParser

class DOCXParser(BaseParser):
    def parse(self, file_bytes: bytes) -> Dict[str, Any]:
        extracted_text = []
        try:
            doc = docx.Document(io.BytesIO(file_bytes))
            for paragraph in doc.paragraphs:
                if paragraph.text.strip():
                    extracted_text.append(paragraph.text)
            for table in doc.tables:
                for row in table.rows:
                    row_text = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                    if row_text:
                        extracted_text.append(" | ".join(row_text))
        except Exception as e:
            raise ValueError(f"Corrupted or invalid DOCX file: {str(e)}")
        
        raw_text = "\n".join(extracted_text)
        cleaned_text = self.clean_text(raw_text)

        return {
            "text": cleaned_text,
            "metadata": {
                "paragraph_count": len(extracted_text),
                "file_type": "docx"
            }
        }