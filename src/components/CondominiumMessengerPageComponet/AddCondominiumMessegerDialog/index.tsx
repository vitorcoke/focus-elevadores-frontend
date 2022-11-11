import {
  Alert,
  AppBar,
  Box,
  Button,
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
  const [screen, setScreen] = useState<Screen[]>([]);
  const [starttime, setStarttime] = useState<Date>();
  const [endtime, setEndtime] = useState<Date>();

  const [select, setSelect] = useState(0);
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
          starttime,
          endtime,
          screen_id: checkboxScreens ? checkboxScreens : [],
        });
        if (checkboxScreens.length > 0) {
          checkboxScreens.map(async (screen) => {
            await api.patch(`/screens/message/${screen}`, {
              condominium_message: newMessege.data._id,
            });
          });
        }
        setCondominiumMesseger((old) => [...old, newMessege.data]);

        setOpenAlertSucess(true);
      } else {
        const newMessege = await api.post("/condominium-message", {
          name: nameJpg,
          jpg_file: base64,
          starttime,
          endtime,
          screen_id: checkboxScreens ? checkboxScreens : [],
        });
        setCondominiumMesseger((old) => [...old, newMessege.data]);
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

  useEffect(() => {
    api.get(`/screens`).then((response) => {
      setScreen(response.data);
    });
  }, []);

  useEffect(() => {
    setNameJpg("");
    setNameMessage("");
  }, [select]);

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
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth focused>
                    <InputLabel>Selecione o tipo da mensagem</InputLabel>
                    <Select
                      label="Selecione o tipo da mensagem"
                      value={select}
                      onChange={(e) => setSelect(e.target.value as number)}
                    >
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
                        disabled={!!nameJpg}
                        label="Mensagem"
                        fullWidth
                        onChange={(e) => setMessage(e.target.value)}
                        helperText={`${message.length}/400`}
                        inputProps={{ maxLength: 400 }}
                      />
                    </Grid>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </Grid>
            </Box>
            {!smDown && <Divider orientation="vertical" />}
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
