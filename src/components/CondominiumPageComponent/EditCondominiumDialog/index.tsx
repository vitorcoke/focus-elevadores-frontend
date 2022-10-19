import {
  Alert,
  AppBar,
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
import {
  CloseRounded,
  EventBusy,
  SendRounded,
  SearchRounded,
} from "@mui/icons-material";
import { forwardRef, useState, useEffect } from "react";
import { TransitionProps } from "@mui/material/transitions";
import { Condominium } from "../../../types/condominium.type";
import { api } from "../../../service";
import produce from "immer";

type EditCondominiumProps = {
  condominium: Condominium;
  setCondominium: React.Dispatch<React.SetStateAction<Condominium[]>>;
};

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const EditCondominium: React.FC<EditCondominiumProps> = ({
  condominium,
  setCondominium,
}) => {
  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));
  const {
    openDialogEditCondominium,
    setOpenDialogEditCondominium,
    setCheckboxCondominium,
  } = useControlerButtonPagesContext();

  const [editCondominium, seteditCondominium] = useState(condominium);

  const [openAlertSucess, setOpenAlertSucess] = useState(false);
  const [openAlertError, setOpenAlertError] = useState(false);

  const handleCloseDialog = () => {
    setOpenDialogEditCondominium(false);
    setCheckboxCondominium([]);
  };

  const handleCloseAlertSucess = () => {
    setOpenAlertSucess(false);
  };

  const handleCloseAlertError = () => {
    setOpenAlertError(false);
  };

  useEffect(() => {
    seteditCondominium(condominium);
  }, [condominium]);

  const handleSubmit = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    try {
      await api.patch(`/condominium/${condominium._id}`, {
        name: editCondominium.name,
        cnpj: editCondominium.cnpj,
        address: editCondominium.address,
        district: editCondominium.district,
        cep: editCondominium.cep,
        complement: editCondominium.complement,
        city: editCondominium.city,
        state: editCondominium.state,
      });
      setCondominium((oldCondominium) =>
        produce(oldCondominium, (draft) => {
          const index = draft.findIndex((item) => item._id === condominium._id);
          draft[index] = editCondominium;
        })
      );
      setOpenAlertSucess(true);
    } catch {
      setOpenAlertError(true);
    }
  };

  return (
    <Dialog
      fullScreen
      open={openDialogEditCondominium}
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
                  value={editCondominium.name}
                  label="Nome"
                  fullWidth
                  onChange={(e) =>
                    seteditCondominium((prev) =>
                      produce(prev, (draft) => {
                        draft.name = e.target.value;
                      })
                    )
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  value={editCondominium.cnpj}
                  label="CNPJ"
                  fullWidth
                  onChange={(e) =>
                    seteditCondominium({
                      ...editCondominium,
                      cnpj: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <Box display="flex">
                  <TextField
                    required
                    value={editCondominium.cep}
                    label="CEP"
                    fullWidth
                    onChange={(e) =>
                      seteditCondominium({
                        ...editCondominium,
                        cep: e.target.value,
                      })
                    }
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  value={editCondominium.address}
                  label="Endereço"
                  fullWidth
                  onChange={(e) =>
                    seteditCondominium({
                      ...editCondominium,
                      address: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  value={editCondominium.district}
                  label="Bairro"
                  fullWidth
                  onChange={(e) =>
                    seteditCondominium({
                      ...editCondominium,
                      district: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Complemento"
                  value={editCondominium.complement}
                  fullWidth
                  onChange={(e) =>
                    seteditCondominium({
                      ...editCondominium,
                      complement: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  value={editCondominium.city}
                  label="Cidade"
                  fullWidth
                  onChange={(e) =>
                    seteditCondominium({
                      ...editCondominium,
                      city: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  value={editCondominium.state}
                  label="Estado"
                  fullWidth
                  onChange={(e) =>
                    seteditCondominium({
                      ...editCondominium,
                      state: e.target.value,
                    })
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

export default EditCondominium;
