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
import { Noticies } from "../../types/noticies.type";
import AddNoticies from "../../components/NoticiesPageComponent/AddNoticiesDialog";
import EditNoticies from "../../components/NoticiesPageComponent/EditNoticiesDialog";

type NoticiesProps = {
  initialNoticies: Noticies[];
};

const NoticiesPage: React.FC<NoticiesProps> = ({ initialNoticies }) => {
  const { checkboxNoticies, setCheckboxNoticies } = useControlerButtonPagesContext();

  const [noticies, setNoticies] = useState(initialNoticies);
  const [editNoticies, setEditNoticies] = useState<Noticies>();
  const columns: GridColDef[] = [
    { field: "name", headerName: "Nome", flex: 2 },
    { field: "screens", headerName: "Qtds. Telas", flex: 1 },
  ];

  const rows = noticies.map((noticie: Noticies) => {
    return {
      id: noticie._id,
      screens: noticie.screen_id.length > 0 ? noticie.screen_id.length : 0,
      ...noticie,
    };
  });

  return (
    <LayoutPage>
      <BaseMainLayoutPage title="Noticias" page="noticies" setNoticies={setNoticies}>
        <Box width="100%" height="60vh">
          <DataGridPro
            checkboxSelection
            selectionModel={checkboxNoticies}
            onSelectionModelChange={(e) => setCheckboxNoticies(e)}
            components={{
              Toolbar: GridToolbar,
            }}
            rows={rows}
            columns={columns}
            onCellClick={(params) =>
              checkboxNoticies.length === 0
                ? setEditNoticies(params.row as Noticies)
                : setEditNoticies(undefined)
            }
          />
          <AddNoticies setNoticies={setNoticies} />
          {editNoticies && <EditNoticies noticies={editNoticies} setNoticies={setNoticies} />}
        </Box>
      </BaseMainLayoutPage>
    </LayoutPage>
  );
};

export default withAllPermission(NoticiesPage);

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const api = getAPIClient(ctx);

  try {
    const { data } = await api.get<Noticies[]>("/noticies");

    return {
      props: { initialNoticies: data },
    };
  } catch {
    return {
      props: { initialNoticies: [] },
    };
  }
};

