import { useRef, useState, useCallback } from "react";
import { Box, Typography, Paper, useTheme, alpha } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

export function DropZone({ onFiles }) {
    const theme    = useTheme();
    const inputRef = useRef();
    const [dragging, setDragging] = useState(false);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setDragging(false);
        const files = Array.from(e.dataTransfer.files).filter((f) =>
            f.type.startsWith("video/")
        );
        if (files.length) onFiles(files);
    }, [onFiles]);

    return (
        <Paper
            variant="outlined"
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current.click()}
            sx={{
                p: 3, display: "flex", flexDirection: "column",
                alignItems: "center", gap: 1.5, cursor: "pointer",
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

            <Box sx={{
                width: 52, height: 52, borderRadius: 2,
                bgcolor: dragging
                    ? alpha(theme.palette.primary.main, 0.1)
                    : alpha(theme.palette.action.active, 0.04),
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s ease",
            }}>
                <CloudUploadIcon sx={{
                    fontSize: 26,
                    color: dragging ? "primary.main" : "text.disabled",
                    transition: "color 0.2s",
                }} />
            </Box>

            <Box textAlign="center">
                <Typography variant="body2"
                    color={dragging ? "primary" : "text.secondary"}
                    fontWeight={500}>
                    {dragging ? "Отпустите для загрузки" : "Перетащите видео или нажмите"}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                    MP4, WebM, MOV · несколько файлов
                </Typography>
            </Box>
        </Paper>
    );
}
