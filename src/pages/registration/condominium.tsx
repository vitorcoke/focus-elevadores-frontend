import { GridColDef, DataGridPro, GridToolbar } from "@mui/x-data-grid-pro";
import { Box } from "@mui/material";
import { GetServerSideProps } from "next";
import { getAPIClient } from "../../service";
import { useState } from "react";
import { CondominiumType } from "../../types/condominium.type";
import { useControlerButtonPagesContext } from "../../context/ControlerButtonPagesContext";
import { Rss } from "../../types/rss.type";
import { Banner } from "../../types/banner.type";
import { withAllPermission } from "../../hocs";
import { CondominiumMessageType } from "../../types/condominium-message.type";
import AddCondominium from "../../components/CondominiumPageComponent/AddCondominiumDialog";
import EditCondominium from "../../components/CondominiumPageComponent/EditCondominiumDialog";
import ScreensDialog from "../../components/CondominiumPageComponent/ScreensDialog/index";
import LayoutPage from "../../layout/AppBar";
import BaseMainLayoutPage from "../../layout/BaseMain";
import { Noticies } from "../../types/noticies.type";

type CondominiumProps = {
  initialCondominium: CondominiumType[];
  initialRss: Rss[];
  initialBanner: Banner[];
  initialCondominiumMessege: CondominiumMessageType[];
  initialNoticies: Noticies[];
};

const Condominium: React.FC<CondominiumProps> = ({
  initialCondominium,
  initialRss,
  initialNoticies,
  initialBanner,
  initialCondominiumMessege,
}) => {
  const { setCheckboxCondominium, checkboxCondominium } = useControlerButtonPagesContext();
  const [condominium, setCondominium] = useState(initialCondominium);
  const [rss, setRss] = useState(initialRss);
  const [noticies, setNoticies] = useState(initialNoticies);
  const [banner, setBanner] = useState(initialBanner);
  const [condominiumMesseger, setCondominiumMesseger] = useState(initialCondominiumMessege);

  const [editCondominium, setEditCondominium] = useState<CondominiumType>();

  const columns: GridColDef[] = [
    { field: "condominium_id_imodulo", headerName: "ID", flex: 1 },
    { field: "name", headerName: "Nome", flex: 3 },
    { field: "district", headerName: "Bairro", flex: 3 },
    { field: "city", headerName: "Cidade", flex: 3 },
    { field: "screenLength", headerName: "Qtds.Telas", flex: 1 },
  ];
  const rows = condominium.map((condominium) => {
    return {
      id: condominium._id,
      _id: condominium._id,
      name: condominium.name,
      condominium_id_imodulo: condominium.condominium_id_imodulo,
      cnpj: condominium.cnpj,
      cep: condominium.cep,
      address: condominium.address,
      district: condominium.district,
      complement: condominium.complement,
      city: condominium.city,
      state: condominium.state,
      screens: condominium.screens,
      screenLength: condominium.screens?.length,
    };
  });

  return (
    <LayoutPage>
      <BaseMainLayoutPage title="Condomínio" page="condominium" setCondominium={setCondominium}>
        <Box width="100%" height="60vh">
          <DataGridPro
            columns={columns}
            rows={rows}
            components={{ Toolbar: GridToolbar }}
            checkboxSelection
            onSelectionModelChange={(e) => setCheckboxCondominium(e)}
            selectionModel={checkboxCondominium}
            onCellClick={(params) =>
              checkboxCondominium.length === 0
                ? setEditCondominium(params.row as CondominiumType)
                : setEditCondominium(undefined)
            }
          />
        </Box>
      </BaseMainLayoutPage>
      <AddCondominium setCondominium={setCondominium} />
      {editCondominium && (
        <>
          <EditCondominium condominium={editCondominium} setCondominium={setCondominium} />
          <ScreensDialog
            condominium={editCondominium}
            setCondominium={setCondominium}
            rss={rss}
            banner={banner}
            noticies={noticies}
            condominiumMesseger={condominiumMesseger}
            setCondominiumMesseger={setCondominiumMesseger}
          />
        </>
      )}
    </LayoutPage>
  );
};

export default withAllPermission(Condominium);

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const api = getAPIClient(ctx);

  try {
    const condominium = await api.get<CondominiumType[]>("/condominium?query=all");
    const rss = await api.get<Rss[]>("/source-rss");
    const banner = await api.get<Banner[]>("/banner");
    const condominiumMessege = await api.get<CondominiumMessageType[]>("/condominium-message");
    const noticies = await api.get<Noticies[]>("/noticies");

    return {
      props: {
        initialCondominium: condominium.data,
        initialRss: rss.data,
        initialBanner: banner.data,
        initialCondominiumMessege: condominiumMessege.data,
        initialNoticies: noticies.data,
      },
    };
  } catch {
    return {
      props: {
        initialCondominium: [],
        initialRss: [],
        initialBanner: [],
        initialCondominiumMesseger: [],
        initialNoticies: [],
      },
    };
  }
};
