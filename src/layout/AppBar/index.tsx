import {
  Dashboard,
  ExpandMore,
  ExpandLess,
  AppRegistrationRounded,
  Settings,
  ApartmentRounded,
  Code,
  Person2Rounded,
  PersonAddAlt1Rounded,
  LogoutRounded,
  AdUnitsRounded,
  Menu,
  CommentRounded,
  Videocam,
} from "@mui/icons-material";
import {
  AppBar,
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { Permission } from "../../types/users.type";

type LayoutPageProps = {
  children: React.ReactNode;
};

const LayoutPage: React.FC<LayoutPageProps> = ({ children }) => {
  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));
  const router = useRouter();
  const match = router.pathname;
  const { singOut, user } = useAuthContext();
  const [openSettings, setOpenSettings] = useState(false);
  const [openRegistration, setOpenRegistration] = useState(
    match > "/registration" ? true : false
  );

  const [openDrawer, setOpenDrawer] = useState(false);

  const handleOpenDrawer = () => {
    setOpenDrawer(true);
  };

  const handleCloseDrawer = () => {
    setOpenDrawer(false);
  };

  const handleOpenSettings = () => {
    setOpenSettings(!openSettings);
  };
  const handleopenRegistration = () => {
    setOpenRegistration(!openRegistration);
  };

  return (
    <Box display="flex">
      <AppBar sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Box width="100%" display="flex" justifyContent="space-between">
            {smDown ? (
              <IconButton onClick={handleOpenDrawer}>
                <Menu />
              </IconButton>
            ) : (
              <Box
                component="img"
                src="/logo-minhaportaria-dark.png"
                width="6rem"
                height="2.5rem"
              />
            )}
            <IconButton onClick={singOut}>
              <LogoutRounded />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        open={smDown ? openDrawer : true}
        variant={smDown ? "temporary" : "persistent"}
        onClose={handleCloseDrawer}
      >
        <Toolbar />
        <Box width="230px" display="flex" flexDirection="column" height="100vh">
          <Divider />
          <Box flex={1}>
            <List component="nav">
              <ListItemButton
                onClick={() => router.push("/dashboard")}
                selected={match === "/dashboard"}
              >
                <ListItemIcon>
                  <Dashboard sx={{ color: "#111" }} />
                </ListItemIcon>
                <ListItemText primary="Tela inical" />
              </ListItemButton>
              <ListItemButton onClick={handleopenRegistration}>
                <ListItemIcon>
                  <AppRegistrationRounded sx={{ color: "#111" }} />
                </ListItemIcon>
                <ListItemText primary="Cadastros" />
                {openRegistration ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
              <Collapse in={openRegistration}>
                <ListItemButton
                  sx={{ pl: 4 }}
                  selected={match === "/registration/condominium"}
                  onClick={() => router.push("/registration/condominium")}
                >
                  <ListItemIcon>
                    <ApartmentRounded fontSize="small" sx={{ color: "#111" }} />
                  </ListItemIcon>
                  <ListItemText primary="Condominio" />
                </ListItemButton>
                {user?.permission === Permission.ADMIN && (
                  <ListItemButton
                    sx={{ pl: 4 }}
                    selected={match === "/registration/rss"}
                    onClick={() => router.push("/registration/rss")}
                  >
                    <ListItemIcon>
                      <Code fontSize="small" sx={{ color: "#111" }} />
                    </ListItemIcon>
                    <ListItemText primary="Fonte RSS" />
                  </ListItemButton>
                )}
                {user?.permission === Permission.ADMIN && (
                  <ListItemButton
                    sx={{ pl: 4 }}
                    selected={match === "/registration/banner"}
                    onClick={() => router.push("/registration/banner")}
                  >
                    <ListItemIcon>
                      <AdUnitsRounded fontSize="small" sx={{ color: "#111" }} />
                    </ListItemIcon>
                    <ListItemText primary="Banner" />
                  </ListItemButton>
                )}

                <ListItemButton
                  sx={{ pl: 4 }}
                  selected={match === "/registration/condominium-messeger"}
                  onClick={() =>
                    router.push("/registration/condominium-messeger")
                  }
                >
                  <ListItemIcon>
                    <CommentRounded fontSize="small" sx={{ color: "#111" }} />
                  </ListItemIcon>
                  <ListItemText primary="Mensagem" />
                </ListItemButton>
                {user?.permission !== Permission.ZELADOR && (
                  <ListItemButton
                    sx={{ pl: 4 }}
                    selected={match === "/registration/user"}
                    onClick={() => router.push("/registration/user")}
                  >
                    <ListItemIcon>
                      <PersonAddAlt1Rounded
                        fontSize="small"
                        sx={{ color: "#111" }}
                      />
                    </ListItemIcon>
                    <ListItemText primary="Usuário" />
                  </ListItemButton>
                )}
              </Collapse>
              {user?.permission === Permission.ADMIN && (
                <>
                  <ListItemButton onClick={handleOpenSettings}>
                    <ListItemIcon>
                      <Settings sx={{ color: "#111" }} />
                    </ListItemIcon>
                    <ListItemText primary="Configurações" />
                    {openSettings ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                  <Collapse in={openSettings}>
                    <ListItemButton
                      sx={{ pl: 4 }}
                      selected={match === "/settings/vms"}
                      onClick={() => router.push("/settings/vms")}
                    >
                      <ListItemIcon>
                        <Videocam sx={{ color: "#111" }} />
                      </ListItemIcon>
                      <ListItemText primary="VMS" />
                    </ListItemButton>
                  </Collapse>
                </>
              )}

              {user?.permission !== Permission.ZELADOR && (
                <ListItemButton
                  selected={match === "/profile"}
                  onClick={() => router.push("/profile")}
                >
                  <ListItemIcon>
                    <Person2Rounded sx={{ color: "#111" }} />
                  </ListItemIcon>
                  <ListItemText primary="Meu perfil" />
                </ListItemButton>
              )}
            </List>
          </Box>
        </Box>
      </Drawer>
      <Box width="100%" marginLeft={smDown ? 0 : "230px"} p={3}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default LayoutPage;
