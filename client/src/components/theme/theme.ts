import { dark } from "./dark";
import { light, ThemeConfigStructure } from "./light";
import { createTheme, ThemeOptions } from "@mui/material";

const THEME_CONFIG: ThemeOptions = {
    cssVariables: {
        colorSchemeSelector: "class",
        disableCssColorScheme: true,
    },
    typography: {
        fontFamily: "Roboto, Arial, sans-serif",
        fontSize: 13,
        allVariants: {
            letterSpacing: 1.2,
        },
    },

    colorSchemes: {
        light,
        dark,
    },
};

export const theme = createTheme(THEME_CONFIG);

export type AvailableMode = "light" | "dark";

export const modes = ["light", "dark"] as AvailableMode[];

export const defaultThemeMode: AvailableMode = "light";
