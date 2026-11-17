import spacy

class TextProcessor:
    def __init__(self):
        self._nlp_hu = None
        self._nlp_ro = None
        self._nlp_en = None

    def _get_nlp(self, lang: str):
        if lang == "ro":
            if self._nlp_ro is None:
                try:
                    self._nlp_ro = spacy.load("ro_core_news_md")
                except Exception:
                    self._nlp_ro = spacy.blank("ro")
            return self._nlp_ro
        elif lang == "en":
            if self._nlp_en is None:
                try:
                    self._nlp_en = spacy.load("en_core_web_sm")
                except Exception:
                    self._nlp_en = spacy.blank("en")
            return self._nlp_en
        else:
            if self._nlp_hu is None:
                try:
                    self._nlp_hu = spacy.load("hu_core_news_lg")
                except Exception:
                    try:
                        self._nlp_hu = spacy.load("hu_core_news_md")
                    except Exception:
                        self._nlp_hu = spacy.blank("hu")
            return self._nlp_hu

    def process_hungarian(self, text: str):
        return self._get_nlp("hu")(text)

    def process_romanian(self, text: str):
        return self._get_nlp("ro")(text)

    def process_english(self, text: str):
        return self._get_nlp("en")(text)

    def analyze_stats(self, text: str, language: str = "hu") -> dict:
        """Kiszámítja a mondatszámot, szószámot, átlagos mondathosszt, és kigyűjti a nehéz szavakat."""
        nlp = self._get_nlp(language)
        doc = nlp(text)

        # mondatok es szavak kinyerese
        sentences = list(doc.sents) if doc.has_annotation("SENT_START") else [doc]
        sentence_count = len(sentences) if len(sentences) > 0 else (1 if len(text.strip()) > 0 else 0)
        
        # szoszam irasjelek segitsegevel darabol
        words = [token for token in doc if not token.is_punct and not token.is_space]
        word_count = len(words)

        # atlagos mondathossz
        avg_sentence_length = round(word_count / sentence_count, 2) if sentence_count > 0 else 0.0

        # nehez szavak (10 karakternel hosszabb, nem kotoszo)
        difficult_words = list(set([
            token.text for token in words 
            if len(token.text) > 10 and not getattr(token, "is_stop", False)
        ]))

        return {
            "language": language,
            "sentence_count": sentence_count,
            "word_count": word_count,
            "avg_sentence_length": avg_sentence_length,
            "difficult_words": difficult_words
        }
