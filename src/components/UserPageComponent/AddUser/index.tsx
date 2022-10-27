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
import {
  CloseRounded,
  SendRounded,
  FileUploadRounded,
} from "@mui/icons-material";
import { useControlerButtonPagesContext } from "../../../context/ControlerButtonPagesContext";
import { TransitionProps } from "@mui/material/transitions";
import { forwardRef, useState } from "react";
import { Permission, User } from "../../../types/users.type";
import { api } from "../../../service";
import { Condominium } from "../../../types/condominium.type";
import { useAuthContext } from "../../../context/AuthContext";
import { Screen } from "../../../types/screens.type";
import { PatternFormat } from "react-number-format";

type AddUserProps = {
  setUser: React.Dispatch<React.SetStateAction<User[]>>;
  condominium: Condominium[];
  screens: Screen[];
};

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const AddUser: React.FC<AddUserProps> = ({ setUser, condominium, screens }) => {
  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));
  const { user } = useAuthContext();
  const { openDialogCreateUser, setOpenDialogCreateUser } =
    useControlerButtonPagesContext();

  const [openAlertSucess, setOpenAlertSucess] = useState(false);
  const [openAlertError, setOpenAlertError] = useState(false);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [condominium_id, setCondominium_id] = useState<string[]>([]);
  const [screen_id, setScreen_id] = useState<string[]>([]);
  const [permission, setPermission] = useState("");

  const handleCloseAlertSucess = () => {
    setOpenAlertSucess(false);
  };
  const handleCloseAlertError = () => {
    setOpenAlertError(false);
  };
  const handleCloseDialog = () => {
    setOpenDialogCreateUser(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const user = await api.post<User>("/users", {
        name,
        username,
        email,
        phone,
        password,
        condominium_id,
        screen_id,
        permission: parseInt(permission),
      });
      setUser((prev) => [...prev, user.data]);
      setOpenAlertSucess(true);
    } catch {
      setOpenAlertError(true);
    }
  };

  return (
    <Dialog
      fullScreen
      open={openDialogCreateUser}
      onClose={handleCloseDialog}
      TransitionComponent={Transition}
    >
      <Box component={"form"} onSubmit={handleSubmit}>
        <AppBar>
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            <IconButton onClick={handleCloseDialog}>
              <CloseRounded />
            </IconButton>
            <Button
              variant="contained"
              startIcon={<SendRounded />}
              type="submit"
            >
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
                  required
                  label="Nome"
                  fullWidth
                  onChange={(e) => setName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  label="Nome de login"
                  fullWidth
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  label="Email"
                  fullWidth
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <PatternFormat
                  required
                  label="Telefone"
                  format="(##) #####-####"
                  fullWidth
                  customInput={TextField}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
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
                  onChange={(e, value) =>
                    setCondominium_id(value.map((item) => item._id))
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Condomínio" />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Permissão</InputLabel>
                  <Select
                    required
                    value={permission}
                    label="Permissão"
                    onChange={(e) => setPermission(e.target.value as string)}
                  >
                    <MenuItem value={0}>Zelador(a)</MenuItem>
                    <MenuItem value={1}>Sindico(a)</MenuItem>
                    {user?.permission !== Permission.SINDICO && (
                      <MenuItem value={2}>Administrador(a)</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
              {permission == "0" && (
                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    options={screens}
                    getOptionLabel={(option) => option.name}
                    onChange={(e, value) =>
                      setScreen_id(value.map((item) => item._id))
                    }
                    renderInput={(params) => (
                      <TextField {...params} label="Telas" />
                    )}
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
          <Alert severity="error">Falha ao enviar</Alert>
        </Snackbar>
      </Box>
    </Dialog>
  );
};

export default AddUser;
