"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
    useQuery,
    keepPreviousData,
    useQueryClient,
} from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import {
    Box,
    Typography,
    Stack,
    Paper,
    LinearProgress,
    CircularProgress,
    IconButton,
    Chip,
    Divider,
    Grid,
    useTheme,
    alpha,
    Drawer,
    Button,
    Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VideoFileIcon from "@mui/icons-material/VideoFile";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CancelIcon from "@mui/icons-material/Cancel";
import BlockIcon from "@mui/icons-material/Block";
import VideoService from "../../services/VideoService";
import Pagination from "../../components/Pagination";
import { VideoControll } from "../../components/video/VideoControll";
import ErrorElement from "../../components/ErrorElement";
import { Empty } from "../../components/Empty";
import { ContainerComponent } from "../../components/wrappers/ContainerComponent";

const video = new VideoService();
const DRAWER_WIDTH = 340;

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes) {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function pluralRu(n) {
    if (n % 10 === 1 && n % 100 !== 11) return "";
    if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100))
        return "а";
    return "ов";
}

const STATUS = {
    WAITING: "waiting",
    UPLOADING: "uploading",
    DONE: "done",
    ERROR: "error",
    CANCELLED: "cancelled",
};

const isCancellable = (s) => s === STATUS.WAITING || s === STATUS.UPLOADING;
const isFinished = (s) =>
    s === STATUS.DONE || s === STATUS.ERROR || s === STATUS.CANCELLED;

// ─── UploadTriggerButton ──────────────────────────────────────────────────────

