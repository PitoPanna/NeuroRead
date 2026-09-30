import spacy

# A szükséges csomagok telepítése a requirements.txt fájl alapján
# pip install -r requirements.txt
class TextProcessor:
    def __init__(self):
        print("Modellek betöltése...")
       
        self.nlp_hu = spacy.load("hu_core_news_lg")
        self.nlp_ro = spacy.load("ro_core_news_md")
        self.nlp_en = spacy.load("en_core_web_sm")

    def process_hungarian(self, text: str):
        return self.nlp_hu(text)

    def process_romanian(self, text: str):
        return self.nlp_ro(text)

    def process_english(self, text: str):
        return self.nlp_en(text)

#kiszmaitja a mondatszam,szoszam, atlagos mondathossz, es kigyujti a nehez szavakat
def analyze_stats(self, text: str, language: str = "hu") -> dict:
        # nyelv valasztas
        if language == "ro":
            doc = self.nlp_ro(text)
        elif language == "en":
            doc = self.nlp_en(text)
        else:
            doc = self.nlp_hu(text)

        # mondatok es szavak kinyerese
        sentences = list(doc.sents)
        sentence_count = len(sentences)
        
        # szoszam irasjelek segitsegevel darabol
        words = [token for token in doc if not token.is_punct and not token.is_space]
        word_count = len(words)

        # atlagos mondathossz
        avg_sentence_length = round(word_count / sentence_count, 2) if sentence_count > 0 else 0.0

        # nehez szavak (10 karakternel hosszabb, nem kotoszo)
        difficult_words = list(set([
            token.text for token in words 
            if len(token.text) > 10 and not token.is_stop
        ]))

        return {
            "language": language,
            "sentence_count": sentence_count,
            "word_count": word_count,
            "avg_sentence_length": avg_sentence_length,
            "difficult_words": difficult_words
        }
