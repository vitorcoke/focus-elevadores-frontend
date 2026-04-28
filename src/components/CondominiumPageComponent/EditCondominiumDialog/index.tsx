import { useEffect, useMemo, useState } from "react";
import produce from "immer";
import { ActionButton, Field, InlineNotice, Modal, TextInput } from "../../design-system";
import { useControlerButtonPagesContext } from "../../../context/ControlerButtonPagesContext";
import { api } from "../../../service";
import { CondominiumType } from "../../../types/condominium.type";
import { PatternFormat } from "react-number-format";
import axios from "axios";

type EditCondominiumProps = {
  condominium: CondominiumType;
  setCondominium: React.Dispatch<React.SetStateAction<CondominiumType[]>>;
};

const EditCondominium: React.FC<EditCondominiumProps> = ({ condominium, setCondominium }) => {
  const { openDialogEditCondominium, setOpenDialogEditCondominium } = useControlerButtonPagesContext();
  const [form, setForm] = useState(condominium);
  const [status, setStatus] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [errors, setErrors] = useState({ cnpj: "", id: "" });

  useEffect(() => { setForm(condominium); }, [condominium]);

  const actions = useMemo(() => (<><ActionButton type="button" variant="ghost" onClick={() => setOpenDialogEditCondominium(false)}>Cancelar</ActionButton><ActionButton type="submit" form="edit-condominium-form">Salvar alteracoes</ActionButton></>), [setOpenDialogEditCondominium]);

  const validationCep = async () => {
    try {
      const cleanCep = form.cep.replace(/\D/g, "");
      if (cleanCep.length !== 8) {
        setStatus({ tone: "error", message: "CEP invalido ou incompleto." });
        return;
      }

      const { data } = await axios.get(`https://viacep.com.br/ws/${cleanCep}/json/`);
      if (data.erro) return;
      setForm((current) => ({ ...current, address: data.logradouro, district: data.bairro, complement: data.complemento, city: data.localidade, state: data.uf }));
    } catch {
      setStatus({ tone: "error", message: "CEP invalido ou nao encontrado." });
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await api.patch(`/condominium/${condominium._id}`, form);
      setCondominium((current) => produce(current, (draft) => {
        const index = draft.findIndex((item) => item._id === condominium._id);
        if (index >= 0) draft[index] = form;
      }));
      setErrors({ cnpj: "", id: "" });
      setStatus({ tone: "success", message: "Condominio atualizado com sucesso." });
    } catch (err: any) {
      if (err.response?.data?.message?.includes("cnpj_1 dup key")) {
        setErrors({ cnpj: "CNPJ ja cadastrado", id: "" });
        setStatus({ tone: "error", message: "CNPJ ja cadastrado." });
      } else if (err.response?.data?.message?.includes("condominium_id_imodulo_1 dup key")) {
        setErrors({ cnpj: "", id: "ID ja cadastrado" });
        setStatus({ tone: "error", message: "ID ja cadastrado." });
      } else {
        setStatus({ tone: "error", message: "Nao foi possivel atualizar o condominio." });
      }
    }
  };

  return (
    <Modal open={openDialogEditCondominium} onClose={() => setOpenDialogEditCondominium(false)} title="Editar condominio" description="Atualize os dados cadastrais no novo frontend." actions={actions} size="xl">
      <form id="edit-condominium-form" className="ds-stack" onSubmit={handleSubmit}>
        {status ? <InlineNotice tone={status.tone}>{status.message}</InlineNotice> : null}
        <div className="ds-form-grid">
          <Field label="ID iModulo" required error={errors.id}><TextInput inputMode="numeric" value={String(form.condominium_id_imodulo)} onChange={(e) => setForm({ ...form, condominium_id_imodulo: Number(e.target.value.replace(/\D/g, "")) || 0 })} /></Field>
          <Field label="Nome" required><TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="CNPJ" required error={errors.cnpj}>
            <PatternFormat
              customInput={TextInput as any}
              format="##.###.###/####-##"
              mask="_"
              value={form.cnpj}
              onValueChange={(values) => setForm({ ...form, cnpj: values.formattedValue })}
            />
          </Field>
          <Field label="CEP" required>
            <div className="ds-split ds-split--stretch">
              <PatternFormat
                customInput={TextInput as any}
                format="#####-###"
                mask="_"
                value={form.cep}
                onValueChange={(values) => setForm({ ...form, cep: values.formattedValue })}
              />
              <ActionButton type="button" variant="secondary" onClick={validationCep}>Buscar CEP</ActionButton>
            </div>
          </Field>
          <div className="ds-form-grid--full"><Field label="Endereco" required><TextInput value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Field></div>
          <Field label="Bairro" required><TextInput value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} /></Field>
          <Field label="Numero/Complemento"><TextInput value={form.complement || ""} onChange={(e) => setForm({ ...form, complement: e.target.value })} /></Field>
          <Field label="Cidade" required><TextInput value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
          <Field label="Estado" required><TextInput value={form.state} maxLength={2} onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })} /></Field>
        </div>
      </form>
    </Modal>
  );
};

export default EditCondominium;
