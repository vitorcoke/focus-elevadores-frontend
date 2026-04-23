import {
  ApartmentRounded,
  AppRegistrationRounded,
  ChevronLeftRounded,
  ChevronRightRounded,
  CommentRounded,
  DashboardRounded,
  ExpandLessRounded,
  ExpandMoreRounded,
  LogoutRounded,
  MenuRounded,
  NewspaperRounded,
  NotificationsRounded,
  Person2Rounded,
  PersonAddAlt1Rounded,
  PhotoLibraryRounded,
  SettingsRounded,
  VideocamRounded,
} from "@mui/icons-material";
import {
  alpha,
  Avatar,
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { Permission } from "../../types/users.type";

type LayoutPageProps = {
  children: React.ReactNode;
};

const DRAWER_WIDTH = 280;
const COLLAPSED_WIDTH = 92;

const permissionLabel: Record<Permission, string> = {
  [Permission.ZELADOR]: "Zelador",
  [Permission.SINDICO]: "Sindico",
  [Permission.ADMIN]: "Administrador",
};

const LayoutPage: React.FC<LayoutPageProps> = ({ children }) => {
  const theme = useTheme();
  const lgDown = useMediaQuery(theme.breakpoints.down("lg"));
  const router = useRouter();
  const match = router.pathname;
  const { singOut, user } = useAuthContext();
  const [openSettings, setOpenSettings] = useState(match.startsWith("/settings"));
  const [openRegistration, setOpenRegistration] = useState(match.startsWith("/registration"));
  const [openDrawer, setOpenDrawer] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const sidebarWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;
  const isExpanded = !collapsed;

  const registrationItems = useMemo(
    () =>
      [
        { label: "Condominio", href: "/registration/condominium", icon: <ApartmentRounded />, show: true },
        { label: "Noticias", href: "/registration/noticies", icon: <NewspaperRounded />, show: user?.permission === Permission.ADMIN },
        { label: "Banner", href: "/registration/banner", icon: <PhotoLibraryRounded />, show: user?.permission === Permission.ADMIN },
        { label: "Mensagem", href: "/registration/condominium-messeger", icon: <CommentRounded />, show: true },
        { label: "Usuario", href: "/registration/user", icon: <PersonAddAlt1Rounded />, show: user?.permission !== Permission.ZELADOR },
      ].filter((item) => item.show),
    [user?.permission]
  );

  const settingsItems = useMemo(
    () => [{ label: "VMS", href: "/settings/vms", icon: <VideocamRounded />, show: user?.permission === Permission.ADMIN }].filter((item) => item.show),
    [user?.permission]
  );

  const handleNavigation = (href: string) => {
    router.push(href);
    setOpenDrawer(false);
  };

  const renderNavItem = (label: string, href: string, icon: React.ReactNode, nested = false) => {
    const isActive = match === href;

    return (
      <ListItemButton
        onClick={() => handleNavigation(href)}
        selected={isActive}
        sx={{
          flexGrow: 0,
          width: "100%",
          minHeight: 48,
          mb: 0.75,
          px: isExpanded ? 1.5 : 1,
          py: 1,
          ml: nested ? 1 : 0,
          justifyContent: isExpanded ? "flex-start" : "center",
          borderRadius: 3,
          border: "1px solid transparent",
          color: "text.secondary",
          "&.Mui-selected": {
            color: "primary.main",
            borderColor: alpha(theme.palette.primary.main, 0.24),
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
            boxShadow: `0 14px 32px ${alpha(theme.palette.primary.main, 0.18)}`,
          },
          "&.Mui-selected:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.16),
          },
          "&:hover": {
            backgroundColor: alpha(theme.palette.common.white, 0.04),
          },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: isExpanded ? 1.5 : 0,
            justifyContent: "center",
            color: "inherit",
          }}
        >
          {icon}
        </ListItemIcon>
        {isExpanded && (
          <ListItemText
            primary={label}
            primaryTypographyProps={{ fontSize: 14, fontWeight: isActive ? 700 : 500 }}
          />
        )}
      </ListItemButton>
    );
  };

  const sidebarContent = (
    <Box
      display="flex"
      flexDirection="column"
      height="100%"
      px={isExpanded ? 2 : 1.25}
      py={2}
      sx={{ background: "linear-gradient(180deg, rgba(12,17,33,0.98) 0%, rgba(7,10,22,0.98) 100%)" }}
    >
      <Box display="flex" alignItems="center" justifyContent={isExpanded ? "space-between" : "center"} px={isExpanded ? 1 : 0} pb={2}>
        <Box display="flex" alignItems="center" gap={isExpanded ? 1.5 : 0}>
          <Box sx={{ width: 42, height: 42, borderRadius: 3, background: "var(--gradient-primary)", display: "grid", placeItems: "center", boxShadow: "0 18px 34px rgba(109, 91, 255, 0.28)" }}>
            <ApartmentRounded sx={{ color: "primary.contrastText" }} />
          </Box>
          {isExpanded && (
            <Box>
              <Typography fontSize={15} fontWeight={800} color="common.white">Minha Portaria</Typography>
              <Typography fontSize={11} color="text.secondary">Painel administrativo</Typography>
            </Box>
          )}
        </Box>

        {!lgDown && isExpanded && (
          <IconButton onClick={() => setCollapsed(true)} size="small">
            <ChevronLeftRounded />
          </IconButton>
        )}
      </Box>

      {!lgDown && !isExpanded && (
        <IconButton onClick={() => setCollapsed(false)} size="small" sx={{ alignSelf: "center", mb: 2 }}>
          <ChevronRightRounded />
        </IconButton>
      )}

      <Divider sx={{ borderColor: alpha(theme.palette.common.white, 0.08), mb: 2 }} />

      <List sx={{ p: 0 }}>
        {isExpanded && <Typography variant="caption" className="sidebar-section-label">Principal</Typography>}
        {renderNavItem("Dashboard", "/dashboard", <DashboardRounded />)}

        {isExpanded && <Typography variant="caption" className="sidebar-section-label">Cadastros</Typography>}
        <ListItemButton onClick={() => setOpenRegistration((state) => !state)} sx={{ minHeight: 46, mb: 0.75, px: isExpanded ? 1.5 : 1, borderRadius: 3, justifyContent: isExpanded ? "space-between" : "center", color: "text.secondary" }}>
          <Box display="flex" alignItems="center" gap={isExpanded ? 1.5 : 0}>
            <ListItemIcon sx={{ minWidth: 0, mr: isExpanded ? 1.5 : 0, justifyContent: "center", color: "inherit" }}>
              <AppRegistrationRounded />
            </ListItemIcon>
            {isExpanded && <Typography fontSize={14} fontWeight={600}>Cadastros</Typography>}
          </Box>
          {isExpanded && (openRegistration ? <ExpandLessRounded /> : <ExpandMoreRounded />)}
        </ListItemButton>
        <Collapse in={openRegistration || !isExpanded}>
          <Box>{registrationItems.map((item) => renderNavItem(item.label, item.href, item.icon, true))}</Box>
        </Collapse>

        {settingsItems.length > 0 && (
          <>
            {isExpanded && <Typography variant="caption" className="sidebar-section-label">Configuracoes</Typography>}
            <ListItemButton onClick={() => setOpenSettings((state) => !state)} sx={{ minHeight: 46, mb: 0.75, px: isExpanded ? 1.5 : 1, borderRadius: 3, justifyContent: isExpanded ? "space-between" : "center", color: "text.secondary" }}>
              <Box display="flex" alignItems="center" gap={isExpanded ? 1.5 : 0}>
                <ListItemIcon sx={{ minWidth: 0, mr: isExpanded ? 1.5 : 0, justifyContent: "center", color: "inherit" }}>
                  <SettingsRounded />
                </ListItemIcon>
                {isExpanded && <Typography fontSize={14} fontWeight={600}>Configuracoes</Typography>}
              </Box>
              {isExpanded && (openSettings ? <ExpandLessRounded /> : <ExpandMoreRounded />)}
            </ListItemButton>
            <Collapse in={openSettings || !isExpanded}>
              <Box>{settingsItems.map((item) => renderNavItem(item.label, item.href, item.icon, true))}</Box>
            </Collapse>
          </>
        )}
      </List>

      <Box flex={1} />

      <Divider sx={{ borderColor: alpha(theme.palette.common.white, 0.08), my: 2 }} />

      {user?.permission !== Permission.ZELADOR && renderNavItem("Meu perfil", "/profile", <Person2Rounded />)}

      <Box className="glass-panel" sx={{ p: isExpanded ? 1.5 : 1, display: "flex", alignItems: "center", justifyContent: isExpanded ? "space-between" : "center", gap: 1.5 }}>
        <Box display="flex" alignItems="center" gap={1.5} overflow="hidden">
          <Avatar sx={{ width: 38, height: 38, background: "var(--gradient-primary)", color: "primary.contrastText", fontWeight: 800 }}>
            {user?.name?.charAt(0).toUpperCase() || "M"}
          </Avatar>
          {isExpanded && (
            <Box overflow="hidden">
              <Typography fontSize={13} fontWeight={700} noWrap>{user?.name || "Minha Portaria"}</Typography>
              <Typography fontSize={11} color="text.secondary" noWrap>{user?.permission !== undefined ? permissionLabel[user.permission] : ""}</Typography>
            </Box>
          )}
        </Box>

        {isExpanded && (
          <IconButton onClick={singOut} size="small" title="Sair">
            <LogoutRounded fontSize="small" />
          </IconButton>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {lgDown ? (
        <Drawer
          open={openDrawer}
          onClose={() => setOpenDrawer(false)}
          PaperProps={{ sx: { width: DRAWER_WIDTH, bgcolor: "transparent", backgroundImage: "none", borderRight: "1px solid rgba(255,255,255,0.08)" } }}
        >
          {sidebarContent}
        </Drawer>
      ) : (
        <Box component="aside" sx={{ position: "fixed", inset: "0 auto 0 0", width: sidebarWidth, borderRight: "1px solid rgba(255,255,255,0.08)", zIndex: theme.zIndex.drawer + 2, transition: theme.transitions.create("width", { duration: theme.transitions.duration.standard }) }}>
          {sidebarContent}
        </Box>
      )}

      <Box sx={{ minHeight: "100vh", ml: lgDown ? 0 : `${sidebarWidth}px`, transition: theme.transitions.create("margin-left", { duration: theme.transitions.duration.standard }) }}>
        <Box component="header" sx={{ position: "sticky", top: 0, zIndex: theme.zIndex.appBar, height: 72, px: { xs: 2, md: 4 }, display: "flex", alignItems: "center", justifyContent: "space-between", backdropFilter: "blur(18px)", borderBottom: "1px solid rgba(255,255,255,0.08)", backgroundColor: alpha(theme.palette.background.paper, 0.76) }}>
          <Box display="flex" alignItems="center" gap={2}>
            {lgDown && (
              <IconButton onClick={() => setOpenDrawer(true)}>
                <MenuRounded />
              </IconButton>
            )}
            <Box>
              <Typography variant="h6" fontWeight={800} letterSpacing="-0.03em">Minha Portaria</Typography>
              <Typography fontSize={12} color="text.secondary">Gerenciamento de comunicacao e exibicao</Typography>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={1.5}>
            <IconButton sx={{ bgcolor: alpha(theme.palette.common.white, 0.04), border: "1px solid rgba(255,255,255,0.08)" }}>
              <NotificationsRounded fontSize="small" />
            </IconButton>
            <Box className="glass-panel" sx={{ px: 1.25, py: 0.75, display: "flex", alignItems: "center", gap: 1.25 }}>
              <Avatar sx={{ width: 34, height: 34, background: "var(--gradient-primary)", color: "primary.contrastText", fontSize: 14, fontWeight: 800 }}>
                {user?.name?.charAt(0).toUpperCase() || "M"}
              </Avatar>
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
                <Typography fontSize={13} fontWeight={700} lineHeight={1.1}>{user?.name || "Minha Portaria"}</Typography>
                <Typography fontSize={11} color="text.secondary" lineHeight={1.1}>{user?.permission !== undefined ? permissionLabel[user.permission] : ""}</Typography>
              </Box>
              <IconButton onClick={singOut} size="small" title="Sair">
                <LogoutRounded fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>

        <Box component="main" sx={{ px: { xs: 2, md: 4 }, py: { xs: 3, md: 4 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default LayoutPage;
