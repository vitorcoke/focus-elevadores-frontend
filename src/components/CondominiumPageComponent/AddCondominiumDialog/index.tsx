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
import { CloseRounded, SendRounded, SearchRounded } from "@mui/icons-material";
import { forwardRef, useState, Dispatch, SetStateAction } from "react";
import { TransitionProps } from "@mui/material/transitions";
import { Condominium } from "../../../types/condominium.type";
import { api } from "../../../service";
import { PatternFormat } from "react-number-format";
import axios from "axios";

type AddCondominiumProps = {
  setCondominium: Dispatch<SetStateAction<Condominium[]>>;
};

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const AddCondominium: React.FC<AddCondominiumProps> = ({ setCondominium }) => {
  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));
  const { openDialogCreateCondominium, setOpenDialogCreateCondominium } =
    useControlerButtonPagesContext();

  const [name, setName] = useState("");
  const [condominium_id_imodulo, setCondominiumIdImodulo] = useState<Number>();
  const [cnpj, setCnpj] = useState("");
  const [cep, setCep] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [complement, setComplement] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const validationCep = async () => {
    try {
      const { data } = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
      if (data.erro) return alert("CEP não encontrado");
      setAddress(data.logradouro);
      setDistrict(data.bairro);
      setComplement(data.complemento);
      setCity(data.localidade);
      setState(data.uf);
    } catch (error) {
      alert("CEP invalido");
    }
  };

  const [openAlertSucess, setOpenAlertSucess] = useState(false);
  const [openAlertError, setOpenAlertError] = useState(false);
  const [messageAlertError, setMessageAlertError] = useState("");
  const [openErrorIdImodulo, setOpenErrorIdImodulo] = useState(false);
  const [openErrorCnpj, setOpenErrorCnpj] = useState(false);

  const handleCloseDialog = () => {
    setOpenDialogCreateCondominium(false);
    setOpenErrorCnpj(false);
    setOpenErrorIdImodulo(false);
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
      const createCondominium = await api.post("/condominium", {
        name,
        condominium_id_imodulo,
        cnpj,
        address,
        district,
        cep,
        complement,
        city,
        state,
      });
      setCondominium((old) => [...old, createCondominium.data]);
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

  return (
    <Dialog
      fullScreen
      open={openDialogCreateCondominium}
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
                  error={openErrorIdImodulo}
                  helperText={openErrorIdImodulo && "ID já cadastrado"}
                  label="ID"
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
                    setCondominiumIdImodulo(Number(e.target.value))
                  }
                />
              </Grid>
              <Grid item xs={8}>
                <TextField
                  required
                  label="Nome"
                  fullWidth
                  onChange={(e) => setName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <PatternFormat
                  required
                  error={openErrorCnpj}
                  helperText={openErrorCnpj && "CNPJ já cadastrado"}
                  label="CNPJ"
                  customInput={TextField}
                  fullWidth
                  format="##.###.###/####-##"
                  onChange={(e) => setCnpj(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <Box display="flex">
                  <TextField
                    required
                    label="CEP"
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
                    onChange={(e) => setCep(e.target.value)}
                  />
                  <IconButton onClick={validationCep}>
                    <SearchRounded />
                  </IconButton>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  value={address}
                  label="Endereço"
                  fullWidth
                  onChange={(e) => setAddress(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  value={district}
                  label="Bairro"
                  fullWidth
                  onChange={(e) => setDistrict(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Numero/Complemento"
                  fullWidth
                  onChange={(e) => setComplement(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  value={city}
                  label="Cidade"
                  fullWidth
                  onChange={(e) => setCity(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  value={state}
                  label="Estado"
                  fullWidth
                  onChange={(e) => setState(e.target.value)}
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

export default AddCondominium;
