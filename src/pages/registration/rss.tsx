import { Avatar, Box } from "@mui/material";
import { DataGridPro, GridColDef } from "@mui/x-data-grid-pro";
import { GetServerSideProps } from "next";
import { useState } from "react";
import AddRss from "../../components/RssPageComponent/AddRssDialog";
import EditRss from "../../components/RssPageComponent/EditRssDialog";
import { useControlerButtonPagesContext } from "../../context/ControlerButtonPagesContext";
import { withAllPermission } from "../../hocs";
import LayoutPage from "../../layout/AppBar";
import BaseMainLayoutPage from "../../layout/BaseMain";
import { getAPIClient } from "../../service";
import { Rss } from "../../types/rss.type";

type RssProps = {
  initialRss: Rss[];
};

const Rss: React.FC<RssProps> = ({ initialRss }) => {
  const { checkboxRss, setCheckboxRss } = useControlerButtonPagesContext();

  const [rss, setRss] = useState(initialRss);
  const [editRss, setEditRss] = useState<Rss>();

  const columns: GridColDef[] = [
    {
      field: "logotipo",
      headerName: "Logotipo",
      flex: 1,
      renderCell: (params) => <Avatar src={params.row.logotipo} />,
    },
    { field: "name", headerName: "Nome", flex: 2 },
    { field: "url", headerName: "URL", flex: 3 },
  ];

  const rows = rss.map((rss) => {
    return {
      id: rss._id,
      _id: rss._id,
      name: rss.name,
      url: rss.url,
      logotipo: rss.logotipo,
    };
  });

  return (
    <LayoutPage>
      <BaseMainLayoutPage title="RSS" page="rss" setRss={setRss}>
        <Box width="100%" height="60vh">
          <DataGridPro
            checkboxSelection
            selectionModel={checkboxRss}
            onSelectionModelChange={(e) => setCheckboxRss(e)}
            rows={rows}
            columns={columns}
            onCellClick={(params) =>
              checkboxRss.length === 0
                ? setEditRss(params.row as Rss)
                : setEditRss(undefined)
            }
          />
          <AddRss setRss={setRss} />
          {editRss && <EditRss rss={editRss} setRss={setRss} />}
        </Box>
      </BaseMainLayoutPage>
    </LayoutPage>
  );
};

export default withAllPermission(Rss);

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const api = getAPIClient(ctx);

  try {
    const { data } = await api.get<Rss[]>("/source-rss");

    return {
      props: { initialRss: data },
    };
  } catch {
    return {
      props: { initialRss: [] },
    };
  }
};
