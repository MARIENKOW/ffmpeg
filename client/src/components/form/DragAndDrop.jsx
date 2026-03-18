"use client";

import { useState } from "react";
import {
    Box,
    Paper,
    Typography,
    IconButton,
    FormHelperText,
    CircularProgress,
    CardMedia,
    useTheme,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import HighlightOffTwoToneIcon from "@mui/icons-material/HighlightOffTwoTone";
import { Controller } from "react-hook-form";

function DragAndDrop({
    setError,
    clearErrors,
    control,
    rules,
    name,
    setValue,
    sx,
    imgdefault,
}) {
    const theme = useTheme();
    const [dragOver, setDragOver] = useState(false);
    const [loading, setLoading] = useState(false);
    const [imgPreview, setImagePreview] = useState(imgdefault);

    const handleDragOver = (event) => {
        event.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setDragOver(false);
        const files = event.dataTransfer.files;
        if (files && files[0]) {
            handleFileChange(files[0]);
            setValue(name, files[0], { shouldValidate: true });
        }
    };

    const handleFileChange = (file) => {
        clearErrors(name);
        setLoading(true);
        const reader = new FileReader();
        reader.onloadend = () => {
            setLoading(false);
            if (reader.result.startsWith("data:image"))
                return setImagePreview(reader.result);
            setError(name, { message: "Oops! incorrect data" });
        };
        reader.readAsDataURL(file);
    };

    const handleDelete = async () => {
        setImagePreview(null);
        setValue(name, null, { shouldValidate: true });
    };

    return (
        <Controller
            control={control}
            name={name}
            rules={rules}
            render={({ field: { onChange }, fieldState: { error } }) => (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                    }}
                >
                    {imgPreview ? (
                        <Box sx={{ position: "relative", flex: 1 }}>
                            <Box
                                sx={{ width: "100%", height: "auto", ...sx }}
                                alt="nft-image"
                                src={imgPreview}
                                component={"img"}
                            />
                            <IconButton
                                onClick={handleDelete}
                                sx={{
                                    position: "absolute",
                                    top: "0",
                                    right: "0",
                                    transform: "translate(50%,-50%)",
                                }}
                            >
                                {loading ? (
                                    <CircularProgress size="30px" />
                                ) : (
                                    <HighlightOffTwoToneIcon
                                        sx={{
                                            // bgcolor:
                                            //     theme.palette.error
                                            //         .contrastText,
                                            borderRadius: "99px",
                                            width: 30,
                                            height: 30,
                                        }}
                                        color="error"
                                        fontSize="large"
                                    />
                                )}
                            </IconButton>
                        </Box>
                    ) : (
                        <>
                            <input
                                accept="image/*"
                                style={{ display: "none" }}
                                id="raised-button-file"
                                multiple
                                type="file"
                                onChange={(event) => {
                                    const files = event.target.files;
                                    if (files && files[0]) {
                                        handleFileChange(files[0]);
                                        console.log(files[0]);
                                        onChange(files[0]);
                                    }
                                }}
                            />
                            <label
                                style={{ height: "100%" }}
                                htmlFor="raised-button-file"
                            >
                                <Paper
                                    variant="outlined"
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    sx={{
                                        flex: 1,
                                        borderColor: dragOver
                                            ? "secondary.main"
                                            : error
                                              ? "error.main"
                                              : "inherit",
                                        borderStyle: "dashed",
                                        borderWidth: "1px",
                                        padding: 3,
                                        cursor: "pointer",
                                        textAlign: "center",
                                        // background:
                                        //     theme.palette.secondary
                                        //         .dark,
                                        position: "relative",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        height: "100%",
                                        ...sx,
                                    }}
                                >
                                    <Box
                                        display="flex"
                                        justifyContent={"center"}
                                        flexDirection="column"
                                        alignItems="center"
                                    >
                                        {loading ? (
                                            <CircularProgress size="50px" />
                                        ) : (
                                            <Box>
                                                <CloudUploadIcon
                                                    color={
                                                        dragOver
                                                            ? "secondary"
                                                            : error
                                                              ? "error"
                                                              : "inherit"
                                                    }
                                                    style={{
                                                        fontSize: 60,
                                                    }}
                                                />
                                                <Typography
                                                    color={
                                                        dragOver
                                                            ? "secondary.main"
                                                            : error
                                                              ? "error.main"
                                                              : "inherit"
                                                    }
                                                >
                                                    Drag and drop an image here
                                                    or click
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>
                                </Paper>
                            </label>
                        </>
                    )}
                    {error && (
                        <FormHelperText
                            sx={{ ml: "14px", mr: "14px" }}
                            error={!!error}
                        >
                            {error && (error?.message || "incorrect data")}
                        </FormHelperText>
                    )}
                </Box>
            )}
        />
    );
}

export default DragAndDrop;
