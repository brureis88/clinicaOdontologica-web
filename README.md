# Frontend – Clínica Odontológica (estudos)

Frontend simples em **HTML/CSS/JS + Materialize** servido por **Express** na **porta 3001**. 
Faz proxy para a API (porta **3000**) e consome exatamente os endpoints documentados no Swagger do projeto.

> **Importante – correção aplicada:** o proxy foi configurado para **não duplicar `/api`** na URL de destino.  
> Assim, uma chamada `GET http://localhost:3001/api/pacientes` é encaminhada para `GET http://localhost:3000/api/pacientes` (sem `/api` duplo).

---

## Como executar

### 1) Subir a API (porta 3000)

Siga o README do repositório da API e inicialize:

- Base da API: `http://localhost:3000`  
- Swagger: `http://localhost:3000/api-docs`

Endpoints usados aqui (conforme README da API):

- `GET /api/profissionais`
- `GET /api/pacientes`
- `GET /api/consultas`
- `GET /api/consultas/horarios-disponiveis?profissionalId=...&data=YYYY-MM-DD`
- `POST /api/consultas/agendar`

### 2) Subir o frontend (porta 3001)

```bash
npm install
npm start
```

Acesse: **http://localhost:3001**

---

## Estrutura

```
clinica-odontologica-web
├─ server.js                # Express (porta 3001) + proxy
├─ package.json
└─ public/
   ├─ index.html            # UI Materialize
   ├─ css/styles.css
   └─ js/app.js             # chamadas à API e lógica da página
```

---

## Proxy (detalhes)

No `server.js`:

```js
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true,
}));
```

**Por quê assim?** Porque a API já expõe as rotas com o prefixo `/api` no próprio backend.  
Se definíssemos `target: 'http://localhost:3000/api'` **e** não removêssemos `/api` do caminho, a requisição viraria `http://localhost:3000/api/api/...` e retornaria **404 – Rota não encontrada**.

---

## Observações

- A UI mostra os **status HTTP** retornados pela API em um *chip*.
- Os **dropdowns de paciente e profissional** carregam usando `GET /api/pacientes` e `GET /api/profissionais` e são reinicializados via `M.FormSelect.init(...)` (Materialize).
- O formulário de **agendamento** envia para `POST /api/consultas/agendar` e atualiza a lista de consultas.
- Este projeto é apenas para **estudos** e não é destinado à produção.
