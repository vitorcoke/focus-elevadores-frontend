import { Box } from "@mui/material";
import { DataGridPro, GridColDef } from "@mui/x-data-grid-pro";
import { useState } from "react";
import { useControlerButtonPagesContext } from "../../context/ControlerButtonPagesContext";
import { User } from "../../types/users.type";
import { getAPIClient } from "../../service";
import { GetServerSideProps } from "next";
import LayoutPage from "../../layout/AppBar";
import BaseMainLayoutPage from "../../layout/BaseMain";
import AddUser from "../../components/UserPageComponent/AddUser";
import EditUser from "../../components/UserPageComponent/EditUser";

type UserProps = {
  initialUser: User[];
};

const User: React.FC<UserProps> = ({ initialUser }) => {
  const { checkboxUser, setCheckboxUser } = useControlerButtonPagesContext();

  const [user, setUser] = useState(initialUser);
  const [editUser, setEditUser] = useState<User>();

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
      permission: user.permission,
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
            rows={rows}
            columns={columns}
            onCellClick={(params) =>
              checkboxUser.length === 0
                ? setEditUser(params.row as User)
                : setEditUser(undefined)
            }
          />
          <AddUser setUser={setUser} />
          {editUser && <EditUser user={editUser} />}
        </Box>
      </BaseMainLayoutPage>
    </LayoutPage>
  );
};

export default User;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const apiClient = getAPIClient(ctx);
  try {
    const { data } = await apiClient.get<User>("/users");
    return {
      props: {
        initialUser: data,
      },
    };
  } catch {
    return {
      props: {
        initialUser: [],
      },
    };
  }
};
