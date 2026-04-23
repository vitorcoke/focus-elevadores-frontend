import { useMemo, useState } from "react";
import { DataTable, PageToolbar } from "../../components/design-system";
import { useControlerButtonPagesContext } from "../../context/ControlerButtonPagesContext";
import { Banner } from "../../types/banner.type";
import { CondominiumMessageType } from "../../types/condominium-message.type";
import { CondominiumType } from "../../types/condominium.type";
import { Noticies } from "../../types/noticies.type";
import { Rss } from "../../types/rss.type";
import { withAllPermission } from "../../hocs";
import LayoutPage from "../../layout/AppBar";
import { GetServerSideProps } from "next";
import { getAPIClient } from "../../service";
import AddCondominium from "../../components/CondominiumPageComponent/AddCondominiumDialog";
import EditCondominium from "../../components/CondominiumPageComponent/EditCondominiumDialog";
import ScreensDialog from "../../components/CondominiumPageComponent/ScreensDialog";

type CondominiumProps = {
  initialCondominium: CondominiumType[];
  initialRss: Rss[];
  initialBanner: Banner[];
  initialCondominiumMessege: CondominiumMessageType[];
  initialNoticies: Noticies[];
};

type CondominiumRow = CondominiumType & { id: string; screenLength: number };

const CondominiumPage: React.FC<CondominiumProps> = ({ initialCondominium, initialRss, initialNoticies, initialBanner, initialCondominiumMessege }) => {
  const { checkboxCondominium, setCheckboxCondominium, setOpenDialogCreateCondominium, setOpenDialogEditCondominium, setOpenDialogCreateScreens } = useControlerButtonPagesContext();
  const [condominium, setCondominium] = useState(initialCondominium);
  const [rss] = useState(initialRss);
  const [noticies] = useState(initialNoticies);
  const [banner] = useState(initialBanner);
  const [condominiumMesseger, setCondominiumMesseger] = useState(initialCondominiumMessege);
  const [editing, setEditing] = useState<CondominiumType | null>(null);

  const rows = useMemo<CondominiumRow[]>(() => condominium.map((item) => ({ ...item, id: item._id, screenLength: item.screens?.length || 0 })), [condominium]);

  const openEdit = () => {
    if (checkboxCondominium.length !== 1) return;
    const found = condominium.find((item) => item._id === checkboxCondominium[0]);
    if (!found) return;
    setEditing(found);
    setOpenDialogEditCondominium(true);
  };

  const openScreens = () => {
    if (checkboxCondominium.length !== 1) return;
    const found = condominium.find((item) => item._id === checkboxCondominium[0]);
    if (!found) return;
    setEditing(found);
    setOpenDialogCreateScreens(true);
  };

  return (
    <LayoutPage>
      <div className="ds-stack">
        <PageToolbar
          title="Condominios"
          onNew={() => setOpenDialogCreateCondominium(true)}
          onEdit={openEdit}
          hasSelection={checkboxCondominium.length === 1}
          extraActions={
            <button
              type="button"
              className="ds-button ds-button--secondary"
              disabled={checkboxCondominium.length !== 1}
              onClick={openScreens}
            >
              Gerenciar telas
            </button>
          }
        />
        <DataTable
          rows={rows}
          selectedIds={checkboxCondominium}
          onSelectionChange={setCheckboxCondominium}
          onRowClick={(row) => setEditing(row)}
          searchPlaceholder="Buscar por nome, ID, bairro ou cidade"
          columns={[
            { key: "id_imodulo", header: "ID", width: "120px", render: (row) => row.condominium_id_imodulo, searchValue: (row) => String(row.condominium_id_imodulo) },
            { key: "name", header: "Nome", render: (row) => row.name, searchValue: (row) => row.name },
            { key: "district", header: "Bairro", render: (row) => row.district, searchValue: (row) => row.district },
            { key: "city", header: "Cidade", render: (row) => row.city, searchValue: (row) => row.city },
            { key: "screens", header: "Telas", width: "120px", render: (row) => row.screenLength },
          ]}
        />
      </div>
      <AddCondominium setCondominium={setCondominium} />
      {editing ? <EditCondominium condominium={editing} setCondominium={setCondominium} /> : null}
      {editing ? <ScreensDialog condominium={editing} setCondominium={setCondominium} rss={rss} banner={banner} noticies={noticies} condominiumMesseger={condominiumMesseger} setCondominiumMesseger={setCondominiumMesseger} /> : null}
    </LayoutPage>
  );
};

export default withAllPermission(CondominiumPage);

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const api = getAPIClient(ctx);
  try {
    const condominium = await api.get<CondominiumType[]>("/condominium?query=all");
    const rss = await api.get<Rss[]>("/source-rss");
    const banner = await api.get<Banner[]>("/banner");
    const condominiumMessege = await api.get<CondominiumMessageType[]>("/condominium-message");
    const noticies = await api.get<Noticies[]>("/noticies");
    return { props: { initialCondominium: condominium.data, initialRss: rss.data, initialBanner: banner.data, initialCondominiumMessege: condominiumMessege.data, initialNoticies: noticies.data } };
  } catch {
    return { props: { initialCondominium: [], initialRss: [], initialBanner: [], initialCondominiumMessege: [], initialNoticies: [] } };
  }
};
