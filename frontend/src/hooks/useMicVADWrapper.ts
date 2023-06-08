import {useEffect, useRef} from "react";
import {useMicVAD} from "@ricky0123/vad-react";
import {VAD_OPTIONS} from "../constants.ts";

export const useMicVADWrapper = (onLoadingChange) => {
    const micVAD = useMicVAD(VAD_OPTIONS);
    const loadingRef = useRef(micVAD.loading);

    useEffect(() => {
        if (loadingRef.current !== micVAD.loading) {
            onLoadingChange(micVAD.loading);
            loadingRef.current = micVAD.loading;
        }
    });

    return micVAD;
}