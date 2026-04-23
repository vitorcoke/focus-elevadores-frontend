# Documentacao da Aplicacao Focus Elevadores Frontend

## 1. Visao geral

Esta aplicacao e um painel administrativo em `Next.js 12` com `React 18` e `Material UI`.
O sistema utiliza autenticacao por token, controle de permissao por perfil e tabelas com `DataGridPro` para operacoes de consulta, cadastro, edicao e exclusao.

O nome exibido para o produto na interface e `Minha Portaria`.

## 2. Arquitetura funcional

### Stack principal

- Frontend: `Next.js`, `React`, `TypeScript`
- UI: `Material UI`, `MUI X DataGrid Pro`
- HTTP: `axios`
- Formularios: `react-hook-form` e campos controlados
- Graficos: `react-google-charts`

### Integracao com backend

A aplicacao consome a API definida por `NEXT_PUBLIC_URL_SERVER` e, na ausencia da variavel, usa:

`https://focus-elevadores-backend.onrender.com/api`

### Autenticacao

- Login via `POST /auth/login`
- Persistencia com cookies:
  - `focus-elevador-token`
  - `focus-elevador-refreshToken`
- Renovacao automatica de token em respostas `401`
- Leitura do usuario autenticado via `/users/bytoken`

### Perfis de acesso

Os perfis implementados sao:

- `ZELADOR = 0`
- `SINDICO = 1`
- `ADMIN = 2`

Regras observadas no frontend:

- `ADMIN`: acesso total, incluindo Noticias, Banner, VMS e gestao completa
- `SINDICO`: acesso a dashboard, condominios, mensagens, usuarios e perfil
- `ZELADOR`: acesso restrito a dashboard, condominios e mensagens

## 3. Layout e navegacao

### Estrutura base

A interface autenticada usa:

- `AppBar` superior com logotipo e botao de logout
- `Drawer` lateral com navegacao
- area principal com titulo da pagina e barra de acoes

### Itens do menu

Itens ativos no menu lateral:

- Dashboard
- Cadastros
  - Condominio
  - Noticias
  - Banner
  - Mensagem
  - Usuario
- Configuracoes
  - VMS
- Meu perfil

Observacao:

- A rota de `RSS` existe no projeto, com tela e componentes prontos, mas esta comentada no menu e tambem esta com os botoes da barra principal desativados.

## 4. Telas da aplicacao

### 4.1 Login

**Rota:** `/`

**Objetivo:** autenticar o usuario e redirecionar para o dashboard.

**Campos:**

- Usuario
- Senha

**Acoes:**

- Enviar credenciais
- Exibir alerta de erro quando usuario ou senha forem invalidos
- Redirecionar para `/dashboard` quando autenticado
- Se ja existir token valido, redirecionar automaticamente para o dashboard

### 4.2 Dashboard

**Rota:** `/dashboard`

**Objetivo:** exibir um grafico com a quantidade de telas cadastradas por condominio.

**Funcionalidades:**

- Consulta todos os condominios
- Monta um grafico de barras
- Usa o nome do condominio no eixo vertical
- Usa a quantidade de telas vinculadas no eixo horizontal

**Dados apresentados:**

- Nome do condominio
- Total de telas por condominio

### 4.3 Meu Perfil

**Rota:** `/profile`

**Objetivo:** permitir que o proprio usuario altere seus dados.

**Campos:**

- Nome
- Nome de login
- Email
- Telefone
- Senha

**Funcionalidades:**

- Atualizar dados cadastrais
- Alterar senha opcionalmente
- Validar email duplicado
- Exibir feedback de sucesso ou erro

## 5. Modulo Cadastros

### 5.1 Condominio

**Rota:** `/registration/condominium`

**Objetivo:** gerenciar os condominios cadastrados e suas telas.

**Grid principal:**

- ID
- Nome
- Bairro
- Cidade
- Quantidade de telas

**Acoes na barra da pagina:**

- `Novo`
- `Alterar`
- `Excluir`
- `Telas`

**Regras:**

- `Novo`, `Alterar` e `Excluir` sao visiveis para `ADMIN`
- `Telas` fica disponivel ao selecionar um condominio
- Edicao e configuracao de telas trabalham com um condominio por vez

#### Cadastro de condominio

**Campos:**

- ID do condominio no iModulo
- Nome
- CNPJ
- CEP
- Endereco
- Bairro
- Numero/Complemento
- Cidade
- Estado

**Funcionalidades:**

- Busca de endereco por CEP via `ViaCEP`
- Validacao de duplicidade para:
  - CNPJ
  - ID iModulo