function UploadTriggerButton({ uploads, onClick }) {
    const theme = useTheme();

    const total = uploads.length;
    const done = uploads.filter((u) => u.status === STATUS.DONE).length;
    const errors = uploads.filter((u) => u.status === STATUS.ERROR).length;
    const active = uploads.filter((u) => u.status === STATUS.UPLOADING);
    const waiting = uploads.filter((u) => u.status === STATUS.WAITING).length;
    const busy = active.length > 0 || waiting > 0;

    const avgProgress = active.length
        ? Math.round(active.reduce((s, u) => s + u.progress, 0) / active.length)
        : 0;

    if (total === 0) {
        return (
            <Button
                variant="contained"
                color="primary"
                startIcon={<CloudUploadIcon />}
                onClick={onClick}
                sx={{ borderRadius: 2, fontWeight: 600, px: 2.5 }}
            >
                Загрузить видео
            </Button>
        );
    }

    const allDone = done === total && errors === 0;
    const hasError = errors > 0 && !busy;
    const tone = allDone ? "success" : hasError ? "error" : "info";
    const c = theme.palette[tone];

    return (
        <Tooltip title="Открыть очередь загрузки" placement="bottom">
            <Paper
                variant="outlined"
                onClick={onClick}
                sx={{
                    px: 1.5,
                    py: 0.75,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1.5,
                    cursor: "pointer",
                    borderRadius: 2,
                    borderColor: alpha(c.main, 0.3),
                    bgcolor: alpha(c.main, 0.07),
                    transition: "all 0.2s ease",
                    userSelect: "none",
                    "&:hover": {
                        borderColor: c.main,
                        bgcolor: alpha(c.main, 0.13),
                    },
                }}
            >
                <Box
                    sx={{
                        width: 30,
                        height: 30,
                        borderRadius: 1,
                        bgcolor: alpha(c.main, 0.12),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    {busy ? (
                        <CircularProgress size={14} sx={{ color: c.main }} />
                    ) : allDone ? (
                        <CheckCircleIcon
                            sx={{ fontSize: 16, color: "success.main" }}
                        />
                    ) : (
                        <ErrorIcon sx={{ fontSize: 16, color: "error.main" }} />
                    )}
                </Box>

                <Box sx={{ minWidth: 0 }}>
                    <Typography
                        variant="caption"
                        fontWeight={700}
                        color={`${tone}.main`}
                        display="block"
                        lineHeight={1.3}
                        noWrap
                    >
                        {busy
                            ? `Загружается ${active.length} из ${total}`
                            : allDone
                              ? `Готово · ${done} файл${pluralRu(done)}`
                              : `${done} из ${total} · ${errors} ошибок`}
                    </Typography>
                    <Typography
                        variant="caption"
                        color="text.disabled"
                        display="block"
                        lineHeight={1.3}
                        noWrap
                    >
                        {busy
                            ? `~${avgProgress}% · осталось ${waiting} в очереди`
                            : "нажмите, чтобы открыть"}
                    </Typography>
                </Box>

                {busy && (
                    <Box sx={{ width: 44, flexShrink: 0 }}>
                        <LinearProgress
                            variant="determinate"
                            value={(done / total) * 100}
                            color={tone}
                            sx={{
                                height: 3,
                                borderRadius: 99,
                                bgcolor: alpha(c.main, 0.15),
                                "& .MuiLinearProgress-bar": {
                                    borderRadius: 99,
                                },
                            }}
                        />
                    </Box>
                )}
            </Paper>
        </Tooltip>
    );
}

// ─── UploadItem ───────────────────────────────────────────────────────────────

function UploadItem({ item, onRemove, onCancel }) {
    const theme = useTheme();

    const cfgMap = {
        [STATUS.WAITING]: {
            color: theme.palette.text.disabled,
            icon: <HourglassTopIcon sx={{ fontSize: 14 }} />,
            label: "В очереди",
            chip: "default",
            bar: "inherit",
        },
        [STATUS.UPLOADING]: {
            color: theme.palette.info.main,
            icon: (
                <CircularProgress
                    size={10}
                    sx={{ color: theme.palette.info.main }}
                />
            ),
            label: `${item.progress}%`,
            chip: "info",
            bar: "info",
        },
        [STATUS.DONE]: {
            color: theme.palette.success.main,
            icon: <CheckCircleIcon sx={{ fontSize: 14 }} />,
            label: "Готово",
            chip: "success",
            bar: "success",
        },
        [STATUS.ERROR]: {
            color: theme.palette.error.main,
            icon: <ErrorIcon sx={{ fontSize: 14 }} />,
            label: "Ошибка",
            chip: "error",
            bar: "error",
        },
        [STATUS.CANCELLED]: {
            color: theme.palette.text.disabled,
            icon: <BlockIcon sx={{ fontSize: 14 }} />,
            label: "Отменено",
            chip: "default",
            bar: "inherit",
        },
    };
    const cfg = cfgMap[item.status];

    return (
        <Paper
            variant="outlined"
            sx={{
                p: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                borderColor: alpha(cfg.color, 0.25),
                bgcolor: alpha(cfg.color, 0.04),
                opacity: item.status === STATUS.CANCELLED ? 0.55 : 1,
                transition:
                    "border-color 0.25s, background-color 0.25s, opacity 0.25s",
                animation: "slideIn 0.25s ease",
                "@keyframes slideIn": {
                    from: { opacity: 0, transform: "translateY(-6px)" },
                    to: { opacity: 1, transform: "translateY(0)" },
                },
            }}
        >
            <Box
                sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 1,
                    flexShrink: 0,
                    bgcolor: alpha(cfg.color, 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <VideoFileIcon sx={{ fontSize: 17, color: cfg.color }} />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    mb={0.5}
                >
                    <Typography
                        variant="caption"
                        noWrap
                        sx={{
                            color: "text.primary",
                            fontWeight: 500,
                            maxWidth: "58%",
                            display: "block",
                        }}
                    >
                        {item.file.name}
                    </Typography>
                    <Chip
                        size="small"
                        color={cfg.chip}
                        icon={cfg.icon}
                        label={cfg.label}
                        sx={{
                            height: 20,
                            fontSize: 10,
                            fontWeight: 600,
                            "& .MuiChip-icon": { fontSize: 12, ml: "4px" },
                            "& .MuiChip-label": { px: "6px" },
                        }}
                    />
                </Stack>

                <LinearProgress
                    variant="determinate"
                    value={
                        item.status === STATUS.DONE ||
                        item.status === STATUS.ERROR
                            ? 100
                            : item.progress
                    }
                    color={cfg.bar}
                    sx={{
                        height: 3,
                        borderRadius: 99,
                        bgcolor: alpha(cfg.color, 0.1),
                        "& .MuiLinearProgress-bar": {
                            borderRadius: 99,
                            boxShadow:
                                item.status === STATUS.UPLOADING
                                    ? `0 0 6px ${alpha(cfg.color, 0.5)}`
                                    : "none",
                        },
                    }}
                />

                <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{ display: "block", mt: 0.25 }}
                >
                    {formatBytes(item.file.size)}
                    {item.status === STATUS.UPLOADING && item.speed > 0
                        ? ` · ${formatBytes(item.speed)}/s`
                        : ""}
                </Typography>
            </Box>

            {isCancellable(item.status) && (
                <Tooltip title="Отменить" placement="left">
                    <IconButton
                        size="small"
                        onClick={() => onCancel(item.id)}
                        sx={{
                            flexShrink: 0,
                            color: "text.disabled",
                            "&:hover": { color: "error.main" },
                            transition: "color 0.2s",
                        }}
                    >
                        <CancelIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                </Tooltip>
            )}

            {isFinished(item.status) && (
                <IconButton
                    size="small"
                    onClick={() => onRemove(item.id)}
                    sx={{
                        flexShrink: 0,
                        color: "text.disabled",
                        "&:hover": { color: "text.secondary" },
                    }}
                >
                    <CloseIcon sx={{ fontSize: 14 }} />
                </IconButton>
            )}
        </Paper>
    );
}

// ─── DropZone ─────────────────────────────────────────────────────────────────

function DropZone({ onFiles }) {
    const theme = useTheme();
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef();

    const handleDrop = useCallback(
        (e) => {
            e.preventDefault();
            setDragging(false);
            const files = Array.from(e.dataTransfer.files).filter((f) =>
                f.type.startsWith("video/"),
            );
            if (files.length) onFiles(files);
        },
        [onFiles],
    );

    return (
        <Paper
            variant="outlined"
            onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current.click()}
            sx={{
                p: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1.5,
                cursor: "pointer",
                borderStyle: "dashed",
                borderColor: dragging ? "primary.main" : "divider",
                bgcolor: dragging
                    ? alpha(theme.palette.primary.main, 0.05)
                    : "background.paper",
                transform: dragging ? "scale(1.01)" : "scale(1)",
                transition: "all 0.2s ease",
                boxShadow: dragging
                    ? `0 0 20px ${alpha(theme.palette.primary.main, 0.12)}`
                    : "none",
                "&:hover": {
                    borderColor: "primary.light",
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                },
            }}
        >
            <input
                ref={inputRef}
                type="file"
                accept="video/*"
                multiple
                style={{ display: "none" }}
                onChange={(e) => {
                    const files = Array.from(e.target.files);
                    if (files.length) onFiles(files);
                    e.target.value = "";
                }}
            />
            <Box
                sx={{
                    width: 52,
                    height: 52,
                    borderRadius: 2,
                    bgcolor: dragging
                        ? alpha(theme.palette.primary.main, 0.1)
                        : alpha(theme.palette.action.active, 0.04),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s ease",
                }}
            >
                <CloudUploadIcon
                    sx={{
                        fontSize: 26,
                        color: dragging ? "primary.main" : "text.disabled",
                        transition: "color 0.2s",
                    }}
                />
            </Box>
            <Box textAlign="center">
                <Typography
                    variant="body2"
                    color={dragging ? "primary" : "text.secondary"}
                    fontWeight={500}
                >
                    {dragging
                        ? "Отпустите для загрузки"
                        : "Перетащите видео или нажмите"}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                    MP4, WebM, MOV · несколько файлов
                </Typography>
            </Box>
        </Paper>
    );
}

// ─── UploadDrawer ─────────────────────────────────────────────────────────────

function UploadDrawer({
    open,
    onClose,
    uploads,
    onFiles,
    onRemove,
    onCancel,
    onCancelAll,
    onClear,
}) {
    const theme = useTheme();

    const total = uploads.length;
    const done = uploads.filter((u) => u.status === STATUS.DONE).length;
    const errors = uploads.filter((u) => u.status === STATUS.ERROR).length;
    const busy = uploads.some(
        (u) => u.status === STATUS.UPLOADING || u.status === STATUS.WAITING,
    );
    const cancellableCount = uploads.filter((u) =>
        isCancellable(u.status),
    ).length;

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: DRAWER_WIDTH,
                    bgcolor: "background.default",
                    backgroundImage: "none",
                    display: "flex",
                    flexDirection: "column",
                },
            }}
        >
            <Box
                sx={{
                    px: 2.5,
                    py: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: 1,
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    flexShrink: 0,
                }}
            >
                <Stack direction="row" alignItems="center" gap={1}>
                    <UploadFileIcon
                        sx={{ fontSize: 18, color: "primary.main" }}
                    />
                    <Typography variant="subtitle2" fontWeight={700}>
                        Загрузка видео
                    </Typography>
                </Stack>
                <IconButton
                    size="small"
                    onClick={onClose}
                    sx={{ color: "text.disabled" }}
                >
                    <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
            </Box>

            <Box
                sx={{
                    flex: 1,
                    overflowY: "auto",
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                }}
            >
                <DropZone onFiles={onFiles} />

                {busy && total > 0 && (
                    <Paper
                        variant="outlined"
                        sx={{
                            p: 1.5,
                            borderColor: alpha(theme.palette.info.main, 0.3),
                            bgcolor: alpha(theme.palette.info.main, 0.05),
                        }}
                    >
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            mb={1}
                        >
                            <Stack
                                direction="row"
                                alignItems="center"
                                gap={0.75}
                            >
                                <CircularProgress size={12} color="info" />
                                <Typography
                                    variant="caption"
                                    color="info.main"
                                    fontWeight={600}
                                >
                                    Загрузка…
                                </Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" gap={1}>
                                <Typography
                                    variant="caption"
                                    color="text.disabled"
                                >
                                    {done} / {total}
                                </Typography>
                                {cancellableCount > 1 && (
                                    <Tooltip
                                        title={`Отменить все (${cancellableCount})`}
                                        placement="left"
                                    >
                                        <Chip
                                            label="Отменить все"
                                            size="small"
                                            color="error"
                                            variant="outlined"
                                            icon={
                                                <CancelIcon
                                                    sx={{
                                                        fontSize:
                                                            "12px !important",
                                                    }}
                                                />
                                            }
                                            onClick={onCancelAll}
                                            sx={{
                                                height: 20,
                                                fontSize: 10,
                                                cursor: "pointer",
                                                "& .MuiChip-label": {
                                                    px: "6px",
                                                },
                                                "& .MuiChip-icon": {
                                                    ml: "4px",
                                                },
                                            }}
                                        />
                                    </Tooltip>
                                )}
                            </Stack>
                        </Stack>
                        <LinearProgress
                            variant="determinate"
                            value={(done / total) * 100}
                            color="info"
                            sx={{
                                height: 3,
                                borderRadius: 99,
                                "& .MuiLinearProgress-bar": {
                                    borderRadius: 99,
                                },
                            }}
                        />
                    </Paper>
                )}

                {uploads.length > 0 && (
                    <Box>
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            mb={1}
                        >
                            <Stack
                                direction="row"
                                alignItems="center"
                                gap={0.75}
                            >
                                <Typography
                                    variant="caption"
                                    color="text.disabled"
                                    sx={{
                                        textTransform: "uppercase",
                                        letterSpacing: "0.08em",
                                    }}
                                >
                                    Очередь ({uploads.length})
                                </Typography>
                                {errors > 0 && (
                                    <Chip
                                        label={`${errors} ошибок`}
                                        size="small"
                                        color="error"
                                        sx={{
                                            height: 16,
                                            fontSize: 9,
                                            "& .MuiChip-label": { px: "5px" },
                                        }}
                                    />
                                )}
                            </Stack>
                            {!busy && (
                                <Typography
                                    variant="caption"
                                    color="text.disabled"
                                    onClick={onClear}
                                    sx={{
                                        cursor: "pointer",
                                        userSelect: "none",
                                        "&:hover": { color: "text.secondary" },
                                        transition: "color 0.2s",
                                    }}
                                >
                                    очистить
                                </Typography>
                            )}
                        </Stack>

                        <Stack spacing={1}>
                            {uploads.map((item) => (
                                <UploadItem
                                    key={item.id}
                                    item={item}
                                    onRemove={onRemove}
                                    onCancel={onCancel}
                                />
                            ))}
                        </Stack>
                    </Box>
                )}
            </Box>
        </Drawer>
    );
}

