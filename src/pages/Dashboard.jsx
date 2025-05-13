import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, ChartBarIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../services/api';
import { format } from 'date-fns';
import {
  CurrencyDollarIcon,
  UserGroupIcon,
  MegaphoneIcon,
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);
  const [generatingInsights, setGeneratingInsights] = useState(false);
  const [insightsLastGenerated, setInsightsLastGenerated] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setDashboardData(response.data);
        
        // Check for cached insights in localStorage
        const cachedInsights = localStorage.getItem('dashboardInsights');
        const lastGenerated = localStorage.getItem('insightsLastGenerated');
        
        if (cachedInsights && lastGenerated) {
          const parsedInsights = JSON.parse(cachedInsights);
          setInsights(parsedInsights);
          setInsightsLastGenerated(new Date(lastGenerated));
          
          // Only auto-generate fresh insights if it's been more than 24 hours
          const hoursSinceLastGeneration = (new Date() - new Date(lastGenerated)) / (1000 * 60 * 60);
          if (hoursSinceLastGeneration > 24) {
            generateInsights(response.data);
          }
        } else {
          // No cached insights, generate new ones
          generateInsights(response.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const generateInsights = async (data) => {
    if (!data) return;
    
    setGeneratingInsights(true);
    try {
      
      const response = await api.post('/genai/analytics', {
        totalCustomersCount: data.totalCustomers,
        recentOrdersCount: data.recentOrders.length,
        activeCampaignsCount: data.activeCampaigns.length,
        completedOrdersCount: data.recentOrders.filter(order => order.status === 'completed').length,
        pendingOrdersCount: data.recentOrders.filter(order => order.status === 'pending').length,
        cancelledOrdersCount: data.recentOrders.filter(order => order.status === 'cancelled').length,
        topCustomerCount: data.topCustomers.length
      });
      
      
      if (response.data && response.data.message) {
        const newInsights = {
          summary: response.data.message.summary,
          recommendations: extractRecommendations(response.data.message.recommendations)
        };
        
        setInsights(newInsights);
        
        
        const now = new Date();
        localStorage.setItem('dashboardInsights', JSON.stringify(newInsights));
        localStorage.setItem('insightsLastGenerated', now.toISOString());
        setInsightsLastGenerated(now);
        
        toast.success('Insights updated successfully');
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error('Failed to generate insights');
      
      const fallbackInsights = {
        summary: "Dashboard overview shows your business activity at a glance.",
        recommendations: [
          "Consider reaching out to your top customers for feedback.",
          "Follow up on pending orders to improve conversion rates.",
          "Look into reasons for any cancelled orders to reduce future cancellations."
        ]
      };
      
      setInsights(fallbackInsights);
      
      const now = new Date();
      localStorage.setItem('dashboardInsights', JSON.stringify(fallbackInsights));
      localStorage.setItem('insightsLastGenerated', new Date(now - 20 * 60 * 60 * 1000).toISOString());
      setInsightsLastGenerated(new Date(now - 20 * 60 * 60 * 1000));
    } finally {
      setGeneratingInsights(false);
    }
  };
  
  const extractRecommendations = (recommendations) => {
    if (!recommendations) return [];
    if (Array.isArray(recommendations) && typeof recommendations[0] === 'string') {
      return recommendations;
    }
    if (Array.isArray(recommendations) && typeof recommendations[0] === 'object') {
      return recommendations.map(rec => {
        if (rec.description) {
          return `${rec.description}`;
        } else if (rec.recommendation) {
          return `${rec.area}: ${rec.recommendation}`;
        } else if (rec.action) {
          return `${rec.priority} Priority - ${rec.action}`;
        } else {
          return JSON.stringify(rec);
        }
      });
    }
    
    
    return [JSON.stringify(recommendations)];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Failed to load dashboard data</p>
      </div>
    );
  }

  return (
    <div className="p-2 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-black p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gray-100">
              <UserGroupIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4 text-white">
              <p className="text-sm font-medium">Total Customers</p>
              <p className="text-2xl font-semibold">{dashboardData.totalCustomers}</p>
            </div>
          </div>
        </div>
        <div className="bg-black p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gray-100">
              <CurrencyDollarIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-white">Recent Orders</p>
              <p className="text-2xl font-semibold text-white">{dashboardData.recentOrders.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-black p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gray-100">
              <MegaphoneIcon className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-white">Active Campaigns</p>
              <p className="text-2xl font-semibold text-white">{dashboardData.activeCampaigns.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Insights Section */}
      <div className="bg-black rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-white flex items-center">
              <LightBulbIcon className="h-5 w-5 mr-2 text-yellow-400" />
              Business Insights
            </h2>
            <button 
              onClick={() => generateInsights(dashboardData)}
              disabled={generatingInsights}
              className="text-sm px-3 py-1 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 flex items-center"
            >
              {generatingInsights ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-black mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <ChartBarIcon className="h-4 w-4 mr-1" />
                  Refresh Insights
                </>
              )}
            </button>
          </div>
        </div>
        <div className="p-6 bg-gradient-to-r from-gray-900 to-black">
          {insights ? (
            <div className="space-y-4">
              <p className="text-white text-sm">{insights.summary}</p>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-200 mb-2">Recommendations:</h3>
                <ul className="space-y-2 text-white">
                  {insights.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <span className="flex-shrink-0 h-5 w-5 text-yellow-400 mr-2">•</span>
                      <span className="text-sm text-gray-200">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : generatingInsights ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-pulse text-white text-sm">
                Analyzing your business data...
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-400 text-sm">No insights available</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-black rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-white">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboardData.recentOrders.map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.customerId.name}</div>
                    <div className="text-sm text-gray-500">{order.customerId.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${order.amount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(order.createdAt), 'MMM d, yyyy')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Customers */}
      <div className="bg-black rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-medium text-white">Top Customers</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Order</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dashboardData.topCustomers.map((customer) => (
                <tr key={customer._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                    <div className="text-sm text-gray-500">{customer.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {customer.totalOrders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${customer.totalSpent}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(customer.lastOrderDate), 'MMM d, yyyy')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}