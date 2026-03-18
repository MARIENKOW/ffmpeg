"use client";

import { createContext, useEffect } from "react";
import ChechAuthAdmin from "../../components/wrappers/ChechAuthAdmin";
import HeaderAdmin from "../../components/layout/HeaderAdmin";
import { Box } from "@mui/material";
import AdminAuthProvider, { adminStore } from "../../components/wrappers/AdminAuthProvider";

export default function RootLayout({ children }) {
    useEffect(() => {
        adminStore.aboutAdmin();
    }, []);

    return (
        <AdminAuthProvider>
            <ChechAuthAdmin>
                <Box display={"flex"} flexDirection={"column"} flex={1}>
                    <HeaderAdmin />
                    {children}
                </Box>
            </ChechAuthAdmin>
        </AdminAuthProvider>
    );
}
