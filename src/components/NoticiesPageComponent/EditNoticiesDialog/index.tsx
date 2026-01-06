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
  Slide,
  Snackbar,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  Select,
  MenuItem,
} from "@mui/material";
import { CloseRounded, SendRounded, FileUploadRounded } from "@mui/icons-material";
import { TransitionProps } from "@mui/material/transitions";
import { forwardRef, useEffect, useState } from "react";
import { useControlerButtonPagesContext } from "../../../context/ControlerButtonPagesContext";
import { api } from "../../../service";
import { base64toFile } from "../../../utils/fileBase64";
import { Rss } from "../../../types/rss.type";
import { DataGridPro, GridColDef, GridRowId, GridToolbar } from "@mui/x-data-grid-pro";
import { Screen } from "../../../types/screens.type";
import { Noticies } from "../../../types/noticies.type";

type EditNoticies = {
  noticies: Noticies;
  setNoticies: React.Dispatch<React.SetStateAction<Noticies[]>>;
};

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const EditNoticies: React.FC<EditNoticies> = ({ noticies, setNoticies }) => {
  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));
  const { openDialogEditNoticies, setOpenDialogEditNoticies, setCheckboxNoticies } =
    useControlerButtonPagesContext();

  const [editNoticies, setEditNoticies] = useState<Noticies>(noticies);

  const [screen, setScreen] = useState<Screen[]>([]);
  const [screenAvailable, setScreenAvailable] = useState<Screen[]>([]);
  const [checkboxScreenRegistered, setCheckboxScreenRegistered] = useState<GridRowId[] | string[]>(
    []
  );
  const [checkboxScreenAvailable, setCheckboxScreenAvailable] = useState<GridRowId[] | string[]>(
    []
  );

  const [openAlertSucess, setOpenAlertSucess] = useState(false);
  const [openAlertError, setOpenAlertError] = useState(false);

  const handleCloseAlertSucess = () => {
    setOpenAlertSucess(false);
  };
  const handleCloseAlertError = () => {
    setOpenAlertError(false);
  };
  const handleCloseDialog = () => {
    setOpenDialogEditNoticies(false);
    setCheckboxNoticies([]);
  };

  const handleSubmit = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    try {
      const newNoticies = await api.patch(`/noticies/${editNoticies._id}`, {
        name: editNoticies.name,
        search: editNoticies.search,
        country: editNoticies.country,
        city: editNoticies.city,
        state: editNoticies.state,
        category: editNoticies.category,
        language: editNoticies.language,
        screen_id: editNoticies.screen_id.concat(checkboxScreenAvailable as string[]),
      });

      if (checkboxScreenAvailable.length > 0) {
        checkboxScreenAvailable.forEach(async (screen) => {
          await api.patch(`/screens/noticies/${screen}`, {
            noticies: newNoticies.data._id,
          });
        });
      }

      setNoticies((old) => {
        let index = old.findIndex((item) => item._id === editNoticies._id);
        old[index] = newNoticies.data;
        return [...old];
      });

      const newNoticiesScreen = await api.get(`/screens/noticies/${noticies._id}`);
      setScreen(newNoticiesScreen.data);

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
          await api.delete(`/noticies/screen/${item}`);
          await api.delete(`/screens/noticies/${editNoticies._id}/screen/${item}`);

          const newRssScreen = await api.get(`/screens/noticies/${noticies._id}`);
          const newScreen = await api.get("/screens/");
          const newCondominiumRss = await api.get(`/noticies/${editNoticies._id}`);

          setScreen(newRssScreen.data);
          setScreenAvailable(newScreen.data);
          setEditNoticies(newCondominiumRss.data);
          setNoticies((old) => {
            let index = old.findIndex((item) => item._id === editNoticies._id);
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
    return !item.noticies?.includes(editNoticies._id);
  });

  const rowsAvailable = filterScreem?.map((item) => {
    return {
      id: item._id,
      name: item.name,
    };
  });

  useEffect(() => {
    setEditNoticies(noticies);
  }, [noticies]);

  useEffect(() => {
    api.get(`/screens/noticies/${noticies._id}`).then((res) => {
      setScreen(res.data);
    });
    api.get("/screens/").then((res) => {
      setScreenAvailable(res.data);
    });
  }, [openDialogEditNoticies]);

  return (
    <Dialog
      fullScreen
      open={openDialogEditNoticies}
      onClose={handleCloseDialog}
      TransitionComponent={Transition}
    >
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
                  fullWidth
                  value={editNoticies.name}
                  onChange={(e) => setEditNoticies({ ...editNoticies, name: e.target.value })}
                  helperText={`${editNoticies.name.length}/30`}
                  inputProps={{ maxLength: 30 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  label="Procura"
                  fullWidth
                  onChange={(e) => setEditNoticies({ ...editNoticies, search: e.target.value })}
                  value={editNoticies.search}
                  inputProps={{ maxLength: 30 }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Categoria</InputLabel>
                  <Select
                    label="Categoria"
                    value={editNoticies.category}
                    onChange={(e) => setEditNoticies({ ...editNoticies, category: e.target.value })}
                  >
                    <MenuItem value="business">Negócios</MenuItem>
                    <MenuItem value="crime">Crime</MenuItem>
                    <MenuItem value="domestic">Nacional</MenuItem>
                    <MenuItem value="education">Educação</MenuItem>
                    <MenuItem value="entertainment">Entreterimento</MenuItem>
                    <MenuItem value="environment">Meio ambiente</MenuItem>
                    <MenuItem value="food">Alimentação</MenuItem>
                    <MenuItem value="health">Saúde</MenuItem>
                    <MenuItem value="lifestyle">Estilo de vida</MenuItem>
                    <MenuItem value="politics">Política</MenuItem>
                    <MenuItem value="science">Ciência</MenuItem>
                    <MenuItem value="sports">Esportes</MenuItem>
                    <MenuItem value="technology">Tecnologia</MenuItem>
                    <MenuItem value="top">Principais</MenuItem>
                    <MenuItem value="tourism">Turismo</MenuItem>
                    <MenuItem value="world">Mundo</MenuItem>
                    <MenuItem value="other">Outros</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  label="Pais"
                  value={editNoticies.country}
                  fullWidth
                  onChange={(e) => setEditNoticies({ ...editNoticies, country: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  label="Estado"
                  value={editNoticies.state}
                  fullWidth
                  onChange={(e) => setEditNoticies({ ...editNoticies, state: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  label="Cidade"
                  value={editNoticies.city}
                  fullWidth
                  onChange={(e) => setEditNoticies({ ...editNoticies, city: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Idioma</InputLabel>
                  <Select
                    label="Idioma"
                    value={editNoticies.language}
                    onChange={(e) => setEditNoticies({ ...editNoticies, language: e.target.value })}
                  >
                    <MenuItem value="af">Africâner</MenuItem>
                    <MenuItem value="sq">Albanês</MenuItem>
                    <MenuItem value="am">Amárico</MenuItem>
                    <MenuItem value="ar">Árabe</MenuItem>
                    <MenuItem value="hy">Armênio</MenuItem>
                    <MenuItem value="as">Assamês</MenuItem>
                    <MenuItem value="az">Azerbaijano</MenuItem>
                    <MenuItem value="bm">Bambara</MenuItem>
                    <MenuItem value="eu">Basco</MenuItem>
                    <MenuItem value="be">Bielorrusso</MenuItem>
                    <MenuItem value="bn">Bengali</MenuItem>
                    <MenuItem value="bs">Bósnio</MenuItem>
                    <MenuItem value="bg">Búlgaro</MenuItem>
                    <MenuItem value="my">Birmanês</MenuItem>
                    <MenuItem value="ca">Catalão</MenuItem>
                    <MenuItem value="ckb">Curdo Central</MenuItem>
                    <MenuItem value="zh">Chinês</MenuItem>
                    <MenuItem value="hr">Croata</MenuItem>
                    <MenuItem value="cs">Tcheco</MenuItem>
                    <MenuItem value="da">Dinamarquês</MenuItem>
                    <MenuItem value="nl">Holandês</MenuItem>
                    <MenuItem value="en">Inglês</MenuItem>
                    <MenuItem value="et">Estoniano</MenuItem>
                    <MenuItem value="pi">Filipino</MenuItem>
                    <MenuItem value="fi">Finlandês</MenuItem>
                    <MenuItem value="fr">Francês</MenuItem>
                    <MenuItem value="gl">Galego</MenuItem>
                    <MenuItem value="ka">Georgiano</MenuItem>
                    <MenuItem value="de">Alemão</MenuItem>
                    <MenuItem value="el">Grego</MenuItem>
                    <MenuItem value="gu">Gujarati</MenuItem>
                    <MenuItem value="ha">Hauçá</MenuItem>
                    <MenuItem value="he">Hebraico</MenuItem>
                    <MenuItem value="hi">Hindi</MenuItem>
                    <MenuItem value="hu">Húngaro</MenuItem>
                    <MenuItem value="is">Islandês</MenuItem>
                    <MenuItem value="id">Indonésio</MenuItem>
                    <MenuItem value="it">Italiano</MenuItem>
                    <MenuItem value="jp">Japonês</MenuItem>
                    <MenuItem value="kn">Canarês</MenuItem>
                    <MenuItem value="kz">Cazaque</MenuItem>
                    <MenuItem value="kh">Khmer</MenuItem>
                    <MenuItem value="rw">Kinyarwanda</MenuItem>
                    <MenuItem value="ko">Coreano</MenuItem>
                    <MenuItem value="ku">Curdo</MenuItem>
                    <MenuItem value="lv">Letão</MenuItem>
                    <MenuItem value="lt">Lituano</MenuItem>
                    <MenuItem value="lb">Luxemburguês</MenuItem>
                    <MenuItem value="mk">Macedônio</MenuItem>
                    <MenuItem value="ms">Malaio</MenuItem>
                    <MenuItem value="ml">Malaiala</MenuItem>
                    <MenuItem value="mt">Maltês</MenuItem>
                    <MenuItem value="mi">Maori</MenuItem>
                    <MenuItem value="mr">Marata</MenuItem>
                    <MenuItem value="mn">Mongol</MenuItem>
                    <MenuItem value="ne">Nepalês</MenuItem>
                    <MenuItem value="no">Norueguês</MenuItem>
                    <MenuItem value="or">Oriá</MenuItem>
                    <MenuItem value="ps">Pachto</MenuItem>
                    <MenuItem value="fa">Persa</MenuItem>
                    <MenuItem value="pl">Polonês</MenuItem>
                    <MenuItem value="pt">Português</MenuItem>
                    <MenuItem value="pa">Punjabi</MenuItem>
                    <MenuItem value="ro">Romeno</MenuItem>
                    <MenuItem value="ru">Russo</MenuItem>
                    <MenuItem value="sm">Samoano</MenuItem>
                    <MenuItem value="sr">Sérvio</MenuItem>
                    <MenuItem value="sn">Shona</MenuItem>
                    <MenuItem value="sd">Sindi</MenuItem>
                    <MenuItem value="si">Cingalês</MenuItem>
                    <MenuItem value="sk">Eslovaco</MenuItem>
                    <MenuItem value="sl">Esloveno</MenuItem>
                    <MenuItem value="so">Somali</MenuItem>
                    <MenuItem value="es">Espanhol</MenuItem>
                    <MenuItem value="sw">Suaíli</MenuItem>
                    <MenuItem value="sv">Sueco</MenuItem>
                    <MenuItem value="tg">Tajique</MenuItem>
                    <MenuItem value="ta">Tâmil</MenuItem>
                    <MenuItem value="te">Telugu</MenuItem>
                    <MenuItem value="th">Tailandês</MenuItem>
                    <MenuItem value="zht">Chinês Tradicional</MenuItem>
                    <MenuItem value="tr">Turco</MenuItem>
                    <MenuItem value="tk">Turcomeno</MenuItem>
                    <MenuItem value="uk">Ucraniano</MenuItem>
                    <MenuItem value="ur">Urdu</MenuItem>
                    <MenuItem value="uz">Uzbeque</MenuItem>
                    <MenuItem value="vi">Vietnamita</MenuItem>
                    <MenuItem value="cy">Galês</MenuItem>
                    <MenuItem value="zu">Zulu</MenuItem>
                  </Select>
                </FormControl>
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

export default EditNoticies;

