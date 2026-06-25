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

// ===== INJURY MODAL =====

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
        <div class="body-map-container" onclick="handleBodyMapClick(event)">
          <svg class="body-map" viewBox="0 0 200 520" xmlns="http://www.w3.org/2000/svg">
            <!-- HEAD: rounded oval -->
            <ellipse class="body-part body-head" data-part="head" cx="100" cy="28" rx="24" ry="26" />
            <!-- NECK: trapezoid neck -->
            <path class="body-part body-neck" data-part="neck" d="M84,54 L116,54 L112,70 L88,70 Z" />
            <!-- LEFT SHOULDER / UPPER ARM -->
            <path class="body-part body-shoulder_left" data-part="shoulder_left" d="M48,75 C42,95 38,115 38,130 L46,132 C46,117 50,100 56,82 Z" />
            <!-- RIGHT SHOULDER / UPPER ARM -->
            <path class="body-part body-shoulder_right" data-part="shoulder_right" d="M152,75 C158,95 162,115 162,130 L154,132 C154,117 150,100 144,82 Z" />
            <!-- CHEST: broad upper torso -->
            <path class="body-part body-chest" data-part="chest" d="M52,72 L148,72 L146,105 L142,125 L138,145 L134,158 L66,158 L62,145 L58,125 L54,105 Z" />
            <!-- ABDOMEN: lower torso / stomach -->
            <path class="body-part body-abdomen" data-part="abdomen" d="M66,158 L134,158 L138,170 L140,185 L138,200 L130,215 L70,215 L62,200 L60,185 L62,170 Z" />
            <!-- LEFT FOREARM -->
            <path class="body-part body-forearm_left" data-part="forearm_left" d="M38,130 C34,155 32,178 32,200 L40,200 C40,180 42,158 46,132 Z" />
            <!-- RIGHT FOREARM -->
            <path class="body-part body-forearm_right" data-part="forearm_right" d="M162,130 C166,155 168,178 168,200 L160,200 C160,180 158,158 154,132 Z" />
            <!-- LEFT HAND -->
            <ellipse class="body-part body-hand_left" data-part="hand_left" cx="36" cy="210" rx="8" ry="12" />
            <!-- RIGHT HAND -->
            <ellipse class="body-part body-hand_right" data-part="hand_right" cx="164" cy="210" rx="8" ry="12" />
            <!-- LEFT THIGH -->
            <path class="body-part body-thigh_left" data-part="thigh_left" d="M68,215 C66,240 64,262 64,280 L58,282 C58,260 60,238 62,215 Z" />
            <path class="body-part body-thigh_left" data-part="thigh_left" d="M70,215 L82,220 L86,260 L84,290 L76,290 L74,260 L68,235 Z" />
            <!-- RIGHT THIGH -->
            <path class="body-part body-thigh_right" data-part="thigh_right" d="M132,215 C136,240 138,262 138,280 L144,282 C144,260 142,238 140,215 Z" />
            <path class="body-part body-thigh_right" data-part="thigh_right" d="M130,215 L118,220 L114,260 L116,290 L124,290 L126,260 L132,235 Z" />
            <!-- LEFT KNEE -->
            <path class="body-part body-knee_left" data-part="knee_left" d="M76,290 L84,290 L86,300 L84,310 L76,310 L74,300 Z" />
            <!-- RIGHT KNEE -->
            <path class="body-part body-knee_right" data-part="knee_right" d="M124,290 L116,290 L114,300 L116,310 L124,310 L126,300 Z" />
            <!-- LEFT SHIN / CALF -->
            <path class="body-part body-shin_left" data-part="shin_left" d="M76,310 C78,330 80,350 80,370 L82,390 L84,420 L76,420 L72,390 L70,370 C68,350 68,330 74,310 Z" />
            <!-- RIGHT SHIN / CALF -->
            <path class="body-part body-shin_right" data-part="shin_right" d="M124,310 C122,330 120,350 120,370 L118,390 L116,420 L124,420 L128,390 L130,370 C132,350 132,330 126,310 Z" />
            <!-- LEFT FOOT -->
            <path class="body-part body-foot_left" data-part="foot_left" d="M68,420 L92,420 L96,424 L94,432 L84,434 L66,432 L64,428 Z" />
            <!-- RIGHT FOOT -->
            <path class="body-part body-foot_right" data-part="foot_right" d="M132,420 L108,420 L104,424 L106,432 L116,434 L134,432 L136,428 Z" />
          </svg>
          <!-- Labels overlay -->
          <div class="body-map-labels">
            <span class="bml-label" data-part="head">Голова</span>
            <span class="bml-label" data-part="neck">Шея</span>
            <span class="bml-label" data-part="chest">Грудная клетка</span>
            <span class="bml-label" data-part="abdomen">Живот</span>
            <span class="bml-label" data-part="shoulder_left">Левое плечо</span>
            <span class="bml-label" data-part="shoulder_right">Правое плечо</span>
            <span class="bml-label" data-part="forearm_left">Левое предплечье</span>
            <span class="bml-label" data-part="forearm_right">Правое предплечье</span>
            <span class="bml-label" data-part="hand_left">Левая кисть</span>
            <span class="bml-label" data-part="hand_right">Правая кисть</span>
            <span class="bml-label" data-part="thigh_left">Левое бедро</span>
            <span class="bml-label" data-part="thigh_right">Правое бедро</span>
            <span class="bml-label" data-part="knee_left">Левое колено</span>
            <span class="bml-label" data-part="knee_right">Правое колено</span>
            <span class="bml-label" data-part="shin_left">Левая голень</span>
            <span class="bml-label" data-part="shin_right">Правая голень</span>
            <span class="bml-label" data-part="foot_left">Левая стопа</span>
            <span class="bml-label" data-part="foot_right">Правая стопа</span>
          </div>
        </div>
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

function openInjuryModal() {
  selectedBodyPart = null;
  selectedInjuryType = null;
  selectedSeverity = null;

  // Reset SVG selections
  document.querySelectorAll('.body-part').forEach(el => el.classList.remove('selected'));
  document.querySelectorAll('.bml-label').forEach(el => el.classList.remove('selected'));
  document.querySelectorAll('.injury-opt').forEach(b => b.classList.remove('selected'));
  document.getElementById('submit-injury-btn').disabled = true;

  // Reset display
  const display = document.getElementById('selected-body-part-display');
  if (display) display.textContent = 'Часть не выбрана';

  document.getElementById('injury-modal').classList.add('active');
}

function closeInjuryModal() {
  document.getElementById('injury-modal').classList.remove('active');
}

function handleBodyMapClick(event) {
  // Find the closest SVG element with data-part attribute
  const target = event.target.closest('[data-part]');
  if (!target) return;

  const part = target.getAttribute('data-part');
  if (!part) return;

  selectBodyPart(part);
}

function selectBodyPart(part) {
  if (!part) return;

  selectedBodyPart = part;

  // Update SVG visual selection
  document.querySelectorAll('.body-part').forEach(el => el.classList.remove('selected'));
  document.querySelectorAll(`.body-part[data-part="${part}"]`).forEach(el => el.classList.add('selected'));

  // Update label selection
  document.querySelectorAll('.bml-label').forEach(el => el.classList.remove('selected'));
  document.querySelectorAll(`.bml-label[data-part="${part}"]`).forEach(el => el.classList.add('selected'));

  // Update display text
  const display = document.getElementById('selected-body-part-display');
  if (display) {
    display.textContent = 'Выбрано: ' + (bodyPartLabels[part] || part);
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
