import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { 
  getAuditLogs, 
  getAuditStats, 
  getSuspiciousActivity,
  getFailedLoginAttempts 
} from '../utils/api';
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Clock, 
  User, 
  FileText,
  Filter,
  Download,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const AuditLogs = () => {
  const [activeTab, setActiveTab] = useState('logs'); // logs, stats, suspicious, failed-logins
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [suspicious, setSuspicious] = useState(null);
  const [failedLogins, setFailedLogins] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters
  const [filters, setFilters] = useState({
    action: '',
    resourceType: '',
    result: '',
    userId: '',
    startDate: '',
    endDate: '',
    limit: 50
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [timeRange, setTimeRange] = useState(24); // hours

  // Fetch audit logs
  const fetchAuditLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAuditLogs({
        ...filters,
        page: currentPage
      });
      
      setLogs(data.logs || []);
      setTotalPages(data.pagination.totalPages);
      setTotalCount(data.pagination.totalCount);
    } catch (err) {
      setError('Error fetching audit logs: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch audit stats
  const fetchAuditStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAuditStats(timeRange);
      setStats(data);
    } catch (err) {
      setError('Error fetching audit statistics: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch suspicious activity
  const fetchSuspiciousActivity = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSuspiciousActivity(timeRange);
      setSuspicious(data);
    } catch (err) {
      setError('Error fetching suspicious activity: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch failed logins
  const fetchFailedLogins = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFailedLoginAttempts(timeRange);
      setFailedLogins(data);
    } catch (err) {
      setError('Error fetching failed login attempts: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Effect to load data based on active tab
  useEffect(() => {
    if (activeTab === 'logs') {
      fetchAuditLogs();
    } else if (activeTab === 'stats') {
      fetchAuditStats();
    } else if (activeTab === 'suspicious') {
      fetchSuspiciousActivity();
    } else if (activeTab === 'failed-logins') {
      fetchFailedLogins();
    }
  }, [activeTab, currentPage, timeRange]);

  // Refresh current tab
  const handleRefresh = () => {
    if (activeTab === 'logs') fetchAuditLogs();
    else if (activeTab === 'stats') fetchAuditStats();
    else if (activeTab === 'suspicious') fetchSuspiciousActivity();
    else if (activeTab === 'failed-logins') fetchFailedLogins();
  };

  // Apply filters
  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchAuditLogs();
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      action: '',
      resourceType: '',
      result: '',
      userId: '',
      startDate: '',
      endDate: '',
      limit: 50
    });
    setCurrentPage(1);
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  // Get result badge color
  const getResultColor = (result) => {
    switch (result) {
      case 'SUCCESS': return 'bg-green-100 text-green-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'DENIED': return 'bg-yellow-100 text-yellow-800';
      case 'ERROR': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get action color
  const getActionColor = (action) => {
    if (action.includes('CREATE')) return 'bg-blue-100 text-blue-800';
    if (action.includes('UPDATE')) return 'bg-purple-100 text-purple-800';
    if (action.includes('DELETE')) return 'bg-red-100 text-red-800';
    if (action === 'LOGIN') return 'bg-green-100 text-green-800';
    if (action === 'LOGOUT') return 'bg-gray-100 text-gray-800';
    if (action === 'ACCESS_DENIED') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <AdminLayout>
      <div className="p-6 min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-purple-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Audit Logs</h1>
                <p className="text-gray-600 mt-1">Security and compliance monitoring</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 border-b">
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === 'logs'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                All Logs
              </div>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === 'stats'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Statistics
              </div>
            </button>
            <button
              onClick={() => setActiveTab('suspicious')}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === 'suspicious'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Suspicious Activity
              </div>
            </button>
            <button
              onClick={() => setActiveTab('failed-logins')}
              className={`px-4 py-2 font-semibold transition-colors ${
                activeTab === 'failed-logins'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Failed Logins
              </div>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-purple-600 font-semibold hover:text-purple-700"
              >
                <Filter className="w-4 h-4" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>

              {showFilters && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                    <select
                      value={filters.action}
                      onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                    >
                      <option value="">All Actions</option>
                      <option value="LOGIN">Login</option>
                      <option value="LOGOUT">Logout</option>
                      <option value="CREATE_PATIENT">Create Patient</option>
                      <option value="UPDATE_PATIENT">Update Patient</option>
                      <option value="VIEW_PATIENT">View Patient</option>
                      <option value="DELETE_PATIENT">Delete Patient</option>
                      <option value="ACCESS_DENIED">Access Denied</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Resource Type</label>
                    <select
                      value={filters.resourceType}
                      onChange={(e) => setFilters({ ...filters, resourceType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                    >
                      <option value="">All Resources</option>
                      <option value="PATIENT">Patient</option>
                      <option value="STAFF">Staff</option>
                      <option value="SYSTEM">System</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Result</label>
                    <select
                      value={filters.result}
                      onChange={(e) => setFilters({ ...filters, result: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                    >
                      <option value="">All Results</option>
                      <option value="SUCCESS">Success</option>
                      <option value="FAILED">Failed</option>
                      <option value="DENIED">Denied</option>
                      <option value="ERROR">Error</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="datetime-local"
                      value={filters.startDate}
                      onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="datetime-local"
                      value={filters.endDate}
                      onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                    <input
                      type="text"
                      value={filters.userId}
                      onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                      placeholder="Enter user ID"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div className="md:col-span-3 flex gap-2">
                    <button
                      onClick={handleApplyFilters}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Apply Filters
                    </button>
                    <button
                      onClick={handleResetFilters}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                  Audit Logs ({totalCount})
                </h2>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading audit logs...</p>
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No audit logs found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Result</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {logs.map((log) => (
                        <tr key={log._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              {formatTimestamp(log.timestamp)}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <div>
                                <div className="font-medium text-gray-900">{log.username}</div>
                                <div className="text-gray-500 text-xs">{log.userRole}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            <div>
                              <div className="font-medium">{log.resourceType}</div>
                              {log.resourceId && (
                                <div className="text-xs text-gray-500">{log.resourceId}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getResultColor(log.result)}`}>
                              {log.result}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {log.ipAddress || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 bg-gray-50 border-t flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages} ({totalCount} total logs)
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            {/* Time Range Selector */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
              >
                <option value={1}>Last Hour</option>
                <option value={6}>Last 6 Hours</option>
                <option value={24}>Last 24 Hours</option>
                <option value={72}>Last 3 Days</option>
                <option value={168}>Last Week</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading statistics...</p>
              </div>
            ) : stats ? (
              <div className="space-y-6">
                {/* Summary Card */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Summary</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats.totalLogs}</div>
                      <div className="text-sm text-gray-600">Total Logs</div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{stats.timeRange}</div>
                      <div className="text-sm text-gray-600">Time Range</div>
                    </div>
                  </div>
                </div>

                {/* Action Statistics */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Action Statistics</h2>
                  <div className="space-y-3">
                    {stats.actionStats.map((stat) => (
                      <div key={stat._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{stat._id}</div>
                          <div className="text-sm text-gray-600">
                            Success: {stat.success} | Failed: {stat.failed} | Denied: {stat.denied}
                          </div>
                        </div>
                        <div className="text-xl font-bold text-purple-600">{stat.count}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No statistics available</p>
              </div>
            )}
          </div>
        )}

        {/* Suspicious Activity Tab */}
        {activeTab === 'suspicious' && (
          <div className="space-y-6">
            {/* Time Range Selector */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
              >
                <option value={1}>Last Hour</option>
                <option value={6}>Last 6 Hours</option>
                <option value={24}>Last 24 Hours</option>
                <option value={72}>Last 3 Days</option>
                <option value={168}>Last Week</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading suspicious activity...</p>
              </div>
            ) : suspicious ? (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-red-600">{suspicious.summary.total}</div>
                        <div className="text-sm text-gray-600">Total Suspicious</div>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-red-600" />
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-yellow-600">{suspicious.summary.deniedAccess}</div>
                        <div className="text-sm text-gray-600">Access Denied</div>
                      </div>
                      <Shield className="w-8 h-8 text-yellow-600" />
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-orange-600">{suspicious.summary.failedLogins}</div>
                        <div className="text-sm text-gray-600">Failed Logins</div>
                      </div>
                      <User className="w-8 h-8 text-orange-600" />
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{suspicious.summary.unauthorizedAttempts}</div>
                        <div className="text-sm text-gray-600">Unauthorized</div>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                </div>

                {/* Recent Suspicious Events */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Suspicious Events</h2>
                  {suspicious.recentEvents.length === 0 ? (
                    <div className="text-center py-8 text-gray-600">No suspicious activity detected</div>
                  ) : (
                    <div className="space-y-2">
                      {suspicious.recentEvents.map((event) => (
                        <div key={event._id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getActionColor(event.action)}`}>
                                  {event.action}
                                </span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getResultColor(event.result)}`}>
                                  {event.result}
                                </span>
                              </div>
                              <div className="text-sm">
                                <span className="font-medium">{event.username}</span>
                                <span className="text-gray-600"> ({event.userRole})</span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {formatTimestamp(event.timestamp)} • IP: {event.ipAddress || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Failed Logins Tab */}
        {activeTab === 'failed-logins' && (
          <div className="space-y-6">
            {/* Time Range Selector */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
              >
                <option value={1}>Last Hour</option>
                <option value={6}>Last 6 Hours</option>
                <option value={24}>Last 24 Hours</option>
                <option value={72}>Last 3 Days</option>
                <option value={168}>Last Week</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading failed logins...</p>
              </div>
            ) : failedLogins ? (
              <div className="space-y-6">
                {/* Summary Card */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">Summary</h2>
                  <div className="text-3xl font-bold text-red-600">{failedLogins.totalFailedAttempts}</div>
                  <div className="text-sm text-gray-600">{failedLogins.timeRange}</div>
                </div>

                {/* Failed Attempts by User */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Failed Attempts by User</h2>
                  {failedLogins.summary.length === 0 ? (
                    <div className="text-center py-8 text-gray-600">No failed login attempts</div>
                  ) : (
                    <div className="space-y-3">
                      {failedLogins.summary.map((item) => (
                        <div 
                          key={item.username} 
                          className={`p-4 rounded-lg border ${
                            item.attempts >= 5 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <User className="w-5 h-5 text-gray-600" />
                              <span className="font-medium text-gray-800">{item.username}</span>
                              {item.attempts >= 5 && (
                                <AlertTriangle className="w-4 h-4 text-red-600" />
                              )}
                            </div>
                            <div className="text-xl font-bold text-red-600">{item.attempts}</div>
                          </div>
                          <div className="text-sm text-gray-600">
                            Last attempt: {formatTimestamp(item.lastAttempt)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            IP Addresses: {item.ipAddresses.join(', ') || 'N/A'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Failed Attempts */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Failed Attempts</h2>
                  {failedLogins.recentAttempts.length === 0 ? (
                    <div className="text-center py-8 text-gray-600">No recent failed attempts</div>
                  ) : (
                    <div className="space-y-2">
                      {failedLogins.recentAttempts.slice(0, 10).map((attempt) => (
                        <div key={attempt._id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-800">{attempt.username}</div>
                              <div className="text-xs text-gray-500">
                                {formatTimestamp(attempt.timestamp)} • IP: {attempt.ipAddress || 'N/A'}
                              </div>
                            </div>
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                              FAILED
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AuditLogs;
