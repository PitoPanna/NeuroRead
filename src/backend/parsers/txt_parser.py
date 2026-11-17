from typing import Dict, Any
from src.backend.parsers.base import BaseParser

class TXTParser(BaseParser):
    def parse(self, file_bytes: bytes) -> Dict[str, Any]:
        try:
            text = file_bytes.decode("utf-8")
        except UnicodeDecodeError:
            try:
                text = file_bytes.decode("latin-1")
            except Exception as e:
                raise ValueError(f"Unsupported text encoding: {str(e)}")

        cleaned_text = self.clean_text(text)

        return {
            "text": cleaned_text,
            "metadata": {
                "character_count": len(cleaned_text),
                "file_type": "txt"
            }
        } 