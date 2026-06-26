// ===== AUTHENTICATION MODULE =====

let currentUser = null;
let currentUserRole = null;

// Logout button element
const logoutBtn = document.createElement('button');
logoutBtn.className = 'logout-btn';
logoutBtn.textContent = 'Выйти';
logoutBtn.style.display = 'none';
logoutBtn.onclick = () => logout();
logoutBtn.setAttribute('aria-hidden', 'true');
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
    // Load platoons when registration form is shown
    loadPlatoonsForRegistration();
    toggleText.innerHTML = 'Уже есть аккаунт? <a onclick="toggleAuthMode()">Войти</a>';
  }
}

// Load platoons for registration dropdown
function loadPlatoonsForRegistration() {
  const platoonGroup = document.getElementById('reg-platoon-group');
  if (!platoonGroup) return;

  const select = document.getElementById('reg-platoon');
  if (!select) return;

  // Check selected role
  const role = document.getElementById('reg-role').value;
  if (role !== 'cadet') {
    platoonGroup.style.display = 'none';
    return;
  }

  platoonGroup.style.display = 'block';

  // Show loading
  select.innerHTML = '<option value="">Загрузка взводов...</option>';
  select.disabled = true;

  Promise.all([
    getAllPlatoons(),
    db.collection('users').where('role', '==', 'cadet').get()
  ]).then(([platoons, cadetSnapshot]) => {
    select.disabled = false;

    // Count cadets per platoon
    const counts = {};
    cadetSnapshot.forEach(doc => {
      const pid = doc.data().platoonId || '__none__';
      counts[pid] = (counts[pid] || 0) + 1;
    });

    // Filter out full platoons
    const available = platoons.filter(p => {
      const maxCap = p.maxCadets || 30;
      const currentCount = counts[p.id] || 0;
      return currentCount < maxCap;
    });

    if (available.length === 0) {
      select.innerHTML = '<option value="">Все взводы заполнены</option>';
      document.getElementById('reg-platoon-manual-group').style.display = 'block';
      return;
    }

    document.getElementById('reg-platoon-manual-group').style.display = 'none';

    // Group platoons by instructor name
    const grouped = {};
    available.forEach(p => {
      const instructorName = p.instructorName || 'Инструктор';
      if (!grouped[instructorName]) grouped[instructorName] = [];
      const currentCount = counts[p.id] || 0;
      grouped[instructorName].push({ ...p, currentCount, maxCap: p.maxCadets || 30 });
    });

    let html = '<option value="">Выберите взвод</option>';
    Object.entries(grouped).forEach(([instructorName, plist]) => {
      html += `<optgroup label="${instructorName}">`;
      plist.forEach(p => {
        const desc = p.description ? ` (${p.description})` : '';
        html += `<option value="${p.id}">${p.name}${desc} [${p.currentCount}/${p.maxCap}]</option>`;
      });
      html += '</optgroup>';
    });

    select.innerHTML = html;
  }).catch(err => {
    console.warn('Failed to load platoons:', err);
    select.disabled = false;
    select.innerHTML = '<option value="">Ошибка загрузки взводов</option>';
  });
}

// Handle role change in registration form
function onRegRoleChange() {
  clearAuthError();
  loadPlatoonsForRegistration();
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

  // For cadet, validate platoon selection
  let platoonId = null;
  let instructorId = null;

  if (role === 'cadet') {
    platoonId = document.getElementById('reg-platoon').value;
    const platoonManual = document.getElementById('reg-platoon-manual').value.trim();

    if (!platoonId && !platoonManual) {
      showAuthError('Выберите взвод или укажите его название');
      return;
    }
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
        userData.instructionShort = '';
        userData.instructionScenario = '';
        userData.instructionFrom = '';
        userData.instructionTime = null;

        // Handle platoon
        if (platoonId) {
          userData.platoonId = platoonId;
          // We'll set instructorId after we resolve the platoon
          return db.collection('platoons').doc(platoonId).get().then(platoonDoc => {
            if (platoonDoc.exists) {
              userData.instructorId = platoonDoc.data().instructorId || '';
            }
            return db.collection('users').doc(result.user.uid).set(userData);
          });
        } else {
          // Manual platoon name - store as pending
          const manualPlatoonName = document.getElementById('reg-platoon-manual').value.trim();
          userData.platoonName = manualPlatoonName;
          userData.platoonId = '';
          userData.instructorId = '';
          userData.platoonPending = true;
          return db.collection('users').doc(result.user.uid).set(userData);
        }
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
