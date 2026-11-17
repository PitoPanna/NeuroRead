FROM python:3.11-slim

WORKDIR /app

# Rendszerfüggőségek
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Függőségek telepítése
COPY src/backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Teljes src és alembic mappa átmásolása a gyökérből
COPY . .

EXPOSE 8000

CMD ["uvicorn", "src.backend.main:app", "--host", "0.0.0.0", "--port", "8000"]