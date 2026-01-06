import { CloseRounded, SendRounded } from "@mui/icons-material";
import {
  Alert,
  AppBar,
  Box,
  Dialog,
  IconButton,
  Slide,
  Snackbar,
  Tab,
  Toolbar,
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { TransitionProps } from "@mui/material/transitions";
import { forwardRef, useState } from "react";
import { useControlerButtonPagesContext } from "../../../context/ControlerButtonPagesContext";
import { CondominiumType } from "../../../types/condominium.type";
import { Rss } from "../../../types/rss.type";
import { Banner } from "../../../types/banner.type";
import { useAuthContext } from "../../../context/AuthContext";
import { Permission } from "../../../types/users.type";
import { CondominiumMessageType } from "../../../types/condominium-message.type";
import ScreenTable from "./ScreensTable";
import AddScreens from "./AddScreens";
import EditScreens from "./EditScreens";
import { Noticies } from "../../../types/noticies.type";

type ScreenDialogProp = {
  condominium: CondominiumType;
  setCondominium: React.Dispatch<React.SetStateAction<CondominiumType[]>>;
  rss: Rss[];
  banner: Banner[];
  noticies: Noticies[];
  condominiumMesseger: CondominiumMessageType[];
  setCondominiumMesseger: React.Dispatch<React.SetStateAction<CondominiumMessageType[]>>;
};

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ScreensDialog: React.FC<ScreenDialogProp> = ({
  condominium,
  setCondominium,
  rss,
  noticies,
  banner,
  condominiumMesseger,
  setCondominiumMesseger,
}) => {
  const {
    setOpenDialogCreateScreens,
    openDialogCreateScreens,
    checkboxScreens,
    setCheckboxScreens,
    setCheckboxCondominium,
  } = useControlerButtonPagesContext();

  const { user } = useAuthContext();

  const [openAlertSucess, setOpenAlertSucess] = useState(false);
  const [openAlertError, setOpenAlertError] = useState(false);
  const [value, setValue] = useState("1");

  const handleChangeTab = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

  const handleCloseDialog = () => {
    setOpenDialogCreateScreens(false);
    setCheckboxScreens([]);
    setCheckboxCondominium([]);
    setValue("1");
  };

  const handleCloseAlertSucess = () => {
    setOpenAlertSucess(false);
  };

  const handleCloseAlertError = () => {
    setOpenAlertError(false);
  };

  return (
    <Dialog
      fullScreen
      open={openDialogCreateScreens}
      onClose={handleCloseDialog}
      TransitionComponent={Transition}
    >
      <Box>
        <AppBar>
          <Toolbar>
            <IconButton onClick={handleCloseDialog}>
              <CloseRounded />
            </IconButton>
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

          <Box width="100%">
            <TabContext value={value}>
              <TabList
                onChange={handleChangeTab}
                scrollButtons="auto"
                variant="scrollable"
                allowScrollButtonsMobile
              >
                <Tab label="Lista de telas" value="1" />
                {user?.permission === Permission.ADMIN && (
                  <Tab label="Cadastro de telas" value="2" />
                )}
                {checkboxScreens.length === 1 && <Tab label="Editar de telas" value="3" />}
              </TabList>
              <TabPanel value="1">{<ScreenTable selectedCondominium={condominium} />}</TabPanel>
              <TabPanel value="2">
                {
                  <AddScreens
                    condominium={condominium}
                    setCondominium={setCondominium}
                    noticies={noticies}
                    rss={rss}
                    banner={banner}
                    condominiumMesseger={condominiumMesseger}
                  />
                }
              </TabPanel>
              <TabPanel value="3">
                {
                  <EditScreens
                    setCondominium={setCondominium}
                    condominium={condominium}
                    rss={rss}
                    noticies={noticies}
                    banner={banner}
                    condominiumMesseger={condominiumMesseger}
                    setCondominiumMesseger={setCondominiumMesseger}
                  />
                }
              </TabPanel>
            </TabContext>
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
      </Box>
    </Dialog>
  );
};

export default ScreensDialog;
