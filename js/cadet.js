// ===== CADET MODULE =====

let cadetUnsubscribe = null;
let selectedBodyPart = null;
let selectedInjuryType = null;
let selectedSeverity = null;

// Scenario-based instructions
const INSTRUCTION_SCENARIOS = {
  'first_aid': {
    short: 'Оказать первую помощь',
    detailed: [
      '1. Оцени обстановку и убедись в отсутствии угрозы для себя.',
      '2. Определи источник кровотечения и тип ранения.',
      '3. Наложи давящую повязку или жгут выше места ранения.',
      '4. Запиши время наложения жгута (на коже или повязке).',
      '5. При необходимости наложи шину на поврежденную конечность.',
      '6. Укрой пострадавшего термоодеялом для предотвращения переохлаждения.',
      '7. Доложи инструктору о выполненных действиях и состоянии.'
    ]
  },
  'cover_move': {
    short: 'Переместиться в укрытие',
    detailed: [
      '1. Осмотри местность и выбери ближайшее укрытие.',
      '2. Перед началом движения оцени направление ветра и безопасный маршрут.',
      '3. Передвигайся короткими перебежками (5–7 секунд).',
      '4. Каждое укрытие проверяй на наличие взрывных устройств.',
      '5. После занятия укрытия осмотрись и доложи "На месте".',
      '6. Ожидай дальнейших указаний инструктора.',
      '7. Будь готов к смене позиции по команде.'
    ]
  },
  'wait_evac': {
    short: 'Ожидать эвакуации',
    detailed: [
      '1. Займи безопасную позицию с обзором подходов.',
      '2. Укройся за естественным или искусственным препятствием.',
      '3. Подготовь сигнальные средства (фонарь, свисток, дым).',
      '4. Наблюдай за обстановкой в секторе 360 градусов.',
      '5. При обнаружении противника — доложи без шума.',
      '6. Экономь ресурсы: вода, питание, боеприпасы.',
      '7. Ожидай прибытия эвакуационной группы.'
    ]
  },
  'hold_position': {
    short: 'Сохранять позицию',
    detailed: [
      '1. Закрепись на текущей позиции.',
      '2. Организуй круговую оборону (сектора наблюдения).',
      '3. Проверь маскировку позиции — исправь при необходимости.',
      '4. Минимизируй движения и шум.',
      '5. Поддерживай радиомолчание, если не указано иное.',
      '6. Докладывай о любых изменениях обстановки.',
      '7. Ожидай смены позиции или сигнала к действию.'
    ]
  },
  'continue_move': {
    short: 'Продолжать движение',
    detailed: [
      '1. Проверь снаряжение и готовность к маршу.',
      '2. Сверь направление движения по компасу/навигатору.',
      '3. Соблюдай дистанцию 5–10 метров между бойцами.',
      '4. Двигайся бесшумно, используя естественные укрытия.',
      '5. Избегай открытых участков местности.',
      '6. Следи за сигналами и жестами направляющего.',
      '7. При остановке — немедленно занять оборону.'
    ]
  },
  'fall_back': {
    short: 'Отойти в тыл',
    detailed: [
      '1. Доложи "Отхожу" своему командиру отделения.',
      '2. Прикройся огнем или дымовой завесой.',
      '3. Отходи по заранее определенному маршруту.',
      '4. Не поворачивайся спиной к вероятному противнику.',
      '5. Используй перекаты и перебежки от укрытия к укрытию.',
      '6. По пути собирай данные о местности и противнике.',
      '7. По прибытии в тыл доложи инструктору.'
    ]
  },
  'report': {
    short: 'Доложить обстановку',
    detailed: [
      '1. Выйди на связь с инструктором по установленному каналу.',
      '2. Доклад по форме: "Я — [позывной], — нахожусь в [координаты] — обстановка [описание]".',
      '3. Сообщи количество личного состава рядом.',
      '4. Доложи о раненых (если есть).',
      '5. Укажи видимые цели и препятствия.',
      '6. Запроси дальнейшие указания.',
      '7. После доклада ожидай подтверждения связи.'
    ]
  }
};

