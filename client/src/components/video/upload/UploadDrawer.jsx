import {
    Box, Typography, Stack, Paper, LinearProgress,
    CircularProgress, IconButton, Chip, Drawer, Tooltip, useTheme, alpha,
} from "@mui/material";
import CloseIcon      from "@mui/icons-material/Close";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CancelIcon     from "@mui/icons-material/Cancel";
import { DropZone }   from "./DropZone";
import { UploadItem } from "./UploadItem";
import { STATUS, isCancellable } from "./constants";

const DRAWER_WIDTH = 340;

export function UploadDrawer({ open, onClose, uploads, onFiles, onRemove, onCancel, onCancelAll, onClear }) {
    const theme = useTheme();

    const total            = uploads.length;
    const done             = uploads.filter((u) => u.status === STATUS.DONE).length;
    const errors           = uploads.filter((u) => u.status === STATUS.ERROR).length;
    const busy             = uploads.some((u) => u.status === STATUS.UPLOADING || u.status === STATUS.WAITING);
    const cancellableCount = uploads.filter((u) => isCancellable(u.status)).length;

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
            {/* Header */}
            <Box sx={{
                px: 2.5, py: 2,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                borderBottom: 1, borderColor: "divider",
                bgcolor: "background.paper",
                flexShrink: 0,
            }}>
                <Stack direction="row" alignItems="center" gap={1}>
                    <UploadFileIcon sx={{ fontSize: 18, color: "primary.main" }} />
                    <Typography variant="subtitle2" fontWeight={700}>
                        Загрузка видео
                    </Typography>
                </Stack>
                <IconButton size="small" onClick={onClose} sx={{ color: "text.disabled" }}>
                    <CloseIcon sx={{ fontSize: 18 }} />
                </IconButton>
            </Box>

            {/* Body */}
            <Box sx={{ flex: 1, overflowY: "auto", p: 2, display: "flex", flexDirection: "column", gap: 2 }}>

                <DropZone onFiles={onFiles} />

                {/* Overall progress */}
                {busy && total > 0 && (
                    <Paper variant="outlined" sx={{
                        p: 1.5,
                        borderColor: alpha(theme.palette.info.main, 0.3),
                        bgcolor: alpha(theme.palette.info.main, 0.05),
                    }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                            <Stack direction="row" alignItems="center" gap={0.75}>
                                <CircularProgress size={12} color="info" />
                                <Typography variant="caption" color="info.main" fontWeight={600}>
                                    Загрузка…
                                </Typography>
                            </Stack>
                            <Stack direction="row" alignItems="center" gap={1}>
                                <Typography variant="caption" color="text.disabled">
                                    {done} / {total}
                                </Typography>
                                {cancellableCount > 1 && (
                                    <Tooltip title={`Отменить все (${cancellableCount})`} placement="left">
                                        <Chip
                                            label="Отменить все"
                                            size="small" color="error" variant="outlined"
                                            icon={<CancelIcon sx={{ fontSize: "12px !important" }} />}
                                            onClick={onCancelAll}
                                            sx={{
                                                height: 20, fontSize: 10, cursor: "pointer",
                                                "& .MuiChip-label": { px: "6px" },
                                                "& .MuiChip-icon": { ml: "4px" },
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
                            sx={{ height: 3, borderRadius: 99, "& .MuiLinearProgress-bar": { borderRadius: 99 } }}
                        />
                    </Paper>
                )}

                {/* Queue list */}
                {uploads.length > 0 && (
                    <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                            <Stack direction="row" alignItems="center" gap={0.75}>
                                <Typography variant="caption" color="text.disabled"
                                    sx={{ textTransform: "uppercase", letterSpacing: "0.08em" }}>
                                    Очередь ({uploads.length})
                                </Typography>
                                {errors > 0 && (
                                    <Chip label={`${errors} ошибок`} size="small" color="error"
                                        sx={{ height: 16, fontSize: 9, "& .MuiChip-label": { px: "5px" } }} />
                                )}
                            </Stack>
                            {!busy && (
                                <Typography variant="caption" color="text.disabled" onClick={onClear}
                                    sx={{
                                        cursor: "pointer", userSelect: "none",
                                        "&:hover": { color: "text.secondary" },
                                        transition: "color 0.2s",
                                    }}>
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
