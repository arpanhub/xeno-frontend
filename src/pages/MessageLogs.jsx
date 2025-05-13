import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  EnvelopeIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../services/api';
import { format } from 'date-fns';

export default function MessageLogs() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [messageLogs, setMessageLogs] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Fetch campaigns on component mount
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await api.get('/campaigns');
        setCampaigns(response.data.data || []);
      } catch (error) {
        console.error('Error fetching campaigns:', error);
        toast.error('Failed to load campaigns');
      }
    };
    
    fetchCampaigns();
  }, []);

  // Fetch message logs when params change
  useEffect(() => {
    fetchMessageLogs();
  }, [selectedCampaign, filterStatus, pagination.page, pagination.limit]);

  const fetchMessageLogs = async () => {
    setLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams();
      params.append('page', pagination.page);
      params.append('limit', pagination.limit);
      
      if (filterStatus) {
        params.append('status', filterStatus);
      }
      
      let url = '/message-logs';
      
      // If campaign is selected, get logs for that campaign
      if (selectedCampaign) {
        url = `/message-logs/campaign/${selectedCampaign}`;
      }
      
      const response = await api.get(`${url}?${params.toString()}`);
      
      setMessageLogs(response.data.data || []);
      
      if (response.data.pagination) {
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          pages: response.data.pagination.pages
        }));
      }
    } catch (error) {
      console.error('Error fetching message logs:', error);
      toast.error('Failed to load message logs');
    } finally {
      setLoading(false);
    }
  };

  const handleCampaignChange = (campaignId) => {
    setSelectedCampaign(campaignId);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when changing campaign
  };

  const handleStatusFilterChange = (status) => {
    setFilterStatus(status);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when changing filter
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRefresh = () => {
    fetchMessageLogs();
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
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

  // Filter logs based on search term
  const filteredLogs = messageLogs.filter(log => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (log.customerId?.name?.toLowerCase().includes(searchLower) || 
       log.customerId?.email?.toLowerCase().includes(searchLower) ||
       log.message?.toLowerCase().includes(searchLower) ||
       log.campaignId?.name?.toLowerCase().includes(searchLower))
    );
  });

  // Sort logs
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    if (sortConfig.key === 'campaignId.name') {
      const nameA = a.campaignId?.name?.toLowerCase() || '';
      const nameB = b.campaignId?.name?.toLowerCase() || '';
      return sortConfig.direction === 'asc'
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    } else if (sortConfig.key === 'customerId.name') {
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
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
    }
  };

  if (loading && messageLogs.length === 0) {
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
          <h1 className="text-2xl font-semibold text-gray-900">Message Logs</h1>
          <p className="mt-1 text-sm text-gray-500">
            View delivery status and tracking for all campaign messages
          </p>
        </div>
        <div>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Campaign Select */}
          <div className="w-full md:w-1/3">
            <label htmlFor="campaign-select" className="block text-sm font-medium text-gray-700 mb-1">
              Campaign
            </label>
            <select
              id="campaign-select"
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm rounded-md"
              value={selectedCampaign || ''}
              onChange={(e) => handleCampaignChange(e.target.value || null)}
            >
              <option value="">All Campaigns</option>
              {campaigns.map((campaign) => (
                <option key={campaign._id} value={campaign._id}>
                  {campaign.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Search */}
          <div className="w-full md:w-1/3">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                id="search"
                className="focus:ring-gray-900 focus:border-gray-900 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Search by customer, email, or message..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
          
          {/* Filter Toggle */}
          <div className="w-full md:w-auto flex justify-end">
            <button
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FunnelIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>
        
        {/* Additional Filters */}
        {showFilters && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-3">
              <button
                className={`px-3 py-1 rounded-full text-sm font-medium ${filterStatus === '' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                onClick={() => handleStatusFilterChange('')}
              >
                All
              </button>
              <button
                className={`px-3 py-1 rounded-full text-sm font-medium ${filterStatus === 'delivered' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                onClick={() => handleStatusFilterChange('delivered')}
              >
                <CheckCircleIcon className="inline-block h-4 w-4 mr-1" />
                Delivered
              </button>
              <button
                className={`px-3 py-1 rounded-full text-sm font-medium ${filterStatus === 'sent' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
                onClick={() => handleStatusFilterChange('sent')}
              >
                <EnvelopeIcon className="inline-block h-4 w-4 mr-1" />
                Sent
              </button>
              <button
                className={`px-3 py-1 rounded-full text-sm font-medium ${filterStatus === 'pending' ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}
                onClick={() => handleStatusFilterChange('pending')}
              >
                <ClockIcon className="inline-block h-4 w-4 mr-1" />
                Pending
              </button>
              <button
                className={`px-3 py-1 rounded-full text-sm font-medium ${filterStatus === 'failed' ? 'bg-red-600 text-white' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                onClick={() => handleStatusFilterChange('failed')}
              >
                <XCircleIcon className="inline-block h-4 w-4 mr-1" />
                Failed
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Message Logs Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            {loading ? 'Loading message logs...' : `Message Logs (${filteredLogs.length})`}
          </h2>
        </div>
        
        {sortedLogs.length > 0 ? (
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
                    onClick={() => handleSort('campaignId.name')}
                  >
                    <div className="flex items-center">
                      Campaign
                      {getSortIcon('campaignId.name')}
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
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-gray-500 font-medium">
                            {log.customerId?.name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{log.customerId?.name || 'Unknown'}</div>
                          <div className="text-sm text-gray-500">{log.customerId?.email || 'Unknown'}</div>
                        </div>
                      </div>
                    </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {log.campaignId?.name || 'Unknown Campaign'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {log.message}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(log.status)}
                        <span className={`ml-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(log.status)}`}>
                          {log.status?.toUpperCase() || 'UNKNOWN'}
                        </span>
                      </div>
                      {log.error && (
                        <div className="mt-1 text-xs text-red-600">
                          Error: {log.error}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(log.createdAt)}</div>
                      {log.updatedAt && log.updatedAt !== log.createdAt && (
                        <div className="text-xs text-gray-500">
                          Updated: {formatDate(log.updatedAt)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.campaignId?._id && (
                        <Link 
                          to={`/campaigns/${log.campaignId._id}/results`}
                          className="text-gray-600 hover:text-gray-900 mr-3"
                          title="View campaign results"
                        >
                          <ChartBarIcon className="h-5 w-5" />
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center">
            {loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black"></div>
              </div>
            ) : (
              <>
                <EnvelopeIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">No message logs found</h3>
                <p className="mt-2 text-sm text-gray-500">
                  {searchTerm
                    ? 'No messages match your search criteria.'
                    : filterStatus
                    ? `No ${filterStatus} messages found.`
                    : selectedCampaign
                    ? 'This campaign does not have any messages yet.'
                    : 'Try adjusting your filters or create a new campaign.'}
                </p>
              </>
            )}
          </div>
        )}
        
        {/* Pagination */}
        {sortedLogs.length > 0 && pagination.pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                      pagination.page <= 1 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-500 hover:bg-gray-50 cursor-pointer'
                    }`}
                    disabled={pagination.page <= 1}
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronUpIcon className="h-5 w-5 transform rotate-90" aria-hidden="true" />
                  </button>
                  
                  {/* Page numbers */}
                  {[...Array(pagination.pages).keys()].map((x) => {
                    const pageNumber = x + 1;
                    // Show first page, last page, and pages around current page
                    if (
                      pageNumber === 1 ||
                      pageNumber === pagination.pages ||
                      (pageNumber >= pagination.page - 1 && pageNumber <= pagination.page + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pagination.page === pageNumber
                              ? 'z-10 bg-gray-900 border-gray-900 text-white'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    }
                    
                    // Show ellipsis for gaps
                    if (
                      (pageNumber === 2 && pagination.page > 3) ||
                      (pageNumber === pagination.pages - 1 && pagination.page < pagination.pages - 2)
                    ) {
                      return (
                        <span
                          key={pageNumber}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                        >
                          ...
                        </span>
                      );
                    }
                    
                    return null;
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                      pagination.page >= pagination.pages
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-500 hover:bg-gray-50 cursor-pointer'
                    }`}
                    disabled={pagination.page >= pagination.pages}
                  >
                    <span className="sr-only">Next</span>
                    <ChevronDownIcon className="h-5 w-5 transform rotate-90" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}