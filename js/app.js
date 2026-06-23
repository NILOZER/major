// ===== MAIN APP ROUTER =====

// Initialize app based on user role
function initApp() {
  logoutBtn.style.display = 'block';

  if (currentUserRole === 'instructor') {
    showInstructorScreen();
  } else if (currentUserRole === 'cadet') {
    showCadetScreen();
  } else {
    // Fallback to auth
    showAuthScreen();
  }
}

function showCadetScreen() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('cadet-screen').classList.add('active');

  // Clean up instructor listeners if any
  cleanupInstructorListeners();

  // Init cadet UI
  initCadetScreen();
}

function showInstructorScreen() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('instructor-screen').classList.add('active');

  // Clean up cadet listeners
  if (cadetUnsubscribe) {
    cadetUnsubscribe();
    cadetUnsubscribe = null;
  }

  // Init instructor UI
  initInstructorScreen();
}

// Global cleanup on logout
function cleanupListeners() {
  if (cadetUnsubscribe) {
    cadetUnsubscribe();
    cadetUnsubscribe = null;
  }
  cleanupInstructorListeners();
}

// Show error toast
function showError(msg) {
  // Reuse the auth error element if visible, otherwise create a toast
  const authError = document.getElementById('auth-error');
  if (authError && authError.style.display !== 'none') {
    // Already handled by auth module
    return;
  }

  // Create temporary toast
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
    background: #c0392b; color: #fff; padding: 12px 24px;
    border-radius: 8px; font-size: 0.9rem; font-weight: 700;
    border: 2px solid #000; box-shadow: 4px 4px 0 #0a0a1a;
    z-index: 200; text-align: center; max-width: 90%;
  `;
  toast.textContent = msg;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ===== BUILD INITIAL HTML STRUCTURE =====
function buildAppShell() {
  const app = document.getElementById('app');

  app.innerHTML = `
    <!-- AUTH SCREEN -->
    <div id="auth-screen" class="screen active">
      <div class="auth-box">
        <h1>ТАКТИЧЕСКИЙ<br>КОНТРОЛЬ</h1>
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
          <button type="submit" class="btn btn-primary">Войти</button>
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
            <select id="reg-role">
              <option value="cadet">Курсант</option>
              <option value="instructor">Инструктор</option>
            </select>
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

// Wait for DOM ready, then build
document.addEventListener('DOMContentLoaded', () => {
  buildAppShell();

  // If Firebase auth already has a session, the onAuthStateChanged in auth.js will handle it
  // Otherwise the auth screen stays visible
});
