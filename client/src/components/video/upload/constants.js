export const STATUS = {
    WAITING:   "waiting",
    UPLOADING: "uploading",
    DONE:      "done",
    ERROR:     "error",
    CANCELLED: "cancelled",
};

export const isCancellable = (s) =>
    s === STATUS.WAITING || s === STATUS.UPLOADING;

export const isFinished = (s) =>
    s === STATUS.DONE || s === STATUS.ERROR || s === STATUS.CANCELLED;
