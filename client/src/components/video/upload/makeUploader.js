import { enqueueSnackbar } from "notistack";
import { STATUS } from "./constants";
import VideoService from "../../../services/VideoService";

const video = new VideoService();

export function makeUploader({ item, setUploads, abortControllersRef, queryClient }) {
    return async () => {
        setUploads((prev) =>
            prev.map((u) => u.id === item.id ? { ...u, status: STATUS.UPLOADING } : u)
        );

        try {
            let lastLoaded = 0;
            let lastTime = Date.now();
            const signal = abortControllersRef.current[item.id]?.signal;

            await video.create(
                { video: item.file },
                {
                    signal,
                    headers: { "Content-Type": "multipart/form-data" },
                    onUploadProgress: (e) => {
                        const now = Date.now();
                        const dt = (now - lastTime) / 1000;
                        const speed = dt > 0 ? (e.loaded - lastLoaded) / dt : 0;
                        lastLoaded = e.loaded;
                        lastTime = now;
                        const progress = Math.round((e.loaded / e.total) * 100);
                        setUploads((prev) =>
                            prev.map((u) => u.id === item.id ? { ...u, progress, speed } : u)
                        );
                    },
                }
            );

            setUploads((prev) =>
                prev.map((u) =>
                    u.id === item.id
                        ? { ...u, status: STATUS.DONE, progress: 100, speed: 0 }
                        : u
                )
            );
            enqueueSnackbar(`${item.file.name} загружено`, { variant: "success" });
            queryClient.invalidateQueries({ queryKey: ["videos", 1] });

        } catch (err) {
            const isCancelled =
                err?.name === "CanceledError" ||
                err?.name === "AbortError"    ||
                err?.code === "ERR_CANCELED"  ||
                abortControllersRef.current[item.id]?.signal?.aborted;

            setUploads((prev) =>
                prev.map((u) =>
                    u.id === item.id
                        ? { ...u, status: isCancelled ? STATUS.CANCELLED : STATUS.ERROR }
                        : u
                )
            );

            if (!isCancelled) {
                enqueueSnackbar(`Ошибка: ${item.file.name}`, { variant: "error" });
            }
        } finally {
            delete abortControllersRef.current[item.id];
        }
    };
}
