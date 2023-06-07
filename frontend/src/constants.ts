import {onMisfire, onSpeechEnd, onSpeechStart} from "./SpeechManager.ts";

export const VAD_OPTIONS = {
    preSpeechPadFrames: 5,
    positiveSpeechThreshold: 0.90,
    negativeSpeechThreshold: 0.75,
    minSpeechFrames: 4,
    startOnLoad: true,
    onSpeechStart,
    onSpeechEnd,
    onVADMisfire: onMisfire
}