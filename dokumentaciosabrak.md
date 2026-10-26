# 📐 NeuroRead – Rendszertervezési és Dokumentációs Ábrák

> **Architekturális diagramgyűjtemény a NeuroRead kognitív szövegelemző és 3D agy-vizualizációs platformhoz.**  
> Ez a dokumentum tartalmazza a szoftverrendszer formális UML és Mermaid diagramjait: **Komponens Diagram**, **Állapotdiagram**, **Szekvenciadiagram**, valamint **Adatmodell és Osztálystruktúra**.

---

## 📑 Tartalomjegyzék
1. [Komponens Diagram (Component Diagram)](#1-komponens-diagram-component-diagram)
2. [Állapotdiagram (State Diagram)](#2-állapotdiagram-state-diagram)
3. [Szekvenciadiagram (Sequence Diagram)](#3-szekvenciadiagram-sequence-diagram)
4. [Adatmodell és Entitás-Kapcsolat Diagram (ER Diagram)](#4-adatmodell-és-entitás-kapcsolat-diagram-er-diagram)
5. [Osztálystruktúra és Tervezési Minták (Class Diagram)](#5-osztálystruktúra-és-tervezési-minták-class-diagram)

---

## 1. Komponens Diagram (Component Diagram)

A NeuroRead három fő rétegre tagolódik: a **React + Three.js Frontend**, a **FastAPI REST Backend**, valamint a **Kognitív AI Motor**. Ezek konténerizált környezetben vagy helyi fejlesztői környezetben működnek együtt.

```mermaid
flowchart TB
    subgraph FrontendApp["Frontend Réteg (React 19 + Three.js / R3F + Vite)"]
        UI_Shell["App.jsx (Alkalmazás héj & Navigáció)"]
        Auth_Comp["AuthModal & AuthContext (JWT kezelés)"]
        Doc_Side["DocumentSidebar.jsx (Dokumentumtár)"]
        Upload_Comp["FileUpload.jsx (Dropzone & Demó Betöltő)"]
        Doc_View["DocumentViewer.jsx (Olvasó Stúdió & Metrikák)"]
        Highlighter["TextHighlighter.jsx (Kognitív Kapszulák)"]
        
        subgraph Brain3D["Brain3DViewer Modul"]
            Canvas3D["Three.js R3F Canvas"]
            CortexMesh["Procedurális Agykéreg (Gyri & Sulci)"]
            SynapseCloud["900 Pontos Neurális Felhő"]
            CognitiveHubs["4 Kognitív Hub (Visual, Wernicke, Broca, PFC)"]
            FlowParticles["Bézier Információáramlás Részecskék"]
            HUD_Overlay["Telemetria HUD Overlay"]
        end
        
        UI_Shell --> Auth_Comp
        UI_Shell --> Doc_Side
        UI_Shell --> Upload_Comp
        UI_Shell --> Doc_View
        Doc_View --> Highlighter
        Doc_View --> Brain3D
        Canvas3D --> CortexMesh
        Canvas3D --> SynapseCloud
        Canvas3D --> CognitiveHubs
        Canvas3D --> FlowParticles
        Canvas3D --> HUD_Overlay
    end

    subgraph BackendAPI["Backend Szolgáltatás (FastAPI REST API)"]
        MainApp["main.py (FastAPI App & CORS)"]
        SecurityMod["core/security.py (JWT, Bcrypt)"]
        AuthRouter["routers/auth.py (Login, Register, Me)"]
        DocRouter["routers/documents.py (CRUD & Upload)"]
        
        subgraph ParserStrategy["Dokumentum-elemző Stratégiák (Strategy Pattern)"]
            Factory["parsers/factory.py (ParserFactory)"]
            PDFP["parsers/pdf_parser.py (PDFParser)"]
            DocxP["parsers/docx_parser.py (DocxParser)"]
            TxtP["parsers/txt_parser.py (TxtParser)"]
        end
        
        DBConn["database/connection.py (Engine & Session)"]
        
        MainApp --> AuthRouter
        MainApp --> DocRouter
        AuthRouter --> SecurityMod
        DocRouter --> Factory
        Factory --> PDFP
        Factory --> DocxP
        Factory --> TxtP
        AuthRouter --> DBConn
        DocRouter --> DBConn
    end

    subgraph AIEngine["Kognitív Elemző Motor (src/ai_engine)"]
        Orchestrator["main_engine.py (MainEngine Koordinátor)"]
        
        subgraph NLP_Pipeline["SpaCy Többnyelvű NLP"]
            NLP_Proc["nlp_processor.py (TextProcessor)"]
            HuModel["hu_core_news_lg (Magyar)"]
            EnModel["en_core_web_sm (Angol)"]
            RoModel["ro_core_news_lg (Román)"]
            SyntaxTree["Szintaktikai Fa Mélység & TTR"]
        end
        
        subgraph LLM_Analysis["Szemantikai Elemzés"]
            LLM_Proc["llm_analyzer.py (LLMAnalyzer)"]
            OllamaClient["Ollama / Llama3 (Instructor)"]
            HeuristicFallback["Heurisztikus Offline Fallback"]
        end
        
        CognitiveSchemas["schemas.py (Pydantic Adatmodellek)"]
        
        Orchestrator --> NLP_Proc
        Orchestrator --> LLM_Proc
        NLP_Proc --> HuModel
        NLP_Proc --> EnModel
        NLP_Proc --> RoModel
        NLP_Proc --> SyntaxTree
        LLM_Proc --> OllamaClient
        LLM_Proc -.->|Kapcsolati Hiba / Időtúllépés| HeuristicFallback
        Orchestrator --> CognitiveSchemas
    end

    subgraph Persistence["Adattárolási és Fájlréteg"]
        PG_DB[("PostgreSQL Adatbázis (Docker)")]
        SQLite_Fallback[("SQLite Fallback (neuroread.db)")]
        FileStore[("Helyi / Konténer Fájltár (uploads/)")]
    end

    %% Kapcsolatok a rétegek között
    Auth_Comp -.->|HTTP Bearer JWT| AuthRouter
    Upload_Comp -.->|multipart/form-data| DocRouter
    Doc_Side -.->|REST Lekérdezések| DocRouter
    DocRouter --> Orchestrator
    DocRouter --> FileStore
    DBConn --> PG_DB
    DBConn -.->|Fallback ha nincs PostgreSQL| SQLite_Fallback
```

---

## 2. Állapotdiagram (State Diagram)

A NeuroReadben két kulcsfontosságú állapotgép működik:
1. **Dokumentum-életciklus állapotgép:** A feltöltéstől a kognitív analízisen át a törlésig.
2. **3D Agyi Információáramlás állapotgép:** Az olvasási nehézség és felhasználói interakció függvényében váltakozó neurális módok.

### 2.1. Dokumentum és Elemzési Folyamat Állapotai

```mermaid
stateDiagram-v2
    [*] --> ÜresÁllapot: Alkalmazás elindítása

    ÜresÁllapot --> FeltöltésFolyamatban: Fájl kiválasztása / Drag & Drop
    ÜresÁllapot --> DemóBetöltés: "Kognitív minta betöltése" kattintás

    DemóBetöltés --> ElemzettOlvasás: Beépített kognitív adatok aktiválása

    FeltöltésFolyamatban --> SzövegKinyerés: Fájl fogadva (POST /api/documents/upload)
    
    SzövegKinyerés --> FeldolgozásiHiba: Ismeretlen formátum / Sérült fájl
    FeldolgozásiHiba --> ÜresÁllapot: Hibaüzenet megjelenítése

    SzövegKinyerés --> KognitívElemzés: Szöveg sikeresen kinyerve (PDF/DOCX/TXT)

    state KognitívElemzés {
        [*] --> SpaCyNLP: Párhuzamos szintaktikai fa vizsgálat
        [*] --> LLMSzemantika: Ollama / Llama3 hívás
        
        LLMSzemantika --> HeurisztikusFallback: Kapcsolat bontva / >4s Timeout
        HeurisztikusFallback --> Szintézis: Szintaktikai alapú becslés
        LLMSzemantika --> Szintézis: Strukturált JSON beérkezett
        SpaCyNLP --> Szintézis: Statisztikák és mélység kész
        
        Szintézis --> [*]: CognitiveModel összeállítva
    }

    KognitívElemzés --> ElemzettOlvasás: 200 OK + Kognitív Szegmensek
    KognitívElemzés --> ElemzésiHiba: Nem sikerült az elemzés
    ElemzésiHiba --> ÜresÁllapot: Rendszer-visszajelzés

    state ElemzettOlvasás {
        [*] --> TeljesDokumentumNézet
        TeljesDokumentumNézet --> MondatFókusz: Felhasználó kapszulára kattint
        MondatFókusz --> TeljesDokumentumNézet: Fókusz törlése
    }

    ElemzettOlvasás --> DokumentumTörölve: Törlés az oldalsávból (DELETE)
    DokumentumTörölve --> ÜresÁllapot
    ElemzettOlvasás --> [*]
```

### 2.2. 3D Agyi Információáramlás Állapotai (Brain3DViewer Dynamics)

```mermaid
stateDiagram-v2
    [*] --> Standby: 3D Geometria és 900 szinapszispont betöltve

    state Standby {
        [*] --> NyugvóPulzálás: Enyhe háttér pulzálás (0.5 Hz)
    }

    Standby --> LaminárisÁramlás: Könnyű Szöveg (Difficulty: 1-3)
    Standby --> MérsékeltÁramlás: Közepes Szöveg (Difficulty: 4-6)
    Standby --> TurbulensÁramlás: Nehéz Szöveg (Difficulty: 7-10)

    state LaminárisÁramlás {
        [*] --> ZöldCiánRészecskék: Színek: #10B981, #06B6D4
        ZöldCiánRészecskék --> LineárisÁtvitel: Visual -> Wernicke -> Broca -> PFC
        LineárisÁtvitel --> MinimálisZaj: Nincs visszacsatolt hurok
    }

    state MérsékeltÁramlás {
        [*] --> KékBorostyánRészecskék: Színek: #3B82F6, #F59E0B
        KékBorostyánRészecskék --> NormálSebesség: Átlagos sebességű transzfer
    }

    state TurbulensÁramlás {
        [*] --> VörösRészecskék: Színek: #EF4444, #F97316
        VörösRészecskék --> GyorsítottTranszfer: Nagy sebesség és szórás
        GyorsítottTranszfer --> FeedbackLoop: Visszacsatolás: PFC -> Wernicke
        FeedbackLoop --> MagFényerőCsúcs: Pulzáló Wernicke & Broca magok
    }

    LaminárisÁramlás --> TurbulensÁramlás: Nehéz mondatra kattintás
    TurbulensÁramlás --> LaminárisÁramlás: Könnyű mondatra kattintás
    MérsékeltÁramlás --> TurbulensÁramlás: Nehéz mondatra kattintás
```

---

## 3. Szekvenciadiagram (Sequence Diagram)

Az alábbi szekvenciadiagram a dokumentum feltöltésének, kognitív többnyelvű elemzésének, a hibatűrő LLM feldolgozásnak és a 3D szinkronizált megjelenítésnek az időbeli lefolyását illusztrálja.

```mermaid
sequenceDiagram
    autonumber
    actor Felhasználó as Felhasználó
    participant UI as Frontend (FileUpload / DocumentViewer)
    participant BrainUI as Frontend (Brain3DViewer)
    participant API as Backend (routers/documents.py)
    participant Factory as ParserFactory
    participant Parser as BaseParser (PDF/Docx/Txt)
    participant Engine as MainEngine
    participant SpaCy as TextProcessor (SpaCy)
    participant LLM as LLMAnalyzer (Ollama / Fallback)
    participant DB as Adatbázis (PostgreSQL / SQLite)

    Felhasználó->>UI: Fájl feltöltése (drag-and-drop: pelda.pdf)
    activate UI
    UI->>API: POST /api/documents/upload (multipart/form-data)
    activate API

    API->>API: Fájl mentése uploads/ mappába
    API->>Factory: get_parser_for_file(filepath)
    activate Factory
    Factory-->>API: PDFParser példány
    deactivate Factory

    API->>Parser: parse(filepath)
    activate Parser
    Parser-->>API: Kinyert nyers szöveg és metaadatok
    deactivate Parser

    API->>Engine: process_document(text, language="hu")
    activate Engine

    par Szintaktikai Elemzés
        Engine->>SpaCy: analyze_text(text, lang)
        activate SpaCy
        SpaCy->>SpaCy: Függőségi fa mélység, ritka szavak, TTR
        SpaCy-->>Engine: Szintaktikai statisztikák & mondatbontás
        deactivate SpaCy
    and Szemantikai Kognitív Elemzés
        Engine->>LLM: analyze_text(text)
        activate LLM
        alt Ollama elérhető (<= 4s)
            LLM->>LLM: Llama3 strukturált JSON generálás (Instructor)
            LLM-->>Engine: working_memory_load, semantic_score, synapse_routes
        else Offline / Timeout (> 4s)
            LLM->>LLM: fallback_analysis(text) heurisztikus kalkuláció
            LLM-->>Engine: Becsült kognitív modell & szinapszisok
        end
        deactivate LLM
    end

    Engine->>Engine: Szegmensek és agyi aktivációs vektorok szintézise
    Engine-->>API: CognitiveModel & HighlightedSegment lista
    deactivate Engine

    API->>DB: Tranzakció: Document, AnalysisSession, TextSegments mentése
    activate DB
    DB-->>API: Sikeres mentés (IDs)
    deactivate DB

    API-->>UI: 200 OK (text, stats, highlights, cognitive_model)
    deactivate API

    UI->>UI: DocumentViewer renderelése színes mondatkapszulákkal
    UI->>BrainUI: cognitive_model átadása (Aktivációk & Szinapszisok)
    activate BrainUI
    BrainUI->>BrainUI: Részecskék indítása Bézier pályákon (Lamináris/Turbulens)
    deactivate BrainUI
    deactivate UI

    opt Felhasználói Interakció
        Felhasználó->>UI: Rákattint egy nehéz (vörös) mondatra
        UI->>BrainUI: Aktív szegmens átadása (Difficulty: 8.5)
        activate BrainUI
        BrainUI->>BrainUI: Átváltás Turbulens Áramlásra + Feedback Loop (PFC -> Wernicke)
        BrainUI-->>Felhasználó: Vörös/borostyán áramlás és pulzáló Wernicke/Broca magok
        deactivate BrainUI
    end
```

---

## 4. Adatmodell és Entitás-Kapcsolat Diagram (ER Diagram)

A NeuroRead relációs adatmodellje a felhasználók, a feltöltött dokumentumok, az elemzési munkamenetek, a mondatszintű szövegszegmensek és a 3D agyi aktivációk kapcsolatát képezi le.

```mermaid
erDiagram
    USERS ||--o{ DOCUMENTS : "owns (1:N)"
    DOCUMENTS ||--o{ ANALYSIS_SESSION : "has (1:N)"
    ANALYSIS_SESSION ||--o{ TEXT_SEGMENTS : "contains (1:N)"
    TEXT_SEGMENTS ||--o| BRAIN_ACTIVATIONS : "triggers (1:1)"

    USERS {
        UUID id PK "Elsődleges azonosító"
        string email UK "Egyedi email cím"
        string hashed_password "Bcrypt hashelt jelszó"
        string full_name "Felhasználó teljes neve"
        datetime created_at "Regisztráció időpontja"
        datetime updated_at "Utolsó módosítás"
    }

    DOCUMENTS {
        UUID id PK "Elsődleges azonosító"
        UUID user_id FK "Tulajdonos felhasználó ID"
        string filename "Eredeti fájlnév"
        string file_type "MIME típus (pdf, docx, txt)"
        int file_size "Fájlméret bájtban"
        string storage_path "Fizikai elérési út"
        string status "Állapot (uploaded, processed)"
        datetime upload_date "Feltöltés dátuma"
    }

    ANALYSIS_SESSION {
        UUID id PK "Munkamenet azonosító"
        UUID document_id FK "Kapcsolódó dokumentum ID"
        datetime started_at "Elemzés kezdete"
        datetime finished_at "Elemzés vége"
        float overall_difficulty "Átlagos nehézség (0.0 - 10.0)"
        int total_segments "Mondatok/szegmensek száma"
        string status "Állapot (pending, completed, error)"
        text error_message "Esetleges hibaüzenet"
    }

    TEXT_SEGMENTS {
        UUID id PK "Szegmens azonosító"
        UUID session_id FK "Kapcsolódó munkamenet ID"
        int segment_id "Sorrendi sorszám (0..N)"
        text text "Szegmens/mondat nyers szövege"
        float difficulty_score "Kognitív pontszám (0.0 - 10.0)"
        string color_code "Kiemelés színe (HEX vagy név)"
        json factors "Befolyásoló tényezők listája"
        text simplification_suggestion "Javaslat egyszerűsítésre"
    }

    BRAIN_ACTIVATIONS {
        UUID id PK "Aktivációs azonosító"
        UUID segment_id FK "Kapcsolódó szövegszegmens ID (UK)"
        float visual_cortex "Vizuális kéreg terhelés (0.0 - 1.0)"
        float wernicke_area "Wernicke-terület terhelés (0.0 - 1.0)"
        float broca_area "Broca-terület terhelés (0.0 - 1.0)"
        float prefrontal_cortex "Prefrontális kéreg terhelés (0.0 - 1.0)"
    }
```

---

## 5. Osztálystruktúra és Tervezési Minták (Class Diagram)

A rendszer objektumorientált osztályhierarchiája a **Strategy mintát** valósítja meg a fájlelemzésben, míg a kognitív adatok szigorú **Pydantic** és **SQLAlchemy** sémákon keresztül folynak át.

```mermaid
classDiagram
    %% Strategy Pattern az elemzőkhöz
    class BaseParser {
        <<interface>>
        +parse(file_path: str) str*
        +validate(file_path: str) bool*
    }

    class PDFParser {
        +parse(file_path: str) str
        +validate(file_path: str) bool
        -extract_metadata() dict
    }

    class DocxParser {
        +parse(file_path: str) str
        +validate(file_path: str) bool
    }

    class TxtParser {
        +parse(file_path: str) str
        +validate(file_path: str) bool
        -detect_encoding(file_path: str) str
    }

    class ParserFactory {
        +get_parser_for_file(file_path: str) BaseParser
        +register_parser(mime_type: str, parser_cls) void
    }

    BaseParser <|.. PDFParser : implements
    BaseParser <|.. DocxParser : implements
    BaseParser <|.. TxtParser : implements
    ParserFactory ..> BaseParser : creates

    %% AI Engine Osztályok
    class TextProcessor {
        -dict nlp_models
        +load_model(lang: str) Language
        +analyze_stats(text: str, lang: str) dict
        +calculate_syntax_depth(sent: Span) int
        +detect_language(text: str) str
    }

    class LLMAnalyzer {
        -str ollama_url
        -str model_name
        -int timeout_seconds
        +analyze_cognitive(text: str) CognitiveModeling
        +fallback_analysis(text: str) CognitiveModeling
    }

    class MainEngine {
        -TextProcessor text_processor
        -LLMAnalyzer llm_analyzer
        +process_document(text: str, lang: str) CognitiveModeling
        +synthesize_brain_model(segments: list) dict
    }

    MainEngine o-- TextProcessor : uses
    MainEngine o-- LLMAnalyzer : uses

    %% Pydantic Adatmodellek
    class BrainActivationSchema {
        +float prefrontal_cortex
        +float wernicke_area
        +float broca_area
        +float visual_cortex
    }

    class SynapseRouteSchema {
        +str from_area
        +str to_area
        +float signal_intensity
    }

    class HighlightedSegmentSchema {
        +str text
        +str color_code
        +str highlight_type
        +str reason
    }

    class CognitiveModelingSchema {
        +int semantic_complexity_score
        +str working_memory_load
        +List~str~ cognitive_friction_points
        +List~str~ key_takeaways
        +BrainActivationSchema brain_activation
        +List~SynapseRouteSchema~ synapse_routes
        +List~HighlightedSegmentSchema~ highlights
    }

    CognitiveModelingSchema *-- BrainActivationSchema
    CognitiveModelingSchema *-- SynapseRouteSchema
    CognitiveModelingSchema *-- HighlightedSegmentSchema
    MainEngine ..> CognitiveModelingSchema : produces
```

---

*Diagramgyűjtemény lezárva: 2026. október 21.*  
*NeuroRead Rendszertervezési Dokumentáció*

