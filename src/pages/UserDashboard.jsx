import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, endpoints } from '../services/api';
import { getBackendAssetUrl, API_BASE_URL } from '../config/api';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const UserDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [myCertificates, setMyCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests');

  const certificates = requests.filter((r) => r.status === 'Approved' && r.certificateNumber);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [requestsRes, certsRes] = await Promise.all([
        api.get(endpoints.requests.getMy),
        api.get(endpoints.certificates.my).catch(() => ({ data: [] })), // graceful fallback
      ]);
      setRequests(requestsRes.data);
      setMyCertificates(certsRes.data || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = async (id) => {
    if (!confirm('Delete this request? This cannot be undone.')) return;
    try {
      await api.delete(endpoints.requests.delete(id));
      toast.success('Request deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete request');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/50">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/50">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending
          </span>
        );
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

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-slate-900 via-gray-900 to-amber-950/30 rounded-3xl p-8 mb-10 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-md border border-slate-800">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-2xl font-bold shadow-inner">
              {userInitial}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">My Workspace</h1>
              <p className="text-slate-400 text-sm sm:text-base mt-1">Signed in as {user?.email}</p>
            </div>
          </div>
          <Link
            to="/memberships"
            className="bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold px-6 py-2.5 rounded-xl transition-all duration-200 shadow-lg text-sm"
          >
            Apply for Membership
          </Link>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 gap-6 mb-8">
          {[
            { id: 'requests', label: `Applications (${requests.length})` },
            { id: 'certificates', label: `Certificates (${certificates.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-1 border-b-2 font-bold text-sm sm:text-base transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-amber-500 text-gray-900'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div>
            {requests.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-slate-500 font-medium text-lg">No active requests found</p>
                <p className="text-slate-400 text-sm mt-1">You haven't submitted any membership applications yet.</p>
                <Link to="/memberships" className="mt-5 inline-block bg-slate-950 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-amber-500 hover:text-gray-950 transition-all duration-200">
                  Browse Memberships →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {requests.map((request) => (
                  <div key={request.id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-lg text-slate-900">{request.membership?.title}</h3>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="space-y-2 text-slate-500 text-sm border-t border-slate-50 pt-4">
                        <p><span className="font-semibold text-slate-700">Applicant:</span> {request.fullName}</p>
                        <p><span className="font-semibold text-slate-700">Phone:</span> {request.phoneNumber}</p>
                        <p><span className="font-semibold text-slate-700">Applied on:</span> {new Date(request.requestedAt).toLocaleDateString()}</p>
                        {request.status === 'Rejected' && (
                          <p className="text-rose-600"><span className="font-semibold">Rejection reason:</span> {request.rejectionReason || 'Not specified'}</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-100">
                      {request.status === 'Approved' && request.certificateNumber ? (
                        <div className="flex gap-3">
                          <Link
                            to={`/certificates/${request.id}`}
                            className="flex-1 text-center bg-gray-950 text-white py-2.5 rounded-xl hover:bg-amber-500 hover:text-gray-950 font-bold transition-all duration-200 text-sm shadow-sm"
                          >
                            View Certificate
                          </Link>
                          <a
                            href={`${API_BASE_URL}${endpoints.certificates.download(request.certificateNumber)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 text-center border border-slate-200 text-slate-700 py-2.5 rounded-xl hover:bg-slate-50 font-semibold transition-all duration-200 text-sm"
                          >
                            Download
                          </a>
                        </div>
                      ) : request.status !== 'Rejected' && (
                        <button
                          onClick={() => handleDeleteRequest(request.id)}
                          className="text-xs text-slate-400 hover:text-rose-600 transition-colors font-medium flex items-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Cancel / Delete Request
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Certificates Tab */}
        {activeTab === 'certificates' && (
          <div>
            {certificates.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <p className="text-slate-500 font-medium text-lg">No certificates issued yet</p>
                <p className="text-slate-400 text-sm mt-1">Once your membership applications are approved, certificates will appear here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {certificates.map((cert) => (
                  <div key={cert.id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
                    <div>
                      <div className="border-b border-slate-50 pb-4 mb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Valid Certificate</span>
                        </div>
                        <h3 className="font-extrabold text-lg text-slate-900">{cert.membership?.title}</h3>
                        <p className="text-xs font-mono text-slate-400 mt-1">#{cert.certificateNumber}</p>
                      </div>
                      <div className="space-y-2 text-slate-600 text-sm mb-4">
                        <p><span className="font-medium text-slate-500">Issued to:</span> {cert.fullName}</p>
                        <p><span className="font-medium text-slate-500">Approved:</span> {cert.approvedAt ? new Date(cert.approvedAt).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
                      <Link
                        to={`/certificates/${cert.id}`}
                        className="flex-1 text-center bg-gray-950 text-white py-2.5 rounded-xl hover:bg-amber-500 hover:text-gray-950 font-bold transition-all duration-200 text-sm shadow-sm"
                      >
                        View &amp; Print
                      </Link>
                      <a
                        href={`${API_BASE_URL}${endpoints.certificates.download(cert.certificateNumber)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 text-center border border-slate-200 text-slate-700 py-2.5 rounded-xl hover:bg-slate-50 font-semibold transition-all duration-200 text-sm"
                      >
                        Download PDF
                      </a>
                      {cert.certificatePath && (
                        <a
                          href={getBackendAssetUrl(cert.certificatePath)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-center border border-amber-200 text-amber-700 py-2.5 px-3 rounded-xl hover:bg-amber-50 font-semibold transition-all duration-200 text-sm"
                          title="Download from server"
                        >
                          ↓ Alt
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default UserDashboard;
