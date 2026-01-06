import { Box } from "@mui/material";
import { DataGridPro, GridColDef, GridToolbar } from "@mui/x-data-grid-pro";
import { GetServerSideProps } from "next";
import { useState } from "react";
import { getAPIClient } from "../../service";
import { CondominiumMessageType } from "../../types/condominium-message.type";
import { useControlerButtonPagesContext } from "../../context/ControlerButtonPagesContext";
import { withAllPermission } from "../../hocs";
import AddCondominiumMessegerDialog from "../../components/CondominiumMessengerPageComponet/AddCondominiumMessegerDialog";
import EditCondominiumMessegerDialog from "../../components/CondominiumMessengerPageComponet/EditCondominiumMessegerDialog";
import LayoutPage from "../../layout/AppBar";
import BaseMainLayoutPage from "../../layout/BaseMain";
import { UserType } from "../../types/users.type";

type CondominiumMessegerProps = {
  initialCondominiumMessege: CondominiumMessageType[];
  initialUsers: UserType[];
};

const CondominiumMessage: React.FC<CondominiumMessegerProps> = ({
  initialCondominiumMessege,
  initialUsers,
}) => {
  const { checkboxCondominiumMessenger, setCheckboxCondominiumMessenger } =
    useControlerButtonPagesContext();

  const [condominiumMesseger, setCondominiumMesseger] = useState(initialCondominiumMessege);

  const [users, setUsers] = useState(initialUsers);

  const [editCondominiumMesseger, setEditCondominiumMesseger] = useState<CondominiumMessageType>();

  const columns: GridColDef[] = [
    { field: "name", headerName: "Nome", flex: 2 },
    { field: "screens", headerName: "Qtds.Telas", flex: 2 },
    { field: "user_id", headerName: "Criado por", flex: 2 },
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
      user_id: users.find((user) => user._id === message.user_id)?.name,
      time_exibition: message.time_exibition && message.time_exibition / 1000,
    };
  });

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
            components={{
              Toolbar: GridToolbar,
            }}
            onSelectionModelChange={(e) => {
              setCheckboxCondominiumMessenger(e);
            }}
            onCellClick={(params) => {
              checkboxCondominiumMessenger.length === 0
                ? setEditCondominiumMesseger(params.row as CondominiumMessageType)
                : setEditCondominiumMesseger(undefined);
            }}
            onRowClick={(params) => {
              checkboxCondominiumMessenger.length === 0
                ? setEditCondominiumMesseger(params.row as CondominiumMessageType)
                : setEditCondominiumMesseger(undefined);
            }}
          />
          <AddCondominiumMessegerDialog setCondominiumMesseger={setCondominiumMesseger} />
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
    const condominiumMessages = await api.get<CondominiumMessageType[]>("/condominium-message");
    const users = await api.get<UserType[]>("/users/all");

    return {
      props: {
        initialCondominiumMessege: condominiumMessages.data,
        initialUsers: users.data,
      },
    };
  } catch {
    return {
      props: {
        initialCondominiumMessege: [],
        initialUsers: [],
      },
    };
  }
};
