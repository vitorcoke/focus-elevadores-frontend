import { useEffect, useMemo, useState } from "react";
import { ActionButton, DataTable, Field, InlineNotice, Modal, SelectInput, TextInput } from "../../design-system";
import { useControlerButtonPagesContext } from "../../../context/ControlerButtonPagesContext";
import { api } from "../../../service";
import { countryOptions } from "../../../constants/countryOptions";
import { Noticies } from "../../../types/noticies.type";
import { Screen } from "../../../types/screens.type";

type AddNoticiesProps = { setNoticies: React.Dispatch<React.SetStateAction<Noticies[]>> };
type ScreenRow = { id: string; name: string };

const categoryOptions = [
  { value: "business", label: "Negócios" },
  { value: "crime", label: "Crime" },
  { value: "domestic", label: "Nacional" },
  { value: "education", label: "Educação" },
  { value: "entertainment", label: "Entreterimento" },
  { value: "environment", label: "Meio ambiente" },
  { value: "food", label: "Alimentação" },
  { value: "health", label: "Saúde" },
  { value: "lifestyle", label: "Estilo de vida" },
  { value: "politics", label: "Política" },
  { value: "science", label: "Ciência" },
  { value: "sports", label: "Esportes" },
  { value: "technology", label: "Tecnologia" },
  { value: "top", label: "Principais" },
  { value: "tourism", label: "Turismo" },
  { value: "world", label: "Mundo" },
  { value: "other", label: "Outros" },
];

const languageOptions = [
  { value: "af", label: "Africâner" },
  { value: "sq", label: "Albanês" },
  { value: "am", label: "Amárico" },
  { value: "ar", label: "Árabe" },
  { value: "hy", label: "Armênio" },
  { value: "as", label: "Assamês" },
  { value: "az", label: "Azerbaijano" },
  { value: "bm", label: "Bambara" },
  { value: "eu", label: "Basco" },
  { value: "be", label: "Bielorrusso" },
  { value: "bn", label: "Bengali" },
  { value: "bs", label: "Bósnio" },
  { value: "bg", label: "Búlgaro" },
  { value: "my", label: "Birmanês" },
  { value: "ca", label: "Catalão" },
  { value: "ckb", label: "Curdo Central" },
  { value: "zh", label: "Chinês" },
  { value: "hr", label: "Croata" },
  { value: "cs", label: "Tcheco" },
  { value: "da", label: "Dinamarquês" },
  { value: "nl", label: "Holandês" },
  { value: "en", label: "Inglês" },
  { value: "et", label: "Estoniano" },
  { value: "pi", label: "Filipino" },
  { value: "fi", label: "Finlandês" },
  { value: "fr", label: "Francês" },
  { value: "gl", label: "Galego" },
  { value: "ka", label: "Georgiano" },
  { value: "de", label: "Alemão" },
  { value: "el", label: "Grego" },
  { value: "gu", label: "Gujarati" },
  { value: "ha", label: "Hauçá" },
  { value: "he", label: "Hebraico" },
  { value: "hi", label: "Hindi" },
  { value: "hu", label: "Húngaro" },
  { value: "is", label: "Islandês" },
  { value: "id", label: "Indonésio" },
  { value: "it", label: "Italiano" },
  { value: "jp", label: "Japonês" },
  { value: "kn", label: "Canarês" },
  { value: "kz", label: "Cazaque" },
  { value: "kh", label: "Khmer" },
  { value: "rw", label: "Kinyarwanda" },
  { value: "ko", label: "Coreano" },
  { value: "ku", label: "Curdo" },
  { value: "lv", label: "Letão" },
  { value: "lt", label: "Lituano" },
  { value: "lb", label: "Luxemburguês" },
  { value: "mk", label: "Macedônio" },
  { value: "ms", label: "Malaio" },
  { value: "ml", label: "Malaiala" },
  { value: "mt", label: "Maltês" },
  { value: "mi", label: "Maori" },
  { value: "mr", label: "Marata" },
  { value: "mn", label: "Mongol" },
  { value: "ne", label: "Nepalês" },
  { value: "no", label: "Norueguês" },
  { value: "or", label: "Oriá" },
  { value: "ps", label: "Pachto" },
  { value: "fa", label: "Persa" },
  { value: "pl", label: "Polonês" },
  { value: "pt", label: "Português" },
  { value: "pa", label: "Punjabi" },
  { value: "ro", label: "Romeno" },
  { value: "ru", label: "Russo" },
  { value: "sm", label: "Samoano" },
  { value: "sr", label: "Sérvio" },
  { value: "sn", label: "Shona" },
  { value: "sd", label: "Sindi" },
  { value: "si", label: "Cingalês" },
  { value: "sk", label: "Eslovaco" },
  { value: "sl", label: "Esloveno" },
  { value: "so", label: "Somali" },
  { value: "es", label: "Espanhol" },
  { value: "sw", label: "Suaíli" },
  { value: "sv", label: "Sueco" },
  { value: "tg", label: "Tajique" },
  { value: "ta", label: "Tâmil" },
  { value: "te", label: "Telugu" },
  { value: "th", label: "Tailandês" },
  { value: "zht", label: "Chinês Tradicional" },
  { value: "tr", label: "Turco" },
  { value: "tk", label: "Turcomeno" },
  { value: "uk", label: "Ucraniano" },
  { value: "ur", label: "Urdu" },
  { value: "uz", label: "Uzbeque" },
  { value: "vi", label: "Vietnamita" },
  { value: "cy", label: "Galês" },
  { value: "zu", label: "Zulu" },
];

