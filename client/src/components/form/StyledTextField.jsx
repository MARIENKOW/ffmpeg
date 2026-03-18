import { styled } from "@mui/material";
import { TextField } from "@mui/material";

export const STF = styled(TextField)(({ theme, error }) => ({
    // ...theme,
    // "& label": {
    //     color: theme.palette.form.main,
    // },
    // "& .MuiFormHelperText-root": {
    //     color: theme.palette.form.main,
    //     "&.Mui-error": {
    //         color: theme.palette.error.main,
    //     },
    // },
    // "& .MuiFilledInput-root": {
    //     background: theme.palette.background.light, //!back

    //     borderBottomColor: theme.palette.form.main,
    //     "& .MuiInputAdornment-root": {
    //         "& p": {
    //             color: error
    //                 ? theme.palette.error.main
    //                 : theme.palette.form.main,
    //         },
    //         "& .MuiSvgIcon-root": {
    //             color: error
    //                 ? theme.palette.error.main
    //                 : theme.palette.form.main,
    //         },
    //     },
    //     "&:before": {
    //         borderBottomColor: error
    //             ? theme.palette.error.main
    //             : theme.palette.form.main,
    //     },
    //     "&:hover": {
    //         borderBottomColor: theme.palette.form.main,
    //         background: theme.palette.form.contrastText,

    //         "&:before": {
    //             borderBottomColor: error
    //                 ? theme.palette.error.main
    //                 : theme.palette.form.main,
    //         },
    //     },
    //     "&.Mui-focused": {
    //         background: theme.palette.form.contrastText,

    //         "& .MuiInputAdornment-root": {
    //             "& p": {
    //                 color: error
    //                     ? theme.palette.error.main
    //                     : theme.palette.primary.main,
    //             },
    //             "& .MuiSvgIcon-root": {
    //                 color: error
    //                     ? theme.palette.error.main
    //                     : theme.palette.primary.main,
    //             },
    //         },
    //     },
    // },
    // "& .MuiFilledInput-input": {
    //     color: theme.palette.form.main,
    // },
}));


export const StyledTextField = ({
    errors,
    register,
    label,
    options,
    errMessage = "некорректное поле",
    helperMessage = "необязательное поле",
    helper = false,
}) => {
    return (
        <STF
            fullWidth
            error={!!errors[register.name]}
            {...register}
            label={label}
            {...options}
            helperText={
                errors?.[register.name]
                    ? errors?.[register.name]?.message || errMessage
                    : helper && helperMessage
            }
            variant="filled"
        />
    );
};
