// ===== CADET MODULE =====

let cadetUnsubscribe = null;
let selectedBodyPart = null;
let selectedInjuryType = null;
let selectedSeverity = null;

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

      // Update instruction
      const instrEl = document.getElementById('cadet-instruction');
      if (data.instruction) {
        instrEl.textContent = data.instruction;
        instrEl.className = 'text';
      } else {
        instrEl.textContent = 'Нет инструкций';
        instrEl.className = 'empty';
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

  // If cadet was injured, allow march state update but keep injured status
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

  const update = {
    status: status,
    injury: injuryData,
    lastUpdate: firebase.firestore.FieldValue.serverTimestamp()
  };

  db.collection('users').doc(currentUser.uid).update(update)
    .then(() => {
      logEvent('injury_reported', injuryData);
      closeInjuryModal();
    })
    .catch(err => {
      console.error('Failed to submit injury:', err);
      showError('Ошибка при отправке данных');
      closeInjuryModal();
    });
}
