import {
  CloseRounded,
  FileUploadRounded,
  SendRounded,
} from "@mui/icons-material";
import {
  Alert,
  AppBar,
  Box,
  Button,
  ClickAwayListener,
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
import { TransitionProps } from "@mui/material/transitions";
import { Dispatch, forwardRef, SetStateAction, useState } from "react";
import { BlockPicker } from "react-color";
import { useControlerButtonPagesContext } from "../../../context/ControlerButtonPagesContext";
import { api } from "../../../service";
import { Banner } from "../../../types/banner.type";
import { base64toFile } from "../../../utils/fileBase64";

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type EditBannerDialogProps = {
  banner: Banner;
  setBanner: Dispatch<SetStateAction<Banner[]>>;
};

const EditBannerDialog: React.FC<EditBannerDialogProps> = ({
  banner,
  setBanner,
}) => {
  const { openDialogEditBanner, setOpenDialogEditBanner, setCheckboxBanner } =
    useControlerButtonPagesContext();

  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));

  const [editBanner, setEditBanner] = useState(banner);
  const [image, setImage] = useState<File>();
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
    setOpenDialogEditBanner(false);
    setCheckboxBanner([]);
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
          if (img.width <= 426 && img.height <= 240) {
            setImage(file);
          } else {
            alert("A imagem deve ter no máximo 426x240");
          }
        };
      } else {
        alert("O arquivo deve ser uma imagem");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let base64 = image !== undefined && (await base64toFile(image));
    try {
      const newBanner = await api.patch(`/banner/${editBanner._id}`, {
        name: editBanner.name,
        image: base64 ? base64 : editBanner.image,
        description: editBanner.description,
        background_color: editBanner.background_color,
        font_color: editBanner.font_color,
      });
      setBanner((old) => {
        let index = old.findIndex((item) => item._id === editBanner._id);
        old[index] = newBanner.data;
        return [...old];
      });
      setOpenAlertSucess(true);
    } catch {
      setOpenAlertError(true);
    }
  };

  return (
    <Dialog
      open={openDialogEditBanner}
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

          <Box
            maxWidth={smDown ? "90%" : "30%"}
            flexGrow={1}
            sx={{
              wordBreak: "break-word",
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  value={editBanner.name}
                  label="Nome"
                  fullWidth
                  onChange={(e) =>
                    setEditBanner({ ...editBanner, name: e.target.value })
                  }
                  helperText={`${editBanner.name.length}/30`}
                  inputProps={{
                    maxLength: 30,
                  }}
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
                    hidden
                    accept="image/*"
                    multiple
                    type="file"
                    onChange={handleImage}
                  />
                </Button>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  value={editBanner.description}
                  label="Descrição"
                  fullWidth
                  onChange={(e) =>
                    setEditBanner({
                      ...editBanner,
                      description: e.target.value,
                    })
                  }
                  helperText={`${editBanner.description.length}/250`}
                  inputProps={{ maxLength: 250 }}
                />
              </Grid>
              <Grid item xs={12}>
                <ClickAwayListener onClickAway={handleClickedAwayBackground}>
                  <Box>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleOpenPickerColorBackground}
                    >
                      Selecione uma cor
                    </Button>
                    {openPickerColorBackground && (
                      <Box
                        marginTop="1rem"
                        width="100%"
                        display="flex"
                        justifyContent="center"
                      >
                        <BlockPicker
                          color={editBanner.background_color}
                          onChange={(e) =>
                            setEditBanner({
                              ...editBanner,
                              background_color: e.hex,
                            })
                          }
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
                      Selecione uma cor
                    </Button>
                    {openPickerColorFont && (
                      <Box
                        marginTop="1rem"
                        width="100%"
                        display="flex"
                        justifyContent="center"
                      >
                        <BlockPicker
                          color={editBanner.font_color}
                          onChange={(e) =>
                            setEditBanner({
                              ...editBanner,
                              font_color: e.hex,
                            })
                          }
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

export default EditBannerDialog;
