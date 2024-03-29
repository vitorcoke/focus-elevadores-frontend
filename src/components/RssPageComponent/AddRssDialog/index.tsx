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

type AddRssProps = {
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

const AddRss: React.FC<AddRssProps> = ({ setRss }) => {
  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));
  const { openDialogCreateRss, setOpenDialogCreateRss } =
    useControlerButtonPagesContext();

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [logotipo, setLogotipo] = useState<File>();

  const [screen, setScreen] = useState<Screen[]>([]);
  const [checkboxScreens, setCheckboxScreens] = useState<GridRowId[]>([]);

  const [openAlertSucess, setOpenAlertSucess] = useState(false);
  const [openAlertError, setOpenAlertError] = useState(false);

  const handleCloseAlertSucess = () => {
    setOpenAlertSucess(false);
  };
  const handleCloseAlertError = () => {
    setOpenAlertError(false);
  };
  const handleCloseDialog = () => {
    setOpenDialogCreateRss(false);
    setName("");
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
      const rss = await api.post("/source-rss", {
        name,
        url,
        logotipo: base64,
        screen_id: checkboxScreens,
      });

      if (checkboxScreens.length > 0) {
        checkboxScreens.map(async (screen) => {
          await api.patch(`/screens/rss/${screen}`, {
            source_rss: rss.data._id,
          });
        });
      }

      setRss((prev) => [...prev, rss.data]);
      setOpenAlertSucess(true);
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

  return (
    <Dialog
      fullScreen
      open={openDialogCreateRss}
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
                  label="Nome"
                  fullWidth
                  onChange={(e) => setName(e.target.value)}
                  helperText={`${name.length}/30`}
                  inputProps={{ maxLength: 30 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  label="URL"
                  fullWidth
                  onChange={(e) => setUrl(e.target.value)}
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
          <Box width={smDown ? "100%" : "70%"} height="25rem" mt="3.5rem">
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

export default AddRss;
