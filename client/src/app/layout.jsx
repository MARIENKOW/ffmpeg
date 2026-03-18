// "use server";

import { MainWrapper } from "../components/wrappers/MainWrapper";
import "./globals.scss";
import config from "../configs/config";
import { getThemeMode } from "../components/theme/themeMode";
import ThemeRegistry from "../components/theme/ThemeRegistry";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";

const image = config.SERVER_API + "/meta/metaLogo.png";
export const metadata = {
    title: "Adult",
    description: "",
    openGraph: {
        images: [image],
    },
};
export default async function RootLayout({ children }) {
    const themeMode = await getThemeMode();
    return (
        <html className={themeMode} lang="ua">
            <body>
                <AppRouterCacheProvider options={{ enableCssLayer: true }}>
                    <ThemeRegistry themeMode={themeMode}>
                        <MainWrapper>{children}</MainWrapper>
                    </ThemeRegistry>
                </AppRouterCacheProvider>
            </body>
        </html>
    );
}
