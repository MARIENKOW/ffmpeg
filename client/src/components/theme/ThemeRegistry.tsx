"use client";

import * as React from "react";
import { ThemeProvider, CssBaseline, useColorScheme } from "@mui/material";
import { AvailableMode, theme } from "./theme";
import { setThemeMode } from "./themeMode";

type ThemeRegistryType = {
    themeMode: AvailableMode;
    children: React.ReactNode;
};

export default function ThemeRegistry({
    themeMode,
    children,
}: ThemeRegistryType) {
    return (
        <ThemeProvider
            storageManager={null}
            defaultMode={themeMode}
            theme={theme}
            // disableTransitionOnChange
        >
            <CssBaseline enableColorScheme />
            {children}
        </ThemeProvider>
    );
}

export function useThemeContext(serverMode: AvailableMode) {
    const { mode, setMode } = useColorScheme();
    const themeMode = mode !== undefined ? mode : serverMode;
    const toggleTheme = async () => {
        const newMode = themeMode === "dark" ? "light" : "dark";
        setMode(newMode);
        await setThemeMode(newMode);
    };
    return { themeMode, toggleTheme };
}
