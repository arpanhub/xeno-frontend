import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon, 
  CalendarIcon,
  UserGroupIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../services/api';
import CampaignResults from './CampaignResults';

export default function NewCampaign() {
  const [loading, setLoading] = useState(false);
  const [segments, setSegments] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    segmentId: '',
    message: '',
    scheduledFor: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSegments = async () => {
      try {
        const response = await api.get('/segments');
        setSegments(response.data.data);
        if (response.data.data.length > 0) {
          setFormData(prev => ({ ...prev, segmentId: response.data.data[0]._id }));
        }
      } catch (error) {
        console.error('Error fetching segments:', error);
        toast.error('Failed to load segments');
      }
    };

    fetchSegments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/campaigns', formData);
      toast.success('Campaign created successfully');
      navigate('/campaigns');
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWithAI = async () => {
    try{
    setLoading(true);
    const response = await api.post('/genai',{
        CampaignName:formData.name,
        description:formData.description,
        audienceSize:segments.find(s=>s._id===formData.segmentId)?.estimatedSize||0
    });
    setLoading(false);
    setFormData(prev=>({
        ...prev,message:response.data.message
    }));
    
    toast.success('Message generated successfully');
}catch(error){
        toast.error('AI message generation will be implemented soon');
    }

  };

  // Format date to ISO string for the datetime-local input
  const formatDateForInput = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center">
        <button
          onClick={() => navigate('/campaigns')}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-500" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Create New Campaign</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create a new campaign to send targeted messages to your customers
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Campaign Name *
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                placeholder="Enter campaign name"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                placeholder="Enter campaign description"
              />
            </div>

            <div>
              <label htmlFor="segmentId" className="block text-sm font-medium text-gray-700">
                Target Segment *
              </label>
              <div className="mt-1 flex items-center">
                <select
                  name="segmentId"
                  id="segmentId"
                  value={formData.segmentId}
                  onChange={handleChange}
                  required
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                >
                  <option value="">Select a segment</option>
                  {segments.map(segment => (
                    <option key={segment._id} value={segment._id}>
                      {segment.name} ({segment.estimatedSize || 0} customers)
                    </option>
                  ))}
                </select>
                <div className="ml-2 flex items-center text-sm text-gray-500">
                  <UserGroupIcon className="h-4 w-4 mr-1" />
                  {formData.segmentId ? 
                    segments.find(s => s._id === formData.segmentId)?.estimatedSize || 0 : 
                    0} recipients
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Message Content *
              </label>
              <div className="mt-1 relative">
                <textarea
                  name="message"
                  id="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm"
                  placeholder="Enter your message content"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleGenerateWithAI}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    <SparklesIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                    Generate with AI
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="scheduledFor" className="block text-sm font-medium text-gray-700">
                Schedule Send Date *
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="datetime-local"
                  name="scheduledFor"
                  id="scheduledFor"
                  value={formData.scheduledFor || formatDateForInput()}
                  onChange={handleChange}
                  required
                  className="focus:ring-gray-900 focus:border-gray-900 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 px-3"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Choose when this campaign should be sent
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-5 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/campaigns')}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={()=>handleSubmit(e)}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}