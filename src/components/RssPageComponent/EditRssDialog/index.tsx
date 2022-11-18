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
import {
  CloseRounded,
  SendRounded,
  FileUploadRounded,
} from "@mui/icons-material";
import { TransitionProps } from "@mui/material/transitions";
import { forwardRef, useEffect, useState } from "react";
import { useControlerButtonPagesContext } from "../../../context/ControlerButtonPagesContext";
import { api } from "../../../service";
import { base64toFile } from "../../../utils/fileBase64";
import { Rss } from "../../../types/rss.type";
import {
  DataGridPro,
  GridColDef,
  GridRowId,
  GridToolbar,
} from "@mui/x-data-grid-pro";
import { Screen } from "../../../types/screens.type";

type EditRssProps = {
  rss: Rss;
  setRss: React.Dispatch<React.SetStateAction<Rss[]>>;
};

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const EditRss: React.FC<EditRssProps> = ({ rss, setRss }) => {
  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));
  const { openDialogEditRss, setOpenDialogEditRss, setCheckboxRss } =
    useControlerButtonPagesContext();

  const [editRss, setEditRss] = useState<Rss>(rss);
  const [logotipo, setLogotipo] = useState<File>();

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
    setOpenDialogEditRss(false);
    setCheckboxRss([]);
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
          if (img.width <= 426 && img.height <= 240) {
            setLogotipo(file);
          } else {
            alert("A imagem deve ter no máximo 426x240");
          }
        };
      } else {
        alert("O arquivo deve ser uma imagem");
      }
    }
  };

  const handleSubmit = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    let base64 = logotipo !== undefined && (await base64toFile(logotipo));
    try {
      const newRss = await api.patch(`/source-rss/${editRss._id}`, {
        name: editRss.name,
        url: editRss.url,
        logotipo: base64 ? base64 : editRss.logotipo,
        screen_id: editRss.screen_id.concat(
          checkboxScreenAvailable as string[]
        ),
      });

      if (checkboxScreenAvailable.length > 0) {
        checkboxScreenAvailable.forEach(async (screen) => {
          await api.patch(`/screens/rss/${screen}`, {
            source_rss: newRss.data._id,
          });
        });
      }

      setRss((old) => {
        let index = old.findIndex((item) => item._id === editRss._id);
        old[index] = newRss.data;
        return [...old];
      });

      const newRssScreen = await api.get(`/screens/sourcerss/${rss._id}`);
      setScreen(newRssScreen.data);

      const newScreen = await api.get("/screens/");
      setScreenAvailable(newScreen.data);

      setOpenAlertSucess(true);
    } catch {
      setOpenAlertError(true);
    }
  };

  const handleDeleteScreen = async () => {
    try {
      if (checkboxScreenRegistered.length > 0) {
        checkboxScreenRegistered.forEach(async (item) => {
          await api.delete(`/source-rss/screen/${item}`);
          await api.delete(`/screens/rss/${editRss._id}/screen/${item}`);

          const newRssScreen = await api.get(`/screens/sourcerss/${rss._id}`);
          const newScreen = await api.get("/screens/");
          const newCondominiumRss = await api.get(`/source-rss/${editRss._id}`);

          console.log(
            newCondominiumRss.data,
            newRssScreen.data,
            newScreen.data
          );
          setScreen(newRssScreen.data);
          setScreenAvailable(newScreen.data);
          setEditRss(newCondominiumRss.data);
          setRss((old) => {
            let index = old.findIndex((item) => item._id === editRss._id);
            old[index] = newCondominiumRss.data;
            return [...old];
          });
        });

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
    return !item.source_rss?.includes(editRss._id);
  });

  const rowsAvailable = filterScreem?.map((item) => {
    return {
      id: item._id,
      name: item.name,
    };
  });

  useEffect(() => {
    setEditRss(rss);
  }, [rss]);

  useEffect(() => {
    api.get(`/screens/sourcerss/${rss._id}`).then((res) => {
      setScreen(res.data);
    });
    api.get("/screens/").then((res) => {
      setScreenAvailable(res.data);
    });
  }, [openDialogEditRss]);

  return (
    <Dialog
      fullScreen
      open={openDialogEditRss}
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

          <Box maxWidth={smDown ? "90%" : "30%"} flexGrow={1}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  label="Nome"
                  value={editRss.name}
                  fullWidth
                  onChange={(e) =>
                    setEditRss({ ...editRss, name: e.target.value })
                  }
                  helperText={`${editRss.name.length}/30`}
                  inputProps={{ maxLength: 30 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  label="URL"
                  value={editRss.url}
                  fullWidth
                  onChange={(e) =>
                    setEditRss({ ...editRss, url: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  component="label"
                  fullWidth
                  startIcon={<FileUploadRounded />}
                >
                  Logo do RSS
                  <input
                    hidden
                    accept="image/*"
                    multiple
                    type="file"
                    onChange={handleLogotipo}
                  />
                </Button>
              </Grid>
            </Grid>
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
              components={{
                Toolbar: GridToolbar,
              }}
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

export default EditRss;
