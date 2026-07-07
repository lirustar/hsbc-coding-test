FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/

EXPOSE 8002

ENV PREDICTION_API_BASE_URL=http://host.docker.internal:8000

CMD ["python", "-m", "app.main"]
