import { Typography, Container } from "@mui/material";

const ErrorElement = ({ message = "" }) => {
    return (
        <Container
            sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 2,
                alignItems: "center",
                textAlign: "center",
            }}
            gap={2}
        >
            <Typography color={"primary.dark"} variant={"h1"}>
                Упс!
            </Typography>
            <Typography color={"primary.dark"} variant={"h4"}>
                Что-то пошло не так
            </Typography>
            {(message?.message || message) && (
                <Typography variant={"body1"} color="primary.light">
                    {message?.message || message || ""}
                </Typography>
            )}
        </Container>
    );
};

export default ErrorElement;
