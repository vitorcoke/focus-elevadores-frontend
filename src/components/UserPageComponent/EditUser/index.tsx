import { useEffect, useMemo, useState } from "react";
import produce from "immer";
import { PatternFormat } from "react-number-format";
import { ActionButton, Field, InlineNotice, Modal, MultiSelectChips, SelectInput, TextInput } from "../../design-system";
import { useControlerButtonPagesContext } from "../../../context/ControlerButtonPagesContext";
import { useAuthContext } from "../../../context/AuthContext";
import { api } from "../../../service";
import { CondominiumType } from "../../../types/condominium.type";
import { Screen } from "../../../types/screens.type";
import { Permission, UserType } from "../../../types/users.type";

type EditUserProps = {
  userSelect: UserType;
  condominium: CondominiumType[];
  screens: Screen[];
  setUser: React.Dispatch<React.SetStateAction<UserType[]>>;
};

const EditUser: React.FC<EditUserProps> = ({ userSelect, condominium, screens, setUser }) => {
  const { user } = useAuthContext();
  const { openDialogEditUser, setOpenDialogEditUser, setCheckboxUser } = useControlerButtonPagesContext();
  const [form, setForm] = useState(userSelect);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [emailError, setEmailError] = useState("");

  useEffect(() => { setForm(userSelect); setPassword(""); }, [userSelect]);

  const actions = useMemo(() => (<><ActionButton type="button" variant="ghost" onClick={() => { setOpenDialogEditUser(false); setCheckboxUser([]); }}>Cancelar</ActionButton><ActionButton type="submit" form="edit-user-form">Salvar alteracoes</ActionButton></>), [setCheckboxUser, setOpenDialogEditUser]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const payload = password ? { ...form, password } : form;
      const response = await api.patch(`/users/${form._id}`, payload);
      setUser((current) => produce(current, (draft) => {
        const index = draft.findIndex((item) => item._id === form._id);
        if (index >= 0) draft[index] = response.data;
      }));
      setStatus({ tone: "success", message: "Usuario atualizado com sucesso." });
      setEmailError("");
    } catch (err: any) {
      if (err.response?.data?.message?.match(/email_1 dup key/)) {
        setEmailError("Email ja cadastrado");
      }
      setStatus({ tone: "error", message: "Nao foi possivel atualizar o usuario." });
    }
  };

  return (
    <Modal open={openDialogEditUser} onClose={() => setOpenDialogEditUser(false)} title="Editar usuario" description="Atualize dados de acesso e vinculos do usuario selecionado." actions={actions} size="xl">
      <form id="edit-user-form" className="ds-stack" onSubmit={handleSubmit}>
        {status ? <InlineNotice tone={status.tone}>{status.message}</InlineNotice> : null}
        <div className="ds-form-grid">
          <Field label="Nome" required><TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Nome de login" required><TextInput value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></Field>
          <Field label="Email" required error={emailError}><TextInput value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Telefone"><PatternFormat customInput={TextInput as any} format="(##) #####-####" value={form.phone} onValueChange={(values) => setForm({ ...form, phone: values.formattedValue })} /></Field>
          <Field label="Nova senha"><TextInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
          <Field label="Permissao"><SelectInput value={String(form.permission)} onChange={(e) => setForm({ ...form, permission: Number(e.target.value) })}><option value={Permission.ZELADOR}>Zelador</option><option value={Permission.SINDICO}>Sindico</option>{user?.permission !== Permission.SINDICO ? <option value={Permission.ADMIN}>Administrador</option> : null}</SelectInput></Field>
          <div className="ds-form-grid--full">
            <Field label="Condominios"><MultiSelectChips options={condominium.map((item) => ({ value: item._id, label: item.name }))} values={form.condominium_id} onChange={(values) => setForm({ ...form, condominium_id: values })} /></Field>
          </div>
          {form.permission === Permission.ZELADOR ? <div className="ds-form-grid--full"><Field label="Telas"><MultiSelectChips options={screens.map((item) => ({ value: item._id, label: item.name }))} values={form.screen_id} onChange={(values) => setForm({ ...form, screen_id: values })} /></Field></div> : null}
        </div>
      </form>
    </Modal>
  );
};

export default EditUser;