// ─── uploadOne — isolated upload for a single item ───────────────────────────

function makeUploader({ item, setUploads, abortControllersRef, queryClient }) {
    return async () => {
        setUploads((prev) =>
            prev.map((u) =>
                u.id === item.id ? { ...u, status: STATUS.UPLOADING } : u,
            ),
        );

        try {
            let lastLoaded = 0,
                lastTime = Date.now();
            const signal = abortControllersRef.current[item.id]?.signal;

            await video.create(
                { video: item.file },
                {
                    signal,
                    headers: { "Content-Type": "multipart/form-data" },
                    onUploadProgress: (e) => {
                        const now = Date.now(),
                            dt = (now - lastTime) / 1000;
                        const speed = dt > 0 ? (e.loaded - lastLoaded) / dt : 0;
                        lastLoaded = e.loaded;
                        lastTime = now;
                        const progress = Math.round((e.loaded / e.total) * 100);
                        setUploads((prev) =>
                            prev.map((u) =>
                                u.id === item.id
                                    ? { ...u, progress, speed }
                                    : u,
                            ),
                        );
                    },
                },
            );

            setUploads((prev) =>
                prev.map((u) =>
                    u.id === item.id
                        ? { ...u, status: STATUS.DONE, progress: 100, speed: 0 }
                        : u,
                ),
            );
            enqueueSnackbar(`${item.file.name} загружено`, {
                variant: "success",
            });
            queryClient.invalidateQueries({ queryKey: ["videos", 1] });
        } catch (err) {
            const isCancelled =
                err?.name === "CanceledError" ||
                err?.name === "AbortError" ||
                err?.code === "ERR_CANCELED" ||
                abortControllersRef.current[item.id]?.signal?.aborted;

            setUploads((prev) =>
                prev.map((u) =>
                    u.id === item.id
                        ? {
                              ...u,
                              status: isCancelled
                                  ? STATUS.CANCELLED
                                  : STATUS.ERROR,
                          }
                        : u,
                ),
            );

            if (!isCancelled) {
                enqueueSnackbar(`Ошибка: ${item.file.name}`, {
                    variant: "error",
                });
            }
        } finally {
            delete abortControllersRef.current[item.id];
        }
    };
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Page() {
    const popupRef = useRef();
    const [page, setPage] = useState(1);
    const [uploads, setUploads] = useState([]);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const abortControllersRef = useRef({});
    const queryClient = useQueryClient();
    const [loadingDeleteALL, setLoadingDeleteALL] = useState(false);

    const handleDeleteAll = async () => {
        try {
            if (!confirm("Удалить все видео?")) return;
            setLoadingDeleteALL(true);
            await video.deleteAll();
            queryClient.invalidateQueries({ queryKey: ["videos", 1] });
            enqueueSnackbar("Все видео удалены", {
                variant: "success",
            });
        } catch (e) {
            enqueueSnackbar("Упс! что-то пошло не так", { variant: "error" });
        } finally {
            setLoadingDeleteALL(false);
        }
    };

    const { data, isPending, refetch, isError, isFetching } = useQuery({
        queryKey: ["videos", page],
        placeholderData: keepPreviousData,
        queryFn: async () => {
            const { data } = await video.getAll(page);
            return data;
        },
    });

    useEffect(() => {
        popupRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }, [page]);

    // ── Cancel one ───────────────────────────────────────────────────────────
    const cancelUpload = useCallback((id) => {
        abortControllersRef.current[id]?.abort();
    }, []);

    // ── Cancel all ───────────────────────────────────────────────────────────
    const cancelAll = useCallback(() => {
        Object.values(abortControllersRef.current).forEach((ctrl) =>
            ctrl.abort(),
        );
    }, []);

    // ── Process files — all parallel via Promise.allSettled ──────────────────
    const processFiles = useCallback(
        async (files) => {
            const newItems = files.map((file) => ({
                id: crypto.randomUUID(),
                file,
                status: STATUS.UPLOADING, // start immediately — no waiting state needed
                progress: 0,
                speed: 0,
            }));

            // Register AbortControllers
            newItems.forEach((item) => {
                abortControllersRef.current[item.id] = new AbortController();
            });

            // Prepend to list — новые сверху
            setUploads((prev) => [...newItems, ...prev]);

            // Fire all in parallel
            await Promise.allSettled(
                newItems.map((item) =>
                    makeUploader({
                        item,
                        setUploads,
                        abortControllersRef,
                        queryClient,
                    })(),
                ),
            );

            setPage(1);
            queryClient.invalidateQueries({ queryKey: ["videos", 1] });
        },
        [queryClient],
    );

    const removeUpload = (id) =>
        setUploads((prev) => prev.filter((u) => u.id !== id));

    return (
        <ContainerComponent>
            <Box
                display="flex"
                flexDirection="column"
                flex={1}
                height="100%"
                gap={2}
            >
                {/* ── Top bar ── */}
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    flexShrink={0}
                >
                    <Box>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                            color="text.primary"
                        >
                            Видеотека
                            {data?.info?.countItems
                                ? ` (${data.info.countItems})`
                                : ""}
                        </Typography>
                        <Typography variant="caption" color="text.disabled">
                            {data?.info?.countPages > 0
                                ? `стр. ${data.info.currentPage} из ${data.info.countPages}`
                                : "нет видео"}
                        </Typography>
                    </Box>
                    <Button
                        variant="outlined"
                        color="error"
                        loading={loadingDeleteALL}
                        onClick={handleDeleteAll}
                    >
                        Удалить все
                    </Button>
                    <UploadTriggerButton
                        uploads={uploads}
                        onClick={() => setDrawerOpen(true)}
                    />
                </Stack>

                <Divider flexItem />

                {/* ── Video library ── */}
                <Box
                    ref={popupRef}
                    flex={1}
                    display="flex"
                    flexDirection="column"
                    sx={{ overflowY: "auto", position: "relative" }}
                >
                    {isFetching && (
                        <LinearProgress
                            color="primary"
                            sx={{
                                height: 2,
                                borderRadius: 99,
                                mb: 1.5,
                                "& .MuiLinearProgress-bar": {
                                    borderRadius: 99,
                                },
                            }}
                        />
                    )}

                    {isPending ? (
                        <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            height={200}
                        >
                            <CircularProgress color="primary" size={28} />
                        </Box>
                    ) : isError ? (
                        <ErrorElement />
                    ) : data?.data?.length >= 1 ? (
                        <>
                            <Box display="flex" flexDirection="column" flex={1}>
                                <Grid
                                    container
                                    spacing={1.5}
                                    columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
                                >
                                    {data.data.map((e) => (
                                        <Grid size={1} key={e.id}>
                                            <VideoControll
                                                refetch={refetch}
                                                e={e}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                            <Box mt={2}>
                                <Pagination
                                    color="primary"
                                    pageCount={data.info.countPages}
                                    currentPage={data.info.currentPage}
                                    getData={setPage}
                                />
                            </Box>
                        </>
                    ) : (
                        <Empty />
                    )}
                </Box>
            </Box>

            <UploadDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                uploads={uploads}
                onFiles={processFiles}
                onRemove={removeUpload}
                onCancel={cancelUpload}
                onCancelAll={cancelAll}
                onClear={() => setUploads([])}
            />
        </ContainerComponent>
    );
}
