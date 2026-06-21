import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 text-white mt-auto">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">CerVer</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">
              The trusted platform for issuing, managing, and verifying digital membership certificates with tamper-proof QR authentication.
            </p>
            <div className="flex items-center gap-1.5">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-semibold">All Systems Operational</span>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Platform</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/" className="text-slate-300 hover:text-amber-400 text-sm transition-colors duration-200 flex items-center gap-1.5 group">
                  <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-amber-400 transition-colors" />
                  Home
                </Link>
              </li>
              <li>
                <Link to="/memberships" className="text-slate-300 hover:text-amber-400 text-sm transition-colors duration-200 flex items-center gap-1.5 group">
                  <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-amber-400 transition-colors" />
                  Browse Memberships
                </Link>
              </li>
              <li>
                <Link to="/verify" className="text-slate-300 hover:text-amber-400 text-sm transition-colors duration-200 flex items-center gap-1.5 group">
                  <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-amber-400 transition-colors" />
                  Verify Certificate
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-slate-300 hover:text-amber-400 text-sm transition-colors duration-200 flex items-center gap-1.5 group">
                  <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-amber-400 transition-colors" />
                  My Dashboard
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-slate-300 hover:text-amber-400 text-sm transition-colors duration-200 flex items-center gap-1.5 group">
                  <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-amber-400 transition-colors" />
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Resources</h4>
            <ul className="space-y-2.5">
              <li>
                <a href="#" className="text-slate-300 hover:text-amber-400 text-sm transition-colors duration-200 flex items-center gap-1.5 group">
                  <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-amber-400 transition-colors" />
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-amber-400 text-sm transition-colors duration-200 flex items-center gap-1.5 group">
                  <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-amber-400 transition-colors" />
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-amber-400 text-sm transition-colors duration-200 flex items-center gap-1.5 group">
                  <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-amber-400 transition-colors" />
                  Support Center
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-amber-400 text-sm transition-colors duration-200 flex items-center gap-1.5 group">
                  <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-amber-400 transition-colors" />
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-amber-400 text-sm transition-colors duration-200 flex items-center gap-1.5 group">
                  <span className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-amber-400 transition-colors" />
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Verify CTA */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Quick Verify</h4>
            <p className="text-slate-400 text-sm mb-3">Instantly authenticate any certificate number.</p>
            <Link
              to="/verify"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-sm px-4 py-2.5 rounded-xl transition-all duration-200 shadow-md shadow-amber-500/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Verify Now
            </Link>

            <div className="mt-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Contact</h4>
              <a href="mailto:support@cerver.io" className="text-slate-300 hover:text-amber-400 text-sm transition-colors flex items-center gap-1.5">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                support@cerver.io
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-slate-500 text-xs">
            © {currentYear} CerVer — Certificate Verification System. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-slate-600 text-xs">Built for secure digital credentials</span>
            <div className="flex items-center gap-2">
              {/* Shield Icon */}
              <div className="w-6 h-6 bg-slate-800 rounded-md flex items-center justify-center" title="SSL Secured">
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              {/* Certificate Icon */}
              <div className="w-6 h-6 bg-slate-800 rounded-md flex items-center justify-center" title="Verified Platform">
                <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;