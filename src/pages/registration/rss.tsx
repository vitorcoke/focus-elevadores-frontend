import { Avatar, Box } from "@mui/material";
import { DataGridPro, GridColDef, GridToolbar } from "@mui/x-data-grid-pro";
import { GetServerSideProps } from "next";
import { useState } from "react";
import { useControlerButtonPagesContext } from "../../context/ControlerButtonPagesContext";
import { withAllPermission } from "../../hocs";
import { getAPIClient } from "../../service";
import { Rss } from "../../types/rss.type";
import LayoutPage from "../../layout/AppBar";
import BaseMainLayoutPage from "../../layout/BaseMain";
import AddRss from "../../components/RssPageComponent/AddRssDialog";
import EditRss from "../../components/RssPageComponent/EditRssDialog";

type RssProps = {
  initialRss: Rss[];
};

const RssPage: React.FC<RssProps> = ({ initialRss }) => {
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
    { field: "screens", headerName: "Qtds. Telas", flex: 1 },
  ];

  const rows = rss.map((rss) => {
    return {
      id: rss._id,
      _id: rss._id,
      name: rss.name,
      url: rss.url,
      logotipo: rss.logotipo,
      screen_id: rss.screen_id,
      screens: rss.screen_id?.length,
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
            components={{
              Toolbar: GridToolbar,
            }}
            rows={rows}
            columns={columns}
            onCellClick={(params) => (checkboxRss.length === 0 ? setEditRss(params.row as Rss) : setEditRss(undefined))}
          />
          <AddRss setRss={setRss} />
          {editRss && <EditRss rss={editRss} setRss={setRss} />}
        </Box>
      </BaseMainLayoutPage>
    </LayoutPage>
  );
};

export default withAllPermission(RssPage);

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
