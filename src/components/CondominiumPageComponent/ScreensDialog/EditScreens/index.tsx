import dayjs from "dayjs";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  Snackbar,
  TextField,
  useMediaQuery,
  useTheme,
  Autocomplete,
  Typography,
  Dialog,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useControlerButtonPagesContext } from "../../../../context/ControlerButtonPagesContext";
import { api } from "../../../../service";
import { Screen } from "../../../../types/screens.type";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Condominium } from "../../../../types/condominium.type";
import { Rss } from "../../../../types/rss.type";
import { City } from "../../../../types/city.type";
import { State } from "../../../../types/state.type";
import { Banner } from "../../../../types/banner.type";
import { CondominiumMessage } from "../../../../types/condominium-message.type";
import { useAuthContext } from "../../../../context/AuthContext";
import { Permission } from "../../../../types/users.type";
import axios from "axios";

type EditScreensProps = {
  condominium: Condominium;
  setCondominium: React.Dispatch<React.SetStateAction<Condominium[]>>;
  rss: Rss[];
  banner: Banner[];
  condominiumMesseger: CondominiumMessage[];
  setCondominiumMesseger: React.Dispatch<
    React.SetStateAction<CondominiumMessage[]>
  >;
};

const EditScreens: React.FC<EditScreensProps> = ({
  condominium,
  setCondominium,
  rss,
  banner,
  condominiumMesseger,
  setCondominiumMesseger,
}) => {
  const theme = useTheme();
  const mdDown = useMediaQuery(theme.breakpoints.down("md"));

  const { user } = useAuthContext();

  const { checkboxScreens } = useControlerButtonPagesContext();

  const [screenCondominium, setScreenCondominium] = useState<Screen>({
    _id: "",
    name: "",
    validity: "",
    source_rss: [],
    condominium_message: [],
    banner: "",
    state: "",
    city: "",
    vms_camera: [],
  });

  const [state, setState] = useState<State[]>([]);
  const [city, setCity] = useState<City[]>([]);
  const [stateValue, setStateValue] = useState("");
  const [cityValue, setCityValue] = useState("");
  const [messege_id, setMessegeId] = useState("");
  const [rssId, setRssId] = useState("");
  const [rssScreensId, setRssScreensId] = useState<string[]>([]);

  const [openAlertSucess, setOpenAlertSucess] = useState(false);
  const [openAlertError, setOpenAlertError] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleCloseAlertSucess = () => {
    setOpenAlertSucess(false);
  };

  const handleCloseAlertError = () => {
    setOpenAlertError(false);
  };

  useEffect(() => {
    checkboxScreens.map((id) => {
      api
        .get(`/screens/${id}`)
        .then((response) => setScreenCondominium(response.data));
    });
  }, [checkboxScreens]);

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

  const handleSubmit = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    try {
      await api.patch(`/screens/${screenCondominium._id}`, {
        name: screenCondominium.name,
        banner: screenCondominium.banner,
        source_rss: screenCondominium.source_rss,
        condominium_message: screenCondominium.condominium_message,
        state: stateValue ? stateValue : screenCondominium.state,
        city: cityValue ? cityValue : screenCondominium.city,
      });
      await api.patch(`/source-rss/${rssId}`, {
        screen_id: rssScreensId.concat(screenCondominium._id),
      });
      await api.delete(`/condominium-message/screen/${screenCondominium._id}`);
      condominiumMesseger.map(async (messege) => {
        if (screenCondominium.condominium_message?.includes(messege._id)) {
          await api.patch(`/condominium-message/${messege._id}`, {
            starttime: messege.starttime,
            endtime: messege.endtime,
          });
        }
      });
      setOpenAlertSucess(true);
    } catch {
      setOpenAlertError(true);
    }
  };

  const handleSubmitNewMessage = async () => {
    try {
      const newScreen = await api.patch(`/screens/${screenCondominium._id}`, {
        condominium_message:
          screenCondominium.condominium_message?.concat(messege_id),
      });
      condominiumMesseger.map(async (messege) => {
        if (messege._id === messege_id) {
          await api.patch(`/condominium-message/${messege._id}`, {
            starttime: messege.starttime,
            endtime: messege.endtime,
            screen_id: condominiumMesseger
              .find((item) => item._id === messege._id)
              ?.screen_id?.concat(screenCondominium._id),
          });
        }
      });
      setScreenCondominium(newScreen.data);
      setOpenAlertSucess(true);
    } catch {
      setOpenAlertError(true);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/screens/${screenCondominium._id}`);
      await api.delete(
        `/condominium/${condominium._id}/screen/${screenCondominium._id}`
      );
      await api.delete(`/condominium-message/screen/${screenCondominium._id}`);
      await api.delete(`/source-rss/screen/${screenCondominium._id}`);
      setCondominium((old) => [
        ...old.map((item) =>
          item._id === condominium._id
            ? {
                ...item,
                screens: item.screens?.filter(
                  (item) => item !== screenCondominium._id
                ),
              }
            : item
        ),
      ]);
      setOpenAlertSucess(true);
    } catch {
      setOpenAlertError(true);
    }
  };

  const handleDeleteMesseger = async (id: string) => {
    try {
      const newScreenCondominium = await api.patch(
        `/screens/${screenCondominium._id}`,
        {
          condominium_message: screenCondominium.condominium_message?.filter(
            (item) => item !== id
          ),
        }
      );

      setScreenCondominium(newScreenCondominium.data);

      setOpenAlertSucess(true);
    } catch {
      setOpenAlertError(true);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        width="100%"
        display="flex"
        alignContent="center"
        justifyContent="center"
      >
        <Box
          component={"form"}
          p={3}
          width={mdDown ? "100%" : "45%"}
          display="flex"
          flexDirection="column"
          gap={3}
          onSubmit={handleSubmit}
        >
          <TextField
            label="Nome"
            fullWidth
            value={screenCondominium.name}
            onChange={(e) =>
              setScreenCondominium({
                ...screenCondominium,
                name: e.target.value,
              })
            }
            helperText={`${screenCondominium.name.length}/30`}
            inputProps={{ maxLength: 30 }}
          />

          {user?.permission === Permission.ADMIN &&
            screenCondominium.banner && (
              <Autocomplete
                options={banner}
                getOptionLabel={(option) => option.name}
                value={banner.find(
                  (item) => item._id === screenCondominium.banner
                )}
                fullWidth
                onChange={(event, newValue) => {
                  setScreenCondominium({
                    ...screenCondominium,
                    banner: newValue ? newValue._id : "",
                  });
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Banner" fullWidth />
                )}
              />
            )}

          {user?.permission === Permission.ADMIN &&
            !screenCondominium.banner && (
              <Autocomplete
                options={banner}
                getOptionLabel={(option) => option.name}
                fullWidth
                onChange={(event, newValue) => {
                  setScreenCondominium({
                    ...screenCondominium,
                    banner: newValue ? newValue._id : "",
                  });
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Banner" fullWidth />
                )}
              />
            )}

          <Button variant="contained" onClick={() => setOpenDialog(true)}>
            Ver mensagens
          </Button>

          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            fullWidth
            maxWidth="md"
          >
            <Box p="20px 25px 0px 25px" width="56rem">
              <Alert severity="success">Mensagens cadastradas</Alert>
            </Box>
            {screenCondominium.condominium_message &&
              screenCondominium.condominium_message
                .filter((id) => {
                  if (condominiumMesseger.find((item) => item._id === id)) {
                    return true;
                  }
                })
                .map((idMessage, index) => {
                  return (
                    <Box key={index} width="56rem" p={3}>
                      <Box
                        display="flex"
                        gap={2}
                        border="1px solid #ab120e"
                        borderRadius="8px"
                        p={3}
                      >
                        <Autocomplete
                          options={condominiumMesseger}
                          getOptionLabel={(option) => option.name}
                          value={condominiumMesseger.find(
                            (item) => item._id === idMessage
                          )}
                          onChange={(event, newValue) => {
                            setScreenCondominium((old) => ({
                              ...old,
                              condominium_message: old.condominium_message?.map(
                                (item) =>
                                  item === idMessage
                                    ? newValue
                                      ? newValue._id
                                      : ""
                                    : item
                              ),
                            }));
                          }}
                          fullWidth
                          renderInput={(params) => (
                            <TextField {...params} label="Mensagem" fullWidth />
                          )}
                        />
                        <Box
                          display="flex"
                          gap={1}
                          width="100%"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <TextField
                            label="Data Inicial"
                            type="datetime-local"
                            value={dayjs(
                              condominiumMesseger.find(
                                (item) => item._id === idMessage
                              )?.starttime
                            ).format("YYYY-MM-DDTHH:mm")}
                            onChange={(e) => {
                              setCondominiumMesseger((old) => [
                                ...old.map((item) =>
                                  item._id === idMessage
                                    ? {
                                        ...item,
                                        starttime: new Date(e.target.value),
                                      }
                                    : item
                                ),
                              ]);
                            }}
                            InputLabelProps={{
                              shrink: true,
                            }}
                            fullWidth
                          />
                          <Typography>ATÉ</Typography>
                          <TextField
                            label="Data Final"
                            type="datetime-local"
                            value={dayjs(
                              condominiumMesseger.find(
                                (item) => item._id === idMessage
                              )?.endtime
                            ).format("YYYY-MM-DDTHH:mm")}
                            onChange={(e) => {
                              setCondominiumMesseger((old) => [
                                ...old.map((item) =>
                                  item._id === idMessage
                                    ? {
                                        ...item,
                                        endtime: new Date(e.target.value),
                                      }
                                    : item
                                ),
                              ]);
                            }}
                            InputLabelProps={{
                              shrink: true,
                            }}
                            fullWidth
                          />
                        </Box>
                        <Box display="flex" justifyContent="end" gap={2}>
                          <Button
                            variant="contained"
                            onClick={() => handleDeleteMesseger(idMessage)}
                          >
                            Excluir
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
            <Box px={3} width="56rem">
              <Alert severity="info">Inserir uma nova mensagem</Alert>
            </Box>

            <Box p={3} width="56rem">
              <Box
                display="flex"
                gap={3}
                border="1px solid #ab120e"
                borderRadius="8px"
                p={3}
              >
                <Autocomplete
                  options={condominiumMesseger.filter(
                    (item) =>
                      !screenCondominium.condominium_message?.includes(item._id)
                  )}
                  isOptionEqualToValue={(option, value) =>
                    option._id === value._id
                  }
                  getOptionLabel={(option) => option.name}
                  onChange={(event, newValue) => {
                    setMessegeId(newValue ? newValue._id : "");
                  }}
                  fullWidth
                  renderInput={(params) => (
                    <TextField {...params} label="Mensagem" fullWidth />
                  )}
                />
                <Box
                  display="flex"
                  gap={1}
                  width="100%"
                  alignItems="center"
                  justifyContent="center"
                >
                  <TextField
                    label="Data Inicial"
                    type="datetime-local"
                    onChange={(e) => {
                      setCondominiumMesseger((old) => [
                        ...old.map((item) =>
                          item._id === messege_id
                            ? {
                                ...item,
                                starttime: new Date(e.target.value),
                              }
                            : item
                        ),
                      ]);
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    fullWidth
                  />
                  <Typography>ATÉ</Typography>
                  <TextField
                    label="Data Final"
                    type="datetime-local"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    onChange={(e) => {
                      setCondominiumMesseger((old) => [
                        ...old.map((item) =>
                          item._id === messege_id
                            ? {
                                ...item,
                                endtime: new Date(e.target.value),
                              }
                            : item
                        ),
                      ]);
                    }}
                    fullWidth
                  />
                </Box>
                <Box display="flex" justifyContent="end" gap={2}>
                  <Button
                    variant="contained"
                    onClick={() => handleSubmitNewMessage()}
                  >
                    Adicionar
                  </Button>
                </Box>
              </Box>
            </Box>
          </Dialog>

          <Box display="flex" gap={3} width="100%">
            <TextField
              label="Estado atual"
              fullWidth
              value={screenCondominium.state}
              disabled
            />
            <TextField
              label="Cidade atual"
              fullWidth
              disabled
              value={screenCondominium.city}
            />
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
                <TextField
                  {...params}
                  label="Cidade"
                  value={screenCondominium.city}
                  fullWidth
                />
              )}
              autoComplete
            />
          </Box>
          {rss.length > 0 && screenCondominium && (
            <FormControl>
              <FormGroup row>
                {rss.map((item) => (
                  <FormControlLabel
                    key={item._id}
                    control={
                      <Checkbox
                        onChange={(e) => {
                          if (e.target.checked) {
                            setScreenCondominium({
                              ...screenCondominium,

                              source_rss: [
                                ...screenCondominium.source_rss,
                                item._id,
                              ],
                            });
                            setRssId(item._id);
                            setRssScreensId(item.screen_id);
                          } else {
                            setScreenCondominium({
                              ...screenCondominium,
                              source_rss: screenCondominium.source_rss.filter(
                                (id) => id !== item._id
                              ),
                            });
                          }
                        }}
                        checked={screenCondominium.source_rss.includes(
                          item._id
                        )}
                        name={item._id}
                      />
                    }
                    label={item.name}
                  />
                ))}
              </FormGroup>
            </FormControl>
          )}

          <Box display="flex" justifyContent="space-between" gap={2}>
            {user?.permission === Permission.ADMIN && (
              <Button variant="contained" onClick={handleDelete} fullWidth>
                Deletar
              </Button>
            )}
            <Button variant="contained" type="submit" fullWidth>
              Enviar
            </Button>
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
    </LocalizationProvider>
  );
};

export default EditScreens;
