import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  UserGroupIcon,
  EnvelopeIcon,
  TagIcon,
  MagnifyingGlassIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon as PendingIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../services/api';
import { format } from 'date-fns';

export default function CampaignResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [campaignData, setCampaignData] = useState({
    campaign: {},
    progress: {
      percentage: 0,
      stats: {
        total: 0,
        sent: 0,
        delivered: 0,
        failed: 0,
        pending: 0
      }
    },
    recentMessages: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  useEffect(() => {
    fetchCampaignResults();
  }, [id]);

  const fetchCampaignResults = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/campaigns/${id}/progress`);
      setCampaignData(response.data.data);
    } catch (error) {
      console.error('Error fetching campaign results:', error);
      toast.error('Failed to load campaign results');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnName) => {
    if (sortConfig.key !== columnName) {
      return null;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUpIcon className="h-4 w-4 inline-block" />
    ) : (
      <ChevronDownIcon className="h-4 w-4 inline-block" />
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy HH:mm');
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const exportToCSV = () => {
    const headers = [
      'Customer Name',
      'Email',
      'Message',
      'Status',
      'Created At',
      'Updated At'
    ];

    const rows = filteredMessages.map(message => [
      message.customerId?.name || 'Unknown',
      message.customerId?.email || 'Unknown',
      message.message,
      message.status,
      message.createdAt ? format(new Date(message.createdAt), 'yyyy-MM-dd HH:mm:ss') : '',
      message.updatedAt ? format(new Date(message.updatedAt), 'yyyy-MM-dd HH:mm:ss') : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${campaignData.campaign.name} Results.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter messages based on search term
  const filteredMessages = campaignData.recentMessages?.filter(message => {
    const searchLower = searchTerm.toLowerCase();
    return (
      message.customerId?.name?.toLowerCase().includes(searchLower) ||
      message.customerId?.email?.toLowerCase().includes(searchLower) ||
      message.message?.toLowerCase().includes(searchLower) ||
      message.status?.toLowerCase().includes(searchLower)
    );
  }) || [];

  // Sort messages
  const sortedMessages = [...filteredMessages].sort((a, b) => {
    if (sortConfig.key === 'customerId.name') {
      const nameA = a.customerId?.name?.toLowerCase() || '';
      const nameB = b.customerId?.name?.toLowerCase() || '';
      return sortConfig.direction === 'asc'
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    } else if (sortConfig.key === 'customerId.email') {
      const emailA = a.customerId?.email?.toLowerCase() || '';
      const emailB = b.customerId?.email?.toLowerCase() || '';
      return sortConfig.direction === 'asc'
        ? emailA.localeCompare(emailB)
        : emailB.localeCompare(emailA);
    } else if (sortConfig.key === 'createdAt' || sortConfig.key === 'updatedAt') {
      const dateA = new Date(a[sortConfig.key] || 0);
      const dateB = new Date(b[sortConfig.key] || 0);
      return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
      const valA = a[sortConfig.key]?.toLowerCase() || '';
      const valB = b[sortConfig.key]?.toLowerCase() || '';
      return sortConfig.direction === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }
  });

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'delivered':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'sent':
        return <EnvelopeIcon className="h-4 w-4 text-blue-500" />;
      case 'pending':
      default:
        return <PendingIcon className="h-4 w-4 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  const { campaign, progress } = campaignData;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <button
          onClick={() => navigate('/campaigns')}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
          aria-label="Go back"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {campaign?.name || 'Campaign'} Results
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track the delivery status and performance of your campaign
          </p>
        </div>
      </div>

      {/* Campaign Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start space-x-4">
          <div className="p-3 rounded-full bg-gray-100">
            <EnvelopeIcon className="h-6 w-6 text-gray-600" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">{campaign?.name}</h2>
            
            <div className="mt-3 flex flex-wrap gap-2">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                campaign?.status === 'active' ? 'bg-green-100 text-green-800' :
                campaign?.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                campaign?.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {campaign?.status?.toUpperCase() || 'UNKNOWN'}
              </span>
            </div>
            
            <div className="mt-4 grid grid-cols-4 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Total Recipients</dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900">
                  {campaign?.totalRecipients || 0}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Scheduled For</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {campaign?.scheduledFor ? formatDate(campaign.scheduledFor) : 'Not scheduled'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Progress</dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900">
                  {progress?.percentage || 0}%
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gray-100">
              <UserGroupIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-semibold text-gray-900">{progress?.stats?.total || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-2xl font-semibold text-gray-900">{progress?.stats?.delivered || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <XCircleIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-2xl font-semibold text-gray-900">{progress?.stats?.failed || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <PendingIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">{progress?.stats?.pending || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Progress</h3>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
          <div 
            className="bg-green-600 h-4 rounded-full" 
            style={{ width: `${progress?.percentage || 0}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <div>{progress?.percentage || 0}% complete</div>
          <div>{progress?.stats?.delivered || 0} / {progress?.stats?.total || 0} delivered</div>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Messages</h2>
          
          <div className="flex space-x-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={handleSearch}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
              />
            </div>
            
            <button
              onClick={exportToCSV}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              <ArrowDownTrayIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              Export CSV
            </button>
          </div>
        </div>
        
        {sortedMessages.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('customerId.name')}
                  >
                    <div className="flex items-center">
                      Customer
                      {getSortIcon('customerId.name')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('message')}
                  >
                    <div className="flex items-center">
                      Message
                      {getSortIcon('message')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      {getSortIcon('status')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center">
                      Created
                      {getSortIcon('createdAt')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('updatedAt')}
                  >
                    <div className="flex items-center">
                      Updated
                      {getSortIcon('updatedAt')}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedMessages.map((message) => (
                  <tr key={message._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-gray-500 font-medium">
                            {message.customerId?.name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{message.customerId?.name || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">{message.customerId?.email || 'Unknown'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {message.message}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(message.status)}
                        <span className={`ml-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(message.status)}`}>
                          {message.status?.toUpperCase() || 'UNKNOWN'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(message.createdAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(message.updatedAt)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center">
            <EnvelopeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No messages found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchTerm
                ? 'No messages match your search criteria.'
                : 'This campaign does not contain any messages yet.'}
            </p>
          </div>
        )}
        
        {sortedMessages.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
            Showing {sortedMessages.length} of {campaignData.recentMessages?.length || 0} messages
          </div>
        )}
      </div>
    </div>
  );
}