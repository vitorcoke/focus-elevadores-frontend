import { Box } from "@mui/material";
import { DataGridPro, GridColDef } from "@mui/x-data-grid-pro";
import { useState, useEffect } from "react";
import { useControlerButtonPagesContext } from "../../../../context/ControlerButtonPagesContext";
import { api } from "../../../../service";
import { Condominium } from "../../../../types/condominium.type";
import { Screen } from "../../../../types/screens.type";

type ScreenTableProps = {
  selectedCondominium: Condominium;
};

const ScreenTable: React.FC<ScreenTableProps> = ({ selectedCondominium }) => {
  const { setCheckboxScreens, checkboxScreens } =
    useControlerButtonPagesContext();
  const [screenCondominium, setScreenCondominium] = useState<Screen[]>([]);

  useEffect(() => {
    api
      .get(`/screens/condominiun_id/${selectedCondominium._id}`)
      .then((response) => {
        setScreenCondominium(response.data);
      });
  }, [selectedCondominium]);

  const column: GridColDef[] = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "screen", headerName: "Tela", flex: 5 },
  ];

  const rows = screenCondominium.map((screen) => {
    return {
      id: screen._id,
      screen: screen.name,
    };
  });
  return (
    <Box height="60vh" marginTop={4}>
      <DataGridPro
        columns={column}
        rows={rows}
        checkboxSelection
        onSelectionModelChange={(e) => setCheckboxScreens(e)}
        selectionModel={checkboxScreens}
      />
    </Box>
  );
};

export default ScreenTable;
