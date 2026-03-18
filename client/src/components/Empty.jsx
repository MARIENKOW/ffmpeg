import { Box, Typography } from "@mui/material";
import SickIcon from "@mui/icons-material/Sick";
import InCenter from "./wrappers/InCenter";

export const Empty = () => {
   return (
      <InCenter>
         <Box display={'flex'} flexDirection={'column'} alignItems={'center'} gap={2} >
            <SickIcon sx={{ width: 50, height: 50 }} color="primary" />
            <Typography
               color={"primary"}
               variant="h5"
               fontWeight={600}
               textAlign={"center"}
            >
               Тут пока что пусто.
            </Typography>
         </Box>
      </InCenter>
   );
};
