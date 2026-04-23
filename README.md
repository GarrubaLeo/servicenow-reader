# 🧩 ServiceNow Reader API (TypeScript)

## 📌 Visão Geral

Este projeto implementa um serviço em **Node.js + TypeScript** responsável por realizar a **leitura de tickets (incidents)** do ServiceNow, normalizar os dados e disponibilizá-los através de uma API interna.

O objetivo desta aplicação é servir como **camada intermediária de integração**, preparando os dados para posterior envio ao Movidesk.

---

## 🎯 Objetivo

* Consumir a API REST do ServiceNow
* Extrair dados de incidentes
* Normalizar os campos para um modelo interno padronizado
* Expor endpoint interno para consumo e testes
* Preparar base para integração futura com Movidesk

---

## 🏗️ Arquitetura

A aplicação segue uma arquitetura modular baseada em separação de responsabilidades:

```
Controller → Service → Client → ServiceNow API
                        ↓
                     Mapper
                        ↓
                 Modelo Interno
```

---

## 📂 Estrutura do Projeto

```
src/
├─ app.ts
├─ server.ts
├─ config/
│  └─ env.ts
├─ clients/
│  └─ serviceNowClient.ts
├─ modules/
│  └─ tickets/
│     ├─ controller.ts
│     ├─ service.ts
│     ├─ mapper.ts
│     ├─ types.ts
│     └─ routes.ts
├─ models/
│  └─ internalTicket.ts
├─ shared/
│  ├─ http/
│  ├─ errors/
│  └─ utils/
```

---

## ⚙️ Pré-requisitos

* Node.js **22+ (recomendado 24 LTS)**
* npm ou yarn
* Acesso à instância do ServiceNow
* Usuário com permissão de leitura na tabela `incident`

---

## 🔐 Configuração

### 1. Criar arquivo `.env`

Baseie-se no arquivo `.env.example`:

```env
PORT=3000

SN_BASE_URL=https://your-instance.service-now.com
SN_USERNAME=your_user
SN_PASSWORD=your_password

SN_TABLE=incident
SN_DEFAULT_LIMIT=20
```

---

## 🚀 Execução

### Instalar dependências

```bash
npm install
```

### Rodar em modo desenvolvimento

```bash
npm run dev
```

### Build produção

```bash
npm run build
npm start
```

---

## 🔎 Endpoints Disponíveis

### Health Check

```http
GET /health
```

Resposta:

```json
{
  "status": "ok"
}
```

---

### Listar Tickets

```http
GET /tickets
```

Parâmetros opcionais:

| Parâmetro | Tipo   | Descrição                           |
| --------- | ------ | ----------------------------------- |
| `limit`   | number | Quantidade de registros             |
| `query`   | string | Filtro ServiceNow (`sysparm_query`) |

Exemplo:

```http
GET /tickets?limit=5
GET /tickets?query=active=true
```

---

## 🔗 Integração com API do ServiceNow

A aplicação consome o endpoint:

```http
GET /api/now/table/incident
```

Com os parâmetros:

* `sysparm_limit`
* `sysparm_query`
* `sysparm_fields`

---

## 📦 Modelo de Dados Interno

O sistema utiliza um modelo padronizado independente do ServiceNow:

```ts
export interface InternalTicket {
  source: 'servicenow';
  externalId: string;
  ticketNumber: string;
  subject: string;
  description: string | null;
  status: string | null;
  priority: string | null;
  requesterId: string | null;
  assigneeId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}
```

---

## 🔄 Mapeamento de Campos

### ServiceNow → Modelo Interno

| ServiceNow          | Interno        | Descrição          |
| ------------------- | -------------- | ------------------ |
| `sys_id`            | `externalId`   | ID técnico         |
| `number`            | `ticketNumber` | Número do ticket   |
| `short_description` | `subject`      | Título             |
| `description`       | `description`  | Descrição          |
| `state`             | `status`       | Status (código)    |
| `priority`          | `priority`     | Prioridade         |
| `opened_by.value`   | `requesterId`  | Solicitante        |
| `assigned_to.value` | `assigneeId`   | Responsável        |
| `sys_created_on`    | `createdAt`    | Data criação       |
| `sys_updated_on`    | `updatedAt`    | Última atualização |

---

## ⚠️ Observações Importantes

### Status (`state`)

O ServiceNow retorna valores numéricos:

| Código | Significado |
| ------ | ----------- |
| 1      | New         |
| 2      | In Progress |
| 3      | On Hold     |
| 6      | Resolved    |
| 7      | Closed      |

👉 A tradução para texto será tratada em etapas futuras.

---

### Campos de Referência

Campos como `assigned_to` e `opened_by` são retornados como referência:

```json
{
  "value": "sys_id",
  "link": "url"
}
```

Atualmente, apenas o `value` é utilizado.

---

### Performance

Evite chamadas sem filtro:

❌ Não recomendado:

```
GET /incident
```

✅ Recomendado:

```
GET /incident?sysparm_limit=100&sysparm_query=active=true
```

---

## 🧪 Testes

Você pode testar via:

* Postman
* curl
* navegador

Exemplo:

```bash
curl http://localhost:3000/tickets
```

---

## 🧱 Tratamento de Erros

A aplicação utiliza uma classe padrão `AppError`:

* erros do ServiceNow são propagados com status original
* fallback para erro 500 em exceções inesperadas

---

## 🔐 Segurança (Atual)

* Autenticação via Basic Auth
* Credenciais via `.env`

📌 Recomendações futuras:

* OAuth 2.0
* Secret Manager
* TLS enforcement

---

## 📈 Próximas Evoluções

* Tradução de status e prioridade
* Paginação automática
* Filtro incremental (`sys_updated_on`)
* Expansão de usuários (nome/email)
* Integração com Movidesk
* Retry e resiliência
* Logging estruturado

---

## 🧩 Estratégia de Evolução

Este projeto foi desenhado para evoluir em camadas:

1. Leitura do ServiceNow ✅
2. Normalização de dados
3. Enriquecimento de dados
4. Integração com Movidesk
5. Resiliência e observabilidade

---

## 📞 Suporte

Em caso de dúvidas técnicas:

* Verificar logs da aplicação
* Validar credenciais ServiceNow
* Testar endpoint diretamente via curl/Postman

---

## 📄 Licença

Uso interno / projeto de integração corporativa.

---
