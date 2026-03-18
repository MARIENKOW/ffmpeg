"use client";

import { Box } from "@mui/material";
import { SnackbarProvider } from "notistack";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { closeSnackbar } from "notistack";
import GlobalLoader from "./GlobalLoader";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export const MainWrapper = ({ children }) => {
    return (
        <QueryClientProvider client={queryClient}>
            <Box display={"flex"} flexDirection={"column"} flex={1}>
                <SnackbarProvider
                    action={(snackbarId) => (
                        <IconButton onClick={() => closeSnackbar(snackbarId)}>
                            <CloseIcon htmlColor="#fff" />
                        </IconButton>
                    )}
                >
                    <GlobalLoader>{children}</GlobalLoader>
                </SnackbarProvider>
            </Box>
        </QueryClientProvider>
    );
};
