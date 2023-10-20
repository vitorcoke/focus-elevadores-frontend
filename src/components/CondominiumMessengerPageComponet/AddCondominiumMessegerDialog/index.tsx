import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Dialog,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Slide,
  Snackbar,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { forwardRef, useState, useEffect } from "react";
import { useControlerButtonPagesContext } from "../../../context/ControlerButtonPagesContext";
import { CloseRounded, SendRounded, FileUploadRounded } from "@mui/icons-material";
import { api } from "../../../service";
import Rezide from "react-image-file-resizer";
import { CondominiumMessage } from "../../../types/condominium-message.type";
import { Screen } from "../../../types/screens.type";
import { DataGridPro, GridColDef, GridRowId, GridToolbar } from "@mui/x-data-grid-pro";
import { useAuthContext } from "../../../context/AuthContext";
import { Permission } from "../../../types/users.type";

type AddCondominiumMessegerProps = {
  setCondominiumMesseger: React.Dispatch<React.SetStateAction<CondominiumMessage[]>>;
};

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const AddCondominiumMessegerDialog: React.FC<AddCondominiumMessegerProps> = ({ setCondominiumMesseger }) => {
  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));
  const { openDialogCreateCondominiumMessenger, setOpenDialogCreateCondominiumMessenger, setCheckboxCondominiumMessenger } =
    useControlerButtonPagesContext();
  const { user } = useAuthContext();

  const [nameMessage, setNameMessage] = useState("");
  const [nameJpg, setNameJpg] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [jpg_file, setJpgFile] = useState<File>();
  const [screen, setScreen] = useState<Screen[]>([]);
  const [starttime, setStarttime] = useState<Date>();
  const [endtime, setEndtime] = useState<Date>();
  const [time_exibition, setTimeExibition] = useState("");

  const [select, setSelect] = useState(0);
  const [checkboxScreens, setCheckboxScreens] = useState<GridRowId[]>([]);

  const [openAlertSucess, setOpenAlertSucess] = useState(false);
  const [openAlertError, setOpenAlertError] = useState(false);
  const [infosImage, setInfosImage] = useState({ url: "", name: "" });

  const handleCloseAlertSucess = () => {
    setOpenAlertSucess(false);
  };
  const handleCloseAlertError = () => {
    setOpenAlertError(false);
  };

  const handleCloseDialog = () => {
    setOpenDialogCreateCondominiumMessenger(false);
    setCheckboxCondominiumMessenger([]);
    setNameMessage("");
    setNameJpg("");
    setInfosImage({ url: "", name: "" });
    setTitle("");
    setMessage("");
    setJpgFile(undefined);
    setScreen([]);
  };

  const handleLogotipo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let files = e.target.files;
    if (files && files.length > 0) {
      let file = files[0];
      if (file && file.type.includes("image")) {
        resizeFile(file);
      } else {
        setInfosImage({ url: "", name: "" });
        setJpgFile(undefined);
        alert("O arquivo deve ser uma imagem");
      }
    } else {
      setInfosImage({ url: "", name: "" });
      setJpgFile(undefined);
    }
  };

  const resizeFile = (file: File) => {
    Rezide.imageFileResizer(
      file,
      960, // largura desejada
      750, // altura desejada
      "JPEG", // formato
      200, // qualidade
      0, // rotação
      (url: string | File | Blob | ProgressEvent<FileReader>) => {
        if (url instanceof File) {
          setInfosImage({ url: URL.createObjectURL(url), name: file.name });
          setJpgFile(url);
        }
      },
      "file" // formato de saída
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let nameFile = "";

    const formData = new FormData();
    if (jpg_file) {
      formData.append("file", jpg_file);

      const nameFileResponse = await api.post("/condominium-message/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      nameFile = nameFileResponse.data;
    }

    try {
      if (select === 0) {
        const newMessege = await api.post("/condominium-message", {
          name: nameMessage,
          title,
          message,
          starttime,
          endtime,
          screen_id: checkboxScreens ? checkboxScreens : [],
          time_exibition: time_exibition !== "" ? Number(time_exibition) * 1000 : 15000,
        });
        if (checkboxScreens.length > 0) {
          checkboxScreens.map(async (screen) => {
            await api.patch(`/screens/message/${screen}`, {
              condominium_message: newMessege.data._id,
            });
          });
        }
        setCondominiumMesseger((old) => [...old, newMessege.data]);
        setMessage("");
        setTitle("");
        setNameMessage("");
        setJpgFile(undefined);
        setInfosImage({ url: "", name: "" });
        setTimeExibition("");

        setOpenAlertSucess(true);
      } else if (select === 1 && jpg_file) {
        const newMessege = await api.post("/condominium-message", {
          name: nameJpg,
          jpg_file: nameFile,
          starttime,
          endtime,
          screen_id: checkboxScreens ? checkboxScreens : [],
          time_exibition: time_exibition !== "" ? Number(time_exibition) * 1000 : 15000,
        });

        if (checkboxScreens.length > 0) {
          checkboxScreens.map(async (screen) => {
            await api.patch(`/screens/message/${screen}`, {
              condominium_message: newMessege.data._id,
            });
          });
        }
        setCondominiumMesseger((old) => [...old, newMessege.data]);
        setMessage("");
        setTitle("");
        setNameMessage("");
        setInfosImage({ url: "", name: "" });
        setJpgFile(undefined);
        setTimeExibition("");
        setOpenAlertSucess(true);
      } else {
        alert("Selecione uma imagem");
      }
    } catch {
      setOpenAlertError(true);
    }
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "name", headerName: "Nome", flex: 1 },
  ];

  const rows = screen?.map((item) => {
    return {
      id: item._id,
      name: item.name,
    };
  });

  useEffect(() => {
    api.get(`/screens`).then((response) => {
      setScreen(response.data);
    });
  }, []);

  useEffect(() => {
    setNameJpg("");
    setNameMessage("");
    setInfosImage({ url: "", name: "" });
  }, [select]);

  return (
    <Dialog fullScreen open={openDialogCreateCondominiumMessenger} onClose={handleCloseDialog} TransitionComponent={Transition}>
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
        <Box width="100%" height="100%" display="flex" flexDirection="column" alignItems="center" gap={2} p={3}>
          <Toolbar />

          <Box maxWidth="100%" display="flex" flexDirection={smDown ? "column" : "row"} justifyContent="space-evenly" gap={2}>
            <Box width={smDown ? "100%" : "40%"} alignItems={smDown ? "flex-start" : "center"}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth focused>
                    <InputLabel>Selecione o tipo da mensagem</InputLabel>
                    <Select label="Selecione o tipo da mensagem" value={select} onChange={(e) => setSelect(e.target.value as number)}>
                      <MenuItem value={0}>Mensagem texto</MenuItem>
                      <MenuItem value={1}>Mensagem JPG</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {select === 0 ? (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        required
                        disabled={!!nameJpg}
                        value={nameMessage}
                        label="Nome"
                        fullWidth
                        onChange={(e) => setNameMessage(e.target.value)}
                        helperText={`${nameMessage.length}/30`}
                        inputProps={{ maxLength: 30 }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        required
                        value={title}
                        disabled={!!nameJpg}
                        label="Titulo"
                        fullWidth
                        onChange={(e) => setTitle(e.target.value)}
                        helperText={`${title.length}/30`}
                        inputProps={{ maxLength: 30 }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        required
                        value={message}
                        disabled={!!nameJpg}
                        label="Mensagem"
                        fullWidth
                        onChange={(e) => setMessage(e.target.value)}
                        helperText={`${message.length}/400`}
                        inputProps={{ maxLength: 400 }}
                      />
                    </Grid>
                    {user?.permission === Permission.ADMIN && (
                      <Grid item xs={12}>
                        <TextField
                          label="Exibição em segundos"
                          value={time_exibition}
                          type={"number"}
                          sx={{
                            "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
                              display: "none",
                            },
                            "& input[type=number]": {
                              MozAppearance: "textfield",
                            },
                          }}
                          onChange={(e) => setTimeExibition(e.target.value.slice(0, 3))}
                          helperText={`${time_exibition?.toString().length}/3`}
                        />
                      </Grid>
                    )}
                  </>
                ) : (
                  <>
                    <Grid item xs={12}>
                      <TextField
                        required
                        value={nameJpg}
                        disabled={!!nameMessage}
                        label="Nome"
                        fullWidth
                        onChange={(e) => setNameJpg(e.target.value)}
                      />
                    </Grid>
                    {user?.permission === Permission.ADMIN && (
                      <Grid item xs={12}>
                        <TextField
                          label="Exibição em segundos"
                          value={time_exibition}
                          type={"number"}
                          sx={{
                            "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
                              display: "none",
                            },
                            "& input[type=number]": {
                              MozAppearance: "textfield",
                            },
                          }}
                          onChange={(e) => setTimeExibition(e.target.value.slice(0, 3))}
                          helperText={`${time_exibition?.toString().length}/3`}
                        />
                      </Grid>
                    )}

                    <Grid item xs={12}>
                      <Box width="100%" display="flex" justifyContent="center" alignItems="center">
                        {!infosImage.url ? (
                          <Typography>Selecione uma imagem</Typography>
                        ) : (
                          <Card>
                            <CardMedia component="img" image={infosImage.url} width={200} height={200} />
                            <CardContent>
                              <Typography>{infosImage.name} </Typography>
                            </CardContent>
                          </Card>
                        )}
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Button variant="contained" component="label" disabled={!!nameMessage} fullWidth startIcon={<FileUploadRounded />}>
                        Upload imagem
                        <input hidden accept="image/jpeg" type="file" onChange={handleLogotipo} />
                      </Button>
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>
            {!smDown && <Divider orientation="vertical" />}
            <Box width={smDown ? "100%" : "40%"} display="flex" textAlign="center" alignItems={smDown ? "flex-start" : "center"} mt={smDown ? 10 : 0}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography>Validade : </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    type="datetime-local"
                    label="Data inicial"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    onChange={(e) => setStarttime(new Date(e.target.value))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography>ATÉ</Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    type="datetime-local"
                    label="Data final"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    onChange={(e) => setEndtime(new Date(e.target.value))}
                  />
                </Grid>
              </Grid>
            </Box>
          </Box>
          <Box width={smDown ? "100%" : "70%"} height="25rem" mt={10}>
            <DataGridPro
              rows={rows}
              columns={columns}
              checkboxSelection
              onSelectionModelChange={(e) => setCheckboxScreens(e)}
              components={{
                Toolbar: GridToolbar,
              }}
            />
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

export default AddCondominiumMessegerDialog;
