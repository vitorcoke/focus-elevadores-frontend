import { useMemo, useState } from "react";
import { ActionButton, DataTable, PageHero } from "../../components/design-system";
import { useControlerButtonPagesContext } from "../../context/ControlerButtonPagesContext";
import LayoutPage from "../../layout/AppBar";
import { GetServerSideProps } from "next";
import { getAPIClient } from "../../service";
import { CondominiumType } from "../../types/condominium.type";
import { VMS } from "../../types/vms.type";
import AddVmsDialog from "../../components/VmsPageComponent/AddVmsDialog";
import EditVmsDialog from "../../components/VmsPageComponent/EditVmsDialog";

type VmsProps = {
  initialVms: VMS[];
  initialCondominium: CondominiumType[];
};

type VmsRow = VMS & { id: string; condominiumName: string };

const VmsPage: React.FC<VmsProps> = ({ initialVms, initialCondominium }) => {
  const { checkboxVms, setCheckboxVms, setOpenDialogCreateVms, setOpenDialogEditVms } = useControlerButtonPagesContext();
  const [vms, setVms] = useState(initialVms);
  const [editing, setEditing] = useState<VMS | null>(null);

  const rows = useMemo<VmsRow[]>(() => vms.map((item) => ({
    ...item,
    id: item._id,
    condominiumName: initialCondominium.find((condominium) => condominium._id === item.condominium_id)?.name || "Nao vinculado",
  })), [initialCondominium, vms]);

  const openEdit = () => {
    if (checkboxVms.length !== 1) return;
    const found = vms.find((item) => item._id === checkboxVms[0]);
    if (!found) return;
    setEditing(found);
    setOpenDialogEditVms(true);
  };

  return (
    <LayoutPage>
      <div className="ds-stack">
        <PageHero
          title="VMS"
          description="Gerencie conexoes de video, credenciais e vinculos por condominio dentro do novo ecossistema visual."
          aside={<span className="ds-tag">{rows.length} conexoes</span>}
        />

        <div className="ds-split">
          <ActionButton type="button" onClick={() => setOpenDialogCreateVms(true)}>Novo VMS</ActionButton>
          <ActionButton type="button" variant="secondary" disabled={checkboxVms.length !== 1} onClick={openEdit}>Editar selecionado</ActionButton>
        </div>

        <DataTable
          rows={rows}
          selectedIds={checkboxVms}
          onSelectionChange={setCheckboxVms}
          onRowClick={(row) => {
            setEditing(row);
            if (checkboxVms.length === 0) {
              setOpenDialogEditVms(true);
            }
          }}
          searchPlaceholder="Buscar VMS por nome, IP ou condominio"
          columns={[
            { key: "name", header: "Nome", render: (row) => row.name, searchValue: (row) => row.name },
            { key: "server", header: "Servidor", render: (row) => row.server, searchValue: (row) => row.server },
            { key: "port", header: "Porta", width: "120px", render: (row) => row.port },
            { key: "condominium", header: "Condominio", render: (row) => row.condominiumName, searchValue: (row) => row.condominiumName },
          ]}
        />
      </div>

      <AddVmsDialog setVms={setVms} condominium={initialCondominium} />
      {editing ? <EditVmsDialog condominium={initialCondominium} vms={editing} setVms={setVms} /> : null}
    </LayoutPage>
  );
};

export default VmsPage;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const api = getAPIClient(ctx);
  try {
    const vms = await api.get<VMS[]>("/vms");
    const condominium = await api.get<CondominiumType[]>("/condominium?query=all");
    return { props: { initialVms: vms.data, initialCondominium: condominium.data } };
  } catch {
    return { props: { initialVms: [], initialCondominium: [] } };
  }
};
