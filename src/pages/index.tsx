import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { alpha, Alert, Box, Button, Container, Paper, TextField, Typography } from "@mui/material";
import { GetServerSideProps } from "next";
import Head from "next/head";
import { parseCookies } from "nookies";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuthContext } from "../context/AuthContext";

const Login: React.FC = () => {
  const { register, handleSubmit } = useForm();
  const { singIn } = useAuthContext();
  const [loginFailed, setLoginFailed] = useState(false);

  const handleSubmitSingin = async (data: any) => {
    try {
      await singIn(data);
    } catch {
      setLoginFailed(true);
    }
  };

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background:
          "radial-gradient(circle at top right, rgba(109,91,255,0.24), transparent 28%), radial-gradient(circle at bottom left, rgba(42,201,255,0.16), transparent 30%), #090d18",
      }}
    >
      <Head>
        <title>Login</title>
        <meta name="description" content="Painel Administrativo" />
        <link rel="icon" href="/icon-minhaportaria.png" />
      </Head>
      <Box
        sx={{
          position: "absolute",
          top: "-12%",
          right: "-8%",
          width: 380,
          height: 380,
          borderRadius: "50%",
          filter: "blur(120px)",
          background: "rgba(109,91,255,0.26)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "-18%",
          left: "-6%",
          width: 320,
          height: 320,
          borderRadius: "50%",
          filter: "blur(120px)",
          background: "rgba(42,201,255,0.16)",
        }}
      />
      <Container component="main" maxWidth="xs" sx={{ position: "relative", zIndex: 1 }}>
        <Box
          component="form"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          width="100%"
          minHeight="100vh"
          gap={3}
          onSubmit={handleSubmit(handleSubmitSingin)}
        >
          <Box textAlign="center">
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: 4,
                display: "grid",
                placeItems: "center",
                mx: "auto",
                mb: 2,
                background: "var(--gradient-primary)",
                boxShadow: "0 24px 54px rgba(109, 91, 255, 0.25)",
              }}
            >
              <ApartmentRoundedIcon sx={{ fontSize: 34, color: "#fff" }} />
            </Box>
            <Typography variant="h3" fontWeight={800} letterSpacing="-0.04em">
              Painel Administrativo
            </Typography>
            <Typography mt={1} color="text.secondary">
              Acesse o painel administrativo
            </Typography>
          </Box>

          <Paper
            className="glass-panel"
            sx={{
              width: "100%",
              p: 4,
              backgroundImage: "none",
              backgroundColor: alpha("#12182c", 0.76),
            }}
          >
            <Box display="flex" flexDirection="column" gap={2.5}>
              <TextField label="Usuario" fullWidth {...register("username")} />
              <TextField label="Senha" fullWidth type="password" {...register("password")} />
              {loginFailed && (
                <Alert severity="error" onClose={() => setLoginFailed(false)} sx={{ width: "100%" }}>
                  Usuario ou senha incorreta
                </Alert>
              )}
              <Button
                variant="contained"
                type="submit"
                fullWidth
                endIcon={<ArrowForwardRoundedIcon />}
              >
                Entrar
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { "focus-elevador-token": token } = parseCookies(ctx);

  if (token) {
    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
