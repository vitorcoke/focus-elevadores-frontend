import { useEffect, useMemo, useState } from "react";
import { ActionButton, Field, InlineNotice, Modal, TextArea, TextInput } from "../../design-system";
import { useControlerButtonPagesContext } from "../../../context/ControlerButtonPagesContext";
import { api } from "../../../service";
import { Banner } from "../../../types/banner.type";
import { base64toFile } from "../../../utils/fileBase64";

type AddBannerDialogProps = {
  setBanner: React.Dispatch<React.SetStateAction<Banner[]>>;
};

const AddBannerDialog: React.FC<AddBannerDialogProps> = ({ setBanner }) => {
  const { openDialogCreateBanner, setOpenDialogCreateBanner } = useControlerButtonPagesContext();
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const initialForm = { name: "", description: "", background_color: "#000000", font_color: "#ffffff" };
  const [form, setForm] = useState(initialForm);

  const actions = useMemo(() => (
    <>
      <ActionButton type="button" variant="ghost" onClick={() => handleClose()}>Cancelar</ActionButton>
      <ActionButton type="submit" form="create-banner-form">Salvar banner</ActionButton>
    </>
  ), [setOpenDialogCreateBanner]);

  const resetForm = () => {
    setStatus(null);
    setImage(null);
    setPreview("");
    setForm(initialForm);
  };

  const handleClose = () => {
    resetForm();
    setOpenDialogCreateBanner(false);
  };

  useEffect(() => {
    if (openDialogCreateBanner) {
      resetForm();
    }
  }, [openDialogCreateBanner]);

  const handleImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.includes("image")) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const payload = await base64toFile(image as File);
      const response = await api.post("/banner", { ...form, image: payload });
      setBanner((current) => [...current, response.data]);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <Modal open={openDialogCreateBanner} onClose={handleClose} title="Novo banner" description="Crie uma nova peca visual seguindo os tokens do design system." actions={actions}>
      <form id="create-banner-form" className="ds-stack" onSubmit={handleSubmit}>
        {status === "success" ? <InlineNotice tone="success">Banner criado com sucesso.</InlineNotice> : null}
        {status === "error" ? <InlineNotice tone="error">Nao foi possivel criar o banner.</InlineNotice> : null}
        <div className="ds-form-grid">
          <Field label="Nome" required hint={`${form.name.length}/30`}><TextInput value={form.name} maxLength={30} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Imagem" required><TextInput type="file" accept="image/*" onChange={handleImage} /></Field>
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

export default AddBannerDialog;
