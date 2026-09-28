import io
import pdfplumber
from python_multipart import BaseParser
from typing import Dict, Any

class PDFParser(BaseParser):
    def parse(self, file_bytes: bytes) -> Dict[str, Any]:
        extracted_text = []
        page_count = 0
        try:
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                page_count = len(pdf.pages)
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        extracted_text.append(page_text)
        except Exception as e:
            raise ValueError(f"Corrupted or password-protected PDF file: {str(e)}")

        raw_text = "\n\n".join(extracted_text)
        cleaned_text = self.clean_text(raw_text)

        return {
            "text": cleaned_text,
            "metadata": {
                "page_count": page_count,
                "file_type": "pdf"
            }
        }