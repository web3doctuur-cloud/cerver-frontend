import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, endpoints } from '../services/api';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';

// Parse stored string into list items
const parseList = (str) => {
  if (!str) return [];
  return str.split(/[\n;]+/).map((s) => s.trim()).filter(Boolean);
};

const BulletList = ({ str, dark = false }) => {
  const items = parseList(str);
  if (items.length === 0) return null;
  return (
    <ul className="space-y-1">
      {items.map((item, idx) => (
        <li key={idx} className={`flex items-start gap-1.5 text-sm ${dark ? 'text-slate-300' : 'text-slate-500'}`}>
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
};

const LandingPage = () => {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchMemberships();
  }, []);

  const fetchMemberships = async () => {
    try {
      const response = await api.get(endpoints.memberships.getActive);
      setMemberships(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-gray-950 via-slate-900 to-gray-900 text-white py-24 sm:py-32">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 text-sm font-medium text-amber-400 mb-8 animate-pulse">
            <span className="flex h-2 w-2 rounded-full bg-amber-400" />
            Empowering Secure Verifications
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-8 bg-gradient-to-r from-white via-amber-200 to-amber-500 bg-clip-text text-transparent">
            Digital Certificates <br className="hidden sm:inline" /> Made Simple &amp; Secure
          </h1>
          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-300 mb-10 leading-relaxed">
            Apply for professional memberships, track approvals, and download fully verifiable digital certificates complete with cryptographically linked QR codes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto bg-amber-500 text-gray-950 font-bold px-8 py-3.5 rounded-xl hover:bg-amber-400 transform hover:-translate-y-0.5 transition-all duration-200 shadow-[0_0_20px_rgba(245,158,11,0.3)] text-center"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/verify"
                  className="w-full sm:w-auto bg-slate-800/80 border border-slate-700 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-slate-700/80 transition-all duration-200 text-center"
                >
                  Verify Certificate
                </Link>
              </>
            ) : (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto bg-amber-500 text-gray-950 font-bold px-8 py-3.5 rounded-xl hover:bg-amber-400 transform hover:-translate-y-0.5 transition-all duration-200 shadow-[0_0_20px_rgba(245,158,11,0.3)] text-center"
              >
                Go to Dashboard →
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Memberships Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-4">
            Available Memberships
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            Find the right membership level, apply online, and obtain your certified credential instantly.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {memberships.map((membership) => (
              <div
                key={membership.id}
                className="group relative bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl hover:border-amber-500/30 transition-all duration-300 flex flex-col"
              >
                {/* Card Header */}
                <div className="p-8 pb-0">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                      {membership.title}
                    </h3>
                    <span className="bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-md flex-shrink-0">
                      Active
                    </span>
                  </div>
                </div>

                {/* Benefits */}
                <div className="px-8 py-4 flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Benefits</p>
                  <BulletList str={membership.benefits} />
                </div>

                {/* Requirements */}
                <div className="px-8 py-4 border-t border-gray-50">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Requirements</p>
                  <BulletList str={membership.requirements} />
                </div>

                {/* CTA */}
                <div className="p-8 pt-4">
                  {isAuthenticated ? (
                    <Link
                      to={`/memberships/${membership.id}/request`}
                      className="block w-full text-center bg-gray-950 text-white py-3 rounded-xl hover:bg-amber-500 hover:text-gray-950 font-bold transition-all duration-200 shadow-sm"
                    >
                      Apply Now
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      className="block w-full text-center border border-slate-200 text-slate-700 py-3 rounded-xl hover:bg-slate-50 font-semibold transition-all duration-200"
                    >
                      Login to Apply
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-slate-900 py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Why Choose CerVer?
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Secure, tamper-proof, and universally verifiable digital certificates.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
                title: 'Verified Certificates',
                desc: 'Each certificate is embedded with a unique QR code allowing instantly verifiable authentication via phone or scanner.',
              },
              {
                icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
                title: 'Enterprise-Grade Security',
                desc: 'Our platform uses industry standard JWT authentication and authorization protocols to secure your user records.',
              },
              {
                icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
                title: 'Automatic Record Generation',
                desc: 'Once approved, a certificate is automatically generated, numbered, and recorded, ready for you to download or print.',
              },
            ].map((feature) => (
              <div key={feature.title} className="bg-slate-800/50 border border-slate-800 p-8 rounded-2xl hover:-translate-y-1 transition-transform duration-300">
                <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                  </svg>
                </div>
                <h3 className="font-bold text-lg mb-3">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default LandingPage;
