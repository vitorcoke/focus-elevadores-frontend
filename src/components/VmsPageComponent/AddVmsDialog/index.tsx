import {
  Alert,
  AppBar,
  Autocomplete,
  Box,
  Button,
  Dialog,
  Grid,
  IconButton,
  Slide,
  Snackbar,
  TextField,
  Toolbar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useControlerButtonPagesContext } from "../../../context/ControlerButtonPagesContext";
import { CloseRounded, SendRounded } from "@mui/icons-material";
import { forwardRef, useState } from "react";
import { TransitionProps } from "@mui/material/transitions";
import { api } from "../../../service";
import { VMS } from "../../../types/vms.type";
import { Condominium } from "../../../types/condominium.type";

type AddVmsDialogProps = {
  setVms: React.Dispatch<React.SetStateAction<VMS[]>>;
  condominium: Condominium[];
};

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const AddVmsDialog: React.FC<AddVmsDialogProps> = ({ setVms, condominium }) => {
  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));
  const { openDialogCreateVms, setOpenDialogCreateVms } =
    useControlerButtonPagesContext();

  const [name, setName] = useState("");
  const [server, setServer] = useState("");
  const [port, setPort] = useState<number>();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [receiver, setReceiver] = useState<number>();
  const [account, setAccount] = useState<number>();
  const [condominium_id, setCondominium_id] = useState("");

  const [openAlertSucess, setOpenAlertSucess] = useState(false);
  const [openAlertError, setOpenAlertError] = useState(false);

  const handleCloseDialog = () => {
    setOpenDialogCreateVms(false);
  };

  const handleCloseAlertSucess = () => {
    setOpenAlertSucess(false);
  };

  const handleCloseAlertError = () => {
    setOpenAlertError(false);
  };

  const handleSubmit = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    try {
      const newVms = await api.post("/vms", {
        name,
        server,
        port,
        username,
        password,
        receiver,
        account,
        condominium_id: condominium_id ? condominium_id : null,
      });
      setVms((oldVms) => [...oldVms, newVms.data]);
      setOpenAlertSucess(true);
    } catch {
      setOpenAlertError(true);
    }
  };

  return (
    <Dialog
      fullScreen
      open={openDialogCreateVms}
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

          <Box maxWidth={smDown ? "90%" : "30%"}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Nome"
                  onChange={(e) => setName(e.target.value)}
                />
              </Grid>
              <Grid item xs={8}>
                <TextField
                  required
                  fullWidth
                  label="Servidor"
                  onChange={(e) => setServer(e.target.value)}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  required
                  fullWidth
                  label="Porta"
                  type={"number"}
                  sx={{
                    "& input[type=number]::-webkit-inner-spin-button": {
                      "-webkit-appearance": "none",
                    },
                  }}
                  onChange={(e) => setPort(Number(e.target.value))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Receptor"
                  type={"number"}
                  sx={{
                    "& input[type=number]::-webkit-inner-spin-button": {
                      "-webkit-appearance": "none",
                    },
                  }}
                  onChange={(e) => setReceiver(Number(e.target.value))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Conta"
                  type={"number"}
                  sx={{
                    "& input[type=number]::-webkit-inner-spin-button": {
                      "-webkit-appearance": "none",
                    },
                  }}
                  onChange={(e) => setAccount(Number(e.target.value))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Usuário"
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Senha"
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  options={condominium}
                  getOptionLabel={(option) => option.name}
                  renderInput={(params) => (
                    <TextField {...params} label="Condomínio" fullWidth />
                  )}
                  onChange={(e, value) =>
                    setCondominium_id(value ? value._id : "")
                  }
                />
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

export default AddVmsDialog;
