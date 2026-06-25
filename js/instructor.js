// ===== INSTRUCTOR MODULE =====

let instructorUnsubscribe = null;
let selectedCadetId = null;
let instructorEventsUnsub = null;
let platoonUnsub = null;
let instructorPlatoons = [];
let allCadetsData = [];
let currentCadetFilter = 'all';
let expandedPlatoons = {};

// Scenario definitions (short versions for instructor)
const INSTRUCTOR_SCENARIOS = {
  'first_aid': { label: 'Первая помощь', short: 'Оказать первую помощь' },
  'cover_move': { label: 'Укрытие', short: 'Переместиться в укрытие' },
  'wait_evac': { label: 'Эвакуация', short: 'Ожидать эвакуации' },
  'hold_position': { label: 'Позиция', short: 'Сохранять позицию' },
  'continue_move': { label: 'Движение', short: 'Продолжать движение' },
  'fall_back': { label: 'Отход', short: 'Отойти в тыл' },
  'report': { label: 'Доклад', short: 'Доложить обстановку' }
};

function initInstructorScreen() {
  const screen = document.getElementById('instructor-screen');
  screen.innerHTML = `
    <div class="screen-header">
      <h1>Панель инструктора</h1>
      <p id="instructor-name-display">Мониторинг курсантов</p>
    </div>

    <div class="instructor-tabs">
      <button class="tab-btn active" data-tab="cadets" onclick="switchInstructorTab('cadets')">Курсанты</button>
      <button class="tab-btn" data-tab="platoons" onclick="switchInstructorTab('platoons')">Взводы</button>
    </div>

    <!-- CADETS TAB -->
    <div id="tab-cadets" class="tab-content active">
      <div class="instructor-toolbar">
        <button class="btn btn-secondary btn-sm" onclick="showAllCadets()">Все</button>
        <button class="btn btn-success btn-sm" onclick="filterCadets('healthy')">Здоровы</button>
        <button class="btn btn-warning btn-sm" onclick="filterCadets('warning')">Внимание</button>
        <button class="btn btn-danger btn-sm" onclick="filterCadets('injured')">Ранены</button>
        <button class="btn btn-danger btn-sm" onclick="filterCadets('critical')">Критические</button>
      </div>

      <div id="cadet-list" class="cadet-list">
        <div class="loading">Загрузка списка курсантов</div>
      </div>
    </div>

    <!-- PLATOONS TAB -->
    <div id="tab-platoons" class="tab-content">
      <div class="platoon-controls">
        <button class="btn btn-primary btn-sm" onclick="openCreatePlatoonModal()">+ Создать взвод</button>
      </div>
      <div id="platoon-list" class="platoon-list">
        <div class="loading">Загрузка взводов</div>
      </div>
    </div>
  `;

  // Build modals
  buildCadetDetailModal();
  buildCreatePlatoonModal();

  // Load instructor name
  db.collection('users').doc(currentUser.uid).get().then(doc => {
    if (doc.exists) {
      document.getElementById('instructor-name-display').textContent =
        doc.data().name || 'Мониторинг курсантов';
    }
  });

  // Start listening for cadet data and platoons
  listenToInstructorPlatoons();
}

function switchInstructorTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.querySelector(`.tab-btn[data-tab="${tab}"]`).classList.add('active');
  document.getElementById(`tab-${tab}`).classList.add('active');

  if (tab === 'platoons') {
    renderPlatoonList();
  }
}

// ===== PLATOON MANAGEMENT =====

function listenToInstructorPlatoons() {
  if (platoonUnsub) platoonUnsub();

  platoonUnsub = db.collection('platoons')
    .where('instructorId', '==', currentUser.uid)
    .onSnapshot(snapshot => {
      instructorPlatoons = [];
      snapshot.forEach(doc => {
        instructorPlatoons.push({ id: doc.id, ...doc.data() });
      });

      // Re-listen to cadets filtered by these platoons
      listenToInstructorCadets();

      // Update platoon list UI if visible
      const platoonTab = document.getElementById('tab-platoons');
      if (platoonTab && platoonTab.classList.contains('active')) {
        renderPlatoonList();
      }
    }, err => {
      console.warn('Platoon listener error:', err);
    });
}

