import { useState, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { STATUS } from "./constants";
import { makeUploader } from "./makeUploader";

export function useVideoUpload() {
    const [uploads, setUploads] = useState([]);
    const abortControllersRef   = useRef({});
    const queryClient           = useQueryClient();

    const cancelUpload = useCallback((id) => {
        abortControllersRef.current[id]?.abort();
    }, []);

    const cancelAll = useCallback(() => {
        Object.values(abortControllersRef.current).forEach((ctrl) => ctrl.abort());
    }, []);

    const processFiles = useCallback(async (files) => {
        const newItems = files.map((file) => ({
            id: crypto.randomUUID(),
            file,
            status: STATUS.UPLOADING,
            progress: 0,
            speed: 0,
        }));

        newItems.forEach((item) => {
            abortControllersRef.current[item.id] = new AbortController();
        });

        setUploads((prev) => [...newItems, ...prev]);

        await Promise.allSettled(
            newItems.map((item) =>
                makeUploader({ item, setUploads, abortControllersRef, queryClient })()
            )
        );

        queryClient.invalidateQueries({ queryKey: ["videos", 1] });
    }, [queryClient]);

    const removeUpload = useCallback((id) => {
        setUploads((prev) => prev.filter((u) => u.id !== id));
    }, []);

    const clearUploads = useCallback(() => {
        setUploads([]);
    }, []);

    return {
        uploads,
        processFiles,
        removeUpload,
        clearUploads,
        cancelUpload,
        cancelAll,
    };
}
