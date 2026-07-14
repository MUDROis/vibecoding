const Auth = (() => {
  const TOTAL_LESSONS = 9;
  let currentUser = null;
  let userData = null;
  let listeners = [];
  let authReady = false;
  let authResolve;
  const authPromise = new Promise(r => { authResolve = r; });

  function initAuth() {
    firebase.auth().onAuthStateChanged(async (user) => {
      currentUser = user;
      if (user) {
        userData = await FirestoreDB.getUser(user.uid);
        if (userData && userData.status === 'deactivated') {
          await firebase.auth().signOut();
          currentUser = null;
          userData = null;
        }
      } else {
        userData = null;
      }
      authReady = true;
      authResolve();
      notifyListeners();
    });

    const overlay = document.getElementById('authOverlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) hideAuthModal();
      });
    }
    const form = document.getElementById('authForm');
    if (form) {
      form.addEventListener('submit', handleLogin);
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') hideAuthModal();
    });
  }

  async function loginWithEmail(email, password) {
    try {
      const cred = await firebase.auth().signInWithEmailAndPassword(email, password);
      return { success: true, user: cred.user };
    } catch (e) {
      let msg = 'Ошибка входа';
      if (e.code === 'auth/user-not-found') msg = 'Пользователь не найден';
      else if (e.code === 'auth/wrong-password') msg = 'Неверный пароль';
      else if (e.code === 'auth/invalid-email') msg = 'Некорректный email';
      else if (e.code === 'auth/too-many-requests') msg = 'Слишком много попыток. Попробуйте позже';
      else if (e.code === 'auth/invalid-credential') msg = 'Неверный email или пароль';
      return { success: false, error: msg };
    }
  }

  async function registerUser(email, password, role, accessType, lessons, expiresAt, label) {
    try {
      const adminUser = firebase.auth().currentUser;
      if (!adminUser) return { success: false, error: 'Необходима авторизация администратора' };

      const adminData = await FirestoreDB.getUser(adminUser.uid);
      if (!adminData || adminData.role !== 'admin') {
        return { success: false, error: 'Нет прав администратора' };
      }

      const tempApp = firebase.initializeApp(firebaseConfig, 'temp_' + Date.now());
      const tempAuth = tempApp.auth();
      const cred = await tempApp.auth().createUserWithEmailAndPassword(email, password);
      const uid = cred.user.uid;
      await tempApp.auth().signOut();
      tempApp.delete();

      await FirestoreDB.createUser(uid, {
        email,
        role: role || 'student',
        accessType: accessType || 'full',
        lessons: lessons || [],
        expiresAt: expiresAt || null,
        label: label || ''
      });

      return { success: true, uid };
    } catch (e) {
      let msg = 'Ошибка создания пользователя';
      if (e.code === 'auth/email-already-in-use') msg = 'Пользователь с таким email уже существует';
      else if (e.code === 'auth/weak-password') msg = 'Пароль слишком простой (минимум 6 символов)';
      else if (e.code === 'auth/invalid-email') msg = 'Некорректный email';
      return { success: false, error: msg };
    }
  }

  async function logout() {
    await firebase.auth().signOut();
  }

  function getCurrentUser() {
    return currentUser;
  }

  function getUserData() {
    return userData;
  }

  function isLoggedIn() {
    return !!currentUser;
  }

  function isAdmin() {
    return userData && userData.role === 'admin';
  }

  async function canAccessLesson(lessonId) {
    if (!currentUser) return false;
    return await FirestoreDB.canAccessLesson(currentUser.uid, lessonId);
  }

  function showAuthModal() {
    const overlay = document.getElementById('authOverlay');
    if (overlay) {
      overlay.classList.add('active');
      const emailInput = document.getElementById('authEmailInput');
      const passInput = document.getElementById('authPassInput');
      if (emailInput) { emailInput.value = ''; emailInput.focus(); }
      if (passInput) passInput.value = '';
      const error = document.getElementById('authError');
      if (error) error.textContent = '';
    }
  }

  function hideAuthModal() {
    const overlay = document.getElementById('authOverlay');
    if (overlay) overlay.classList.remove('active');
  }

  async function handleLogin(event) {
    if (event) event.preventDefault();
    const emailInput = document.getElementById('authEmailInput');
    const passInput = document.getElementById('authPassInput');
    const error = document.getElementById('authError');
    const btn = document.getElementById('authSubmitBtn');

    if (!emailInput || !emailInput.value.trim() || !passInput || !passInput.value) {
      if (error) error.textContent = 'Введите email и пароль';
      return;
    }

    if (btn) btn.disabled = true;
    if (error) error.textContent = '';

    try {
      const result = await loginWithEmail(emailInput.value.trim(), passInput.value);
      if (result.success) {
        hideAuthModal();
        const redirectUrl = emailInput.dataset.redirect || 'course.html';
        window.location.href = redirectUrl;
      } else {
        if (error) error.textContent = result.error;
      }
    } catch (e) {
      if (error) error.textContent = 'Ошибка при входе';
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  function handleLessonClick(event, url) {
    event.preventDefault();
    if (currentUser) {
      window.location.href = url;
    } else {
      const emailInput = document.getElementById('authEmailInput');
      if (emailInput) emailInput.dataset.redirect = url;
      showAuthModal();
    }
    return false;
  }

  function handleLogout() {
    logout().then(() => {
      window.location.href = 'index.html';
    });
  }

  function notifyListeners() {
    listeners.forEach(fn => fn(currentUser, userData));
  }

  function onChange(fn) {
    listeners.push(fn);
  }

  function whenReady() {
    return authReady ? Promise.resolve() : authPromise;
  }

  return {
    initAuth,
    loginWithEmail,
    registerUser,
    logout,
    getCurrentUser,
    getUserData,
    isLoggedIn,
    isAdmin,
    canAccessLesson,
    showAuthModal,
    hideAuthModal,
    handleLogin,
    handleLessonClick,
    handleLogout,
    onChange,
    whenReady,
    TOTAL_LESSONS
  };
})();

document.addEventListener('DOMContentLoaded', Auth.initAuth);
