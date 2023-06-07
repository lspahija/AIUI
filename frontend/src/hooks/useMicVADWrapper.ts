import {useEffect, useRef} from "react";
import {useMicVAD} from "@ricky0123/vad-react";

export const useMicVADWrapper = (options, onLoadingChange) => {
    const micVAD = useMicVAD(options);
    const loadingRef = useRef(micVAD.loading);

    useEffect(() => {
        if (loadingRef.current !== micVAD.loading) {
            onLoadingChange(micVAD.loading);
            loadingRef.current = micVAD.loading;
        }
    });

    return micVAD;
}