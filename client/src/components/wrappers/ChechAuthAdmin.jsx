import Loading from "../loading/Loading";
import { AdminContext } from "../../app/(dashboard)/layout";
import { observer } from "mobx-react-lite";
import SignInAdmin from "../../app/(dashboard)/SignInAdmin";
import { useContext } from "react";

function ChechAuthAdmin({ children }) {
    const { isLoading, isAuth } = useContext(AdminContext);

    if (isLoading) return <Loading />;

    if (isAuth === false) return <SignInAdmin />;

    return children;
}

export default observer(ChechAuthAdmin);
