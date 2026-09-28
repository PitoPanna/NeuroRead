from python_multipart import BaseParser

from backend.parsers.docx_parser import DOCXParser
from backend.parsers.pdf_parser import PDFParser
from backend.parsers.txt_parser import TXTParser


class ParserFactory:
    @staticmethod
    def get_parser(filename: str) -> BaseParser:
        ext = filename.lower().split('.')[-1]

        if ext == 'pdf':
            return PDFParser()
        elif ext in ['docx', 'doc']:
            return DOCXParser()
        elif ext == 'txt':
            return TXTParser()
        else:
            raise ValueError(f"Unsupported file extension: .{ext}")