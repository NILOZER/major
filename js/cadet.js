// ===== CADET MODULE =====

let cadetUnsubscribe = null;
let selectedBodyPart = null;
let selectedInjuryType = null;
let selectedSeverity = null;
let bodyChartInstance = null;
let currentChartView = 'FRONT';

// ===== BODY MUSCLES MAPPING =====
// Maps body-muscles library muscle IDs → our simplified body part keys
const BODY_MUSCLES_MAP = {
  head: ['head', 'face', 'head-back', 'nape'],
  neck: ['neck-right', 'neck-left'],
  chest: ['chest-upper-left', 'chest-lower-left', 'chest-upper-right', 'chest-lower-right', 'spine'],
  abdomen: ['abs-upper-left', 'abs-upper-right', 'abs-lower-left', 'abs-lower-right',
    'obliques-left', 'obliques-right', 'serratus-anterior-left', 'serratus-anterior-right',
    'lower-back-erectors-left', 'lower-back-erectors-right', 'lower-back-ql-left', 'lower-back-ql-right'],
  shoulder_left: ['shoulder-front-left', 'shoulder-side-left', 'deltoid-rear-left',
    'traps-upper-left', 'traps-mid-left', 'traps-lower-left',
    'lats-upper-left', 'lats-mid-left', 'lats-lower-left'],
  shoulder_right: ['shoulder-front-right', 'shoulder-side-right', 'deltoid-rear-right',
    'traps-upper-right', 'traps-mid-right', 'traps-lower-right',
    'lats-upper-right', 'lats-mid-right', 'lats-lower-right'],
  forearm_left: ['forearm-left', 'forearm-flexors-left', 'forearm-extensors-left',
    'elbow-left', 'biceps-left', 'triceps-long-left', 'triceps-lateral-left'],
  forearm_right: ['forearm-right', 'forearm-flexors-right', 'forearm-extensors-right',
    'elbow-right', 'biceps-right', 'triceps-long-right', 'triceps-lateral-right'],
  hand_left: ['hand-left', 'hand-back-left'],
  hand_right: ['hand-right', 'hand-back-right'],
  thigh_left: ['quads-left', 'adductors-left', 'hip-flexor-left',
    'hamstrings-medial-left', 'hamstrings-lateral-left',
    'gluteus-medius-left', 'gluteus-maximus-left'],
  thigh_right: ['quads-right', 'adductors-right', 'hip-flexor-right',
    'hamstrings-medial-right', 'hamstrings-lateral-right',
    'gluteus-medius-right', 'gluteus-maximus-right'],
  knee_left: ['knee-left', 'knee-back-left'],
  knee_right: ['knee-right', 'knee-back-right'],
  shin_left: ['tibialis-anterior-left', 'calves-gastroc-medial-left',
    'calves-gastroc-lateral-left', 'calves-soleus-left'],
  shin_right: ['tibialis-anterior-right', 'calves-gastroc-medial-right',
    'calves-gastroc-lateral-right', 'calves-soleus-right'],
  foot_left: ['foot-left', 'foot-back-left'],
  foot_right: ['foot-right', 'foot-back-right']
};

// Build reverse lookup: muscleId → our bodyPartKey
const MUSCLE_TO_BODYPART = {};
for (const [part, muscles] of Object.entries(BODY_MUSCLES_MAP)) {
  for (const m of muscles) {
    MUSCLE_TO_BODYPART[m] = part;
  }
}

// All muscle IDs in the library (for bodyState initialization)
const ALL_MUSCLE_IDS = [...new Set(Object.values(BODY_MUSCLES_MAP).flat())];