function listenToInstructorCadets() {
  if (instructorUnsubscribe) instructorUnsubscribe();

  const platoonIds = instructorPlatoons.map(p => p.id);

  if (platoonIds.length === 0) {
    instructorUnsubscribe = db.collection('users')
      .where('role', '==', 'cadet')
      .where('instructorId', '==', currentUser.uid)
      .onSnapshot(snapshot => {
        const cadets = [];
        snapshot.forEach(doc => {
          cadets.push({ id: doc.id, ...doc.data() });
        });
        renderCadetListGrouped(cadets);
      }, err => {
        console.warn('Instructor cadet listener error:', err);
      });
    return;
  }

  instructorUnsubscribe = db.collection('users')
    .where('role', '==', 'cadet')
    .onSnapshot(snapshot => {
      const cadets = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (platoonIds.includes(data.platoonId) || data.instructorId === currentUser.uid) {
          cadets.push({ id: doc.id, ...data });
        }
      });
      renderCadetListGrouped(cadets);
    }, err => {
      console.warn('Instructor cadet listener error:', err);
      document.getElementById('cadet-list').innerHTML = '<div class="loading">Ошибка загрузки. Проверьте подключение.</div>';
    });
}

// ===== GROUPED CADET LIST (by platoon) =====

function renderCadetListGrouped(cadets) {
  allCadetsData = cadets;

  // Filter cadets if a status filter is active
  let filtered = cadets;
  if (currentCadetFilter !== 'all') {
    filtered = cadets.filter(c => c.status === currentCadetFilter);
  }

  const container = document.getElementById('cadet-list');

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="card" style="text-align:center;padding:30px;color:#888">
        <div style="font-size:2rem;margin-bottom:8px">${cadets.length === 0 ? '👤' : '✅'}</div>
        <div>${cadets.length === 0 ? 'Нет курсантов в ваших взводах' : 'Нет курсантов с таким статусом'}</div>
      </div>
    `;
    return;
  }

  // Group cadets by platoonId
  const grouped = {};
  const noPlatoon = [];

  filtered.forEach(cadet => {
    const pid = cadet.platoonId || '__none__';
    if (pid === '__none__') {
      noPlatoon.push(cadet);
    } else {
      if (!grouped[pid]) grouped[pid] = [];
      grouped[pid].push(cadet);
    }
  });

  let html = '';

  // Render each platoon group
  instructorPlatoons.forEach(p => {
    const cadetsInPlatoon = grouped[p.id] || [];
    // Count cadets matching the current filter, but display total in header
    const totalInPlatoon = allCadetsData.filter(c => c.platoonId === p.id).length;
    const isExpanded = expandedPlatoons[p.id] || false;

    // Only show platoons that have cadets in the current filter view
    if (cadetsInPlatoon.length === 0 && currentCadetFilter === 'all' && totalInPlatoon === 0) return;
    if (cadetsInPlatoon.length === 0 && currentCadetFilter !== 'all') return;

    const maxCap = p.maxCadets || 30;
    const capacityStr = `${totalInPlatoon}/${maxCap}`;
    const capacityClass = totalInPlatoon >= maxCap ? 'platoon-full' : (totalInPlatoon >= maxCap * 0.8 ? 'platoon-warning' : '');

    html += `
      <div class="platoon-group">
        <div class="platoon-group-header ${isExpanded ? 'expanded' : ''}" onclick="togglePlatoonGroup('${p.id}')">
          <span class="platoon-group-toggle">${isExpanded ? '▼' : '▶'}</span>
          <span class="platoon-group-name">${p.name}</span>
          <span class="platoon-group-count ${capacityClass}">${capacityStr}</span>
        </div>
        <div class="platoon-group-body" style="display:${isExpanded ? 'block' : 'none'}">
          ${cadetsInPlatoon.length === 0
            ? '<div class="platoon-group-empty">Нет курсантов</div>'
            : cadetsInPlatoon.map(cadet => renderCadetCard(cadet)).join('')
          }
        </div>
      </div>
    `;
  });

  // Render cadets without a platoon
  if (noPlatoon.length > 0 && currentCadetFilter === 'all') {
    const isExpanded = expandedPlatoons['__none__'] || false;
    html += `
      <div class="platoon-group">
        <div class="platoon-group-header ${isExpanded ? 'expanded' : ''}" onclick="togglePlatoonGroup('__none__')">
          <span class="platoon-group-toggle">${isExpanded ? '▼' : '▶'}</span>
          <span class="platoon-group-name">Без взвода</span>
          <span class="platoon-group-count">${noPlatoon.length}</span>
        </div>
        <div class="platoon-group-body" style="display:${isExpanded ? 'block' : 'none'}">
          ${noPlatoon.map(cadet => renderCadetCard(cadet)).join('')}
        </div>
      </div>
    `;
  }

  container.innerHTML = html || '<div class="card" style="text-align:center;padding:30px;color:#888"><div>Нет курсантов</div></div>';
}

function togglePlatoonGroup(platoonId) {
  expandedPlatoons[platoonId] = !expandedPlatoons[platoonId];
  renderCadetListGrouped(allCadetsData);
}

function renderCadetCard(cadet) {
  const statusLabels = {
    healthy: 'Здоров',
    warning: 'Внимание',
    injured: 'Ранен',
    critical: 'Критический'
  };

  const marchLabels = {
    moving: 'Движется',
    hold: 'Ожидает',
    separated: 'Отделился',
    stopped: 'Стоит'
  };

  const injuryDetail = cadet.status === 'injured' || cadet.status === 'critical'
    ? `<div class="cadet-card-detail">${cadet.injury.bodyPart || ''} - ${cadet.injury.type || ''} (${cadet.injury.severity || ''})</div>`
    : '';

  const instructionText = cadet.instructionShort || cadet.instruction
    ? `<div class="cadet-card-instruction">📋 ${cadet.instructionShort || cadet.instruction}</div>`
    : '';

  return `
    <div class="cadet-card ${cadet.status || 'healthy'}" onclick="openCadetDetail('${cadet.id}')">
      <div class="cadet-card-header">
        <span class="cadet-card-name">${cadet.name || 'Без имени'}</span>
        <span class="cadet-card-status ${cadet.status || 'healthy'}">${statusLabels[cadet.status] || 'Здоров'}</span>
      </div>
      <div class="cadet-card-detail">
        🚶 ${marchLabels[cadet.marchState] || cadet.marchState}
      </div>
      ${injuryDetail}
      ${instructionText}
    </div>
  `;
}

function showAllCadets() {
  currentCadetFilter = 'all';
  renderCadetListGrouped(allCadetsData);
}

function filterCadets(status) {
  currentCadetFilter = status;
  renderCadetListGrouped(allCadetsData);
}

// ===== PLATOON RENDER (in platoons tab) =====

function renderPlatoonList() {
  const container = document.getElementById('platoon-list');
  if (!container) return;

  if (instructorPlatoons.length === 0) {
    container.innerHTML = `
      <div class="card" style="text-align:center;padding:30px;color:#888">
        <div style="font-size:2rem;margin-bottom:8px">📋</div>
        <div>У вас нет созданных взводов</div>
        <div style="font-size:0.8rem;margin-top:4px">Создайте взвод, чтобы курсанты могли к вам присоединиться</div>
      </div>
    `;
    return;
  }

  // Count cadets per platoon
  const counts = {};
  allCadetsData.forEach(c => {
    const pid = c.platoonId || '__none__';
    counts[pid] = (counts[pid] || 0) + 1;
  });

  container.innerHTML = instructorPlatoons.map(p => {
    const count = counts[p.id] || 0;
    const maxCap = p.maxCadets || 30;
    const capacityClass = count >= maxCap ? 'capacity-full' : (count >= maxCap * 0.8 ? 'capacity-warning' : '');
    return `
    <div class="platoon-card">
      <div class="platoon-card-header">
        <span class="platoon-card-name">${p.name}</span>
        <button class="btn btn-danger btn-sm" onclick="deletePlatoon('${p.id}')" style="width:auto;margin:0;padding:6px 12px">Удалить</button>
      </div>
      ${p.description ? `<div class="platoon-card-desc">${p.description}</div>` : ''}
      <div class="platoon-card-meta">
        <span class="${capacityClass}">Заполнено: ${count}/${maxCap}</span> • Код: ${p.code || '—'} • Создан: ${p.createdAt?.toDate?.()?.toLocaleDateString('ru-RU') || 'недавно'}
      </div>
      <div class="platoon-card-actions">
        <button class="btn btn-secondary btn-sm" onclick="openEditPlatoonModal('${p.id}')" style="width:auto;margin:8px 0 0 0;padding:6px 12px">Изменить лимит</button>
      </div>
    </div>
  `}).join('');
}

function buildCreatePlatoonModal() {
  if (document.getElementById('create-platoon-modal')) return;

  const overlay = document.createElement('div');
  overlay.id = 'create-platoon-modal';
  overlay.className = 'modal-overlay';

  overlay.innerHTML = `
    <div class="modal">
      <h2>Создать взвод</h2>

      <div class="form-group">
        <label>Название взвода *</label>
        <input type="text" id="new-platoon-name" placeholder="Например, 1-й взвод 3-й роты">
      </div>
      <div class="form-group">
        <label>Описание (необязательно)</label>
        <input type="text" id="new-platoon-desc" placeholder="Особые отметки, место дислокации и т.д.">
      </div>
      <div class="form-group">
        <label>Максимум курсантов</label>
        <input type="number" id="new-platoon-max" value="30" min="1" max="200">
      </div>

      <button class="btn btn-primary" onclick="createPlatoon()">Создать</button>
      <button class="btn btn-ghost" onclick="closeCreatePlatoonModal()">Отмена</button>
    </div>
  `;

  document.body.appendChild(overlay);
}

function openCreatePlatoonModal() {
  document.getElementById('new-platoon-name').value = '';
  document.getElementById('new-platoon-desc').value = '';
  document.getElementById('new-platoon-max').value = 30;
  document.getElementById('create-platoon-modal').classList.add('active');
}

function closeCreatePlatoonModal() {
  document.getElementById('create-platoon-modal').classList.remove('active');
}

function createPlatoon() {
  const name = document.getElementById('new-platoon-name').value.trim();
  const description = document.getElementById('new-platoon-desc').value.trim();
  const maxCadets = parseInt(document.getElementById('new-platoon-max').value) || 30;

  if (!name) {
    showError('Введите название взвода');
    return;
  }

  const code = generatePlatoonCode();

  db.collection('platoons').add({
    name: name,
    description: description,
    code: code,
    maxCadets: maxCadets,
    instructorId: currentUser.uid,
    instructorName: '',
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(ref => {
    db.collection('users').doc(currentUser.uid).get().then(doc => {
      if (doc.exists) {
        ref.update({ instructorName: doc.data().name || '' });
      }
    });
    closeCreatePlatoonModal();
    logEvent('platoon_created', { platoonId: ref.id, name, code, maxCadets });
  }).catch(err => {
    console.error('Failed to create platoon:', err);
    showError('Ошибка создания взвода');
  });
}

function generatePlatoonCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function deletePlatoon(platoonId) {
  const confirmed = confirm('Удалить взвод? Курсанты этого взвода останутся в системе, но потеряют привязку.');
  if (!confirmed) return;

  db.collection('platoons').doc(platoonId).delete()
    .then(() => {
      logEvent('platoon_deleted', { platoonId });
    })
    .catch(err => {
      console.error('Failed to delete platoon:', err);
      showError('Ошибка удаления взвода');
    });
}

// ===== EDIT PLATOON CAPACITY =====

function buildEditPlatoonModal() {
  if (document.getElementById('edit-platoon-modal')) return;

  const overlay = document.createElement('div');
  overlay.id = 'edit-platoon-modal';
  overlay.className = 'modal-overlay';

  overlay.innerHTML = `
    <div class="modal">
      <h2>Изменить лимит взвода</h2>

      <div class="form-group">
        <label>Максимум курсантов</label>
        <input type="number" id="edit-platoon-max" min="1" max="200">
      </div>

      <button class="btn btn-primary" onclick="savePlatoonCapacity()">Сохранить</button>
      <button class="btn btn-ghost" onclick="closeEditPlatoonModal()">Отмена</button>
    </div>
  `;

  document.body.appendChild(overlay);
}

let editingPlatoonId = null;

function openEditPlatoonModal(platoonId) {
  editingPlatoonId = platoonId;
  const platoon = instructorPlatoons.find(p => p.id === platoonId);
  if (!platoon) return;

  document.getElementById('edit-platoon-max').value = platoon.maxCadets || 30;
  document.getElementById('edit-platoon-modal').classList.add('active');
}

function closeEditPlatoonModal() {
  editingPlatoonId = null;
  document.getElementById('edit-platoon-modal').classList.remove('active');
}

function savePlatoonCapacity() {
  if (!editingPlatoonId) return;

  const maxCadets = parseInt(document.getElementById('edit-platoon-max').value) || 30;

  db.collection('platoons').doc(editingPlatoonId).update({ maxCadets })
    .then(() => {
      closeEditPlatoonModal();
      logEvent('platoon_updated', { platoonId: editingPlatoonId, maxCadets });
    })
    .catch(err => {
      console.error('Failed to update platoon:', err);
      showError('Ошибка обновления лимита');
    });
}

// ===== CADET DETAIL MODAL =====

function buildCadetDetailModal() {
  if (document.getElementById('cadet-detail-modal')) return;

  const overlay = document.createElement('div');
  overlay.id = 'cadet-detail-modal';
  overlay.className = 'modal-overlay';

  overlay.innerHTML = `
    <div class="modal">
      <h2 id="detail-name">Курсант</h2>

      <div class="cadet-detail-info" id="detail-info">
        <div class="row">
          <span class="label">Статус</span>
          <span class="value" id="detail-status">-</span>
        </div>
        <div class="row">
          <span class="label">Движение</span>
          <span class="value" id="detail-march">-</span>
        </div>
        <div class="row">
          <span class="label">Ранение</span>
          <span class="value" id="detail-injury">Нет</span>
        </div>
        <div class="row">
          <span class="label">Взвод</span>
          <span class="value" id="detail-platoon">-</span>
        </div>
      </div>

      <div style="font-size:0.8rem;font-weight:700;text-transform:uppercase;color:#aaa;margin-bottom:8px">Управление статусом</div>
      <div class="status-control-grid">
        <button class="btn btn-success btn-sm" onclick="instructorSetStatus('healthy')">Здоров</button>
        <button class="btn btn-warning btn-sm" onclick="instructorSetStatus('warning')">Внимание</button>
        <button class="btn btn-danger btn-sm" onclick="instructorSetStatus('injured')">Ранен</button>
        <button class="btn btn-danger btn-sm" onclick="instructorSetStatus('critical')">Критический</button>
      </div>

      <div style="font-size:0.8rem;font-weight:700;text-transform:uppercase;color:#aaa;margin-bottom:8px">Действия</div>
      <button class="btn btn-danger btn-sm" onclick="removeCadetFromPlatoon()" id="detail-remove-btn">Удалить из взвода</button>

      <div style="font-size:0.8rem;font-weight:700;text-transform:uppercase;color:#aaa;margin-bottom:8px;margin-top:12px">Отправить инструкцию</div>

      <div class="instruct-input-group">
        <input type="text" id="instruct-input" placeholder="Введите инструкцию..." onkeydown="if(event.key==='Enter')sendInstruction()">
        <button class="btn btn-secondary btn-sm" onclick="sendInstruction()">Отправить</button>
      </div>

      <div class="quick-instruct">
        ${Object.entries(INSTRUCTOR_SCENARIOS).map(([key, sc]) =>
          `<button class="btn btn-secondary btn-sm" onclick="quickScenarioInstruction('${key}')">${sc.label}</button>`
        ).join('')}
      </div>

      <div style="font-size:0.8rem;font-weight:700;text-transform:uppercase;color:#aaa;margin-bottom:8px;margin-top:12px">История статусов</div>
      <div class="events-log" id="detail-status-history">
        <div style="color:#666;font-style:italic">Загрузка...</div>
      </div>

      <div style="font-size:0.8rem;font-weight:700;text-transform:uppercase;color:#aaa;margin-bottom:8px;margin-top:12px">История событий</div>
      <div class="events-log" id="detail-events">
        <div style="color:#666;font-style:italic">Загрузка...</div>
      </div>

      <button class="btn btn-ghost" onclick="closeCadetDetail()">Закрыть</button>
    </div>
  `;

  document.body.appendChild(overlay);
  buildEditPlatoonModal();
}

function openCadetDetail(cadetId) {
  selectedCadetId = cadetId;

  db.collection('users').doc(cadetId).get().then(doc => {
    if (!doc.exists) return;
    const data = doc.data();

    const statusLabels = { healthy: 'Здоров', warning: 'Внимание', injured: 'Ранен', critical: 'Критический' };
    const marchLabels = { moving: 'Движется', hold: 'Ожидает', separated: 'Отделился', stopped: 'Стоит' };

    document.getElementById('detail-name').textContent = data.name || 'Курсант';
    document.getElementById('detail-status').textContent = statusLabels[data.status] || data.status;
    document.getElementById('detail-march').textContent = marchLabels[data.marchState] || data.marchState;

    const injuryText = (data.injury && data.injury.type)
      ? `${data.injury.bodyPart} - ${data.injury.type} (${data.injury.severity})`
      : 'Нет';
    document.getElementById('detail-injury').textContent = injuryText;

    const platoonInfo = instructorPlatoons.find(p => p.id === data.platoonId);
    document.getElementById('detail-platoon').textContent =
      platoonInfo ? platoonInfo.name : (data.platoonName || '—');

    // Show/hide remove button based on whether cadet has a platoon
    const removeBtn = document.getElementById('detail-remove-btn');
    if (removeBtn) {
      removeBtn.style.display = data.platoonId ? 'flex' : 'none';
    }

    document.getElementById('instruct-input').value = '';
  });

  loadCadetEvents(cadetId);
  loadStatusHistory(cadetId);

  document.getElementById('cadet-detail-modal').classList.add('active');
}

function closeCadetDetail() {
  selectedCadetId = null;
  document.getElementById('cadet-detail-modal').classList.remove('active');
}

// ===== REMOVE CADET FROM PLATOON =====

function removeCadetFromPlatoon() {
  if (!selectedCadetId || !currentUser) return;

  const confirmed = confirm('Удалить курсанта из взвода? Курсант останется в системе, но потеряет привязку к взводу и инструктору.');
  if (!confirmed) return;

  const update = {
    platoonId: '',
    instructorId: '',
    platoonName: '',
    platoonPending: false,
    lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
  };

  db.collection('users').doc(selectedCadetId).update(update)
    .then(() => {
      logEvent('cadet_removed_from_platoon', { cadetId: selectedCadetId });
      closeCadetDetail();
    })
    .catch(err => {
      console.error('Failed to remove cadet:', err);
      showError('Ошибка удаления курсанта из взвода');
    });
}

// ===== EVENTS & STATUS HISTORY =====

function loadCadetEvents(cadetId) {
  const container = document.getElementById('detail-events');

  getUserEvents(cadetId, 20).then(events => {
    if (events.length === 0) {
      container.innerHTML = '<div style="color:#666;font-style:italic">Нет событий</div>';
      return;
    }

    container.innerHTML = events.map(e => {
      const time = e.timestamp?.toDate ? e.timestamp.toDate().toLocaleString('ru-RU') : '';
      const typeLabels = {
        march_state_change: 'Смена движения',
        injury_reported: 'Ранение',
        instruction_sent: 'Инструкция',
        status_change: 'Смена статуса'
      };
      let payloadStr = '';
      if (e.payload) {
        if (typeof e.payload === 'object') {
          payloadStr = Object.entries(e.payload)
            .filter(([k]) => !['previousStatus', 'newStatus'].includes(k))
            .map(([k, v]) => `${k}: ${v}`)
            .join(', ');
        } else {
          payloadStr = String(e.payload);
        }
      }
      return `<div class="event-item">[${time}] <strong>${typeLabels[e.type] || e.type}</strong>: ${payloadStr}</div>`;
    }).join('');
  }).catch(err => {
    console.warn('Events load error:', err);
    container.innerHTML = '<div style="color:#666;font-style:italic">Ошибка загрузки событий. Необходимо создать составной индекс в Firebase Console.</div>';
  });
}

function loadStatusHistory(cadetId) {
  const container = document.getElementById('detail-status-history');

  getStatusHistory(cadetId, 30).then(history => {
    if (history.length === 0) {
      container.innerHTML = '<div style="color:#666;font-style:italic">История статусов пуста</div>';
      return;
    }

    const statusLabels = {
      healthy: 'Здоров',
      warning: 'Внимание',
      injured: 'Ранен',
      critical: 'Критический'
    };

    container.innerHTML = history.map(h => {
      const time = h.timestamp?.toDate ? h.timestamp.toDate().toLocaleString('ru-RU') : '';
      const from = statusLabels[h.previousStatus] || h.previousStatus || '—';
      const to = statusLabels[h.newStatus] || h.newStatus;
      const by = h.changedByName || 'неизвестно';
      const reason = h.reason ? ` (${h.reason})` : '';
      return `<div class="event-item">[${time}] <strong>${from} → ${to}</strong>${reason} — ${by}</div>`;
    }).join('');
  }).catch(err => {
    console.warn('Status history load error:', err);
    // Show helpful error message with instructions
    container.innerHTML = `
      <div style="color:#e94560;font-style:italic;padding:8px">
        Ошибка загрузки истории статусов.
        <div style="margin-top:8px;font-size:0.7rem;color:#aaa">
          Для работы истории статусов необходимо создать составной индекс в Firebase Console:
          <br><br>
          1. Откройте <a href="https://console.firebase.google.com" target="_blank" style="color:#e94560">Firebase Console</a>
          <br>
          2. Перейдите в Firestore Database → Indexes
          <br>
          3. Создайте составной индекс:
          <br>
          &nbsp;&nbsp;Collection: <strong>statusHistory</strong>
          <br>
          &nbsp;&nbsp;Fields: <strong>userId</strong> (Ascending), <strong>timestamp</strong> (Descending)
          <br><br>
          Или нажмите на ссылку в консоли браузера, когда появится ошибка.
        </div>
      </div>
    `;
  });
}

// ===== INSTRUCTOR STATUS CONTROL =====

function instructorSetStatus(newStatus) {
  if (!selectedCadetId || !currentUser) return;

  const statusLabels = {
    healthy: 'Здоров',
    warning: 'Внимание',
    injured: 'Ранен',
    critical: 'Критический'
  };

  const confirmed = confirm(`Установить статус "${statusLabels[newStatus]}" для этого курсанта?`);
  if (!confirmed) return;

  db.collection('users').doc(selectedCadetId).get().then(doc => {
    if (!doc.exists) return;
    const previousStatus = doc.data().status || 'healthy';

    const update = {
      status: newStatus,
      lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (newStatus === 'healthy') {
      update.injury = { type: '', bodyPart: '', severity: '' };
    }

    return db.collection('users').doc(selectedCadetId).update(update).then(() => {
      logStatusChange(selectedCadetId, previousStatus, newStatus, currentUser.uid, 'Инструктор');
      logEvent('status_change', {
        previousStatus,
        newStatus,
        changedBy: currentUser.uid
      });

      db.collection('users').doc(selectedCadetId).get().then(updatedDoc => {
        if (!updatedDoc.exists) return;
        const data = updatedDoc.data();
        document.getElementById('detail-status').textContent = statusLabels[data.status] || data.status;
        const injuryText = (data.injury && data.injury.type)
          ? `${data.injury.bodyPart} - ${data.injury.type} (${data.injury.severity})`
          : 'Нет';
        document.getElementById('detail-injury').textContent = injuryText;
      });
      loadStatusHistory(selectedCadetId);
    });
  }).catch(err => {
    console.error('Failed to set status:', err);
    showError('Ошибка смены статуса');
  });
}

// ===== INSTRUCTION WITH SCENARIO SUPPORT =====

function sendInstruction() {
  const input = document.getElementById('instruct-input');
  const text = input.value.trim();

  if (!text || !selectedCadetId || !currentUser) return;

  const update = {
    instruction: text,
    instructionShort: text,
    instructionScenario: '',
    instructionFrom: currentUser.uid,
    instructionTime: firebase.firestore.FieldValue.serverTimestamp()
  };

  db.collection('users').doc(selectedCadetId).update(update)
    .then(() => {
      logEvent('instruction_sent', { to: selectedCadetId, text: text, scenario: '' });
      input.value = '';
      loadCadetEvents(selectedCadetId);
    })
    .catch(err => {
      console.error('Failed to send instruction:', err);
    });
}

function quickScenarioInstruction(scenarioKey) {
  if (!selectedCadetId || !currentUser) return;

  const scenario = INSTRUCTOR_SCENARIOS[scenarioKey];
  if (!scenario) return;

  const update = {
    instruction: scenario.short,
    instructionShort: scenario.short,
    instructionScenario: scenarioKey,
    instructionFrom: currentUser.uid,
    instructionTime: firebase.firestore.FieldValue.serverTimestamp()
  };

  db.collection('users').doc(selectedCadetId).update(update)
    .then(() => {
      logEvent('instruction_sent', {
        to: selectedCadetId,
        text: scenario.short,
        scenario: scenarioKey
      });
      document.getElementById('instruct-input').value = '';
      loadCadetEvents(selectedCadetId);
    })
    .catch(err => {
      console.error('Failed to send scenario instruction:', err);
    });
}

function cleanupInstructorListeners() {
  if (instructorUnsubscribe) {
    instructorUnsubscribe();
    instructorUnsubscribe = null;
  }
  if (instructorEventsUnsub) {
    instructorEventsUnsub();
    instructorEventsUnsub = null;
  }
  if (platoonUnsub) {
    platoonUnsub();
    platoonUnsub = null;
  }
}
