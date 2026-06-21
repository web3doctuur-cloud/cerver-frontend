import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, endpoints } from '../services/api';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// Parse stored string into list items
const parseList = (str) => {
  if (!str) return [];
  return str.split(/[\n;]+/).map((s) => s.trim()).filter(Boolean);
};

const BulletList = ({ str }) => {
  const items = parseList(str);
  if (items.length === 0) return <p className="text-gray-400 text-sm italic">None specified</p>;
  return (
    <ul className="space-y-1.5">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
};

const RequestFormPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const fetchMembership = async () => {
      try {
        const response = await api.get(endpoints.memberships.getById(id));
        setMembership(response.data);
      } catch {
        toast.error('Membership not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchMembership();
  }, [id, navigate]);

  useEffect(() => {
    if (user?.email) {
      setFormData((current) => ({ ...current, email: current.email || user.email }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file type. Please upload PDF, DOC, DOCX, JPG, or PNG');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File too large. Max size is 5MB');
        return;
      }
      setSelectedFile(file);
      toast.success('File selected successfully');
    }
  };

  const uploadFile = async (requestId) => {
    if (!selectedFile) return null;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', selectedFile);
    try {
      const response = await api.post(
        endpoints.requests.uploadRequirements(requestId),
        fd,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      toast.success('Requirements uploaded successfully');
      return response.data.filePath;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const requestResponse = await api.post(endpoints.requests.create, {
        membershipId: parseInt(id),
        ...formData
      });
      const newRequestId = requestResponse.data.requestId || requestResponse.data.id;
      if (selectedFile) {
        await uploadFile(newRequestId);
      }
      toast.success('Request submitted successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors font-medium mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Apply for {membership?.title}</h1>
          <p className="text-gray-500 mt-1">Fill out the form below to submit your membership application.</p>
        </div>

        {/* Membership Details */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-5 text-base">Membership Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Benefits</p>
              <BulletList str={membership?.benefits} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Requirements</p>
              <BulletList str={membership?.requirements} />
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-5">Application Form</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-sm"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-sm"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number *</label>
              <input
                type="tel"
                name="phoneNumber"
                required
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-sm"
                placeholder="+1234567890"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Upload Requirements File <span className="text-gray-400 font-normal">(optional)</span></label>
              <label className={`flex flex-col items-center justify-center w-full border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all ${selectedFile ? 'border-amber-400 bg-amber-50' : 'border-gray-200 bg-gray-50 hover:border-amber-400 hover:bg-amber-50/30'}`}>
                {selectedFile ? (
                  <div className="text-center">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-amber-700">{selectedFile.name}</p>
                    <p className="text-xs text-amber-600 mt-0.5">{(selectedFile.size / 1024).toFixed(1)} KB — Click to change</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <svg className="mx-auto h-10 w-10 text-gray-300 mb-3" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="text-sm font-semibold text-gray-600">Click to upload</p>
                    <p className="text-xs text-gray-400 mt-0.5">PDF, DOC, DOCX, JPG, PNG up to 5MB</p>
                  </div>
                )}
                <input type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting || uploading}
              className="w-full bg-gray-950 text-white py-3 rounded-xl hover:bg-amber-500 hover:text-gray-950 font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting || uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                  {uploading ? 'Uploading file...' : 'Submitting...'}
                </span>
              ) : (
                'Submit Application'
              )}
            </button>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default RequestFormPage;
