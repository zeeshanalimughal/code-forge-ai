// only render when state changes not on first render

import { useEffect } from "react";

export function useLateEffect(effect: () => void, deps: any[]) {
    useEffect(() => {
        const timeout = setTimeout(() => {
            effect();
        }, 0);
        return () => clearTimeout(timeout);
    }, [...deps]);
}
