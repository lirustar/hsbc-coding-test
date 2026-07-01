# ── Base image ──────────────────────────────────
FROM python:3.13-slim

# ── Working directory ───────────────────────────
WORKDIR /app

# ── Install dependencies ────────────────────────
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Copy project files ──────────────────────────
COPY feature_engineering.py .
COPY train_catboost.py .
COPY main.py .
COPY model/ ./model/
COPY data/ ./data/

# ── Expose port ─────────────────────────────────
EXPOSE 8000

# ── Start service ───────────────────────────────
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
