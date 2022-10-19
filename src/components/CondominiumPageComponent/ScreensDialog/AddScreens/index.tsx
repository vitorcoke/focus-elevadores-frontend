import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  useTheme,
  useMediaQuery,
  TextField,
  Snackbar,
  Alert,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { api } from "../../../../service";
import { Banner } from "../../../../types/banner.type";
import { City } from "../../../../types/city.type";
import { CondominiumMessage } from "../../../../types/condominium-message.type";
import { Condominium } from "../../../../types/condominium.type";
import { Rss } from "../../../../types/rss.type";
import { State } from "../../../../types/state.type";

type AddScreensProps = {
  condominium: Condominium;
  setCondominium: React.Dispatch<React.SetStateAction<Condominium[]>>;
  rss: Rss[];
  banner: Banner[];
  condominiumMesseger: CondominiumMessage[];
};

const AddScreens: React.FC<AddScreensProps> = ({
  condominium,
  setCondominium,
  rss,
  banner,
  condominiumMesseger,
}) => {
  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down("md"));

  const [name, setName] = useState("");
  const [validity, setValidity] = useState("");
  const [source_rss, setSource_rss] = useState<string[]>([]);
  const [newBanner, setNewBanner] = useState("");
  const [newCondominiumMesseger, setNewCondominiumMesseger] = useState("");
  const [starttime, setStarttime] = useState<Date>();
  const [endtime, setEndtime] = useState<Date>();
  const [state, setState] = useState<State[]>([]);
  const [city, setCity] = useState<City[]>([]);
  const [stateValue, setStateValue] = useState("");
  const [cityValue, setCityValue] = useState("");

  const [openAlertSucess, setOpenAlertSucess] = useState(false);
  const [openAlertError, setOpenAlertError] = useState(false);

  useEffect(() => {
    axios
      .get("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
      .then((response) => {
        setState(response.data);
      });
  }, []);

  const handleGetCity = (state: string) => {
    axios
      .get(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios`
      )
      .then((response) => {
        setCity(response.data);
      });
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
      if (newCondominiumMesseger) {
        await api.patch(`/condominium-message/${newCondominiumMesseger}`, {
          starttime,
          endtime,
        });
      }

      const screenUpdate = await api.post("/screens", {
        name,
        validity,
        source_rss,
        banner: newBanner,
        condominium_id: condominium._id,
        condominium_message: newCondominiumMesseger,
        state: stateValue,
        city: cityValue,
      });

      setCondominium((old) => [
        ...old.map((item) =>
          item._id === screenUpdate.data.condominium_id
            ? { ...item, screens: item.screens?.concat(screenUpdate.data._id) }
            : item
        ),
      ]);

      setOpenAlertSucess(true);
    } catch {
      setOpenAlertError(true);
    }
  };

  return (
    <Box
      width="100%"
      display="flex"
      alignContent="center"
      justifyContent="center"
    >
      <Box
        component={"form"}
        p={3}
        width={smDown ? "100%" : "35%"}
        display="flex"
        flexDirection="column"
        gap={3}
        onSubmit={handleSubmit}
      >
        <TextField
          required
          label="Nome"
          fullWidth
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          required
          type="date"
          label="Validade"
          InputLabelProps={{
            shrink: true,
          }}
          fullWidth
          onChange={(e) => setValidity(e.target.value)}
        />
        <Autocomplete
          options={banner}
          getOptionLabel={(option) => option.name}
          fullWidth
          onChange={(event, newValue) => {
            setNewBanner(newValue ? newValue._id : "");
          }}
          renderInput={(params) => (
            <TextField {...params} label="Banner" fullWidth />
          )}
        />
        <Box
          display="flex"
          flexDirection="column"
          gap={3}
          border="1px solid #ab120e"
          borderRadius="8px"
          p={3}
        >
          <Autocomplete
            options={condominiumMesseger}
            getOptionLabel={(option) => option.name}
            fullWidth
            onChange={(event, newValue) => {
              setNewCondominiumMesseger(newValue ? newValue._id : "");
            }}
            renderInput={(params) => (
              <TextField {...params} label="Mensagem" fullWidth />
            )}
          />
          <Box
            display="flex"
            gap={2}
            width="100%"
            alignItems="center"
            justifyContent="center"
          >
            <TextField
              required={!!newCondominiumMesseger}
              label="Data Inicial"
              type="datetime-local"
              InputLabelProps={{
                shrink: true,
              }}
              onChange={(e) => setStarttime(new Date(e.target.value))}
              fullWidth
            />
            <Typography>ATÉ</Typography>
            <TextField
              required={!!newCondominiumMesseger}
              label="Data Final"
              type="datetime-local"
              InputLabelProps={{
                shrink: true,
              }}
              onChange={(e) => setEndtime(new Date(e.target.value))}
              fullWidth
            />
          </Box>
        </Box>

        <Box display="flex" gap={3} width="100%">
          <Autocomplete
            options={state}
            getOptionLabel={(option) => option.nome}
            fullWidth
            onChange={(event, newValue) => {
              setStateValue(newValue ? newValue.nome : "");
              if (newValue) handleGetCity(newValue.sigla);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Estado" fullWidth />
            )}
          />

          <Autocomplete
            options={city}
            getOptionLabel={(option) => option.nome}
            fullWidth
            disabled={!stateValue}
            onChange={(event, newValue) => {
              setCityValue(newValue ? newValue.nome : "");
            }}
            renderInput={(params) => (
              <TextField {...params} label="Cidade" fullWidth />
            )}
            autoComplete
          />
        </Box>

        <FormControl>
          <FormGroup row>
            {rss.map((item) => (
              <FormControlLabel
                key={item._id}
                control={
                  <Checkbox
                    onChange={(e) => {
                      const index = source_rss.indexOf(e.target.name);
                      if (e.target.checked) {
                        setSource_rss((prev) => [...prev, e.target.name]);
                      } else {
                        setSource_rss((prev) => {
                          prev.splice(index, 1);
                          return prev;
                        });
                      }
                    }}
                    name={item._id}
                  />
                }
                label={item.name}
              />
            ))}
          </FormGroup>
        </FormControl>
        <Button variant="contained" type="submit">
          Enviar
        </Button>
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
  );
};

export default AddScreens;
