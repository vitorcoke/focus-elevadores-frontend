import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { DataTable } from "../../../design-system";
import { useControlerButtonPagesContext } from "../../../../context/ControlerButtonPagesContext";
import { api } from "../../../../service";
import { CondominiumType } from "../../../../types/condominium.type";
import { Screen } from "../../../../types/screens.type";

type ScreenTableProps = {
  selectedCondominium: CondominiumType;
};

type ScreenRow = {
  id: string;
  screen: string;
  validity: string;
  sourceCount: number;
  newsCount: number;
};

const ScreenTable: React.FC<ScreenTableProps> = ({ selectedCondominium }) => {
  const { setCheckboxScreens, checkboxScreens } = useControlerButtonPagesContext();
  const [screenCondominium, setScreenCondominium] = useState<Screen[]>([]);

  useEffect(() => {
    api.get(`/screens/condominiun_id/${selectedCondominium._id}`).then((response) => setScreenCondominium(response.data));
  }, [selectedCondominium]);

  const rows = useMemo<ScreenRow[]>(() => screenCondominium.map((screen) => ({
    id: screen._id,
    screen: screen.name,
    validity: dayjs(screen.validity).format("DD/MM/YYYY"),
    sourceCount: screen.source_rss.length,
    newsCount: screen.noticies.length,
  })), [screenCondominium]);

  return (
    <DataTable
      rows={rows}
      selectedIds={checkboxScreens}
      onSelectionChange={setCheckboxScreens}
      searchPlaceholder="Buscar tela"
      columns={[
        { key: "screen", header: "Tela", render: (row) => row.screen, searchValue: (row) => row.screen },
        { key: "validity", header: "Validade", render: (row) => row.validity, sortValue: (row) => row.validity },
        { key: "source", header: "RSS ativo", render: (row) => row.sourceCount, sortValue: (row) => row.sourceCount },
        { key: "news", header: "Noticias ativas", render: (row) => row.newsCount, sortValue: (row) => row.newsCount },
      ]}
    />
  );
};

export default ScreenTable;
