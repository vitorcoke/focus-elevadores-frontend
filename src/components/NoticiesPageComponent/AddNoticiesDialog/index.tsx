import { useEffect, useMemo, useState } from "react";
import { ActionButton, DataTable, Field, InlineNotice, Modal, TextInput } from "../../design-system";
import { useControlerButtonPagesContext } from "../../../context/ControlerButtonPagesContext";
import { api } from "../../../service";
import { Noticies } from "../../../types/noticies.type";
import { Screen } from "../../../types/screens.type";

type AddNoticiesProps = { setNoticies: React.Dispatch<React.SetStateAction<Noticies[]>> };
type ScreenRow = { id: string; name: string };

const AddNoticies: React.FC<AddNoticiesProps> = ({ setNoticies }) => {
  const { openDialogCreateNoticies, setOpenDialogCreateNoticies } = useControlerButtonPagesContext();
  const [screen, setScreen] = useState<Screen[]>([]);
  const [selectedScreens, setSelectedScreens] = useState<string[]>([]);
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [form, setForm] = useState({ name: "", search: "", country: "", state: "", city: "", category: "", language: "" });

  useEffect(() => { api.get("/screens").then((response) => setScreen(response.data)); }, []);
  const rows = useMemo<ScreenRow[]>(() => screen.map((item) => ({ id: item._id, name: item.name })), [screen]);
  const actions = useMemo(() => (<><ActionButton type="button" variant="ghost" onClick={() => setOpenDialogCreateNoticies(false)}>Cancelar</ActionButton><ActionButton type="submit" form="create-noticies-form">Salvar consulta</ActionButton></>), [setOpenDialogCreateNoticies]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await api.post("/noticies", { ...form, screen_id: selectedScreens });
      if (selectedScreens.length) {
        selectedScreens.forEach(async (screenId) => {
          await api.patch(`/screens/noticies/${screenId}`, { noticies: response.data._id });
        });
      }
      setNoticies((current) => [...current, response.data]);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <Modal open={openDialogCreateNoticies} onClose={() => setOpenDialogCreateNoticies(false)} title="Nova consulta de noticias" description="Defina criterio de busca, localizacao e telas vinculadas na nova camada visual." actions={actions} size="xl">
      <form id="create-noticies-form" className="ds-stack" onSubmit={handleSubmit}>
        {status === "success" ? <InlineNotice tone="success">Consulta criada com sucesso.</InlineNotice> : null}
        {status === "error" ? <InlineNotice tone="error">Nao foi possivel criar a consulta.</InlineNotice> : null}
        <div className="ds-form-grid">
          <Field label="Nome" required hint={`${form.name.length}/30`}><TextInput value={form.name} maxLength={30} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Busca" required><TextInput value={form.search} onChange={(e) => setForm({ ...form, search: e.target.value })} /></Field>
          <Field label="Categoria" required><TextInput value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Ex.: technology" /></Field>
          <Field label="Idioma" required><TextInput value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} placeholder="Ex.: pt" /></Field>
          <Field label="Pais" required><TextInput value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></Field>
          <Field label="Estado" required><TextInput value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></Field>
          <Field label="Cidade" required><TextInput value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
        </div>
        <DataTable rows={rows} selectedIds={selectedScreens} onSelectionChange={setSelectedScreens} searchPlaceholder="Buscar tela" columns={[{ key: "name", header: "Tela", render: (row) => row.name, searchValue: (row) => row.name }]} />
      </form>
    </Modal>
  );
};

export default AddNoticies;
