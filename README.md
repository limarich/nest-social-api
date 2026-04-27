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

### Autenticação (complementar)

- Um usuário autenticado pode fazer logout, invalidando seu refresh token no banco

### Perfil de usuário

- Um usuário pode adicionar informações ao seu perfil: bio, foto de perfil, site e localização
- A foto de perfil deve ser armazenada e acessível via URL

### Upload de mídia

- Um usuário autenticado pode anexar imagens a uma postagem
- Imagens devem ser armazenadas e acessíveis via URL pública

### Feed personalizado

- Um usuário autenticado pode visualizar um feed com as postagens de quem segue, ordenado por data

### Busca

- Um usuário autenticado pode buscar outros usuários por nome ou email
- Um usuário autenticado pode buscar postagens por palavra-chave no título ou conteúdo

### Hashtags

- Um usuário pode adicionar hashtags a uma postagem
- Um usuário autenticado pode listar postagens por hashtag

### Notificações

- Um usuário recebe notificação quando alguém curte sua postagem ou comentário
- Um usuário recebe notificação quando alguém comenta ou responde em sua postagem
- Um usuário recebe notificação quando alguém começa a segui-lo
- Um usuário pode listar suas notificações (lidas e não lidas)
- Um usuário pode marcar notificações como lidas

### Postagens salvas

- Um usuário autenticado pode salvar uma postagem para leitura posterior
- Um usuário autenticado pode remover uma postagem dos salvos
- Um usuário autenticado pode listar suas postagens salvas

### Compartilhamento / Repost

- Um usuário autenticado pode repostar uma postagem de outro usuário
- O repost mantém referência à postagem original e ao autor original

### Bloqueio e silenciamento

- Um usuário pode bloquear outro usuário, impedindo interações entre eles
- Um usuário pode silenciar outro usuário, ocultando suas postagens do feed sem bloquear
- Um usuário pode desbloquear ou dessilenciar outro usuário

### Mensagens diretas

- Um usuário autenticado pode enviar mensagens privadas para outro usuário
- Um usuário autenticado pode listar suas conversas
- Um usuário autenticado pode listar as mensagens de uma conversa específica

### Verificação de e-mail e recuperação de senha

- Ao criar conta, o usuário recebe um e-mail de verificação
- Apenas contas verificadas podem acessar recursos autenticados
- Um usuário pode solicitar reset de senha via e-mail
- O link de reset deve expirar após um período configurável

---

## Requisitos não funcionais

### Segurança

- Senhas armazenadas com hash **Argon2** (resistente a GPU/ASIC attacks)
- Refresh tokens armazenados com hash Argon2 no banco — tokens em plaintext nunca são persistidos
- Autenticação via **JWT** com dois tipos de token distintos (`access` e `refresh`) identificados por campo `type` no payload
- Access tokens com TTL curto (padrão 1h), refresh tokens com TTL longo (padrão 24h), ambos configuráveis via variáveis de ambiente
- **Refresh token rotation** — a cada renovação o token anterior é invalidado e um novo hash é salvo no banco
- Rotas protegidas rejeitam requisições sem token válido com HTTP 401
- Refresh tokens são rejeitados em rotas protegidas — somente access tokens são aceitos pelo `AuthGuard`
- Controle de acesso por roles (`user`, `admin`) via `RolesGuard` com role embutida no payload JWT
- Headers de segurança HTTP configurados via **Helmet** (CSP, HSTS, X-Frame-Options, etc.)
- Rate limiting em três janelas (10 req/s, 50 req/10s, 200 req/min) com limites mais restritivos nos endpoints de autenticação (5 req/min)
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
- **Autenticação:** JWT (access + refresh token rotation)
- **Hash:** Argon2
- **Logs:** pino / nestjs-pino
- **Rate limiting:** @nestjs/throttler
- **Segurança HTTP:** Helmet

---

## Configuração e execução

### Pré-requisitos

- Node.js >= 18
- PostgreSQL >= 14
- npm ou yarn

### Com Docker (recomendado)

O projeto inclui um `docker-compose.yml` que sobe a aplicação e o banco PostgreSQL juntos.

```bash
# subir tudo
docker compose up -d

# rebuildar após mudanças no código ou Dockerfile
docker compose up -d --build

# ver logs da aplicação
docker compose logs -f app

# derrubar tudo mantendo o volume do banco
docker compose down

# derrubar e apagar o banco também
docker compose down -v
```

### Sem Docker

#### Instalação

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
JWT_TOKEN_AUDIENCE=http://localhost:3000
JWT_TOKEN_ISSUER=http://localhost:3000
JWT_TTL=3600
JWT_REFRESH_TTL=86400

# Aplicação
PORT=3000
NODE_ENV=development
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
| Método | Rota | Descrição | Acesso |
|---|---|---|---|
| POST | `/auth/login` | Autenticar usuário | Público |
| POST | `/auth/refresh` | Renovar access token via refresh token | Público |

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