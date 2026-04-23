import { useEffect, useMemo, useState } from "react";
import produce from "immer";
import { ActionButton, Field, InlineNotice, Modal, TextArea, TextInput } from "../../design-system";
import { useControlerButtonPagesContext } from "../../../context/ControlerButtonPagesContext";
import { api } from "../../../service";
import { Banner } from "../../../types/banner.type";
import { base64toFile } from "../../../utils/fileBase64";

type EditBannerDialogProps = {
  banner: Banner;
  setBanner: React.Dispatch<React.SetStateAction<Banner[]>>;
};

const EditBannerDialog: React.FC<EditBannerDialogProps> = ({ banner, setBanner }) => {
  const { openDialogEditBanner, setOpenDialogEditBanner, setCheckboxBanner } = useControlerButtonPagesContext();
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [form, setForm] = useState(banner);

  useEffect(() => { setForm(banner); setPreview(banner.image); setImage(null); }, [banner]);

  const actions = useMemo(() => (
    <>
      <ActionButton type="button" variant="ghost" onClick={() => { setOpenDialogEditBanner(false); setCheckboxBanner([]); }}>Cancelar</ActionButton>
      <ActionButton type="submit" form="edit-banner-form">Salvar alteracoes</ActionButton>
    </>
  ), [setCheckboxBanner, setOpenDialogEditBanner]);

  const handleImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.includes("image")) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const payload = image ? await base64toFile(image) : form.image;
      const response = await api.patch(`/banner/${form._id}`, { ...form, image: payload });
      setBanner((current) => produce(current, (draft) => {
        const index = draft.findIndex((item) => item._id === form._id);
        if (index >= 0) draft[index] = response.data;
      }));
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <Modal open={openDialogEditBanner} onClose={() => setOpenDialogEditBanner(false)} title="Editar banner" description="Atualize o banner selecionado mantendo as integracoes existentes." actions={actions}>
      <form id="edit-banner-form" className="ds-stack" onSubmit={handleSubmit}>
        {status === "success" ? <InlineNotice tone="success">Banner atualizado com sucesso.</InlineNotice> : null}
        {status === "error" ? <InlineNotice tone="error">Nao foi possivel atualizar o banner.</InlineNotice> : null}
        <div className="ds-form-grid">
          <Field label="Nome" required hint={`${form.name.length}/30`}><TextInput value={form.name} maxLength={30} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Nova imagem"><TextInput type="file" accept="image/*" onChange={handleImage} /></Field>
          <div className="ds-form-grid--full">
            <Field label="Descricao" required hint={`${form.description.length}/250`}><TextArea value={form.description} maxLength={250} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          </div>
          <Field label="Cor de fundo"><TextInput type="color" value={form.background_color} onChange={(e) => setForm({ ...form, background_color: e.target.value })} style={{ padding: 6 }} /></Field>
          <Field label="Cor da fonte"><TextInput type="color" value={form.font_color} onChange={(e) => setForm({ ...form, font_color: e.target.value })} style={{ padding: 6 }} /></Field>
        </div>
        {preview ? <div aria-label="preview" style={{ width: 240, height: 140, borderRadius: 18, border: "1px solid rgba(255,255,255,0.08)", backgroundImage: `url(${preview})`, backgroundSize: "cover", backgroundPosition: "center" }} /> : null}
      </form>
    </Modal>
  );
};

export default EditBannerDialog;
