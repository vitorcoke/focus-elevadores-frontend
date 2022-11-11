import { Box } from "@mui/material";
import { DataGridPro, GridColDef } from "@mui/x-data-grid-pro";
import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";
import AddCondominiumMessegerDialog from "../../components/CondominiumMessengerPageComponet/AddCondominiumMessegerDialog";
import EditCondominiumMessegerDialog from "../../components/CondominiumMessengerPageComponet/EditCondominiumMessegerDialog";
import { useControlerButtonPagesContext } from "../../context/ControlerButtonPagesContext";
import { withAllPermission } from "../../hocs";
import LayoutPage from "../../layout/AppBar";
import BaseMainLayoutPage from "../../layout/BaseMain";
import { api, getAPIClient } from "../../service";
import { CondominiumMessage } from "../../types/condominium-message.type";

type CondominiumMessegerProps = {
  initialCondominiumMessege: CondominiumMessage[];
};

const CondominiumMessage: React.FC<CondominiumMessegerProps> = ({
  initialCondominiumMessege,
}) => {
  const { checkboxCondominiumMessenger, setCheckboxCondominiumMessenger } =
    useControlerButtonPagesContext();

  const [condominiumMesseger, setCondominiumMesseger] = useState(
    initialCondominiumMessege
  );
  const [editCondominiumMesseger, setEditCondominiumMesseger] =
    useState<CondominiumMessage>();

  const columns: GridColDef[] = [
    { field: "name", headerName: "Nome", flex: 2 },
    { field: "screens", headerName: "Qtds.Telas", flex: 2 },
  ];

  const rows = condominiumMesseger.map((message) => {
    return {
      id: message._id,
      _id: message._id,
      name: message.name,
      title: message.title,
      starttime: message.starttime,
      endtime: message.endtime,
      message: message.message,
      jpg_file: message.jpg_file,
      screens: message.screen_id?.length,
      screen_id: message.screen_id,
    };
  });

  console.log(condominiumMesseger);

  return (
    <LayoutPage>
      <BaseMainLayoutPage
        page="condominium-messeger"
        title="Mensagens"
        setCondominiumMesseger={setCondominiumMesseger}
      >
        <Box width="100%" height="60vh">
          <DataGridPro
            rows={rows}
            columns={columns}
            checkboxSelection
            selectionModel={checkboxCondominiumMessenger}
            onSelectionModelChange={(e) => {
              setCheckboxCondominiumMessenger(e);
            }}
            onCellClick={(params) => {
              checkboxCondominiumMessenger.length === 0
                ? setEditCondominiumMesseger(params.row as CondominiumMessage)
                : setEditCondominiumMesseger(undefined);
            }}
            onRowClick={(params) => {
              checkboxCondominiumMessenger.length === 0
                ? setEditCondominiumMesseger(params.row as CondominiumMessage)
                : setEditCondominiumMesseger(undefined);
            }}
          />
          <AddCondominiumMessegerDialog
            setCondominiumMesseger={setCondominiumMesseger}
          />
          {editCondominiumMesseger && (
            <EditCondominiumMessegerDialog
              condominiumMesseger={editCondominiumMesseger}
              setCondominiumMesseger={setCondominiumMesseger}
            />
          )}
        </Box>
      </BaseMainLayoutPage>
    </LayoutPage>
  );
};

export default withAllPermission(CondominiumMessage);

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const api = getAPIClient(ctx);

  try {
    const { data } = await api.get<CondominiumMessage[]>(
      "/condominium-message"
    );
    return {
      props: {
        initialCondominiumMessege: data,
      },
    };
  } catch {
    return {
      props: {
        initialCondominiumMessege: [],
      },
    };
  }
};
