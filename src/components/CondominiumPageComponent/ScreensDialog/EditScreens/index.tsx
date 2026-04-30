import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
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
import { useControlerButtonPagesContext } from "../../../../context/ControlerButtonPagesContext";
import { api } from "../../../../service";
import { Screen } from "../../../../types/screens.type";
import { CondominiumType } from "../../../../types/condominium.type";
import { Rss } from "../../../../types/rss.type";
import { City } from "../../../../types/city.type";
import { State } from "../../../../types/state.type";
import { Banner } from "../../../../types/banner.type";
import { CondominiumMessageType } from "../../../../types/condominium-message.type";
import { Noticies } from "../../../../types/noticies.type";
import { useAuthContext } from "../../../../context/AuthContext";
import { Permission } from "../../../../types/users.type";
import { getMessageScreenById, getMessageScreenIds, getMessageScreens, removeMessageScreen, upsertMessageScreen } from "../../../../utils/condominiumMessageScreens";

type EditScreensProps = {
  condominium: CondominiumType;
  setCondominium: React.Dispatch<React.SetStateAction<CondominiumType[]>>;
  rss: Rss[];
  banner: Banner[];
  noticies: Noticies[];
  condominiumMesseger: CondominiumMessageType[];
  setCondominiumMesseger: React.Dispatch<React.SetStateAction<CondominiumMessageType[]>>;
};

