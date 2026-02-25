# 🗒️ Your-Notes API

Uma API para gerenciamento de notas pessoais, com sistema de autenticação e persistência de dados.

## 🚀 Funcionalidades

- **Autenticação de Usuário:** Cadastro e Login com senhas criptografadas (Bcrypt) e sessões via cookies com JWT.
- **Gerenciamento de Notas:** Criação, listagem, atualização e exclusão (CRUD) de notas vinculadas ao usuário.
- **Segurança:** Middlewares de autenticação para proteção de rotas e manipulação segura de cookies (`httpOnly`).
- **Dockerizado:** Ambiente configurado com Docker e Docker Compose para facilitar a execução local.

## 🛠️ Tecnologias Utilizadas

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) 
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)
![Bcrypt](https://img.shields.io/badge/Bcrypt-4F5D95?style=for-the-badge&logo=securityscorecard&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

## 📦 Pré-requisitos

- [Git](https://git-scm.com)
- [Node.js](https://nodejs.org/en/)
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)

## 🔧 Instalação e Configuração

1. Clone o repositório:
```bash
git clone https://github.com/Juan-Foltran/your-notes.git
cd your-notes
```
2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
   Crie arquivos `.env` com os nomes `.env.api` e `.env.postgres` na raiz.

   * ⚙️ **Exemplo de Configuração** 
   ```env
   # Arquivo .env.api
   
   # postgres (library pg)
   DB_HOST=postgres
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=1234
   DB_NAME=polls
   
   # JWT
   JWT_SECRET=JwtSecretKey
   JWT_EXPIRES_IN='10m'
   
   # Cookie Duration
   COOKIE_EXPIRE_IN='10 * 60 * 1000'
   ```

   ```env
   # Arquivo .env.postgres
   
   POSTGRESQL_USERNAME=postgres
   POSTGRESQL_PASSWORD=1234
   POSTGRESQL_DATABASE=polls
   ```


## Exemplo do banco de dados 🎲
```query
create table users (
  id serial primary key,
  name varchar (150) not null,
  email varchar (250) not null,
  password text not null
);

create table notes (
  id_note serial primary key,
  id_user integer not null,
  title varchar (150),
  content text,

  foreign key (id_user) references users (id)
);
```

## 🏃 Como Rodar

### 🐳 Com Docker (Recomendado)

Se você usa Docker, não precisa instalar nada localmente (o Docker cuida do `npm install` e do banco de dados), apenas crie os arquivos `.env.api` e `.env.postgres` e execute:

```bash
docker-compose up 
```

> **💡 Dica (Desenvolvimento/Offline):** Por padrão, o projeto usa uma imagem pré-construída. Caso queira construir a imagem localmente (necessário se você alterou o código ou está sem conexão), altere a linha `image: juanfoltran/your-notes` para `build: ./` no serviço `api` do seu arquivo `docker-compose.yml`.


### 💻 Localmente (Desenvolvimento)
Caso queira rodar diretamente na sua máquina:

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Configure o banco PostgreSQL e as variáveis nos arquivos `.env.api` e `.env.postgres` e altere a variavel de ambiente `DB_HOST=postgres`  para `DB_HOST=localhost`.
3. Inicie o servidor:
   ```bash
   npm run dev
   ```



## API Endpoints 📍

Todas as rotas da API Your-Notes

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `POST` | `/create-user` | Adiciona um novo usuário (nome, email, senha). [Detalhes](#create-auth-detail) |
| `POST` | `/login` | Autentica e gera o cookie da sessão. [Detalhes](#login-auth-detail)|
| `GET` | `/notes` | Lista as notas do usuário logado. [Detalhes](#get-notes-auth-detail)|
| `POST` | `/notes` | Cria uma nova nota (título, conteúdo), necessita que o usuário esteja logado. [Detalhes](#post-notes-auth-detail)|
| `PATCH` | `/notes` | Atualiza uma nota (título, conteúdo, id_note), necessita que o usuário esteja logado. [Detalhes](#patch-notes-auth-detail)|
| `DELETE` | `/notes` | Remove uma nota (id_note, password para confirmação), necessita que o usuário esteja logado. [Detalhes](#delete-notes-auth-detail)|

<h3 id="create-auth-detail">/create-user</h3>

Cria um novo usuário no sistema com senha do usuário sendo criptografada

**Corpo da Requisição (JSON):**
```json
{
	"name": "Nome do Usuário",
	"email": "usuário@gmail.com",
	"password": "senha_forte"
	
}
```

**Respostas:**
* ✅ Sucesso (201 Created):
```json
{
	"message": "User created successfully",
	"userCreated": {
		"name": "juan"
	}
}
```
* ❌ Erro - Usuário existente (409 Conflict):
```json
{
  "message": "User already registered"
}
```
* ❌ Erro - Formato do email inválido (400 Bad Request):
```json
{
  "errors": ["Invalid email format"]
}
```

* ❌ Erro - Email ausente (400 Bad Request):
```json
{
  "errors": ["Email is required"]
}
```
* ❌ Erro - Senha ausente (400 Bad Request):
```json
{
  "errors": ["Password is required"]
}
```
* ❌ Erro - Nome ausente (400 Bad Request):
```json
{
  "errors": ["Name is required"]
}
```

<h3 id="login-auth-detail">/login</h3>

**Corpo da Requisição (JSON):**
```json
{
	"email": "usuário@gmail.com",
	"password": "senha_forte"
}
```
**Respostas:**
* ✅ Sucesso (200 Success):
```json
{
  "message": "Login successfully"
}
```
* ❌ Erro - Formato do email inválido (400 Bad Request):
```json
{
  "errors": ["Invalid email format"]
}
```

* ❌ Erro - Email ausente (400 Bad Request):
```json
{
  "errors": ["Email is required"]
}
```
* ❌ Erro - Senha ausente (400 Bad Request):
```json
{
  "errors": ["Password is required"]
}
```

* ❌ Erro - Usuário inexistente (401 Unauthorized):
```json
{
  "error": "Invalid email or password"
}
```
* ❌ Erro - Senha inválida (401 Unauthorized):
```json
{
  "error": "Invalid email or password"
}
```
<h3 id="get-notes-auth-detail">GET NOTE /notes</h3>

**Resposta:**

* ✅ Sucesso - Retorna as notas do usuário (200 Success):
```json
[
	{
		"title": "teste",
		"content": "teste",
		"id_note": 1
	},
	{
		"title": "teste2",
		"content": "teste2",
		"id_note": 2
	}
]
```

* ✅ Sucesso - Caso o usuário não tenha criado sua primeira nota (200 Success):
```json
{
  "message": "create your first note"
}
```
* ❌ Erro - Caso não esteja logado (401 Unauthorized):
```json
{
  "error": "access denied"
}
```
* ❌ Erro - Caso o token tenha sido expirado (403 Forbidden):
```json
{
  "error": "token invalid or expired, log in again"
}
```

<h3 id="post-notes-auth-detail">POST NOTE /notes</h3>

**Corpo da Requisição (JSON):**
```json
{
	"title": "Seu titulo da nota",
	"content": "seu conteúdo da nota"
}
```

**Respostas:**

* ✅ Sucesso - Nota criada com sucesso (201 Created):

```json
{
	"message": "Note created successfully",
	"NoteCreated": [
		{
			"id_note": 10,
			"title": "teste3",
			"content": "teste3"
		}
	]
}
```

* ❌ Erro - Caso não esteja logado (401 Unauthorized):
```json
{
  "error": "access denied"
}
```

* ❌ Erro - Caso o token tenha sido expirado (403 Forbidden):
```json
{
  "error": "token invalid or expired, log in again"
}
```


<h3 id="patch-notes-auth-detail">PATCH NOTE /notes</h3>

**Corpo da Requisição (JSON):**
```json
{
	"title": "Seu titulo da nota",
	"content": "seu conteúdo da nota",
  "id_note": "id da nota que deseja editar"
}
```

**Resposta:**

* ✅ Sucesso - Nota editada com sucesso (200 Success):
```json
{
	"title": "titulo da nota que foi editado",
	"content": "conteúdo da sua nota que foi editado"
}
```
> **OBS: você pode editar ou deixar de editar o campo que quiser, não é obrigatório editar o title e o content**

* ❌ Erro - Nota não encontrada (404 Not Found):

```json
{
  "error": "Note not found"
}
```

* ❌ Erro - Caso não esteja logado (401 Unauthorized):
```json
{
  "error": "access denied"
}
```

* ❌ Erro - Caso o token tenha sido expirado (403 Forbidden):
```json
{
  "error": "token invalid or expired, log in again"
}
```


<h3 id="delete-notes-auth-detail">DELETE NOTE /notes</h3>

**Corpo da requisição:**
```json
{
	"password": "senha do user logado",
	"id_note": "id da nota que deseja deletar"
}
```

**Resposta:**

* ✅ Sucesso - Nota deletada (200 Success):
```json
{
  "message": "Your note was deleted successfully"
}
```
* ❌ Erro - Senha ausente (400 Bad Request):
```json
{
  "errors": ["Password is required"]
}
```

* ❌ Erro - Senha inválida (401 Unauthorized):
```json
{
  "error": "invalid password"
}
```

* ❌ Erro - Nota não encontrada (404 Not Found):
```json
{
  "error": "Note not found"
}
```

* ❌ Erro - Caso não esteja logado (401 Unauthorized):
```json
{
  "error": "access denied"
}
```

* ❌ Erro - Caso o token tenha sido expirado (403 Forbidden):
```json
{
  "error": "token invalid or expired, log in again"
}
```

## ⚠️ Possíveis erros (database)

Estes erros geralmente ocorrem devido a falhas na conexão com o PostgreSQL ou problemas na execução das queries SQL (Status 500).

* ❌ Erro - Falha ao criar usuário:
```json
{
  "error": "Error creating user"
}
```

* ❌ Erro - Falha ao recuperar notas:
```json
{
  "error": "Error retrieving notes"
}
```

* ❌ Erro - Falha ao criar nota:
```json
{
  "error": "ERROR creating note"
}
```

* ❌ Erro - Falha ao atualizar nota:
```json
{
  "error": "Error updating note"
}
```

* ❌ `Error acquiring client`: Falha ao tentar conectar com o pool do PostgreSQL.
* ❌ `Error executing query`: A conexão existe, ou caiu durante a execução da query, ou a sintaxe do SQL ou os dados enviados estão com problema.

## 📄 Fins do projeto

> **Aviso:** Este projeto foi desenvolvido exclusivamente para fins de estudo e aprendizado de tecnologias como Node.js, Express, Docker e PostgreSQL.