"use client";
import { styled } from "@mui/material";
import Typography from "@mui/material/Typography";

export const StyledLink = styled(Typography)(({ theme, variant }) => ({
    ...theme,
    color: theme.palette.primary.main,
    display: "flex",
    alignItems: "center",
    fontWeight: 600,

    "&:hover": {
        color: theme.palette.primary.light,
    },
}));
