import {
   InputLabel,
   FormControl,
   InputAdornment,
   FormHelperText,
   IconButton,
} from "@mui/material";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useState } from "react";
import Visibility from "@mui/icons-material/Visibility";
import { useTheme } from "@mui/material";
import { styled } from "@mui/material";
import { FilledInput } from "@mui/material";

export const StyledFormControl = styled(FormControl)(({ theme, error }) => ({
//    ...theme,
//    "& label": {
//       color: theme.palette.form.main,
//    },
//    "& .MuiInputBase-root": {
//       background: theme.palette.background.light,

//       borderBottomColor: theme.palette.form.main,
//       "& .MuiSvgIcon-root": {
//          color: error ? theme.palette.error.main : theme.palette.form.main,
//       },
//       "& .MuiOutlinedInput-notchedOutline": {
//          borderColor: error
//             ? theme.palette.error.main
//             : theme.palette.form.main,
//       },
//       "& .MuiInputAdornment-root": {
//          "& p": {
//             color: error
//                ? theme.palette.error.main
//                : theme.palette.form.main,
//          },
//          "& .MuiSvgIcon-root": {
//             color: error
//                ? theme.palette.error.main
//                : theme.palette.form.main,
//          },
//       },
//       "&:before": {
//          borderBottomColor: error
//             ? theme.palette.error.main
//             : theme.palette.form.main,
//       },
//       "&:hover": {
//       background: theme.palette.form.contrastText,

//          borderBottomColor: theme.palette.form.main,
//          "& .MuiSvgIcon-root": {
//             color: error
//                ? theme.palette.error.main
//                : theme.palette.form.main,
//          },
//          "& .MuiOutlinedInput-notchedOutline": {
//             borderColor: error
//                ? theme.palette.error.main
//                : theme.palette.form.main,
//          },
//          "&:before": {
//             borderBottomColor: error
//                ? theme.palette.error.main
//                : theme.palette.form.main,
//             borderColor: error
//                ? theme.palette.error.main
//                : theme.palette.form.main,
//          },
//       },
//       "&.Mui-focused": {
//          background: theme.palette.form.contrastText,
//          "& .MuiSvgIcon-root": {
//             color: error
//                ? theme.palette.error.main
//                : theme.palette.primary.main,
//          },
//          "& .MuiOutlinedInput-notchedOutline": {
//             borderColor: error
//                ? theme.palette.error.main
//                : theme.palette.primary.main,
//          },
//          "& .MuiInputAdornment-root": {
//             "& p": {
//                color: error
//                   ? theme.palette.error.main
//                   : theme.palette.primary.main,
//             },
//             "& .MuiSvgIcon-root": {
//                color: error
//                   ? theme.palette.error.main
//                   : theme.palette.primary.main,
//             },
//          },
//       },
//    },
//    "& .MuiInputBase-input": {
//       color: theme.palette.form.main,
//    },
}));

export const StyledPassword = ({
   label,
   errors,
   register,
   errMessage = "incorrect data",
}) => {
   const theme = useTheme();

   const [showPassword, setShowPassword] = useState(false);

   const handleMouseDownPassword = (event) => {
      event.preventDefault();
   };
   return (
      <StyledFormControl error={!!errors[register.name]} variant="filled">
         <InputLabel htmlFor={`outlined-adornment-password-${register.name}`}>
            {label}
         </InputLabel>
         <FilledInput
            {...register}
            type={showPassword ? "text" : "password"}
            id={`outlined-adornment-password-${register.name}`}
            endAdornment={
               <InputAdornment position="end">
                  <IconButton
                     onClick={() => setShowPassword((state) => !state)}
                     onMouseDown={handleMouseDownPassword}
                     edge="end"
                  >
                     {showPassword ? (
                        <VisibilityOff color="secondary" />
                     ) : (
                        <Visibility color="secondary" />
                     )}
                  </IconButton>
               </InputAdornment>
            }
         />
         <FormHelperText>
            {errors?.[register.name] &&
               (errors?.[register.name]?.message || errMessage)}
         </FormHelperText>
      </StyledFormControl>
   );
};