const AddNoticies: React.FC<AddNoticiesProps> = ({ setNoticies }) => {
  const { openDialogCreateNoticies, setOpenDialogCreateNoticies } = useControlerButtonPagesContext();
  const [screen, setScreen] = useState<Screen[]>([]);
  const [selectedScreens, setSelectedScreens] = useState<string[]>([]);
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const initialForm = { name: "", search: "", country: "", state: "", city: "", category: "", language: "" };
  const [form, setForm] = useState(initialForm);

  useEffect(() => { api.get("/screens").then((response) => setScreen(response.data)); }, []);
  const rows = useMemo<ScreenRow[]>(() => screen.map((item) => ({ id: item._id, name: item.name })), [screen]);
  const actions = useMemo(() => (<><ActionButton type="button" variant="ghost" onClick={() => handleClose()}>Cancelar</ActionButton><ActionButton type="submit" form="create-noticies-form">Salvar consulta</ActionButton></>), [setOpenDialogCreateNoticies]);

  const resetForm = () => {
    setSelectedScreens([]);
    setStatus(null);
    setForm(initialForm);
  };

  const handleClose = () => {
    resetForm();
    setOpenDialogCreateNoticies(false);
  };

  useEffect(() => {
    if (openDialogCreateNoticies) {
      resetForm();
    }
  }, [openDialogCreateNoticies]);

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
    <Modal open={openDialogCreateNoticies} onClose={handleClose} title="Nova consulta de noticias" description="Defina criterio de busca, localizacao e telas vinculadas na nova camada visual." actions={actions} size="xl">
      <form id="create-noticies-form" className="ds-stack" onSubmit={handleSubmit}>
        {status === "success" ? <InlineNotice tone="success">Consulta criada com sucesso.</InlineNotice> : null}
        {status === "error" ? <InlineNotice tone="error">Nao foi possivel criar a consulta.</InlineNotice> : null}
        <div className="ds-form-grid">
          <Field label="Nome" required hint={`${form.name.length}/30`}><TextInput value={form.name} maxLength={30} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Busca" required><TextInput value={form.search} onChange={(e) => setForm({ ...form, search: e.target.value })} /></Field>
          <Field label="Categoria" required>
            <SelectInput value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">Selecione uma categoria</option>
              {categoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </SelectInput>
          </Field>
          <Field label="Idioma" required>
            <SelectInput value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
              <option value="">Selecione um idioma</option>
              {languageOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </SelectInput>
          </Field>
          <Field label="Pais" required>
            <SelectInput value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}>
              <option value="">Selecione um pais</option>
              {countryOptions.map((option, index) => <option key={`${option.value}-${index}`} value={option.value}>{option.label}</option>)}
            </SelectInput>
          </Field>
          <Field label="Estado" required><TextInput value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></Field>
          <Field label="Cidade" required><TextInput value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></Field>
        </div>
        <DataTable rows={rows} selectedIds={selectedScreens} onSelectionChange={setSelectedScreens} searchPlaceholder="Buscar tela" columns={[{ key: "name", header: "Tela", render: (row) => row.name, searchValue: (row) => row.name }]} />
      </form>
    </Modal>
  );
};

export default AddNoticies;
