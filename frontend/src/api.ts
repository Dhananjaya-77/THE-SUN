/**
 * The Sun - Solar Operations API Client
 * Connects frontend to the backend REST API & Socket.IO server.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('the_sun_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('the_sun_token', token);
    } else {
      localStorage.removeItem('the_sun_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    const headers = new Headers(options.headers || {});

    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    if (this.token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    try {
      const res = await fetch(url, { ...options, headers });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}: ${res.statusText}`);
      }
      return data.data !== undefined ? data.data : data;
    } catch (err: unknown) {
      console.warn(`[API] ${options.method || 'GET'} ${endpoint} failed:`, err);
      throw err;
    }
  }

  // Auth
  auth = {
    login: (credentials: { email: string; password: string }) =>
      this.request<{ accessToken: string; refreshToken: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }).then((res) => {
        this.setToken(res.accessToken);
        return res;
      }),
    register: (userData: any) =>
      this.request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    me: () => this.request('/auth/me'),
    logout: () => {
      this.setToken(null);
      return this.request('/auth/logout', { method: 'POST' }).catch(() => {});
    },
  };

  // Sites
  sites = {
    getAll: (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
      const q = new URLSearchParams((params as any) || {}).toString();
      return this.request<any[]>(`/sites${q ? `?${q}` : ''}`);
    },
    getById: (id: string) => this.request<any>(`/sites/${id}`),
    getStats: (id: string) => this.request<any>(`/sites/${id}/stats`),
    getSummary: () => this.request<any>('/sites/summary'),
  };

  // Measurements
  measurements = {
    getLatest: () => this.request<any[]>('/measurements/latest'),
    getAggregated: (siteId: string, interval = 'hour') =>
      this.request<any>(`/measurements/aggregated?siteId=${siteId}&interval=${interval}`),
    ingest: (data: any) =>
      this.request('/measurements', { method: 'POST', body: JSON.stringify(data) }),
  };

  // Grid
  grid = {
    getStatus: () => this.request<any>('/grid/status'),
    getConstraints: () => this.request<any>('/grid/constraints'),
    getTopology: () => this.request<any>('/grid/topology'),
    runPowerFlow: (points: Record<string, any>) =>
      this.request<any>('/grid/power-flow', { method: 'POST', body: JSON.stringify(points) }),
    getSnapshots: (page = 1) => this.request<any>(`/grid/snapshots?page=${page}`),
  };

  // Batteries
  batteries = {
    getAll: () => this.request<any[]>('/batteries'),
    getById: (id: string) => this.request<any>(`/batteries/${id}`),
    getFleet: () => this.request<any>('/batteries/fleet'),
    update: (id: string, data: any) =>
      this.request(`/batteries/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    createSchedule: (batteryId: string, schedule: any) =>
      this.request(`/batteries/${batteryId}/schedules`, {
        method: 'POST',
        body: JSON.stringify(schedule),
      }),
  };

  // Controls
  controls = {
    getActions: (status?: string) =>
      this.request<any[]>(`/controls/actions${status ? `?status=${status}` : ''}`),
    getPendingCount: () => this.request<{ pendingActions: number }>('/controls/pending'),
    getSafetyChecks: (actionId?: string) =>
      this.request<any[]>(`/controls/safety-checks${actionId ? `?actionId=${actionId}` : ''}`),
    authorize: (id: string) =>
      this.request(`/controls/actions/${id}/authorize`, { method: 'POST' }),
    reject: (id: string) =>
      this.request(`/controls/actions/${id}/reject`, { method: 'POST' }),
    execute: (id: string) =>
      this.request(`/controls/actions/${id}/execute`, { method: 'POST' }),
  };

  // Forecast
  forecast = {
    getLatest: (type = 'GENERATION') => this.request<any>(`/forecast/latest?type=${type}`),
    getAccuracy: () => this.request<any>('/forecast/accuracy'),
  };

  // IoT
  iot = {
    getStats: () => this.request<any>('/iot/stats'),
    getDevices: (status?: string) =>
      this.request<any[]>(`/iot/devices${status ? `?status=${status}` : ''}`),
    getGateways: () => this.request<any[]>('/iot/gateways'),
    heartbeat: (id: string, data: any) =>
      this.request(`/iot/devices/${id}/heartbeat`, { method: 'POST', body: JSON.stringify(data) }),
  };

  // Alerts
  alerts = {
    getAll: (params?: any) => {
      const q = new URLSearchParams(params || {}).toString();
      return this.request<any[]>(`/alerts${q ? `?${q}` : ''}`);
    },
    getOpen: () => this.request<any[]>('/alerts/open'),
    getStats: () => this.request<any>('/alerts/stats'),
    acknowledge: (id: string) => this.request(`/alerts/${id}/acknowledge`, { method: 'POST' }),
    resolve: (id: string) => this.request(`/alerts/${id}/resolve`, { method: 'POST' }),
  };

  // Analytics
  analytics = {
    getDashboard: () => this.request<any>('/analytics/dashboard'),
    getEnergyYield: () => this.request<any>('/analytics/energy-yield'),
    getCarbon: () => this.request<any>('/analytics/carbon'),
    getRevenue: (tariff?: number) =>
      this.request<any>(`/analytics/revenue${tariff ? `?tariff=${tariff}` : ''}`),
    getPerformance: () => this.request<any>('/analytics/performance'),
  };

  // AI
  ai = {
    getStats: () => this.request<any>('/ai/stats'),
    getModels: () => this.request<any[]>('/ai/models'),
    getAnomalies: () => this.request<any[]>('/ai/anomalies'),
    getRecommendations: () => this.request<any[]>('/ai/recommendations'),
  };

  // Reports
  reports = {
    getAll: () => this.request<any[]>('/reports'),
    generate: (data: { name: string; type: string; format?: 'PDF' | 'CSV' }) =>
      this.request('/reports', { method: 'POST', body: JSON.stringify(data) }),
    getSchedules: () => this.request<any[]>('/reports/schedules'),
    getTemplates: () => this.request<any[]>('/reports/templates'),
  };

  // Security
  security = {
    getStats: () => this.request<any>('/security/stats'),
    getAuditLogs: (page = 1) => this.request<any>(`/security/audit-logs?page=${page}`),
    getSessions: () => this.request<any[]>('/security/sessions'),
    revokeSession: (id: string) =>
      this.request(`/security/sessions/${id}`, { method: 'DELETE' }),
  };

  // Users
  users = {
    getAll: (page = 1) => this.request<any>(`/users?page=${page}`),
    getById: (id: string) => this.request<any>(`/users/${id}`),
    update: (id: string, data: any) =>
      this.request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  };

  // Integrations
  integrations = {
    getAll: () => this.request<any[]>('/integrations'),
    getStats: () => this.request<any>('/integrations/stats'),
    test: (id: string) => this.request(`/integrations/${id}/test`, { method: 'POST' }),
    sync: (id: string) => this.request(`/integrations/${id}/sync`, { method: 'POST' }),
  };

  // Residential Solar
  residential = {
    getSummary: () => this.request<any>('/residential/summary'),
    getSites: (params?: any) => {
      const q = new URLSearchParams(params || {}).toString();
      return this.request<any[]>(`/residential/sites${q ? `?${q}` : ''}`);
    },
    getSiteById: (id: string) => this.request<any>(`/residential/sites/${id}`),
    getSchemes: () => this.request<any[]>('/residential/schemes'),
    getCustomers: () => this.request<any[]>('/residential/customers'),
  };

  // Notifications
  notifications = {
    getAll: () => this.request<any[]>('/notifications'),
    getUnreadCount: () => this.request<{ unreadCount: number }>('/notifications/unread-count'),
    markAsRead: (id: string) => this.request(`/notifications/${id}/read`, { method: 'PUT' }),
    markAllAsRead: () => this.request('/notifications/mark-all-read', { method: 'POST' }),
  };

  // Digital Twin Simulation
  simulation = {
    getScenarios: () => this.request<any[]>('/simulation/scenarios'),
    getBaselines: () => this.request<any[]>('/simulation/baselines'),
    runScenario: (data: { name: string; inputs: Record<string, any>; description?: string }) =>
      this.request('/simulation/scenarios', { method: 'POST', body: JSON.stringify(data) }),
    saveBaseline: (id: string) =>
      this.request(`/simulation/scenarios/${id}/save-baseline`, { method: 'POST' }),
  };
}

export const api = new ApiClient();
export default api;
