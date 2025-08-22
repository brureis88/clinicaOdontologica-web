# Frontend – Clínica Odontológica (estudos)

Frontend em **HTML/CSS/JS + Materialize** servido por **Express** na **porta 3001**. 
Faz proxy para a API (porta **3000**) e consome os endpoints do projeto de API.

---

## Como executar

### 1) Subir a API (porta 3000)

Siga o README do repositório da API e inicialize:

- [Repositório](https://github.com/brureis88/clinicaOdontologica-api)

- Base da API: `http://localhost:3000`  
- Swagger: `http://localhost:3000/api-docs`

Endpoints usados aqui (conforme README da API):

- `GET /api/profissionais`
- `GET /api/pacientes`
- `GET /api/consultas`
- `GET /api/consultas/horarios-disponiveis?profissionalId=...&data=YYYY-MM-DD`
- `POST /api/consultas/agendar`

### 2) Subir o frontend (porta 3001)

 - **Clone o repositório**
   ```bash
   git clone <https://github.com/brureis88/clinicaOdontologica-web.git>
   cd projetoClinicaWeb
   ```

 - **Instale as dependências**
   ```bash
   npm install
   ```

 - **Inicie o servidor**
   ```bash
   # Modo produção
   npm start
   ```

Acesse: **http://localhost:3001**

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

## 📝 Licença

Este projeto é destinado exclusivamente para estudos de teste de software.

**Desenvolvido por Bruno Reis**
