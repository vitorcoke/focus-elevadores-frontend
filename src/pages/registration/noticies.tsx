import { useMemo, useState } from "react";
import { DataTable, PageToolbar } from "../../components/design-system";
import { useControlerButtonPagesContext } from "../../context/ControlerButtonPagesContext";
import { withAllPermission } from "../../hocs";
import LayoutPage from "../../layout/AppBar";
import { GetServerSideProps } from "next";
import { getAPIClient } from "../../service";
import { Noticies } from "../../types/noticies.type";
import AddNoticies from "../../components/NoticiesPageComponent/AddNoticiesDialog";
import EditNoticies from "../../components/NoticiesPageComponent/EditNoticiesDialog";

type NoticiesProps = { initialNoticies: Noticies[] };
type NoticiesRow = Noticies & { id: string; screens: number };

const NoticiesPage: React.FC<NoticiesProps> = ({ initialNoticies }) => {
  const { checkboxNoticies, setCheckboxNoticies, setOpenDialogCreateNoticies, setOpenDialogEditNoticies } = useControlerButtonPagesContext();
  const [noticies, setNoticies] = useState(initialNoticies);
  const [editing, setEditing] = useState<Noticies | null>(null);

  const rows = useMemo<NoticiesRow[]>(() => noticies.map((item) => ({ ...item, id: item._id, screens: item.screen_id?.length || 0 })), [noticies]);

  const openEdit = () => {
    if (checkboxNoticies.length !== 1) return;
    const found = noticies.find((item) => item._id === checkboxNoticies[0]);
    if (!found) return;
    setEditing(found);
    setOpenDialogEditNoticies(true);
  };

  return (
    <LayoutPage>
      <div className="ds-stack">
        <PageToolbar title="Noticias" onNew={() => setOpenDialogCreateNoticies(true)} onEdit={openEdit} hasSelection={checkboxNoticies.length === 1} />
        <DataTable
          rows={rows}
          selectedIds={checkboxNoticies}
          onSelectionChange={setCheckboxNoticies}
          onRowClick={(row) => {
            setEditing(row);
            if (checkboxNoticies.length === 0) setOpenDialogEditNoticies(true);
          }}
          searchPlaceholder="Buscar por nome, categoria, cidade ou estado"
          columns={[
            { key: "name", header: "Nome", render: (row) => row.name, searchValue: (row) => row.name },
            { key: "search", header: "Busca", render: (row) => row.search, searchValue: (row) => row.search },
            { key: "region", header: "Regiao", render: (row) => `${row.city || "-"} / ${row.state || "-"}`, searchValue: (row) => `${row.city} ${row.state}` },
            { key: "category", header: "Categoria", render: (row) => row.category, searchValue: (row) => row.category },
            { key: "screens", header: "Telas", width: "120px", render: (row) => row.screens },
          ]}
        />
      </div>
      <AddNoticies setNoticies={setNoticies} />
      {editing ? <EditNoticies noticies={editing} setNoticies={setNoticies} /> : null}
    </LayoutPage>
  );
};

export default withAllPermission(NoticiesPage);

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const api = getAPIClient(ctx);
  try {
    const { data } = await api.get<Noticies[]>("/noticies");
    return { props: { initialNoticies: data } };
  } catch {
    return { props: { initialNoticies: [] } };
  }
};
