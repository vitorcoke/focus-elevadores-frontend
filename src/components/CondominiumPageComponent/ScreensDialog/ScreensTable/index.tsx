import { Box } from "@mui/material";
import { DataGridPro, GridColDef, GridToolbar } from "@mui/x-data-grid-pro";
import { useState, useEffect } from "react";
import { useControlerButtonPagesContext } from "../../../../context/ControlerButtonPagesContext";
import { api } from "../../../../service";
import { CondominiumType } from "../../../../types/condominium.type";
import { Screen } from "../../../../types/screens.type";
import dayjs from "dayjs";

type ScreenTableProps = {
  selectedCondominium: CondominiumType;
};

const ScreenTable: React.FC<ScreenTableProps> = ({ selectedCondominium }) => {
  const { setCheckboxScreens, checkboxScreens } = useControlerButtonPagesContext();
  const [screenCondominium, setScreenCondominium] = useState<Screen[]>([]);

  useEffect(() => {
    api.get(`/screens/condominiun_id/${selectedCondominium._id}`).then((response) => {
      setScreenCondominium(response.data);
    });
  }, [selectedCondominium]);

  const column: GridColDef[] = [
    { field: "id", headerName: "ID", flex: 3 },
    { field: "screen", headerName: "Tela", flex: 3 },
    { field: "validity", headerName: "Validade", flex: 1 },
    { field: "source_rss", headerName: "RSS ativo", flex: 1 },
    { field: "noticies", headerName: "Notícias ativas", flex: 1 },
  ];

  const rows = screenCondominium.map((screen) => {
    return {
      id: screen._id,
      screen: screen.name,
      validity: dayjs(screen.validity).format("DD/MM/YYYY"),
      source_rss: screen.source_rss.length,
      noticies: screen.noticies.length,
    };
  });
  return (
    <Box height="60vh" marginTop={4}>
      <DataGridPro
        columns={column}
        components={{ Toolbar: GridToolbar }}
        rows={rows}
        checkboxSelection
        onSelectionModelChange={(e) => setCheckboxScreens(e)}
        selectionModel={checkboxScreens}
      />
    </Box>
  );
};

export default ScreenTable;
