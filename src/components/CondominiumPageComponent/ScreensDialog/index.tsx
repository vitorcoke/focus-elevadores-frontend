import { useState } from "react";
import { ActionButton, Modal } from "../../design-system";
import { useControlerButtonPagesContext } from "../../../context/ControlerButtonPagesContext";
import { useAuthContext } from "../../../context/AuthContext";
import { Banner } from "../../../types/banner.type";
import { CondominiumMessageType } from "../../../types/condominium-message.type";
import { CondominiumType } from "../../../types/condominium.type";
import { Noticies } from "../../../types/noticies.type";
import { Rss } from "../../../types/rss.type";
import { Permission } from "../../../types/users.type";
import AddScreens from "./AddScreens";
import EditScreens from "./EditScreens";
import ScreenTable from "./ScreensTable";

type ScreenDialogProp = {
  condominium: CondominiumType;
  setCondominium: React.Dispatch<React.SetStateAction<CondominiumType[]>>;
  rss: Rss[];
  banner: Banner[];
  noticies: Noticies[];
  condominiumMesseger: CondominiumMessageType[];
  setCondominiumMesseger: React.Dispatch<React.SetStateAction<CondominiumMessageType[]>>;
};

const ScreensDialog: React.FC<ScreenDialogProp> = ({ condominium, setCondominium, rss, noticies, banner, condominiumMesseger, setCondominiumMesseger }) => {
  const { user } = useAuthContext();
  const { setOpenDialogCreateScreens, openDialogCreateScreens, checkboxScreens, setCheckboxScreens, setCheckboxCondominium } = useControlerButtonPagesContext();
  const [tab, setTab] = useState("list");

  const handleCloseDialog = () => {
    setOpenDialogCreateScreens(false);
    setCheckboxScreens([]);
    setCheckboxCondominium([]);
    setTab("list");
  };

  return (
    <Modal open={openDialogCreateScreens} onClose={handleCloseDialog} title={`Telas de ${condominium.name}`} description="Gerencie a lista de telas, cadastros e edicoes dentro do layout do design system." size="xl">
      <div className="ds-stack">
        <div className="ds-split">
          <ActionButton type="button" variant={tab === "list" ? "primary" : "secondary"} onClick={() => setTab("list")}>Lista de telas</ActionButton>
          {user?.permission === Permission.ADMIN ? <ActionButton type="button" variant={tab === "create" ? "primary" : "secondary"} onClick={() => setTab("create")}>Cadastro de telas</ActionButton> : null}
          {checkboxScreens.length === 1 ? <ActionButton type="button" variant={tab === "edit" ? "primary" : "secondary"} onClick={() => setTab("edit")}>Editar tela</ActionButton> : null}
        </div>
        {tab === "list" ? <ScreenTable selectedCondominium={condominium} /> : null}
        {tab === "create" ? <AddScreens condominium={condominium} setCondominium={setCondominium} noticies={noticies} rss={rss} banner={banner} condominiumMesseger={condominiumMesseger} /> : null}
        {tab === "edit" ? <EditScreens setCondominium={setCondominium} condominium={condominium} rss={rss} noticies={noticies} banner={banner} condominiumMesseger={condominiumMesseger} setCondominiumMesseger={setCondominiumMesseger} /> : null}
      </div>
    </Modal>
  );
};

export default ScreensDialog;
