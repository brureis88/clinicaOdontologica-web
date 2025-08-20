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

  // Listener do submit do modal de edição
  const formEditar = document.getElementById('formEditarConsulta');
  if (formEditar) {
    formEditar.addEventListener('submit', async function(e) {
      e.preventDefault();
      const id = document.getElementById('editConsultaId').value;
      const data = document.getElementById('editData').value;
      const horario = document.getElementById('editHorarioSelect').value;
      const tipoConsulta = document.getElementById('editTipoConsulta').value;
      const observacoes = document.getElementById('editObs').value;
      try {
        const res = await fetch(`/api/consultas/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data, horario, tipoConsulta, observacoes })
        });
        const json = await res.json();
        setStatus(res.status, json.message || res.statusText);
        listarConsultas();
        const modal = M.Modal.getInstance(document.getElementById('modalEditarConsulta'));
        modal.close();
      } catch (err) {
        setStatus(0, 'Falha ao editar consulta');
        console.error(err);
      }
    });
  }
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
    const json = await res.json();
    const consultas = json.data || [];
    const tbody = document.getElementById('consultasTbody');
    tbody.innerHTML = '';
    consultas.forEach(c => {
      const tr = document.createElement('tr');
      // Formatar data para DD-MM-AAAA
      let dataFormatada = c.data;
      if (typeof c.data === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(c.data)) {
        const [ano, mes, dia] = c.data.split('-');
        dataFormatada = `${dia}-${mes}-${ano}`;
      }
      tr.innerHTML = `
        <td>${c.id}</td>
        <td>${c.paciente?.nome ?? '-'}</td>
        <td>${c.profissional?.nome ?? '-'}</td>
        <td>${dataFormatada}</td>
        <td>${c.horario}</td>
        <td>${c.tipoConsulta}</td>
        <td>${c.status}</td>
        <td style="text-align:right">
          <button class="btn-flat btn-small edit-consulta teal-text text-darken-2" style="font-weight:bold;" title="Editar" data-id="${c.id}">Editar</button>
          <button class="btn-flat btn-small cancel-consulta red-text" style="font-weight:bold;" title="Cancelar" data-id="${c.id}">Cancelar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
    // Eventos dos ícones
    tbody.querySelectorAll('.edit-consulta').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        // Verifica o status na linha da tabela
        const tr = el.closest('tr');
        const statusTd = tr.querySelector('td:nth-child(7)');
        const status = statusTd ? statusTd.textContent.trim().toLowerCase() : '';
        if (status === 'cancelada') {
          M.toast({html: 'Não é possível editar uma consulta cancelada', classes: 'red'});
          return;
        }
        abrirModalEditarConsulta(el.dataset.id);
      });
    });
    tbody.querySelectorAll('.cancel-consulta').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        // Verifica o status na linha da tabela
        const tr = el.closest('tr');
        const statusTd = tr.querySelector('td:nth-child(7)');
        const status = statusTd ? statusTd.textContent.trim().toLowerCase() : '';
        if (status === 'cancelada') {
          M.toast({html: 'Consulta já foi cancelada.', classes: 'orange'});
          return;
        }
        cancelarConsulta(el.dataset.id);
      });
    });
// Função para abrir modal de edição
async function abrirModalEditarConsulta(id) {
  try {
    const res = await fetch(`/api/consultas/${id}`);
    const json = await res.json();
    const c = json.data || json;
    document.getElementById('editConsultaId').value = c.id;
    document.getElementById('editData').value = c.data;
    document.getElementById('editTipoConsulta').value = c.tipoConsulta;
    document.getElementById('editObs').value = c.observacoes;
    // Preencher profissional (desabilitado)
    const profSel = document.getElementById('editProfissionalSelect');
    profSel.innerHTML = `<option value="${c.profissional.id}" selected>${c.profissional.nome} (${c.profissional.especialidade})</option>`;
    profSel.value = c.profissional.id;
    M.FormSelect.init(profSel);
    // Buscar horários disponíveis para o profissional/data
    await atualizarHorariosEdicao();
    document.getElementById('editHorarioSelect').value = c.horario;
    M.FormSelect.init(document.getElementById('editHorarioSelect'));
    M.updateTextFields();
    // Registrar evento de change após abrir modal
    const editData = document.getElementById('editData');
    if (editData) {
      editData.onchange = atualizarHorariosEdicao;
    }
    const modal = M.Modal.getInstance(document.getElementById('modalEditarConsulta'));
    modal.open();
// Atualiza horários disponíveis no modal de edição
async function atualizarHorariosEdicao() {
  const profId = document.getElementById('editProfissionalSelect').value;
  const data = document.getElementById('editData').value;
  const sel = document.getElementById('editHorarioSelect');
  sel.innerHTML = '<option value="" disabled selected>Selecione a data</option>';
  if (profId && data) {
    try {
      const res = await fetch(`/api/consultas/horarios-disponiveis?profissionalId=${profId}&data=${data}`);
      const json = await res.json();
      const horarios = Array.isArray(json) ? json : json.data?.horariosDisponiveis || [];
      sel.innerHTML = '<option value="" disabled selected>Selecione</option>' + horarios.map(h => `<option value="${h}">${h}</option>`).join('');
    } catch (e) {
      sel.innerHTML = '<option value="" disabled selected>Erro ao buscar horários</option>';
    }
  }
  M.FormSelect.init(sel);
}

// Atualizar horários ao mudar data no modal de edição
document.addEventListener('DOMContentLoaded', function() {
  const editData = document.getElementById('editData');
  if (editData) {
    editData.addEventListener('change', atualizarHorariosEdicao);
  }
});
  } catch (err) {
    setStatus(0, 'Falha ao carregar consulta para edição');
    console.error(err);
  }
}


// Função para cancelar consulta
async function cancelarConsulta(id) {
  if (!confirm('Deseja realmente cancelar esta consulta?')) return;
  try {
    const res = await fetch(`/api/consultas/${id}/cancelar`, { method: 'PATCH' });
    const json = await res.json();
    setStatus(res.status, json.message || res.statusText);
    listarConsultas();
  } catch (err) {
    setStatus(0, 'Falha ao cancelar consulta');
    console.error(err);
  }
}
    if (!consultas.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="center-align grey-text">Nenhuma consulta</td></tr>';
    }
  } catch (err) {
    setStatus(0, 'Falha ao listar consultas');
    console.error(err);
  }
}
