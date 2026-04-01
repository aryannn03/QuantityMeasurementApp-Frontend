const API = 'http://localhost:8080';

// ─── UNIT MAPS ────────────────────────────────────────────
const UNITS = {
  LENGTH:      ['FEET','INCH','YARD','CENTIMETER'],
  WEIGHT:      ['MILLIGRAM','GRAM','KILOGRAM','POUND','TONNE'],
  VOLUME:      ['LITRE','MILLILITRE','GALLON'],
  TEMPERATURE: ['CELSIUS','FAHRENHEIT'],
};

const OP_ICONS = {
  CONVERT:  'fa-exchange-alt',
  COMPARE:  'fa-not-equal',
  ADD:      'fa-plus',
  SUBTRACT: 'fa-minus',
  DIVIDE:   'fa-divide',
};

// ─── STATE ────────────────────────────────────────────────
let token     = localStorage.getItem('qh_token') || null;
let userEmail = localStorage.getItem('qh_email') || null;
let userName  = localStorage.getItem('qh_name')  || null;
let currentOp = 'add';
let historyData = [];
let currentFilter = 'ALL';

// ─── DOM REFS ─────────────────────────────────────────────
const authOverlay   = document.getElementById('authOverlay');
const authCloseBtn  = document.getElementById('authCloseBtn');
const loginNavBtn   = document.getElementById('loginNavBtn');
const logoutBtn     = document.getElementById('logoutBtn');
const sidebarUser   = document.getElementById('sidebarUser');
const userAvatar    = document.getElementById('userAvatar');
const userNameEl    = document.getElementById('userName');
const userEmailEl   = document.getElementById('userEmail');
const heroNameEl    = document.getElementById('heroName');
const themeToggle   = document.getElementById('themeToggle');
const menuToggle    = document.getElementById('menuToggle');
const sidebar       = document.getElementById('sidebar');
const toastContainer= document.getElementById('toastContainer');

