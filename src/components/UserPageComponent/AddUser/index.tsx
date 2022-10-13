import {
  Alert,
  AppBar,
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
import { User } from "../../../types/users.type";
import { api } from "../../../service";

type AddUserProps = {
  setUser: React.Dispatch<React.SetStateAction<User[]>>;
};

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const AddUser: React.FC<AddUserProps> = ({ setUser }) => {
  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));
  const { openDialogCreateUser, setOpenDialogCreateUser } =
    useControlerButtonPagesContext();

  const [openAlertSucess, setOpenAlertSucess] = useState(false);
  const [openAlertError, setOpenAlertError] = useState(false);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        password,
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
                <TextField
                  required
                  label="Senha"
                  type="password"
                  fullWidth
                  onChange={(e) => setPassword(e.target.value)}
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
                    <MenuItem value={2}>Administrador(a)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
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
