import { useMemo, useState } from "react";
import { PatternFormat } from "react-number-format";
import { ActionButton, Field, InlineNotice, Modal, MultiSelectChips, SelectInput, TextInput } from "../../design-system";
import { useControlerButtonPagesContext } from "../../../context/ControlerButtonPagesContext";
import { useAuthContext } from "../../../context/AuthContext";
import { api } from "../../../service";
import { CondominiumType } from "../../../types/condominium.type";
import { Screen } from "../../../types/screens.type";
import { Permission, UserType } from "../../../types/users.type";

type AddUserProps = {
  setUser: React.Dispatch<React.SetStateAction<UserType[]>>;
  condominium: CondominiumType[];
  screens: Screen[];
};

const AddUser: React.FC<AddUserProps> = ({ setUser, condominium, screens }) => {
  const { user } = useAuthContext();
  const { openDialogCreateUser, setOpenDialogCreateUser } = useControlerButtonPagesContext();
  const [status, setStatus] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [emailError, setEmailError] = useState("");
  const [form, setForm] = useState({ name: "", username: "", email: "", phone: "", password: "", condominium_id: [] as string[], screen_id: [] as string[], permission: String(Permission.ZELADOR) });

  const actions = useMemo(() => (<><ActionButton type="button" variant="ghost" onClick={() => setOpenDialogCreateUser(false)}>Cancelar</ActionButton><ActionButton type="submit" form="create-user-form">Salvar usuario</ActionButton></>), [setOpenDialogCreateUser]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await api.post<UserType>("/users", { ...form, permission: parseInt(form.permission, 10) });
      setUser((current) => [...current, response.data]);
      setStatus({ tone: "success", message: "Usuario criado com sucesso." });
      setEmailError("");
    } catch (err: any) {
      if (err.response?.data?.message?.match(/email_1 dup key/)) {
        setEmailError("Email ja cadastrado");
      }
      setStatus({ tone: "error", message: "Nao foi possivel criar o usuario." });
    }
  };

  return (
    <Modal open={openDialogCreateUser} onClose={() => setOpenDialogCreateUser(false)} title="Novo usuario" description="Cadastre acessos e vinculos operacionais no novo frontend." actions={actions} size="xl">
      <form id="create-user-form" className="ds-stack" onSubmit={handleSubmit}>
        {status ? <InlineNotice tone={status.tone}>{status.message}</InlineNotice> : null}
        <div className="ds-form-grid">
          <Field label="Nome" required><TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Nome de login" required><TextInput value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></Field>
          <Field label="Email" required error={emailError}><TextInput value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Telefone"><PatternFormat customInput={TextInput as any} format="(##) #####-####" value={form.phone} onValueChange={(values) => setForm({ ...form, phone: values.formattedValue })} /></Field>
          <Field label="Senha" required><TextInput type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
          <Field label="Permissao" required><SelectInput value={form.permission} onChange={(e) => setForm({ ...form, permission: e.target.value })}><option value={Permission.ZELADOR}>Zelador</option>{user?.permission !== Permission.SINDICO ? <option value={Permission.SINDICO}>Sindico</option> : null}{user?.permission !== Permission.SINDICO ? <option value={Permission.ADMIN}>Administrador</option> : null}</SelectInput></Field>
          <div className="ds-form-grid--full">
            <Field label="Condominios">
              <MultiSelectChips options={condominium.map((item) => ({ value: item._id, label: item.name }))} values={form.condominium_id} onChange={(values) => setForm({ ...form, condominium_id: values })} />
            </Field>
          </div>
          {form.permission === String(Permission.ZELADOR) ? <div className="ds-form-grid--full"><Field label="Telas"><MultiSelectChips options={screens.map((item) => ({ value: item._id, label: item.name }))} values={form.screen_id} onChange={(values) => setForm({ ...form, screen_id: values })} /></Field></div> : null}
        </div>
      </form>
    </Modal>
  );
};

export default AddUser;
