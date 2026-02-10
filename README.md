# SPS React Test — CRUD de usuários com autenticação

Projeto em **Create React App** com página de login (signIn), armazenamento de token JWT e CRUD de usuários **apenas para usuários autenticados**. Interface minimalista com Bootstrap 5.

---

## Como rodar o projeto

### Pré-requisitos

- Node.js (recomendado LTS)
- Back-end da API rodando (ex.: [test-sps-server](https://github.com/your-org/test-sps-server))

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar o endereço do back-end

O front-end chama a API usando a variável de ambiente `REACT_APP_SERVER_URL`.

**Opção A — Usar proxy**  
No `package.json` já existe:

```json
"proxy": "http://localhost:3001"
```

**Opção B — Apontar direto para o back-end**  

```env
REACT_APP_SERVER_URL=http://localhost:3001
```

Troque `http://localhost:3001` pela URL em que a API está rodando (porta ou host diferentes).

Para referência, existe um `.env.example` na raiz.

### 3. Subir o front-end

```bash
npm start
```

A aplicação abre em [http://localhost:3001](http://localhost:3001).

---

## Como o código funciona

### Visão geral

- **Login:** tela de signIn envia e-mail e senha para a API; o token JWT retornado é guardado no `localStorage`.
- **Rotas protegidas:** listar, cadastrar, editar e excluir usuários só é possível para quem está logado; caso contrário, o usuário é redirecionado para `/login`.
- **CRUD de usuários:** lista em tabela, botão “Novo usuário” (modal), links “Editar” e “Excluir” por linha, e página de edição com formulário.
- **Permissões por tipo:** usuário do tipo **admin** pode cadastrar, editar e excluir qualquer usuário; usuário do tipo **user** pode apenas **ver a lista** e **editar o próprio perfil** (não pode cadastrar outros nem editar/excluir outros).

### Estrutura de pastas (principal)

```
src/
├── config/
│   └── api.js              # URL base da API (REACT_APP_SERVER_URL)
├── context/
│   └── AuthContext.js      # Estado global: token, user, isAuthenticated, isAdmin, login, logout
├── services/
│   ├── api.js              # Cliente axios com header Authorization (Bearer token)
│   ├── AuthService.js      # login(), getStoredUser/setStoredUser, token e user em localStorage
│   └── UserService.js      # list(), get(id), create(), update(), delete()
├── components/
│   ├── Layout.js           # Navbar + conteúdo; links e botão “Sair” conforme autenticação
│   ├── ProtectedRoute.js   # Redireciona para /login se não houver token
│   └── UserFormModal.js    # Modal de formulário para criar usuário (email, nome, type, password)
├── pages/
│   ├── Home.js             # Página inicial; mensagem e link para login ou usuários
│   ├── SignIn.js           # Formulário de login; chama AuthService e redireciona
│   ├── Users.js            # Lista de usuários, “Novo usuário”, editar/excluir
│   └── UserEdit.js         # Formulário de edição (email, nome, type, senha opcional)
├── routes.js               # Definição de rotas; rotas /users e /users/:id protegidas
└── index.js                # AuthProvider + RouterProvider; importa CSS do Bootstrap
```

### Fluxo de autenticação

1. **Login**  
   - Em `SignIn.js`, o usuário informa e-mail e senha.  
   - `AuthService.login()` faz `POST api/auth/login` com `{ email, password }`.  
   - A API deve retornar `{ token, user }`, onde `user` contém pelo menos `{ id, type, email, nome }` (necessário para regras de permissão). O token e o `user` são salvos no `localStorage` e no estado do `AuthContext`.  
   - O usuário é redirecionado para a página que tentou acessar (ou para `/`).

2. **Uso do token**  
   - O cliente HTTP em `services/api.js` é uma instância do axios que:  
     - Lê o token em `localStorage` e envia no header `Authorization: Bearer <token>` em toda requisição.  
     - Intercepta resposta 401 (não tratado automaticamente; a aplicação pode reagir no componente, ex.: redirecionar para login).

3. **Logout**  
   - No `Layout`, o botão “Sair” chama `logout()` do `AuthContext`, que remove o token e o objeto `user` do `localStorage` e do estado, e redireciona para `/login`.

### Permissões (admin x user)

- **Admin** (`user.type === "admin"`): pode ver a lista, cadastrar novos usuários, editar e excluir qualquer usuário.
- **User** (`user.type === "user"`): pode **apenas** ver a lista de usuários e **editar o próprio perfil** (página `/users/:id` quando `id` é o dele). Não vê o botão “Novo usuário”, não vê “Editar”/“Excluir” para outros usuários na tabela; ao tentar acessar a URL de edição de outro usuário, é redirecionado para `/users`. O campo “Tipo” fica desabilitado ao editar a si mesmo.

### Rotas e proteção

- **Públicas:** `/` (Home), `/login` (SignIn).  
- **Protegidas:** `/users` (lista + criar), `api/users/:userId` (editar).  
- `ProtectedRoute` verifica `isAuthenticated` do `AuthContext`; se falso, redireciona para `/login` e guarda a URL em `location.state.from` para redirecionar de volta após o login.

### Contrato esperado da API

O front-end foi feito assumindo o seguinte comportamento do back-end:

| Método | Rota | Corpo (ex.) | Observação |
|--------|------|-------------|------------|
| POST   | `api/auth/login` | `{ "email": "...", "password": "..." }` | Retorna `{ "token": "..." }`. |
| GET    | `api/users`      | — | Lista de usuários (array ou `{ users: [] }`). Header `Authorization: Bearer <token>` obrigatório. |
| GET    | `api/users/:id`  | — | Um usuário (ex.: `{ id, email, nome, type }`). |
| POST   | `api/users`      | `{ "email", "nome", "type", "password" }` | Cadastro; e-mail único. |
| PUT    | `api/users/:id`  | `{ "email?", "nome?", "type?", "password?" }` | Atualização; senha opcional. |
| DELETE | `api/users/:id`  | — | Remove o usuário. |

- **Campos de usuário:** `email`, `nome`, `type` (ex.: `"admin"` ou `"user"`), e `password` no cadastro (e opcional na edição).  
- O back-end deve bloquear e-mails repetidos no cadastro e exigir autenticação em todas as rotas de usuários.

### Qualidade e usabilidade

- **Código:** serviços separados (Auth, User, api cliente), contexto de autenticação único, componentes reutilizáveis (Layout, ProtectedRoute, UserFormModal).  
- **UX:** feedback de carregamento e erros (alertas), confirmação antes de excluir, botões desabilitados durante submit, redirecionamento após login para a página desejada.  
- **Interface:** Bootstrap 5 (cards, tabelas, formulários, modal), layout responsivo e navegação clara (navbar com Início, Usuários, Entrar/Sair).

---

## Scripts disponíveis

| Comando     | Descrição                          |
|------------|-------------------------------------|
| `npm start` | Sobe o app em modo desenvolvimento  |
| `npm run dev` | Alias de `npm start`              |
| `npm test`  | Roda os testes                     |

- Não existem testes criados ainda
---

## Resumo

- **Create React App** com React Router e Bootstrap.  
- **Login** via API; token JWT armazenado no `localStorage`.  
- **Apenas usuários logados** podem ver a lista, cadastrar, editar e excluir usuários.  
- **package.json** inclui `proxy` para desenvolvimento; o endereço do back-end pode ser ajustado por `REACT_APP_SERVER_URL` no `.env`.  
- Código organizado em contexto de auth, serviços, componentes e páginas, com contrato da API documentado neste README.