// Russian labels for body parts
const bodyPartLabels = {
  head: 'Голова',
  neck: 'Шея',
  chest: 'Грудная клетка',
  abdomen: 'Живот',
  shoulder_left: 'Левое плечо',
  shoulder_right: 'Правое плечо',
  forearm_left: 'Левое предплечье',
  forearm_right: 'Правое предплечье',
  hand_left: 'Левая кисть',
  hand_right: 'Правая кисть',
  thigh_left: 'Левое бедро',
  thigh_right: 'Правое бедро',
  knee_left: 'Левое колено',
  knee_right: 'Правое колено',
  shin_left: 'Левая голень',
  shin_right: 'Правая голень',
  foot_left: 'Левая стопа',
  foot_right: 'Правая стопа'
};

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

    <div class="card platoon-change-card" style="margin-top:16px">
      <div style="font-size:0.75rem;text-transform:uppercase;color:#888;margin-bottom:8px;font-weight:700">Мой взвод</div>
      <div id="cadet-platoon-display" class="cadet-platoon-info">Загрузка...</div>
      <button class="btn btn-secondary btn-sm" onclick="openChangePlatoonModal()" style="margin-top:8px">Сменить взвод</button>
    </div>
  `;

  // Start listening to cadet data
  listenToCadetData();

  // Build injury modal
  buildInjuryModal();

  // Build change platoon modal
  buildChangePlatoonModal();
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

      // Update platoon info
      const platoonEl = document.getElementById('cadet-platoon-display');
      if (data.platoonId) {
        db.collection('platoons').doc(data.platoonId).get().then(pDoc => {
          if (pDoc.exists) {
            const pData = pDoc.data();
            platoonEl.innerHTML = `<strong>${pData.name}</strong>${pData.description ? '<br><span style="font-size:0.8rem;color:#888">' + pData.description + '</span>' : ''}`;
          } else {
            platoonEl.textContent = data.platoonName || 'Взвод удалён';
          }
        }).catch(() => {
          platoonEl.textContent = data.platoonName || 'Взвод удалён';
        });
      } else if (data.platoonName) {
        platoonEl.textContent = data.platoonName + ' (ожидает назначения)';
      } else {
        platoonEl.textContent = 'Не прикреплен к взводу';
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

// ===== BODY CHART HELPERS =====

function buildEmptyBodyState() {
  const state = {};
  for (const id of ALL_MUSCLE_IDS) {
    state[id] = BodyMuscles.createBodyPartState(0, false);
  }
  return state;
}

function getSelectedBodyState() {
  const state = buildEmptyBodyState();
  if (selectedBodyPart) {
    const muscles = BODY_MUSCLES_MAP[selectedBodyPart] || [];
    for (const m of muscles) {
      if (state[m]) {
        state[m] = BodyMuscles.createBodyPartState(0, true);
      }
    }
  }
  return state;
}

function toggleBodyChartView() {
  if (!bodyChartInstance) return;
  currentChartView = currentChartView === 'FRONT' ? 'BACK' : 'FRONT';

  // Update view toggle buttons
  document.querySelectorAll('.view-toggle-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.view-toggle-btn[data-view="${currentChartView}"]`).classList.add('active');

  // Update the chart view while preserving selection state
  bodyChartInstance.update({ view: currentChartView, bodyState: getSelectedBodyState() });
}

function handleBodyChartClick(muscleId) {
  if (!muscleId) return;
  // Look up which body part this muscle belongs to
  const part = MUSCLE_TO_BODYPART[muscleId];
  if (!part) return;
  selectBodyPart(part);
}

// ===== INJURY MODAL =====

