import { useEffect, useMemo, useState } from "react";
import produce from "immer";
import { ActionButton, DataTable, Field, InlineNotice, Modal, TextInput } from "../../design-system";
import { useControlerButtonPagesContext } from "../../../context/ControlerButtonPagesContext";
import { api } from "../../../service";
import { Noticies } from "../../../types/noticies.type";
import { Screen } from "../../../types/screens.type";

type EditNoticiesProps = {
  noticies: Noticies;
  setNoticies: React.Dispatch<React.SetStateAction<Noticies[]>>;
};

type ScreenRow = { id: string; name: string };

const EditNoticies: React.FC<EditNoticiesProps> = ({ noticies, setNoticies }) => {
  const { openDialogEditNoticies, setOpenDialogEditNoticies, setCheckboxNoticies } = useControlerButtonPagesContext();
  const [form, setForm] = useState(noticies);
  const [screen, setScreen] = useState<Screen[]>([]);
  const [selectedScreens, setSelectedScreens] = useState<string[]>([]);
  const [status, setStatus] = useState<"success" | "error" | null>(null);

  useEffect(() => { setForm(noticies); setSelectedScreens(noticies.screen_id || []); }, [noticies]);
  useEffect(() => { api.get("/screens").then((response) => setScreen(response.data)); }, [openDialogEditNoticies]);

  const rows = useMemo<ScreenRow[]>(() => screen.map((item) => ({ id: item._id, name: item.name })), [screen]);
  const actions = useMemo(() => (<><ActionButton type="button" variant="ghost" onClick={() => { setOpenDialogEditNoticies(false); setCheckboxNoticies([]); }}>Cancelar</ActionButton><ActionButton type="submit" form="edit-noticies-form">Salvar alteracoes</ActionButton></>), [setCheckboxNoticies, setOpenDialogEditNoticies]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await api.patch(`/noticies/${form._id}`, { ...form, screen_id: selectedScreens });
      setNoticies((current) => produce(current, (draft) => {
        const index = draft.findIndex((item) => item._id === form._id);
        if (index >= 0) draft[index] = response.data;
      }));
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <Modal open={openDialogEditNoticies} onClose={() => setOpenDialogEditNoticies(false)} title="Editar consulta de noticias" description="Ajuste filtros e telas associadas dentro do novo design system." actions={actions} size="xl">
      <form id="edit-noticies-form" className="ds-stack" onSubmit={handleSubmit}>
        {status === "success" ? <InlineNotice tone="success">Consulta atualizada com sucesso.</InlineNotice> : null}
        {status === "error" ? <InlineNotice tone="error">Nao foi possivel atualizar a consulta.</InlineNotice> : null}
        <div className="ds-form-grid">
          <Field label="Nome" required hint={`${form.name.length}/30`}><TextInput value={form.name} maxLength={30} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Busca" required><TextInput value={form.search} onChange={(e) => setForm({ ...form, search: e.target.value })} /></Field>
          <Field label="Categoria" required><TextInput value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
          <Field label="Idioma" required><TextInput value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} /></Field>
          <Field label="Pais" required><TextInput value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></Field>
          <Field label="Estado" required><TextInput value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></Field>
          <Field label="Cidade" required><TextInput value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
        </div>
        <DataTable rows={rows} selectedIds={selectedScreens} onSelectionChange={setSelectedScreens} searchPlaceholder="Buscar tela" columns={[{ key: "name", header: "Tela", render: (row) => row.name, searchValue: (row) => row.name }]} />
      </form>
    </Modal>
  );
};

export default EditNoticies;
