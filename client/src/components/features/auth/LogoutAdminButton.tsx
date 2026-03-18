import { Button } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useContext } from "react";
import { AdminContext } from "../../../app/(dashboard)/layout";

export default function LogoutAdminButton() {
    const { logOut } = useContext(AdminContext);
    return (
        <Button startIcon={<LogoutIcon />} variant="outlined" onClick={logOut}>
            Выход
        </Button>
    );
}
