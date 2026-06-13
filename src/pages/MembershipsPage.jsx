import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, endpoints } from '../services/api';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const MembershipsPage = () => {
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
      toast.error('Failed to load memberships');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">Loading memberships...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900">Available Memberships</h1>
          <p className="text-gray-600 mt-2">Choose the membership that fits your needs</p>
        </div>

        {memberships.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
            <p className="text-gray-500">No memberships available at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {memberships.map((membership) => (
              <div key={membership.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{membership.title}</h3>
                <div className="h-1 w-12 bg-gray-900 mb-4"></div>
                <p className="text-gray-600 mb-4">{membership.benefits}</p>
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-1">Requirements:</p>
                  <p className="text-sm text-gray-500">{membership.requirements}</p>
                </div>
                {isAuthenticated ? (
                  <Link
                    to={`/memberships/${membership.id}/request`}
                    className="block w-full text-center bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-700 transition"
                  >
                    Apply Now
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    className="block w-full text-center border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition"
                  >
                    Login to Apply
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MembershipsPage;