// ════════════════════════════════════════════════════════
//  TOAST SYSTEM
// ════════════════════════════════════════════════════════
function toast(type, title, message, duration = 4000) {
  const icons = {
    success: 'fa-check',
    error:   'fa-times',
    info:    'fa-info',
    warning: 'fa-exclamation',
  };

  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `
    <div class="toast-icon"><i class="fa ${icons[type]}"></i></div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-msg">${message}</div>` : ''}
    </div>
    <button class="toast-close"><i class="fa fa-times"></i></button>
    <div class="toast-progress" style="animation-duration:${duration}ms"></div>
  `;

  el.querySelector('.toast-close').addEventListener('click', () => removeToast(el));
  toastContainer.appendChild(el);

  setTimeout(() => removeToast(el), duration);
  return el;
}

function removeToast(el) {
  if (!el.parentNode) return;
  el.classList.add('removing');
  setTimeout(() => el.parentNode && el.parentNode.removeChild(el), 300);
}

// ════════════════════════════════════════════════════════
//  THEME
// ════════════════════════════════════════════════════════
function initTheme() {
  const saved = localStorage.getItem('qh_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
}

function updateThemeIcon(theme) {
  themeToggle.innerHTML = theme === 'dark'
    ? '<i class="fa fa-moon"></i>'
    : '<i class="fa fa-sun"></i>';
}

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next    = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('qh_theme', next);
  updateThemeIcon(next);
});

// ════════════════════════════════════════════════════════
//  SIDEBAR MOBILE TOGGLE
// ════════════════════════════════════════════════════════
menuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));

document.addEventListener('click', e => {
  if (window.innerWidth <= 768 &&
      sidebar.classList.contains('open') &&
      !sidebar.contains(e.target) &&
      !menuToggle.contains(e.target)) {
    sidebar.classList.remove('open');
  }
});

// ════════════════════════════════════════════════════════
//  PAGE NAVIGATION
// ════════════════════════════════════════════════════════
function navigateTo(pageId) {
  // History requires auth
  if (pageId === 'history' && !token) {
    openAuth();
    toast('info', 'Sign in required', 'Please sign in to view operation history');
    return;
  }

  // Update nav items
  document.querySelectorAll('.nav-item[data-page]').forEach(n => {
    n.classList.toggle('active', n.dataset.page === pageId);
  });

  // Update pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(`page-${pageId}`);
  if (target) target.classList.add('active');

  // Update topbar title
  const titles = {
    dashboard: 'Dashboard',
    convert:   'Unit Converter',
    compare:   'Compare Quantities',
    arithmetic:'Arithmetic Operations',
    history:   'Operation History',
  };
  document.getElementById('pageTitle').textContent = titles[pageId] || 'QuantityHub';

  // Close sidebar on mobile
  if (window.innerWidth <= 768) sidebar.classList.remove('open');

  // Load history data if needed
  if (pageId === 'history') loadHistory('ALL');

  // Load counts on dashboard
  if (pageId === 'dashboard') loadDashboardCounts();
}

// Bind sidebar nav
document.querySelectorAll('.nav-item[data-page]').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    navigateTo(item.dataset.page);
  });
});

// Bind quick action buttons
document.querySelectorAll('.qa-btn[data-page]').forEach(btn => {
  btn.addEventListener('click', () => navigateTo(btn.dataset.page));
});

// Bind stat cards to history
document.querySelectorAll('.stat-card[data-op]').forEach(card => {
  card.addEventListener('click', () => {
    if (!token) {
      navigateTo('history'); // will trigger auth
      return;
    }
    navigateTo('history');
    setTimeout(() => {
      document.querySelectorAll('.hist-filter').forEach(f => {
        f.classList.toggle('active', f.dataset.op === card.dataset.op);
      });
      loadHistory(card.dataset.op);
    }, 100);
  });
});

// ════════════════════════════════════════════════════════
//  AUTH MODAL
// ════════════════════════════════════════════════════════
function openAuth(defaultTab = 'login') {
  authOverlay.classList.remove('hidden');
  switchAuthTab(defaultTab);
}

function closeAuth() {
  authOverlay.classList.add('hidden');
}

authCloseBtn.addEventListener('click', closeAuth);

authOverlay.addEventListener('click', e => {
  if (e.target === authOverlay) closeAuth();
});

loginNavBtn.addEventListener('click', e => { e.preventDefault(); openAuth('login'); });

// AUTH TABS
document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => switchAuthTab(tab.dataset.tab));
});

function switchAuthTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.querySelectorAll('.auth-panel').forEach(p => p.classList.toggle('active', p.id === `${tab}Panel`));
}

// PASSWORD TOGGLE
document.querySelectorAll('.toggle-pass').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = btn.closest('.input-wrap').querySelector('input');
    const isPass = input.type === 'password';
    input.type  = isPass ? 'text' : 'password';
    btn.innerHTML = isPass ? '<i class="fa fa-eye-slash"></i>' : '<i class="fa fa-eye"></i>';
  });
});

// ─── LOGIN ───────────────────────────────────────────────
document.getElementById('loginBtn').addEventListener('click', async () => {
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) { toast('warning', 'Missing fields', 'Please fill in all fields'); return; }

  setLoading('loginBtn', true);

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const text = await res.text();

    if (!res.ok) throw new Error(text || 'Login failed');

    saveSession(text, email, email.split('@')[0]);
    closeAuth();
    toast('success', 'Welcome back!', `Signed in as ${email}`);
    updateUserUI();
    loadDashboardCounts();

  } catch (err) {
    toast('error', 'Login failed', err.message);
  } finally {
    setLoading('loginBtn', false);
  }
});

// ─── SIGNUP ──────────────────────────────────────────────
document.getElementById('signupBtn').addEventListener('click', async () => {
  const name     = document.getElementById('signupName').value.trim();
  const email    = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;

  if (!name || !email || !password) { toast('warning', 'Missing fields', 'Please fill in all fields'); return; }
  if (password.length < 6) { toast('warning', 'Weak password', 'Password must be at least 6 characters'); return; }

  setLoading('signupBtn', true);

  try {
    const res = await fetch(`${API}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    const text = await res.text();
    if (!res.ok) throw new Error(text || 'Signup failed');

    toast('success', 'Account created!', 'Please sign in to continue');
    switchAuthTab('login');
    document.getElementById('loginEmail').value = email;

  } catch (err) {
    toast('error', 'Signup failed', err.message);
  } finally {
    setLoading('signupBtn', false);
  }
});

