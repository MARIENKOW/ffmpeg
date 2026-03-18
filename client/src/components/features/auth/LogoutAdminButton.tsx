import { Button } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAdminContext } from "../../wrappers/AdminAuthProvider";

export default function LogoutAdminButton() {
    const { logOut } = useAdminContext();
    return (
        <Button startIcon={<LogoutIcon />} variant="outlined" onClick={logOut}>
            Выход
        </Button>
    );
}
