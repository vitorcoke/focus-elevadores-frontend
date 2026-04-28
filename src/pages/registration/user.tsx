import { useMemo, useState } from "react";
import { DataTable, PageToolbar, TagList } from "../../components/design-system";
import { useControlerButtonPagesContext } from "../../context/ControlerButtonPagesContext";
import { withAdminAndSindicoPermission } from "../../hocs";
import LayoutPage from "../../layout/AppBar";
import { GetServerSideProps } from "next";
import { api, getAPIClient } from "../../service";
import { CondominiumType } from "../../types/condominium.type";
import { Screen } from "../../types/screens.type";
import { Permission, UserType } from "../../types/users.type";
import AddUser from "../../components/UserPageComponent/AddUser";
import EditUser from "../../components/UserPageComponent/EditUser";

type UserProps = {
  initialUser: UserType[];
  initialCondominium: CondominiumType[];
  initialScreens: Screen[];
};

type UserRow = UserType & {
  id: string;
  roleLabel: string;
  condominiumNames: string[];
  screenNames: string[];
};

const permissionLabel = {
  [Permission.ZELADOR]: "Zelador",
  [Permission.SINDICO]: "Sindico",
  [Permission.ADMIN]: "Administrador",
};

const UserPage: React.FC<UserProps> = ({ initialUser, initialCondominium, initialScreens }) => {
  const { checkboxUser, setCheckboxUser, setOpenDialogCreateUser, setOpenDialogEditUser } = useControlerButtonPagesContext();
  const [user, setUser] = useState(initialUser);
  const [editing, setEditing] = useState<UserType | null>(null);

  const rows = useMemo<UserRow[]>(() => user.map((item) => ({
    ...item,
    id: item._id,
    roleLabel: permissionLabel[item.permission as Permission],
    condominiumNames: initialCondominium.filter((condominium) => item.condominium_id.includes(condominium._id)).map((condominium) => condominium.name),
    screenNames: initialScreens.filter((screen) => item.screen_id.includes(screen._id)).map((screen) => screen.name),
  })), [initialCondominium, initialScreens, user]);

  const openEdit = () => {
    if (checkboxUser.length !== 1) return;
    const found = user.find((item) => item._id === checkboxUser[0]);
    if (!found) return;
    setEditing(found);
    setOpenDialogEditUser(true);
  };

  const handleDelete = async () => {
    await Promise.all(checkboxUser.map((id) => api.delete(`/users/${id}`)));
    setUser((current) => current.filter((item) => !checkboxUser.includes(item._id)));
    setCheckboxUser([]);
  };

  return (
    <LayoutPage>
      <div className="ds-stack">
        <PageToolbar title="Usuarios" onNew={() => setOpenDialogCreateUser(true)} onEdit={openEdit} onDelete={handleDelete} hasSelection={checkboxUser.length > 0} />
        <DataTable
          rows={rows}
          selectedIds={checkboxUser}
          onSelectionChange={setCheckboxUser}
          onRowClick={(row) => {
            setEditing(row);
            if (checkboxUser.length === 0) setOpenDialogEditUser(true);
          }}
          searchPlaceholder="Buscar por nome, login ou email"
          columns={[
            { key: "name", header: "Nome", render: (row) => row.name, searchValue: (row) => row.name },
            { key: "username", header: "Login", render: (row) => row.username, searchValue: (row) => row.username },
            { key: "email", header: "Email", render: (row) => row.email, searchValue: (row) => row.email },
            { key: "permission", header: "Perfil", render: (row) => row.roleLabel, searchValue: (row) => row.roleLabel },
            { key: "condominiums", header: "Condominios", render: (row) => <TagList values={row.condominiumNames} /> },
          ]}
        />
      </div>
      <AddUser setUser={setUser} condominium={initialCondominium} screens={initialScreens} />
      {editing ? <EditUser userSelect={editing} condominium={initialCondominium} screens={initialScreens} setUser={setUser} /> : null}
    </LayoutPage>
  );
};

export default withAdminAndSindicoPermission(UserPage);

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const apiClient = getAPIClient(ctx);
  try {
    const users = await apiClient.get<UserType[]>("/users");
    const condominium = await apiClient.get<CondominiumType[]>("/condominium?query=all");
    const screens = await apiClient.get<Screen[]>("/screens");
    return { props: { initialUser: users.data, initialCondominium: condominium.data, initialScreens: screens.data } };
  } catch {
    return { props: { initialUser: [], initialCondominium: [], initialScreens: [] } };
  }
};