- Inclusao do novo condominio na listagem

#### Edicao de condominio

Permite alterar os mesmos campos do cadastro, com validacoes equivalentes.

#### Exclusao de condominio

Ao excluir um condominio, o frontend dispara remocoes relacionadas:

- cadastro do condominio
- telas do condominio
- usuarios vinculados ao condominio

### 5.2 Gestao de Telas do Condominio

**Acesso:** botao `Telas` dentro de Condominio

**Objetivo:** administrar as telas vinculadas a um condominio especifico.

A tela de gerenciamento de telas e aberta em dialog full screen com abas:

- Lista de telas
- Cadastro de telas
- Editar telas

#### Lista de telas

**Dados exibidos:**

- ID
- Nome da tela
- Validade
- Quantidade de RSS ativos
- Quantidade de noticias ativas

#### Cadastro de tela

**Campos e configuracoes:**

- Nome
- Validade
- Banner
- Cameras VMS
- Uma ou mais mensagens
- Estado
- Cidade
- Noticias vinculadas

**Funcionalidades detalhadas:**

- Busca estados e cidades via API do IBGE
- Consulta VMS do condominio
- Monta URLs de streaming das cameras cadastradas
- Permite selecionar um banner
- Permite associar uma ou mais mensagens
- Permite associar noticias
- Atualiza os relacionamentos de mensagem e noticia apos criar a tela

#### Edicao de tela

**Campos editaveis:**

- Nome
- Banner
- Estado
- Cidade
- Noticias associadas
- Mensagens vinculadas

**Funcionalidades detalhadas:**

- Carrega a tela selecionada pelo grid
- Permite visualizar mensagens ja vinculadas
- Permite ajustar validade das mensagens por tela:
  - data inicial
  - data final
- Permite adicionar novas mensagens a tela
- Permite remover mensagens da tela
- Permite incluir ou remover noticias vinculadas
- Permite excluir a propria tela

**Exclusao de tela:**

Ao excluir uma tela, o frontend aciona remocoes nos vinculos com:

- condominio
- mensagens
- RSS
- noticias

### 5.3 Mensagens

**Rota:** `/registration/condominium-messeger`

**Objetivo:** gerenciar mensagens exibidas nas telas.

**Grid principal:**

- Nome
- Quantidade de telas
- Criado por

**Acoes:**

- Novo
- Alterar
- Excluir

#### Tipos de mensagem

O sistema suporta dois formatos:

- Mensagem de texto
- Mensagem JPG

#### Cadastro de mensagem

**Campos para mensagem de texto:**

- Nome
- Titulo
- Mensagem
- Tempo de exibicao em segundos
- Data inicial
- Data final
- Telas selecionadas

**Campos para mensagem JPG:**

- Nome
- Upload de imagem JPG
- Tempo de exibicao em segundos
- Data inicial
- Data final
- Telas selecionadas

**Funcionalidades detalhadas:**

- Upload de imagem para o backend
- Redimensionamento da imagem antes do envio
- Associacao imediata da mensagem a uma ou mais telas
- Tempo padrao de exibicao de `15 segundos` quando nao informado

#### Edicao de mensagem

**Funcionalidades:**

- Alterar conteudo textual ou imagem
- Alterar periodo de exibicao
- Alterar tempo de exibicao
- Consultar telas ja vinculadas
- Remover telas vinculadas
- Adicionar novas telas disponiveis

### 5.4 Usuarios

**Rota:** `/registration/user`

**Objetivo:** administrar usuarios e perfis de acesso.

**Grid principal:**

- Nome
- Nome de login
- Email

**Acoes:**

- Novo
- Alterar
- Excluir

#### Cadastro de usuario

**Campos:**

- Nome
- Nome de login
- Email
- Telefone
- Senha
- Condominios
- Permissao
- Telas

**Regras importantes:**

- O campo `Telas` aparece quando a permissao escolhida e `Zelador`
- Um `Sindico` nao pode criar usuario com permissao `Administrador`
- O sistema valida email duplicado

#### Edicao de usuario

Permite alterar:

- Nome
- Nome de login
- Email
- Telefone
- Senha
- Condominios vinculados
- Permissao
- Telas vinculadas para zelador

#### Exclusao de usuario

- Remove o usuario selecionado da base e da listagem local

### 5.5 Noticias

**Rota:** `/registration/noticies`

**Objetivo:** configurar fontes de noticias filtradas para exibicao nas telas.

**Grid principal:**

- Nome
- Quantidade de telas

**Acoes:**

- Novo
- Alterar
- Excluir

#### Cadastro de noticia

**Campos:**

