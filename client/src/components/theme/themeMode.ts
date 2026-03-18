"use server";

import { AvailableMode, defaultThemeMode, modes } from "./theme";
import { cookies } from "next/headers";

export async function getThemeMode() {
    const cookieStore = await cookies();

    const cookieValue = cookieStore.get("theme")?.value || defaultThemeMode;

    const mode: AvailableMode = modes.includes(cookieValue as AvailableMode)
        ? (cookieValue as AvailableMode)
        : defaultThemeMode;

    return mode;
}

export async function setThemeMode(theme: AvailableMode) {
    const cookieStore = await cookies();

    cookieStore.set("theme", theme, {
        httpOnly: false, // Allow client to read it
        maxAge: 60 * 60 * 24 * 365,
    });
}
