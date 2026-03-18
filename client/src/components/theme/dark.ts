import { ThemeConfigStructure } from "./light";
import { AvailableMode } from "./theme";

export const dark: ThemeConfigStructure = {
    palette: {
        mode: "dark" as AvailableMode,
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
            main: "#dfdfdfff", // Pink 500
            dark: "#ffffffff", // Pink 600
            light: "#9a9a9aff", // Pink 400
            contrastText: "#000000ff",
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
            default: "#1e1e1e", // Slate 900
            paper: "#1a1a1a", // Slate 800
        },
        text: {
            primary: "#f8fafc", // Slate 50
            secondary: "#cbd5e1", // Slate 300
            disabled: "#64748b", // Slate 500
        },
        divider: "#EFEFEF", // Slate 700
        action: {
            active: "#f1f5f9", // Slate 100
            hover: "rgba(255,255,255,0.08)",
            selected: "rgba(255,255,255,0.16)",
            disabled: "#475569", // Slate 600
            disabledBackground: "rgba(255,255,255,0.12)",
        },
        common: {
            black: "#0f172a", // Slate 900
            white: "#f8fafc", // Slate 50
            onBackgroundChanel: "#f1f5f9",
        },
        hoverOpacity: 0.08,
        disabledOpacity: 0.38,
        focus: "rgba(99,102,241,0.16)",
        focusOpacity: 0.12,
        activatedOpacity: 0.12,
    },
};