// Initialize cadet screen
function initCadetScreen() {
  const screen = document.getElementById('cadet-screen');
  screen.innerHTML = `
    <div class="screen-header">
      <h1>Курсант</h1>
      <p id="cadet-name-display">...</p>
    </div>

    <div id="cadet-status-badge" class="cadet-status-badge healthy">
      <span class="status-indicator"></span>
      <span>Здоров</span>
    </div>

    <div class="instruction-box">
      <div class="label">Инструкция инструктора</div>
      <div id="cadet-instruction" class="empty">Нет инструкций</div>
    </div>

    <div class="instruction-scenario-box" id="cadet-scenario-box" style="display:none">
      <div class="label">Пошаговый план действий</div>
      <div id="cadet-scenario-content"></div>
    </div>

    <div class="card" style="margin-bottom:12px">
      <div style="font-size:0.75rem;text-transform:uppercase;color:#888;margin-bottom:8px;font-weight:700">Состояние движения</div>
      <div id="cadet-march-display" class="march-state hold">Ожидание</div>
    </div>

    <div style="font-size:0.8rem;font-weight:700;text-transform:uppercase;color:#aaa;margin-bottom:8px">Управление состоянием</div>
    <div class="control-grid">
      <button class="btn btn-success" onclick="updateMarchState('moving')">Движение</button>
      <button class="btn btn-warning" onclick="updateMarchState('hold')">Остановка</button>
      <button class="btn btn-danger" onclick="updateMarchState('separated')">Отделился</button>
      <button class="btn btn-secondary" onclick="updateMarchState('stopped')">Стою</button>
    </div>

    <button class="btn btn-danger" onclick="openInjuryModal()">Ранен</button>
    <button class="btn btn-success" onclick="setSelfRecovered()" id="cadet-recover-btn">Я здоров</button>
  `;

  // Start listening to cadet data
  listenToCadetData();

  // Build injury modal
  buildInjuryModal();
}

// Listen to cadet's own data in real-time
function listenToCadetData() {
  if (cadetUnsubscribe) cadetUnsubscribe();

  cadetUnsubscribe = db.collection('users').doc(currentUser.uid)
    .onSnapshot(doc => {
      if (!doc.exists) return;
      const data = doc.data();

      // Update name display
      document.getElementById('cadet-name-display').textContent = data.name || '';

      // Update status badge
      updateStatusBadge(data.status || 'healthy');

      // Update march state display
      const marchEl = document.getElementById('cadet-march-display');
      const marchLabels = { moving: 'Движение', hold: 'Ожидание', separated: 'Отделился', stopped: 'Стою' };
      marchEl.textContent = marchLabels[data.marchState] || data.marchState;
      marchEl.className = 'march-state ' + (data.marchState || 'hold');

      // Show/hide recover button based on status
      const recoverBtn = document.getElementById('cadet-recover-btn');
      if (recoverBtn) {
        recoverBtn.style.display = (data.status && data.status !== 'healthy') ? 'flex' : 'none';
      }

      // Update instruction - For cadet show DETAILED version
      const instrEl = document.getElementById('cadet-instruction');
      if (data.instruction) {
        instrEl.textContent = data.instruction;
        instrEl.className = 'text';
      } else {
        instrEl.textContent = 'Нет инструкций';
        instrEl.className = 'empty';
      }

      // Show scenario-based detailed instructions
      const scenarioBox = document.getElementById('cadet-scenario-box');
      const scenarioContent = document.getElementById('cadet-scenario-content');
      if (data.instructionScenario && INSTRUCTION_SCENARIOS[data.instructionScenario]) {
        const scenario = INSTRUCTION_SCENARIOS[data.instructionScenario];
        scenarioBox.style.display = 'block';
        scenarioContent.innerHTML = scenario.detailed.map((step, i) =>
          `<div class="scenario-step"><span class="step-num">${i + 1}</span> ${step}</div>`
        ).join('');
      } else {
        scenarioBox.style.display = 'none';
      }
    }, err => {
      console.warn('Cadet listener error:', err);
    });
}

