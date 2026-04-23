import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ActionButton,
  Field,
  InlineNotice,
  MultiSelectChips,
  SelectInput,
  SurfaceCard,
  TextInput,
} from "../../../design-system";
import { api } from "../../../../service";
import { Banner } from "../../../../types/banner.type";
import { City } from "../../../../types/city.type";
import { CondominiumMessageType } from "../../../../types/condominium-message.type";
import { CondominiumType } from "../../../../types/condominium.type";
import { Noticies } from "../../../../types/noticies.type";
import { Rss } from "../../../../types/rss.type";
import { State } from "../../../../types/state.type";
import { VMS } from "../../../../types/vms.type";

type AddScreensProps = {
  condominium: CondominiumType;
  setCondominium: React.Dispatch<React.SetStateAction<CondominiumType[]>>;
  rss: Rss[];
  noticies: Noticies[];
  banner: Banner[];
  condominiumMesseger: CondominiumMessageType[];
};

type CameraOption = {
  value: string;
  label: string;
  description: string;
};

const AddScreens: React.FC<AddScreensProps> = ({
  condominium,
  setCondominium,
  rss,
  noticies,
  banner,
  condominiumMesseger,
}) => {
  const [name, setName] = useState("");
  const [validity, setValidity] = useState("");
  const [sourceRss, setSourceRss] = useState<string[]>([]);
  const [selectedNoticies, setSelectedNoticies] = useState<string[]>([]);
  const [selectedBanner, setSelectedBanner] = useState("");
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [stateValue, setStateValue] = useState("");
  const [cityValue, setCityValue] = useState("");
  const [cameraOptions, setCameraOptions] = useState<CameraOption[]>([]);
  const [selectedCameras, setSelectedCameras] = useState<string[]>([]);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    axios
      .get("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
      .then((response) => setStates(response.data));
  }, []);

  useEffect(() => {
    api
      .get(`/vms/condominium/${condominium._id}`)
      .then(async (response) => {
        const requests = response.data.map(async (vms: VMS) => {
          const baseUrl = `http://${vms.username}:${vms.password}@${vms.server}:${vms.port}`;
          const cameraResponse = await axios.get<string>(
            `http://${vms.server}:${vms.port}/camerasnomes.cgi?receiver=${vms.receiver}&server=${vms.account}`,
            {
              auth: {
                username: vms.username,
                password: vms.password,
              },
            }
          );

          return cameraResponse.data
            .split("&")
            .filter(Boolean)
            .map((camera) => {
              const [code, label] = camera.split("=");
              const value = `${baseUrl}/mjpegstream.cgi?camera=${code}`;

              return {
                value,
                label: label || code,
                description: `Camera ${code}`,
              };
            });
        });

        const resolved = await Promise.all(requests);
        setCameraOptions(resolved.flat());
      })
      .catch(() => {
        setCameraOptions([]);
      });
  }, [condominium._id]);

  const handleGetCity = (stateCode: string) => {
    axios
      .get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateCode}/municipios`)
      .then((response) => setCities(response.data));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const screenUpdate = await api.post("/screens", {
        name,
        validity,
        source_rss: sourceRss,
        noticies: selectedNoticies,
        banner: selectedBanner,
        condominium_id: condominium._id,
        condominium_message: selectedMessages,
        state: stateValue,
        city: cityValue,
        condominium_id_imodulo: condominium.condominium_id_imodulo,
        vms_camera: selectedCameras,
      });

      await Promise.all(
        selectedMessages.map((id) =>
          api.patch(`/condominium-message/${id}/screen`, {
            screen_id: screenUpdate.data._id,
          })
        )
      );

      await Promise.all(
        selectedNoticies.map((id) =>
          api.patch(`/noticies/${id}/screen`, {
            screen_id: screenUpdate.data._id,
          })
        )
      );

      setCondominium((old) =>
        old.map((item) =>
          item._id === screenUpdate.data.condominium_id
            ? { ...item, screens: item.screens?.concat(screenUpdate.data._id) }
            : item
        )
      );

      setStatus("success");
      setName("");
      setValidity("");
      setSourceRss([]);
      setSelectedNoticies([]);
      setSelectedBanner("");
      setSelectedMessages([]);
      setStateValue("");
      setCityValue("");
      setCities([]);
      setSelectedCameras([]);
    } catch {
      setStatus("error");
    }
  };

  const rssOptions = useMemo(
    () => rss.map((item) => ({ value: item._id, label: item.name, description: item.url })),
    [rss]
  );

  const noticiesOptions = useMemo(
    () =>
      noticies.map((item) => ({
        value: item._id,
        label: item.name,
        description: `${item.category} - ${item.city || "Sem cidade"}`,
      })),
    [noticies]
  );

  const messageOptions = useMemo(
    () =>
      condominiumMesseger.map((item) => ({
        value: item._id,
        label: item.name,
        description: item.title || item.message || "Mensagem cadastrada",
      })),
    [condominiumMesseger]
  );

  return (
    <form className="ds-stack" onSubmit={handleSubmit}>
      {status === "success" ? <InlineNotice tone="success">Tela cadastrada com sucesso.</InlineNotice> : null}
      {status === "error" ? <InlineNotice tone="error">Nao foi possivel cadastrar a tela.</InlineNotice> : null}

      <div className="ds-form-grid">
        <Field label="Nome" hint={`${name.length}/30`} required>
          <TextInput value={name} maxLength={30} onChange={(event) => setName(event.target.value)} required />
        </Field>

        <Field label="Validade" required>
          <TextInput type="date" value={validity} onChange={(event) => setValidity(event.target.value)} required />
        </Field>

        <Field label="Banner" required>
          <SelectInput value={selectedBanner} onChange={(event) => setSelectedBanner(event.target.value)} required>
            <option value="">Selecione um banner</option>
            {banner.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </SelectInput>
        </Field>

        <Field label="Estado" required>
          <SelectInput
            value={stateValue}
            onChange={(event) => {
              const next = event.target.value;
              setStateValue(next);
              setCityValue("");
              const selectedState = states.find((item) => item.nome === next);
              if (selectedState) {
                handleGetCity(selectedState.sigla);
              } else {
                setCities([]);
              }
            }}
            required
          >
            <option value="">Selecione um estado</option>
            {states.map((item) => (
              <option key={item.id} value={item.nome}>
                {item.nome}
              </option>
            ))}
          </SelectInput>
        </Field>

        <Field label="Cidade" required>
          <SelectInput
            value={cityValue}
            onChange={(event) => setCityValue(event.target.value)}
            disabled={!stateValue}
            required
          >
            <option value="">Selecione uma cidade</option>
            {cities.map((item) => (
              <option key={item.id} value={item.nome}>
                {item.nome}
              </option>
            ))}
          </SelectInput>
        </Field>
      </div>

      {cameraOptions.length > 0 ? (
        <Field label="Cameras VMS">
          <MultiSelectChips options={cameraOptions} values={selectedCameras} onChange={setSelectedCameras} />
        </Field>
      ) : null}

      {rssOptions.length > 0 ? (
        <Field label="Fontes RSS">
          <MultiSelectChips options={rssOptions} values={sourceRss} onChange={setSourceRss} />
        </Field>
      ) : null}

      {noticiesOptions.length > 0 ? (
        <Field label="Noticias" required>
          <MultiSelectChips options={noticiesOptions} values={selectedNoticies} onChange={setSelectedNoticies} />
        </Field>
      ) : null}

      {messageOptions.length > 0 ? (
        <Field label="Mensagens do condominio">
          <MultiSelectChips options={messageOptions} values={selectedMessages} onChange={setSelectedMessages} />
        </Field>
      ) : null}

      <SurfaceCard className="ds-form-actions">
        <div className="ds-split">
          <ActionButton type="submit">Salvar tela</ActionButton>
        </div>
      </SurfaceCard>
    </form>
  );
};

export default AddScreens;
