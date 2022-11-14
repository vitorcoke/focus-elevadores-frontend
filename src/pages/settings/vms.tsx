import { Box } from "@mui/material";
import { DataGridPro, GridColDef } from "@mui/x-data-grid-pro";
import { GetServerSideProps } from "next";
import { useState } from "react";
import { getAPIClient } from "../../service";
import { Condominium } from "../../types/condominium.type";
import { VMS } from "../../types/vms.type";
import { useControlerButtonPagesContext } from "../../context/ControlerButtonPagesContext";
import AddVmsDialog from "../../components/VmsPageComponent/AddVmsDialog";
import EditVmsDialog from "../../components/VmsPageComponent/EditVmsDialog";
import LayoutPage from "../../layout/AppBar";
import BaseMainLayoutPage from "../../layout/BaseMain";

type VmsProps = {
  initialVms: VMS[];
  initialCondominium: Condominium[];
};

const Vms: React.FC<VmsProps> = ({ initialVms, initialCondominium }) => {
  const { checkboxVms, setCheckboxVms } = useControlerButtonPagesContext();
  const [vms, setVms] = useState(initialVms);
  const [editVms, setEditVms] = useState<VMS>();

  const columns: GridColDef[] = [
    { field: "name", headerName: "Nome", flex: 1 },
    { field: "server", headerName: "IP", flex: 1 },
    { field: "port", headerName: "Porta", flex: 1 },
  ];

  const rows = vms.map((vms) => {
    return {
      id: vms._id,
      _id: vms._id,
      name: vms.name,
      server: vms.server,
      port: vms.port,
      receiver: vms.receiver,
      account: vms.account,
      username: vms.username,
      condominium_id: vms.condominium_id,
    };
  });

  return (
    <LayoutPage>
      <BaseMainLayoutPage page="vms" title="VMS" setVms={setVms}>
        <Box width="100%" height="60vh">
          <DataGridPro
            rows={rows}
            columns={columns}
            checkboxSelection
            selectionModel={checkboxVms}
            onSelectionModelChange={(e) => setCheckboxVms(e)}
            onCellClick={(params) =>
              checkboxVms.length === 0
                ? setEditVms(params.row as VMS)
                : setEditVms(undefined)
            }
          />
          <AddVmsDialog setVms={setVms} condominium={initialCondominium} />
          {editVms && (
            <EditVmsDialog condominium={initialCondominium} vms={editVms} />
          )}
        </Box>
      </BaseMainLayoutPage>
    </LayoutPage>
  );
};

export default Vms;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const api = getAPIClient(ctx);
  try {
    const vms = await api.get<VMS[]>("/vms");
    const condominium = await api.get<Condominium[]>("/condominium?query=all");
    return {
      props: {
        initialVms: vms.data,
        initialCondominium: condominium.data,
      },
    };
  } catch {
    return {
      props: {
        initialVms: [],
        initialCondominium: [],
      },
    };
  }
};