// Update status badge
function updateStatusBadge(status) {
  const badge = document.getElementById('cadet-status-badge');
  const labels = {
    healthy: 'Здоров',
    warning: 'Предупреждение',
    injured: 'Ранен',
    critical: 'Критическое'
  };

  badge.className = 'cadet-status-badge ' + status;
  badge.querySelector('span:last-child').textContent = labels[status] || status;
}

// Update march state
function updateMarchState(state) {
  if (!currentUser) return;

  const update = {
    marchState: state,
    lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
  };

  db.collection('users').doc(currentUser.uid).update(update)
    .then(() => {
      logEvent('march_state_change', { marchState: state });
    })
    .catch(err => {
      console.error('Failed to update march state:', err);
      showError('Ошибка обновления');
    });
}

// Self-recover to healthy
function setSelfRecovered() {
  if (!currentUser) return;

  const confirmed = confirm('Вернуть статус "Здоров"?');
  if (!confirmed) return;

  const previousStatus = document.getElementById('cadet-status-badge').className
    .replace('cadet-status-badge ', '')
    .split(' ')[0];

  const update = {
    status: 'healthy',
    injury: { type: '', bodyPart: '', severity: '' },
    lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
  };

  db.collection('users').doc(currentUser.uid).update(update)
    .then(() => {
      logStatusChange(currentUser.uid, previousStatus, 'healthy', currentUser.uid, 'Самостоятельно');
      logEvent('status_change', { previousStatus, newStatus: 'healthy', reason: 'Самостоятельно' });
    })
    .catch(err => {
      console.error('Failed to set recovered:', err);
      showError('Ошибка смены статуса');
    });
}

// ===== INJURY MODAL =====

const bodyPartLabels = {
  head: 'Голова',
  chest: 'Грудь',
  arm_left: 'Рука левая',
  arm_right: 'Рука правая',
  leg_left: 'Нога левая',
  leg_right: 'Нога правая'
};

function buildInjuryModal() {
  // Prevent duplicate modal
  if (document.getElementById('injury-modal')) return;

  const overlay = document.createElement('div');
  overlay.id = 'injury-modal';
  overlay.className = 'modal-overlay';

  overlay.innerHTML = `
    <div class="modal">
      <h2>Фиксация ранения</h2>

      <div class="injury-section">
        <div class="section-label">Часть тела</div>
        <div class="body-parts" id="body-parts-grid">
          ${Object.entries(bodyPartLabels).map(([key, label]) =>
            `<button class="body-part-btn" data-part="${key}" onclick="selectBodyPart('${key}')">${label}</button>`
          ).join('')}
        </div>
      </div>

      <div class="injury-section">
        <div class="section-label">Тип кровотечения</div>
        <div class="injury-option-grid" id="bleeding-options">
          <button class="injury-opt" data-type="capillary" onclick="selectInjuryType('bleeding', 'capillary', 'Капиллярное')">Капиллярное</button>
          <button class="injury-opt" data-type="venous" onclick="selectInjuryType('bleeding', 'venous', 'Венозное')">Венозное</button>
          <button class="injury-opt" data-type="arterial" onclick="selectInjuryType('bleeding', 'arterial', 'Артериальное')">Артериальное</button>
        </div>
      </div>

      <div class="injury-section">
        <div class="section-label">Огнестрельное</div>
        <div class="injury-option-grid" id="gunshot-options">
          <button class="injury-opt" data-type="through" onclick="selectInjuryType('gunshot', 'through', 'Сквозное')">Сквозное</button>
          <button class="injury-opt" data-type="blind" onclick="selectInjuryType('gunshot', 'blind', 'Слепое')">Слепое</button>
          <button class="injury-opt" data-type="tangential" onclick="selectInjuryType('gunshot', 'tangential', 'Касательное')">Касательное</button>
        </div>
      </div>

      <div class="injury-section">
        <div class="section-label">Другое</div>
        <div class="injury-option-grid" id="other-options">
          <button class="injury-opt" data-type="fracture" onclick="selectInjuryType('other', 'fracture', 'Перелом')">Перелом</button>
          <button class="injury-opt" data-type="burn" onclick="selectInjuryType('other', 'burn', 'Ожог')">Ожог</button>
          <button class="injury-opt" data-type="concussion" onclick="selectInjuryType('other', 'concussion', 'Контузия')">Контузия</button>
        </div>
      </div>

      <div class="injury-section">
        <div class="section-label">Степень тяжести</div>
        <div class="injury-option-grid" id="severity-options">
          <button class="injury-opt" data-severity="mild" onclick="selectSeverity('mild', 'Легкая')">Легкая</button>
          <button class="injury-opt" data-severity="moderate" onclick="selectSeverity('moderate', 'Средняя')">Средняя</button>
          <button class="injury-opt" data-severity="severe" onclick="selectSeverity('severe', 'Тяжелая')">Тяжелая</button>
          <button class="injury-opt" data-severity="critical" onclick="selectSeverity('critical', 'Критическая')">Критическая</button>
        </div>
      </div>

      <button class="btn btn-danger" id="submit-injury-btn" onclick="submitInjury()" disabled>Зафиксировать ранение</button>
      <button class="btn btn-ghost" onclick="closeInjuryModal()">Отмена</button>
    </div>
  `;

  document.body.appendChild(overlay);
}

