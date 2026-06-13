import { useState, useEffect } from 'react';
import { api, endpoints } from '../services/api';
import MainLayout from '../layouts/MainLayout';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [newMembership, setNewMembership] = useState({ title: '', benefits: '', requirements: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, requestsRes, membershipsRes] = await Promise.all([
        api.get(endpoints.admin.dashboard),
        api.get(endpoints.requests.getPending),
        api.get(endpoints.memberships.getAll)
      ]);
      setStats(statsRes.data);
      setPendingRequests(requestsRes.data);
      setMemberships(membershipsRes.data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.post(endpoints.requests.approve(id));
      toast.success('Request approved!');
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.post(endpoints.requests.reject(id), { reason: 'Not meeting requirements' });
      toast.success('Request rejected');
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Failed to reject');
    }
  };

  const handleCreateMembership = async (e) => {
    e.preventDefault();
    try {
      await api.post(endpoints.memberships.create, newMembership);
      toast.success('Membership created!');
      setNewMembership({ title: '', benefits: '', requirements: '' });
      fetchData();
    } catch {
      toast.error('Failed to create membership');
    }
  };

  const handleDeleteMembership = async (id) => {
    if (confirm('Delete this membership?')) {
      try {
        await api.delete(endpoints.memberships.delete(id));
        toast.success('Membership deleted');
        fetchData();
      } catch {
        toast.error('Failed to delete');
      }
    }
  };

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
        <div className="mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 text-amber-400 border border-slate-800 mb-3">
            <span className="flex h-1.5 w-1.5 rounded-full bg-amber-400" />
            Administrative Control Panel
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Console</h1>
          <p className="text-slate-500 mt-1">Manage memberships, approvals, and credentials.</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Memberships</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats.totalMemberships}</p>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Requests</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats.totalRequests}</p>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Approvals</p>
              <p className="text-3xl font-extrabold text-amber-600 mt-2">{stats.pendingRequests}</p>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Registered Users</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats.totalUsers}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-slate-200 gap-6 mb-8">
          {['overview', 'requests', 'memberships'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-1 border-b-2 font-bold text-sm sm:text-base capitalize transition-all ${
                activeTab === tab
                  ? 'border-amber-500 text-slate-900'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab === 'requests' ? `Approvals (${pendingRequests.length})` : tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Pending Approval Pipeline</h3>
                {pendingRequests.length === 0 ? (
                  <p className="text-slate-400 text-sm py-4">No pending requests require attention right now.</p>
                ) : (
                  <div className="space-y-4">
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
                  <button
                    onClick={() => setActiveTab('memberships')}
                    className="w-full text-left bg-slate-50 hover:bg-slate-100 text-slate-700 p-3.5 rounded-xl border border-slate-100/50 text-sm font-semibold transition-all flex justify-between items-center"
                  >
                    Create Membership Level
                    <span>+</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('requests')}
                    className="w-full text-left bg-slate-50 hover:bg-slate-100 text-slate-700 p-3.5 rounded-xl border border-slate-100/50 text-sm font-semibold transition-all flex justify-between items-center"
                  >
                    Review Pending Approvals
                    <span className="bg-amber-500 text-gray-950 text-xs font-bold px-2 py-0.5 rounded-full">
                      {pendingRequests.length}
                    </span>
                  </button>
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

        {/* Pending Requests Tab */}
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
                      <div className="space-y-2 text-slate-600 text-sm mb-6">
                        <p><span className="font-semibold text-slate-500">Applicant:</span> {request.fullName}</p>
                        <p><span className="font-semibold text-slate-500">Email:</span> {request.email}</p>
                        <p><span className="font-semibold text-slate-500">Phone:</span> {request.phoneNumber}</p>
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
                        onClick={() => handleReject(request.id)}
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

        {/* Memberships Management Tab */}
        {activeTab === 'memberships' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create New Membership */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm h-fit">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Create Membership</h2>
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
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Benefits</label>
                  <textarea
                    placeholder="List the benefits..."
                    value={newMembership.benefits}
                    onChange={(e) => setNewMembership({ ...newMembership, benefits: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Requirements</label>
                  <textarea
                    placeholder="List the entry requirements..."
                    value={newMembership.requirements}
                    onChange={(e) => setNewMembership({ ...newMembership, requirements: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                    rows={3}
                    required
                  />
                </div>
                <button type="submit" className="w-full bg-gray-950 text-white font-bold py-2.5 rounded-xl hover:bg-amber-500 hover:text-gray-950 transition-all duration-200 text-sm">
                  Create Membership
                </button>
              </form>
            </div>

            {/* Existing Memberships */}
            <div className="lg:col-span-2">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Existing Memberships</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {memberships.map((membership) => (
                  <div key={membership.id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start border-b border-slate-50 pb-4 mb-4">
                        <h3 className="font-extrabold text-slate-900">{membership.title}</h3>
                        <button
                          onClick={() => handleDeleteMembership(membership.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <div className="space-y-4 text-slate-600 text-sm mb-2">
                        <div>
                          <span className="font-bold text-xs text-slate-400 uppercase tracking-wider block mb-1">Benefits:</span>
                          <p className="text-slate-600 text-sm leading-relaxed">{membership.benefits}</p>
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-400 uppercase tracking-wider block mb-1">Requirements:</span>
                          <p className="text-slate-500 text-sm leading-relaxed">{membership.requirements}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
