import { Box } from "@mui/material";
import { DataGridPro, GridColDef, GridToolbar } from "@mui/x-data-grid-pro";
import { useState } from "react";
import { useControlerButtonPagesContext } from "../../context/ControlerButtonPagesContext";
import { UserType } from "../../types/users.type";
import { getAPIClient } from "../../service";
import { GetServerSideProps } from "next";
import { CondominiumType } from "../../types/condominium.type";
import { withAdminAndSindicoPermission } from "../../hocs";
import { Screen } from "../../types/screens.type";
import LayoutPage from "../../layout/AppBar";
import BaseMainLayoutPage from "../../layout/BaseMain";
import AddUser from "../../components/UserPageComponent/AddUser";
import EditUser from "../../components/UserPageComponent/EditUser";

type UserProps = {
  initialUser: UserType[];
  initialCondominium: CondominiumType[];
  initialScreens: Screen[];
};

const User: React.FC<UserProps> = ({ initialUser, initialCondominium, initialScreens }) => {
  const { checkboxUser, setCheckboxUser } = useControlerButtonPagesContext();

  const [condominium] = useState(initialCondominium);
  const [user, setUser] = useState(initialUser);
  const [screens] = useState(initialScreens);
  const [editUser, setEditUser] = useState<UserType>();

  const columns: GridColDef[] = [
    { field: "name", headerName: "Nome", flex: 2 },
    { field: "username", headerName: "Nome de login", flex: 3 },
    { field: "email", headerName: "Email", flex: 3 },
  ];

  const rows = user.map((user) => {
    return {
      id: user._id,
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      permission: user.permission,
      condominium_id: user.condominium_id,
      screen_id: user.screen_id,
    };
  });

  return (
    <LayoutPage>
      <BaseMainLayoutPage page="user" title="Usuário" setUser={setUser}>
        <Box width="100%" height="60vh">
          <DataGridPro
            checkboxSelection
            selectionModel={checkboxUser}
            onSelectionModelChange={(e) => setCheckboxUser(e)}
            components={{
              Toolbar: GridToolbar,
            }}
            rows={rows}
            columns={columns}
            onCellClick={(params) =>
              checkboxUser.length === 0
                ? setEditUser(params.row as UserType)
                : setEditUser(undefined)
            }
          />
          <AddUser setUser={setUser} condominium={condominium} screens={screens} />
          {editUser && condominium && (
            <EditUser
              userSelect={editUser}
              condominium={condominium}
              screens={screens}
              setUser={setUser}
            />
          )}
        </Box>
      </BaseMainLayoutPage>
    </LayoutPage>
  );
};

export default withAdminAndSindicoPermission(User);

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const apiClient = getAPIClient(ctx);
  try {
    const users = await apiClient.get<UserType[]>("/users");
    const condominium = await apiClient.get<CondominiumType[]>("/condominium?query=all");
    const screens = await apiClient.get<Screen[]>("/screens");
    return {
      props: {
        initialUser: users.data,
        initialCondominium: condominium.data,
        initialScreens: screens.data,
      },
    };
  } catch {
    return {
      props: {
        initialUser: [],
        initialCondominium: [],
        initialScreens: [],
      },
    };
  }
};
