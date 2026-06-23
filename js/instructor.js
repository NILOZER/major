// ===== INSTRUCTOR MODULE =====

let instructorUnsubscribe = null;
let selectedCadetId = null;
let instructorEventsUnsub = null;

// Quick instructions for quick send
const QUICK_INSTRUCTIONS = [
  'Оказать первую помощь',
  'Переместиться в укрытие',
  'Ожидать эвакуации',
  'Сохранять позицию',
  'Продолжать движение',
  'Отойти в тыл',
  'Доложить обстановку'
];

function initInstructorScreen() {
  const screen = document.getElementById('instructor-screen');
  screen.innerHTML = `
    <div class="screen-header">
      <h1>Панель инструктора</h1>
      <p>Мониторинг курсантов в реальном времени</p>
    </div>

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
  `;

  // Build detail modal
  buildCadetDetailModal();

  // Start listening for cadet data
  listenToCadets();
}

function listenToCadets() {
  if (instructorUnsubscribe) instructorUnsubscribe();

  instructorUnsubscribe = db.collection('users')
    .where('role', '==', 'cadet')
    .onSnapshot(snapshot => {
      const cadets = [];
      snapshot.forEach(doc => {
        cadets.push({ id: doc.id, ...doc.data() });
      });
      renderCadetList(cadets);
    }, err => {
      console.warn('Instructor listener error:', err);
      document.getElementById('cadet-list').innerHTML = '<div class="loading">Ошибка загрузки. Проверьте подключение.</div>';
    });
}

let currentCadetFilter = 'all';
let allCadetsData = [];

function renderCadetList(cadets) {
  allCadetsData = cadets;

  let filtered = cadets;
  if (currentCadetFilter !== 'all') {
    filtered = cadets.filter(c => c.status === currentCadetFilter);
  }

  const container = document.getElementById('cadet-list');

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="card" style="text-align:center;padding:30px;color:#888">
        <div style="font-size:2rem;margin-bottom:8px">${cadets.length === 0 ? '👤' : '✅'}</div>
        <div>${cadets.length === 0 ? 'Нет зарегистрированных курсантов' : 'Нет курсантов с таким статусом'}</div>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(cadet => {
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

    const instructionText = cadet.instruction
      ? `<div class="cadet-card-instruction">📋 ${cadet.instruction}</div>`
      : '';

    return `
      <div class="cadet-card ${cadet.status || 'healthy'}" onclick="openCadetDetail('${cadet.id}')">
        <div class="cadet-card-header">
          <span class="cadet-card-name">${cadet.name || 'Без имени'}</span>
          <span class="cadet-card-status ${cadet.status || 'healthy'}">${statusLabels[cadet.status] || 'Здоров'}</span>
        </div>
        <div class="cadet-card-detail">🚶 ${marchLabels[cadet.marchState] || cadet.marchState}</div>
        ${injuryDetail}
        ${instructionText}
      </div>
    `;
  }).join('');
}

function showAllCadets() {
  currentCadetFilter = 'all';
  renderCadetList(allCadetsData);
}

function filterCadets(status) {
  currentCadetFilter = status;
  renderCadetList(allCadetsData);
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
      </div>

      <div style="font-size:0.8rem;font-weight:700;text-transform:uppercase;color:#aaa;margin-bottom:8px">Отправить инструкцию</div>

      <div class="instruct-input-group">
        <input type="text" id="instruct-input" placeholder="Введите инструкцию..." onkeydown="if(event.key==='Enter')sendInstruction()">
        <button class="btn btn-secondary btn-sm" onclick="sendInstruction()">Отправить</button>
      </div>

      <div class="quick-instruct">
        ${QUICK_INSTRUCTIONS.map(text =>
          `<button class="btn btn-secondary btn-sm" onclick="quickInstruction('${text}')">${text}</button>`
        ).join('')}
      </div>

      <div style="font-size:0.8rem;font-weight:700;text-transform:uppercase;color:#aaa;margin-bottom:8px;margin-top:12px">История событий</div>
      <div class="events-log" id="detail-events">
        <div style="color:#666;font-style:italic">Загрузка...</div>
      </div>

      <button class="btn btn-ghost" onclick="closeCadetDetail()">Закрыть</button>
    </div>
  `;

  document.body.appendChild(overlay);
}

function openCadetDetail(cadetId) {
  selectedCadetId = cadetId;

  // Load cadet data
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

    document.getElementById('instruct-input').value = '';
  });

  // Load events for this cadet
  loadCadetEvents(cadetId);

  document.getElementById('cadet-detail-modal').classList.add('active');
}

function closeCadetDetail() {
  selectedCadetId = null;
  document.getElementById('cadet-detail-modal').classList.remove('active');
}

function loadCadetEvents(cadetId) {
  const container = document.getElementById('detail-events');

  getUserEvents(cadetId, 30).then(events => {
    if (events.length === 0) {
      container.innerHTML = '<div style="color:#666;font-style:italic">Нет событий</div>';
      return;
    }

    container.innerHTML = events.map(e => {
      const time = e.timestamp?.toDate ? e.timestamp.toDate().toLocaleTimeString('ru-RU') : '';
      const typeLabels = {
        march_state_change: 'Смена движения',
        injury_reported: 'Ранение',
        instruction_sent: 'Инструкция',
        status_change: 'Смена статуса'
      };
      return `<div class="event-item">[${time}] <strong>${typeLabels[e.type] || e.type}</strong>: ${JSON.stringify(e.payload || '')}</div>`;
    }).join('');
  }).catch(() => {
    container.innerHTML = '<div style="color:#666;font-style:italic">Ошибка загрузки событий</div>';
  });
}

function sendInstruction() {
  const input = document.getElementById('instruct-input');
  const text = input.value.trim();

  if (!text || !selectedCadetId || !currentUser) return;

  const update = {
    instruction: text,
    instructionFrom: currentUser.uid,
    instructionTime: firebase.firestore.FieldValue.serverTimestamp()
  };

  db.collection('users').doc(selectedCadetId).update(update)
    .then(() => {
      logEvent('instruction_sent', { to: selectedCadetId, text: text });
      input.value = '';
      // Reload events
      loadCadetEvents(selectedCadetId);
    })
    .catch(err => {
      console.error('Failed to send instruction:', err);
    });
}

function quickInstruction(text) {
  document.getElementById('instruct-input').value = text;
  sendInstruction();
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
}
