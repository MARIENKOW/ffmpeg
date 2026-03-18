"use client";

import AdminStore from "../../store/admin-store";
import { createContext, useEffect } from "react";
export const adminStore = new AdminStore();
export const AdminContext = createContext(adminStore);
import ChechAuthAdmin from "../../components/wrappers/ChechAuthAdmin";
import HeaderAdmin from "../../components/layout/HeaderAdmin";
import { Box } from "@mui/material";

export default function RootLayout({ children }) {
    useEffect(() => {
        adminStore.aboutAdmin();
    }, []);

    return (
        <AdminContext.Provider value={adminStore}>
            <ChechAuthAdmin>
                <Box display={"flex"} flexDirection={"column"} flex={1}>
                    <HeaderAdmin />
                    {children}
                </Box>
            </ChechAuthAdmin>
        </AdminContext.Provider>
    );
}
