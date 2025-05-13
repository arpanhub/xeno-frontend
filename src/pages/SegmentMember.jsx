import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  UserGroupIcon,
  FunnelIcon,
  TagIcon,
  MagnifyingGlassIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../services/api';
import { format } from 'date-fns';

export default function SegmentMembers() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [segmentData, setSegmentData] = useState({
    segment: {},
    customers: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'totalSpent', direction: 'desc' });

  useEffect(() => {
    fetchSegmentMembers();
  }, [id]);

  const fetchSegmentMembers = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/segments/${id}/members`);
      setSegmentData(response.data.data);
    } catch (error) {
      console.error('Error fetching segment members:', error);
      toast.error('Failed to load segment members');
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const exportToCSV = () => {
    const headers = [
      'Name',
      'Email',
      'Phone',
      'Total Spent',
      'Total Orders',
      'Avg Order Value',
      'Last Order Date',
      'First Order Date'
    ];

    const rows = filteredCustomers.map(customer => [
      customer.name,
      customer.email,
      customer.phone,
      customer.totalSpent,
      customer.totalOrders,
      customer.averageOrderValue,
      customer.lastOrderDate ? format(new Date(customer.lastOrderDate), 'yyyy-MM-dd') : '',
      customer.firstOrderDate ? format(new Date(customer.firstOrderDate), 'yyyy-MM-dd') : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${segmentData.segment.name} Members.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter customers based on search term
  const filteredCustomers = segmentData.customers?.filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.phone?.toLowerCase().includes(searchLower)
    );
  }) || [];

  // Sort customers
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    if (a[sortConfig.key] === undefined || b[sortConfig.key] === undefined) {
      return 0;
    }
    
    if (sortConfig.key === 'name' || sortConfig.key === 'email' || sortConfig.key === 'phone') {
      if (sortConfig.direction === 'asc') {
        return a[sortConfig.key].localeCompare(b[sortConfig.key]);
      } else {
        return b[sortConfig.key].localeCompare(a[sortConfig.key]);
      }
    } else {
      if (sortConfig.direction === 'asc') {
        return a[sortConfig.key] - b[sortConfig.key];
      } else {
        return b[sortConfig.key] - a[sortConfig.key];
      }
    }
  });

  const renderSegmentRuleTag = (rule) => {
    const operatorSymbols = {
      '>': '>',
      '<': '<',
      '>=': '≥',
      '<=': '≤',
      '==': '=',
      '!=': '≠'
    };

    return (
      <span key={rule._id} className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800">
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

  const { segment, customers = [] } = segmentData;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <button
          onClick={() => navigate('/segments')}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
          aria-label="Go back"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {segment?.name || 'Segment'} Members
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {segment?.description || 'Customers matching this segment criteria'}
          </p>
        </div>
      </div>

      {/* Segment Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start space-x-4">
          <div className="p-3 rounded-full bg-gray-100">
            <FunnelIcon className="h-6 w-6 text-gray-600" />
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">{segment?.name}</h2>
            <p className="mt-1 text-sm text-gray-500">{segment?.description || 'No description'}</p>
            
            <div className="mt-3 flex flex-wrap gap-2">
              {segment?.rules && segment.rules.map(rule => renderSegmentRuleTag(rule))}
            </div>
            
            <div className="mt-4 flex items-center">
              <UserGroupIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-600 font-medium">
                {segment?.estimatedSize || customers?.length || 0} members
              </span>
              
              {segment?.logicalOperator && (
                <span className="ml-4 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">
                  {segment.logicalOperator} logic
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Customer List</h2>
          
          <div className="flex space-x-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                placeholder="Search customers..."
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
        
        {sortedCustomers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Customer
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('totalSpent')}
                  >
                    <div className="flex items-center">
                      Total Spent
                      {getSortIcon('totalSpent')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('totalOrders')}
                  >
                    <div className="flex items-center">
                      Orders
                      {getSortIcon('totalOrders')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('averageOrderValue')}
                  >
                    <div className="flex items-center">
                      Avg. Order
                      {getSortIcon('averageOrderValue')}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('lastOrderDate')}
                  >
                    <div className="flex items-center">
                      Last Order
                      {getSortIcon('lastOrderDate')}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedCustomers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-gray-500 font-medium">
                            {customer.name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                          <div className="text-sm text-gray-500">{customer.email}</div>
                          <div className="text-xs text-gray-400">{customer.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(customer.totalSpent)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.totalOrders}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(customer.averageOrderValue)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(customer.lastOrderDate)}</div>
                      <div className="text-xs text-gray-500">
                        First order: {formatDate(customer.firstOrderDate)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center">
            <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No customers found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchTerm
                ? 'No customers match your search criteria.'
                : 'This segment does not contain any customers.'}
            </p>
          </div>
        )}
        
        {sortedCustomers.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
            Showing {sortedCustomers.length} of {customers?.length || 0} customers
          </div>
        )}
      </div>
    </div>
  );
}