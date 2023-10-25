FROM --platform=linux/arm64/v8 node:18.16 AS frontend_builder

WORKDIR /frontend

COPY ./frontend/package.json ./frontend/yarn.lock ./

RUN yarn install --frozen-lockfile

COPY ./frontend/ ./

RUN yarn build

FROM --platform=linux/arm64 condaforge/miniforge3:latest

WORKDIR /

ENV MAX_WORKERS=5

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y git curl ffmpeg gcc g++

COPY ./backend/requirements.txt /tmp/

RUN pip install --no-cache-dir --upgrade -r /tmp/requirements.txt uvicorn gunicorn fastapi

COPY ./backend /app

COPY --from=frontend_builder /frontend/dist /app/frontend/dist

WORKDIR /app

ENV PYTHONPATH /app

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "5"]
