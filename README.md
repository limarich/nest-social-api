# Social API

API REST para uma rede social simples com suporte a postagens, comentários e sistema de seguidores.

---

## Requisitos funcionais

### Usuários

- Um usuário pode criar uma conta fornecendo nome, email e senha
- Um usuário pode autenticar com email e senha
- Um usuário pode ter perfil com permissão de administrador ou usuário comum
- Administradores têm acesso a recursos restritos de gerenciamento

### Seguidores

- Um usuário pode seguir outro usuário
- Um usuário pode deixar de seguir outro usuário
- Um usuário pode consultar sua lista de seguidores
- Um usuário pode consultar a lista de usuários que está seguindo

### Postagens

- Um usuário autenticado pode criar uma postagem
- Um usuário autenticado pode editar suas próprias postagens
- Um usuário autenticado pode excluir suas próprias postagens (soft delete)
- Apenas administradores podem remover postagens permanentemente (hard delete)
- Qualquer usuário autenticado pode listar e visualizar postagens

### Comentários

- Um usuário autenticado pode comentar em uma postagem
- Um usuário autenticado pode responder a um comentário existente
- Um usuário autenticado pode editar seus próprios comentários
- Um usuário autenticado pode excluir seus próprios comentários (soft delete)
- Apenas administradores podem remover comentários permanentemente (hard delete)
- Comentários são exibidos de forma hierárquica (comentário pai e respostas)

---

## Requisitos não funcionais

### Segurança

- Senhas devem ser armazenadas com hash (bcrypt)
- Autenticação via JWT com tempo de expiração configurável
- Rotas protegidas devem rejeitar requisições sem token válido com HTTP 401
- Usuários só podem editar ou excluir seus próprios recursos, exceto administradores
- Exclusões de usuários comuns são soft delete; o registro é mantido com `deleted_at` preenchido e omitido das listagens
- Apenas administradores podem executar hard delete, removendo o registro permanentemente do banco

### Validação

- Requisições com dados inválidos devem retornar HTTP 400 com descrição dos erros
- Email deve ser único no sistema; tentativas de duplicata retornam HTTP 409
- Campos obrigatórios devem ser validados antes de atingir a camada de serviço

### Desempenho

- A coluna `email` da tabela `users` deve ter índice único
- As colunas `follower_id` e `following_id` da tabela `follows` devem ser indexadas
- A coluna `post_id` da tabela `comments` deve ser indexada para listagem eficiente

### Manutenibilidade

- A aplicação segue a separação em camadas: controller, service e repository
- Regras de negócio residem exclusivamente na camada de serviço
- Validações de formato e entrada residem na camada de controller via DTOs

### Rastreabilidade

- Todos os recursos armazenam `created_at` com timezone UTC
- Recursos editáveis armazenam `updated_at` atualizado automaticamente
- Recursos com soft delete armazenam `deleted_at`, nulo enquanto o registro estiver ativo

---

## Modelo de dados

| Entidade | Descrição |
|---|---|
| `User` | Representa um usuário da plataforma |
| `Follow` | Representa a relação de seguimento entre dois usuários |
| `Post` | Representa uma postagem criada por um usuário |
| `Comment` | Representa um comentário em uma postagem ou resposta a outro comentário |

---

## Stack

- **Runtime:** Node.js
- **Framework:** NestJS
- **Linguagem:** TypeScript
- **ORM:** TypeORM
- **Banco de dados:** PostgreSQL
- **Autenticação:** JWT

---

## Configuração e execução

### Pré-requisitos

- Node.js >= 18
- PostgreSQL >= 14
- npm ou yarn

### Instalação

```bash
npm install
```

### Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:

```env
# Banco de dados
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=social_api

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=1d

# Aplicação
APP_PORT=3000
```

### Executando

```bash
# desenvolvimento
npm run start:dev

# produção
npm run build
npm run start:prod
```

### Testes

```bash
# unitários
npm run test

# cobertura
npm run test:cov

# e2e
npm run test:e2e
```

---

## Estrutura do projeto

```
src/
├── auth/               # Autenticação JWT (login, guards, estratégias)
├── user/               # Usuários e perfis
├── follow/             # Relação de seguidores
├── post/               # Postagens
├── comment/            # Comentários e respostas hierárquicas
└── common/             # Interceptors, filters, decorators compartilhados
```

---

## Endpoints principais

### Auth
| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/login` | Autenticar usuário |

### Usuários
| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| POST | `/user` | Criar conta | Público |
| GET | `/user` | Listar usuários | Autenticado |
| GET | `/user/:id` | Buscar usuário | Autenticado |
| PUT | `/user` | Atualizar próprio perfil | Autenticado |
| DELETE | `/user/:id` | Soft delete | Autenticado |
| DELETE | `/user/:id/permanent` | Hard delete | Admin |

### Seguidores
| Método | Rota | Descrição |
|---|---|---|
| POST | `/follow/:id` | Seguir usuário |
| DELETE | `/follow/:id` | Deixar de seguir |
| GET | `/follow/followers` | Listar seguidores |
| GET | `/follow/following` | Listar quem segue |

### Postagens
| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| POST | `/post` | Criar postagem | Autenticado |
| GET | `/post` | Listar postagens | Autenticado |
| GET | `/post/:id` | Buscar postagem | Autenticado |
| PUT | `/post/:id` | Editar própria postagem | Autenticado |
| DELETE | `/post/:id` | Soft delete | Autenticado (dono) |
| DELETE | `/post/:id/permanent` | Hard delete | Admin |

### Comentários
| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| POST | `/comment` | Comentar em postagem | Autenticado |
| POST | `/comment/:id/reply` | Responder comentário | Autenticado |
| PUT | `/comment/:id` | Editar próprio comentário | Autenticado |
| DELETE | `/comment/:id` | Soft delete | Autenticado (dono) |
| DELETE | `/comment/:id/permanent` | Hard delete | Admin |

---

## Relacionamentos entre entidades

```
User (1) ──── (N) Post
User (1) ──── (N) Comment
User (N) ──── (N) User       via Follow (follower_id, following_id)
Post (1) ──── (N) Comment
Comment (1) ── (N) Comment   auto-referência (parent_id)
```