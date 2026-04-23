import { useMemo, useState } from "react";
import { DataTable, PageToolbar } from "../../components/design-system";
import { useControlerButtonPagesContext } from "../../context/ControlerButtonPagesContext";
import { withAllPermission } from "../../hocs";
import LayoutPage from "../../layout/AppBar";
import { GetServerSideProps } from "next";
import { getAPIClient } from "../../service";
import { Rss } from "../../types/rss.type";
import AddRss from "../../components/RssPageComponent/AddRssDialog";
import EditRss from "../../components/RssPageComponent/EditRssDialog";

type RssProps = { initialRss: Rss[] };
type RssRow = Rss & { id: string; screens: number };

const RssPage: React.FC<RssProps> = ({ initialRss }) => {
  const { checkboxRss, setCheckboxRss, setOpenDialogCreateRss, setOpenDialogEditRss } = useControlerButtonPagesContext();
  const [rss, setRss] = useState(initialRss);
  const [editing, setEditing] = useState<Rss | null>(null);

  const rows = useMemo<RssRow[]>(() => rss.map((item) => ({ ...item, id: item._id, screens: item.screen_id?.length || 0 })), [rss]);

  const openEdit = () => {
    if (checkboxRss.length !== 1) return;
    const found = rss.find((item) => item._id === checkboxRss[0]);
    if (!found) return;
    setEditing(found);
    setOpenDialogEditRss(true);
  };

  return (
    <LayoutPage>
      <div className="ds-stack">
        <PageToolbar title="RSS" onNew={() => setOpenDialogCreateRss(true)} onEdit={openEdit} hasSelection={checkboxRss.length === 1} />
        <DataTable
          rows={rows}
          selectedIds={checkboxRss}
          onSelectionChange={setCheckboxRss}
          onRowClick={(row) => {
            setEditing(row);
            if (checkboxRss.length === 0) setOpenDialogEditRss(true);
          }}
          searchPlaceholder="Buscar por nome ou URL"
          columns={[
            { key: "logo", header: "Logo", width: "140px", render: (row) => <div aria-label={row.name} style={{ width: 54, height: 54, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", backgroundImage: `url(${row.logotipo})`, backgroundSize: "cover", backgroundPosition: "center" }} /> },
            { key: "name", header: "Nome", render: (row) => row.name, searchValue: (row) => row.name },
            { key: "url", header: "URL", render: (row) => row.url, searchValue: (row) => row.url },
            { key: "screens", header: "Telas", width: "120px", render: (row) => row.screens },
          ]}
        />
      </div>
      <AddRss setRss={setRss} />
      {editing ? <EditRss rss={editing} setRss={setRss} /> : null}
    </LayoutPage>
  );
};

export default withAllPermission(RssPage);

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const api = getAPIClient(ctx);
  try {
    const { data } = await api.get<Rss[]>("/source-rss");
    return { props: { initialRss: data } };
  } catch {
    return { props: { initialRss: [] } };
  }
};
