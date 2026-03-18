"use client";
import { Box, styled, Switch } from "@mui/material";
import { useThemeContext } from "../theme/ThemeRegistry";
import ModeNightIcon from "@mui/icons-material/ModeNight";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { AvailableMode } from "../theme/theme";

const MaterialUISwitch = styled(Switch)(({ theme }) => ({
    width: 45,
    height: 25,
    padding: 0,
    "& .MuiSwitch-switchBase": {
        top: "50%",
        transform: "translate(-3px,-50%)",
        // transform: "translate(8px,-50%)",
        "&.Mui-checked": {
            transform: "translate(17px,-50%)",
            // transform: "translate(37px,-50%)",

            "& + .MuiSwitch-track": {
                opacity: 1,
            },
        },
    },
    "& .MuiSwitch-thumb": {
        // width: 32,
        // height: 32,
    },
    "& .MuiSwitch-track": {
        opacity: 0.1,
        borderRadius: 99,
    },
}));

export default function ThemeChange({
    serverMode,
}: {
    serverMode: AvailableMode;
}) {
    const { themeMode, toggleTheme } = useThemeContext(serverMode);

    return (
        <>
            <MaterialUISwitch
                checked={themeMode === "dark"}
                icon={
                    <Box
                        display={"flex"}
                        alignItems="center"
                        justifyContent="center"
                        height="100%"
                    >
                        <LightModeOutlinedIcon
                            fontSize="small"
                            sx={{
                                color: "text.primary",
                                width: 15,
                                height: 15,
                            }}
                        />
                    </Box>
                }
                checkedIcon={
                    <Box
                        display={"flex"}
                        alignItems="center"
                        justifyContent="center"
                        height="100%"
                    >
                        <ModeNightIcon
                            fontSize="small"
                            sx={{
                                color: "text.primary",
                                width: 15,
                                height: 15,
                            }}
                        />
                    </Box>
                }
                size="medium"
                onChange={toggleTheme}
            />
        </>
    );
}