function buildInjuryModal() {
  // Prevent duplicate modal
  if (document.getElementById('injury-modal')) return;

  const overlay = document.createElement('div');
  overlay.id = 'injury-modal';
  overlay.className = 'modal-overlay';

  overlay.innerHTML = `
    <div class="modal injury-modal-wide">
      <h2>Фиксация ранения</h2>

      <div class="injury-section">
        <div class="section-label">Часть тела</div>

        <!-- View toggle -->
        <div class="body-chart-view-toggle">
          <button class="view-toggle-btn active" data-view="FRONT" onclick="toggleBodyChartView()">Спереди</button>
          <button class="view-toggle-btn" data-view="BACK" onclick="toggleBodyChartView()">Сзади</button>
        </div>

        <!-- BodyChart container -->
        <div id="body-chart-container" class="body-chart-container-inmodal"></div>

        <!-- Text labels below the chart -->
        <div class="body-map-labels" id="body-chart-labels"></div>

        <!-- Selected part display -->
        <div id="selected-body-part-display" class="selected-part-display">Часть не выбрана</div>
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

function initBodyChart() {
  const container = document.getElementById('body-chart-container');
  if (!container) return;

  // Clear any previous content
  container.innerHTML = '';

  // Build labels
  buildBodyChartLabels();

  // Create initial body state (nothing selected)
  const bodyState = buildEmptyBodyState();

  try {
    bodyChartInstance = new BodyMuscles.BodyChart(container, {
      view: currentChartView,
      bodyState: bodyState,
      showViewLabel: false,
      enableTransitions: true,
      onMuscleClick: (muscleId) => {
        handleBodyChartClick(muscleId);
      },
      onMuscleHover: (muscleId) => {
        // Could show tooltip
      }
    });
  } catch (e) {
    console.error('Failed to init BodyChart:', e);
    container.innerHTML = '<div style="color:#c0392b;padding:20px;text-align:center">Ошибка загрузки силуэта</div>';
  }
}

function buildBodyChartLabels() {
  const labelsContainer = document.getElementById('body-chart-labels');
  if (!labelsContainer) return;

  labelsContainer.innerHTML = '';
  for (const [part, label] of Object.entries(bodyPartLabels)) {
    const span = document.createElement('span');
    span.className = 'bml-label' + (part === selectedBodyPart ? ' selected' : '');
    span.dataset.part = part;
    span.textContent = label;
    span.addEventListener('click', () => selectBodyPart(part));
    labelsContainer.appendChild(span);
  }
}

function openInjuryModal() {
  selectedBodyPart = null;
  selectedInjuryType = null;
  selectedSeverity = null;
  currentChartView = 'FRONT';

  // Init BodyChart
  initBodyChart();

  // Reset UI
  document.getElementById('submit-injury-btn').disabled = true;
  const display = document.getElementById('selected-body-part-display');
  if (display) display.textContent = 'Часть не выбрана';

  document.getElementById('injury-modal').classList.add('active');
}

function closeInjuryModal() {
  // Destroy BodyChart instance
  if (bodyChartInstance) {
    try {
      bodyChartInstance.destroy();
    } catch (e) {
      // ignore
    }
    bodyChartInstance = null;
  }

  document.getElementById('injury-modal').classList.remove('active');
}

function selectBodyPart(part) {
  if (!part) return;

  selectedBodyPart = part;

  // Update text labels below chart
  document.querySelectorAll('.bml-label').forEach(el => el.classList.remove('selected'));
  document.querySelectorAll(`.bml-label[data-part="${part}"]`).forEach(el => el.classList.add('selected'));

  // Update display text
  const display = document.getElementById('selected-body-part-display');
  if (display) {
    display.textContent = 'Выбрано: ' + (bodyPartLabels[part] || part);
  }

  // Update BodyChart selection
  if (bodyChartInstance) {
    bodyChartInstance.update({ bodyState: getSelectedBodyState() });
  }

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

// ===== PLATOON CHANGE (for cadet) =====

function buildChangePlatoonModal() {
  if (document.getElementById('change-platoon-modal')) return;

  const overlay = document.createElement('div');
  overlay.id = 'change-platoon-modal';
  overlay.className = 'modal-overlay';

  overlay.innerHTML = `
    <div class="modal">
      <h2>Смена взвода</h2>

      <div id="change-platoon-current" class="change-platoon-info">
        Текущий взвод: <strong id="cp-current-name">-</strong>
      </div>

      <div class="form-group">
        <label>Выберите новый взвод</label>
        <select id="cp-platoon-select">
          <option value="">Загрузка взводов...</option>
        </select>
      </div>

      <div id="cp-platoon-capacity" class="change-platoon-capacity"></div>
      <div id="cp-error" class="error-msg" style="display:none"></div>

      <button class="btn btn-primary" id="cp-submit-btn" onclick="changePlatoon()">Сменить взвод</button>
      <button class="btn btn-ghost" onclick="closeChangePlatoonModal()">Отмена</button>
    </div>
  `;

  document.body.appendChild(overlay);
}

function openChangePlatoonModal() {
  // Load current platoon info
  db.collection('users').doc(currentUser.uid).get().then(doc => {
    if (!doc.exists) return;
    const data = doc.data();
    const currentPlatoonEl = document.getElementById('cp-current-name');
    if (data.platoonId) {
      // Try to get platoon name
      db.collection('platoons').doc(data.platoonId).get().then(pDoc => {
        if (pDoc.exists) {
          currentPlatoonEl.textContent = pDoc.data().name || 'Неизвестный взвод';
        } else {
          currentPlatoonEl.textContent = data.platoonName || 'Неизвестный взвод';
        }
      });
    } else {
      currentPlatoonEl.textContent = 'Не прикреплен к взводу';
    }
  });

  // Load available platoons
  loadAvailablePlatoons();

  document.getElementById('change-platoon-modal').classList.add('active');
}

function closeChangePlatoonModal() {
  document.getElementById('change-platoon-modal').classList.remove('active');
}

function loadAvailablePlatoons() {
  const select = document.getElementById('cp-platoon-select');
  const capacityEl = document.getElementById('cp-platoon-capacity');
  const errorEl = document.getElementById('cp-error');

  select.innerHTML = '<option value="">Загрузка...</option>';
  select.disabled = true;
  capacityEl.innerHTML = '';
  errorEl.style.display = 'none';

  getAllPlatoons().then(platoons => {
    select.disabled = false;

    if (platoons.length === 0) {
      select.innerHTML = '<option value="">Нет доступных взводов</option>';
      return;
    }

    // Get current user data to exclude own platoon
    db.collection('users').doc(currentUser.uid).get().then(userDoc => {
      const currentPlatoonId = userDoc.exists ? userDoc.data().platoonId : null;

      // Count cadets per platoon in real-time
      const counts = {};
      return db.collection('users')
        .where('role', '==', 'cadet')
        .get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            const pid = doc.data().platoonId || '__none__';
            counts[pid] = (counts[pid] || 0) + 1;
          });

          // Group by instructor
          const grouped = {};
          platoons.forEach(p => {
            if (p.id === currentPlatoonId) return; // exclude current
            const maxCap = p.maxCadets || 30;
            const cadetCount = counts[p.id] || 0;
            if (cadetCount >= maxCap) return; // platoon is full

            const instructorName = p.instructorName || 'Инструктор';
            if (!grouped[instructorName]) grouped[instructorName] = [];
            grouped[instructorName].push({ ...p, cadetCount, maxCap });
          });

          let html = '<option value="">Выберите взвод</option>';
          Object.entries(grouped).forEach(([instructorName, plist]) => {
            if (plist.length === 0) return;
            html += `<optgroup label="${instructorName}">`;
            plist.forEach(p => {
              const desc = p.description ? ` (${p.description})` : '';
              html += `<option value="${p.id}" data-max="${p.maxCap}" data-count="${p.cadetCount}">${p.name}${desc} [${p.cadetCount}/${p.maxCap}]</option>`;
            });
            html += '</optgroup>';
          });

          select.innerHTML = html || '<option value="">Нет доступных взводов</option>';

          // Listen to platoon selection change
          select.onchange = function() {
            const selectedOption = select.options[select.selectedIndex];
            const maxCap = selectedOption?.getAttribute('data-max');
            const count = selectedOption?.getAttribute('data-count');
            if (selectedOption && selectedOption.value) {
              capacityEl.innerHTML = `Заполнено: ${count}/${maxCap}`;
              errorEl.style.display = 'none';
            } else {
              capacityEl.innerHTML = '';
            }
          };
        });
    });
  }).catch(err => {
    console.warn('Failed to load platoons:', err);
    select.disabled = false;
    select.innerHTML = '<option value="">Ошибка загрузки</option>';
  });
}

function changePlatoon() {
  if (!currentUser) return;

  const select = document.getElementById('cp-platoon-select');
  const platoonId = select.value;
  const errorEl = document.getElementById('cp-error');

  if (!platoonId) {
    errorEl.textContent = 'Выберите взвод';
    errorEl.style.display = 'block';
    return;
  }

  // Double-check capacity
  db.collection('platoons').doc(platoonId).get().then(pDoc => {
    if (!pDoc.exists) {
      errorEl.textContent = 'Взвод не найден';
      errorEl.style.display = 'block';
      return;
    }

    const platoonData = pDoc.data();
    const maxCap = platoonData.maxCadets || 30;

    // Count current cadets in this platoon
    return db.collection('users')
      .where('role', '==', 'cadet')
      .where('platoonId', '==', platoonId)
      .get()
      .then(snapshot => {
        const count = snapshot.size;
        if (count >= maxCap) {
          errorEl.textContent = 'Этот взвод уже заполнен. Выберите другой.';
          errorEl.style.display = 'block';
          return Promise.reject('Platoon full');
        }

        // Proceed with change
        const update = {
          platoonId: platoonId,
          instructorId: platoonData.instructorId || '',
          platoonName: platoonData.name || '',
          platoonPending: false,
          lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
        };

        return db.collection('users').doc(currentUser.uid).update(update);
      });
  }).then(() => {
    logEvent('platoon_changed', { newPlatoonId: platoonId });
    closeChangePlatoonModal();
  }).catch(err => {
    if (err === 'Platoon full') return;
    console.error('Failed to change platoon:', err);
    errorEl.textContent = 'Ошибка смены взвода';
    errorEl.style.display = 'block';
  });
}
