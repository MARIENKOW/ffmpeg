// lib/get-device.ts
import { headers } from "next/headers";
import { UAParser } from "ua-parser-js";

export type DeviceType = "mobile" | "tablet" | "desktop";

export async function getDevice(): Promise<DeviceType> {
    const headersList = await headers();
    const ua = headersList.get("user-agent") ?? "";

    const parser = new UAParser(ua);
    const device = parser.getDevice();

    if (device.type === "mobile") return "mobile";
    if (device.type === "tablet") return "tablet";
    return "desktop";
}
