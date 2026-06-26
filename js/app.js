// ===== TACTICAL COMMAND CENTER — MAIN APP ROUTER =====

// Build the complete shell: sidebar + header + status bar + screens
function buildAppShell() {
  const app = document.getElementById('app');
  const body = document.body;

  // Mark as unauthenticated initially
  body.classList.add('unauthenticated');

  // Inject sidebar
  const sidebar = document.createElement('div');
  sidebar.id = 'sidebar';
  sidebar.innerHTML = `
    <nav class="sidebar">
      <div class="sidebar-brand">
        <div class="sidebar-logo-row">
          <div class="sidebar-icon">&#x2691;</div>
          <div class="sidebar-logo-text">
            <div class="sidebar-title">TCCC</div>
            <div class="sidebar-subtitle">Tactical Command</div>
          </div>
        </div>
        <div class="sidebar-sysinfo">
          <span class="dot"></span>
          <span>Система готова</span>
        </div>
      </div>
      <div class="sidebar-nav">
        <div class="nav-label">Навигация</div>
        <a class="nav-item" id="nav-dashboard" onclick="navigateTo('dashboard')">
          <span class="nav-icon">&#x2302;</span>
          <span>Панель</span>
        </a>
        <a class="nav-item" id="nav-operations" onclick="navigateTo('operations')">
          <span class="nav-icon">&#x2699;</span>
          <span>Управление</span>
        </a>
        <a class="nav-item" id="nav-cadets" onclick="navigateTo('cadets')">
          <span class="nav-icon">&#x263A;</span>
          <span>Личный состав</span>
        </a>
        <a class="nav-item" id="nav-platoons" onclick="navigateTo('platoons')">
          <span class="nav-icon">&#x2630;</span>
          <span>Взводы</span>
        </a>

        <div style="flex:1"></div>

        <div class="nav-label">Система</div>
        <a class="nav-item" onclick="logout()" style="color:var(--text-muted)">
          <span class="nav-icon">&#x21AA;</span>
          <span>Выйти</span>
        </a>
      </div>
      <div class="sidebar-footer">
        <div class="connection-indicator">
          <span class="status-dot" id="conn-dot"></span>
          <span class="conn-label">Firebase</span>
          <span class="conn-status" id="conn-status">ONLINE</span>
        </div>
      </div>
    </nav>
  `;
  document.body.insertBefore(sidebar, app);

  // Wrap app in main-wrapper with header and status bar
  const wrapper = document.createElement('div');
  wrapper.className = 'main-wrapper';

  const header = document.createElement('header');
  header.innerHTML = `
    <div class="header-left">
      <div class="header-title" id="header-title">TCCC</div>
      <div class="header-breadcrumb" id="header-breadcrumb">
        <span>&#x25B6;</span>
        <span id="header-screen-name">Авторизация</span>
      </div>
    </div>
    <div class="header-right">
      <div class="header-status">
        <span class="pulse-ring"></span>
        <span class="status-text" id="header-status-text">ONLINE</span>
      </div>
      <div class="header-user" id="header-user" style="display:none">
        <div class="user-avatar" id="user-avatar">?</div>
        <span class="user-name" id="user-name">Пользователь</span>
      </div>
    </div>
  `;

  const statusBar = document.createElement('div');
  statusBar.className = 'status-bar';
  statusBar.innerHTML = `
    <div class="status-group">
      <div class="status-item">
        <span class="dot" id="sb-db"></span>
        <span>DATABASE</span>
      </div>
      <div class="status-item">
        <span class="dot" id="sb-auth"></span>
        <span>AUTH</span>
      </div>
      <div class="status-item">
        <span class="dot" id="sb-sync"></span>
        <span>SYNC</span>
      </div>
    </div>
    <div class="status-time" id="status-time">--:--:--</div>
  `;

  // Move app into wrapper
  app.parentNode.insertBefore(wrapper, app);
  wrapper.appendChild(header);
  wrapper.appendChild(app);
  wrapper.appendChild(statusBar);

  // Build the three screens inside app
  app.innerHTML = `
    <!-- AUTH SCREEN -->
    <div id="auth-screen" class="screen active">
      <div class="auth-box">
        <h1>ТАКТИЧЕСКИЙ<br><span class="accent-text">КОНТРОЛЬ</span></h1>
        <p class="subtitle">Система мониторинга курсантов</p>

        <div id="auth-error" class="error-msg"></div>

        <!-- Login form -->
        <form id="login-form" onsubmit="handleLogin(event)">
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="login-email" placeholder="your@email.com" autocomplete="email">
          </div>
          <div class="form-group">
            <label>Пароль</label>
            <input type="password" id="login-password" placeholder="••••••" autocomplete="current-password">
          </div>
          <button type="submit" class="btn btn-primary">Войти в систему</button>
        </form>

        <!-- Register form (hidden by default) -->
        <form id="register-form" style="display:none" onsubmit="handleRegister(event)">
          <div class="form-group">
            <label>Имя</label>
            <input type="text" id="reg-name" placeholder="Иван Иванов">
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="reg-email" placeholder="your@email.com" autocomplete="email">
          </div>
          <div class="form-group">
            <label>Пароль (минимум 6 символов)</label>
            <input type="password" id="reg-password" placeholder="••••••" autocomplete="new-password">
          </div>
          <div class="form-group">
            <label>Роль</label>
            <select id="reg-role" onchange="onRegRoleChange()">
              <option value="cadet">Курсант</option>
              <option value="instructor">Инструктор</option>
            </select>
          </div>
          <div class="form-group" id="reg-platoon-group" style="display:none">
            <label>Взвод</label>
            <select id="reg-platoon">
              <option value="">Загрузка...</option>
            </select>
          </div>
          <div class="form-group" id="reg-platoon-manual-group" style="display:none">
            <label>Название взвода (если не нашли в списке)</label>
            <input type="text" id="reg-platoon-manual" placeholder="Например, 1-й взвод 3-й роты">
          </div>
          <button type="submit" class="btn btn-primary">Зарегистрироваться</button>
        </form>

        <div class="auth-toggle" id="auth-toggle-text">
          Нет аккаунта? <a onclick="toggleAuthMode()">Зарегистрироваться</a>
        </div>
      </div>
    </div>

    <!-- CADET SCREEN -->
    <div id="cadet-screen" class="screen"></div>

    <!-- INSTRUCTOR SCREEN -->
    <div id="instructor-screen" class="screen"></div>
  `;

  // Start clock
  startStatusClock();
}

