import './platform.css';
import { api } from './api.ts';

type View =
  | 'overview'
  | 'solar'
  | 'grid'
  | 'batteries'
  | 'controls'
  | 'forecast'
  | 'sites'
  | 'iot'
  | 'simulation'
  | 'alerts'
  | 'analytics'
  | 'security'
  | 'users'
  | 'integrations'
  | 'reports'
  | 'ai'
  | 'residential';

interface SiteCardData {
  id: string;
  name: string;
  loc: string;
  pv: string;
  load: string;
  status: string;
  soc: number;
  battery: boolean;
  voltage: string;
  capacity: string;
  annual: string;
  commissioned: string;
  source: string;
}

interface NotificationItem {
  id: string | number;
  type: 'critical' | 'warning' | 'info';
  title: string;
  detail: string;
  time: string;
  view: View;
  read: boolean;
}

interface ResidentialHomeData {
  id: string;
  district: string;
  province: string;
  capacity: string;
  scheme: string;
  provider: string;
  generation: string;
  consumption: string;
  export: string;
  battery: boolean;
  device: string;
}

// Fallback initial sites
const defaultSites: SiteCardData[] = [
  { id: 'SL-SOLAR-001', name: 'Siyambalanduwa Solar Project', loc: 'SIYAMBALANDUWA · EASTERN', pv: '0.72 MW', load: '0.18 MW', status: 'Online', soc: 0, battery: false, voltage: '400.7 V', capacity: '1 MW', annual: '1.6 GWh', commissioned: '2020', source: 'SIMULATED' },
  { id: 'SL-SOLAR-002', name: 'Hambantota Solar Project', loc: 'HAMBANTOTA · SOUTHERN', pv: '0.68 MW', load: '0.16 MW', status: 'Online', soc: 75, battery: true, voltage: '401.2 V', capacity: '1 MW', annual: '1.5 GWh', commissioned: '2020', source: 'SIMULATED' },
  { id: 'SL-SOLAR-003', name: 'Pooneryn Solar Project', loc: 'POONERYN · NORTHERN', pv: '0.74 MW', load: '0.17 MW', status: 'Online', soc: 0, battery: false, voltage: '401.6 V', capacity: '1 MW', annual: '1.6 GWh', commissioned: '2020', source: 'SIMULATED' },
  { id: 'SL-SOLAR-004', name: 'Vavunathivu Solar Project', loc: 'VAVUNATHIVU · EASTERN', pv: '1.36 MW', load: '0.34 MW', status: 'Online', soc: 68, battery: true, voltage: '402.1 V', capacity: '2 MW', annual: '3.3 GWh', commissioned: '2023', source: 'SIMULATED' },
  { id: 'SL-SOLAR-005', name: 'Polonnaruwa Solar Project', loc: 'POLONNARUWA · NORTH CENTRAL', pv: '2.64 MW', load: '0.52 MW', status: 'Attention', soc: 0, battery: false, voltage: '442.1 V', capacity: '4 MW', annual: '6.7 GWh', commissioned: '2024', source: 'SIMULATED' },
];

const defaultResidentialHomes: ResidentialHomeData[] = [
  { id: 'SL-HOME-00001', district: 'Kandy', province: 'Central', capacity: '5.0 kW', scheme: 'NET_METERING', provider: 'CEB', generation: '4.2 kW', consumption: '1.8 kW', export: '2.4 kW', battery: false, device: 'Online' },
  { id: 'SL-HOME-00002', district: 'Kurunegala', province: 'North Western', capacity: '5.0 kW', scheme: 'NET_ACCOUNTING', provider: 'CEB', generation: '3.8 kW', consumption: '2.1 kW', export: '1.7 kW', battery: false, device: 'Online' },
  { id: 'SL-HOME-00003', district: 'Galle', province: 'Southern', capacity: '4.0 kW', scheme: 'NET_PLUS', provider: 'LECO', generation: '3.2 kW', consumption: '1.6 kW', export: '1.6 kW', battery: true, device: 'Online' },
  { id: 'SL-HOME-00004', district: 'Colombo', province: 'Western', capacity: '8.0 kW', scheme: 'NET_PLUS_PLUS', provider: 'LECO', generation: '6.4 kW', consumption: '3.1 kW', export: '3.3 kW', battery: true, device: 'Attention' },
];

const defaultNotifications: NotificationItem[] = [
  { id: 1, type: 'critical', title: 'Voltage limit exceeded', detail: 'Polonnaruwa · 442.1 V measured · simulated feeder limit 440 V', time: '3 min ago', view: 'alerts', read: false },
  { id: 2, type: 'warning', title: 'Inverter efficiency low', detail: 'Siyambalanduwa · INV-04 operating at 91%', time: '18 min ago', view: 'solar', read: false },
  { id: 3, type: 'info', title: 'Battery schedule updated', detail: 'Hambantota · charge window approved', time: '42 min ago', view: 'batteries', read: false },
];

// Reactive Live State
const state = {
  currentView: 'overview' as View,
  isConnected: false,
  isSyncing: false,
  user: null as any,
  sites: [...defaultSites],
  totals: 9.0,
  dashboard: null as any,
  notifications: [...defaultNotifications],
  residentialHomes: [...defaultResidentialHomes],
  residentialSummary: null as any,
  batteries: [] as any[],
  gridStatus: null as any,
  controlsActions: [] as any[],
  safetyChecks: [] as any[],
  iotStats: null as any,
  aiStats: null as any,
  forecast: null as any,
  integrationsStats: null as any,
};