- Nome
- Procura
- Categoria
- Pais
- Estado
- Cidade
- Idioma
- Telas selecionadas

**Categorias disponiveis:**

- Negocios
- Crime
- Nacional
- Educacao
- Entretenimento
- Meio ambiente
- Alimentacao
- Saude
- Estilo de vida
- Politica
- Ciencia
- Esportes
- Tecnologia
- Principais
- Turismo
- Mundo
- Outros

**Funcionalidades:**

- Associacao inicial com multiplas telas
- Atualizacao reciproca da tela ao vincular noticia

#### Edicao de noticia

Permite:

- alterar todos os filtros da noticia
- consultar telas ja vinculadas
- remover telas vinculadas
- adicionar novas telas disponiveis

### 5.6 Banner

**Rota:** `/registration/banner`

**Objetivo:** gerenciar banners visuais exibidos nas telas.

**Grid principal:**

- ID
- Nome
- Miniatura da imagem

**Acoes:**

- Novo
- Alterar
- Excluir

#### Cadastro de banner

**Campos:**

- Nome
- Imagem do banner
- Descricao
- Cor de fundo
- Cor da fonte

**Validacoes e regras:**

- A imagem precisa ser do tipo imagem
- No cadastro, a imagem deve ter no maximo `426x240`
- Nome limitado a `30` caracteres
- Descricao limitada a `250` caracteres

#### Edicao de banner

Permite alterar:

- Nome
- Imagem
- Descricao
- Cor de fundo
- Cor da fonte

#### Exclusao de banner

Ao excluir, o frontend remove:

- o banner
- os vinculos do banner com as telas

### 5.7 RSS

**Rota:** `/registration/rss`

**Status no produto:** implementada no codigo, mas desativada no menu e na barra principal.

**Objetivo:** gerenciar fontes RSS vinculadas a telas.

**Grid previsto:**

- Logotipo
- Nome
- URL
- Quantidade de telas

**Acoes previstas:**

- Novo
- Alterar
- Excluir

## 6. Modulo Configuracoes

### 6.1 VMS

**Rota:** `/settings/vms`

**Acesso:** apenas `ADMIN`

**Objetivo:** configurar servidores de video para consulta de cameras por condominio.

**Grid principal:**

- Nome
- IP/Servidor
- Porta

**Acoes:**

- Novo
- Alterar
- Excluir

#### Cadastro de VMS

**Campos:**

- Nome
- Servidor
- Porta
- Receptor
- Conta
- Usuario
- Senha
- Condominio

#### Edicao de VMS

Permite alterar os mesmos campos do cadastro.

#### Papel do VMS no sistema

Os registros de VMS sao usados na configuracao de telas para:

- listar cameras disponiveis de um condominio
- montar URLs de streaming MJPEG
- permitir vinculo de cameras a uma tela

## 7. Comportamentos transversais

### Tabelas

As paginas de listagem utilizam `DataGridPro` com recursos como:

- selecao por checkbox
- toolbar padrao
- navegacao por clique na linha/celula

### Feedback visual

Em varios fluxos a interface exibe:

- `Snackbar` de sucesso
- `Snackbar` de erro
- `Alert` para validacoes e mensagens informativas

### Responsividade

O layout usa `useMediaQuery` para adaptar:

- largura de formularios
- comportamento do menu lateral
- distribuicao de blocos em dialogs

### Tema

- Tema claro customizado
- Tema escuro simples
- provedor de tema ja preparado no app

## 8. Integracoes externas identificadas

- `ViaCEP`: preenchimento de endereco no cadastro de condominio
- `IBGE`: lista de estados e cidades nas telas
- `Google Charts`: grafico do dashboard
- Servidores VMS: consulta de nomes de cameras e montagem do stream

## 9. Observacoes importantes do estado atual

- O material foi produzido com base no frontend implementado atualmente
- Existem trechos comentados relacionados a RSS
- Algumas relacoes de negocio sao mantidas manualmente pelo frontend com chamadas extras para sincronizar vinculos
- O menu e as permissoes efetivamente escondem funcionalidades conforme o perfil do usuario

## 10. Resumo executivo

A aplicacao funciona como um painel administrativo para operacao de conteudo e infraestrutura de exibicao em condominios. O fluxo central e:

- autenticar usuario
- cadastrar condominios
- cadastrar telas por condominio
- vincular banners, noticias, mensagens e cameras
- cadastrar usuarios conforme perfil
- administrar configuracoes VMS

O sistema esta estruturado para que o `ADMIN` tenha controle completo, enquanto `SINDICO` e `ZELADOR` operam somente o necessario dentro de suas permissoes.
