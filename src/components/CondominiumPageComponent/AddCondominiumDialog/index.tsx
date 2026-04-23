import axios from "axios";
import { useMemo, useState } from "react";
import { ActionButton, Field, InlineNotice, Modal, TextInput } from "../../design-system";
import { useControlerButtonPagesContext } from "../../../context/ControlerButtonPagesContext";
import { api } from "../../../service";
import { CondominiumType } from "../../../types/condominium.type";

type AddCondominiumProps = {
  setCondominium: React.Dispatch<React.SetStateAction<CondominiumType[]>>;
};

const AddCondominium: React.FC<AddCondominiumProps> = ({ setCondominium }) => {
  const { openDialogCreateCondominium, setOpenDialogCreateCondominium } = useControlerButtonPagesContext();
  const [status, setStatus] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [errors, setErrors] = useState({ cnpj: "", id: "" });
  const [form, setForm] = useState({ name: "", condominium_id_imodulo: "", cnpj: "", cep: "", address: "", district: "", complement: "", city: "", state: "" });

  const actions = useMemo(() => (<><ActionButton type="button" variant="ghost" onClick={() => setOpenDialogCreateCondominium(false)}>Cancelar</ActionButton><ActionButton type="submit" form="create-condominium-form">Salvar condominio</ActionButton></>), [setOpenDialogCreateCondominium]);

  const validationCep = async () => {
    try {
      const { data } = await axios.get(`https://viacep.com.br/ws/${form.cep}/json/`);
      if (data.erro) return;
      setForm((current) => ({ ...current, address: data.logradouro, district: data.bairro, complement: data.complemento, city: data.localidade, state: data.uf }));
    } catch {
      setStatus({ tone: "error", message: "CEP invalido ou nao encontrado." });
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await api.post("/condominium", { ...form, condominium_id_imodulo: Number(form.condominium_id_imodulo) });
      setCondominium((current) => [...current, response.data]);
      setErrors({ cnpj: "", id: "" });
      setStatus({ tone: "success", message: "Condominio criado com sucesso." });
    } catch (err: any) {
      if (err.response?.data?.message?.includes("cnpj_1 dup key")) {
        setErrors({ cnpj: "CNPJ ja cadastrado", id: "" });
        setStatus({ tone: "error", message: "CNPJ ja cadastrado." });
      } else if (err.response?.data?.message?.includes("condominium_id_imodulo_1 dup key")) {
        setErrors({ cnpj: "", id: "ID ja cadastrado" });
        setStatus({ tone: "error", message: "ID ja cadastrado." });
      } else {
        setStatus({ tone: "error", message: "Nao foi possivel criar o condominio." });
      }
    }
  };

  return (
    <Modal open={openDialogCreateCondominium} onClose={() => setOpenDialogCreateCondominium(false)} title="Novo condominio" description="Cadastre um novo condominio utilizando exclusivamente a nova camada visual." actions={actions} size="xl">
      <form id="create-condominium-form" className="ds-stack" onSubmit={handleSubmit}>
        {status ? <InlineNotice tone={status.tone}>{status.message}</InlineNotice> : null}
        <div className="ds-form-grid">
          <Field label="ID iModulo" required error={errors.id}><TextInput type="number" value={form.condominium_id_imodulo} onChange={(e) => setForm({ ...form, condominium_id_imodulo: e.target.value })} /></Field>
          <Field label="Nome" required><TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="CNPJ" required error={errors.cnpj}><TextInput value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} /></Field>
          <Field label="CEP" required><div className="ds-split"><TextInput value={form.cep} onChange={(e) => setForm({ ...form, cep: e.target.value })} /><ActionButton type="button" variant="secondary" onClick={validationCep}>Buscar CEP</ActionButton></div></Field>
          <div className="ds-form-grid--full"><Field label="Endereco" required><TextInput value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field></div>
          <Field label="Bairro" required><TextInput value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} /></Field>
          <Field label="Numero/Complemento"><TextInput value={form.complement} onChange={(e) => setForm({ ...form, complement: e.target.value })} /></Field>
          <Field label="Cidade" required><TextInput value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
          <Field label="Estado" required><TextInput value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></Field>
        </div>
      </form>
    </Modal>
  );
};

export default AddCondominium;
