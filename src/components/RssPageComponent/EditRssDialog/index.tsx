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
  Stack,
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
          if (img.width < 426 && img.height < 240) {
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
      });
      setRss((old) => {
        let index = old.findIndex((item) => item._id === editRss._id);
        old[index] = newRss.data;
        return [...old];
      });
      setOpenAlertSucess(true);
    } catch {
      setOpenAlertError(true);
    }
  };

  useEffect(() => {
    setEditRss(rss);
  }, [rss]);

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
                  value={editRss.name}
                  fullWidth
                  onChange={(e) =>
                    setEditRss({ ...editRss, name: e.target.value })
                  }
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
