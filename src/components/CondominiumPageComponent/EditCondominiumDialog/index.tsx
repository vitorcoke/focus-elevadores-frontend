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
import { PatternFormat } from "react-number-format";
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
  const [messageAlertError, setMessageAlertError] = useState("");
  const [openErrorIdImodulo, setOpenErrorIdImodulo] = useState(false);
  const [openErrorCnpj, setOpenErrorCnpj] = useState(false);

  const handleCloseDialog = () => {
    setOpenDialogEditCondominium(false);
    setOpenErrorCnpj(false);
    setOpenErrorIdImodulo(false);
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
        ondominium_id_imodulo: editCondominium.condominium_id_imodulo,
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
    } catch (err: any) {
      if (err.response.data.message.includes("cnpj_1 dup key")) {
        setMessageAlertError("CNPJ já cadastrado");
        setOpenErrorCnpj(true);
        setOpenAlertError(true);
      } else if (
        err.response.data.message.includes("condominium_id_imodulo_1 dup key")
      ) {
        setMessageAlertError("ID já cadastrado");
        setOpenErrorIdImodulo(true);
        setOpenAlertError(true);
      } else {
        setMessageAlertError("Erro ao criar condomínio");
        setOpenAlertError(true);
      }
    }
  };

  console.log(editCondominium.cnpj);

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
              <Grid item xs={4}>
                <TextField
                  required
                  label="ID"
                  error={openErrorIdImodulo}
                  helperText={openErrorIdImodulo && "ID já cadastrado"}
                  value={editCondominium.condominium_id_imodulo}
                  fullWidth
                  type={"number"}
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
                    seteditCondominium({
                      ...editCondominium,
                      condominium_id_imodulo: Number(e.target.value),
                    })
                  }
                />
              </Grid>
              <Grid item xs={8}>
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
                <Grid item xs={12}>
                  <PatternFormat
                    required
                    error={openErrorCnpj}
                    helperText={openErrorCnpj && "CNPJ já cadastrado"}
                    label="CNPJ"
                    customInput={TextField}
                    fullWidth
                    value={editCondominium.cnpj}
                    format="##.###.###/####-##"
                    onChange={(e) =>
                      seteditCondominium({
                        ...editCondominium,
                        cnpj: e.target.value,
                      })
                    }
                  />
                </Grid>
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
                  label="Numero/Complemento"
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
          <Alert severity="error">{messageAlertError}</Alert>
        </Snackbar>
      </Box>
    </Dialog>
  );
};

export default EditCondominium;
