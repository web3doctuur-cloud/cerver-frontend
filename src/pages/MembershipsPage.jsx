import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, endpoints } from '../services/api';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// Parse stored string into bullet list items
const parseList = (str) => {
  if (!str) return [];
  return str.split(/[\n;]+/).map((s) => s.trim()).filter(Boolean);
};

const BulletList = ({ str, className = '' }) => {
  const items = parseList(str);
  if (items.length === 0) return <p className={`text-gray-400 text-sm italic ${className}`}>—</p>;
  return (
    <ul className={`space-y-1 ${className}`}>
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start gap-1.5 text-sm text-gray-600">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  );
};

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
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 text-sm font-medium text-amber-600 mb-4">
            <span className="flex h-2 w-2 rounded-full bg-amber-500" />
            {memberships.length} Membership{memberships.length !== 1 ? 's' : ''} Available
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-3">Available Memberships</h1>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">Choose the membership that fits your needs, apply online, and receive your certified digital credential.</p>
        </div>

        {memberships.length === 0 ? (
          <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <p className="text-gray-500 font-medium text-lg">No memberships available at this time.</p>
            <p className="text-gray-400 text-sm mt-1">Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {memberships.map((membership) => (
              <div key={membership.id} className="group bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl hover:border-amber-500/30 transition-all duration-300 flex flex-col">
                {/* Card Header */}
                <div className="p-6 pb-0">
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
                <div className="px-6 py-4 flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Benefits</p>
                  <BulletList str={membership.benefits} />
                </div>

                {/* Requirements */}
                <div className="px-6 py-4 border-t border-gray-50">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Requirements</p>
                  <BulletList str={membership.requirements} />
                </div>

                {/* CTA */}
                <div className="p-6 pt-4">
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
    </MainLayout>
  );
};

export default MembershipsPage;
