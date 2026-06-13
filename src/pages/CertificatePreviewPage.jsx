import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, endpoints } from '../services/api';
import { API_BASE_URL, getBackendAssetUrl } from '../config/api';
import MainLayout from '../layouts/MainLayout';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';

const CertificatePreviewPage = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    if (certificate?.certificateNumber) {
      const verifyUrl = `${window.location.origin}/verify/${certificate.certificateNumber}`;
      QRCode.toDataURL(verifyUrl, { width: 250, margin: 1 })
        .then((url) => {
          setQrCodeUrl(url);
        })
        .catch((err) => {
          console.error('Failed to generate QR code:', err);
        });
    }
  }, [certificate]);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const response = await api.get(endpoints.requests.getMy);
        const approvedRequest = response.data.find(
          (request) => String(request.id) === String(requestId) && request.status === 'Approved'
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

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">Loading certificate...</div>
      </MainLayout>
    );
  }

  if (!certificate) return null;

  const approvedDate = certificate.approvedAt ? new Date(certificate.approvedAt) : new Date();
  const expiryDate = new Date(approvedDate);
  expiryDate.setFullYear(expiryDate.getFullYear() + 2);
  const backendPdfUrl = getBackendAssetUrl(certificate.certificatePath);
  const verificationPath = `${window.location.origin}/verify/${certificate.certificateNumber}`;
  const issueDateFormatted = approvedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const expiryDateFormatted = expiryDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <MainLayout>
      <div className="screen-only max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-500">Certificate</p>
            <h1 className="text-2xl font-bold text-gray-900">{certificate.membership?.title}</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/dashboard"
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
            >
              Back to Dashboard
            </Link>
            <button
              type="button"
              onClick={() => window.print()}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              Print or Save PDF
            </button>
            {backendPdfUrl && (
              <a
                href={backendPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition"
              >
                Download Backend PDF
              </a>
            )}
          </div>
        </div>
        
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 certificate-page">
        <section className="certificate-print relative mx-auto w-full max-w-5xl aspect-[1.414] bg-white border-[15px] border-[#d4af37] p-2 sm:p-3 shadow-md">
          {/* Inner Border */}
          <div className="border-2 border-[#d4af37] h-full w-full px-6 py-6 sm:px-12 sm:py-10 text-center relative overflow-hidden flex flex-col justify-between box-border">
            
            {/* Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 pointer-events-none z-0">
              <svg width="100%" height="100%" viewBox="0 0 100 100" opacity="0.04">
                <circle cx="50" cy="50" r="45" fill="#002060" />
                <path d="M 10 30 Q 50 20 90 30" fill="none" stroke="#ffffff" strokeWidth="3" />
                <path d="M 6 50 Q 50 40 94 50" fill="none" stroke="#ffffff" strokeWidth="3" />
                <path d="M 10 70 Q 50 60 90 70" fill="none" stroke="#ffffff" strokeWidth="3" />
              </svg>
            </div>

            <div className="relative z-10 w-full h-full flex flex-col justify-between">
              
              {/* Logo & Header */}
              <div className="header">
                <svg width="55" height="55" viewBox="0 0 100 100" className="mx-auto mb-2">
                  <circle cx="50" cy="50" r="45" fill="#002060" />
                  <path d="M 10 30 Q 50 20 90 30" fill="none" stroke="#ffffff" strokeWidth="2.5" />
                  <path d="M 6 50 Q 50 40 94 50" fill="none" stroke="#ffffff" strokeWidth="2.5" />
                  <path d="M 10 70 Q 50 60 90 70" fill="none" stroke="#ffffff" strokeWidth="2.5" />
                  <path d="M 25 35 L 45 45 L 35 65" fill="none" stroke="#ff0000" strokeWidth="2.5" />
                  <circle cx="25" cy="35" r="5" fill="#ff0000" stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx="45" cy="45" r="5" fill="#ff0000" stroke="#ffffff" strokeWidth="1.5" />
                  <circle cx="35" cy="65" r="5" fill="#ff0000" stroke="#ffffff" strokeWidth="1.5" />
                </svg>
                <div className="text-xl font-bold text-[#002060] uppercase tracking-wide">CerVer Authority</div>
                <div className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mt-1">Digital Credentials & Verification Hub</div>
                <div className="text-lg sm:text-xl font-bold text-[#002060] mt-1">Certificate of Membership</div>
              </div>

              {/* Recipient */}
              <div>
                <p className="text-xs font-bold text-[#002060] italic uppercase tracking-wider mb-1">This is to certify that</p>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-[#800000] my-2">{certificate.fullName}</h2>
                <p className="text-[9px] sm:text-xs font-bold text-[#002060] leading-relaxed max-w-2xl mx-auto px-4">
                  HAS BEEN OFFICIALLY EVALUATED, REGISTERED, AND RECOGNIZED AS A REGISTERED AND COMPLIANT MEMBER
                  WITH ALL CORRESPONDING PRIVILEGES, CREDENTIALS, AND RESPONSIBILITIES. IN ACKNOWLEDGMENT OF THESE
                  QUALIFICATIONS, CERVER ADMINISTRATION CONFERS THE DESIGNATION OF:
                </p>
              </div>

              {/* Designation */}
              <div className="my-2">
                <div className="text-xl sm:text-2xl font-bold text-[#002060]">{certificate.membership?.title}</div>
                <div className="text-[10px] sm:text-xs font-bold text-[#800000] uppercase tracking-wider mt-1">
                  Verification Serial: {certificate.id}
                </div>
              </div>

              <p className="text-[8px] sm:text-[10px] font-bold text-[#002060] italic tracking-wide">
                IN WITNESS WHEREOF, THIS DIGITAL CERTIFICATE IS CRYPTOGRAPHICALLY RECORDED AND SECURED WITHIN THE CERVER CENTRAL REGISTRY.
              </p>

              {/* Signatures & QR */}
              <div className="grid grid-cols-3 items-end mt-2 text-left">
                <div className="text-center sm:text-left">
                  <div className="text-2xl text-[#002060] mb-1 leading-none font-medium" style={{ fontFamily: "'Brush Script MT', cursive" }}>
                    AdminCerver
                  </div>
                  <div className="w-full max-w-[150px] border-t border-[#002060] my-1" />
                  <div className="font-bold text-slate-800 text-[10px]">AdminCerver</div>
                  <div className="text-slate-500 text-[8px] sm:text-[9px]">For: President</div>
                </div>

                <div className="flex flex-col items-center justify-center">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="Verification QR code" className="h-14 w-14 sm:h-16 sm:w-16 border border-slate-100 bg-white p-1" />
                  ) : (
                    <div className="h-14 w-14 sm:h-16 sm:w-16 border border-slate-100 bg-slate-50 flex items-center justify-center text-[8px] text-slate-400">
                      Generating...
                    </div>
                  )}
                </div>

                <div className="text-center sm:text-right flex flex-col items-center sm:items-end">
                  <div className="text-2xl text-[#002060] mb-1 leading-none font-medium" style={{ fontFamily: "'Brush Script MT', cursive" }}>
                    CerverAdmin
                  </div>
                  <div className="w-full max-w-[150px] border-t border-[#002060] my-1" />
                  <div className="font-bold text-slate-800 text-[10px]">CerverAdmin</div>
                  <div className="text-slate-500 text-[8px] sm:text-[9px]">For: Secretary</div>
                </div>
              </div>

              {/* Bottom Gray Panel */}
              <div className="bg-[#f8fafc] border border-slate-200 rounded-lg py-2 px-4 grid grid-cols-3 text-left mt-3">
                <div>
                  <div className="text-[8px] font-bold text-[#002060] uppercase tracking-wider mb-0.5"># Certificate No.</div>
                  <div className="text-[10px] sm:text-xs font-mono font-bold text-[#002060]">{certificate.certificateNumber}</div>
                </div>
                <div className="text-center">
                  <div className="text-[8px] font-bold text-[#002060] uppercase tracking-wider mb-0.5">📅 Issued On</div>
                  <div className="text-[10px] sm:text-xs font-bold text-[#002060]">{issueDateFormatted}</div>
                </div>
                <div className="text-right">
                  <div className="text-[8px] font-bold text-[#002060] uppercase tracking-wider mb-0.5">🛡️ Expires On</div>
                  <div className="text-[10px] sm:text-xs font-bold text-[#002060]">{expiryDateFormatted}</div>
                </div>
              </div>

            </div>

          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default CertificatePreviewPage;
