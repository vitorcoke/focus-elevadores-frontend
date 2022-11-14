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
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import {
  Dispatch,
  forwardRef,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { useControlerButtonPagesContext } from "../../../context/ControlerButtonPagesContext";
import {
  CloseRounded,
  SendRounded,
  FileUploadRounded,
} from "@mui/icons-material";
import { api } from "../../../service";
import { base64toFile } from "../../../utils/fileBase64";
import { CondominiumMessage } from "../../../types/condominium-message.type";
import { Screen } from "../../../types/screens.type";
import { DataGridPro, GridColDef, GridRowId } from "@mui/x-data-grid-pro";
import dayjs from "dayjs";

type EditCondominiumMessegerProps = {
  condominiumMesseger: CondominiumMessage;
  setCondominiumMesseger: Dispatch<SetStateAction<CondominiumMessage[]>>;
};

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const EditCondominiumMessegerDialog: React.FC<EditCondominiumMessegerProps> = ({
  condominiumMesseger,
  setCondominiumMesseger,
}) => {
  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));
  const {
    openDialogEditCondominiumMessenger,
    setOpenDialogEditCondominiumMessenger,
    setCheckboxCondominiumMessenger,
  } = useControlerButtonPagesContext();

  const [editCondominiumMesseger, setEditCondominiumMesseger] =
    useState(condominiumMesseger);

  const [jpg_file, setJpgFile] = useState<File>();
  const [screen, setScreen] = useState<Screen[]>([]);
  const [screenAvailable, setScreenAvailable] = useState<Screen[]>([]);
  const [checkboxScreenRegistered, setCheckboxScreenRegistered] = useState<
    GridRowId[] | string[]
  >([]);
  const [checkboxScreenAvailable, setCheckboxScreenAvailable] = useState<
    GridRowId[] | string[]
  >([]);

  const [openAlertSucess, setOpenAlertSucess] = useState(false);
  const [openAlertError, setOpenAlertError] = useState(false);

  const handleCloseAlertSucess = () => {
    setOpenAlertSucess(false);
  };
  const handleCloseAlertError = () => {
    setOpenAlertError(false);
  };

  const handleCloseDialog = () => {
    setOpenDialogEditCondominiumMessenger(false);
    setCheckboxCondominiumMessenger([]);
  };

  const handleLogotipo = (e: React.ChangeEvent<HTMLInputElement>) => {
    let files = e.target.files;
    if (files) {
      let file = files[0];
      if (file && file.type.includes("image")) {
        let url = window.URL || window.webkitURL;
        let objectUrl = url.createObjectURL(file);
        let img = new Image();
        img.src = objectUrl;
        img.onload = () => {
          if (img.width < 720 && img.height < 480) {
            setJpgFile(file);
          } else {
            alert("A imagem deve ter no máximo 720x480");
          }
        };
      } else {
        alert("O arquivo deve ser uma imagem");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let base64 = jpg_file !== undefined && (await base64toFile(jpg_file));
    try {
      if (!editCondominiumMesseger.jpg_file) {
        const newMessege = await api.patch(
          `/condominium-message/${editCondominiumMesseger._id}`,
          {
            name: editCondominiumMesseger.name,
            title: editCondominiumMesseger.title,
            message: editCondominiumMesseger.message,
            starttime: editCondominiumMesseger.starttime,
            endtime: editCondominiumMesseger.endtime,
            screen_id: editCondominiumMesseger.screen_id?.concat(
              checkboxScreenAvailable as string[]
            ),
          }
        );

        if (checkboxScreenAvailable.length > 0) {
          checkboxScreenAvailable.forEach(async (screen) => {
            await api.patch(`/screens/message/${screen}`, {
              condominium_message: newMessege.data._id,
            });
          });
        }

        setCondominiumMesseger((old) => {
          let index = old.findIndex(
            (item) => item._id === editCondominiumMesseger._id
          );
          old[index] = newMessege.data;
          return [...old];
        });

        const newMessegeScreen = await api.get(
          `/screens/condominiumMessage/${condominiumMesseger._id}`
        );
        setScreen(newMessegeScreen.data);

        const newMessage = await api.get("/screens/");
        setScreenAvailable(newMessage.data);

        setOpenAlertSucess(true);
      } else {
        const newMessege = await api.patch(
          `/condominium-message/${editCondominiumMesseger._id}`,
          {
            name: editCondominiumMesseger.name,
            jpg_file: base64 ? base64 : undefined,
            starttime: editCondominiumMesseger.starttime,
            endtime: editCondominiumMesseger.endtime,
            screen_id: editCondominiumMesseger.screen_id?.concat(
              checkboxScreenAvailable as string[]
            ),
          }
        );
        if (checkboxScreenAvailable.length > 0) {
          checkboxScreenAvailable.forEach(async (screen) => {
            await api.patch(`/screens/message/${screen}`, {
              condominium_message: newMessege.data._id,
            });
          });
        }
        setCondominiumMesseger((old) => {
          let index = old.findIndex(
            (item) => item._id === editCondominiumMesseger._id
          );
          old[index] = newMessege.data;
          return [...old];
        });
        setOpenAlertSucess(true);
      }
    } catch (err) {
      console.log(err);
      setOpenAlertError(true);
    }
  };

  const handleDeleteScreen = async () => {
    try {
      if (checkboxScreenRegistered.length > 0) {
        checkboxScreenRegistered.map(async (item) => {
          await api.delete(`/condominium-message/screen/${item}`);
        });
        await api.delete(`/screens/message/${editCondominiumMesseger._id}`);
        const newMessegeScreen = await api.get(
          `/screens/condominiumMessage/${condominiumMesseger._id}`
        );
        const newMessage = await api.get("/screens/");

        const newCondominiumMesseger = await api.get("/condominium-message");
        setScreen(newMessegeScreen.data);
        setScreenAvailable(newMessage.data);
        setCondominiumMesseger(newCondominiumMesseger.data);

        setOpenAlertSucess(true);
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

  const columnsAvailable: GridColDef[] = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "name", headerName: "Nome", flex: 1 },
  ];

  const filterScreem = screenAvailable.filter((item) => {
    return !item.condominium_message?.includes(editCondominiumMesseger._id);
  });

  const rowsAvailable = filterScreem?.map((item) => {
    return {
      id: item._id,
      name: item.name,
    };
  });

  useEffect(() => {
    setEditCondominiumMesseger(condominiumMesseger);
  }, [condominiumMesseger]);

  useEffect(() => {
    api
      .get(`/screens/condominiumMessage/${condominiumMesseger._id}`)
      .then((res) => {
        setScreen(res.data);
      });
    api.get("/screens/").then((res) => {
      setScreenAvailable(res.data);
    });
  }, [openDialogEditCondominiumMessenger]);

  return (
    <Dialog
      fullScreen
      open={openDialogEditCondominiumMessenger}
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
          height="100%"
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={2}
          p={3}
        >
          <Toolbar />

          <Box
            maxWidth="100%"
            display="flex"
            flexDirection={smDown ? "column" : "row"}
            justifyContent="space-evenly"
            gap={2}
          >
            <Box
              width={smDown ? "100%" : "40%"}
              alignItems={smDown ? "flex-start" : "center"}
            >
              {!editCondominiumMesseger.jpg_file ? (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      disabled={!!editCondominiumMesseger.jpg_file}
                      label="Nome"
                      value={
                        !!editCondominiumMesseger.jpg_file
                          ? ""
                          : editCondominiumMesseger.name
                      }
                      fullWidth
                      onChange={(e) =>
                        setEditCondominiumMesseger({
                          ...editCondominiumMesseger,
                          name: e.target.value,
                        })
                      }
                      helperText={`${editCondominiumMesseger.name.length}/30`}
                      inputProps={{ maxLength: 30 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      disabled={!!editCondominiumMesseger.jpg_file}
                      label="Titulo"
                      value={editCondominiumMesseger.title}
                      fullWidth
                      onChange={(e) =>
                        setEditCondominiumMesseger({
                          ...editCondominiumMesseger,
                          title: e.target.value,
                        })
                      }
                      helperText={`${editCondominiumMesseger?.title?.length}/30`}
                      inputProps={{ maxLength: 30 }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      disabled={!!editCondominiumMesseger.jpg_file}
                      label="Mensagem"
                      value={editCondominiumMesseger.message}
                      fullWidth
                      onChange={(e) =>
                        setEditCondominiumMesseger({
                          ...editCondominiumMesseger,
                          message: e.target.value,
                        })
                      }
                      helperText={`${editCondominiumMesseger?.message?.length}/400`}
                      inputProps={{ maxLength: 400 }}
                    />
                  </Grid>
                </Grid>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      disabled={!!editCondominiumMesseger.title}
                      label="Nome"
                      value={
                        !!editCondominiumMesseger.title
                          ? ""
                          : editCondominiumMesseger.name
                      }
                      fullWidth
                      onChange={(e) =>
                        setEditCondominiumMesseger({
                          ...editCondominiumMesseger,
                          name: e.target.value,
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      component="label"
                      disabled={!!editCondominiumMesseger.title}
                      fullWidth
                      startIcon={<FileUploadRounded />}
                    >
                      JPG mensagem
                      <input
                        hidden
                        accept="image/jpeg"
                        multiple
                        type="file"
                        onChange={handleLogotipo}
                      />
                    </Button>
                  </Grid>
                </Grid>
              )}
            </Box>
            <Box
              width={smDown ? "100%" : "40%"}
              display="flex"
              textAlign="center"
              alignItems={smDown ? "flex-start" : "center"}
              mt={smDown ? 10 : 0}
            >
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography>Validade : </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    value={dayjs(editCondominiumMesseger.starttime).format(
                      "YYYY-MM-DDTHH:mm"
                    )}
                    type="datetime-local"
                    label="Data inicial"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    onChange={(e) =>
                      setEditCondominiumMesseger({
                        ...editCondominiumMesseger,
                        starttime: new Date(e.target.value),
                      })
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography>ATÉ</Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    value={dayjs(editCondominiumMesseger.endtime).format(
                      "YYYY-MM-DDTHH:mm"
                    )}
                    type="datetime-local"
                    label="Data final"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    onChange={(e) =>
                      setEditCondominiumMesseger({
                        ...editCondominiumMesseger,
                        endtime: new Date(e.target.value),
                      })
                    }
                  />
                </Grid>
              </Grid>
            </Box>
          </Box>
          <Box
            width={smDown ? "100%" : "70%"}
            height="30rem"
            mt={10}
            display="flex"
            flexDirection="column"
            gap={2}
          >
            <Typography variant="h5">Telas já cadastradas :</Typography>
            <DataGridPro
              rows={rows}
              columns={columns}
              checkboxSelection
              onSelectionModelChange={(e) => setCheckboxScreenRegistered(e)}
            />
            {checkboxScreenRegistered.length > 0 && (
              <Button variant="contained" onClick={() => handleDeleteScreen()}>
                Excluir
              </Button>
            )}
          </Box>

          <Box
            width={smDown ? "100%" : "70%"}
            height="30rem"
            mt={10}
            display="flex"
            flexDirection="column"
            gap={2}
          >
            <Typography variant="h5">Telas disponiveis :</Typography>
            <DataGridPro
              rows={rowsAvailable}
              columns={columnsAvailable}
              checkboxSelection
              onSelectionModelChange={(e) => setCheckboxScreenAvailable(e)}
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

export default EditCondominiumMessegerDialog;
