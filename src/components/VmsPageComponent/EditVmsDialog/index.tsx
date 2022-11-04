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

type EditVmsDialogProps = {
  vms: VMS;
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

const EditVmsDialog: React.FC<EditVmsDialogProps> = ({ vms, condominium }) => {
  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));
  const { openDialogEditVms, setOpenDialogEditVms, setCheckboxVms } =
    useControlerButtonPagesContext();

  const [editVms, setEditVms] = useState<VMS>(vms);

  const [openAlertSucess, setOpenAlertSucess] = useState(false);
  const [openAlertError, setOpenAlertError] = useState(false);

  const handleCloseDialog = () => {
    setOpenDialogEditVms(false);
    setCheckboxVms([]);
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
      await api.patch(`/vms/${editVms._id}`, {
        name: editVms.name,
        server: editVms.server,
        port: editVms.port,
        username: editVms.username,
        password: editVms.password,
        receiver: editVms.receiver,
        account: editVms.account,
        condominium_id: editVms.condominium_id,
      });
      setOpenAlertSucess(true);
    } catch {
      setOpenAlertError(true);
    }
  };

  return (
    <Dialog
      fullScreen
      open={openDialogEditVms}
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
                  value={editVms.name}
                  onChange={(e) =>
                    setEditVms({ ...editVms, name: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={8}>
                <TextField
                  required
                  fullWidth
                  label="Servidor"
                  value={editVms.server}
                  onChange={(e) =>
                    setEditVms({ ...editVms, server: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  required
                  fullWidth
                  label="Porta"
                  type={"number"}
                  value={editVms.port}
                  sx={{
                    "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                      {
                        display: "none",
                      },
                    "& input[type=number]": {
                      MozAppearance: "textfield",
                    },
                  }}
                  onChange={(e) =>
                    setEditVms({ ...editVms, port: Number(e.target.value) })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Receptor"
                  type={"number"}
                  value={editVms.receiver}
                  sx={{
                    "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                      {
                        display: "none",
                      },
                    "& input[type=number]": {
                      MozAppearance: "textfield",
                    },
                  }}
                  onChange={(e) =>
                    setEditVms({ ...editVms, receiver: Number(e.target.value) })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Conta"
                  type={"number"}
                  value={editVms.account}
                  sx={{
                    "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                      {
                        display: "none",
                      },
                    "& input[type=number]": {
                      MozAppearance: "textfield",
                    },
                  }}
                  onChange={(e) =>
                    setEditVms({ ...editVms, account: Number(e.target.value) })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Usuário"
                  value={editVms.username}
                  onChange={(e) =>
                    setEditVms({ ...editVms, username: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Senha"
                  type="password"
                  onChange={(e) =>
                    setEditVms({ ...editVms, password: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  options={condominium}
                  getOptionLabel={(option) => option.name}
                  value={condominium.find(
                    (condominium) => condominium._id === editVms.condominium_id
                  )}
                  renderInput={(params) => (
                    <TextField {...params} label="Condomínio" fullWidth />
                  )}
                  onChange={(e, value) =>
                    setEditVms({ ...editVms, condominium_id: value?.id })
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

export default EditVmsDialog;
