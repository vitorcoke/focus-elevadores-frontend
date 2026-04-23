import { useEffect, useMemo, useState } from "react";
import Rezide from "react-image-file-resizer";
import { ActionButton, DataTable, Field, InlineNotice, Modal, SelectInput, TextArea, TextInput } from "../../design-system";
import { useControlerButtonPagesContext } from "../../../context/ControlerButtonPagesContext";
import { useAuthContext } from "../../../context/AuthContext";
import { api } from "../../../service";
import { CondominiumMessageType } from "../../../types/condominium-message.type";
import { Screen } from "../../../types/screens.type";
import { Permission } from "../../../types/users.type";

type AddCondominiumMessegerProps = {
  setCondominiumMesseger: React.Dispatch<React.SetStateAction<CondominiumMessageType[]>>;
};

type ScreenRow = { id: string; name: string };

const AddCondominiumMessegerDialog: React.FC<AddCondominiumMessegerProps> = ({ setCondominiumMesseger }) => {
  const { user } = useAuthContext();
  const { openDialogCreateCondominiumMessenger, setOpenDialogCreateCondominiumMessenger, setCheckboxCondominiumMessenger } = useControlerButtonPagesContext();
  const [screen, setScreen] = useState<Screen[]>([]);
  const [selectedScreens, setSelectedScreens] = useState<string[]>([]);
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [mode, setMode] = useState("text");
  const [form, setForm] = useState({ name: "", title: "", message: "", starttime: "", endtime: "", time_exibition: "15" });

  useEffect(() => { api.get("/screens").then((response) => setScreen(response.data)); }, []);
  const rows = useMemo<ScreenRow[]>(() => screen.map((item) => ({ id: item._id, name: item.name })), [screen]);
  const actions = useMemo(() => (<><ActionButton type="button" variant="ghost" onClick={() => setOpenDialogCreateCondominiumMessenger(false)}>Cancelar</ActionButton><ActionButton type="submit" form="create-message-form">Salvar mensagem</ActionButton></>), [setOpenDialogCreateCondominiumMessenger]);

  const handleImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.includes("image")) return;
    Rezide.imageFileResizer(file, 960, 750, "JPEG", 200, 0, (url) => {
      if (url instanceof File) {
        setImage(url);
        setPreview(URL.createObjectURL(url));
      }
    }, "file");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      let imageName = "";
      if (mode === "image" && image) {
        const formData = new FormData();
        formData.append("file", image);
        const upload = await api.post("/condominium-message/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
        imageName = upload.data;
      }
      const response = await api.post("/condominium-message", {
        name: form.name,
        title: mode === "text" ? form.title : undefined,
        message: mode === "text" ? form.message : undefined,
        jpg_file: mode === "image" ? imageName : undefined,
        starttime: new Date(form.starttime),
        endtime: new Date(form.endtime),
        screen_id: selectedScreens,
        time_exibition: Number(form.time_exibition || "15") * 1000,
      });
      if (selectedScreens.length) {
        selectedScreens.forEach(async (screenId) => {
          await api.patch(`/screens/message/${screenId}`, { condominium_message: response.data._id });
        });
      }
      setCondominiumMesseger((current) => [...current, response.data]);
      setCheckboxCondominiumMessenger([]);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <Modal open={openDialogCreateCondominiumMessenger} onClose={() => setOpenDialogCreateCondominiumMessenger(false)} title="Nova mensagem" description="Crie uma mensagem em texto ou imagem na nova interface." actions={actions} size="xl">
      <form id="create-message-form" className="ds-stack" onSubmit={handleSubmit}>
        {status === "success" ? <InlineNotice tone="success">Mensagem criada com sucesso.</InlineNotice> : null}
        {status === "error" ? <InlineNotice tone="error">Nao foi possivel criar a mensagem.</InlineNotice> : null}
        <div className="ds-form-grid">
          <Field label="Tipo"><SelectInput value={mode} onChange={(e) => setMode(e.target.value)}><option value="text">Texto</option><option value="image">Imagem</option></SelectInput></Field>
          <Field label="Nome" required><TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          {mode === "text" ? <Field label="Titulo" required><TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field> : <Field label="Arquivo" required><TextInput type="file" accept="image/jpeg" onChange={handleImage} /></Field>}
          <Field label="Inicio" required><TextInput type="datetime-local" value={form.starttime} onChange={(e) => setForm({ ...form, starttime: e.target.value })} /></Field>
          <Field label="Fim" required><TextInput type="datetime-local" value={form.endtime} onChange={(e) => setForm({ ...form, endtime: e.target.value })} /></Field>
          {user?.permission === Permission.ADMIN ? <Field label="Exibicao (s)"><TextInput type="number" value={form.time_exibition} onChange={(e) => setForm({ ...form, time_exibition: e.target.value.slice(0, 3) })} /></Field> : null}
          {mode === "text" ? <div className="ds-form-grid--full"><Field label="Mensagem" required><TextArea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></Field></div> : null}
        </div>
        {mode === "image" && preview ? <div aria-label="preview" style={{ width: 260, height: 180, borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)", backgroundImage: `url(${preview})`, backgroundSize: "cover", backgroundPosition: "center" }} /> : null}
        <DataTable rows={rows} selectedIds={selectedScreens} onSelectionChange={setSelectedScreens} searchPlaceholder="Buscar tela" columns={[{ key: "name", header: "Tela", render: (row) => row.name, searchValue: (row) => row.name }]} />
      </form>
    </Modal>
  );
};

export default AddCondominiumMessegerDialog;
