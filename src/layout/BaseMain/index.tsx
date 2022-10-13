import {
  Box,
  Button,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import produce from "immer";
import { useControlerButtonPagesContext } from "../../context/ControlerButtonPagesContext";
import { api } from "../../service";
import { Banner } from "../../types/banner.type";
import { Condominium } from "../../types/condominium.type";
import { Rss } from "../../types/rss.type";
import { User } from "../../types/users.type";

type BaseMainLayoutPageProps = {
  children: React.ReactNode;
  title: string;
  page: "condominium" | "rss" | "user" | "banner" | "profile";
  setCondominium?: React.Dispatch<React.SetStateAction<Condominium[]>>;
  setRss?: React.Dispatch<React.SetStateAction<Rss[]>>;
  setBanner?: React.Dispatch<React.SetStateAction<Banner[]>>;
  setUser?: React.Dispatch<React.SetStateAction<User[]>>;
};

const BaseMainLayoutPage: React.FC<BaseMainLayoutPageProps> = ({
  children,
  title,
  page,
  setCondominium,
  setRss,
  setBanner,
  setUser,
}) => {
  const theme = useTheme();
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    checkboxCondominium,
    checkboxRss,
    checkboxBanner,
    checkboxUser,
    setCheckboxCondominium,
    setCheckboxRss,
    setCheckboxBanner,
    setCheckboxUser,
    setOpenDialogCreateCondominium,
    setOpenDialogEditCondominium,
    setOpenDialogCreateScreens,
    setOpenDialogCreateRss,
    setOpenDialogEditRss,
    setOpenDialogCreateBanner,
    setOpenDialogEditBanner,
    setOpenDialogCreateUser,
    setOpenDialogEditUser,
  } = useControlerButtonPagesContext();

  const handleDeleteCondominium = () => {
    try {
      checkboxCondominium.map(async (id) => {
        await api.delete(`/condominium/${id}`);
        await api.delete(`/screens/condominium_id/${id}`);
        setCondominium &&
          setCondominium((prev) =>
            produce(prev, (draft) => {
              let index = draft.findIndex((item) => item._id === id);
              draft.splice(index, 1);
            })
          );
      });
    } catch {
      console.log("erro");
    }
  };

  const handleDeleteRss = () => {
    try {
      checkboxRss.map(async (id) => {
        await api.delete(`/source-rss/${id}`);
        await api.delete(`/screens/rss/${id}`);
        setRss &&
          setRss((prev) =>
            produce(prev, (draft) => {
              let index = draft.findIndex((item) => item._id === id);
              draft.splice(index, 1);
            })
          );
      });
    } catch {
      console.log("error");
    }
  };

  const handleDeleteBanner = () => {
    try {
      checkboxBanner.map(async (id) => {
        await api.delete(`/banner/${id}`);
        setBanner &&
          setBanner((prev) =>
            produce(prev, (draft) => {
              let index = draft.findIndex((item) => item._id === id);
              draft.splice(index, 1);
            })
          );
      });
    } catch {
      console.log("error");
    }
  };

  const handleDeleteUser = () => {
    try {
      checkboxUser.map(async (id) => {
        await api.delete(`/users/${id}`);
        setUser &&
          setUser((prev) =>
            produce(prev, (draft) => {
              let index = draft.findIndex((item) => item._id === id);
              draft.splice(index, 1);
            })
          );
      });
    } catch {
      console.log("error");
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <Typography variant="h4">{title}</Typography>

      {page === "condominium" && (
        <Box
          component={Paper}
          p={2}
          display="flex"
          justifyContent="space-between"
          gap={2}
        >
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              onClick={() => setOpenDialogCreateCondominium(true)}
              size={smDown ? "small" : "medium"}
            >
              Novo
            </Button>

            {checkboxCondominium.length > 0 && (
              <>
                <Button
                  variant="contained"
                  onClick={() =>
                    checkboxCondominium.length > 1
                      ? (alert("Altera um condominio por vez"),
                        setCheckboxCondominium([]))
                      : setOpenDialogEditCondominium(true)
                  }
                  size={smDown ? "small" : "medium"}
                >
                  Alterar
                </Button>
                <Button
                  variant="contained"
                  onClick={handleDeleteCondominium}
                  size={smDown ? "small" : "medium"}
                >
                  Excluir
                </Button>
              </>
            )}
          </Box>

          {checkboxCondominium.length > 0 && (
            <Button
              variant="contained"
              onClick={() =>
                checkboxCondominium.length > 1
                  ? (alert("Altere um condominio por vez"),
                    setCheckboxCondominium([]))
                  : setOpenDialogCreateScreens(true)
              }
              size={smDown ? "small" : "medium"}
            >
              Telas
            </Button>
          )}
        </Box>
      )}
      {page === "rss" && (
        <Box
          component={Paper}
          p={2}
          display="flex"
          justifyContent="space-between"
          gap={2}
        >
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              onClick={() => setOpenDialogCreateRss(true)}
            >
              Novo
            </Button>

            {checkboxRss.length > 0 && (
              <>
                <Button
                  variant="contained"
                  onClick={() =>
                    checkboxRss.length > 1
                      ? (alert("Altere um rss por vez"), setCheckboxRss([]))
                      : setOpenDialogEditRss(true)
                  }
                >
                  Alterar
                </Button>
                <Button variant="contained" onClick={handleDeleteRss}>
                  Excluir
                </Button>
              </>
            )}
          </Box>
        </Box>
      )}
      {page === "banner" && (
        <Box
          component={Paper}
          p={2}
          display="flex"
          justifyContent="space-between"
          gap={2}
        >
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              onClick={() => setOpenDialogCreateBanner(true)}
            >
              Novo
            </Button>

            {checkboxBanner.length > 0 && (
              <>
                <Button
                  variant="contained"
                  onClick={() =>
                    checkboxBanner.length > 1
                      ? (alert("Altere um banner por vez"),
                        setCheckboxBanner([]))
                      : setOpenDialogEditBanner(true)
                  }
                >
                  Alterar
                </Button>
                <Button variant="contained" onClick={handleDeleteBanner}>
                  Excluir
                </Button>
              </>
            )}
          </Box>
        </Box>
      )}
      {page === "user" && (
        <Box
          component={Paper}
          p={2}
          display="flex"
          justifyContent="space-between"
          gap={2}
        >
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              onClick={() => setOpenDialogCreateUser(true)}
            >
              Novo
            </Button>

            {checkboxUser.length > 0 && (
              <>
                <Button
                  variant="contained"
                  onClick={() =>
                    checkboxBanner.length > 1
                      ? (alert("Altere um usuário por vez"),
                        setCheckboxUser([]))
                      : setOpenDialogEditUser(true)
                  }
                >
                  Alterar
                </Button>
                <Button variant="contained" onClick={handleDeleteUser}>
                  Excluir
                </Button>
              </>
            )}
          </Box>
        </Box>
      )}

      <Box>{children}</Box>
    </Box>
  );
};

export default BaseMainLayoutPage;
