import { useMemo, useState } from "react";
import { DataTable, PageToolbar } from "../../components/design-system";
import { useControlerButtonPagesContext } from "../../context/ControlerButtonPagesContext";
import { withAllPermission } from "../../hocs";
import LayoutPage from "../../layout/AppBar";
import { GetServerSideProps } from "next";
import { api, getAPIClient } from "../../service";
import { CondominiumMessageType } from "../../types/condominium-message.type";
import { UserType } from "../../types/users.type";
import AddCondominiumMessegerDialog from "../../components/CondominiumMessengerPageComponet/AddCondominiumMessegerDialog";
import EditCondominiumMessegerDialog from "../../components/CondominiumMessengerPageComponet/EditCondominiumMessegerDialog";
import dayjs from "dayjs";
import { getMessageScreens } from "../../utils/condominiumMessageScreens";

type CondominiumMessegerProps = {
  initialCondominiumMessege: CondominiumMessageType[];
  initialUsers: UserType[];
};

type MessageRow = CondominiumMessageType & { id: string; createdBy: string; screens: number; window: string };

const CondominiumMessagePage: React.FC<CondominiumMessegerProps> = ({ initialCondominiumMessege, initialUsers }) => {
  const { checkboxCondominiumMessenger, setCheckboxCondominiumMessenger, setOpenDialogCreateCondominiumMessenger, setOpenDialogEditCondominiumMessenger } = useControlerButtonPagesContext();
  const [messages, setMessages] = useState(initialCondominiumMessege);
  const [editing, setEditing] = useState<CondominiumMessageType | null>(null);

  const rows = useMemo<MessageRow[]>(() => messages.map((message) => ({
    ...message,
    id: message._id,
    createdBy: initialUsers.find((user) => user._id === message.user_id)?.name || "Sistema",
    screens: getMessageScreens(message).length,
    window: `${message.starttime ? dayjs(message.starttime).format("DD/MM HH:mm") : "-"} - ${message.endtime ? dayjs(message.endtime).format("DD/MM HH:mm") : "-"}`,
  })), [initialUsers, messages]);

  const openEdit = () => {
    if (checkboxCondominiumMessenger.length !== 1) return;
    const found = messages.find((item) => item._id === checkboxCondominiumMessenger[0]);
    if (!found) return;
    setEditing(found);
    setOpenDialogEditCondominiumMessenger(true);
  };

  const handleDelete = async () => {
    await Promise.all(
      checkboxCondominiumMessenger.map(async (id) => {
        await api.delete(`/condominium-message/${id}`);
        await api.delete(`/screens/message/${id}`);
      })
    );
    setMessages((current) => current.filter((item) => !checkboxCondominiumMessenger.includes(item._id)));
    setCheckboxCondominiumMessenger([]);
  };

  return (
    <LayoutPage>
      <div className="ds-stack">
        <PageToolbar title="Mensagens" onNew={() => setOpenDialogCreateCondominiumMessenger(true)} onEdit={openEdit} onDelete={handleDelete} hasSelection={checkboxCondominiumMessenger.length > 0} />
        <DataTable
          rows={rows}
          selectedIds={checkboxCondominiumMessenger}
          onSelectionChange={setCheckboxCondominiumMessenger}
          onRowClick={(row) => {
            setEditing(row);
            if (checkboxCondominiumMessenger.length === 0) setOpenDialogEditCondominiumMessenger(true);
          }}
          searchPlaceholder="Buscar por nome, titulo ou criador"
          columns={[
            { key: "name", header: "Nome", render: (row) => row.name, searchValue: (row) => `${row.name} ${row.title || ""}` },
            { key: "type", header: "Tipo", render: (row) => row.jpg_file ? "Imagem" : "Texto" },
            { key: "createdBy", header: "Criado por", render: (row) => row.createdBy, searchValue: (row) => row.createdBy },
            { key: "window", header: "Janela", render: (row) => row.window },
            { key: "screens", header: "Telas", width: "120px", render: (row) => row.screens },
          ]}
        />
      </div>
      <AddCondominiumMessegerDialog setCondominiumMesseger={setMessages} />
      {editing ? <EditCondominiumMessegerDialog condominiumMesseger={editing} setCondominiumMesseger={setMessages} /> : null}
    </LayoutPage>
  );
};

export default withAllPermission(CondominiumMessagePage);

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const api = getAPIClient(ctx);
  try {
    const condominiumMessages = await api.get<CondominiumMessageType[]>("/condominium-message");
    const users = await api.get<UserType[]>("/users/all");
    return { props: { initialCondominiumMessege: condominiumMessages.data, initialUsers: users.data } };
  } catch {
    return { props: { initialCondominiumMessege: [], initialUsers: [] } };
  }
};
