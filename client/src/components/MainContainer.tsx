"use server";

import { Box } from "@mui/material";
import { getDevice } from "../lib/got-device";

export async function MainContainer({ children }) {
    const device = await getDevice();
    return (
        <Box>
            <Box
                display={"flex"}
                flexDirection={"column"}
                flex={1}
                width={"100%"}
                pl={device === "desktop" ? "20px" : 0}
                pr={device === "desktop" ? "20px" : 0}
                maxWidth={1280}
                bgcolor={"background"}
                margin={"0 auto"}
            >
                {children}
            </Box>
        </Box>
    );
}
