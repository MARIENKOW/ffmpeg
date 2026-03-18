import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import { ContainerComponent } from "../wrappers/ContainerComponent";
import ThemeChange from "../features/ThemeChange";
import LogoutAdminButton from "../features/auth/LogoutAdminButton";

export default function HeaderAdmin() {
    return (
        <Box mb={2}>
            <AppBar style={{ backgroundColor: "Background" }} position="static">
                <ContainerComponent sx={{ p: { xs: 0 } }}>
                    <Toolbar
                        sx={{
                            display: "flex",
                            justifyContent: "end",
                            alignItems: "center",
                            gap: 3,
                        }}
                    >
                        <ThemeChange />
                        <LogoutAdminButton />
                    </Toolbar>
                </ContainerComponent>
            </AppBar>
        </Box>
    );
}
