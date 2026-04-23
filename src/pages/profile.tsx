import { GetServerSideProps } from "next";
import { useState } from "react";
import { PatternFormat } from "react-number-format";
import { ActionButton, Field, InlineNotice, PageHero, SurfaceCard, TextInput } from "../components/design-system";
import { withAdminAndSindicoPermission } from "../hocs";
import AppBarLayoutPage from "../layout/AppBar";
import { api, getAPIClient } from "../service";
import { UserType } from "../types/users.type";

type ProfileProps = {
  initialUser: UserType;
};

const Profile: React.FC<ProfileProps> = ({ initialUser }) => {
  const [user, setUser] = useState(initialUser);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [emailError, setEmailError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      if (password) {
        await api.patch<UserType>(`/users/${user._id}`, { ...user, password });
      } else {
        await api.patch<UserType>(`/users/${user._id}`, {
          name: user.name,
          username: user.username,
          email: user.email,
          phone: user.phone,
        });
      }
      setStatus({ tone: "success", message: "Perfil atualizado com sucesso." });
      setEmailError("");
      setPassword("");
    } catch (err: any) {
      if (err.response?.data?.message?.match(/email_1 dup key/)) {
        setEmailError("Email ja cadastrado");
      }
      setStatus({ tone: "error", message: "Nao foi possivel salvar as informacoes." });
    }
  };

  return (
    <AppBarLayoutPage>
      <div className="ds-stack">
        <PageHero
          title="Meu perfil"
          description="Atualize seus dados de acesso e mantenha o cadastro alinhado com a operacao do painel."
        />

        <SurfaceCard style={{ padding: 28 }}>
          <form className="ds-stack" onSubmit={handleSubmit}>
            {status ? <InlineNotice tone={status.tone}>{status.message}</InlineNotice> : null}
            <div className="ds-form-grid">
              <Field label="Nome" required>
                <TextInput value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} />
              </Field>
              <Field label="Nome de login" required>
                <TextInput value={user.username} onChange={(e) => setUser({ ...user, username: e.target.value })} />
              </Field>
              <Field label="Email" required error={emailError}>
                <TextInput value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} />
              </Field>
              <Field label="Telefone">
                <PatternFormat
                  customInput={TextInput as any}
                  format="(##) #####-####"
                  value={user.phone}
                  onValueChange={(values) => setUser({ ...user, phone: values.formattedValue })}
                />
              </Field>
              <div className="ds-form-grid--full">
                <InlineNotice tone="info">Preencha a senha apenas se quiser altera-la.</InlineNotice>
              </div>
              <Field label="Nova senha" hint="Deixe em branco para manter a senha atual.">
                <TextInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </Field>
            </div>
            <div className="ds-split">
              <ActionButton type="submit">Salvar informacoes</ActionButton>
            </div>
          </form>
        </SurfaceCard>
      </div>
    </AppBarLayoutPage>
  );
};

export default withAdminAndSindicoPermission(Profile);

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const api = getAPIClient(ctx);
  try {
    const { data } = await api.get<UserType>("/users/profile");
    return { props: { initialUser: data } };
  } catch {
    return { props: { initialUser: [] } };
  }
};