// Initialize app based on user role
function initApp() {
  const body = document.body;
  body.classList.remove('unauthenticated');
  logoutBtn.style.display = 'none';

  // Update header
  if (currentUser) {
    const headerUser = document.getElementById('header-user');
    headerUser.style.display = 'flex';

    db.collection('users').doc(currentUser.uid).get().then(doc => {
      if (doc.exists) {
        const data = doc.data();
        const name = data.name || 'Пользователь';
        document.getElementById('user-name').textContent = name;
        document.getElementById('user-avatar').textContent = name.charAt(0).toUpperCase();
      }
    });

    // Update connection indicator
    updateConnectionStatus(true);
  }

  if (currentUserRole === 'instructor') {
    showInstructorScreen();
  } else if (currentUserRole === 'cadet') {
    showCadetScreen();
  } else {
    showAuthScreen();
  }
}

function showCadetScreen() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('cadet-screen').classList.add('active');

  // Update header
  document.getElementById('header-title').textContent = 'TCCC · Курсант';
  document.getElementById('header-screen-name').textContent = 'Панель управления';

  // Update nav
  updateActiveNav('dashboard');

  // Clean up instructor listeners if any
  cleanupInstructorListeners();

  // Init cadet UI
  initCadetScreen();
}

function showInstructorScreen() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('instructor-screen').classList.add('active');

  // Update header
  document.getElementById('header-title').textContent = 'TCCC · Командование';
  document.getElementById('header-screen-name').textContent = 'Панель инструктора';

  // Update nav
  updateActiveNav('operations');

  // Clean up cadet listeners
  if (cadetUnsubscribe) {
    cadetUnsubscribe();
    cadetUnsubscribe = null;
  }

  // Init instructor UI
  initInstructorScreen();
}

