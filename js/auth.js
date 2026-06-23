// ===== AUTHENTICATION MODULE =====

let currentUser = null;
let currentUserRole = null;

// Logout button element
const logoutBtn = document.createElement('button');
logoutBtn.className = 'logout-btn';
logoutBtn.textContent = 'Выйти';
logoutBtn.style.display = 'none';
logoutBtn.onclick = () => logout();
document.body.appendChild(logoutBtn);

function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  if (el) {
    el.textContent = msg;
    el.style.display = 'block';
  }
}

function clearAuthError() {
  const el = document.getElementById('auth-error');
  if (el) el.style.display = 'none';
}

// Show auth screen
function showAuthScreen() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('auth-screen').classList.add('active');
  logoutBtn.style.display = 'none';
}

// Toggle between login and register forms
function toggleAuthMode() {
  clearAuthError();
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const toggleText = document.getElementById('auth-toggle-text');

  if (loginForm.style.display === 'none') {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    toggleText.innerHTML = 'Нет аккаунта? <a onclick="toggleAuthMode()">Зарегистрироваться</a>';
  } else {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    toggleText.innerHTML = 'Уже есть аккаунт? <a onclick="toggleAuthMode()">Войти</a>';
  }
}

// Handle login
function handleLogin(e) {
  e.preventDefault();
  clearAuthError();

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    showAuthError('Заполните все поля');
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then(result => {
      return checkUserRole(result.user);
    })
    .then(() => {
      initApp();
    })
    .catch(err => {
      let msg = 'Ошибка входа';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Неверный email или пароль';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Неверный формат email';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Слишком много попыток. Попробуйте позже';
      }
      showAuthError(msg);
    });
}

// Handle registration
function handleRegister(e) {
  e.preventDefault();
  clearAuthError();

  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const role = document.getElementById('reg-role').value;

  if (!name || !email || !password) {
    showAuthError('Заполните все поля');
    return;
  }

  if (password.length < 6) {
    showAuthError('Пароль должен быть минимум 6 символов');
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then(result => {
      // Create user profile in Firestore
      const userData = {
        name: name,
        email: email,
        role: role,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      // If cadet, initialize data structure
      if (role === 'cadet') {
        userData.marchState = 'hold';
        userData.status = 'healthy';
        userData.injury = { type: '', bodyPart: '', severity: '' };
        userData.lastUpdate = firebase.firestore.FieldValue.serverTimestamp();
        userData.instruction = '';
        userData.instructionFrom = '';
        userData.instructionTime = null;
      }

      return db.collection('users').doc(result.user.uid).set(userData);
    })
    .then(() => {
      return checkUserRole(auth.currentUser);
    })
    .then(() => {
      initApp();
    })
    .catch(err => {
      let msg = 'Ошибка регистрации';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'Этот email уже зарегистрирован';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Слишком простой пароль';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Неверный формат email';
      }
      showAuthError(msg);
    });
}

// Check user role from Firestore
function checkUserRole(user) {
  return db.collection('users').doc(user.uid).get()
    .then(doc => {
      if (doc.exists) {
        currentUser = user;
        currentUserRole = doc.data().role;
        return doc.data();
      } else {
        throw new Error('Пользователь не найден');
      }
    });
}

// Logout
function logout() {
  const confirmed = confirm('Выйти из системы?');
  if (!confirmed) return;

  auth.signOut().then(() => {
    currentUser = null;
    currentUserRole = null;

    // Clean up listeners
    if (typeof cleanupListeners === 'function') {
      cleanupListeners();
    }

    showAuthScreen();
  });
}

// Auth state listener
auth.onAuthStateChanged(user => {
  if (user) {
    checkUserRole(user).then(() => {
      initApp();
    }).catch(() => {
      // User doc doesn't exist yet or error
      showAuthScreen();
    });
  } else {
    currentUser = null;
    currentUserRole = null;
    if (typeof cleanupListeners === 'function') {
      cleanupListeners();
    }
    showAuthScreen();
  }
});
