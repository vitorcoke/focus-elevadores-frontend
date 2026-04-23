import { useMemo, useState } from "react";
import produce from "immer";
import { ActionButton, Field, InlineNotice, Modal, SelectInput, TextInput } from "../../design-system";
import { useControlerButtonPagesContext } from "../../../context/ControlerButtonPagesContext";
import { api } from "../../../service";
import { CondominiumType } from "../../../types/condominium.type";
import { VMS } from "../../../types/vms.type";

type AddVmsDialogProps = {
  setVms: React.Dispatch<React.SetStateAction<VMS[]>>;
  condominium: CondominiumType[];
};

const AddVmsDialog: React.FC<AddVmsDialogProps> = ({ setVms, condominium }) => {
  const { openDialogCreateVms, setOpenDialogCreateVms } = useControlerButtonPagesContext();
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [form, setForm] = useState({ name: "", server: "", port: "", username: "", password: "", receiver: "", account: "", condominium_id: "" });

  const actions = useMemo(() => (
    <>
      <ActionButton type="button" variant="ghost" onClick={() => setOpenDialogCreateVms(false)}>Cancelar</ActionButton>
      <ActionButton type="submit" form="create-vms-form">Salvar</ActionButton>
    </>
  ), [setOpenDialogCreateVms]);

  const handleClose = () => {
    setOpenDialogCreateVms(false);
    setStatus(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await api.post("/vms", {
        ...form,
        port: Number(form.port),
        receiver: Number(form.receiver),
        account: Number(form.account),
        condominium_id: form.condominium_id || null,
      });
      setVms((old) => [...old, response.data]);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <Modal open={openDialogCreateVms} onClose={handleClose} title="Novo VMS" description="Cadastre uma nova origem de video dentro do design system." actions={actions}>
      <form id="create-vms-form" className="ds-stack" onSubmit={handleSubmit}>
        {status === "success" ? <InlineNotice tone="success">VMS criado com sucesso.</InlineNotice> : null}
        {status === "error" ? <InlineNotice tone="error">Nao foi possivel criar o VMS.</InlineNotice> : null}
        <div className="ds-form-grid">
          <Field label="Nome" required><TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Servidor" required><TextInput value={form.server} onChange={(e) => setForm({ ...form, server: e.target.value })} /></Field>
          <Field label="Porta" required><TextInput type="number" value={form.port} onChange={(e) => setForm({ ...form, port: e.target.value })} /></Field>
          <Field label="Receptor" required><TextInput type="number" value={form.receiver} onChange={(e) => setForm({ ...form, receiver: e.target.value })} /></Field>
          <Field label="Conta" required><TextInput type="number" value={form.account} onChange={(e) => setForm({ ...form, account: e.target.value })} /></Field>
          <Field label="Usuario" required><TextInput value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></Field>
          <Field label="Senha" required><TextInput type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
          <Field label="Condominio"><SelectInput value={form.condominium_id} onChange={(e) => setForm({ ...form, condominium_id: e.target.value })}><option value="">Nao vinculado</option>{condominium.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</SelectInput></Field>
        </div>
      </form>
    </Modal>
  );
};

export default AddVmsDialog;