function showAuthScreen() {
  document.body.classList.add('unauthenticated');
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('auth-screen').classList.add('active');
  logoutBtn.style.display = 'none';

  document.getElementById('header-title').textContent = 'TCCC';
  document.getElementById('header-screen-name').textContent = 'Авторизация';
  document.getElementById('header-user').style.display = 'none';
}

// Navigation helper
function navigateTo(page) {
  if (!currentUserRole) return;
  if (currentUserRole === 'cadet') {
    if (page === 'dashboard' || page === 'cadets') {
      showCadetScreen();
    }
  } else if (currentUserRole === 'instructor') {
    if (page === 'operations' || page === 'dashboard') {
      showInstructorScreen();
      // Switch to cadets tab
      switchInstructorTab('cadets');
    } else if (page === 'cadets') {
      showInstructorScreen();
      switchInstructorTab('cadets');
    } else if (page === 'platoons') {
      showInstructorScreen();
      switchInstructorTab('platoons');
    }
  }
}

function updateActiveNav(id) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const el = document.getElementById('nav-' + id);
  if (el) el.classList.add('active');
}

// Connection status indicator
function updateConnectionStatus(online) {
  const dot = document.getElementById('conn-dot');
  const status = document.getElementById('conn-status');
  if (!dot || !status) return;

  if (online) {
    dot.className = 'status-dot';
    status.textContent = 'ONLINE';
    status.style.color = 'var(--accent)';
  } else {
    dot.className = 'status-dot disconnected';
    status.textContent = 'OFFLINE';
    status.style.color = 'var(--text-muted)';
  }
}

// Update status bar database indicator
function updateStatusBarIndicator(id, online) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = 'dot' + (online ? '' : ' offline');
}

// Status bar clock
function startStatusClock() {
  function tick() {
    const now = new Date();
    const time = now.toTimeString().split(' ')[0];
    const el = document.getElementById('status-time');
    if (el) el.textContent = time + ' UTC+5';
  }
  tick();
  setInterval(tick, 1000);
}

// Global cleanup on logout
function cleanupListeners() {
  if (cadetUnsubscribe) {
    cadetUnsubscribe();
    cadetUnsubscribe = null;
  }
  cleanupInstructorListeners();
  document.body.classList.add('unauthenticated');
  document.getElementById('header-user').style.display = 'none';
  updateConnectionStatus(false);
}

// Show error toast
function showError(msg) {
  const authError = document.getElementById('auth-error');
  if (authError && authError.style.display !== 'none') {
    return;
  }

  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    background: rgba(255, 71, 87, 0.15);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    color: var(--danger, #ff4757);
    padding: 12px 24px;
    border-radius: 12px;
    font-size: 0.82rem;
    font-weight: 600;
    border: 1px solid rgba(255, 71, 87, 0.2);
    z-index: 300;
    text-align: center;
    max-width: 90%;
    animation: fadeSlideUp 0.3s ease-out;
    font-family: 'Inter', sans-serif;
  `;
  toast.textContent = msg;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Wait for DOM ready, then build
document.addEventListener('DOMContentLoaded', () => {
  buildAppShell();

  // Firestore connection monitoring
  if (db) {
    db.collection('__health__').doc('ping').set({
      ts: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
      updateStatusBarIndicator('sb-db', true);
    }).catch(() => {
      updateStatusBarIndicator('sb-db', false);
    });
  }

  // Monitor auth state
  if (auth) {
    auth.onAuthStateChanged(user => {
      updateStatusBarIndicator('sb-auth', !!user);
    });
  }

  // If Firebase auth already has a session, the onAuthStateChanged in auth.js will handle it
  // Otherwise the auth screen stays visible
});