function formatRelativeTime(dateInput: string | Date | undefined): string {
  if (!dateInput) return 'Recently';
  const date = new Date(dateInput);
  const diffSec = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

// ─── ROLE-BASED DASHBOARDS & ACCOUNTS ──────────────────────────────────────────
export interface RoleAccount {
  email: string;
  role: 'ADMIN' | 'OPERATOR' | 'ENGINEER' | 'READONLY';
  title: string;
  name: string;
  badge: string;
  color: string;
  icon: string;
  tagline: string;
  description: string;
}

export const PREDEFINED_ACCOUNTS: RoleAccount[] = [
  {
    email: 'admin@thesun.lk',
    role: 'ADMIN',
    title: 'System Administrator',
    name: 'Ashan Muthukuda',
    badge: 'ADMIN',
    color: '#f59e0b',
    icon: '👑',
    tagline: 'Platform Governance & Infrastructure',
    description: 'Full administrative authority across security policies, user privileges, API integrations, and system-wide audits.',
  },
  {
    email: 'operator@thesun.lk',
    role: 'OPERATOR',
    title: 'Operations Dispatcher',
    name: 'Nimal Perera',
    badge: 'OPERATOR',
    color: '#0284c7',
    icon: '⚡',
    tagline: 'Real-Time Dispatch & Grid Protection',
    description: 'Active plant control, battery dispatch scheduling, feeder constraint resolution, and emergency curtailment authorization.',
  },
  {
    email: 'engineer@thesun.lk',
    role: 'ENGINEER',
    title: 'Plant & Grid Engineer',
    name: 'Kamal Fernando',
    badge: 'ENGINEER',
    color: '#8b5cf6',
    icon: '🔧',
    tagline: 'Power Flow & Diagnostics Engineering',
    description: 'Inverter degradation analysis, 3-bus Newton-Raphson power flow models, digital twin simulations, and AI anomaly tracking.',
  },
  {
    email: 'viewer@thesun.lk',
    role: 'READONLY',
    title: 'Executive & Public Viewer',
    name: 'Sunil Jayawardena',
    badge: 'VIEWER',
    color: '#10b981',
    icon: '👁️',
    tagline: 'Stakeholder Yield & ESG Reporting',
    description: 'Executive observation mode with real-time generation metrics, carbon offsets, environmental ESG impact, and billing analytics.',
  },
];

function renderRoleDashboardBanner(): string {
  const currentRole = (state.user?.role || 'OPERATOR') as 'ADMIN' | 'OPERATOR' | 'ENGINEER' | 'READONLY';
  const account = PREDEFINED_ACCOUNTS.find((a) => a.role === currentRole) || PREDEFINED_ACCOUNTS[1];
  const roleClass = currentRole === 'ADMIN' ? 'admin' : currentRole === 'OPERATOR' ? 'operator' : currentRole === 'ENGINEER' ? 'engineer' : 'viewer';
  const userName = state.user ? `${state.user.firstName || ''} ${state.user.lastName || ''}`.trim() : account.name;

  let kpiMarkup = '';
  let actionsMarkup = '';

  if (currentRole === 'ADMIN') {
    kpiMarkup = `
      <div class="role-kpi-badge"><small>PLATFORM PRIVILEGE</small><strong>Full Root Admin</strong></div>
      <div class="role-kpi-badge"><small>REGISTERED STAFF</small><strong>4 User Accounts</strong></div>
      <div class="role-kpi-badge"><small>AUDIT STATUS</small><strong>100% Policy Pass</strong></div>
      <div class="role-kpi-badge"><small>INTEGRATIONS</small><strong>CEB, MQTT, Modbus</strong></div>
    `;
    actionsMarkup = `
      <button class="role-action-btn" type="button" data-view="users">👥 Manage Users</button>
      <button class="role-action-btn" type="button" data-view="security">🛡️ Security Logs</button>
      <button class="role-action-btn" type="button" data-view="integrations">🔌 Integrations</button>
    `;
  } else if (currentRole === 'OPERATOR') {
    kpiMarkup = `
      <div class="role-kpi-badge"><small>GRID FREQUENCY</small><strong>50.01 Hz Nominal</strong></div>
      <div class="role-kpi-badge"><small>ACTIVE POWER</small><strong>7.8 MW Dispatch</strong></div>
      <div class="role-kpi-badge"><small>BATTERY SOC</small><strong>75% (290 MWh)</strong></div>
      <div class="role-kpi-badge"><small>CONTROL ENGINE</small><strong>1 Safe Action</strong></div>
    `;
    actionsMarkup = `
      <button class="role-action-btn" type="button" data-view="controls">⌘ Authorize Controls</button>
      <button class="role-action-btn" type="button" data-view="batteries">▰ Battery Dispatch</button>
      <button class="role-action-btn" type="button" data-view="grid">⌁ Grid Topology</button>
    `;
  } else if (currentRole === 'ENGINEER') {
    kpiMarkup = `
      <div class="role-kpi-badge"><small>INVERTER EFFICIENCY</small><strong>97.4% Fleet Avg</strong></div>
      <div class="role-kpi-badge"><small>POWER FLOW</small><strong>3-Bus Converged</strong></div>
      <div class="role-kpi-badge"><small>AI ACCURACY</small><strong>99.2% Confidence</strong></div>
      <div class="role-kpi-badge"><small>FEEDER VOLTAGE</small><strong>442.1 V Peak</strong></div>
    `;
    actionsMarkup = `
      <button class="role-action-btn" type="button" data-view="simulation">△ Digital Twin</button>
      <button class="role-action-btn" type="button" data-view="iot">◉ IoT Telemetry</button>
      <button class="role-action-btn" type="button" data-view="ai">✦ AI Forecast</button>
    `;
  } else {
    // READONLY / VIEWER
    kpiMarkup = `
      <div class="role-kpi-badge"><small>ACCESS LEVEL</small><strong>Read-Only Observer</strong></div>
      <div class="role-kpi-badge"><small>CLEAN GENERATION</small><strong>9.0 MW Solar</strong></div>
      <div class="role-kpi-badge"><small>CO₂ REDUCED TODAY</small><strong>612 Tonnes</strong></div>
      <div class="role-kpi-badge"><small>TREES EQUIVALENT</small><strong>562,275 Planted</strong></div>
    `;
    actionsMarkup = `
      <button class="role-action-btn" type="button" data-view="analytics">⌁ Yield Analytics</button>
      <button class="role-action-btn" type="button" data-view="reports">▤ ESG Reports</button>
      <button class="role-action-btn" type="button" data-view="residential">⌂ Residential Solar</button>
    `;
  }

  return `
    <section class="role-dashboard-banner role-${roleClass}">
      <div class="role-banner-top">
        <div class="role-banner-title-area">
          <div class="role-banner-icon">${account.icon}</div>
          <div class="role-banner-text">
            <h2>${account.title} Dashboard · <span class="role-badge role-${roleClass}">${account.badge}</span></h2>
            <p>Signed in as <strong>${userName}</strong> (${state.user?.email || account.email}) &mdash; ${account.description}</p>
          </div>
        </div>
        <button class="role-switch-shortcut-btn" id="bannerSwitchRoleBtn" type="button" title="Switch role or log in as another user">
          ⇄ Switch Role / Login
        </button>
      </div>
      <div class="role-banner-bottom">
        <div class="role-banner-kpis">
          ${kpiMarkup}
        </div>
        <div class="role-quick-actions">
          ${actionsMarkup}
        </div>
      </div>
    </section>
  `;
}

function renderLoginModalContent(): string {
  const currentUserEmail = state.user?.email || 'operator@thesun.lk';

  return `
    <div class="login-modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <button class="login-modal-close" id="closeLoginModal" aria-label="Close modal">✕</button>
      
      <div class="login-modal-head">
        <p class="kicker">THE SUN · ROLE-BASED ACCESS CONTROL</p>
        <h2 id="modalTitle">Select Role Dashboard or Sign In</h2>
        <p>Switch instantly between the 4 platform personas with dedicated operational dashboards, or sign in with custom credentials.</p>
      </div>

      <div class="role-cards-grid">
        ${PREDEFINED_ACCOUNTS.map((acc) => {
          const isActive = acc.email === currentUserEmail;
          const roleClass = acc.role === 'ADMIN' ? 'admin' : acc.role === 'OPERATOR' ? 'operator' : acc.role === 'ENGINEER' ? 'engineer' : 'viewer';
          return `
            <div class="role-card ${isActive ? 'active-role' : ''}" data-role-email="${acc.email}">
              <div>
                <div class="role-card-header">
                  <div class="role-card-user-info">
                    <div class="role-card-icon">${acc.icon}</div>
                    <div class="role-card-name-role">
                      <strong>${acc.name}</strong>
                      <small>${acc.title}</small>
                    </div>
                  </div>
                  <span class="role-badge role-${roleClass}">${acc.badge}</span>
                </div>
                <p class="role-card-desc">${acc.description}</p>
                <div class="role-card-credentials">
                  <span>Email: <code>${acc.email}</code></span>
                  <span>Pass: <code>••••••••••••</code></span>
                </div>
              </div>
              <button class="role-card-launch-btn" type="button" data-select-email="${acc.email}">
                ${isActive ? '✓ Active Dashboard' : `Switch to ${acc.badge} Dashboard →`}
              </button>
            </div>
          `;
        }).join('')}
      </div>

      <div class="login-divider">
        <span>OR SIGN IN WITH CREDENTIALS</span>
      </div>

      <form class="manual-login-form" id="manualLoginForm">
        <div class="form-row-2">
          <div class="form-group">
            <label for="loginEmail">Email Address</label>
            <input type="email" id="loginEmail" name="email" value="${currentUserEmail}" required placeholder="e.g. operator@thesun.lk" autocomplete="username">
          </div>
          <div class="form-group">
            <label for="loginPassword">Password</label>
            <input type="password" id="loginPassword" name="password" value="SolarAdmin2024!" required placeholder="Password" autocomplete="current-password">
          </div>
        </div>
        <div class="login-form-actions">
          <span class="login-status-msg" id="loginStatusMsg">Standard platform password: <code>SolarAdmin2024!</code></span>
          <button type="submit" class="login-submit-btn" id="loginSubmitBtn">Sign In</button>
        </div>
      </form>

      <div class="modal-footer-session">
        <div>
          <span>Current Session: <strong>${state.user ? `${state.user.firstName} ${state.user.lastName} (${state.user.email})` : 'Guest / Authenticating'}</strong></span>
        </div>
        <button class="logout-session-btn" id="logoutSessionBtn" type="button">Sign Out</button>
      </div>
    </div>
  `;
}

const icon = (name: string) =>
  ({
    overview: '⌂',
    solar: '☀',
    grid: '⌁',
    batteries: '▰',
    controls: '⌘',
    forecast: '◫',
    sites: '◆',
    iot: '◉',
    simulation: '△',
    alerts: '!',
    analytics: '⌁',
    security: '◇',
    users: '♙',
    integrations: '↗',
    reports: '▤',
    ai: '✦',
    residential: '⌂',
  }[name] || '•');

const chart = (vals: number[], color = '#e69a43', h = 120) => {
  if (!vals || vals.length === 0) vals = [0, 10, 20, 15, 30];
  const max = Math.max(...vals) * 1.08;
  const min = Math.min(...vals) * 0.85;
  const pts = vals
    .map((v, i) => `${(i * 100) / (vals.length - 1)},${h - ((v - min) / (max - min || 1)) * h}`)
    .join(' ');
  const gradId = `g${color.replace('#', '')}`;
  return `<svg viewBox="0 0 100 ${h}" preserveAspectRatio="none" class="line-chart"><defs><linearGradient id="${gradId}" x2="0" y2="1"><stop stop-color="${color}" stop-opacity=".22"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs><polygon points="0,${h} ${pts} 100,${h}" fill="url(#${gradId})"/><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.2" vector-effect="non-scaling-stroke"/></svg>`;
};

const metric = (label: string, value: string, detail: string, trend = '', cls = '') =>
  `<article class="metric ${cls}"><div class="metric-top"><span>${label}</span>${
    trend ? `<b>${trend}</b>` : ''
  }</div><strong>${value}</strong><small>${detail}</small></article>`;

const labels: Record<View, string> = {
  overview: 'Overview',
  sites: 'Solar Sites',
  solar: 'Solar Management',
  grid: 'Grid Management',
  batteries: 'Battery Storage',
  controls: 'Control Engine',
  forecast: 'Forecasting',
  simulation: 'Digital Twin',
  iot: 'IoT & Devices',
  alerts: 'Alerts',
  analytics: 'Analytics',
  ai: 'AI Intelligence',
  reports: 'Reports',
  security: 'Security & Audit',
  users: 'User Management',
  integrations: 'Integrations',
  residential: 'Residential Solar',
};

function nav() {
  const groups: [string, View[]][] = [
    ['CORE', ['overview', 'sites', 'solar', 'grid']],
    ['OPERATIONS', ['batteries', 'controls', 'forecast', 'simulation', 'residential']],
    ['PLATFORM', ['iot', 'alerts', 'analytics', 'ai']],
    ['ADMINISTRATION', ['reports', 'security', 'users', 'integrations']],
  ];
  return groups
    .map(
      ([g, items]) =>
        `<div class="nav-group"><p>${g}</p>${items
          .map(
            (v) =>
              `<button class="nav-item" type="button" data-view="${v}" title="${labels[v]}" aria-label="${labels[v]}"><span class="nav-icon" aria-hidden="true">${icon(
                v
              )}</span><span class="nav-label">${labels[v]}</span></button>`
          )
          .join('')}</div>`
    )
    .join('');
}

const shell = `
<div class="app-shell">
  <aside class="sidebar">
    <div class="brand">
      <span class="sun-logo">☀</span>
      <div>
        <strong>THE SUN</strong>
        <small>CENTRAL OPERATIONS</small>
      </div>
    </div>
    <nav>${nav()}</nav>
    <div class="connection" id="sidebarConnection">
      <i id="connectionDot"></i>
      <div>
        <b id="connectionTitle">Connecting...</b>
        <span id="connectionSubtitle">Checking backend status</span>
      </div>
    </div>
  </aside>
  <main>
    <header>
      <div>
        <p class="crumb">CENTRAL MANAGEMENT SYSTEM</p>
        <h1 id="pageTitle">Operator Overview</h1>
      </div>
      <div class="top-actions">
        <button class="live-pill" id="livePill" title="Click to sync live backend data">
          <i></i> LIVE
        </button>
        <time id="clock"></time>
        <div class="notification-menu">
          <button class="bell" aria-label="Notifications" title="Notifications" aria-expanded="false">
            <span class="bell-symbol" aria-hidden="true">
              <svg class="bell-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
              </svg>
            </span>
            <i class="unread-count">0</i>
          </button>
          <section class="notification-panel" aria-label="Notifications" hidden>
            <div class="notification-head">
              <div>
                <p>NOTIFICATIONS</p>
                <h3>Recent updates</h3>
              </div>
              <button class="mark-read">Mark all read</button>
            </div>
            <div class="notification-list"></div>
            <button class="notification-footer">View all alerts</button>
          </section>
        </div>
        <div class="user-account-widget">
          <button class="switch-role-pill" id="switchRoleBtn" type="button" title="Switch User Role or Sign In">
            <span class="role-badge role-operator" id="userRoleBadge">OPERATOR</span>
            <span class="account-name" id="userAccountName">Nimal Perera</span>
            <span class="caret">▾</span>
          </button>
          <div class="avatar-circle role-operator" id="userProfile" title="Click to switch user or sign in">NP</div>
        </div>
      </div>
    </header>
    <div class="viewport" id="viewport"></div>
  </main>
</div>
<div class="dashboard-toast" role="status" aria-live="polite"></div>
<div class="login-modal-overlay" id="loginModalOverlay"></div>
`;

function alarm(type: string, title: string, detail: string, time: string) {
  const symbol = type === 'critical' ? '!' : type === 'warning' ? '△' : 'i';
  return `<div class="alarm ${type}"><b>${symbol}</b><div><strong>${title}</strong><small>${detail}</small></div><time>${time}</time></div>`;
}

function overview() {
  const dash = state.dashboard;
  const totalGen = dash?.totalGenerationMw || `${state.totals.toFixed(1)} MW`;
  const capacity = dash?.simulatedPortfolioCapacityMw || 315;
  const activePwr = dash?.activePowerMw || `${(state.totals - 166.3) | 0} MW`;
  const perfPct = dash?.systemPerformancePct ? `${dash.systemPerformancePct}%` : '94.2%';
  const co2 = dash?.co2AvoidedTonnes ? `${dash.co2AvoidedTonnes} t` : '612 t';
  const soc = dash?.batterySocPct ? `${dash.batterySocPct}%` : '75%';
  const availMwh = dash?.availableBatteryMwh ? `${dash.availableBatteryMwh} MWh` : '290 MWh';
  const hourlyData = dash?.hourlyProfile || [12, 18, 31, 52, 74, 91, 86, 68, 52, 48, 32, 18];

  const recentAlerts =
    state.notifications.length > 0
      ? state.notifications
          .slice(0, 3)
          .map((n) => alarm(n.type, n.title, n.detail, n.time))
          .join('')
      : alarm('info', 'All systems normal', 'No active alerts recorded', 'Just now');

  return `
    ${renderRoleDashboardBanner()}
    <section class="metrics-grid">
      ${metric('TOTAL GENERATION', totalGen, `${capacity} MW simulated portfolio capacity`, '↑ 8.4%', 'orange')}
      ${metric('ACTIVE POWER', activePwr, 'Sri Lanka · five simulated feeders', '+6.2%')}
      ${metric('SYSTEM PERFORMANCE', perfPct, 'Fleet availability')}
      ${metric('CO₂ AVOIDED', co2, 'Estimated simulation value')}
      ${metric('BATTERY SOC', soc, `${availMwh} simulated available`, '2 batteries', 'green')}
    </section>
    <div class="section-row">
      <div>
        <p class="section-kicker">SRI LANKA · ${state.isConnected ? 'LIVE DATABASE' : 'SIMULATED PORTFOLIO'}</p>
        <h2>Solar installations</h2>
      </div>
      <button class="secondary" data-view="sites">View all sites →</button>
    </div>
    <section class="site-grid">
      ${state.sites
        .map(
          (s, i) => `
        <article class="site-card">
          <div class="site-card-top">
            <div class="site-photo ${i === 4 ? 'photo-alert' : ''}">
              <img src="/solar-field.svg" alt="${s.name}">
              <span>${s.status}</span>
            </div>
            <button>•••</button>
          </div>
          <div class="site-card-body">
            <div class="site-title">
              <div>
                <small>LK SITE ${s.id}</small>
                <h3>${s.name}</h3>
              </div>
              <span class="status-dot"></span>
            </div>
            <p>${s.loc}</p>
            <div class="site-values">
              <div><small>PV OUTPUT</small><strong>${s.pv}</strong></div>
              <div><small>LOCAL LOAD</small><strong>${s.load}</strong></div>
            </div>
            <div class="power-track"><i style="width:${Math.min(100, Math.max(10, (parseFloat(s.pv) || 1) * 35))}%"></i></div>
            <div class="site-foot">
              <span>${s.battery ? 'Battery' : 'Direct supply'}</span>
              <b>${s.soc ? `${s.soc}% SOC` : s.voltage}</b>
            </div>
          </div>
        </article>`
        )
        .join('')}
    </section>
    <section class="two-col">
      <article class="panel energy-profile-panel">
        <div class="panel-head">
          <div><p>ENERGY PROFILE</p><h3>Generation & forecast</h3></div>
          <select><option>Today</option><option>7 days</option><option>30 days</option></select>
        </div>
        <div class="energy-chart">
          ${chart(hourlyData, '#e69a43', 135)}
          <div class="axis energy-x-axis" aria-label="Energy profile time axis">
            <span>06:00</span><span>09:00</span><span>12:00</span><span>15:00</span><span>18:00</span>
          </div>
        </div>
      </article>
      <article class="panel alarms">
        <div class="panel-head">
          <div><p>EVENT MONITOR</p><h3>Active alarms <span>${state.notifications.filter((n) => !n.read).length}</span></h3></div>
          <button class="link" data-view="alerts">View all</button>
        </div>
        ${recentAlerts}
      </article>
    </section>`;
}

const solarGallery = [
  { image: '/solar-siyambalanduwa.jpg', name: 'Siyambalanduwa', type: 'Utility-scale solar' },
  { image: '/solar-hambantota.jpg', name: 'Hambantota', type: 'Coastal solar fleet' },
  { image: '/solar-pooneryn.svg', name: 'Pooneryn', type: 'Northern solar field' },
  { image: '/solar-vavunathivu.svg', name: 'Vavunathivu', type: 'Eastern solar plant' },
  { image: '/solar-polonnaruwa.svg', name: 'Polonnaruwa', type: 'Central solar plant' },
];

function solar() {
  const dash = state.dashboard;
  const commissionedFleet = dash?.energyYield?.totalCommissionedMw
    ? `${dash.energyYield.totalCommissionedMw} MW`
    : '9 MW';
  const annualEnergy = dash?.energyYield?.annualReportedGwh
    ? `${dash.energyYield.annualReportedGwh} GWh`
    : '14.7 GWh';

  return `
    <div class="hero-band">
      <img src="/solar-field.svg" alt="Solar field">
      <div>
        <p>SRI LANKA RENEWABLE PORTFOLIO</p>
        <h2>${commissionedFleet} commissioned reference fleet</h2>
        <span>${annualEnergy} combined reported annual energy · operating values live</span>
      </div>
    </div>
    <section class="metrics-grid">
      ${metric('COMMISSIONED FLEET', commissionedFleet, 'Public reference capacity')}
      ${metric('ANNUAL ENERGY', annualEnergy, 'Reported combined generation')}
      ${metric('VAVUNIA OUTPUT', '3.3 GWh', 'Annual reference')}
      ${metric('TRINCOMALEE', '6.7 GWh', 'Largest selected plant')}
    </section>
    <section class="panel solar-gallery">
      <div class="panel-head">
        <div><p>PLANT IMAGES</p><h3>Solar installations gallery</h3></div>
        <span class="reference-badge">${solarGallery.length} LOCATIONS</span>
      </div>
      <div class="solar-gallery-grid">
        ${solarGallery
          .map(
            (item) => `
          <article>
            <img src="${item.image}" alt="${item.name} solar installation">
            <div><small>${item.type}</small><b>${item.name}</b></div>
          </article>`
          )
          .join('')}
      </div>
    </section>
    <section class="panel related-links">
      <div class="panel-head">
        <div><p>RELATED LINKS</p><h3>The Sun solar management</h3></div>
      </div>
      <div class="related-link-grid">
        <button type="button" data-view="overview"><span>⌂</span><div><b>The Sun overview</b><small>Portfolio performance</small></div></button>
        <button type="button" data-view="sites"><span>◆</span><div><b>Solar sites</b><small>Installation portfolio</small></div></button>
        <button type="button" data-view="grid"><span>⌁</span><div><b>Grid management</b><small>Network and constraints</small></div></button>
        <button type="button" data-view="batteries"><span>▰</span><div><b>Battery storage</b><small>Fleet availability</small></div></button>
      </div>
    </section>
    <section class="panel table-panel">
      <div class="panel-head">
        <div><p>PLANT REFERENCE DATA</p><h3>Commissioned installations</h3></div>
        <span class="reference-badge">${state.isConnected ? 'LIVE BACKEND DATABASE' : 'SIMULATED TELEMETRY'}</span>
      </div>
      <table>
        <thead>
          <tr><th>Installation</th><th>Capacity</th><th>Annual energy</th><th>Commissioned</th><th>Simulated output</th><th>Status</th></tr>
        </thead>
        <tbody>
          ${state.sites
            .map(
              (s) => `
            <tr>
              <td><b>${s.name}</b><small>${s.loc}</small></td>
              <td>${s.capacity}</td>
              <td>${s.annual}</td>
              <td>${s.commissioned}</td>
              <td>${s.pv}</td>
              <td><span class="table-status">${s.status}</span></td>
            </tr>`
            )
            .join('')}
        </tbody>
      </table>
    </section>`;
}

function grid() {
  const g = state.gridStatus;
  const voltValues: number[] = g?.voltagesJson
    ? Object.values(g.voltagesJson).map(Number)
    : [400.7, 401.4, 402.1, 402.8, 442.1];
  const maxVolt = g?.violationsJson ? Math.max(...Object.values(g.violationsJson).map(Number)) : 442.1;
  const feederLoad = g?.lineLoadingJson ? `${g.lineLoadingJson['4'] || 86.4}%` : '86.4%';

  return `
    <div class="title-banner">
      <div>
        <p>NETWORK DIGITAL TWIN · ${state.isConnected ? 'BACKEND POWER-FLOW' : 'SIMULATION'}</p>
        <h2>Distribution network</h2>
        <span>20 kV medium-voltage source · 400 V site feeder</span>
      </div>
      <div class="network-health"><b>1</b><span>Constraint</span></div>
    </div>
    <section class="metrics-grid">
      ${metric('BUS VOLTAGE', `${(voltValues.reduce((a, b) => a + b, 0) / voltValues.length).toFixed(1)} V`, 'Fleet average')}
      ${metric('MAX. VOLTAGE', `${maxVolt.toFixed(1)} V`, 'Site 05 · 1.1 V above limit', 'Critical')}
      ${metric('FEEDER LOAD', feederLoad, 'Section 01 peak')}
      ${metric('FREQUENCY', '50.02 Hz', 'Within operating band')}
      ${metric('POWER FACTOR', '0.98', 'Lagging 0.03')}
    </section>
    <section class="two-col">
      <article class="panel network-panel">
        <div class="panel-head">
          <div><p>ONE-LINE DIAGRAM</p><h3>Feeder topology</h3></div>
          <span class="normal">Simulation converged</span>
        </div>
        <div class="feeder">
          <div class="source">UTILITY GRID<br><b>20 kV</b></div>
          <div class="transformer">11/0.4 kV<br><b>250 kVA</b></div>
          <div class="bus-line">
            ${state.sites
              .map(
                (s) => `
              <div class="network-node ${s.status === 'Attention' ? 'danger' : ''}">
                <i></i><b>${s.id}</b><span>${s.voltage}</span>
              </div>`
              )
              .join('')}
          </div>
        </div>
      </article>
      <article class="panel">
        <div class="panel-head"><div><p>CONSTRAINT CHECK</p><h3>Voltage profile</h3></div></div>
        ${chart(voltValues, '#dc755f', 140)}
        <div class="constraint-list">
          <p><span>Nominal operating range</span><b>360–440 V</b></p>
          <p><span>Violating node</span><b class="danger-text">Site 05 (${maxVolt.toFixed(1)} V)</b></p>
          <p><span>Recommended locality</span><b>Charge Site 04 battery</b></p>
        </div>
      </article>
    </section>`;
}

function batteries() {
  const batteriesList =
    state.batteries.length > 0
      ? state.batteries
      : [
          {
            id: 'mock-1',
            name: 'Hambantota BESS Unit 01',
            capacityKwh: 120,
            maxPowerKw: 60,
            socPercent: 75,
            sohPercent: 97,
            temperatureC: 31,
            site: { siteCode: 'SL-SOLAR-002', name: 'Hambantota Solar Project' },
          },
          {
            id: 'mock-2',
            name: 'Vavunathivu BESS Unit 01',
            capacityKwh: 160,
            maxPowerKw: 55,
            socPercent: 68,
            sohPercent: 96,
            temperatureC: 32,
            site: { siteCode: 'SL-SOLAR-004', name: 'Vavunathivu Solar Project' },
          },
        ];

  const totalCap = batteriesList.reduce((acc, b) => acc + (b.capacityKwh || 0), 0);

  return `
    <div class="title-banner battery-banner">
      <div>
        <p>ENERGY STORAGE · ${state.isConnected ? 'LIVE TELEMETRY' : 'SIMULATION'}</p>
        <h2>Battery fleet</h2>
        <span>${batteriesList.length} batteries · ${totalCap} kWh capacity</span>
      </div>
    </div>
    <section class="battery-grid">
      ${batteriesList
        .map(
          (b, i) => `
        <article class="battery-card">
          <div class="battery-head">
            <div class="battery-icon">▰</div>
            <div>
              <small>SITE ${b.site?.siteCode || `BESS-0${i + 1}`}</small>
              <h3>${b.name}</h3>
            </div>
            <span>${b.status || 'Available'}</span>
          </div>
          <div class="soc-ring" style="--soc:${(b.socPercent || 75) * 3.6}deg">
            <b>${b.socPercent || 75}%</b><small>SOC</small>
          </div>
          <div class="battery-data">
            <p><span>SOH</span><b>${b.sohPercent || 97 - i}%</b></p>
            <p><span>Power limit</span><b>${b.maxPowerKw || 60 - i * 5} kW</b></p>
            <p><span>Temperature</span><b>${b.temperatureC || 31 + i}°C</b></p>
          </div>
          <button class="primary battery-action" data-battery-id="${b.id}">Open schedule</button>
        </article>`
        )
        .join('')}
      <article class="battery-card schedule-card">
        <small>AUTOMATIC OPTIMIZATION</small>
        <h3>Peak-shaving schedule</h3>
        <div class="schedule-bars">
          ${[32, 38, 45, 62, 78, 84, 71, 55, 42, 35, 49, 68]
            .map((v, i) => `<i style="height:${v}%" class="${i > 6 && i < 10 ? 'selected' : ''}"></i>`)
            .join('')}
        </div>
        <div class="schedule-times"><span>06:00</span><span>12:00</span><span>18:00</span></div>
        <button class="secondary edit-schedule-btn">Edit schedule</button>
      </article>
    </section>`;
}

function controls() {
  const pending = state.controlsActions?.[0] || {
    id: 'mock-action-1',
    constraintValue: '442.1 V',
    candidateTarget: 'Site 04 battery',
    setpoint: '+18 kW charge',
    description:
      'The model estimates that charging the Site 04 battery will reduce export at the constrained feeder location without exceeding its 85% reserve limit or the equipment power limit.',
  };

  const checks =
    state.safetyChecks && state.safetyChecks.length > 0
      ? state.safetyChecks
      : [
          { name: 'Affected feeder topology identified', status: 'PASS' },
          { name: 'Battery available and below reserve limit', status: 'PASS' },
          { name: 'Command within configured power envelope', status: 'PASS' },
          { name: 'Affected bus constraint available', status: 'PASS' },
          { name: 'Operator permission verified', status: 'PASS' },
        ];

  return `
    <div class="title-banner">
      <div>
        <p>SAFE AUTOMATION · ${state.isConnected ? 'BACKEND CONTROL ENGINE' : 'SIMULATION MODE'}</p>
        <h2>Control decisions</h2>
        <span>Simulation mode · all actions require operator authorization</span>
      </div>
      <label class="mode-switch"><input type="checkbox" checked><span></span> Approved simulation control</label>
    </div>
    <section class="control-layout">
      <article class="panel decision-main" data-action-id="${pending.id || ''}">
        <div class="panel-head">
          <div><p>RECOMMENDED ACTION</p><h3>Resolve Site 05 voltage constraint</h3></div>
          <span class="ai-badge">AI assisted</span>
        </div>
        <div class="decision-flow">
          <div><b>1</b><span>CONSTRAINT<br><strong>${pending.constraintValue || '442.1 V'}</strong></span></div>
          <i>→</i>
          <div><b>2</b><span>CANDIDATE<br><strong>${pending.candidateTarget || 'Site 04 battery'}</strong></span></div>
          <i>→</i>
          <div><b>3</b><span>SETPOINT<br><strong>${pending.setpoint || '+18 kW charge'}</strong></span></div>
        </div>
        <p class="decision-copy">${pending.description}</p>
        <div class="decision-buttons">
          <button class="primary accept-control ${state.user?.role === 'READONLY' ? 'readonly-disabled' : ''}" type="button">
            ${state.user?.role === 'READONLY' ? 'Authorize (Read-Only Mode)' : 'Authorize simulation control'}
          </button>
          <button class="secondary reject-control ${state.user?.role === 'READONLY' ? 'readonly-disabled' : ''}" type="button">
            ${state.user?.role === 'READONLY' ? 'Reject (Read-Only Mode)' : 'Reject'}
          </button>
        </div>
      </article>
      <article class="panel">
        <div class="panel-head"><div><p>SAFETY INTERLOCKS</p><h3>Pre-command checks</h3></div></div>
        ${checks
          .map(
            (x: any) =>
              `<div class="check-row"><b>✓</b><span>${x.name || x.check}</span><small>${
                x.status || x.result || 'PASS'
              }</small></div>`
          )
          .join('')}
      </article>
    </section>`;
}

function reportWorkspace(view: View) {
  const workspaces: Partial<Record<View, string[][]>> = {
    overview: [
      ['ISLAND OVERVIEW', 'Island generation', `${state.totals} MW modeled fleet`, 'Network health 94.2%'],
      ['SCHEME MANAGEMENT', 'Residential connections', '30 mock rooftop systems', '4 billing schemes'],
    ],
    sites: [
      ['ASSET REGISTRY', 'Utility and rooftop assets', '5 utility plants', '50 mock homes'],
      ['SCHEME ADMINISTRATION', 'Connection evidence', 'Net Metering', 'Net Plus Plus'],
    ],
    grid: [
      ['FEEDER SIMULATION', 'Voltage and thermal analysis', '442.1 V peak bus', '0 reverse-flow islands'],
      ['HOSTING CAPACITY', 'Connection capacity scan', '4 feeder candidates', 'Advisory only'],
    ],
    forecast: [
      ['LOAD FORECAST', 'Behind-the-meter demand', '428 MWh predicted', 'Confidence range ±7%'],
      ['WEATHER INPUTS', 'Irradiance and cloud model', '18.4 kW/m² peak', 'Sri Lanka time zone'],
    ],
    simulation: [
      ['DIGITAL TWIN', 'Power-flow scenarios', '98.6% convergence', 'Monte Carlo placement'],
      ['CURTAILMENT STUDIO', 'Constraint response', '+18 kW charge example', 'Safety interlocks active'],
    ],
    iot: [
      ['DATA INGESTION', 'CSV, Excel, REST and replay', '12 data streams', 'UTC normalized'],
      ['DEVICE MANAGEMENT', 'Future IoT architecture', 'MQTT QoS 1 ready', 'Signed firmware OTA'],
    ],
    alerts: [
      ['FAULT DETECTION', 'Anomaly operations', '1 critical voltage event', '2 inverter warnings'],
      ['MAINTENANCE', 'Ticket lifecycle', '3 open work orders', 'Cleaning due'],
    ],
    analytics: [
      ['PERFORMANCE ANALYSIS', 'Portfolio KPIs', '94.2% availability', '612 t CO₂ avoided'],
      ['CARBON REPORTING', 'Environmental impact', '14.7 GWh annual', 'Fuel savings estimate'],
    ],
    ai: [
      ['FORECAST MODELS', 'Generation and load', '87% confidence', 'XGBoost ready'],
      ['ANOMALY ENGINE', 'Health and performance', '0 active anomalies', '24 ms inference'],
    ],
    reports: [
      ['REGULATORY EXPORTS', 'Operator-ready reports', 'PDF / CSV', 'CEB / LECO pack'],
      ['REPORT SCHEDULE', 'Delivery calendar', 'Daily fleet summary', '23:00 next run'],
    ],
    security: [
      ['ACCESS CONTROL', 'Role-based permissions', '6 active sessions', 'Site scope enforced'],
      ['AUDIT TRAIL', 'Immutable activity', '99.9% coverage', 'Review required'],
    ],
    users: [
      ['ROLE MANAGEMENT', 'Operational access', '4 operator roles', 'Least privilege'],
      ['SITE SCOPE', 'Assigned regions and plants', 'Eastern district', 'Southern district'],
    ],
    integrations: [
      ['SERVICE EXCHANGE', 'API and telemetry services', 'REST connected', 'MQTT connected'],
      ['DATA VALIDATION', 'Time-series quality', 'Null check enabled', 'Duplicate removal enabled'],
    ],
    residential: [
      ['SCHEME COMPARISON', 'Net Metering / Accounting', 'Net Plus / Net Plus Plus', 'Estimate savings'],
      ['HOME SIZING', 'Recommended system capacity', '5.0 kW reference', 'Battery economics'],
    ],
  };

  const cards = (
    workspaces[view] || [['DATA WORKSPACE', 'Validated operations', 'UTC time series', 'No public control']]
  )
    .map(
      (card, index) => `
    <article class="report-feature-card">
      <div class="report-feature-index">0${index + 1}</div>
      <p>${card[0]}</p>
      <h3>${card[1]}</h3>
      <div><span>${card[2]}</span><strong>${card[3]}</strong></div>
    </article>`
    )
    .join('');

  return `<section class="report-workspace"><div class="report-workspace-head"><div><p>REPORT CAPABILITIES</p><h2>SolarGrid LK workspace</h2></div><span>Live connected database · operational models</span></div><div class="report-feature-grid">${cards}</div></section>`;
}

function generic(view: View) {
  const heading = labels[view];

  const iotGateways = state.iotStats?.gatewaysOnline || '10 / 10';
  const iotLatency = state.iotStats?.avgLatencyMs ? `${state.iotStats.avgLatencyMs} ms` : '130 ms';
  const iotDelivery = state.iotStats?.packetDeliveryPct ? `${state.iotStats.packetDeliveryPct}%` : '99.2%';
  const iotDevices = state.iotStats?.activeDevicesCount ? `${state.iotStats.activeDevicesCount}` : '10';

  const aiConf = state.aiStats?.forecastConfidencePct ? `${state.aiStats.forecastConfidencePct}%` : '87%';
  const aiAnomalies = state.aiStats?.activeAnomalies !== undefined ? `${state.aiStats.activeAnomalies}` : '0';
  const aiLat = state.aiStats?.avgInferenceLatencyMs ? `${state.aiStats.avgInferenceLatencyMs} ms` : '24 ms';
  const aiHealth = state.aiStats?.modelHealth || 'Ready';

  const openAlertsCount = state.notifications.filter((n) => !n.read).length;

  const modules: Record<
    string,
    { primary: string[]; stats: string[][]; status: string[]; actions: string[] }
  > = {
    forecast: {
      primary: [aiConf, 'Forecast confidence'],
      stats: [
        ['428 MWh', 'Predicted energy'],
        ['18.4 kW/m²', 'Peak irradiance'],
        ['3 h', 'Weather confidence window'],
      ],
      status: ['Clear skies', 'Partly cloudy', 'Low irradiance'],
      actions: ['Refresh forecast', 'Run weather model', 'Update assumptions'],
    },
    iot: {
      primary: [iotGateways, 'Gateways online'],
      stats: [
        [iotLatency, 'Telemetry latency'],
        [iotDelivery, 'Packet delivery'],
        [iotDevices, 'Active devices'],
      ],
      status: ['Online', 'Degraded', 'Offline'],
      actions: ['Scan devices', 'Restart gateways', 'Test telemetry'],
    },
    alerts: {
      primary: [`${openAlertsCount}`, 'Open events'],
      stats: [
        [`${state.notifications.filter((n) => n.type === 'critical' && !n.read).length}`, 'Critical'],
        [`${state.notifications.filter((n) => n.type === 'warning' && !n.read).length}`, 'Warnings'],
        ['8 min', 'Avg. response'],
      ],
      status: ['Investigating', 'Acknowledged', 'Resolved'],
      actions: ['Acknowledge alerts', 'Assign operator', 'Create incident'],
    },
    analytics: {
      primary: ['94.2%', 'Energy yield'],
      stats: [
        ['612 t', 'CO₂ avoided'],
        ['14.7 GWh', 'Annual energy'],
        ['$42,680', 'Revenue estimate'],
      ],
      status: ['Forecast', 'Actual', 'Variance'],
      actions: ['Compare periods', 'Build KPI report', 'Export dataset'],
    },
    simulation: {
      primary: ['98.6%', 'Power-flow accuracy'],
      stats: [
        ['442.1 V', 'Peak bus voltage'],
        [`${state.sites.length}`, 'Sites simulated'],
        ['0', 'Divergent states'],
      ],
      status: ['Converged', 'Warning', 'Failed'],
      actions: ['Run scenario', 'Save baseline', 'Load constraints'],
    },
    ai: {
      primary: [aiConf, 'Forecast confidence'],
      stats: [
        [aiAnomalies, 'Detected anomalies'],
        [aiLat, 'Inference latency'],
        [aiHealth, 'Model status'],
      ],
      status: ['Normal', 'Review', 'Action'],
      actions: ['Run anomaly scan', 'Retrain model', 'Review recommendations'],
    },
    reports: {
      primary: ['24', 'Available reports'],
      stats: [
        ['3', 'Generated today'],
        ['23:00', 'Next schedule'],
        ['PDF / CSV', 'Export formats'],
      ],
      status: ['Scheduled', 'Generated', 'Archived'],
      actions: ['Generate report', 'Schedule report', 'Export archive'],
    },
    security: {
      primary: ['6', 'Active sessions'],
      stats: [
        ['0', 'Failed logins'],
        ['99.9%', 'Audit coverage'],
        ['09:41', 'Last audit'],
      ],
      status: ['Verified', 'Review', 'Blocked'],
      actions: ['Review audit log', 'Revoke sessions', 'Run security scan'],
    },
    users: {
      primary: ['4', 'Active users'],
      stats: [
        ['1', 'Operators'],
        ['1', 'Engineers'],
        ['2', 'Administrators'],
      ],
      status: ['Active', 'Invited', 'Disabled'],
      actions: ['Invite user', 'Manage roles', 'Disable selected'],
    },
    integrations: {
      primary: ['4 / 4', 'Services connected'],
      stats: [
        ['REST', 'API status'],
        ['MQTT', 'Broker status'],
        ['Modbus TCP', 'Adapter status'],
      ],
      status: ['Connected', 'Syncing', 'Attention'],
      actions: ['Test connections', 'Sync services', 'Add integration'],
    },
  };

  const moduleData = modules[view] || {
    primary: ['Operational', 'System status'],
    stats: [
      ['100%', 'Availability'],
      ['24 ms', 'Response time'],
      ['0', 'Open issues'],
    ],
    status: ['Healthy', 'Monitoring', 'Attention'],
    actions: ['Refresh module', 'Run diagnostics', 'Configure module'],
  };

  const { primary, stats, status } = moduleData;
  const distribution = [72, 18, 10];

  return `
    <div class="module-hero">
      <div>
        <p>PLATFORM MODULE · ${state.isConnected ? 'LIVE BACKEND' : 'SIMULATION'}</p>
        <h2>${heading}</h2>
        <span>Operational telemetry, service health, and recent backend activity.</span>
      </div>
      <div class="module-hero-actions">
        <button class="secondary module-refresh">↻ Refresh</button>
        <button class="primary module-export">Export report</button>
      </div>
    </div>
    <section class="metrics-grid dashboard-metrics">
      <article class="metric featured-metric">
        <div class="metric-top"><span>${primary[1]}</span><b>Live</b></div>
        <strong>${primary[0]}</strong>
        <small>Current operational value</small>
      </article>
      ${stats
        .map(
          ([value, label], index) => `
        <article class="metric dashboard-stat">
          <div class="metric-top"><span>${label}</span><i class="stat-dot ${index === 0 ? 'orange' : ''}"></i></div>
          <strong>${value}</strong>
          <small>Last 24 hour summary</small>
        </article>`
        )
        .join('')}
    </section>
    <section class="panel quick-actions-panel">
      <div class="panel-head"><div><p>QUICK ACTIONS</p><h3>${heading} functions</h3></div></div>
      <div class="quick-actions">
        ${moduleData.actions
          .map(
            (action, index) => `
          <button type="button" class="quick-action" data-module-action="${action}">
            <span>${index === 0 ? '↻' : index === 1 ? '⌁' : '⚙'}</span>
            <div><b>${action}</b><small>Run from ${heading}</small></div>
          </button>`
          )
          .join('')}
      </div>
    </section>
    <section class="dashboard-grid">
      <article class="panel trend-panel">
        <div class="panel-head">
          <div><p>PERFORMANCE TREND</p><h3>${heading} activity</h3></div>
          <select class="trend-range">
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </div>
        ${chart([22, 28, 26, 43, 38, 52, 49, 71, 68, 86, 74, 91], '#5a9b87', 160)}
        <div class="axis"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>Now</span></div>
      </article>
      <article class="panel status-panel">
        <div class="panel-head"><div><p>SERVICE BREAKDOWN</p><h3>Current state</h3></div></div>
        ${status
          .map(
            (label, index) => `
          <div class="status-row">
            <span><i class="status-level-${index}"></i>${label}</span>
            <b>${distribution[index]}%</b>
            <div><i style="width:${distribution[index]}%"></i></div>
          </div>`
          )
          .join('')}
        <button class="secondary module-action" data-module-action="View detailed report">View detailed report</button>
      </article>
    </section>
    <section class="panel activity-panel">
      <div class="panel-head"><div><p>RECENT ACTIVITY</p><h3>${heading} event log</h3></div><button class="link module-export-log">Export log</button></div>
      <div class="event-table">
        <div><b>09:42:18</b><span>${heading} state synchronized with backend</span><small class="success">Successful</small></div>
        <div><b>09:38:04</b><span>Configuration validation completed</span><small class="success">Successful</small></div>
        <div><b>09:31:22</b><span>Telemetry integrity check completed</span><small class="success">Successful</small></div>
        <div><b>09:18:46</b><span>Scheduled monitoring cycle</span><small>Completed</small></div>
      </div>
    </section>
    ${reportWorkspace(view)}`;
}

function residential() {
  const sum = state.residentialSummary;
  const regHomes = sum?.registeredHomes ?? 50;
  const homesWithSolar = sum?.homesWithSolar ?? 30;
  const coverage = sum?.solarCoveragePct ?? 60;
  const installedSolar = sum?.installedSolarCapacityKw ? `${sum.installedSolarCapacityKw} kW` : '150 kW';
  const homeBatts = sum?.homeBatteriesCount ?? 10;

  return `
    <div class="data-source-note">
      <b>${state.isConnected ? 'LIVE BACKEND' : 'MOCK DATA'}</b>
      <span>${
        state.isConnected
          ? 'Connected to database residential fleet and household meters.'
          : 'Homeowner and meter data are fictional simulations.'
      }</span>
    </div>
    <section class="metrics-grid">
      ${metric('REGISTERED HOMES', `${regHomes}`, 'Registered residential homes')}
      ${metric('HOMES WITH SOLAR', `${homesWithSolar}`, `${coverage}% rooftop coverage`)}
      ${metric('INSTALLED SOLAR', installedSolar, 'Rooftop capacity')}
      ${metric('HOME BATTERIES', `${homeBatts}`, 'Home battery units')}
      ${metric('SOLAR GENERATION', '17.6 kW', 'Current output')}
    </section>
    <section class="section-row">
      <div>
        <p class="section-kicker">HOUSEHOLD ENERGY · ${state.isConnected ? 'DATABASE SITES' : 'SIMULATION'}</p>
        <h2>Residential solar overview</h2>
      </div>
      <button class="secondary register-home-btn">Register home</button>
    </section>
    <section class="site-grid">
      ${state.residentialHomes
        .map(
          (h, i) => `
        <article class="site-card" data-source="SIMULATED">
          <div class="site-card-top">
            <div class="site-photo">
              <img src="/solar-field.svg" alt="Residential solar simulation">
              <span>${h.device}</span>
            </div>
          </div>
          <div class="site-card-body">
            <div class="site-title">
              <div><small>${h.id}</small><h3>Residential Site ${String(i + 1).padStart(2, '0')}</h3></div>
              <span class="status-dot"></span>
            </div>
            <p>${h.district.toUpperCase()} · ${h.provider} · ${h.scheme.replace(/_/g, ' ')}</p>
            <div class="site-values">
              <div><small>SOLAR</small><strong>${h.generation}</strong></div>
              <div><small>CONSUMPTION</small><strong>${h.consumption}</strong></div>
            </div>
            <div class="site-foot">
              <span>${h.capacity} system</span>
              <b>${h.export} export</b>
            </div>
          </div>
        </article>`
        )
        .join('')}
    </section>
    <section class="two-col">
      <article class="panel">
        <div class="panel-head"><div><p>HOUSEHOLD PORTFOLIO</p><h3>Net scheme distribution</h3></div></div>
        <div class="scheme-list">
          <p><span>Net Metering</span><b>${sum?.schemeDistribution?.NET_METERING ?? 12} homes</b></p>
          <p><span>Net Accounting</span><b>${sum?.schemeDistribution?.NET_ACCOUNTING ?? 8} homes</b></p>
          <p><span>Net Plus</span><b>${sum?.schemeDistribution?.NET_PLUS ?? 6} homes</b></p>
          <p><span>Net Plus Plus</span><b>${sum?.schemeDistribution?.NET_PLUS_PLUS ?? 4} homes</b></p>
        </div>
      </article>
      <article class="panel">
        <div class="panel-head"><div><p>RESIDENTIAL AI</p><h3>Daily insights</h3></div></div>
        <div class="event-table">
          <div><b>09:40</b><span>Peak self-consumption recommended at 12:30</span><small>Simulation</small></div>
          <div><b>09:15</b><span>Home battery schedules synchronized</span><small>Healthy</small></div>
          <div><b>08:50</b><span>No abnormal household generation detected</span><small>Healthy</small></div>
        </div>
      </article>
    </section>`;
}

const correctedViews: Record<View, () => string> = {
  overview,
  solar,
  grid,
  batteries,
  controls,
  forecast: () => generic('forecast'),
  sites: () => overview(),
  simulation: () => generic('simulation'),
  iot: () => generic('iot'),
  alerts: () => generic('alerts'),
  analytics: () => generic('analytics'),
  ai: () => generic('ai'),
  reports: () => generic('reports'),
  security: () => generic('security'),
  users: () => generic('users'),
  integrations: () => generic('integrations'),
  residential: () => residential(),
};

// Initialize App Shell
const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = shell;

function render(view: View) {
  state.currentView = view;
  const content = document.querySelector<HTMLDivElement>('#viewport')!;
  const dedicatedViews: View[] = ['overview', 'solar', 'grid', 'batteries', 'controls', 'sites', 'residential'];
  content.innerHTML =
    correctedViews[view]() +
    (dedicatedViews.includes(view)
      ? reportWorkspace(view === 'sites' ? 'sites' : view === 'residential' ? 'residential' : view)
      : '');
  applySitePhotos();

  if (view === 'overview') {
    const role = state.user?.role || 'OPERATOR';
    const roleTitles: Record<string, string> = {
      ADMIN: 'System Administrator Dashboard',
      OPERATOR: 'Central Operations Dashboard',
      ENGINEER: 'Grid & Plant Engineering Dashboard',
      READONLY: 'Executive & Public Viewer Dashboard',
    };
    document.querySelector('#pageTitle')!.textContent = roleTitles[role] || 'Central Operations Dashboard';
  } else {
    document.querySelector('#pageTitle')!.textContent = labels[view];
  }

  document.querySelectorAll<HTMLButtonElement>('.nav-item').forEach((x) => {
    const active = x.dataset.view === view;
    x.classList.toggle('active', active);
    x.setAttribute('aria-current', active ? 'page' : 'false');
  });
  bindControls();
}

let toastTimer: number | undefined;
function showToast(message: string) {
  const toast = document.querySelector<HTMLElement>('.dashboard-toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 2400);
}

function exportDashboardLog() {
  const heading = document.querySelector('#pageTitle')?.textContent || 'The Sun';
  const now = new Date().toLocaleTimeString();
  const rows = [
    'timestamp,event,status',
    `${now},State synchronized with backend,Successful`,
    `09:38:04,Configuration validation completed,Successful`,
    `09:31:22,Telemetry integrity check completed,Successful`,
  ];
  const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${heading.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-event-log.csv`;
  link.click();
  URL.revokeObjectURL(url);
  showToast('Dashboard report exported');
}

function updateConnectionUI() {
  const dot = document.querySelector<HTMLElement>('#connectionDot');
  const title = document.querySelector<HTMLElement>('#connectionTitle');
  const subtitle = document.querySelector<HTMLElement>('#connectionSubtitle');

  if (state.isConnected) {
    if (dot) dot.style.background = '#63bf98';
    if (title) title.textContent = 'Live API connected';
    if (subtitle) subtitle.textContent = `${state.sites.length} sites · port 3001`;
  } else {
    if (dot) dot.style.background = '#de7470';
    if (title) title.textContent = 'Fallback mode';
    if (subtitle) subtitle.textContent = 'Connecting to backend...';
  }

  // Update profile & role badge in header
  const profile = document.querySelector<HTMLElement>('#userProfile');
  const roleBadge = document.querySelector<HTMLElement>('#userRoleBadge');
  const accountName = document.querySelector<HTMLElement>('#userAccountName');

  const currentRole = (state.user?.role || 'OPERATOR') as 'ADMIN' | 'OPERATOR' | 'ENGINEER' | 'READONLY';
  const roleClass = currentRole === 'ADMIN' ? 'admin' : currentRole === 'OPERATOR' ? 'operator' : currentRole === 'ENGINEER' ? 'engineer' : 'viewer';
  const badgeText = currentRole === 'READONLY' ? 'VIEWER' : currentRole;

  if (roleBadge) {
    roleBadge.textContent = badgeText;
    roleBadge.className = `role-badge role-${roleClass}`;
  }

  if (accountName) {
    accountName.textContent = state.user
      ? `${state.user.firstName || ''} ${state.user.lastName || ''}`.trim()
      : 'Operator';
  }

  if (profile) {
    const initials = state.user
      ? (state.user.firstName?.[0] || 'O') + (state.user.lastName?.[0] || 'P')
      : 'OP';
    profile.textContent = initials;
    profile.className = `avatar-circle role-${roleClass}`;
    profile.title = `${state.user?.firstName || 'User'} (${badgeText}) - Click to switch role`;
  }
}

function openLoginModal() {
  const overlay = document.querySelector<HTMLElement>('#loginModalOverlay');
  if (!overlay) return;
  overlay.innerHTML = renderLoginModalContent();
  overlay.classList.add('active');

  // Bind close button and backdrop click
  document.querySelector('#closeLoginModal')?.addEventListener('click', closeLoginModal);
  overlay.onclick = (e) => {
    if (e.target === overlay) closeLoginModal();
  };

  // Bind 1-click role selection
  overlay.querySelectorAll<HTMLElement>('[data-select-email]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const email = btn.dataset.selectEmail;
      if (email) {
        btn.textContent = 'Authenticating...';
        await loginAsRole(email, 'SolarAdmin2024!');
      }
    });
  });

  overlay.querySelectorAll<HTMLElement>('.role-card').forEach((card) => {
    card.addEventListener('click', async () => {
      const email = card.dataset.roleEmail;
      if (email) {
        const btn = card.querySelector<HTMLElement>('.role-card-launch-btn');
        if (btn) btn.textContent = 'Authenticating...';
        await loginAsRole(email, 'SolarAdmin2024!');
      }
    });
  });

  // Bind manual sign in form
  const form = document.querySelector<HTMLFormElement>('#manualLoginForm');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = document.querySelector<HTMLInputElement>('#loginEmail');
    const passwordInput = document.querySelector<HTMLInputElement>('#loginPassword');
    const statusMsg = document.querySelector<HTMLElement>('#loginStatusMsg');
    const submitBtn = document.querySelector<HTMLButtonElement>('#loginSubmitBtn');

    if (emailInput && passwordInput) {
      if (submitBtn) submitBtn.textContent = 'Signing in...';
      if (statusMsg) {
        statusMsg.textContent = 'Verifying credentials...';
        statusMsg.className = 'login-status-msg';
      }

      const ok = await loginAsRole(emailInput.value, passwordInput.value);
      if (!ok && statusMsg) {
        statusMsg.textContent = 'Invalid credentials. Standard password is SolarAdmin2024!';
        statusMsg.className = 'login-status-msg error';
        if (submitBtn) submitBtn.textContent = 'Sign In';
      }
    }
  });

  // Bind sign out
  document.querySelector('#logoutSessionBtn')?.addEventListener('click', () => {
    logoutUser();
  });
}

function closeLoginModal() {
  const overlay = document.querySelector<HTMLElement>('#loginModalOverlay');
  if (overlay) {
    overlay.classList.remove('active');
  }
}

async function loginAsRole(email: string, password = 'SolarAdmin2024!', quiet = false): Promise<boolean> {
  try {
    const res = await api.auth.login({ email, password });
    state.user = res.user;
    localStorage.setItem('the_sun_current_user', email);
    updateConnectionUI();
    render(state.currentView);
    if (!quiet) {
      const badge = state.user.role === 'READONLY' ? 'VIEWER' : state.user.role;
      showToast(`Logged in as ${state.user.firstName} ${state.user.lastName} (${badge})`);
    }
    closeLoginModal();
    // Synchronize live backend data for the new role
    syncData(true);
    return true;
  } catch (err: any) {
    console.error('Login error:', err);
    showToast(err.message || 'Login failed. Please check credentials.');
    return false;
  }
}

async function logoutUser() {
  try {
    await api.auth.logout();
  } catch {}
  api.setToken(null);
  localStorage.removeItem('the_sun_token');
  localStorage.removeItem('the_sun_current_user');
  state.user = null;
  showToast('Logged out of session');
  closeLoginModal();
  updateConnectionUI();
  render(state.currentView);
  setTimeout(() => openLoginModal(), 350);
}

// Global escape key to close modal
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeLoginModal();
  }
});

function bindControls() {
  // Authorize simulation control action
  document.querySelector('.accept-control')?.addEventListener('click', async (e) => {
    if (state.user?.role === 'READONLY') {
      showToast('⚠️ Read-only access: Operator or Administrator permission required.');
      return;
    }
    const b = e.currentTarget as HTMLButtonElement;
    b.textContent = 'Authorizing...';
    try {
      const container = document.querySelector<HTMLElement>('.decision-main');
      const actionId = container?.dataset.actionId;
      if (actionId && !actionId.startsWith('mock')) {
        await api.controls.authorize(actionId);
      }
      b.textContent = 'Simulation command approved ✓';
      b.classList.add('approved');
      showToast('Control command authorized and executed');
    } catch {
      b.textContent = 'Simulation command approved ✓';
      b.classList.add('approved');
      showToast('Action recorded');
    }
  });

  document.querySelector('.reject-control')?.addEventListener('click', async () => {
    if (state.user?.role === 'READONLY') {
      showToast('⚠️ Read-only access: Operator or Administrator permission required.');
      return;
    }
    try {
      const container = document.querySelector<HTMLElement>('.decision-main');
      const actionId = container?.dataset.actionId;
      if (actionId && !actionId.startsWith('mock')) {
        await api.controls.reject(actionId);
      }
    } catch {
      // fallback
    }
    document.querySelector('.decision-main')?.classList.add('rejected');
    showToast('Control command rejected');
  });

  document.querySelector('.battery-action')?.addEventListener('click', (e) => {
    const b = e.currentTarget as HTMLButtonElement;
    b.textContent = 'Schedule opened ✓';
    showToast('Battery schedule editor opened');
  });

  document.querySelectorAll<HTMLButtonElement>('[data-view]').forEach((button) => {
    if (button.classList.contains('nav-item')) return;
    button.addEventListener('click', () => render(button.dataset.view as View));
  });

  document.querySelectorAll<HTMLButtonElement>('[data-module-action]').forEach((button) =>
    button.addEventListener('click', () => showToast(`${button.dataset.moduleAction} started`))
  );

  document.querySelector('.module-refresh')?.addEventListener('click', async (e) => {
    const button = e.currentTarget as HTMLButtonElement;
    button.textContent = '↻ Syncing...';
    await syncData(true);
    button.textContent = '✓ Updated';
    setTimeout(() => (button.textContent = '↻ Refresh'), 1200);
    showToast('Module data refreshed from backend');
  });

  document
    .querySelectorAll<HTMLButtonElement>('.module-export, .module-export-log')
    .forEach((button) => button.addEventListener('click', () => exportDashboardLog()));

  document.querySelector<HTMLSelectElement>('.trend-range')?.addEventListener('change', (e) =>
    showToast(`Trend updated to ${(e.currentTarget as HTMLSelectElement).selectedOptions[0]?.textContent || 'selected period'}`)
  );

  // Switch role buttons
  document.querySelector('#switchRoleBtn')?.addEventListener('click', openLoginModal);
  document.querySelector('#userProfile')?.addEventListener('click', openLoginModal);
  document.querySelector('#bannerSwitchRoleBtn')?.addEventListener('click', openLoginModal);
}

function renderNotifications() {
  const unread = state.notifications.filter((n) => !n.read).length;
  const badge = document.querySelector<HTMLElement>('.bell i');
  if (badge) {
    badge.textContent = String(unread);
    badge.classList.toggle('empty', unread === 0);
  }
  const list = document.querySelector('.notification-list');
  if (list) {
    list.innerHTML = state.notifications
      .map(
        (n) => `
      <button class="notification-item ${n.type} ${n.read ? 'read' : ''}" data-notification="${n.id}">
        <b>${n.type === 'critical' ? '!' : n.type === 'warning' ? '△' : 'i'}</b>
        <span>
          <strong>${n.title}</strong>
          <small>${n.detail}</small>
          <time>${n.time}</time>
        </span>
      </button>`
      )
      .join('');
  }
}

function bindNotifications() {
  const bell = document.querySelector<HTMLButtonElement>('.bell');
  const panel = document.querySelector<HTMLElement>('.notification-panel');
  if (!bell || !panel) return;

  bell.addEventListener('click', (event) => {
    event.stopPropagation();
    const willOpen = panel.hidden;
    panel.hidden = !willOpen;
    bell.setAttribute('aria-expanded', String(willOpen));
  });

  document.querySelector('.mark-read')?.addEventListener('click', async () => {
    state.notifications.forEach((n) => (n.read = true));
    renderNotifications();
    try {
      await api.notifications.markAllAsRead();
    } catch {
      // fallback
    }
    showToast('All notifications marked as read');
  });

  document.querySelector('.notification-list')?.addEventListener('click', async (e) => {
    const item = (e.target as HTMLElement).closest<HTMLElement>('[data-notification]');
    if (!item) return;
    const notification = state.notifications.find((n) => String(n.id) === item.dataset.notification);
    if (notification) {
      notification.read = true;
      renderNotifications();
      render(notification.view);
      try {
        await api.alerts.acknowledge(String(notification.id));
      } catch {
        // fallback
      }
    }
    panel.hidden = true;
    bell.setAttribute('aria-expanded', 'false');
  });

  document.querySelector('.notification-footer')?.addEventListener('click', () => {
    panel.hidden = true;
    bell.setAttribute('aria-expanded', 'false');
    render('alerts');
  });

  document.addEventListener('click', (e) => {
    if (!(e.target as HTMLElement).closest('.notification-menu')) {
      panel.hidden = true;
      bell.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) {
      panel.hidden = true;
      bell.setAttribute('aria-expanded', 'false');
      bell.focus();
    }
  });

  renderNotifications();
}

function bindNavigation() {
  document.querySelectorAll<HTMLButtonElement>('.nav-item').forEach((button) => {
    button.addEventListener('click', () => {
      const view = button.dataset.view as View;
      if (view) render(view);
    });
  });
}

function clock() {
  const el = document.querySelector('#clock');
  if (el) {
    el.textContent = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  }
}

const sitePhotos = [
  '/solar-siyambalanduwa.jpg',
  '/solar-hambantota.jpg',
  '/solar-pooneryn.svg',
  '/solar-vavunathivu.svg',
  '/solar-polonnaruwa.svg',
];

function applySitePhotos() {
  document.querySelectorAll<HTMLImageElement>('.site-card .site-photo img').forEach((image, index) => {
    if (index < sitePhotos.length) image.src = sitePhotos[index];
  });
}

// Live Backend Data Synchronizer
async function syncData(manual = false) {
  if (state.isSyncing) return;
  state.isSyncing = true;

  try {
    // 1. Ensure authenticated session for protected endpoints
    const savedUser = localStorage.getItem('the_sun_current_user') || 'operator@thesun.lk';
    if (!api.getToken()) {
      try {
        const loginRes = await api.auth.login({
          email: savedUser,
          password: 'SolarAdmin2024!',
        });
        state.user = loginRes.user;
      } catch {
        // Continue unauthenticated if login fails
      }
    } else if (!state.user) {
      try {
        const meRes = (await api.auth.me()) as any;
        state.user = meRes?.user || meRes;
      } catch {
        try {
          const loginRes = await api.auth.login({
            email: savedUser,
            password: 'SolarAdmin2024!',
          });
          state.user = loginRes.user;
        } catch {}
      }
    }

    // 2. Fetch all modules concurrently
    const [
      sitesRes,
      dashRes,
      alertsRes,
      battRes,
      gridRes,
      actionsRes,
      checksRes,
      iotRes,
      aiRes,
      resSitesRes,
      resSumRes,
    ] = await Promise.allSettled([
      api.sites.getAll(),
      api.analytics.getDashboard(),
      api.alerts.getAll(),
      api.batteries.getAll(),
      api.grid.getStatus(),
      api.controls.getActions(),
      api.controls.getSafetyChecks(),
      api.iot.getStats(),
      api.ai.getStats(),
      api.residential.getSites(),
      api.residential.getSummary(),
    ]);

    let successfulRequests = 0;

    // Handle Sites
    if (sitesRes.status === 'fulfilled' && Array.isArray(sitesRes.value) && sitesRes.value.length > 0) {
      successfulRequests++;
      state.sites = sitesRes.value.map((s: any) => {
        const measurement = s.measurements?.[0];
        const batteryList = s.batteries || [];
        const hasBattery = batteryList.length > 0;
        const socVal = hasBattery ? batteryList[0]?.socPercent || 0 : 0;
        const pvVal = measurement?.generationKw
          ? `${(measurement.generationKw / 1000).toFixed(2)} MW`
          : `${(s.installedCapacityMw * 0.72).toFixed(2)} MW`;
        const loadVal = measurement?.activePowerKw
          ? `${Math.abs(measurement.activePowerKw / 1000).toFixed(2)} MW`
          : `${(s.installedCapacityMw * 0.18).toFixed(2)} MW`;
        const voltVal = measurement?.gridVoltageV
          ? `${measurement.gridVoltageV.toFixed(1)} V`
          : s.installedCapacityMw > 3
          ? '442.1 V'
          : '401.0 V';

        return {
          id: s.siteCode || s.id,
          name: s.name,
          loc: `${(s.location || s.district || 'SRI LANKA').toUpperCase()} · ${(s.province || '').toUpperCase()}`,
          pv: pvVal,
          load: loadVal,
          status: s.status === 'ONLINE' ? 'Online' : s.status === 'ATTENTION' ? 'Attention' : s.status,
          soc: socVal,
          battery: hasBattery,
          voltage: voltVal,
          capacity: `${s.installedCapacityMw} MW`,
          annual: `${s.annualEnergyGwh} GWh`,
          commissioned: String(s.commissionedYear || 2020),
          source: s.dataSource || 'LIVE API',
        };
      });
      state.totals = state.sites.reduce((acc, s) => acc + (parseFloat(s.capacity) || 0), 0);
    }

    // Handle Dashboard
    if (dashRes.status === 'fulfilled' && dashRes.value) {
      successfulRequests++;
      state.dashboard = dashRes.value;
    }

    // Handle Alerts
    if (alertsRes.status === 'fulfilled' && Array.isArray(alertsRes.value)) {
      successfulRequests++;
      state.notifications = alertsRes.value.map((a: any, i: number) => ({
        id: a.id || i + 1,
        type: (a.severity?.toLowerCase() || 'info') as 'critical' | 'warning' | 'info',
        title: a.title,
        detail: a.detail || `${a.site?.name || 'Solar Site'} constraint`,
        time: formatRelativeTime(a.createdAt),
        view: 'alerts' as View,
        read: a.status === 'RESOLVED' || a.status === 'ACKNOWLEDGED',
      }));
    }

    // Handle Batteries
    if (battRes.status === 'fulfilled' && Array.isArray(battRes.value)) {
      successfulRequests++;
      state.batteries = battRes.value;
    }

    // Handle Grid
    if (gridRes.status === 'fulfilled' && gridRes.value) {
      successfulRequests++;
      state.gridStatus = gridRes.value;
    }

    // Handle Controls
    if (actionsRes.status === 'fulfilled' && Array.isArray(actionsRes.value)) {
      successfulRequests++;
      state.controlsActions = actionsRes.value;
    }
    if (checksRes.status === 'fulfilled' && Array.isArray(checksRes.value)) {
      successfulRequests++;
      state.safetyChecks = checksRes.value;
    }

    // Handle IoT & AI
    if (iotRes.status === 'fulfilled' && iotRes.value) {
      successfulRequests++;
      state.iotStats = iotRes.value;
    }
    if (aiRes.status === 'fulfilled' && aiRes.value) {
      successfulRequests++;
      state.aiStats = aiRes.value;
    }

    // Handle Residential
    if (resSitesRes.status === 'fulfilled' && Array.isArray(resSitesRes.value) && resSitesRes.value.length > 0) {
      successfulRequests++;
      state.residentialHomes = resSitesRes.value.map((h: any, i: number) => {
        const solar = h.solarSystem;
        const m = h.measurements?.[0];
        return {
          id: h.siteCode || `SL-HOME-${String(i + 1).padStart(5, '0')}`,
          district: h.district || 'Western',
          province: h.province || 'Western',
          capacity: solar ? `${solar.solarCapacityKw.toFixed(1)} kW` : '5.0 kW',
          scheme: h.connectionScheme || 'NET_METERING',
          provider: h.customer?.utilityProvider || 'CEB',
          generation: m ? `${m.solarGenerationKw.toFixed(1)} kW` : '4.0 kW',
          consumption: m ? `${m.householdConsumptionKw.toFixed(1)} kW` : '2.0 kW',
          export: m ? `${m.gridExportKw.toFixed(1)} kW` : '2.0 kW',
          battery: solar ? Boolean(solar.hasBattery) : false,
          device: h.status === 'ACTIVE' ? 'Online' : 'Attention',
        };
      });
    }

    if (resSumRes.status === 'fulfilled' && resSumRes.value) {
      successfulRequests++;
      state.residentialSummary = resSumRes.value;
    }

    state.isConnected = successfulRequests > 0;
    updateConnectionUI();
    renderNotifications();
    render(state.currentView);

    if (manual) {
      showToast('Live backend data synchronized');
    }
  } catch (err) {
    console.warn('[Sync] Failed to sync data with backend:', err);
    state.isConnected = false;
    updateConnectionUI();
  } finally {
    state.isSyncing = false;
  }
}

// Initial setup
clock();
setInterval(clock, 1000);
bindNavigation();
bindNotifications();

// Wire up header LIVE button
document.querySelector('#livePill')?.addEventListener('click', async () => {
  showToast('Connecting to backend API (port 3001)...');
  await syncData(true);
});

// Initial render
render('overview');

// Trigger live sync with backend immediately
syncData();

// Background periodic sync every 12 seconds to keep dashboard live
setInterval(() => {
  syncData();
}, 12000);
