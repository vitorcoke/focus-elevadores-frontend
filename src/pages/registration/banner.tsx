import { useMemo, useState } from "react";
import { DataTable, PageToolbar } from "../../components/design-system";
import { useControlerButtonPagesContext } from "../../context/ControlerButtonPagesContext";
import { withAllPermission } from "../../hocs";
import LayoutPage from "../../layout/AppBar";
import { GetServerSideProps } from "next";
import { api, getAPIClient } from "../../service";
import { Banner } from "../../types/banner.type";
import AddBannerDialog from "../../components/BannerPageComponent/AddBannerDialog";
import EditBannerDialog from "../../components/BannerPageComponent/EditBannerDialog";

type BannerProps = { initialBanner: Banner[] };
type BannerRow = Banner & { id: string };

const BannerPage: React.FC<BannerProps> = ({ initialBanner }) => {
  const { checkboxBanner, setCheckboxBanner, setOpenDialogCreateBanner, setOpenDialogEditBanner } = useControlerButtonPagesContext();
  const [banner, setBanner] = useState(initialBanner);
  const [editing, setEditing] = useState<Banner | null>(null);

  const rows = useMemo<BannerRow[]>(() => banner.map((item) => ({ ...item, id: item._id })), [banner]);

  const openEdit = () => {
    if (checkboxBanner.length !== 1) return;
    const found = banner.find((item) => item._id === checkboxBanner[0]);
    if (!found) return;
    setEditing(found);
    setOpenDialogEditBanner(true);
  };

  const handleDelete = async () => {
    await Promise.all(
      checkboxBanner.map(async (id) => {
        await api.delete(`/banner/${id}`);
        await api.delete(`/screens/banner/${id}`);
      })
    );
    setBanner((current) => current.filter((item) => !checkboxBanner.includes(item._id)));
    setCheckboxBanner([]);
  };

  return (
    <LayoutPage>
      <div className="ds-stack">
        <PageToolbar title="Banners" onNew={() => setOpenDialogCreateBanner(true)} onEdit={openEdit} onDelete={handleDelete} hasSelection={checkboxBanner.length > 0} />
        <DataTable
          rows={rows}
          selectedIds={checkboxBanner}
          onSelectionChange={setCheckboxBanner}
          onRowClick={(row) => {
            setEditing(row);
            if (checkboxBanner.length === 0) setOpenDialogEditBanner(true);
          }}
          searchPlaceholder="Buscar banner por nome ou descricao"
          columns={[
            { key: "preview", header: "Preview", width: "140px", render: (row) => <div aria-label={row.name} style={{ width: 88, height: 48, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", backgroundImage: `url(${row.image})`, backgroundSize: "cover", backgroundPosition: "center" }} /> },
            { key: "name", header: "Nome", render: (row) => row.name, searchValue: (row) => row.name },
            { key: "description", header: "Descricao", render: (row) => row.description, searchValue: (row) => row.description },
            { key: "colors", header: "Cores", render: (row) => <div className="ds-tag-list"><span className="ds-tag">{row.background_color}</span><span className="ds-tag">{row.font_color}</span></div> },
          ]}
        />
      </div>
      <AddBannerDialog setBanner={setBanner} />
      {editing ? <EditBannerDialog banner={editing} setBanner={setBanner} /> : null}
    </LayoutPage>
  );
};

export default withAllPermission(BannerPage);

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const api = getAPIClient(ctx);
  try {
    const { data } = await api.get<Banner[]>("/banner");
    return { props: { initialBanner: data } };
  } catch {
    return { props: { initialBanner: [] } };
  }
};
