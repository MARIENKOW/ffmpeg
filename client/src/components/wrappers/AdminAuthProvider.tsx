import { createContext, useContext, useEffect } from "react";

import AdminStore from "../../store/admin-store";
export const adminStore = new AdminStore();
export const AdminContext = createContext(adminStore);

export default function AdminAuthProvider({ children }) {
    return (
        <AdminContext.Provider value={adminStore}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdminContext() {
    return useContext(AdminContext);
}
