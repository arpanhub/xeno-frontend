import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  PlusIcon, 
  MinusIcon,
  FunnelIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function NewSegment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rules: [{ field: 'totalSpent', operator: '>', value: '' }],
    logicalOperator: 'AND'
  });

  const fieldOptions = [
    { value: 'totalSpent', label: 'Total Spent' },
    { value: 'status', label: 'Customer Status' }
  ];
  
  const operatorOptions = [
    { value: '>', label: '>' },
    { value: '<', label: '<' },
    { value: '>=', label: '≥' },
    { value: '<=', label: '≤' },
    { value: '==', label: '=' },
    { value: '!=', label: '≠' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleRuleChange = (index, field, value) => {
    const updatedRules = [...formData.rules];
    updatedRules[index] = { ...updatedRules[index], [field]: value };
    
    // If the field changes to status, set a default value for status
    if (field === 'field' && value === 'status') {
      updatedRules[index].value = 'active';
    }
    
    // If the field changes to totalSpent, set a default numeric value
    if (field === 'field' && value === 'totalSpent') {
      updatedRules[index].value = '';
    }
    
    setFormData({
      ...formData,
      rules: updatedRules
    });
  };

  const addRule = () => {
    setFormData({
      ...formData,
      rules: [...formData.rules, { field: 'totalSpent', operator: '>', value: '' }]
    });
  };

  const removeRule = (index) => {
    const updatedRules = formData.rules.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      rules: updatedRules
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Segment name is required');
      return false;
    }

    for (let i = 0; i < formData.rules.length; i++) {
      const rule = formData.rules[i];
      if (!rule.field || !rule.operator) {
        toast.error(`Rule #${i + 1} is incomplete`);
        return false;
      }

      if (rule.field === 'totalSpent' && (rule.value === '' || isNaN(rule.value))) {
        toast.error(`Rule #${i + 1}: Total Spent must be a valid number`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Convert totalSpent values to numbers
      const processedFormData = {
        ...formData,
        rules: formData.rules.map(rule => ({
          ...rule,
          value: rule.field === 'totalSpent' ? Number(rule.value) : rule.value
        }))
      };
      
      await api.post('/segments', processedFormData);
      toast.success('Segment created successfully');
      navigate('/segments');
    } catch (error) {
      console.error('Error creating segment:', error);
      toast.error(error.response?.data?.message || 'Failed to create segment');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-2xl font-semibold text-gray-900">Create New Segment</h1>
          <p className="mt-1 text-sm text-gray-500">
            Define criteria to group customers based on specific attributes
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow">
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Segment Name *
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                placeholder="E.g., High Value Customers"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                rows="3"
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                placeholder="Describe what this segment represents"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Segment Rules *
                </label>
                
                {formData.rules.length > 1 && (
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">Logical Operator:</span>
                    <select
                      name="logicalOperator"
                      value={formData.logicalOperator}
                      onChange={handleInputChange}
                      className="rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                    >
                      <option value="AND">AND</option>
                      <option value="OR">OR</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="space-y-4 border rounded-md p-4 bg-gray-50">
                {formData.rules.map((rule, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-1/3">
                      <select
                        value={rule.field}
                        onChange={(e) => handleRuleChange(index, 'field', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                      >
                        {fieldOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="w-1/4">
                      <select
                        value={rule.operator}
                        onChange={(e) => handleRuleChange(index, 'operator', e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                      >
                        {operatorOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="w-1/3">
                      {rule.field === 'totalSpent' ? (
                        <input
                          type="number"
                          value={rule.value}
                          onChange={(e) => handleRuleChange(index, 'value', e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                          placeholder="Enter amount"
                        />
                      ) : (
                        <select
                          value={rule.value}
                          onChange={(e) => handleRuleChange(index, 'value', e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                        >
                          {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    
                    <div>
                      <button
                        type="button"
                        onClick={() => removeRule(index)}
                        disabled={formData.rules.length === 1}
                        className={`p-2 rounded-full ${
                          formData.rules.length === 1 
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'text-gray-500 hover:bg-gray-100'
                        }`}
                        aria-label="Remove rule"
                      >
                        <MinusIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={addRule}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  >
                    <PlusIcon className="-ml-1 mr-1 h-4 w-4" />
                    Add Rule
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t pt-5">
            <div className="flex items-center">
              <TagIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-500">
                {formData.rules.length} {formData.rules.length === 1 ? 'rule' : 'rules'} defined
              </span>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => navigate('/segments')}
                className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-700 focus:outline-none disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <FunnelIcon className="-ml-1 mr-2 h-5 w-5 inline" />
                    Create Segment
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}