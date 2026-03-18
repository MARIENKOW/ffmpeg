import { Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import DoubleArrowIcon from "@mui/icons-material/DoubleArrow";
import { enqueueSnackbar } from "notistack";
import { StyledPassword } from "../../components/form/StyledPassword";
import { StyledAlert } from "../../components/form/StyledAlert";
import { StyledLoadingButton } from "../../components/form/StyledLoadingButton";
import InCenter from "../../components/wrappers/InCenter";
import { ADMIN_PASSWORD_MAX_LENGTH } from "../../configs/validateConfig";
import { useAdminContext } from "../../components/wrappers/AdminAuthProvider";

const SignInAdmin = () => {
    const { signInAdmin } = useAdminContext();

    const {
        handleSubmit,
        register,
        setError,
        clearErrors,
        formState: { errors, isValid, isSubmitting },
    } = useForm({ mode: "onChange" });

    const handleChange = () => {
        clearErrors("root");
    };

    const onSubmit = async (data) => {
        try {
            await signInAdmin(data);
            enqueueSnackbar(`Авторизация успешна!`, { variant: "success" });
        } catch (e) {
            console.error(e);
            if (e?.response?.status === 400) {
                const errors = e?.response?.data || {};
                for (let key in errors) {
                    setError(key, { type: "server", message: errors[key] });
                }
                return;
            }
            setError("root.server", {
                type: "server",
                message: "Упс! Что-то пошло не так, попробуйте позже",
            });
        }
    };

    return (
        <InCenter>
            <Typography
                fontWeight={600}
                color={!isValid ? "secondary" : "primary"}
                sx={{ textAlign: "center", mb: 3 }}
                id="transition-modal-title"
                variant="h6"
                component="h2"
            >
                Авторизация
            </Typography>
            <form
                onChange={handleChange}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "15px",
                }}
                onSubmit={handleSubmit(onSubmit)}
            >
                <StyledPassword
                    label={"Пароль"}
                    errors={errors}
                    register={register("password", {
                        required: "обязательное поле",
                        maxLength: {
                            value: ADMIN_PASSWORD_MAX_LENGTH,
                            message: `максимум ${ADMIN_PASSWORD_MAX_LENGTH} символов`,
                        },
                    })}
                />
                {errors?.root?.server && (
                    <StyledAlert
                        severity="error"
                        variant="filled"
                        hidden={true}
                    >
                        {errors?.root?.server?.message}
                    </StyledAlert>
                )}
                <StyledLoadingButton
                    loading={isSubmitting}
                    endIcon={<DoubleArrowIcon />}
                    disabled={!isValid}
                    type="submit"
                    sx={{ mt: errors?.root?.server ? 0 : 3 }}
                    variant="contained"
                >
                    Подтвердить
                </StyledLoadingButton>
            </form>
        </InCenter>
    );
};

export default SignInAdmin;
