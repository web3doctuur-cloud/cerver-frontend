import { useState, useEffect, useCallback } from 'react';
import { api, endpoints } from '../services/api';
import { API_BASE_URL } from '../config/api';
import MainLayout from '../layouts/MainLayout';
import toast from 'react-hot-toast';

// Helper: parse a string into a list of items (split by newline or semicolon)
const parseList = (str) => {
  if (!str) return [];
  return str.split(/[\n;]+/).map((s) => s.trim()).filter(Boolean);
};

// Helper: join list items back into a string for storage
const joinList = (arr) => arr.join('\n');

// ListInput: editable tag-style list input
const ListInput = ({ value, onChange, placeholder, label }) => {
  const items = parseList(value);
  const [inputVal, setInputVal] = useState('');

  const addItem = () => {
    const trimmed = inputVal.trim();
    if (!trimmed) return;
    const newItems = [...items, trimmed];
    onChange(joinList(newItems));
    setInputVal('');
  };

  const removeItem = (idx) => {
    const newItems = items.filter((_, i) => i !== idx);
    onChange(joinList(newItems));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <div>
      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</label>
      <div className="border border-slate-200 rounded-xl p-3 bg-white min-h-[80px] focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-transparent transition-all">
        <div className="flex flex-wrap gap-1.5 mb-2">
          {items.map((item, idx) => (
            <span key={idx} className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold px-2.5 py-1 rounded-lg">
              {item}
              <button type="button" onClick={() => removeItem(idx)} className="text-amber-500 hover:text-red-500 transition-colors ml-0.5 leading-none font-bold">
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 text-sm outline-none text-slate-700 placeholder-slate-300 bg-transparent"
          />
          <button
            type="button"
            onClick={addItem}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg transition-all"
          >
            + Add
          </button>
        </div>
      </div>
      <p className="text-xs text-slate-400 mt-1">Press Enter or click "Add" to add each item</p>
    </div>
  );
};

// Render a list string as bullet points
const BulletList = ({ str, className = '' }) => {
  const items = parseList(str);
  if (items.length === 0) return <p className={`text-slate-500 text-sm italic ${className}`}>—</p>;
  return (
    <ul className={`space-y-1 ${className}`}>
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start gap-1.5 text-sm text-slate-600">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [analytics, setAnalytics] = useState({
    dashboard: null,
    popularity: null,
    recentActivity: null,
    timeline: null,
    performance: null,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // New Membership form
  const [newMembership, setNewMembership] = useState({ title: '', benefits: '', requirements: '', isActive: true });

  // Edit Membership
  const [editingMembership, setEditingMembership] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', benefits: '', requirements: '', isActive: true });

  // Reject modal state
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, reason: '' });

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, requestsRes, allRequestsRes, membershipsRes, usersRes, certsRes] = await Promise.all([
        api.get(endpoints.admin.dashboard),
        api.get(endpoints.requests.getPending),
        api.get(endpoints.requests.getAll),
        api.get(endpoints.memberships.getAll),
        api.get(endpoints.admin.users),
        api.get(endpoints.certificates.all),
      ]);
      setStats(statsRes.data);
      setPendingRequests(requestsRes.data);
      setAllRequests(allRequestsRes.data);
      setMemberships(membershipsRes.data);
      setUsers(usersRes.data || []);
      setCertificates(certsRes.data || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const [dashRes, popRes, actRes, timeRes, perfRes] = await Promise.all([
        api.get(endpoints.analytics.dashboard),
        api.get(endpoints.analytics.membershipPopularity),
        api.get(endpoints.analytics.recentActivity),
        api.get(endpoints.analytics.certificateTimeline),
        api.get(endpoints.analytics.performance),
      ]);
      setAnalytics({
        dashboard: dashRes.data,
        popularity: popRes.data,
        recentActivity: actRes.data,
        timeline: timeRes.data,
        performance: perfRes.data,
      });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab, fetchAnalytics]);

  const handleApprove = async (id) => {
    try {
      await api.post(endpoints.requests.approve(id));
      toast.success('Request approved!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve');
    }
  };

  const handleRejectOpen = (id) => {
    setRejectModal({ open: true, id, reason: '' });
  };

  const handleRejectConfirm = async () => {
    try {
      await api.post(endpoints.requests.reject(rejectModal.id), { reason: rejectModal.reason || 'Not meeting requirements' });
      toast.success('Request rejected');
      setRejectModal({ open: false, id: null, reason: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject');
    }
  };

  const handleGenerateCertificate = async (id) => {
    try {
      await api.post(endpoints.requests.generateCertificate(id));
      toast.success('Certificate generated!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate certificate');
    }
  };

  const handleDeleteRequest = async (id) => {
    if (!confirm('Delete this request permanently?')) return;
    try {
      await api.delete(endpoints.requests.delete(id));
      toast.success('Request deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete request');
    }
  };

  const handleCreateMembership = async (e) => {
    e.preventDefault();
    if (!parseList(newMembership.benefits).length || !parseList(newMembership.requirements).length) {
      toast.error('Please add at least one benefit and one requirement');
      return;
    }
    try {
      await api.post(endpoints.memberships.create, {
        ...newMembership,
        isActive: true,
      });
      toast.success('Membership created!');
      setNewMembership({ title: '', benefits: '', requirements: '', isActive: true });
      fetchData();
    } catch {
      toast.error('Failed to create membership');
    }
  };

  const openEditModal = (membership) => {
    setEditingMembership(membership);
    setEditForm({
      title: membership.title,
      benefits: membership.benefits,
      requirements: membership.requirements,
      isActive: membership.isActive,
    });
  };

  const handleUpdateMembership = async (e) => {
    e.preventDefault();
    try {
      await api.put(endpoints.memberships.update(editingMembership.id), {
        ...editingMembership,
        ...editForm,
      });
      toast.success('Membership updated!');
      setEditingMembership(null);
      fetchData();
    } catch {
      toast.error('Failed to update membership');
    }
  };

  const handleDeleteMembership = async (id) => {
    if (!confirm('Delete this membership? This cannot be undone.')) return;
    try {
      await api.delete(endpoints.memberships.delete(id));
      toast.success('Membership deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleRevokeCertificate = async (certNumber) => {
    if (!confirm('Revoke this certificate? This cannot be undone.')) return;
    try {
      await api.delete(endpoints.certificates.revoke(certNumber));
      toast.success('Certificate revoked');
      fetchData();
    } catch {
      toast.error('Failed to revoke certificate');
    }
  };

  const handleExportSummary = async () => {
    try {
      const response = await api.get(endpoints.analytics.exportSummary, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `cerver-summary-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Summary exported!');
    } catch {
      toast.error('Failed to export summary');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'requests', label: `Approvals (${pendingRequests.length})` },
    { id: 'all-requests', label: `All Requests (${allRequests.length})` },
    { id: 'memberships', label: 'Memberships' },
    { id: 'certificates', label: `Certificates (${certificates.length})` },
    { id: 'users', label: `Users (${users.length})` },
    { id: 'analytics', label: 'Analytics' },
  ];

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 text-amber-400 border border-slate-800 mb-3">
              <span className="flex h-1.5 w-1.5 rounded-full bg-amber-400" />
              Administrative Control Panel
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Console</h1>
            <p className="text-slate-500 mt-1">Manage memberships, approvals, users, and analytics.</p>
          </div>
          <button
            onClick={handleExportSummary}
            className="flex items-center gap-2 bg-slate-900 hover:bg-amber-500 hover:text-gray-950 text-white font-bold px-5 py-2.5 rounded-xl transition-all duration-200 text-sm shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Summary
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {[
              { label: 'Total Memberships', value: stats.totalMemberships, color: 'text-slate-900' },
              { label: 'Total Requests', value: stats.totalRequests, color: 'text-slate-900' },
              { label: 'Pending Approvals', value: stats.pendingRequests, color: 'text-amber-600' },
              { label: 'Registered Users', value: stats.totalUsers, color: 'text-slate-900' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className={`text-3xl font-extrabold mt-2 ${stat.color}`}>{stat.value ?? '—'}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-slate-200 gap-2 mb-8 pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-2 border-b-2 font-bold text-sm whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === tab.id
                  ? 'border-amber-500 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Pending Approval Pipeline</h3>
                {pendingRequests.length === 0 ? (
                  <p className="text-slate-400 text-sm py-4">No pending requests require attention right now.</p>
                ) : (
                  <div className="space-y-3">
                    {pendingRequests.slice(0, 3).map((request) => (
                      <div key={request.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{request.membership?.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">From: {request.fullName} ({request.email})</p>
                        </div>
                        <button
                          onClick={() => setActiveTab('requests')}
                          className="text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg"
                        >
                          Review →
                        </button>
                      </div>
                    ))}
                    {pendingRequests.length > 3 && (
                      <button
                        onClick={() => setActiveTab('requests')}
                        className="text-xs font-bold text-slate-500 hover:text-slate-800 text-center w-full block pt-2"
                      >
                        View all {pendingRequests.length} pending requests
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-md">
                <h3 className="text-lg font-bold mb-2">System Quick Overview</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Manage digital certificate templates, review verification logs, and grant/revoke access.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-slate-400 text-xs uppercase font-semibold">Active Memberships</p>
                    <p className="text-2xl font-bold mt-1">{memberships.length}</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-slate-400 text-xs uppercase font-semibold">Verification Status</p>
                    <p className="text-2xl font-bold mt-1 text-emerald-400">Online</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Create Membership Level', badge: null, action: () => setActiveTab('memberships') },
                    { label: 'Review Pending Approvals', badge: pendingRequests.length, action: () => setActiveTab('requests') },
                    { label: 'View All Requests', badge: allRequests.length, action: () => setActiveTab('all-requests') },
                    { label: 'View Users', badge: users.length, action: () => setActiveTab('users') },
                    { label: 'View Analytics', badge: null, action: () => setActiveTab('analytics') },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className="w-full text-left bg-slate-50 hover:bg-slate-100 text-slate-700 p-3.5 rounded-xl border border-slate-100/50 text-sm font-semibold transition-all flex justify-between items-center"
                    >
                      {item.label}
                      {item.badge !== null ? (
                        <span className="bg-amber-500 text-gray-950 text-xs font-bold px-2 py-0.5 rounded-full">{item.badge}</span>
                      ) : (
                        <span>→</span>
                      )}
                    </button>
                  ))}
                  <a
                    href="/verify"
                    className="w-full text-left bg-slate-50 hover:bg-slate-100 text-slate-700 p-3.5 rounded-xl border border-slate-100/50 text-sm font-semibold transition-all flex justify-between items-center"
                  >
                    Open Verification Scanner
                    <span>→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PENDING APPROVALS TAB ── */}
        {activeTab === 'requests' && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-6">Pending Approvals</h2>
            {pendingRequests.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-slate-500 font-medium">All caught up!</p>
                <p className="text-slate-400 text-sm mt-1">No requests currently pending approval.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start border-b border-slate-50 pb-4 mb-4">
                        <div>
                          <h3 className="font-bold text-lg text-slate-900">{request.membership?.title}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">Applied: {new Date(request.requestedAt).toLocaleDateString()}</p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/50">
                          Pending Review
                        </span>
                      </div>
                      <div className="space-y-2 text-slate-600 text-sm mb-4">
                        <p><span className="font-semibold text-slate-500">Applicant:</span> {request.fullName}</p>
                        <p><span className="font-semibold text-slate-500">Email:</span> {request.email}</p>
                        <p><span className="font-semibold text-slate-500">Phone:</span> {request.phoneNumber}</p>
                        {request.requirementsFile && (
                          <p>
                            <span className="font-semibold text-slate-500">File: </span>
                            <a href={request.requirementsFile} target="_blank" rel="noreferrer" className="text-amber-600 hover:underline">View uploaded file</a>
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                      <button
                        onClick={() => handleApprove(request.id)}
                        className="flex-1 bg-gray-950 hover:bg-amber-500 hover:text-gray-950 text-white font-bold py-2.5 rounded-xl transition-all duration-200 text-sm shadow-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectOpen(request.id)}
                        className="flex-1 border border-slate-200 text-rose-600 hover:bg-rose-50 font-bold py-2.5 rounded-xl transition-all duration-200 text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── ALL REQUESTS TAB ── */}
        {activeTab === 'all-requests' && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-6">All Membership Requests</h2>
            {allRequests.length === 0 ? (
              <p className="text-slate-400">No requests found.</p>
            ) : (
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        {['#', 'Applicant', 'Membership', 'Status', 'Applied', 'Actions'].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {allRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3 text-slate-400 font-mono text-xs">{req.id}</td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-800">{req.fullName}</p>
                            <p className="text-slate-400 text-xs">{req.email}</p>
                          </td>
                          <td className="px-4 py-3 text-slate-600 font-medium">{req.membership?.title}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                              req.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                              : req.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200/50'
                              : 'bg-amber-50 text-amber-700 border border-amber-200/50'
                            }`}>
                              {req.status || 'Pending'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{new Date(req.requestedAt).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {req.status === 'Pending' && (
                                <>
                                  <button onClick={() => handleApprove(req.id)} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">Approve</button>
                                  <button onClick={() => handleRejectOpen(req.id)} className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 px-2 py-1 rounded-lg">Reject</button>
                                </>
                              )}
                              {req.status === 'Approved' && !req.certificateNumber && (
                                <button onClick={() => handleGenerateCertificate(req.id)} className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-lg whitespace-nowrap">Gen Cert</button>
                              )}
                              {req.certificateNumber && (
                                <span className="text-xs text-emerald-600 font-mono">{req.certificateNumber}</span>
                              )}
                              <button onClick={() => handleDeleteRequest(req.id)} className="text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors p-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── MEMBERSHIPS TAB ── */}
        {activeTab === 'memberships' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create New Membership */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm h-fit">
              <h2 className="text-lg font-bold text-slate-900 mb-5">Create Membership</h2>
              <form onSubmit={handleCreateMembership} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Title</label>
                  <input
                    type="text"
                    placeholder="Membership Name"
                    value={newMembership.title}
                    onChange={(e) => setNewMembership({ ...newMembership, title: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                    required
                  />
                </div>
                <ListInput
                  label="Benefits"
                  value={newMembership.benefits}
                  onChange={(val) => setNewMembership({ ...newMembership, benefits: val })}
                  placeholder="e.g. Access to events..."
                />
                <ListInput
                  label="Requirements"
                  value={newMembership.requirements}
                  onChange={(val) => setNewMembership({ ...newMembership, requirements: val })}
                  placeholder="e.g. Valid ID required..."
                />
                <button type="submit" className="w-full bg-gray-950 text-white font-bold py-2.5 rounded-xl hover:bg-amber-500 hover:text-gray-950 transition-all duration-200 text-sm">
                  Create Membership
                </button>
              </form>
            </div>

            {/* Existing Memberships */}
            <div className="lg:col-span-2">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Existing Memberships</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {memberships.map((membership) => (
                  <div key={membership.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start border-b border-slate-50 pb-3 mb-4">
                        <div>
                          <h3 className="font-extrabold text-slate-900">{membership.title}</h3>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-md mt-1 inline-block ${membership.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                            {membership.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openEditModal(membership)}
                            className="text-slate-400 hover:text-amber-600 transition-colors p-1"
                            title="Edit membership"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteMembership(membership.id)}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                            title="Delete membership"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="space-y-3 mb-2">
                        <div>
                          <span className="font-bold text-xs text-slate-400 uppercase tracking-wider block mb-1.5">Benefits:</span>
                          <BulletList str={membership.benefits} />
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-400 uppercase tracking-wider block mb-1.5">Requirements:</span>
                          <BulletList str={membership.requirements} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── CERTIFICATES TAB ── */}
        {activeTab === 'certificates' && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-6">All Certificates</h2>
            {certificates.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <p className="text-slate-500 font-medium">No certificates yet</p>
              </div>
            ) : (
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Certificate #</th>
                        <th className="px px py-3 text-left text-xs font-semibold text-slate-500 uppercase">Name</th>
                        <th className="px px py-3 text-xs text-slate-500 uppercase">Membership</th>
                        <th className="px py-3 text-xs text-slate-500 uppercase">Issued</th>
                        <th className="px py-3 text-xs text-slate-500 uppercase">Expires</th>
                        <th className="px py-3 text-xs text-slate-500 uppercase">Status</th>
                        <th className="px py-3 text-xs text-slate-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {certificates.map((cert) => (
                        <tr key={cert.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px py-3 text-sm font-mono text-slate-700">{cert.certificateNumber}</td>
                          <td className="px py-3">
                            <p className="text-sm font-medium text-slate-900">{cert.fullName}</p>
                          </td>
                          <td className="px py-3 text-sm text-slate-700">{cert.membershipTitle}</td>
                          <td className="px py-3 text-sm text-slate-600">{new Date(cert.issueDate).toLocaleDateString()}</td>
                          <td className="px py-3 text-sm text-slate-600">{new Date(cert.expiryDate).toLocaleDateString()}</td>
                          <td className="px py-3">
                            {!cert.isValid ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                Revoked
                              </span>
                            ) : cert.isExpired ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                Expired
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Valid
                              </span>
                            )}
                          </td>
                          <td className="px py-3">
                            <div className="flex gap-2">
                              <a
                                href={`${API_BASE_URL}${endpoints.certificates.download(cert.certificateNumber)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 px-2 py-1 rounded-md transition-colors"
                              >
                                Download
                              </a>
                              {cert.isValid && !cert.isExpired && (
                                <button
                                  onClick={() => handleRevokeCertificate(cert.certificateNumber)}
                                  className="text-xs font-bold text-rose-600 hover:text-rose-800 bg-rose-50 px-2 py-1 rounded-md transition-colors"
                                >
                                  Revoke
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── USERS TAB ── */}
        {activeTab === 'users' && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-6">Registered Users</h2>
            {users.length === 0 ? (
              <p className="text-slate-400">No users found.</p>
            ) : (
              <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        {['#', 'Email', 'Role', 'Joined', 'Requests'].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {users.map((user, idx) => (
                        <tr key={user.id || idx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-4 py-3 text-slate-400 font-mono text-xs">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs flex-shrink-0">
                                {(user.email || '?').charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium text-slate-800">{user.email}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-bold ${
                              user.role === 'Admin' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {user.role || 'Member'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-400 text-xs">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</td>
                          <td className="px-4 py-3 text-slate-500">{user.requestCount ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ANALYTICS TAB ── */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Analytics & Insights</h2>
              <button
                onClick={handleExportSummary}
                className="flex items-center gap-2 text-sm font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-4 py-2 rounded-xl transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export Summary CSV
              </button>
            </div>

            {/* Analytics Dashboard Stats */}
            {analytics.dashboard && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(analytics.dashboard).map(([key, val]) => (
                  typeof val === 'number' && (
                    <div key={key} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                      <p className="text-3xl font-extrabold text-slate-900 mt-2">{val}</p>
                    </div>
                  )
                ))}
              </div>
            )}

            {/* Performance */}
            {analytics.performance && (
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" /> Performance Metrics
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {Object.entries(analytics.performance).map(([key, val]) => (
                    <div key={key} className="bg-slate-50 rounded-xl p-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                      <p className="text-xl font-extrabold text-slate-900 mt-1">{typeof val === 'number' ? val : JSON.stringify(val)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Membership Popularity */}
            {analytics.popularity && Array.isArray(analytics.popularity) && analytics.popularity.length > 0 && (
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Membership Popularity
                </h3>
                <div className="space-y-3">
                  {analytics.popularity.map((item, idx) => {
                    const max = Math.max(...analytics.popularity.map((i) => i.count || i.requestCount || 1));
                    const count = item.count || item.requestCount || 0;
                    const pct = Math.round((count / max) * 100);
                    return (
                      <div key={idx}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-slate-700">{item.membershipTitle || item.title || `Item ${idx + 1}`}</span>
                          <span className="font-bold text-slate-900">{count}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-amber-400 h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            {analytics.recentActivity && Array.isArray(analytics.recentActivity) && analytics.recentActivity.length > 0 && (
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Recent Activity
                </h3>
                <div className="space-y-2">
                  {analytics.recentActivity.slice(0, 10).map((act, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                        <span className="text-sm text-slate-700">{act.description || act.action || JSON.stringify(act)}</span>
                      </div>
                      {act.date && <span className="text-xs text-slate-400">{new Date(act.date).toLocaleDateString()}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certificate Timeline */}
            {analytics.timeline && Array.isArray(analytics.timeline) && analytics.timeline.length > 0 && (
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500" /> Certificate Timeline
                </h3>
                <div className="space-y-2">
                  {analytics.timeline.slice(0, 10).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <span className="text-sm text-slate-700">{item.period || item.month || item.date || `Period ${idx + 1}`}</span>
                      <span className="font-bold text-slate-900">{item.count || item.certificates || '—'} certificates</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── EDIT MEMBERSHIP MODAL ── */}
      {editingMembership && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 p-6 pb-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Edit Membership</h2>
              <button onClick={() => setEditingMembership(null)} className="text-slate-400 hover:text-slate-700 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleUpdateMembership} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                  required
                />
              </div>
              <ListInput
                label="Benefits"
                value={editForm.benefits}
                onChange={(val) => setEditForm({ ...editForm, benefits: val })}
                placeholder="e.g. Access to events..."
              />
              <ListInput
                label="Requirements"
                value={editForm.requirements}
                onChange={(val) => setEditForm({ ...editForm, requirements: val })}
                placeholder="e.g. Valid ID required..."
              />
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                  className="w-4 h-4 accent-amber-500"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-slate-700">Active (visible to users)</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMembership(null)}
                  className="flex-1 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-xl hover:bg-slate-50 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gray-950 text-white font-bold py-2.5 rounded-xl hover:bg-amber-500 hover:text-gray-950 transition-all text-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── REJECT MODAL ── */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Reject Request</h2>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Reason for rejection (optional)</label>
            <textarea
              value={rejectModal.reason}
              onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
              rows={3}
              placeholder="Enter reason for rejection..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 text-sm resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setRejectModal({ open: false, id: null, reason: '' })}
                className="flex-1 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-xl hover:bg-slate-50 transition-all text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                className="flex-1 bg-rose-600 text-white font-bold py-2.5 rounded-xl hover:bg-rose-700 transition-all text-sm"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default AdminDashboard;
