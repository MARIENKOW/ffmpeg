"use client";

import { LinearProgress } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function GlobalLoader({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handleStart = () => setLoading(true);
        const handleStop = () => setLoading(false);

        // Monkey patch router.push
        const originalPush = router.push;
        router.push = async (...args) => {
            const target = args[0];
            if (target === pathname) {
                // переход на ту же страницу -> игнор
                return originalPush(...args);
            }
            handleStart();
            try {
                return await originalPush(...args);
            } finally {
                handleStop();
            }
        };

        // Monkey patch router.replace
        const originalReplace = router.replace;
        router.replace = async (...args) => {
            const target = args[0];
            if (target === pathname) {
                // переход на ту же страницу -> игнор
                return originalReplace(...args);
            }
            handleStart();
            try {
                return await originalReplace(...args);
            } finally {
                handleStop();
            }
        };

        return () => {
            router.push = originalPush;
            router.replace = originalReplace;
        };
    }, [router, pathname]);

    // Сбрасываем загрузку при успешной смене страницы
    useEffect(() => {
        setLoading(false);
    }, [pathname]);

    return (
        <>
            {loading && (
                <LinearProgress
                    sx={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        zIndex: 9999,
                    }}
                />
            )}
            {children}
        </>
    );
}
