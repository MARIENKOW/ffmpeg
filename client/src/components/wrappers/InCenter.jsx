import { Container, Box } from "@mui/material";

const InCenter = ({ children, style, maxWidth = "xs",}) => {
   return (
      <Container
         maxWidth={maxWidth}
         sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            p:2,
            ...style
         }}
      >
         {children}
      </Container>
   );
};

export default InCenter;
