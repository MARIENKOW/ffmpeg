import { Box, Typography, Paper, LinearProgress, CircularProgress, Button, Tooltip, useTheme, alpha } from "@mui/material";
import CloudUploadIcon  from "@mui/icons-material/CloudUpload";
import CheckCircleIcon  from "@mui/icons-material/CheckCircle";
import ErrorIcon        from "@mui/icons-material/Error";
import { STATUS }       from "./constants";
import { pluralRu }     from "./helpers";

export function UploadTriggerButton({ uploads, onClick }) {
    const theme = useTheme();

    const total   = uploads.length;
    const done    = uploads.filter((u) => u.status === STATUS.DONE).length;
    const errors  = uploads.filter((u) => u.status === STATUS.ERROR).length;
    const active  = uploads.filter((u) => u.status === STATUS.UPLOADING);
    const waiting = uploads.filter((u) => u.status === STATUS.WAITING).length;
    const busy    = active.length > 0 || waiting > 0;

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

    const allDone  = done === total && errors === 0;
    const hasError = errors > 0 && !busy;
    const tone     = allDone ? "success" : hasError ? "error" : "info";
    const c        = theme.palette[tone];

    return (
        <Tooltip title="Открыть очередь загрузки" placement="bottom">
            <Paper
                variant="outlined"
                onClick={onClick}
                sx={{
                    px: 1.5, py: 0.75,
                    display: "inline-flex", alignItems: "center", gap: 1.5,
                    cursor: "pointer", borderRadius: 2,
                    borderColor: alpha(c.main, 0.3),
                    bgcolor: alpha(c.main, 0.07),
                    transition: "all 0.2s ease",
                    userSelect: "none",
                    "&:hover": { borderColor: c.main, bgcolor: alpha(c.main, 0.13) },
                }}
            >
                <Box sx={{
                    width: 30, height: 30, borderRadius: 1,
                    bgcolor: alpha(c.main, 0.12),
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                    {busy
                        ? <CircularProgress size={14} sx={{ color: c.main }} />
                        : allDone
                            ? <CheckCircleIcon sx={{ fontSize: 16, color: "success.main" }} />
                            : <ErrorIcon sx={{ fontSize: 16, color: "error.main" }} />
                    }
                </Box>

                <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" fontWeight={700} color={`${tone}.main`}
                        display="block" lineHeight={1.3} noWrap>
                        {busy
                            ? `Загружается ${active.length} из ${total}`
                            : allDone
                                ? `Готово · ${done} файл${pluralRu(done)}`
                                : `${done} из ${total} · ${errors} ошибок`}
                    </Typography>
                    <Typography variant="caption" color="text.disabled"
                        display="block" lineHeight={1.3} noWrap>
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
                                height: 3, borderRadius: 99,
                                bgcolor: alpha(c.main, 0.15),
                                "& .MuiLinearProgress-bar": { borderRadius: 99 },
                            }}
                        />
                    </Box>
                )}
            </Paper>
        </Tooltip>
    );
}
