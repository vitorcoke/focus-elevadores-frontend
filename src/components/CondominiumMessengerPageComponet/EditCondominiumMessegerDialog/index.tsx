import { useEffect, useMemo, useState } from "react";
import produce from "immer";
import Rezide from "react-image-file-resizer";
import { ActionButton, DataTable, Field, InlineNotice, Modal, SelectInput, TextArea, TextInput } from "../../design-system";
import { useControlerButtonPagesContext } from "../../../context/ControlerButtonPagesContext";
import { useAuthContext } from "../../../context/AuthContext";
import { api } from "../../../service";
import { CondominiumMessageScreenType, CondominiumMessageType } from "../../../types/condominium-message.type";
import { Screen } from "../../../types/screens.type";
import { Permission } from "../../../types/users.type";
import { getMessageScreenIds, getMessageScreens, removeMessageScreen, syncSelectedMessageScreens } from "../../../utils/condominiumMessageScreens";

type EditCondominiumMessegerProps = {
  condominiumMesseger: CondominiumMessageType;
  setCondominiumMesseger: React.Dispatch<React.SetStateAction<CondominiumMessageType[]>>;
};

type ScreenRow = { id: string; name: string };

const EditCondominiumMessegerDialog: React.FC<EditCondominiumMessegerProps> = ({ condominiumMesseger, setCondominiumMesseger }) => {
  const { user } = useAuthContext();
  const { openDialogEditCondominiumMessenger, setOpenDialogEditCondominiumMessenger, setCheckboxCondominiumMessenger } = useControlerButtonPagesContext();
  const [screen, setScreen] = useState<Screen[]>([]);
  const [selectedScreens, setSelectedScreens] = useState<string[]>([]);
  const [selectedScreenConfigs, setSelectedScreenConfigs] = useState<CondominiumMessageScreenType[]>([]);
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [form, setForm] = useState(condominiumMesseger);

  useEffect(() => {
    setForm(condominiumMesseger);
    setSelectedScreens(getMessageScreenIds(condominiumMesseger));
    setSelectedScreenConfigs(getMessageScreens(condominiumMesseger));
    setPreview(condominiumMesseger.jpg_file || "");
    setImage(null);
  }, [condominiumMesseger]);
  useEffect(() => { api.get("/screens").then((response) => setScreen(response.data)); }, [openDialogEditCondominiumMessenger]);

  const rows = useMemo<ScreenRow[]>(() => screen.map((item) => ({ id: item._id, name: item.name })), [screen]);
  const actions = useMemo(() => (<><ActionButton type="button" variant="ghost" onClick={() => { setOpenDialogEditCondominiumMessenger(false); setCheckboxCondominiumMessenger([]); }}>Cancelar</ActionButton><ActionButton type="submit" form="edit-message-form">Salvar alteracoes</ActionButton></>), [setCheckboxCondominiumMessenger, setOpenDialogEditCondominiumMessenger]);
  const mode = form.jpg_file ? "image" : "text";

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
      let imageName = form.jpg_file || "";
      if (mode === "image" && image) {
        const formData = new FormData();
        formData.append("file", image);
        const upload = await api.post("/condominium-message/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
        imageName = upload.data;
      }

      const previousScreens = getMessageScreenIds(form);
      const addedScreens = selectedScreens.filter((id) => !previousScreens.includes(id));
      const removedScreens = previousScreens.filter((id) => !selectedScreens.includes(id));

      const response = await api.patch(`/condominium-message/${form._id}`, {
        ...form,
        title: mode === "text" ? form.title : undefined,
        message: mode === "text" ? form.message : undefined,
        jpg_file: mode === "image" ? imageName : undefined,
        screen_id: selectedScreenConfigs,
        time_exibition: form.time_exibition,
      });

      addedScreens.forEach(async (screenId) => {
        await api.patch(`/screens/message/${screenId}`, { condominium_message: response.data._id });
      });
      removedScreens.forEach(async (screenId) => {
        await api.delete(`/screens/message/${form._id}/screen/${screenId}`);
      });

      setCondominiumMesseger((current) => produce(current, (draft) => {
        const index = draft.findIndex((item) => item._id === form._id);
        if (index >= 0) draft[index] = response.data;
      }));
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <Modal open={openDialogEditCondominiumMessenger} onClose={() => setOpenDialogEditCondominiumMessenger(false)} title="Editar mensagem" description="Atualize conteudo, agenda e telas vinculadas na interface nova." actions={actions} size="xl">
      <form id="edit-message-form" className="ds-stack" onSubmit={handleSubmit}>
        {status === "success" ? <InlineNotice tone="success">Mensagem atualizada com sucesso.</InlineNotice> : null}
        {status === "error" ? <InlineNotice tone="error">Nao foi possivel atualizar a mensagem.</InlineNotice> : null}
        <div className="ds-form-grid">
          <Field label="Tipo"><SelectInput value={mode} disabled><option value={mode}>{mode === "image" ? "Imagem" : "Texto"}</option></SelectInput></Field>
          <Field label="Nome" required><TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          {mode === "text" ? <Field label="Titulo" required><TextInput value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field> : <Field label="Nova imagem"><TextInput type="file" accept="image/jpeg" onChange={handleImage} /></Field>}
          <Field label="Inicio" required><TextInput type="datetime-local" value={form.starttime ? new Date(form.starttime).toISOString().slice(0,16) : ""} onChange={(e) => setForm({ ...form, starttime: new Date(e.target.value) })} /></Field>
          <Field label="Fim" required><TextInput type="datetime-local" value={form.endtime ? new Date(form.endtime).toISOString().slice(0,16) : ""} onChange={(e) => setForm({ ...form, endtime: new Date(e.target.value) })} /></Field>
          {user?.permission === Permission.ADMIN ? <Field label="Exibicao (s)"><TextInput type="number" value={String(form.time_exibition || 15)} onChange={(e) => setForm({ ...form, time_exibition: Number(e.target.value) })} /></Field> : null}
          {mode === "text" ? <div className="ds-form-grid--full"><Field label="Mensagem" required><TextArea value={form.message || ""} onChange={(e) => setForm({ ...form, message: e.target.value })} /></Field></div> : null}
        </div>
        {mode === "image" && preview ? <div aria-label="preview" style={{ width: 260, height: 180, borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)", backgroundImage: `url(${preview})`, backgroundSize: "cover", backgroundPosition: "center" }} /> : null}
        <DataTable
          rows={rows}
          selectedIds={selectedScreens}
          onSelectionChange={(ids) => {
            setSelectedScreens(ids);
            setSelectedScreenConfigs((current) =>
              syncSelectedMessageScreens(
                ids,
                current,
                form.starttime,
                form.endtime
              )
            );
          }}
          searchPlaceholder="Buscar tela"
          columns={[{ key: "name", header: "Tela", render: (row) => row.name, searchValue: (row) => row.name }]}
        />
        {selectedScreenConfigs.length > 0 ? (
          <div className="ds-stack">
            <h3 className="ds-section-title">Horarios por tela</h3>
            {selectedScreenConfigs.map((screenConfig) => {
              const selectedScreen = screen.find((item) => item._id === screenConfig.screen_id);

              return (
                <div key={screenConfig.screen_id} className="ds-form-grid">
                  <Field label="Tela">
                    <TextInput value={selectedScreen?.name || screenConfig.screen_id} disabled />
                  </Field>
                  <Field label="Inicio" required>
                    <TextInput
                      type="datetime-local"
                      value={screenConfig.starttime ? new Date(screenConfig.starttime).toISOString().slice(0, 16) : ""}
                      onChange={(e) =>
                        setSelectedScreenConfigs((current) =>
                          current.map((item) =>
                            item.screen_id === screenConfig.screen_id
                              ? { ...item, starttime: e.target.value ? new Date(e.target.value) : undefined }
                              : item
                          )
                        )
                      }
                    />
                  </Field>
                  <Field label="Fim" required>
                    <TextInput
                      type="datetime-local"
                      value={screenConfig.endtime ? new Date(screenConfig.endtime).toISOString().slice(0, 16) : ""}
                      onChange={(e) =>
                        setSelectedScreenConfigs((current) =>
                          current.map((item) =>
                            item.screen_id === screenConfig.screen_id
                              ? { ...item, endtime: e.target.value ? new Date(e.target.value) : undefined }
                              : item
                          )
                        )
                      }
                    />
                  </Field>
                </div>
              );
            })}
          </div>
        ) : null}
      </form>
    </Modal>
  );
};

export default EditCondominiumMessegerDialog;
