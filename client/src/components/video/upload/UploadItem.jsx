import {
    Box, Typography, Stack, Paper, LinearProgress,
    CircularProgress, IconButton, Chip, Tooltip, useTheme, alpha,
} from "@mui/material";
import CloseIcon        from "@mui/icons-material/Close";
import VideoFileIcon    from "@mui/icons-material/VideoFile";
import CheckCircleIcon  from "@mui/icons-material/CheckCircle";
import ErrorIcon        from "@mui/icons-material/Error";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import CancelIcon       from "@mui/icons-material/Cancel";
import BlockIcon        from "@mui/icons-material/Block";
import { STATUS, isCancellable, isFinished } from "./constants";
import { formatBytes } from "./helpers";

export function UploadItem({ item, onRemove, onCancel }) {
    const theme = useTheme();

    const cfgMap = {
        [STATUS.WAITING]: {
            color: theme.palette.text.disabled,
            icon: <HourglassTopIcon sx={{ fontSize: 14 }} />,
            label: "В очереди", chip: "default", bar: "inherit",
        },
        [STATUS.UPLOADING]: {
            color: theme.palette.info.main,
            icon: <CircularProgress size={10} sx={{ color: theme.palette.info.main }} />,
            label: `${item.progress}%`, chip: "info", bar: "info",
        },
        [STATUS.DONE]: {
            color: theme.palette.success.main,
            icon: <CheckCircleIcon sx={{ fontSize: 14 }} />,
            label: "Готово", chip: "success", bar: "success",
        },
        [STATUS.ERROR]: {
            color: theme.palette.error.main,
            icon: <ErrorIcon sx={{ fontSize: 14 }} />,
            label: "Ошибка", chip: "error", bar: "error",
        },
        [STATUS.CANCELLED]: {
            color: theme.palette.text.disabled,
            icon: <BlockIcon sx={{ fontSize: 14 }} />,
            label: "Отменено", chip: "default", bar: "inherit",
        },
    };
    const cfg = cfgMap[item.status];

    return (
        <Paper
            variant="outlined"
            sx={{
                p: 1.5,
                display: "flex", alignItems: "center", gap: 1.5,
                borderColor: alpha(cfg.color, 0.25),
                bgcolor: alpha(cfg.color, 0.04),
                opacity: item.status === STATUS.CANCELLED ? 0.55 : 1,
                transition: "border-color 0.25s, background-color 0.25s, opacity 0.25s",
                animation: "slideIn 0.25s ease",
                "@keyframes slideIn": {
                    from: { opacity: 0, transform: "translateY(-6px)" },
                    to:   { opacity: 1, transform: "translateY(0)" },
                },
            }}
        >
            <Box sx={{
                width: 34, height: 34, borderRadius: 1, flexShrink: 0,
                bgcolor: alpha(cfg.color, 0.1),
                display: "flex", alignItems: "center", justifyContent: "center",
            }}>
                <VideoFileIcon sx={{ fontSize: 17, color: cfg.color }} />
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={0.5}>
                    <Typography variant="caption" noWrap
                        sx={{ color: "text.primary", fontWeight: 500, maxWidth: "58%", display: "block" }}>
                        {item.file.name}
                    </Typography>
                    <Chip size="small" color={cfg.chip} icon={cfg.icon} label={cfg.label} sx={{
                        height: 20, fontSize: 10, fontWeight: 600,
                        "& .MuiChip-icon": { fontSize: 12, ml: "4px" },
                        "& .MuiChip-label": { px: "6px" },
                    }} />
                </Stack>

                <LinearProgress
                    variant="determinate"
                    value={item.status === STATUS.DONE || item.status === STATUS.ERROR ? 100 : item.progress}
                    color={cfg.bar}
                    sx={{
                        height: 3, borderRadius: 99,
                        bgcolor: alpha(cfg.color, 0.1),
                        "& .MuiLinearProgress-bar": {
                            borderRadius: 99,
                            boxShadow: item.status === STATUS.UPLOADING
                                ? `0 0 6px ${alpha(cfg.color, 0.5)}`
                                : "none",
                        },
                    }}
                />

                <Typography variant="caption" color="text.disabled" sx={{ display: "block", mt: 0.25 }}>
                    {formatBytes(item.file.size)}
                    {item.status === STATUS.UPLOADING && item.speed > 0
                        ? ` · ${formatBytes(item.speed)}/s`
                        : ""}
                </Typography>
            </Box>

            {isCancellable(item.status) && (
                <Tooltip title="Отменить" placement="left">
                    <IconButton size="small" onClick={() => onCancel(item.id)} sx={{
                        flexShrink: 0, color: "text.disabled",
                        "&:hover": { color: "error.main" },
                        transition: "color 0.2s",
                    }}>
                        <CancelIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                </Tooltip>
            )}

            {isFinished(item.status) && (
                <IconButton size="small" onClick={() => onRemove(item.id)} sx={{
                    flexShrink: 0, color: "text.disabled",
                    "&:hover": { color: "text.secondary" },
                }}>
                    <CloseIcon sx={{ fontSize: 14 }} />
                </IconButton>
            )}
        </Paper>
    );
}
