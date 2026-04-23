import { useEffect, useMemo, useState } from "react";
import produce from "immer";
import { ActionButton, DataTable, Field, InlineNotice, Modal, TextInput } from "../../design-system";
import { useControlerButtonPagesContext } from "../../../context/ControlerButtonPagesContext";
import { api } from "../../../service";
import { Rss } from "../../../types/rss.type";
import { Screen } from "../../../types/screens.type";
import { base64toFile } from "../../../utils/fileBase64";

type EditRssProps = {
  rss: Rss;
  setRss: React.Dispatch<React.SetStateAction<Rss[]>>;
};

type ScreenRow = { id: string; name: string };

const EditRss: React.FC<EditRssProps> = ({ rss, setRss }) => {
  const { openDialogEditRss, setOpenDialogEditRss, setCheckboxRss } = useControlerButtonPagesContext();
  const [form, setForm] = useState(rss);
  const [logo, setLogo] = useState<File | null>(null);
  const [screen, setScreen] = useState<Screen[]>([]);
  const [selectedScreens, setSelectedScreens] = useState<string[]>([]);
  const [status, setStatus] = useState<"success" | "error" | null>(null);

  useEffect(() => { setForm(rss); setSelectedScreens(rss.screen_id || []); setLogo(null); }, [rss]);
  useEffect(() => { api.get("/screens").then((response) => setScreen(response.data)); }, [openDialogEditRss]);

  const rows = useMemo<ScreenRow[]>(() => screen.map((item) => ({ id: item._id, name: item.name })), [screen]);
  const actions = useMemo(() => (
    <>
      <ActionButton type="button" variant="ghost" onClick={() => { setOpenDialogEditRss(false); setCheckboxRss([]); }}>Cancelar</ActionButton>
      <ActionButton type="submit" form="edit-rss-form">Salvar alteracoes</ActionButton>
    </>
  ), [setCheckboxRss, setOpenDialogEditRss]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const payload = logo ? await base64toFile(logo) : form.logotipo;
      const response = await api.patch(`/source-rss/${form._id}`, { ...form, logotipo: payload, screen_id: selectedScreens });
      setRss((current) => produce(current, (draft) => {
        const index = draft.findIndex((item) => item._id === form._id);
        if (index >= 0) draft[index] = response.data;
      }));
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <Modal open={openDialogEditRss} onClose={() => setOpenDialogEditRss(false)} title="Editar fonte RSS" description="Atualize dados, logo e vinculos de telas usando a nova interface." actions={actions} size="xl">
      <form id="edit-rss-form" className="ds-stack" onSubmit={handleSubmit}>
        {status === "success" ? <InlineNotice tone="success">Fonte RSS atualizada com sucesso.</InlineNotice> : null}
        {status === "error" ? <InlineNotice tone="error">Nao foi possivel atualizar a fonte RSS.</InlineNotice> : null}
        <div className="ds-form-grid">
          <Field label="Nome" required hint={`${form.name.length}/30`}><TextInput value={form.name} maxLength={30} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Novo logo"><TextInput type="file" accept="image/*" onChange={(e) => setLogo(e.target.files?.[0] || null)} /></Field>
          <div className="ds-form-grid--full"><Field label="URL" required><TextInput value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} /></Field></div>
        </div>
        <DataTable rows={rows} selectedIds={selectedScreens} onSelectionChange={setSelectedScreens} searchPlaceholder="Buscar tela" columns={[{ key: "name", header: "Tela", render: (row) => row.name, searchValue: (row) => row.name }]} />
      </form>
    </Modal>
  );
};

export default EditRss;