function openInjuryModal() {
  selectedBodyPart = null;
  selectedInjuryType = null;
  selectedSeverity = null;

  // Reset all selections
  document.querySelectorAll('.body-part-btn').forEach(b => b.classList.remove('selected'));
  document.querySelectorAll('.injury-opt').forEach(b => b.classList.remove('selected'));
  document.getElementById('submit-injury-btn').disabled = true;

  document.getElementById('injury-modal').classList.add('active');
}

function closeInjuryModal() {
  document.getElementById('injury-modal').classList.remove('active');
}

function selectBodyPart(part) {
  selectedBodyPart = part;
  document.querySelectorAll('.body-part-btn').forEach(b => b.classList.remove('selected'));
  document.querySelector(`.body-part-btn[data-part="${part}"]`).classList.add('selected');
  checkInjuryForm();
}

function selectInjuryType(category, type, label) {
  selectedInjuryType = { category, type, label };
  document.querySelectorAll('.injury-opt').forEach(b => b.classList.remove('selected'));
  document.querySelectorAll(`.injury-opt[data-type="${type}"]`).forEach(b => b.classList.add('selected'));
  checkInjuryForm();
}

function selectSeverity(severity, label) {
  selectedSeverity = { severity, label };
  document.querySelectorAll('.injury-opt[data-severity]').forEach(b => b.classList.remove('selected'));
  document.querySelector(`.injury-opt[data-severity="${severity}"]`).classList.add('selected');
  checkInjuryForm();
}

function checkInjuryForm() {
  const btn = document.getElementById('submit-injury-btn');
  btn.disabled = !(selectedBodyPart && selectedInjuryType && selectedSeverity);
}

function submitInjury() {
  if (!selectedBodyPart || !selectedInjuryType || !selectedSeverity || !currentUser) return;

  const injuryData = {
    type: selectedInjuryType.label,
    category: selectedInjuryType.category,
    bodyPart: bodyPartLabels[selectedBodyPart] || selectedBodyPart,
    bodyPartKey: selectedBodyPart,
    severity: selectedSeverity.label,
    severityKey: selectedSeverity.severity
  };

  // Determine overall status based on severity
  let status = 'injured';
  if (selectedSeverity.severity === 'critical') {
    status = 'critical';
  }

  // Get current status for history
  db.collection('users').doc(currentUser.uid).get().then(doc => {
    const previousStatus = doc.exists ? (doc.data().status || 'healthy') : 'healthy';

    const update = {
      status: status,
      injury: injuryData,
      lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
    };

    return db.collection('users').doc(currentUser.uid).update(update).then(() => {
      logStatusChange(currentUser.uid, previousStatus, status, currentUser.uid, 'Самостоятельно');
      logEvent('injury_reported', injuryData);
      closeInjuryModal();
    });
  }).catch(err => {
    console.error('Failed to submit injury:', err);
    showError('Ошибка при отправке данных');
    closeInjuryModal();
  });
}
