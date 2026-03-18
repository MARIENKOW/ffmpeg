import Loading from "../loading/Loading";
import { observer } from "mobx-react-lite";
import SignInAdmin from "../../app/(dashboard)/SignInAdmin";
import { useAdminContext } from "./AdminAuthProvider";

function ChechAuthAdmin({ children }) {
    const { isLoading, isAuth } = useAdminContext();

    if (isLoading) return <Loading />;

    if (isAuth === false) return <SignInAdmin />;

    return children;
}

export default observer(ChechAuthAdmin);
