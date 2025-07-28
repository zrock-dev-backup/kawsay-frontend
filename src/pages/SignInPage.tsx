import React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  TextField,
  Typography,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  signInWithEmailAndPassword,
  type AuthError,
} from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useNavigate, useLocation } from "react-router-dom";

const schema = yup.object().shape({
  email: yup.string().email("Invalid email format").required("Email is required"),
  password: yup.string().required("Password is required"),
});

const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = React.useState("");

  const from = location.state?.from?.pathname || "/";

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: yup.InferType<typeof schema>) => {
    setServerError("");
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      navigate(from, { replace: true });
    } catch (error) {
      const authError = error as AuthError;
      if (
        authError.code === "auth/user-not-found" ||
        authError.code === "auth/wrong-password" ||
        authError.code === "auth/invalid-credential"
      ) {
        setServerError("Invalid email or password. Please try again.");
      } else {
        setServerError("An unexpected error occurred. Please try again later.");
      }
    }
  };

  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <Card sx={{ p: 4, mt: -8 }}>
        <Typography component="h1" variant="h4" sx={{ textAlign: "center", mb: 2 }}>
          Kawsay Sign In
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{ mt: 1 }}
        >
          {serverError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {serverError}
            </Alert>
          )}
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                autoComplete="email"
                autoFocus
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={isSubmitting}
              />
            )}
          />
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                error={!!errors.password}
                helperText={errors.password?.message}
                disabled={isSubmitting}
              />
            )}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
          </Button>
        </Box>
      </Card>
    </Container>
  );
};

export default SignInPage;