// ─── GOOGLE AUTH ─────────────────────────────────────────
['googleLoginBtn','googleSignupBtn'].forEach(id => {
  document.getElementById(id).addEventListener('click', () => {
    toast('info', 'Redirecting…', 'Taking you to Google sign-in');
    setTimeout(() => {
      window.location.href = `${API}/oauth2/authorization/google`;
    }, 800);
  });
});

// ─── LOGOUT ──────────────────────────────────────────────
logoutBtn.addEventListener('click', e => {
  e.preventDefault();
  clearSession();
  toast('info', 'Signed out', 'See you next time!');
  navigateTo('dashboard');
  updateUserUI();
});

// ─── SESSION HELPERS ─────────────────────────────────────
function saveSession(jwtToken, email, name) {
  token     = jwtToken;
  userEmail = email;
  userName  = name;
  localStorage.setItem('qh_token',  token);
  localStorage.setItem('qh_email',  email);
  localStorage.setItem('qh_name',   name);
}

function clearSession() {
  token = userEmail = userName = null;
  localStorage.removeItem('qh_token');
  localStorage.removeItem('qh_email');
  localStorage.removeItem('qh_name');
}

function updateUserUI() {
  const authed = !!token;

  loginNavBtn.classList.toggle('hidden', authed);
  logoutBtn.classList.toggle('hidden', !authed);
  sidebarUser.classList.toggle('hidden', !authed);

  if (authed) {
    const initials = (userName || userEmail || 'U').charAt(0).toUpperCase();
    userAvatar.textContent = initials;
    userNameEl.textContent  = userName || 'User';
    userEmailEl.textContent = userEmail || '';
    heroNameEl.textContent  = `, ${userName || 'there'}`;

    // unlock history lock badge
    document.querySelector('.lock-badge')?.classList.add('hidden');
  } else {
    heroNameEl.textContent = '';
    document.querySelector('.lock-badge')?.classList.remove('hidden');
  }
}

function setLoading(btnId, on) {
  const btn = document.getElementById(btnId);
  const span   = btn.querySelector('span');
  const loader = btn.querySelector('.btn-loader');
  if (span)   span.classList.toggle('hidden', on);
  if (loader) loader.classList.toggle('hidden', !on);
  btn.disabled = on;
}

// ─── CHECK OAUTH TOKEN IN URL ────────────────────────────
function checkOAuthToken() {
  const params = new URLSearchParams(window.location.search);
  const urlToken = params.get('token');
  if (urlToken) {
    // Decode email from JWT payload
    try {
      const payload = JSON.parse(atob(urlToken.split('.')[1]));
      const email = payload.sub || 'user';
      saveSession(urlToken, email, email.split('@')[0]);
      toast('success', 'Signed in with Google!', `Welcome, ${email}`);
      updateUserUI();
      loadDashboardCounts();
    } catch(e) {
      // fallback
      saveSession(urlToken, 'user', 'User');
      toast('success', 'Signed in with Google!', 'Welcome!');
      updateUserUI();
    }
    // Clean URL
    window.history.replaceState({}, '', window.location.pathname);
  }
}

// ════════════════════════════════════════════════════════
//  API HELPERS
// ════════════════════════════════════════════════════════
async function apiCall(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearSession();
    updateUserUI();
    openAuth();
    throw new Error('Session expired. Please sign in again.');
  }

  const text = await res.text();
  if (!res.ok) throw new Error(text || `HTTP ${res.status}`);

  try { return JSON.parse(text); }
  catch { return text; }
}

// ════════════════════════════════════════════════════════
//  UNIT DROPDOWNS
// ════════════════════════════════════════════════════════
function populateUnits(selectEl, type) {
  selectEl.innerHTML = '<option value="">Select unit</option>';
  if (!type || !UNITS[type]) return;
  UNITS[type].forEach(u => {
    const opt = document.createElement('option');
    opt.value = u;
    opt.textContent = u.charAt(0) + u.slice(1).toLowerCase();
    selectEl.appendChild(opt);
  });
}

function bindTypeToUnit(typeId, unitId) {
  const typeEl = document.getElementById(typeId);
  const unitEl = document.getElementById(unitId);
  typeEl.addEventListener('change', () => populateUnits(unitEl, typeEl.value));
}

// ─── CONVERT page ────────────────────────────────────────
bindTypeToUnit('convType', 'convUnit');

