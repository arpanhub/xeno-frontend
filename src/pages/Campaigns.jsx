import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  EnvelopeIcon,
  CalendarIcon,
  UserGroupIcon,
  ChartBarIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../services/api';
import { format } from 'date-fns';

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await api.get('/campaigns');
        setCampaigns(response.data.data);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        toast.error('Failed to load campaigns');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const handleDeleteCampaign = async (id) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await api.delete(`/campaigns/${id}`);
        setCampaigns(campaigns.filter(campaign => campaign._id !== id));
        toast.success('Campaign deleted successfully');
      } catch (error) {
        console.error('Error deleting campaign:', error);
        toast.error('Failed to delete campaign');
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'sending':
        return 'bg-yellow-100 text-yellow-800';
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  const totalRecipients = campaigns.reduce((sum, campaign) => sum + (campaign.totalRecipients || 0), 0);
  const totalSent = campaigns.reduce((sum, campaign) => sum + (campaign.deliveryStats?.sent || 0), 0);
  const totalDelivered = campaigns.reduce((sum, campaign) => sum + (campaign.deliveryStats?.delivered || 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Campaigns</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage your marketing campaigns
          </p>
        </div>
        <div>
          <button
            onClick={() => navigate('/campaigns/new')}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-700 focus:outline-none"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            New Campaign
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gray-100">
              <EnvelopeIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
              <p className="text-2xl font-semibold text-gray-900">{campaigns.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gray-100">
              <UserGroupIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Recipients</p>
              <p className="text-2xl font-semibold text-gray-900">{totalRecipients}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gray-100">
              <ChartBarIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
              <p className="text-2xl font-semibold text-gray-900">
                {totalSent > 0 ? `${Math.round((totalDelivered / totalSent) * 100)}%` : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      {campaigns.length > 0 ? (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">All Campaigns</h2>
          </div>
          <ul className="divide-y divide-gray-200">
            {campaigns.map((campaign) => (
              <li key={campaign._id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 rounded-full bg-gray-100">
                      <EnvelopeIcon className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium text-gray-900">{campaign.name}</h3>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{campaign.description || 'No description'}</p>
                      
                      <div className="mt-3">
                        <div className="text-sm text-gray-700">
                          <span className="font-medium">Segment:</span> {campaign.segmentId?.name || 'Unknown segment'}
                        </div>
                        <div className="mt-1 text-sm text-gray-700 line-clamp-2">
                          <span className="font-medium">Message:</span> {campaign.message}
                        </div>
                      </div>
                      
                      <dl className="mt-4 grid grid-cols-3 gap-x-6 text-sm">
                        <div>
                          <dt className="text-gray-500">Recipients</dt>
                          <dd className="mt-1 text-gray-900 font-medium">{campaign.totalRecipients || 0}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">Scheduled for</dt>
                          <dd className="mt-1 text-gray-900 font-medium">
                            {campaign.scheduledFor ? format(new Date(campaign.scheduledFor), 'MMM d, yyyy') : 'Not scheduled'}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">Created</dt>
                          <dd className="mt-1 text-gray-900 font-medium">
                            {campaign.createdAt ? format(new Date(campaign.createdAt), 'MMM d, yyyy') : 'N/A'}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/campaigns/${campaign._id}`)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="Edit campaign"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteCampaign(campaign._id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                      title="Delete campaign"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link 
                    to={`/campaigns/${campaign._id}/results`}
                    className="text-sm font-medium text-gray-900 hover:text-gray-700 flex items-center"
                  >
                    <ChartBarIcon className="h-4 w-4 mr-1" />
                    View campaign analytics
                    <ChevronRightIcon className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-10 text-center">
          <EnvelopeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No campaigns found</h3>
          <p className="mt-2 text-sm text-gray-500">
            Get started by creating a new campaign.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/campaigns/new')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-700 focus:outline-none"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Campaign
            </button>
          </div>
        </div>
      )}
    </div>
  );
}