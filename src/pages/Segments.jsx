import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  UserGroupIcon,
  FunnelIcon,
  AdjustmentsHorizontalIcon,
  TagIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../services/api';
import { format } from 'date-fns';

export default function Segments() {
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSegments = async () => {
      try {
        const response = await api.get('/segments');
        setSegments(response.data.data);
      } catch (error) {
        console.error('Error fetching segments:', error);
        toast.error('Failed to load segments');
      } finally {
        setLoading(false);
      }
    };

    fetchSegments();
  }, []);

  const handleDeleteSegment = async (id) => {
    if (window.confirm('Are you sure you want to delete this segment?')) {
      try {
        await api.delete(`/segments/${id}`);
        setSegments(segments.filter(segment => segment._id !== id));
        toast.success('Segment deleted successfully');
      } catch (error) {
        console.error('Error deleting segment:', error);
        toast.error('Failed to delete segment');
      }
    }
  };

  const SegmentRuleTag = ({ rule }) => {
    const operatorSymbols = {
      '>': '>',
      '<': '<',
      '>=': '≥',
      '<=': '≤',
      '==': '=',
      '!=': '≠'
    };

    return (
      <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800">
        <TagIcon className="h-3 w-3 mr-1" />
        {rule.field} {operatorSymbols[rule.operator]} {rule.value}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Customer Segments</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage segments of customers based on specific criteria
          </p>
        </div>
        <div>
          <button
            onClick={() => navigate('/segments/new')}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-700 focus:outline-none"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            New Segment
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gray-100">
              <FunnelIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Segments</p>
              <p className="text-2xl font-semibold text-gray-900">{segments.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gray-100">
              <AdjustmentsHorizontalIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Rules</p>
              <p className="text-2xl font-semibold text-gray-900">
                {segments.length
                  ? (segments.reduce((sum, segment) => sum + (segment.rules?.length || 0), 0) / segments.length).toFixed(1)
                  : '0'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gray-100">
              <UserGroupIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-semibold text-gray-900">
                {segments.reduce((sum, segment) => sum + (segment.estimatedSize || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Segments List */}
      {segments.length > 0 ? (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">All Segments</h2>
          </div>
          <ul className="divide-y divide-gray-200">
            {segments.map((segment) => (
              <li key={segment._id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 rounded-full bg-gray-100">
                      <FunnelIcon className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{segment.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">{segment.description || 'No description'}</p>
                      
                      <div className="mt-3 flex flex-wrap gap-2">
                        {segment.rules && segment.rules.map((rule, idx) => (
                          <SegmentRuleTag key={rule._id || idx} rule={rule} />
                        ))}
                      </div>
                      
                      <dl className="mt-4 grid grid-cols-3 gap-x-6 text-sm">
                        <div>
                          <dt className="text-gray-500">Members</dt>
                          <dd className="mt-1 text-gray-900 font-medium">{segment.estimatedSize || 0}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">Rules</dt>
                          <dd className="mt-1 text-gray-900 font-medium">
                            {segment.rules?.length || 0} {segment.rules?.length === 1 ? 'rule' : 'rules'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">Created</dt>
                          <dd className="mt-1 text-gray-900 font-medium">
                            {segment.createdAt ? format(new Date(segment.createdAt), 'MMM d, yyyy') : 'N/A'}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/segments/${segment._id}`)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="Edit segment"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSegment(segment._id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                      title="Delete segment"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link 
                    to={`/segments/${segment._id}/members`}
                    className="text-sm font-medium text-gray-900 hover:text-gray-700 flex items-center"
                  >
                    <UserGroupIcon className="h-4 w-4 mr-1" />
                    View segment members
                    <ChevronRightIcon className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-10 text-center">
          <FunnelIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No segments found</h3>
          <p className="mt-2 text-sm text-gray-500">
            Get started by creating a new customer segment.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/segments/new')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-700 focus:outline-none"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Segment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}