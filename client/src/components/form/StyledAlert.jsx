import { Alert, styled } from "@mui/material";

export const StyledAlert = styled(Alert)(({theme})=>({
   ...theme,
   '&.MuiAlert-filledError':{
      background:theme.palette.alert.main,
      color:theme.palette.alert.contrastText,
      '& .MuiAlert-icon':{
         color:theme.palette.alert.light,
      }
   }
}))