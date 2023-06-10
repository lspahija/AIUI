FROM node:18.16 AS frontend_builder

WORKDIR /frontend

COPY ./frontend/package.json ./frontend/yarn.lock ./

RUN yarn install --frozen-lockfile

COPY ./frontend/ ./

RUN yarn build

FROM tiangolo/uvicorn-gunicorn-fastapi:python3.10-slim

WORKDIR /

ENV MAX_WORKERS=5

RUN apt-get update && apt-get install -y ffmpeg

COPY ./backend /app

RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

COPY --from=frontend_builder /frontend/dist /app/frontend/dist
