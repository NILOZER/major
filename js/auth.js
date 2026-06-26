// ===== AUTHENTICATION MODULE =====

let currentUser = null;
let currentUserRole = null;

// Inline logout button (hidden by default, used as a fallback)
const logoutBtn = document.createElement('button');
logoutBtn.textContent = 'Выйти';
logoutBtn.style.cssText = 'display:none;position:fixed;top:12px;right:12px;z-index:50;padding:7px 14px;background:rgba(255,71,87,0.08);color:#ff4757;border:1px solid rgba(255,71,87,0.2);border-radius:8px;font-family:Inter,sans-serif;font-size:0.65rem;font-weight:600;cursor:pointer;text-transform:uppercase;letter-spacing:0.8px;';
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

  const role = document.getElementById('reg-role').value;
  if (role !== 'cadet') {
    platoonGroup.style.display = 'none';
    return;
  }

  platoonGroup.style.display = 'block';

  select.innerHTML = '<option value="">Загрузка взводов...</option>';
  select.disabled = true;

  Promise.all([
    getAllPlatoons(),
    db.collection('users').where('role', '==', 'cadet').get()
  ]).then(([platoons, cadetSnapshot]) => {
    select.disabled = false;

    const counts = {};
    cadetSnapshot.forEach(doc => {
      const pid = doc.data().platoonId || '__none__';
      counts[pid] = (counts[pid] || 0) + 1;
    });

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

function onRegRoleChange() {
  clearAuthError();
  loadPlatoonsForRegistration();
}

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

  let platoonId = null;

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
      const userData = {
        name: name,
        email: email,
        role: role,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };

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

        if (platoonId) {
          userData.platoonId = platoonId;
          return db.collection('platoons').doc(platoonId).get().then(platoonDoc => {
            if (platoonDoc.exists) {
              userData.instructorId = platoonDoc.data().instructorId || '';
            }
            return db.collection('users').doc(result.user.uid).set(userData);
          });
        } else {
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

function logout() {
  const confirmed = confirm('Выйти из системы?');
  if (!confirmed) return;

  auth.signOut().then(() => {
    currentUser = null;
    currentUserRole = null;

    if (typeof cleanupListeners === 'function') {
      cleanupListeners();
    }

    showAuthScreen();
  });
}

auth.onAuthStateChanged(user => {
  if (user) {
    checkUserRole(user).then(() => {
      initApp();
    }).catch(() => {
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
