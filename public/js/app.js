// Inicialização Materialize e lógica da página
document.addEventListener('DOMContentLoaded', () => {
  const selects = document.querySelectorAll('select');
  M.FormSelect.init(selects);

  // Carregar dropdowns
  carregarPacientes();
  carregarProfissionais();

  // Eventos
  document.getElementById('profissionalSelect').addEventListener('change', carregarHorarios);
  document.getElementById('dataInput').addEventListener('change', carregarHorarios);
  document.getElementById('btnAgendar').addEventListener('click', agendarConsulta);

  // Carregar consultas
  listarConsultas();
});

function setStatus(status, message) {
  const chip = document.getElementById('statusChip');
  const msg = document.getElementById('statusMsg');
  chip.textContent = status ?? '—';
  chip.className = 'chip ' + (status >= 200 && status < 300 ? 'green lighten-4 green-text text-darken-4' : 'red lighten-4 red-text text-darken-4');
  msg.textContent = message || '';
}

async function carregarPacientes() {
  try {
    const res = await fetch('/api/pacientes');
    setStatus(res.status, res.statusText);
    const json = await res.json();
    const data = json.data || [];
    const select = document.getElementById('pacienteSelect');
    select.innerHTML = '<option value="" disabled selected>Selecione um paciente</option>';
    data.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.nome} (${p.cpf})`;
      select.appendChild(opt);
    });
    // Destruir instância anterior, se houver
    if (M.FormSelect.getInstance(select)) {
      M.FormSelect.getInstance(select).destroy();
    }
    M.FormSelect.init(select);
  } catch (err) {
    setStatus(0, 'Falha ao carregar pacientes');
    console.error(err);
  }
}

async function carregarProfissionais() {
  try {
    const res = await fetch('/api/profissionais');
    setStatus(res.status, res.statusText);
    const json = await res.json();
    const data = json.data || [];
    const select = document.getElementById('profissionalSelect');
    select.innerHTML = '<option value="" disabled selected>Selecione um profissional</option>';
    data.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.nome} — ${p.especialidade || ''}`;
      select.appendChild(opt);
    });
    // Destruir instância anterior, se houver
    if (M.FormSelect.getInstance(select)) {
      M.FormSelect.getInstance(select).destroy();
    }
    M.FormSelect.init(select);
  } catch (err) {
    setStatus(0, 'Falha ao carregar profissionais');
    console.error(err);
  }
}

async function carregarHorarios() {
  const profissionalId = document.getElementById('profissionalSelect').value;
  const data = document.getElementById('dataInput').value;
  if (!profissionalId || !data) return;

  try {
    const url = `/api/consultas/horarios-disponiveis?profissionalId=${encodeURIComponent(profissionalId)}&data=${encodeURIComponent(data)}`;
    const res = await fetch(url);
    setStatus(res.status, res.statusText);
    const json = await res.json();
    const horarios = (json.data && json.data.horariosDisponiveis) || [];
    const select = document.getElementById('horarioSelect');
    select.innerHTML = '<option value="" disabled selected>Selecione um horário</option>';
    horarios.forEach(h => {
      const opt = document.createElement('option');
      opt.value = h;
      opt.textContent = h;
      select.appendChild(opt);
    });
    // Destruir instância anterior, se houver
    if (M.FormSelect.getInstance(select)) {
      M.FormSelect.getInstance(select).destroy();
    }
    M.FormSelect.init(select);
  } catch (err) {
    setStatus(0, 'Falha ao carregar horários');
    console.error(err);
  }
}

async function agendarConsulta() {
  const pacienteId = parseInt(document.getElementById('pacienteSelect').value);
  const profissionalId = parseInt(document.getElementById('profissionalSelect').value);
  const data = document.getElementById('dataInput').value;
  const horario = document.getElementById('horarioSelect').value;
  const tipoConsulta = document.getElementById('tipoConsultaInput').value;
  const observacoes = document.getElementById('obsInput').value;

  if (!pacienteId || !profissionalId || !data || !horario || !tipoConsulta) {
    M.toast({html: 'Preencha todos os campos obrigatórios'});
    return;
  }

  try {
    const res = await fetch('/api/consultas/agendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pacienteId, profissionalId, data, horario, tipoConsulta, observacoes })
    });
    setStatus(res.status, res.statusText);
    const body = await res.json();
    if (res.ok) {
      M.toast({html: 'Consulta agendada!'});
      listarConsultas();
    } else {
      M.toast({html: 'Erro: ' + (body?.message || 'Falha ao agendar')});
    }
  } catch (err) {
    setStatus(0, 'Falha ao agendar consulta');
    console.error(err);
  }
}

async function listarConsultas() {
  try {
    const res = await fetch('/api/consultas');
    setStatus(res.status, res.statusText);
    const consultas = await res.json();
    const tbody = document.getElementById('consultasTbody');
    tbody.innerHTML = '';
    consultas.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${c.id}</td>
        <td>${c.paciente?.nome ?? '-'}</td>
        <td>${c.profissional?.nome ?? '-'}</td>
        <td>${c.data}</td>
        <td>${c.horario}</td>
        <td>${c.tipoConsulta}</td>
        <td>${c.status}</td>
      `;
      tbody.appendChild(tr);
    });
    if (!consultas.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="center-align grey-text">Nenhuma consulta</td></tr>';
    }
  } catch (err) {
    setStatus(0, 'Falha ao listar consultas');
    console.error(err);
  }
}
