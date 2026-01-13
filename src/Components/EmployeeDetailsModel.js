// src/components/EmployeeDetailsModal.jsx
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
    FaBuilding,
    FaCalendar,
    FaClock,
    FaEnvelope,
    FaIdCard,
    FaMapMarkerAlt,
    FaPhone,
    FaSearch,
    FaTimes,
    FaUser,
    FaUserTie
} from 'react-icons/fa';

const EmployeeDetailsModal = ({ type, id, name, onClose }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, [type, id]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError('');
      
      let endpoint = '';
      if (type === 'department') {
        endpoint = `http://localhost:5000/api/department/${id}/employees`;
      } else if (type === 'role') {
        endpoint = `http://localhost:5000/api/roles/${id}/employees`;
      }
      
      const response = await axios.get(endpoint);
      
      if (response.data.success) {
        setEmployees(response.data.data.employees || []);
      } else {
        setError(response.data.message || 'Failed to load employees');
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Failed to load employees. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(employee => {
    if (!employee) return false;
    
    return (
      (employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (employee.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (employee.phone?.includes(searchTerm) || '')
    );
  });

  const getIcon = () => {
    return type === 'department' ? '🏢' : '👔';
  };

  const getTypeName = () => {
    return type === 'department' ? 'Department' : 'Role';
  };

  const getColorClass = () => {
    return type === 'department' ? 'blue' : 'green';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className={`p-6 border-b ${type === 'department' ? 'bg-blue-50' : 'bg-green-50'}`}>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span>{getIcon()}</span>
                <span>{name}</span>
                <span className="text-lg text-gray-600">- {getTypeName()} Employees</span>
              </h3>
              <p className="text-gray-600 mt-1">
                {type === 'department' 
                  ? 'All employees in this department' 
                  : 'All employees with this role'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              <FaTimes />
            </button>
          </div>

          {/* Stats */}
          <div className="flex gap-4 mt-4">
            <div className="bg-white px-4 py-2 rounded-lg border">
              <div className="text-xs text-gray-500">Total</div>
              <div className="text-xl font-bold">{employees.length}</div>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg border">
              <div className="text-xs text-gray-500">Showing</div>
              <div className="text-xl font-bold text-blue-600">{filteredEmployees.length}</div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees by name, email, phone, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto max-h-[50vh] p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Error Loading Employees</h3>
              <p className="text-gray-500 mb-6">{error}</p>
              <button
                onClick={fetchEmployees}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : filteredEmployees.length > 0 ? (
            <div className="space-y-4">
              {filteredEmployees.map((employee, index) => (
                <div
                  key={employee._id || index}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-4">
                    {/* Left Section */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${type === 'department' ? 'bg-blue-100' : 'bg-green-100'}`}>
                          <FaUser className={type === 'department' ? 'text-blue-600' : 'text-green-600'} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 text-lg">{employee.name || 'No Name'}</h4>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs flex items-center gap-1">
                              <FaIdCard className="text-xs" /> {employee.employeeId || 'N/A'}
                            </span>
                            {employee.role && type !== 'role' && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs flex items-center gap-1">
                                <FaUserTie className="text-xs" /> {employee.role}
                              </span>
                            )}
                            {employee.department && type !== 'department' && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs flex items-center gap-1">
                                <FaBuilding className="text-xs" /> {employee.department}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Section */}
                    <div className="md:w-2/5">
                      <div className="space-y-2">
                        {employee.email && (
                          <div className="flex items-center text-gray-600">
                            <FaEnvelope className="mr-2 text-sm" />
                            <span className="text-sm truncate">{employee.email}</span>
                          </div>
                        )}
                        {employee.phone && (
                          <div className="flex items-center text-gray-600">
                            <FaPhone className="mr-2 text-sm" />
                            <span className="text-sm">{employee.phone}</span>
                          </div>
                        )}
                        {employee.joinDate && (
                          <div className="flex items-center text-gray-600">
                            <FaCalendar className="mr-2 text-sm" />
                            <span className="text-sm">
                              {new Date(employee.joinDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  {(employee.address || employee.shiftType) && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex flex-wrap gap-4">
                        {employee.shiftType && (
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <FaClock className="text-xs" /> Shift: {employee.shiftType}
                          </div>
                        )}
                        {employee.address && (
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <FaMapMarkerAlt className="text-xs" /> {employee.address}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-5xl mb-4">
                {searchTerm ? '🔍' : getIcon()}
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {searchTerm ? 'No employees found' : 'No employees yet'}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? 'Try a different search term' 
                  : `No employees are assigned to this ${type} yet`}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Showing {filteredEmployees.length} of {employees.length} employees
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Close
              </button>
              {filteredEmployees.length > 0 && (
                <button
                  onClick={() => window.open('/employeelist', '_blank')}
                  className={`px-4 py-2 ${type === 'department' ? 'bg-blue-600' : 'bg-green-600'} text-white rounded-lg hover:${type === 'department' ? 'bg-blue-700' : 'bg-green-700'}`}
                >
                  View Full List
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailsModal;