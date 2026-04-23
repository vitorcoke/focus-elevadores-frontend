import { useEffect, useMemo, useState } from "react";
import produce from "immer";
import { ActionButton, Field, InlineNotice, Modal, SelectInput, TextInput } from "../../design-system";
import { useControlerButtonPagesContext } from "../../../context/ControlerButtonPagesContext";
import { api } from "../../../service";
import { CondominiumType } from "../../../types/condominium.type";
import { VMS } from "../../../types/vms.type";

type EditVmsDialogProps = {
  vms: VMS;
  condominium: CondominiumType[];
  setVms: React.Dispatch<React.SetStateAction<VMS[]>>;
};

const EditVmsDialog: React.FC<EditVmsDialogProps> = ({ vms, condominium, setVms }) => {
  const { openDialogEditVms, setOpenDialogEditVms, setCheckboxVms } = useControlerButtonPagesContext();
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [form, setForm] = useState(vms);

  useEffect(() => setForm(vms), [vms]);

  const actions = useMemo(() => (
    <>
      <ActionButton type="button" variant="ghost" onClick={() => { setOpenDialogEditVms(false); setCheckboxVms([]); }}>Cancelar</ActionButton>
      <ActionButton type="submit" form="edit-vms-form">Salvar alteracoes</ActionButton>
    </>
  ), [setCheckboxVms, setOpenDialogEditVms]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await api.patch(`/vms/${form._id}`, form);
      setVms((current) => produce(current, (draft) => {
        const index = draft.findIndex((item) => item._id === form._id);
        if (index >= 0) draft[index] = form;
      }));
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <Modal open={openDialogEditVms} onClose={() => setOpenDialogEditVms(false)} title="Editar VMS" description="Atualize parametros da integracao preservando o comportamento existente." actions={actions}>
      <form id="edit-vms-form" className="ds-stack" onSubmit={handleSubmit}>
        {status === "success" ? <InlineNotice tone="success">VMS atualizado com sucesso.</InlineNotice> : null}
        {status === "error" ? <InlineNotice tone="error">Nao foi possivel atualizar o VMS.</InlineNotice> : null}
        <div className="ds-form-grid">
          <Field label="Nome" required><TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Servidor" required><TextInput value={form.server} onChange={(e) => setForm({ ...form, server: e.target.value })} /></Field>
          <Field label="Porta" required><TextInput type="number" value={String(form.port)} onChange={(e) => setForm({ ...form, port: Number(e.target.value) })} /></Field>
          <Field label="Receptor" required><TextInput type="number" value={String(form.receiver)} onChange={(e) => setForm({ ...form, receiver: Number(e.target.value) })} /></Field>
          <Field label="Conta" required><TextInput type="number" value={String(form.account)} onChange={(e) => setForm({ ...form, account: Number(e.target.value) })} /></Field>
          <Field label="Usuario" required><TextInput value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></Field>
          <Field label="Senha"><TextInput type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
          <Field label="Condominio"><SelectInput value={form.condominium_id || ""} onChange={(e) => setForm({ ...form, condominium_id: e.target.value })}><option value="">Nao vinculado</option>{condominium.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</SelectInput></Field>
        </div>
      </form>
    </Modal>
  );
};

export default EditVmsDialog;
