import { useEffect, useMemo, useState } from "react";
import { ActionButton, DataTable, Field, InlineNotice, Modal, TextInput } from "../../design-system";
import { useControlerButtonPagesContext } from "../../../context/ControlerButtonPagesContext";
import { api } from "../../../service";
import { Rss } from "../../../types/rss.type";
import { Screen } from "../../../types/screens.type";
import { base64toFile } from "../../../utils/fileBase64";

type AddRssProps = { setRss: React.Dispatch<React.SetStateAction<Rss[]>> };

type ScreenRow = { id: string; name: string };

const AddRss: React.FC<AddRssProps> = ({ setRss }) => {
  const { openDialogCreateRss, setOpenDialogCreateRss } = useControlerButtonPagesContext();
  const [screen, setScreen] = useState<Screen[]>([]);
  const [selectedScreens, setSelectedScreens] = useState<string[]>([]);
  const [logo, setLogo] = useState<File | null>(null);
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const initialForm = { name: "", url: "" };
  const [form, setForm] = useState(initialForm);

  useEffect(() => { api.get("/screens").then((response) => setScreen(response.data)); }, []);

  const rows = useMemo<ScreenRow[]>(() => screen.map((item) => ({ id: item._id, name: item.name })), [screen]);
  const actions = useMemo(() => (
    <>
      <ActionButton type="button" variant="ghost" onClick={() => handleClose()}>Cancelar</ActionButton>
      <ActionButton type="submit" form="create-rss-form">Salvar fonte</ActionButton>
    </>
  ), [setOpenDialogCreateRss]);

  const resetForm = () => {
    setSelectedScreens([]);
    setLogo(null);
    setStatus(null);
    setForm(initialForm);
  };

  const handleClose = () => {
    resetForm();
    setOpenDialogCreateRss(false);
  };

  useEffect(() => {
    if (openDialogCreateRss) {
      resetForm();
    }
  }, [openDialogCreateRss]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const payload = logo ? await base64toFile(logo) : "";
      const response = await api.post("/source-rss", { ...form, logotipo: payload, screen_id: selectedScreens });
      if (selectedScreens.length) {
        selectedScreens.forEach(async (screenId) => {
          await api.patch(`/screens/rss/${screenId}`, { source_rss: response.data._id });
        });
      }
      setRss((current) => [...current, response.data]);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <Modal open={openDialogCreateRss} onClose={handleClose} title="Nova fonte RSS" description="Cadastre uma origem de noticias com selecao de telas no novo layout." actions={actions} size="xl">
      <form id="create-rss-form" className="ds-stack" onSubmit={handleSubmit}>
        {status === "success" ? <InlineNotice tone="success">Fonte RSS criada com sucesso.</InlineNotice> : null}
        {status === "error" ? <InlineNotice tone="error">Nao foi possivel criar a fonte RSS.</InlineNotice> : null}
        <div className="ds-form-grid">
          <Field label="Nome" required hint={`${form.name.length}/30`}><TextInput value={form.name} maxLength={30} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Logo" required><TextInput type="file" accept="image/*" onChange={(e) => setLogo(e.target.files?.[0] || null)} /></Field>
          <div className="ds-form-grid--full"><Field label="URL" required><TextInput value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} /></Field></div>
        </div>
        <DataTable rows={rows} selectedIds={selectedScreens} onSelectionChange={setSelectedScreens} searchPlaceholder="Buscar tela" columns={[{ key: "name", header: "Tela", render: (row) => row.name, searchValue: (row) => row.name }]} />
      </form>
    </Modal>
  );
};

export default AddRss;
