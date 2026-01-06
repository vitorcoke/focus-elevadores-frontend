import {
  Alert,
  AppBar,
  Autocomplete,
  Box,
  Button,
  Dialog,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Slide,
  Snackbar,
  Stack,
  TextField,
  Toolbar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { CloseRounded, SendRounded } from "@mui/icons-material";
import { useControlerButtonPagesContext } from "../../../context/ControlerButtonPagesContext";
import { TransitionProps } from "@mui/material/transitions";
import { forwardRef, useState, useEffect } from "react";
import { Permission, UserType } from "../../../types/users.type";
import { api } from "../../../service";
import { CondominiumType } from "../../../types/condominium.type";
import { useAuthContext } from "../../../context/AuthContext";
import { Screen } from "../../../types/screens.type";
import { PatternFormat } from "react-number-format";

type EditUserProps = {
  userSelect: UserType;
  condominium: CondominiumType[];
  screens: Screen[];
  setUser: React.Dispatch<React.SetStateAction<UserType[]>>;
};

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const EditUser: React.FC<EditUserProps> = ({ userSelect, condominium, screens, setUser }) => {
  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));
  const { user } = useAuthContext();
  const { openDialogEditUser, setOpenDialogEditUser, setCheckboxUser } =
    useControlerButtonPagesContext();

  const [openAlertSucess, setOpenAlertSucess] = useState(false);
  const [openAlertError, setOpenAlertError] = useState(false);
  const [messageAlertError, setMessageAlertError] = useState("");
  const [openErrorEmail, setOpenErrorEmail] = useState(false);

  const [editUser, setEditUser] = useState<UserType>(userSelect);
  const [password, setPassword] = useState("");

  const handleCloseAlertSucess = () => {
    setOpenAlertSucess(false);
  };
  const handleCloseAlertError = () => {
    setOpenAlertError(false);
  };
  const handleCloseDialog = () => {
    setOpenDialogEditUser(false);
    setCheckboxUser([]);
    setOpenErrorEmail(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (password) {
        const newUser = await api.patch(`/users/${editUser._id}`, {
          name: editUser.name,
          username: editUser.username,
          email: editUser.email,
          phone: editUser.phone,
          condominium_id: editUser.condominium_id,
          screen_id: editUser.screen_id,
          password: password,
          permission: editUser.permission,
        });
        setUser((old) => {
          const index = old.findIndex((user) => user._id === editUser._id);
          old[index] = newUser.data;
          return [...old];
        });
        setOpenAlertSucess(true);
      } else {
        const newUser = await api.patch(`/users/${editUser._id}`, {
          name: editUser.name,
          username: editUser.username,
          email: editUser.email,
          phone: editUser.phone,
          condominium_id: editUser.condominium_id,
          screen_id: editUser.screen_id,
          permission: editUser.permission,
        });
        setUser((old) => {
          const index = old.findIndex((user) => user._id === editUser._id);
          old[index] = newUser.data;
          return [...old];
        });
        setOpenAlertSucess(true);
      }
    } catch (err: any) {
      if (err.response.data.message.match(/email_1 dup key/)) {
        setMessageAlertError("Email já cadastrado");
        setOpenAlertError(true);
        setOpenErrorEmail(true);
      } else {
        setMessageAlertError("Erro ao cadastrar usuário");
        setOpenAlertError(true);
      }
    }
  };

  useEffect(() => {
    setEditUser(userSelect);
  }, [userSelect]);

  return (
    <Dialog
      fullScreen
      open={openDialogEditUser}
      onClose={handleCloseDialog}
      TransitionComponent={Transition}
    >
      <Box component={"form"} onSubmit={handleSubmit}>
        <AppBar>
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <IconButton onClick={handleCloseDialog}>
              <CloseRounded />
            </IconButton>
            <Button variant="contained" startIcon={<SendRounded />} type="submit">
              Enviar
            </Button>
          </Toolbar>
        </AppBar>
        <Box
          width="100%"
          height="100vh"
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={2}
          p={3}
        >
          <Toolbar />

          <Box maxWidth={smDown ? "90%" : "30%"} flexGrow={1}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Nome"
                  value={editUser.name}
                  fullWidth
                  onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Nome de login"
                  value={editUser.username}
                  fullWidth
                  onChange={(e) => setEditUser({ ...editUser, username: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  error={openErrorEmail}
                  helperText={openErrorEmail && "Email já cadastrado"}
                  value={editUser.email}
                  fullWidth
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <PatternFormat
                  required
                  label="Telefone"
                  value={editUser.phone}
                  format="(##) #####-####"
                  fullWidth
                  customInput={TextField}
                  onChange={(e) => {
                    setEditUser({
                      ...editUser,
                      phone: e.target.value,
                    });
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Senha"
                  type="password"
                  fullWidth
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={condominium}
                  getOptionLabel={(option) => option.name}
                  value={condominium.filter((condominium) =>
                    editUser.condominium_id.includes(condominium._id)
                  )}
                  onChange={(e, value) =>
                    setEditUser({
                      ...editUser,
                      condominium_id: value.map((v) => v._id),
                    })
                  }
                  renderInput={(params) => <TextField {...params} label="Condomínios" />}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Permissão</InputLabel>
                  <Select
                    value={editUser.permission}
                    label="Permissão"
                    onChange={(e) =>
                      setEditUser({
                        ...editUser,
                        permission: e.target.value as number,
                      })
                    }
                  >
                    <MenuItem value={0}>Zelador(a)</MenuItem>
                    <MenuItem value={1}>Sindico(a)</MenuItem>
                    {user?.permission !== Permission.SINDICO && (
                      <MenuItem value={2}>Administrador(a)</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
              {editUser.permission === Permission.ZELADOR && (
                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    options={screens}
                    getOptionLabel={(option) => option.name}
                    value={screens.filter((screen) => editUser.screen_id.includes(screen._id))}
                    onChange={(e, value) =>
                      setEditUser({
                        ...editUser,
                        screen_id: value.map((v) => v._id),
                      })
                    }
                    renderInput={(params) => <TextField {...params} label="Telas" />}
                  />
                </Grid>
              )}
            </Grid>
          </Box>
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
          <Alert severity="error">{messageAlertError}</Alert>
        </Snackbar>
      </Box>
    </Dialog>
  );
};

export default EditUser;
