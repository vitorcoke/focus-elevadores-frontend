import {
  Alert,
  AppBar,
  Box,
  Button,
  Dialog,
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
import { forwardRef, useState } from "react";
import { useControlerButtonPagesContext } from "../../../context/ControlerButtonPagesContext";
import {
  CloseRounded,
  SendRounded,
  FileUploadRounded,
} from "@mui/icons-material";
import { api } from "../../../service";
import { base64toFile } from "../../../utils/fileBase64";
import { CondominiumMessage } from "../../../types/condominium-message.type";

type AddCondominiumMessegerProps = {
  setCondominiumMesseger: React.Dispatch<
    React.SetStateAction<CondominiumMessage[]>
  >;
};

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const AddCondominiumMessegerDialog: React.FC<AddCondominiumMessegerProps> = ({
  setCondominiumMesseger,
}) => {
  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));
  const {
    openDialogCreateCondominiumMessenger,
    setOpenDialogCreateCondominiumMessenger,
    setCheckboxCondominiumMessenger,
  } = useControlerButtonPagesContext();

  const [nameMessage, setNameMessage] = useState("");
  const [nameJpg, setNameJpg] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [jpg_file, setJpgFile] = useState<File>();
  const [type, setType] = useState("");

  const [openAlertSucess, setOpenAlertSucess] = useState(false);
  const [openAlertError, setOpenAlertError] = useState(false);

  const handleCloseAlertSucess = () => {
    setOpenAlertSucess(false);
  };
  const handleCloseAlertError = () => {
    setOpenAlertError(false);
  };

  const handleCloseDialog = () => {
    setOpenDialogCreateCondominiumMessenger(false);
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
      if (nameMessage) {
        const newMessege = await api.post("/condominium-message", {
          name: nameMessage,
          title,
          message,
          type,
        });
        setCondominiumMesseger((old) => [...old, newMessege.data]);

        setOpenAlertSucess(true);
      } else {
        const newMessege = await api.post("/condominium-message", {
          name: nameJpg,
          jpg_file: base64,
          type,
        });
        setCondominiumMesseger((old) => [...old, newMessege.data]);
        setOpenAlertSucess(true);
      }
    } catch {
      setOpenAlertError(true);
    }
  };

  return (
    <Dialog
      fullScreen
      open={openDialogCreateCondominiumMessenger}
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

          <Box
            maxWidth="100%"
            display={smDown ? "inline" : "flex"}
            justifyContent="space-evenly"
          >
            <Box width={smDown ? "100%" : "40%"}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required
                    disabled={!!nameJpg}
                    label="Nome"
                    fullWidth
                    onChange={(e) => setNameMessage(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    disabled={!!nameJpg}
                    label="Titulo"
                    fullWidth
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    disabled={!!nameJpg}
                    label="Mensagem"
                    fullWidth
                    onChange={(e) => setMessage(e.target.value)}
                    helperText={`${message.length}/400`}
                    inputProps={{ maxLength: 400 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel disabled={!!nameJpg}>Permissão</InputLabel>
                    <Select
                      required
                      disabled={!!nameJpg}
                      value={!!nameJpg ? "" : type}
                      label="Responsavel"
                      onChange={(e) => setType(e.target.value as string)}
                    >
                      <MenuItem value={0}>Zelador(a)</MenuItem>
                      <MenuItem value={1}>Sindico(a)</MenuItem>
                      <MenuItem value={2}>Administrador(a)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            <Box
              display="flex"
              flexDirection={smDown ? "column" : "row"}
              alignItems="center"
              m={smDown ? 2 : 0}
            >
              <Typography>OU</Typography>
            </Box>
            <Box
              width={smDown ? "100%" : "40%"}
              display="flex"
              alignItems={smDown ? "flex-start" : "center"}
            >
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required
                    disabled={!!nameMessage}
                    label="Nome"
                    fullWidth
                    onChange={(e) => setNameJpg(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    component="label"
                    disabled={!!nameMessage}
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
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel disabled={!!nameMessage}>Permissão</InputLabel>
                    <Select
                      required
                      disabled={!!nameMessage}
                      value={!!nameMessage ? "" : type}
                      label="Responsavel"
                      onChange={(e) => setType(e.target.value as string)}
                    >
                      <MenuItem value={0}>Zelador(a)</MenuItem>
                      <MenuItem value={1}>Sindico(a)</MenuItem>
                      <MenuItem value={2}>Administrador(a)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
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
