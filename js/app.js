// ===== TACTICAL COMMAND CENTER — MAIN APP ROUTER =====

// Build the complete shell: sidebar + header + bottom nav + screens
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
      </div>
      <div class="sidebar-nav">
        <div class="nav-label">Навигация</div>
        <a class="nav-item instructor-only" id="nav-management" onclick="navigateTo('management')" style="display:none">
          <span class="nav-icon">&#x2699;</span>
          <span>Управление</span>
        </a>
        <a class="nav-item instructor-only" id="nav-platoons" onclick="navigateTo('platoons')" style="display:none">
          <span class="nav-icon">&#x2630;</span>
          <span>Взводы</span>
        </a>
        <a class="nav-item instructor-only" id="nav-training" onclick="navigateTo('training')" style="display:none">
          <span class="nav-icon">&#x1F393;</span>
          <span>Обучение</span>
        </a>
        <a class="nav-item cadet-only" id="nav-dashboard" onclick="navigateTo('dashboard')" style="display:none">
          <span class="nav-icon">&#x2302;</span>
          <span>Панель</span>
        </a>
      </div>
      <div class="sidebar-footer">
        <div class="logout-item" onclick="logout()">
          <span>&#x21AA;</span>
          <span>Выйти</span>
        </div>
      </div>
    </nav>
  `;
  document.body.insertBefore(sidebar, app);

  // Wrap app in main-wrapper with header
  const wrapper = document.createElement('div');
  wrapper.className = 'main-wrapper';

  const header = document.createElement('header');
  header.innerHTML = `
    <div class="header-left">
      <button class="hamburger-btn" id="hamburger-btn" onclick="toggleSidebar()" aria-label="Меню">&#x2630;</button>
      <div class="header-title" id="header-title">TCCC</div>
      <div class="header-breadcrumb">
        <span>&#x25B6;</span>
        <span id="header-screen-name">Авторизация</span>
      </div>
    </div>
    <div class="header-right">
      <div class="header-user" id="header-user" style="display:none">
        <div class="user-avatar" id="user-avatar">?</div>
        <span class="user-name" id="user-name">Пользователь</span>
      </div>
    </div>
  `;

  // Move app into wrapper
  app.parentNode.insertBefore(wrapper, app);
  wrapper.appendChild(header);
  wrapper.appendChild(app);

  // Inject bottom navigation (hidden on desktop, shown on mobile)
  const bottomNav = document.createElement('div');
  bottomNav.className = 'bottom-nav';
  bottomNav.id = 'bottom-nav';
  bottomNav.innerHTML = `
    <button class="bottom-nav-item instructor-only" id="bn-management" onclick="navigateTo('management')" style="display:none">
      <span class="bn-icon">&#x2699;</span>
      <span class="bn-label">Упр.</span>
    </button>
    <button class="bottom-nav-item instructor-only" id="bn-platoons" onclick="navigateTo('platoons')" style="display:none">
      <span class="bn-icon">&#x2630;</span>
      <span class="bn-label">Взводы</span>
    </button>
    <button class="bottom-nav-item instructor-only" id="bn-training" onclick="navigateTo('training')" style="display:none">
      <span class="bn-icon">&#x1F393;</span>
      <span class="bn-label">Обуч.</span>
    </button>
    <button class="bottom-nav-item cadet-only" id="bn-dashboard" onclick="navigateTo('dashboard')" style="display:none">
      <span class="bn-icon">&#x2302;</span>
      <span class="bn-label">Панель</span>
    </button>
  `;
  document.body.appendChild(bottomNav);

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

  document.getElementById('header-title').textContent = 'TCCC · Курсант';
  document.getElementById('header-screen-name').textContent = 'Панель управления';

  updateActiveNav('dashboard');

  // Show cadet nav items, hide instructor nav items
  document.querySelectorAll('.instructor-only').forEach(e => e.style.display = 'none');
  document.querySelectorAll('.cadet-only').forEach(e => e.style.display = '');

  cleanupInstructorListeners();

  initCadetScreen();
}

function showInstructorScreen() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('instructor-screen').classList.add('active');

  document.getElementById('header-title').textContent = 'TCCC · Командование';
  document.getElementById('header-screen-name').textContent = 'Панель инструктора';

  // Show instructor nav items, hide cadet nav items
  document.querySelectorAll('.instructor-only').forEach(e => e.style.display = '');
  document.querySelectorAll('.cadet-only').forEach(e => e.style.display = 'none');

  updateActiveNav('management');

  if (cadetUnsubscribe) {
    cadetUnsubscribe();
    cadetUnsubscribe = null;
  }

  initInstructorScreen();

  // Default to management tab
  switchInstructorPage('management');
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

  // Close sidebar on mobile after navigation
  const sidebar = document.getElementById('sidebar');
  if (sidebar && sidebar.classList.contains('open')) {
    sidebar.classList.remove('open');
  }

  if (currentUserRole === 'cadet') {
    if (page === 'dashboard') {
      showCadetScreen();
    }
  } else if (currentUserRole === 'instructor') {
    if (page === 'management' || page === 'platoons' || page === 'training') {
      showInstructorScreen();
      switchInstructorPage(page);
    }
  }
}

function updateActiveNav(id) {
  // Sidebar nav
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navEl = document.getElementById('nav-' + id);
  if (navEl) navEl.classList.add('active');

  // Bottom nav
  document.querySelectorAll('.bottom-nav-item').forEach(n => n.classList.remove('active'));
  const bnEl = document.getElementById('bn-' + id);
  if (bnEl) bnEl.classList.add('active');
}

// Sidebar toggle for mobile
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.classList.toggle('open');
  }
}

// Close sidebar on tap outside (mobile)
document.addEventListener('click', function(e) {
  const sidebar = document.getElementById('sidebar');
  const hamburger = document.getElementById('hamburger-btn');
  if (sidebar && sidebar.classList.contains('open')) {
    if (!sidebar.contains(e.target) && !hamburger.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  }
});

// Global cleanup on logout
function cleanupListeners() {
  if (cadetUnsubscribe) {
    cadetUnsubscribe();
    cadetUnsubscribe = null;
  }
  cleanupInstructorListeners();
  document.body.classList.add('unauthenticated');
  document.getElementById('header-user').style.display = 'none';
}

// Show error toast
function showError(msg) {
  const authError = document.getElementById('auth-error');
  if (authError && authError.style.display !== 'none') {
    return;
  }

  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
    background: rgba(255, 71, 87, 0.15);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    color: #ff4757;
    padding: 10px 20px;
    border-radius: 10px;
    font-size: 0.8rem;
    font-weight: 600;
    border: 1px solid rgba(255, 71, 87, 0.2);
    z-index: 300;
    text-align: center;
    max-width: 90%;
    animation: fadeIn 0.25s ease-out;
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
});
