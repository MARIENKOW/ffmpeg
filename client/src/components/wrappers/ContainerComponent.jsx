import { Container } from "@mui/material";

export const ContainerComponent = ({ children, sx }) => {
    return (
        <Container
            maxWidth={"lg"}
            sx={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
                p: { xs: 2 },
                margin: "0 auto !important",
                ...sx,
            }}
        >
            {children}
        </Container>
    );
};
