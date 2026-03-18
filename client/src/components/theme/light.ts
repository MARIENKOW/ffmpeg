import { AvailableMode } from "./theme";

export const light = {
    palette: {
        mode: "light" as AvailableMode,
        primary: {
            main: "rgb(235, 17, 22)", // Indigo 500
            dark: "rgb(136, 18, 20)", // Indigo 600
            light: "rgb(255, 117, 119)", // Indigo 400
            contrastText: "#ffffff",
        },
        secondary: {
            main: "#336699", // Pink 500
            dark: "#204163", // Pink 600
            light: "#5b8fc3", // Pink 400
            contrastText: "#ffffff",
        },
        default: {
            main: "#1c1c1cff", // Pink 500
            dark: "#000000ff", // Pink 600
            light: "#393939ff", // Pink 400
            contrastText: "#ffffff",
        },
        success: {
            main: "#10b981", // Emerald 500
            dark: "#059669", // Emerald 600
            light: "#34d399", // Emerald 400
            contrastText: "#ffffff",
        },
        error: {
            main: "#ef4444", // Red 500
            dark: "#dc2626", // Red 600
            light: "#f87171", // Red 400
            contrastText: "#ffffff",
        },
        warning: {
            main: "#f59e0b", // Amber 500
            dark: "#d97706", // Amber 600
            light: "#fbda86", // Amber 400
            contrastText: "#ffffff",
        },
        info: {
            main: "#3b82f6", // Blue 500
            dark: "#2563eb", // Blue 600
            light: "#60a5fa", // Blue 400
            contrastText: "#ffffff",
        },
        background: {
            default: "#f8fafc", // Slate 50
            paper: "#dfdfdf", // White
        },
        text: {
            primary: "#0f172a", // Slate 900
            secondary: "#475569", // Slate 600
            disabled: "#94a3b8", // Slate 400
        },
        divider: "#595959", // Slate 200
        action: {
            active: "#1e293b", // Slate 800
            hover: "rgba(0,0,0,0.04)",
            selected: "rgba(0,0,0,0.08)",
            disabled: "#64748b", // Slate 500
            disabledBackground: "rgba(0,0,0,0.12)",
        },
        common: {
            black: "#0f172a", // Slate 900
            white: "#ffffff", // White
            onBackgroundChanel: "#f1f5f9",
        },
        hoverOpacity: 0.08,
        disabledOpacity: 0.38,
        focus: "rgba(99,102,241,0.12)",
        focusOpacity: 0.12,
        activatedOpacity: 0.12,
    },
};

export type ThemeConfigStructure = typeof light;
