#!/usr/bin/env bash


tsc && vite build
cp \
    node_modules/@ricky0123/vad-web/dist/silero_vad.onnx \
    node_modules/@ricky0123/vad-web/dist/vad.worklet.bundle.min.js \
    node_modules/onnxruntime-web/dist/*.wasm \
    dist

npx nodemon \
    --exec "http-server dist" \
    &
BUILD_PID=$!
trap 'kill $BUILD_PID' INT
echo nodemon pid $BUILD_PID

wait < <(jobs -p)
