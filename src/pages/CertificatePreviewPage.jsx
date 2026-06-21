import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, endpoints } from '../services/api';
import { API_BASE_URL } from '../config/api';
import toast from 'react-hot-toast';

const CertificatePreviewPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // Fetch QR code from backend
  useEffect(() => {
    if (certificate?.certificateNumber) {
      const backendQrUrl = `${API_BASE_URL}${endpoints.certificates.qrcode(certificate.certificateNumber)}`;
      // Try backend QR first, fall back to generating locally
      fetch(backendQrUrl, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
        .then((res) => {
          if (res.ok) return res.blob();
          throw new Error('Backend QR not available');
        })
        .then((blob) => setQrCodeUrl(URL.createObjectURL(blob)))
        .catch(() => {
          // Fallback: generate QR locally with qrcode library
          import('qrcode').then(({ default: QRCode }) => {
            const verifyUrl = `${window.location.origin}/verify/${certificate.certificateNumber}`;
            QRCode.toDataURL(verifyUrl, { width: 250, margin: 1 })
              .then(setQrCodeUrl)
              .catch(console.error);
          });
        });
    }
  }, [certificate]);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const response = await api.get(endpoints.requests.getMy);
        const approvedRequest = response.data.find(
          (r) => String(r.id) === String(requestId) && r.status === 'Approved'
        );

        if (!approvedRequest?.certificateNumber) {
          toast.error('Certificate is not ready yet');
          navigate('/dashboard');
          return;
        }

        setCertificate(approvedRequest);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load certificate');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [navigate, requestId]);

  const handleDownload = () => {
    if (!certificate?.certificateNumber) return;
    const downloadUrl = `${API_BASE_URL}${endpoints.certificates.download(certificate.certificateNumber)}`;
    window.open(downloadUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500" />
        <p className="text-slate-500 text-sm font-medium">Loading certificate...</p>
      </div>
    );
  }

  if (!certificate) return null;

  const approvedDate = certificate.approvedAt ? new Date(certificate.approvedAt) : new Date();
  const expiryDate = new Date(approvedDate);
  expiryDate.setFullYear(expiryDate.getFullYear() + 2);
  const issueDateFormatted = approvedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const expiryDateFormatted = expiryDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const verificationUrl = `${window.location.origin}/verify/${certificate.certificateNumber}`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Action Bar — hidden on print */}
      <div className="screen-only bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Dashboard
            </Link>
            <span className="text-gray-300">|</span>
            <div>
              <p className="text-xs text-gray-400">Certificate</p>
              <p className="text-sm font-bold text-gray-900 leading-tight">{certificate.membership?.title}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-sm font-bold text-gray-700 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print / Save PDF
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 text-sm font-bold text-white bg-gray-900 px-3 py-2 rounded-lg hover:bg-amber-600 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download PDF
            </button>
            <Link
              to={`/verify/${certificate.certificateNumber}`}
              className="flex items-center gap-1.5 text-sm font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg hover:bg-amber-100 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Verify
            </Link>
          </div>
        </div>
      </div>

      {/* Certificate Wrapper */}
      <div className="flex-1 flex items-start justify-center certificate-page px-2 py-6 sm:py-10">
        {/* The certificate — prints as one full page */}
        <section
          className="certificate-print relative w-full bg-white shadow-xl"
          style={{
            maxWidth: '860px',
            border: '14px solid #d4af37',
            boxSizing: 'border-box',
          }}
        >
          {/* Inner Gold Border */}
          <div
            className="h-full w-full flex flex-col text-center relative overflow-hidden"
            style={{ border: '2px solid #d4af37', padding: 'clamp(18px, 4vw, 48px)' }}
          >
            {/* Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 pointer-events-none z-0 opacity-[0.04]">
              <svg width="100%" height="100%" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="#002060" />
                <path d="M 10 30 Q 50 20 90 30" fill="none" stroke="#ffffff" strokeWidth="3" />
                <path d="M 6 50 Q 50 40 94 50" fill="none" stroke="#ffffff" strokeWidth="3" />
                <path d="M 10 70 Q 50 60 90 70" fill="none" stroke="#ffffff" strokeWidth="3" />
              </svg>
            </div>

            <div className="relative z-10 flex flex-col gap-4 sm:gap-5">
              {/* Logo & Header */}
              <div>
                <svg width="48" height="48" viewBox="0 0 100 100" className="mx-auto mb-2">
                  <circle cx="50" cy="50" r="45" fill="#002060" />
                  <path d="M 10 30 Q 50 20 90 30" fill="none" stroke="#ffffff" strokeWidth="2.5" />
                  <path d="M 6 50 Q 50 40 94 50" fill="none" stroke="#ffffff" strokeWidth="2.5" />
                  <path d="M 10 70 Q 50 60 90 70" fill="none" stroke="#ffffff" strokeWidth="2.5" />
                  <path d="M 25 35 L 45 45 L 35 65" fill="none" stroke="#ff0000" strokeWidth="2.5" />
                  <circle cx="25" cy="35" r="5" fill="#ff0000" stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx="45" cy="45" r="5" fill="#ff0000" stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx="35" cy="65" r="5" fill="#ff0000" stroke="#ffffff" strokeWidth="1.5" />
                </svg>
                <div className="text-lg font-extrabold text-[#002060] uppercase tracking-widest leading-tight">CerVer Authority</div>
                <div className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-0.5">Digital Credentials &amp; Verification Hub</div>
                <div className="text-base sm:text-lg font-bold text-[#002060] mt-1">Certificate of Membership</div>
              </div>

              {/* Decorative Line */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#d4af37">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                </svg>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
              </div>

              {/* Recipient */}
              <div>
                <p className="text-[9px] sm:text-[10px] font-bold text-[#002060] italic uppercase tracking-widest mb-1">This is to certify that</p>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-[#800000] leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                  {certificate.fullName}
                </h2>
                <p className="text-[8px] sm:text-[10px] font-semibold text-[#002060] leading-relaxed max-w-xl mx-auto px-2 mt-2">
                  HAS BEEN OFFICIALLY EVALUATED, REGISTERED, AND RECOGNIZED AS A REGISTERED AND COMPLIANT MEMBER
                  WITH ALL CORRESPONDING PRIVILEGES, CREDENTIALS, AND RESPONSIBILITIES. IN ACKNOWLEDGMENT OF THESE
                  QUALIFICATIONS, CERVER ADMINISTRATION CONFERS THE DESIGNATION OF:
                </p>
              </div>

              {/* Designation */}
              <div>
                <div className="inline-block border border-[#d4af37] px-5 py-1.5 rounded">
                  <div className="text-lg sm:text-xl font-extrabold text-[#002060]">{certificate.membership?.title}</div>
                </div>
                <div className="text-[8px] sm:text-[9px] font-bold text-[#800000] uppercase tracking-widest mt-1.5">
                  Verification Serial: {certificate.id}
                </div>
              </div>

              <p className="text-[7px] sm:text-[9px] font-bold text-[#002060] italic tracking-wide">
                IN WITNESS WHEREOF, THIS DIGITAL CERTIFICATE IS CRYPTOGRAPHICALLY RECORDED AND SECURED WITHIN THE CERVER CENTRAL REGISTRY.
              </p>

              {/* Signatures & QR */}
              <div className="grid grid-cols-3 items-end gap-2">
                {/* Left Signature */}
                <div className="text-left">
                  <div className="text-xl sm:text-2xl text-[#002060] mb-1 leading-none" style={{ fontFamily: "'Brush Script MT', cursive" }}>
                    AdminCerver
                  </div>
                  <div className="w-full max-w-[120px] border-t border-[#002060] my-1" />
                  <div className="font-bold text-slate-800 text-[9px]">AdminCerver</div>
                  <div className="text-slate-500 text-[7px] sm:text-[8px]">For: President</div>
                </div>

                {/* Center QR */}
                <div className="flex flex-col items-center justify-center gap-1">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="Verification QR" className="w-14 h-14 sm:w-18 sm:h-18 border border-slate-200 p-0.5 bg-white" style={{ width: 'clamp(50px, 10vw, 80px)', height: 'clamp(50px, 10vw, 80px)' }} />
                  ) : (
                    <div className="w-14 h-14 border border-slate-100 bg-slate-50 flex items-center justify-center text-[7px] text-slate-400" style={{ width: 'clamp(50px, 10vw, 80px)', height: 'clamp(50px, 10vw, 80px)' }}>
                      QR Code
                    </div>
                  )}
                  <span className="text-[6px] text-slate-400 text-center leading-tight">Scan to verify</span>
                </div>

                {/* Right Signature */}
                <div className="text-right flex flex-col items-end">
                  <div className="text-xl sm:text-2xl text-[#002060] mb-1 leading-none" style={{ fontFamily: "'Brush Script MT', cursive" }}>
                    CerverAdmin
                  </div>
                  <div className="w-full max-w-[120px] border-t border-[#002060] my-1" />
                  <div className="font-bold text-slate-800 text-[9px]">CerverAdmin</div>
                  <div className="text-slate-500 text-[7px] sm:text-[8px]">For: Secretary</div>
                </div>
              </div>

              {/* Bottom Info Panel */}
              <div className="bg-[#f8fafc] border border-slate-200 rounded-lg py-2.5 px-4 grid grid-cols-3 text-left gap-2">
                <div>
                  <div className="text-[7px] font-bold text-[#002060] uppercase tracking-wider mb-0.5"># Certificate No.</div>
                  <div className="text-[9px] sm:text-[10px] font-mono font-bold text-[#002060] break-all">{certificate.certificateNumber}</div>
                </div>
                <div className="text-center">
                  <div className="text-[7px] font-bold text-[#002060] uppercase tracking-wider mb-0.5">📅 Issued On</div>
                  <div className="text-[9px] sm:text-[10px] font-bold text-[#002060]">{issueDateFormatted}</div>
                </div>
                <div className="text-right">
                  <div className="text-[7px] font-bold text-[#002060] uppercase tracking-wider mb-0.5">🛡️ Expires On</div>
                  <div className="text-[9px] sm:text-[10px] font-bold text-[#002060]">{expiryDateFormatted}</div>
                </div>
              </div>

              {/* Verify URL */}
              <div className="text-[6px] sm:text-[7px] text-slate-400 text-center break-all">
                Verify online: {verificationUrl}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CertificatePreviewPage;
