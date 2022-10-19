import { Box, Button, Alert, TextField, Container } from "@mui/material";
import { useForm } from "react-hook-form";
import { useAuthContext } from "../context/AuthContext";
import { GetServerSideProps } from "next";
import { parseCookies } from "nookies";
import { useState } from "react";
import Image from "next/image";
import Head from "next/head";

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
    <>
      <Head>
        <title>Login</title>
        <meta name="description" content="Minha Portaria" />
        <link rel="icon" href="/icon-minhaportaria.png" />
      </Head>
      <Container component="main" maxWidth="xs">
        <Box
          component={"form"}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          width="100%"
          height="100vh"
          gap={4}
          onSubmit={handleSubmit(handleSubmitSingin)}
        >
          <Image
            src="/logo-minhaportaria-color.png"
            alt="logo"
            layout="fixed"
            width={110}
            height={50}
            priority={true}
          />
          <TextField label="Usuário" fullWidth {...register("username")} />
          <TextField
            label="Senha"
            fullWidth
            type="password"
            {...register("password")}
          />
          {loginFailed && (
            <Alert
              variant="filled"
              severity="error"
              onClose={() => setLoginFailed(false)}
              sx={{ width: "100%" }}
            >
              Usuário ou senha incorreta
            </Alert>
          )}
          <Button variant="contained" type="submit" fullWidth>
            Enviar
          </Button>
        </Box>
      </Container>
    </>
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