const EditScreens: React.FC<EditScreensProps> = ({
  condominium,
  setCondominium,
  rss,
  noticies,
  banner,
  condominiumMesseger,
  setCondominiumMesseger,
}) => {
  const { user } = useAuthContext();
  const { checkboxScreens } = useControlerButtonPagesContext();

  const [screenCondominium, setScreenCondominium] = useState<Screen>({
    _id: "",
    name: "",
    validity: "",
    source_rss: [],
    noticies: [],
    condominium_message: [],
    banner: "",
    state: "",
    city: "",
    vms_camera: [],
  });
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [stateValue, setStateValue] = useState("");
  const [cityValue, setCityValue] = useState("");
  const [newMessageId, setNewMessageId] = useState("");
  const [newMessageStart, setNewMessageStart] = useState("");
  const [newMessageEnd, setNewMessageEnd] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    const selectedId = checkboxScreens[0];
    if (!selectedId) return;

    api.get(`/screens/${selectedId}`).then((response) => {
      setScreenCondominium(response.data);
      setStateValue(response.data.state || "");
      setCityValue(response.data.city || "");
    });
  }, [checkboxScreens]);

  useEffect(() => {
    axios
      .get("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
      .then((response) => setStates(response.data));
  }, []);

  useEffect(() => {
    const selectedState = states.find((item) => item.nome === stateValue);
    if (!selectedState) return;

    axios
      .get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState.sigla}/municipios`)
      .then((response) => setCities(response.data));
  }, [stateValue, states]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const previousScreen = await api.get<Screen>(`/screens/${screenCondominium._id}`);
      const previousRss = previousScreen.data.source_rss || [];
      const previousNoticies = previousScreen.data.noticies || [];

      await api.patch(`/screens/${screenCondominium._id}`, {
        name: screenCondominium.name,
        banner: screenCondominium.banner,
        source_rss: screenCondominium.source_rss,
        noticies: screenCondominium.noticies,
        condominium_message: screenCondominium.condominium_message,
        state: stateValue || screenCondominium.state,
        city: cityValue || screenCondominium.city,
      });

      await Promise.all(
        previousRss
          .filter((id) => !screenCondominium.source_rss.includes(id))
          .map(async (id) => {
            const response = await api.get(`/source-rss/${id}`);
            await api.patch(`/source-rss/${id}`, {
              screen_id: (response.data.screen_id || []).filter((screenId: string) => screenId !== screenCondominium._id),
            });
          })
      );

      await Promise.all(
        screenCondominium.source_rss
          .filter((id) => !previousRss.includes(id))
          .map(async (id) => {
            const response = await api.get(`/source-rss/${id}`);
            const screenIds = response.data.screen_id || [];
            if (!screenIds.includes(screenCondominium._id)) {
              await api.patch(`/source-rss/${id}`, {
                screen_id: [...screenIds, screenCondominium._id],
              });
            }
          })
      );

      await Promise.all(
        previousNoticies
          .filter((id) => !screenCondominium.noticies.includes(id))
          .map(async (id) => {
            const response = await api.get(`/noticies/${id}`);
            await api.patch(`/noticies/${id}`, {
              screen_id: (response.data.screen_id || []).filter((screenId: string) => screenId !== screenCondominium._id),
            });
          })
      );

      await Promise.all(
        screenCondominium.noticies
          .filter((id) => !previousNoticies.includes(id))
          .map(async (id) => {
            const response = await api.get(`/noticies/${id}`);
            const screenIds = response.data.screen_id || [];
            if (!screenIds.includes(screenCondominium._id)) {
              await api.patch(`/noticies/${id}`, {
                screen_id: [...screenIds, screenCondominium._id],
              });
            }
          })
      );

      await Promise.all(
        condominiumMesseger
          .filter((message) => screenCondominium.condominium_message?.includes(message._id))
          .map((message) =>
            api.patch(`/condominium-message/${message._id}`, {
              screen_id: getMessageScreens(message),
            })
          )
      );

      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const handleSubmitNewMessage = async () => {
    if (!newMessageId) return;

    try {
      const nextMessageIds = Array.from(
        new Set([...(screenCondominium.condominium_message || []), newMessageId])
      );

      const updatedScreen = await api.patch(`/screens/${screenCondominium._id}`, {
        condominium_message: nextMessageIds,
      });

      const selectedMessage = condominiumMesseger.find((item) => item._id === newMessageId);
      const existingScreenConfig = getMessageScreenById(selectedMessage, screenCondominium._id);
      await api.patch(`/condominium-message/${newMessageId}`, {
        screen_id: upsertMessageScreen(getMessageScreens(selectedMessage), {
          screen_id: screenCondominium._id,
          starttime: newMessageStart ? new Date(newMessageStart) : existingScreenConfig?.starttime || selectedMessage?.starttime,
          endtime: newMessageEnd ? new Date(newMessageEnd) : existingScreenConfig?.endtime || selectedMessage?.endtime,
        }),
      });

      setScreenCondominium(updatedScreen.data);
      setCondominiumMesseger((old) =>
        old.map((item) =>
          item._id === newMessageId
            ? {
                ...item,
                screen_id: upsertMessageScreen(getMessageScreens(item), {
                  screen_id: screenCondominium._id,
                  starttime: newMessageStart ? new Date(newMessageStart) : existingScreenConfig?.starttime || item.starttime,
                  endtime: newMessageEnd ? new Date(newMessageEnd) : existingScreenConfig?.endtime || item.endtime,
                }),
              }
            : item
        )
      );
      setNewMessageId("");
      setNewMessageStart("");
      setNewMessageEnd("");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/screens/${screenCondominium._id}`);
      await api.delete(`/condominium/${condominium._id}/screen/${screenCondominium._id}`);
      await api.delete(`/condominium-message/screen/${screenCondominium._id}`);
      await api.delete(`/source-rss/screen/${screenCondominium._id}`);
      await api.delete(`/noticies/screen/${screenCondominium._id}`);

      setCondominium((old) =>
        old.map((item) =>
          item._id === condominium._id
            ? {
                ...item,
                screens: item.screens?.filter((screenId) => screenId !== screenCondominium._id),
              }
            : item
        )
      );

      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      await api.patch(`/screens/${screenCondominium._id}`, {
        condominium_message: (screenCondominium.condominium_message || []).filter((item) => item !== id),
      });

      const message = condominiumMesseger.find((item) => item._id === id);
      await api.patch(`/condominium-message/${id}`, {
        screen_id: removeMessageScreen(getMessageScreens(message), screenCondominium._id),
      });

      setScreenCondominium((old) => ({
        ...old,
        condominium_message: (old.condominium_message || []).filter((item) => item !== id),
      }));
      setStatus("success");
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

  const existingMessages = useMemo(
    () =>
      condominiumMesseger.filter((item) =>
        screenCondominium.condominium_message?.includes(item._id)
      ),
    [condominiumMesseger, screenCondominium.condominium_message]
  );

  const availableMessages = useMemo(
    () =>
      condominiumMesseger.filter(
        (item) => !screenCondominium.condominium_message?.includes(item._id)
      ),
    [condominiumMesseger, screenCondominium.condominium_message]
  );

  return (
    <form className="ds-stack" onSubmit={handleSubmit}>
      {status === "success" ? <InlineNotice tone="success">Alteracoes salvas com sucesso.</InlineNotice> : null}
      {status === "error" ? <InlineNotice tone="error">Nao foi possivel salvar as alteracoes.</InlineNotice> : null}

      <div className="ds-form-grid">
        <Field label="Nome" hint={`${screenCondominium.name.length}/30`} required>
          <TextInput
            value={screenCondominium.name}
            maxLength={30}
            onChange={(event) =>
              setScreenCondominium((old) => ({ ...old, name: event.target.value }))
            }
            required
          />
        </Field>

        <Field label="Validade">
          <TextInput value={screenCondominium.validity ? dayjs(screenCondominium.validity).format("YYYY-MM-DD") : ""} disabled />
        </Field>

        <Field label="Banner">
          <SelectInput
            value={screenCondominium.banner || ""}
            onChange={(event) =>
              setScreenCondominium((old) => ({ ...old, banner: event.target.value }))
            }
          >
            <option value="">Sem banner</option>
            {banner.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </SelectInput>
        </Field>

        <Field label="Estado atual" required>
          <SelectInput
            value={stateValue}
            onChange={(event) => {
              const next = event.target.value;
              setStateValue(next);
              setCityValue("");
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

        <Field label="Cidade atual" required>
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

      {rssOptions.length > 0 ? (
        <Field label="Fontes RSS">
          <MultiSelectChips
            options={rssOptions}
            values={screenCondominium.source_rss}
            onChange={(values) =>
              setScreenCondominium((old) => ({ ...old, source_rss: values }))
            }
          />
        </Field>
      ) : null}

      {noticiesOptions.length > 0 ? (
        <Field label="Noticias">
          <MultiSelectChips
            options={noticiesOptions}
            values={screenCondominium.noticies}
            onChange={(values) =>
              setScreenCondominium((old) => ({ ...old, noticies: values }))
            }
          />
        </Field>
      ) : null}

      <SurfaceCard className="ds-stack">
        <div>
          <h3 className="ds-section-title">Mensagens vinculadas</h3>
          <p className="ds-section-copy">Edite janelas de exibicao e remova mensagens sem sair do modal principal.</p>
        </div>
        {existingMessages.length === 0 ? <InlineNotice tone="info">Nenhuma mensagem vinculada a esta tela.</InlineNotice> : null}
        {existingMessages.map((message) => (
          <SurfaceCard key={message._id} className="ds-stack ds-subcard">
            <div className="ds-form-grid">
              <Field label="Mensagem">
                <SelectInput
                  value={message._id}
                  onChange={(event) => {
                    const nextId = event.target.value;
                    setScreenCondominium((old) => ({
                      ...old,
                      condominium_message: (old.condominium_message || []).map((item) =>
                        item === message._id ? nextId : item
                      ),
                    }));
                  }}
                >
                  {condominiumMesseger.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </SelectInput>
              </Field>

              <Field label="Data inicial">
                <TextInput
                  type="datetime-local"
                  value={
                    getMessageScreenById(message, screenCondominium._id)?.starttime
                      ? dayjs(getMessageScreenById(message, screenCondominium._id)?.starttime).format("YYYY-MM-DDTHH:mm")
                      : ""
                  }
                  onChange={(event) => {
                    const nextDate = new Date(event.target.value);
                    setCondominiumMesseger((old) =>
                      old.map((item) =>
                        item._id === message._id
                          ? {
                              ...item,
                              screen_id: upsertMessageScreen(getMessageScreens(item), {
                                screen_id: screenCondominium._id,
                                starttime: nextDate,
                                endtime: getMessageScreenById(item, screenCondominium._id)?.endtime,
                              }),
                            }
                          : item
                      )
                    );
                  }}
                />
              </Field>

              <Field label="Data final">
                <TextInput
                  type="datetime-local"
                  value={
                    getMessageScreenById(message, screenCondominium._id)?.endtime
                      ? dayjs(getMessageScreenById(message, screenCondominium._id)?.endtime).format("YYYY-MM-DDTHH:mm")
                      : ""
                  }
                  onChange={(event) => {
                    const nextDate = new Date(event.target.value);
                    setCondominiumMesseger((old) =>
                      old.map((item) =>
                        item._id === message._id
                          ? {
                              ...item,
                              screen_id: upsertMessageScreen(getMessageScreens(item), {
                                screen_id: screenCondominium._id,
                                starttime: getMessageScreenById(item, screenCondominium._id)?.starttime,
                                endtime: nextDate,
                              }),
                            }
                          : item
                      )
                    );
                  }}
                />
              </Field>
            </div>
            <div className="ds-split">
              <ActionButton type="button" variant="danger" onClick={() => handleDeleteMessage(message._id)}>
                Remover mensagem
              </ActionButton>
            </div>
          </SurfaceCard>
        ))}
      </SurfaceCard>

      {availableMessages.length > 0 ? (
        <SurfaceCard className="ds-stack">
          <div>
            <h3 className="ds-section-title">Adicionar mensagem</h3>
            <p className="ds-section-copy">Inclua uma mensagem existente e configure a janela de exibicao.</p>
          </div>
          <div className="ds-form-grid">
            <Field label="Mensagem">
              <SelectInput value={newMessageId} onChange={(event) => setNewMessageId(event.target.value)}>
                <option value="">Selecione uma mensagem</option>
                {availableMessages.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </SelectInput>
            </Field>

            <Field label="Data inicial">
              <TextInput type="datetime-local" value={newMessageStart} onChange={(event) => setNewMessageStart(event.target.value)} />
            </Field>

            <Field label="Data final">
              <TextInput type="datetime-local" value={newMessageEnd} onChange={(event) => setNewMessageEnd(event.target.value)} />
            </Field>
          </div>
          <div className="ds-split">
            <ActionButton type="button" variant="secondary" disabled={!newMessageId} onClick={handleSubmitNewMessage}>
              Adicionar mensagem
            </ActionButton>
          </div>
        </SurfaceCard>
      ) : null}

      <SurfaceCard className="ds-form-actions">
        <div className="ds-split">
          {user?.permission === Permission.ADMIN ? (
            <ActionButton type="button" variant="danger" onClick={handleDelete}>
              Excluir tela
            </ActionButton>
          ) : null}
          <ActionButton type="submit">Salvar alteracoes</ActionButton>
        </div>
      </SurfaceCard>
    </form>
  );
};

export default EditScreens;
