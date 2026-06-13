const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7000/api';
const API_ORIGIN = new URL(API_BASE_URL).origin;

export const endpoints = {
  auth: {
    login: '/Auth/login',
    register: '/Auth/register',
  },
  memberships: {
    getActive: '/Memberships',
    getAll: '/Memberships/all',
    getById: (id) => `/Memberships/${id}`,
    create: '/Memberships',
    update: (id) => `/Memberships/${id}`,
    delete: (id) => `/Memberships/${id}`,
  },
  requests: {
    getAll: '/MembershipRequests',
    getMy: '/MembershipRequests/my',
    getPending: '/MembershipRequests/pending',
    create: '/MembershipRequests',
    approve: (id) => `/MembershipRequests/${id}/approve`,
    reject: (id) => `/MembershipRequests/${id}/reject`,
    generateCertificate: (id) => `/MembershipRequests/${id}/generate-certificate`,
    uploadRequirements: (id) => `/MembershipRequests/upload-requirements/${id}`,
    delete: (id) => `/MembershipRequests/${id}`,
  },
  certificates: {
    download: (certNumber) => `/Certificates/download/${certNumber}`,
    verify: (certNumber) => `/Certificates/verify/${certNumber}`,
  },
  admin: {
    dashboard: '/Admin/dashboard',
    users: '/Admin/users',
  },
  analytics: {
    dashboard: '/Analytics/dashboard',
    membershipPopularity: '/Analytics/membership-popularity',
    recentActivity: '/Analytics/recent-activity',
    certificateTimeline: '/Analytics/certificate-timeline',
    exportSummary: '/Analytics/export-summary',
    performance: '/Analytics/performance',
  },
};

export { API_BASE_URL };
export const getBackendAssetUrl = (path) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
};