document.getElementById('convType').addEventListener('change', function() {
  populateUnits(document.getElementById('convUnit'), this.value);
  populateUnits(document.getElementById('convTarget'), this.value);
});

// ─── COMPARE page ────────────────────────────────────────
bindTypeToUnit('cmp1Type', 'cmp1Unit');
bindTypeToUnit('cmp2Type', 'cmp2Unit');

// ─── ARITHMETIC page ─────────────────────────────────────
bindTypeToUnit('arith1Type', 'arith1Unit');
bindTypeToUnit('arith2Type', 'arith2Unit');

// ════════════════════════════════════════════════════════
//  CONVERT OPERATION
// ════════════════════════════════════════════════════════
document.getElementById('convertBtn').addEventListener('click', async () => {
  const value = parseFloat(document.getElementById('convValue').value);
  const type  = document.getElementById('convType').value;
  const unit  = document.getElementById('convUnit').value;
  const target= document.getElementById('convTarget').value;

  if (isNaN(value) || !type || !unit || !target) {
    toast('warning', 'Incomplete form', 'Please fill all fields');
    return;
  }

  const btn = document.getElementById('convertBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Converting…';

  try {
    const result = await apiCall(
      `/api/v1/quantities/convert?targetUnit=${target}`,
      {
        method: 'POST',
        body: JSON.stringify({ value, unit, measurementType: type }),
      }
    );

    const box = document.getElementById('convertResult');
    const val = document.getElementById('convertResultVal');
    val.textContent = `${+result.value.toFixed(6)} ${result.unit}`;
    box.classList.remove('hidden');
    toast('success', 'Conversion done!', `${value} ${unit} = ${+result.value.toFixed(6)} ${result.unit}`);

  } catch (err) {
    toast('error', 'Conversion failed', err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa fa-exchange-alt"></i> Convert';
  }
});

// ════════════════════════════════════════════════════════
//  COMPARE OPERATION
// ════════════════════════════════════════════════════════
document.getElementById('compareBtn').addEventListener('click', async () => {
  const q1 = buildQty('cmp1Value','cmp1Unit','cmp1Type');
  const q2 = buildQty('cmp2Value','cmp2Unit','cmp2Type');

  if (!q1 || !q2) { toast('warning', 'Incomplete form', 'Please fill all fields'); return; }

  const btn = document.getElementById('compareBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Comparing…';

  try {
    const result = await apiCall('/api/v1/quantities/compare', {
      method: 'POST',
      body: JSON.stringify([q1, q2]),
    });

    const box = document.getElementById('compareResult');
    const val = document.getElementById('compareResultVal');
    const equal = result === true || result === 'true';

    val.textContent = equal ? '✓ Equal' : '✗ Not Equal';
    val.className   = `result-value compare-result ${equal}`;
    box.classList.remove('hidden');

    if (equal) toast('success', 'Quantities are equal!', 'Both measurements represent the same value');
    else        toast('info', 'Quantities differ', 'The two measurements are not equivalent');

  } catch (err) {
    toast('error', 'Compare failed', err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa fa-not-equal"></i> Compare';
  }
});

// ════════════════════════════════════════════════════════
//  ARITHMETIC OPERATIONS
// ════════════════════════════════════════════════════════
// Tab switching
document.querySelectorAll('.arith-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.arith-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentOp = tab.dataset.op;

    const symbols = { add:'+', subtract:'−', divide:'÷' };
    document.getElementById('opSymbol').textContent = symbols[currentOp] || '+';

    // Clear result
    document.getElementById('arithResult').classList.add('hidden');
  });
});

document.getElementById('arithBtn').addEventListener('click', async () => {
  const q1 = buildQty('arith1Value','arith1Unit','arith1Type');
  const q2 = buildQty('arith2Value','arith2Unit','arith2Type');

  if (!q1 || !q2) { toast('warning', 'Incomplete form', 'Please fill all fields'); return; }

  const btn = document.getElementById('arithBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Calculating…';

  try {
    const endpointMap = { add:'add', subtract:'subtract', divide:'divide' };
    const result = await apiCall(`/api/v1/quantities/${endpointMap[currentOp]}`, {
      method: 'POST',
      body: JSON.stringify([q1, q2]),
    });

    const box = document.getElementById('arithResult');
    const val = document.getElementById('arithResultVal');

    if (currentOp === 'divide') {
      val.textContent = (+result.toFixed(8)).toString();
    } else {
      val.textContent = `${+result.value.toFixed(6)} ${result.unit}`;
    }

    box.classList.remove('hidden');
    toast('success', 'Calculation complete!', `Result: ${val.textContent}`);

  } catch (err) {
    toast('error', 'Operation failed', err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa fa-equals"></i> Calculate';
  }
});

// ─── BUILD QTY HELPER ────────────────────────────────────
function buildQty(valId, unitId, typeId) {
  const value = parseFloat(document.getElementById(valId).value);
  const unit  = document.getElementById(unitId).value;
  const type  = document.getElementById(typeId).value;
  if (isNaN(value) || !unit || !type) return null;
  return { value, unit, measurementType: type };
}

// ════════════════════════════════════════════════════════
//  HISTORY
// ════════════════════════════════════════════════════════
async function loadHistory(operation) {
  if (!token) return;

  currentFilter = operation;
  const list = document.getElementById('historyList');
  list.innerHTML = `<div class="empty-state"><i class="fa fa-spinner fa-spin"></i><p>Loading history…</p></div>`;

  try {
    const ops = operation === 'ALL'
      ? ['CONVERT','COMPARE','ADD','SUBTRACT','DIVIDE']
      : [operation];

    const results = await Promise.all(
      ops.map(op => apiCall(`/api/v1/quantities/history/${op}`))
    );

    historyData = results.flat().sort((a, b) => {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    renderHistory(historyData);

  } catch (err) {
    list.innerHTML = `<div class="empty-state"><i class="fa fa-exclamation-triangle"></i><p>${err.message}</p></div>`;
  }
}

function renderHistory(items) {
  const list = document.getElementById('historyList');

  if (!items.length) {
    list.innerHTML = `<div class="empty-state"><i class="fa fa-history"></i><p>No history found</p></div>`;
    return;
  }

  list.innerHTML = items.map(item => {
    const op = (item.operation || '').toUpperCase();
    const time = item.createdAt
      ? new Date(item.createdAt).toLocaleString('en-IN', { dateStyle:'medium', timeStyle:'short' })
      : '';

    const op2display = item.operand2
      ? `<span>→</span> ${item.operand2}`
      : '';

    return `
      <div class="history-item">
        <span class="hist-op-badge badge-${op}">${op}</span>
        <div class="hist-operands">
          ${item.operand1 || '—'} ${op2display}
        </div>
        <div class="hist-result">${item.result || '—'}</div>
        <div class="hist-time">${time}</div>
      </div>
    `;
  }).join('');
}

// HISTORY FILTERS
document.querySelectorAll('.hist-filter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.hist-filter').forEach(f => f.classList.remove('active'));
    btn.classList.add('active');
    loadHistory(btn.dataset.op);
  });
});

// ════════════════════════════════════════════════════════
//  DASHBOARD COUNTS
// ════════════════════════════════════════════════════════
async function loadDashboardCounts() {
  if (!token) {
    ['CONVERT','COMPARE','ADD','SUBTRACT','DIVIDE'].forEach(op => {
      const el = document.getElementById(`count${op}`);
      if (el) el.textContent = '—';
    });
    return;
  }

  const ops = ['CONVERT','COMPARE','ADD','SUBTRACT','DIVIDE'];
  await Promise.allSettled(
    ops.map(async op => {
      try {
        const count = await apiCall(`/api/v1/quantities/count/${op}`);
        const el = document.getElementById(`count${op}`);
        if (el) animateCount(el, count);
      } catch {
        const el = document.getElementById(`count${op}`);
        if (el) el.textContent = '—';
      }
    })
  );
}

function animateCount(el, target) {
  const start = 0;
  const dur   = 800;
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / dur, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(start + (target - start) * eased);
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// ════════════════════════════════════════════════════════
//  ENTER KEY SUBMIT
// ════════════════════════════════════════════════════════
document.getElementById('loginPassword').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('loginBtn').click();
});

document.getElementById('signupPassword').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('signupBtn').click();
});

// ════════════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════════════
function init() {
  initTheme();
  checkOAuthToken();
  updateUserUI();
  navigateTo('dashboard');
  loadDashboardCounts();
}

init();
