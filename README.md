# Comemora App - README

## Visão Geral

Comemora é um aplicativo web construído com Vue.js para gerenciar e organizar eventos. Ele inclui funcionalidades para autenticação de usuário, criação de eventos, gerenciamento e interação social em torno dos eventos.

## Tecnologias Utilizadas

* **Vue.js:** Um framework JavaScript progressivo para construir interfaces de usuário. (v3.2.13)
* **Vuex:** Um padrão e biblioteca de gerenciamento de estado para aplicações Vue.js. (v4.1.0)
* **Vue Router:** O roteador oficial para Vue.js. (v4.5.0)
* **Axios:** Cliente HTTP baseado em Promise para o navegador e node.js. (v1.8.4)
* **Vue Datepicker:** Um componente datepicker para Vue.js (@vuepic/vue-datepicker: ^11.0.2)
* **Leaflet:** Uma biblioteca JavaScript para mapas interativos (v1.9.4)
* **qrcode.vue:** Um componente Vue.js para gerar códigos QR (qrcode.vue: ^3.6.0)
* **vue3-social-sharing:** Componente Vue 3 para compartilhamento social (vue3-social-sharing: ^1.4.1)
* **Service Worker:** Para capacidades offline (register-service-worker: ^1.7.2)

## Estrutura do Projeto

O código fonte do projeto está organizado da seguinte forma:


Markdown

# Comemora App - README

## Visão Geral

Comemora é um aplicativo web construído com Vue.js para gerenciar e organizar eventos. Ele inclui funcionalidades para autenticação de usuário, criação de eventos, gerenciamento e interação social em torno dos eventos.

## Tecnologias Utilizadas

* **Vue.js:** Um framework JavaScript progressivo para construir interfaces de usuário. (v3.2.13)
* **Vuex:** Um padrão e biblioteca de gerenciamento de estado para aplicações Vue.js. (v4.1.0)
* **Vue Router:** O roteador oficial para Vue.js. (v4.5.0)
* **Axios:** Cliente HTTP baseado em Promise para o navegador e node.js. (v1.8.4)
* **Vue Datepicker:** Um componente datepicker para Vue.js (@vuepic/vue-datepicker: ^11.0.2)
* **Leaflet:** Uma biblioteca JavaScript para mapas interativos (v1.9.4)
* **qrcode.vue:** Um componente Vue.js para gerar códigos QR (qrcode.vue: ^3.6.0)
* **vue3-social-sharing:** Componente Vue 3 para compartilhamento social (vue3-social-sharing: ^1.4.1)
* **Service Worker:** Para capacidades offline (register-service-worker: ^1.7.2)

## Estrutura do Projeto

O código fonte do projeto está organizado da seguinte forma:

Claro! Aqui está a estrutura formatada de forma apropriada para ser incluída em um `README.md` no GitHub, usando markdown com comentários e destaque para facilitar a leitura:

src/
├── assets/
│   └── stylesheets/
│       ├── application.css      # CSS principal, importa auth.css
│       └── auth.css             # CSS para componentes de autenticação
├── components/
│   └── authentication/          # Componentes relacionados à autenticação
│       ├── LoginForm.vue
│       ├── PasswordForgot.vue
│       ├── PasswordReset.vue
│       └── RegisterForm.vue
├── router/
│   └── index.js                 # Configuração do Vue Router
├── services/
│   └── axiosConfig.js           # Configuração do Axios com URL base e interceptadores
├── store/
│   ├── index.js                 # Inicialização do Vuex store
│   └── modules/                 # Módulos do Vuex
│       ├── auth.js              # Estado e lógica de autenticação
│       ├── events.js            # Estado e lógica de gerenciamento de eventos
│       └── notifications.js     # Gerenciamento de notificações
├── views/
│   ├── authentication/          # Views de autenticação
│       ├── Auth.vue
│       ├── ConfirmAccount.vue
│       └── Password.vue
│   ├── events/                  # Views de eventos
│       ├── EventEdit.vue
│       ├── EventJoin.vue
│       ├── EventNew\.vue
│       └── EventShow\.vue
│   └── Home.vue                 # Home view
├── App.vue                      # Componente principal da aplicação
├── main.js                      # Ponto de entrada da aplicação
└── registerServiceWorker.js     # Registro do service worker

