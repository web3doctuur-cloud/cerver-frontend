import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, endpoints } from '../services/api';
import MainLayout from '../layouts/MainLayout';
import toast from 'react-hot-toast';

const VerifyCertificatePage = () => {
  const { certificateNumber: certificateNumberParam } = useParams();
  const [certificateNumber, setCertificateNumber] = useState(certificateNumberParam || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (certificateNumberParam) {
      setCertificateNumber(certificateNumberParam);
    }
  }, [certificateNumberParam]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!certificateNumber.trim()) {
      toast.error('Please enter a certificate number');
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const response = await api.get(endpoints.certificates.verify(certificateNumber));
      setResult(response.data);
    } catch (error) {
      setResult({
        valid: false,
        message: error.response?.data?.message || 'Certificate not found'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Verify Certificate</h1>
          <p className="text-gray-600 mt-2">Enter the certificate number to verify its authenticity</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          <form onSubmit={handleVerify} className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Enter certificate number"
                value={certificateNumber}
                onChange={(e) => setCertificateNumber(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </form>

          {searched && !loading && result && (
            <div className={`rounded-lg p-6 ${
              result.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  result.valid ? 'bg-green-200' : 'bg-red-200'
                }`}>
                  {result.valid ? (
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold text-lg ${
                    result.valid ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.valid ? 'Certificate is VALID' : 'Certificate is INVALID'}
                  </h3>
                  <p className={`mt-1 ${result.valid ? 'text-green-700' : 'text-red-700'}`}>
                    {result.message || (result.valid ? 'This certificate is authentic and active' : 'This certificate could not be verified')}
                  </p>

                  {result.valid && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Certificate Number</p>
                          <p className="font-medium text-gray-900">{result.certificateNumber}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Full Name</p>
                          <p className="font-medium text-gray-900">{result.fullName}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Membership Type</p>
                          <p className="font-medium text-gray-900">{result.membershipTitle}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Issue Date</p>
                          <p className="font-medium text-gray-900">
                            {result.issueDate ? new Date(result.issueDate).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Expiry Date</p>
                          <p className="font-medium text-gray-900">
                            {result.expiryDate ? new Date(result.expiryDate).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Status</p>
                          <p className={`font-medium ${result.isExpired ? 'text-red-600' : 'text-green-600'}`}>
                            {result.isExpired ? 'Expired' : 'Active'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {searched && !loading && !result && (
            <div className="text-center text-gray-500">
              Enter a certificate number to verify
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Where to find certificate number?</span>
            <br />
            Certificate numbers are included on the PDF certificate. They look like: 
            <span className="font-mono bg-gray-200 px-1 mx-1">CERT-YYYYMMDD-XXXXXX</span>
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default VerifyCertificatePage;
