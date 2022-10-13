import {
  CloseRounded,
  FileUploadRounded,
  SearchRounded,
  SendRounded,
} from "@mui/icons-material";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Dialog,
  Grid,
  IconButton,
  Snackbar,
  TextField,
  Toolbar,
  useMediaQuery,
  useTheme,
  Slide,
  ClickAwayListener,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { Dispatch, forwardRef, SetStateAction, useState } from "react";
import { useControlerButtonPagesContext } from "../../../context/ControlerButtonPagesContext";
import { Banner } from "../../../types/banner.type";
import { BlockPicker, AlphaPicker } from "react-color";
import { api } from "../../../service";
import { base64toFile } from "../../../utils/fileBase64";

type AddCondominiumProps = {
  setBanner: Dispatch<SetStateAction<Banner[]>>;
};

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const AddBannerDialog: React.FC<AddCondominiumProps> = ({ setBanner }) => {
  const { openDialogCreateBanner, setOpenDialogCreateBanner } =
    useControlerButtonPagesContext();

  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));

  const [name, setName] = useState("");
  const [image, setImage] = useState<File>();
  const [description, setDescription] = useState("");
  const [background_color, setBackgroundColor] = useState("");
  const [font_color, setFontColor] = useState("");
  const [openAlertSucess, setOpenAlertSucess] = useState(false);
  const [openAlertError, setOpenAlertError] = useState(false);
  const [openPickerColorBackground, setOpenPickerColorBackground] =
    useState(false);
  const [openPickerColorFont, setOpenPickerColorFont] = useState(false);

  const handleOpenPickerColorBackground = () => {
    setOpenPickerColorBackground((prev) => !prev);
  };

  const handleOpenPickerColorFont = () => {
    setOpenPickerColorFont((prev) => !prev);
  };

  const handleClickedAwayBackground = () => {
    setOpenPickerColorBackground(false);
  };

  const handleClickedAwayFont = () => {
    setOpenPickerColorFont(false);
  };

  const handleCloseAlertSucess = () => {
    setOpenAlertSucess(false);
  };

  const handleCloseAlertError = () => {
    setOpenAlertError(false);
  };

  const handleCloseDialog = () => {
    setOpenDialogCreateBanner(false);
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    let files = e.target.files;
    if (files) {
      let file = files[0];
      if (file && file.type.includes("image")) {
        let url = window.URL || window.webkitURL;
        let objectUrl = url.createObjectURL(file);
        let img = new Image();
        img.src = objectUrl;
        img.onload = () => {
          if (img.width > 100 && img.height > 100) {
            setImage(file);
          } else {
            alert("A imagem deve ter no mínimo 100x100");
          }
        };
      } else {
        alert("O arquivo deve ser uma imagem");
      }
    }
  };

  const handleSubmit = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    let base64 = image !== undefined && (await base64toFile(image));
    try {
      const banner = await api.post("/banner", {
        name,
        image: base64,
        description,
        background_color,
        font_color,
      });
      setBanner((prev) => [...prev, banner.data]);
      setOpenAlertSucess(true);
    } catch {
      setOpenAlertError(true);
    }
  };

  return (
    <Dialog
      open={openDialogCreateBanner}
      onClose={handleCloseDialog}
      fullScreen
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
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  component="label"
                  fullWidth
                  startIcon={<FileUploadRounded />}
                >
                  Imagem do Banner
                  <input
                    required
                    hidden
                    accept="image/*"
                    multiple
                    type="file"
                    onChange={handleImage}
                  />
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Box display="flex">
                  <TextField
                    required
                    label="Descrição"
                    fullWidth
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <ClickAwayListener onClickAway={handleClickedAwayBackground}>
                  <Box>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleOpenPickerColorBackground}
                    >
                      Selecione uma cor de fundo
                    </Button>
                    {openPickerColorBackground && (
                      <Box
                        marginTop="1rem"
                        width="100%"
                        display="flex"
                        justifyContent="center"
                      >
                        <BlockPicker
                          color={background_color}
                          onChange={(e) => setBackgroundColor(e.hex)}
                        />
                      </Box>
                    )}
                  </Box>
                </ClickAwayListener>
              </Grid>
              <Grid item xs={12}>
                <ClickAwayListener onClickAway={handleClickedAwayFont}>
                  <Box>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleOpenPickerColorFont}
                    >
                      Selecione uma cor de fonte
                    </Button>
                    {openPickerColorFont && (
                      <Box
                        marginTop="1rem"
                        width="100%"
                        display="flex"
                        justifyContent="center"
                      >
                        <BlockPicker
                          color={font_color}
                          onChange={(e) => setFontColor(e.hex)}
                        />
                      </Box>
                    )}
                  </Box>
                </ClickAwayListener>
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

export default AddBannerDialog;
