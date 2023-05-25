FROM node:18.16 AS frontend_builder

WORKDIR /frontend

COPY ./frontend/package.json ./frontend/yarn.lock ./

RUN yarn install --frozen-lockfile

COPY ./frontend/ ./

RUN yarn build

RUN cp \
    node_modules/@ricky0123/vad-web/dist/silero_vad.onnx \
    node_modules/@ricky0123/vad-web/dist/vad.worklet.bundle.min.js \
    node_modules/onnxruntime-web/dist/*.wasm \
    dist

FROM tiangolo/uvicorn-gunicorn-fastapi:python3.10-slim

WORKDIR /

COPY ./requirements.txt /app/requirements.txt

RUN apt-get update && apt-get install -y build-essential ffmpeg

RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

ENV MAX_WORKERS=1 TIMEOUT=1200

COPY ./app /app

COPY --from=frontend_builder /frontend/dist /app/frontend/dist
