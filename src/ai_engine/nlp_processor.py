import spacy

# A szükséges csomagok telepítése a requirements.txt fájl alapján
# pip install -r requirements.txt
class TextProcessor:
    def __init__(self):
        print("Modellek betöltése...")
        # A telepített magyar (lg) és román (sm) nyelvi modellek betöltése
        self.nlp_hu = spacy.load("hu_core_news_lg")
        self.nlp_ro = spacy.load("ro_core_news_md")

    def process_hungarian(self, text: str):
        return self.nlp_hu(text)

    def process_romanian(self, text: str):
        return self.nlp_ro(text)

if __name__ == "__main__":
    processor = TextProcessor()
    
    # Magyar teszt
    doc_hu = processor.process_hungarian("Ez egy teszt mondat a NeuroRead platformhoz.")
    print("\n--- Magyar feldolgozás ---")
    print("Tokenek:", [token.text for token in doc_hu])
    print("Mondatok száma:", len(list(doc_hu.sents)))

    # Román teszt
    doc_ro = processor.process_romanian("Acesta este un text de probă pentru platformă.")
    print("\n--- Román feldolgozás ---")
    print("Tokenek:", [token.text for token in doc_ro])
    print("Mondatok száma:", len(list(doc_ro.sents)))