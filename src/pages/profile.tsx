import {
  Alert,
  Box,
  Button,
  Grid,
  Paper,
  Snackbar,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { GetServerSideProps } from "next";
import { useState } from "react";
import { withAdminAndSindicoPermission } from "../hocs";
import { PatternFormat } from "react-number-format";
import { api, getAPIClient } from "../service";
import { User } from "../types/users.type";
import AppBarLayoutPage from "../layout/AppBar";
import BaseMainLayoutPage from "../layout/BaseMain";

type ProfileProps = {
  initialUser: User;
};

const Profile: React.FC<ProfileProps> = ({ initialUser }) => {
  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));

  const [user, setUser] = useState(initialUser);
  const [password, setPassword] = useState("");

  const [openAlertSucess, setOpenAlertSucess] = useState(false);
  const [openAlertError, setOpenAlertError] = useState(false);

  const handleCloseAlertSucess = () => {
    setOpenAlertSucess(false);
  };
  const handleCloseAlertError = () => {
    setOpenAlertError(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      password
        ? await api.patch<User>(`/users/${user._id}`, {
            name: user.name,
            username: user.username,
            email: user.email,
            phone: user.phone,
            password: password,
          })
        : await api.patch<User>(`/users/${user._id}`, {
            name: user.name,
            username: user.username,
            email: user.email,
            phone: user.phone,
          });
      setOpenAlertSucess(true);
    } catch {
      setOpenAlertError(true);
    }
  };

  return (
    <AppBarLayoutPage>
      <BaseMainLayoutPage title="Meu Perfil" page="profile">
        <Box
          component="form"
          width="100%"
          height="auto"
          display="flex"
          justifyContent="center"
          p={2.5}
          onSubmit={handleSubmit}
        >
          <Box width={smDown ? "100%" : "60%"} component={Paper} p={3}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Nome"
                  value={user.name}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      name: e.target.value,
                    })
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Nome de login"
                  value={user.username}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      username: e.target.value,
                    })
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  value={user.email}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      email: e.target.value,
                    })
                  }
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <PatternFormat
                  label="Telefone"
                  value={user.phone}
                  customInput={TextField}
                  onChange={(e) =>
                    setUser({
                      ...user,
                      phone: e.target.value,
                    })
                  }
                  fullWidth
                  format="(##) #####-####"
                />
              </Grid>
              <Grid item xs={12}>
                <Alert severity="info">
                  Ultilize os campos abaixo para alterar sua senha
                </Alert>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Senha"
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" type="submit" fullWidth>
                  Salvar informações
                </Button>
              </Grid>
            </Grid>
          </Box>
          <Snackbar
            open={openAlertSucess}
            autoHideDuration={3000}
            onClose={handleCloseAlertSucess}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <Alert severity="success">Enviado com sucesso</Alert>
          </Snackbar>
          <Snackbar
            open={openAlertError}
            autoHideDuration={3000}
            onClose={handleCloseAlertError}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <Alert severity="error">Falha ao enviar</Alert>
          </Snackbar>
        </Box>
      </BaseMainLayoutPage>
    </AppBarLayoutPage>
  );
};

export default withAdminAndSindicoPermission(Profile);

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const api = getAPIClient(ctx);

  try {
    const { data } = await api.get<User>("/users/profile");
    return {
      props: {
        initialUser: data,
      },
    };
  } catch {
    return {
      props: {
        initialUser: [],
      },
    };
  }
};
