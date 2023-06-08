import {useEffect, useRef} from "react";
import {useMicVAD} from "@ricky0123/vad-react";
import {onMisfire, onSpeechEnd, onSpeechStart} from "../speech-manager.ts";

export const useMicVADWrapper = (onLoadingChange) => {
    const micVAD = useMicVAD(
        {
            preSpeechPadFrames: 5,
            positiveSpeechThreshold: 0.90,
            negativeSpeechThreshold: 0.75,
            minSpeechFrames: 4,
            startOnLoad: true,
            onSpeechStart,
            onSpeechEnd,
            onVADMisfire: onMisfire
        }
    );

    const loadingRef = useRef(micVAD.loading);
    useEffect(() => {
        if (loadingRef.current !== micVAD.loading) {
            onLoadingChange(micVAD.loading);
            loadingRef.current = micVAD.loading;
        }
    });

    return micVAD;
}