## Principais Componentes e Funcionalidades

* **Autenticação:**
    * `src/components/authentication`:  Gerencia o login do usuário, registro, redefinição de senha e funcionalidade de esqueci minha senha. O módulo Vuex (`src/store/modules/auth.js`) gerencia o estado de autenticação, incluindo dados do usuário e tokens. As rotas estão definidas em `src/router/index.js` sob `/auth` e `/password`.
    * O processo de autenticação utiliza `src/services/axiosConfig.js` para se comunicar com a API do backend, definindo os cabeçalhos de autorização e tratando as respostas.
* **Gerenciamento de Eventos:**
    * `src/store/modules/events.js`:  Módulo Vuex responsável por gerenciar os dados de eventos, incluindo eventos organizados e eventos em que o usuário participa, e mídia dos eventos.
    * `src/views/events`:  Contém as views para criar, editar, exibir e participar de eventos.
    * O aplicativo suporta operações CRUD para eventos, bem como funcionalidades para entrar/sair de eventos e gerenciar mídias relacionadas a eventos.
* **Notificações:**
    * `src/store/modules/notifications.js`:  Módulo Vuex para gerenciar notificações do usuário, permitindo adicionar e remover notificações com timeouts.
* **Roteamento:**
    * `src/router/index.js`:  Define as rotas da aplicação, incluindo rotas de autenticação, página inicial e rotas relacionadas a eventos. Guards de rota são implementados para proteger rotas que exigem autenticação.
* **Comunicação com a API:**
    * `src/services/axiosConfig.js`:  Configura o Axios com a URL base da API, interceptadores de requisição (para adicionar cabeçalhos de autorização) e interceptadores de resposta (para tratar erros e expiração de token).
* **Gerenciamento de Estado:**
    * `src/store/index.js`:  Inicializa o Vuex store e combina os módulos `auth`, `events` e `notifications`.
* **Service Worker:**
    * `src/registerServiceWorker.js`:  Registra um service worker para habilitar capacidades offline.
* **Estilização:**
    * `src/assets/stylesheets`:  Contém arquivos CSS para a aplicação, incluindo estilos gerais (`application.css`) e estilos específicos para autenticação (`auth.css`).

## Configuração

* `package.json`:  Define as dependências e scripts do projeto. Para instalar as dependências, execute `npm install` ou `yarn install`. Os scripts incluem `serve` para executar o servidor de desenvolvimento, `build` para construir a aplicação para produção e `test:unit` para executar testes unitários.
* `jsconfig.json`:  Configura as definições de linguagem JavaScript para o editor, incluindo aliases de caminho (`@/*` para `src/*`).

## Instalação

1.  **Clone o repositório.**
2.  **Instale as dependências:** `npm install` ou `yarn install`
3.  **Configure a URL da API:** Defina a variável de ambiente `VUE_APP_API_URL` no seu arquivo `.env` ou diretamente em `src/services/axiosConfig.js`. A URL padrão é `http://localhost:3000`.
4.  **Execute o servidor de desenvolvimento:** `npm run serve` ou `yarn serve`
5.  **Construa para produção:** `npm run build` ou `yarn build`

## Notas

* O aplicativo utiliza o localStorage para armazenar o token e os dados do usuário.
* Interceptors do Axios são utilizados para tratar cabeçalhos de autenticação e erros de API globalmente.
* Módulos Vuex são utilizados para gerenciar o estado da aplicação de forma estruturada.
* O projeto inclui estilos básicos para os formulários de autenticação e o layout geral da aplicação.
* Service workers são implementados para melhorar o desempenho e o suporte offline.
