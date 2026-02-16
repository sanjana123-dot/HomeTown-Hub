import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import LoadingSpinner from '../components/LoadingSpinner'
import {
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiActivity,
  FiHome,
  FiUserPlus,
  FiShield,
  FiSearch,
  FiUnlock,
  FiAlertCircle,
  FiTrendingUp,
  FiTrash2,
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import ConfirmDialog from '../components/ConfirmDialog'
import api from '../services/api'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCommunities: 0,
    pendingCommunities: 0,
    totalPosts: 0,
    suspendedUsers: 0,
    bannedUsers: 0,
    totalModerators: 0,
    recentUsers: 0,
  })
  const [pendingCommunities, setPendingCommunities] = useState([])
  const [allCommunities, setAllCommunities] = useState([])
  const [admins, setAdmins] = useState([])
  const [users, setUsers] = useState([])
  const [usersPage, setUsersPage] = useState(1)
  const [usersTotalPages, setUsersTotalPages] = useState(1)
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('')
  const [showCreateAdmin, setShowCreateAdmin] = useState(false)
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    hometown: '',
    city: '',
    state: '',
  })
  const [adminPassword, setAdminPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [communityToDelete, setCommunityToDelete] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    fetchAdminData()
  }, [])

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers()
    }
  }, [activeTab, usersPage, userSearch, userRoleFilter])

  const fetchAdminData = async () => {
    try {
      const [statsRes, communitiesRes, allCommunitiesRes, adminsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/communities/pending'),
        api.get('/admin/communities/all'),
        api.get('/admin/admins'),
      ])
      setStats(statsRes.data)
      setPendingCommunities(communitiesRes.data)
      setAllCommunities(allCommunitiesRes.data)
      setAdmins(adminsRes.data)
    } catch (error) {
      console.error('Error fetching admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams({
        page: usersPage.toString(),
        limit: '20',
      })
      if (userSearch) params.append('search', userSearch)
      if (userRoleFilter) params.append('role', userRoleFilter)

      const response = await api.get(`/admin/users?${params}`)
      setUsers(response.data.users)
      setUsersTotalPages(response.data.totalPages)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleCreateAdmin = async (e) => {
    e.preventDefault()
    try {
      const response = await api.post('/admin/admins', newAdmin)
      setAdminPassword(response.data.temporaryPassword)
      setNewAdmin({ name: '', email: '', hometown: '', city: '', state: '' })
      fetchAdminData()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create admin')
    }
  }

  const handleApproveCommunity = async (id) => {
    try {
      await api.put(`/admin/communities/${id}/approve`)
      fetchAdminData()
    } catch (error) {
      console.error('Error approving community:', error)
      alert(error.response?.data?.message || 'Failed to approve community')
    }
  }

  const handleRejectCommunity = async (id) => {
    try {
      await api.put(`/admin/communities/${id}/reject`)
      fetchAdminData()
    } catch (error) {
      console.error('Error rejecting community:', error)
      alert(error.response?.data?.message || 'Failed to reject community')
    }
  }

  const handleDeleteCommunityClick = (communityId) => {
    setCommunityToDelete(communityId)
  }

  const handleDeleteCommunityConfirm = async () => {
    if (!communityToDelete) return
    setDeleteLoading(true)
    try {
      await api.delete(`/admin/communities/${communityToDelete}`)
      setCommunityToDelete(null)
      fetchAdminData()
      alert('Community deleted successfully')
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete community')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleSuspendUser = async (userId) => {
    const reason = window.prompt('Enter suspension reason (optional):')
    try {
      await api.put(`/admin/users/${userId}/suspend`, { reason })
      fetchUsers()
      fetchAdminData()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to suspend user')
    }
  }

  const handleUnsuspendUser = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/unsuspend`)
      fetchUsers()
      fetchAdminData()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to unsuspend user')
    }
  }

  const handleBanUser = async (userId) => {
    const reason = window.prompt('Enter ban reason (optional):')
    try {
      await api.put(`/admin/users/${userId}/ban`, { reason })
      fetchUsers()
      fetchAdminData()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to ban user')
    }
  }

  const handleUnbanUser = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/unban`)
      fetchUsers()
      fetchAdminData()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to unban user')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-light dark:bg-black dark:text-white transition-colors">
        <Navbar />
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-light dark:bg-black dark:text-white transition-colors">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-dark dark:text-white">Platform Admin Dashboard</h1>
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-secondary flex items-center space-x-2"
              >
                <FiHome />
                <span>Member Dashboard</span>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 mb-6 border-b dark:border-gray-800">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-2 px-4 font-semibold ${
                  activeTab === 'overview'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-500 dark:text-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`pb-2 px-4 font-semibold ${
                  activeTab === 'users'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-500 dark:text-gray-300'
                }`}
              >
                User Management
              </button>
              <button
                onClick={() => setActiveTab('communities')}
                className={`pb-2 px-4 font-semibold ${
                  activeTab === 'communities'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-500 dark:text-gray-300'
                }`}
              >
                Community Approvals
              </button>
              <button
                onClick={() => setActiveTab('admins')}
                className={`pb-2 px-4 font-semibold ${
                  activeTab === 'admins'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-500 dark:text-gray-300'
                }`}
              >
                Admin Management
              </button>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {/* Enhanced Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="card dark:bg-gray-900 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">Total Users</p>
                        <p className="text-3xl font-bold text-dark dark:text-white">{stats.totalUsers}</p>
                        {stats.recentUsers > 0 && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            +{stats.recentUsers} this week
                          </p>
                        )}
                      </div>
                      <FiUsers className="text-4xl text-primary" />
                    </div>
                  </div>
                  <div className="card dark:bg-gray-900 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">Total Communities</p>
                        <p className="text-3xl font-bold text-dark dark:text-white">{stats.totalCommunities}</p>
                      </div>
                      <FiActivity className="text-4xl text-secondary" />
                    </div>
                  </div>
                  <div className="card dark:bg-gray-900 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">Pending Approvals</p>
                        <p className="text-3xl font-bold text-dark dark:text-white">{stats.pendingCommunities}</p>
                      </div>
                      <FiAlertCircle className="text-4xl text-accent" />
                    </div>
                  </div>
                  <div className="card dark:bg-gray-900 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">Total Posts</p>
                        <p className="text-3xl font-bold text-dark dark:text-white">{stats.totalPosts}</p>
                      </div>
                      <FiTrendingUp className="text-4xl text-primary" />
                    </div>
                  </div>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="card dark:bg-gray-900 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">Suspended Users</p>
                        <p className="text-2xl font-bold text-orange-600">{stats.suspendedUsers}</p>
                      </div>
                      <FiXCircle className="text-3xl text-orange-500" />
                    </div>
                  </div>
                  <div className="card dark:bg-gray-900 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">Banned Users</p>
                        <p className="text-2xl font-bold text-red-600">{stats.bannedUsers}</p>
                      </div>
                      <FiXCircle className="text-3xl text-red-500" />
                    </div>
                  </div>
                  <div className="card dark:bg-gray-900 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">Moderators</p>
                        <p className="text-2xl font-bold text-dark dark:text-white">{stats.totalModerators}</p>
                      </div>
                      <FiShield className="text-3xl text-secondary" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* User Management Tab */}
            {activeTab === 'users' && (
              <div className="card dark:bg-gray-900 dark:border-gray-800">
                <h2 className="text-2xl font-semibold mb-4 text-dark dark:text-white">User Management</h2>

                {/* Filters */}
                <div className="mb-4 flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={userSearch}
                        onChange={(e) => {
                          setUserSearch(e.target.value)
                          setUsersPage(1)
                        }}
                        className="input-field pl-10"
                      />
                    </div>
                  </div>
                  <select
                    value={userRoleFilter}
                    onChange={(e) => {
                      setUserRoleFilter(e.target.value)
                      setUsersPage(1)
                    }}
                    className="input-field"
                  >
                    <option value="">All Roles</option>
                    <option value="user">Users</option>
                    <option value="moderator">Moderators</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>

                {/* Users List */}
                {users.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-300">No users found.</p>
                ) : (
                  <div className="space-y-3">
                    {users.map((u) => (
                      <div
                        key={u._id}
                        className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-800 dark:bg-gray-800/50"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                            {u.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-dark dark:text-white">
                              {u.name}
                              {u.role === 'admin' && (
                                <span className="ml-2 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-0.5 rounded">
                                  Admin
                                </span>
                              )}
                              {u.role === 'moderator' && (
                                <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                                  Moderator
                                </span>
                              )}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-300">{u.email}</p>
                            {u.isSuspended && (
                              <p className="text-xs text-orange-600 dark:text-orange-400">
                                ⚠️ Suspended: {u.suspensionReason || 'No reason provided'}
                              </p>
                            )}
                            {u.isBanned && (
                              <p className="text-xs text-red-600 dark:text-red-400">
                                🚫 Banned: {u.banReason || 'No reason provided'}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {u.isSuspended ? (
                            <button
                              onClick={() => handleUnsuspendUser(u._id)}
                              className="text-sm px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                            >
                              Unsuspend
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSuspendUser(u._id)}
                              className="text-sm px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                            >
                              Suspend
                            </button>
                          )}
                          {u.isBanned ? (
                            <button
                              onClick={() => handleUnbanUser(u._id)}
                              className="text-sm px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                            >
                              Unban
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBanUser(u._id)}
                              className="text-sm px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                            >
                              Ban
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {usersTotalPages > 1 && (
                  <div className="mt-4 flex justify-center space-x-2">
                    <button
                      onClick={() => setUsersPage((p) => Math.max(1, p - 1))}
                      disabled={usersPage === 1}
                      className="px-4 py-2 border rounded-lg disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2">
                      Page {usersPage} of {usersTotalPages}
                    </span>
                    <button
                      onClick={() => setUsersPage((p) => Math.min(usersTotalPages, p + 1))}
                      disabled={usersPage === usersTotalPages}
                      className="px-4 py-2 border rounded-lg disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Community Approvals Tab */}
            {activeTab === 'communities' && (
              <div className="space-y-6">
                {/* Pending Communities */}
                <div className="card dark:bg-gray-900 dark:border-gray-800">
                  <h2 className="text-2xl font-semibold mb-4 text-dark dark:text-white">
                    Pending Community Approvals
                  </h2>
                  {pendingCommunities.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-300">No pending approvals.</p>
                  ) : (
                    <div className="space-y-4">
                      {pendingCommunities.map((community) => (
                        <div
                          key={community._id}
                          className="border rounded-lg p-4 dark:border-gray-800 dark:bg-gray-800/50"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-dark dark:text-white mb-2">
                                {community.name}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-300 mb-2">{community.description}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-300">
                                {community.city}, {community.state}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-300">
                                Created by: {community.creator?.name} ({community.creator?.email})
                              </p>
                              {community.rules && (
                                <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                                  <strong>Rules:</strong> {community.rules}
                                </div>
                              )}
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <button
                                onClick={() => handleApproveCommunity(community._id)}
                                className="btn-secondary flex items-center space-x-2"
                              >
                                <FiCheckCircle />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleRejectCommunity(community._id)}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center space-x-2"
                              >
                                <FiXCircle />
                                <span>Reject</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* All Communities (with delete option) */}
                <div className="card dark:bg-gray-900 dark:border-gray-800">
                  <h2 className="text-2xl font-semibold mb-4 text-dark dark:text-white">
                    All Communities
                  </h2>
                  {allCommunities.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-300">No communities found.</p>
                  ) : (
                    <div className="space-y-4">
                      {allCommunities.map((community) => (
                        <div
                          key={community._id}
                          className="border rounded-lg p-4 dark:border-gray-800 dark:bg-gray-800/50"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-xl font-semibold text-dark dark:text-white">
                                  {community.name}
                                </h3>
                                <span
                                  className={`text-xs px-2 py-1 rounded ${
                                    community.status === 'approved'
                                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                      : community.status === 'pending'
                                      ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                                      : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                  }`}
                                >
                                  {community.status}
                                </span>
                              </div>
                              <p className="text-gray-600 dark:text-gray-300 mb-2">{community.description}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-300">
                                {community.city}, {community.state} • {community.memberCount || 0} Members
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-300">
                                Created by: {community.creator?.name} ({community.creator?.email})
                              </p>
                            </div>
                            <div className="flex space-x-2 ml-4">
                              <button
                                onClick={() => navigate(`/community/${community._id}`)}
                                className="btn-secondary text-sm"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleDeleteCommunityClick(community._id)}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center space-x-2 text-sm"
                                title="Delete community"
                              >
                                <FiTrash2 />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Admin Management Tab */}
            {activeTab === 'admins' && (
              <div className="card dark:bg-gray-900 dark:border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-semibold text-dark dark:text-white">Admin Management</h2>
                  <button
                    onClick={() => setShowCreateAdmin(!showCreateAdmin)}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <FiUserPlus />
                    <span>Create Admin</span>
                  </button>
                </div>

                {showCreateAdmin && (
                  <div className="border-t dark:border-gray-800 pt-4 mb-4">
                    {adminPassword && (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                        <p className="font-semibold text-green-800 dark:text-green-200 mb-2">
                          Admin Created Successfully!
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300 mb-1">Temporary Password:</p>
                        <code className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-sm font-mono block mb-2">
                          {adminPassword}
                        </code>
                        <p className="text-xs text-green-600 dark:text-green-400">
                          ⚠️ Share this password securely. User should change it after first login.
                        </p>
                        <button
                          onClick={() => setAdminPassword('')}
                          className="mt-2 text-xs text-green-700 dark:text-green-300 underline"
                        >
                          Close
                        </button>
                      </div>
                    )}
                    <form onSubmit={handleCreateAdmin} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Name *
                          </label>
                          <input
                            type="text"
                            value={newAdmin.name}
                            onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                            className="input-field dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email *
                          </label>
                          <input
                            type="email"
                            value={newAdmin.email}
                            onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                            className="input-field dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Hometown
                          </label>
                          <input
                            type="text"
                            value={newAdmin.hometown}
                            onChange={(e) => setNewAdmin({ ...newAdmin, hometown: e.target.value })}
                            className="input-field dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            value={newAdmin.city}
                            onChange={(e) => setNewAdmin({ ...newAdmin, city: e.target.value })}
                            className="input-field dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            State
                          </label>
                          <input
                            type="text"
                            value={newAdmin.state}
                            onChange={(e) => setNewAdmin({ ...newAdmin, state: e.target.value })}
                            className="input-field dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                          />
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button type="submit" className="btn-primary">
                          Create Admin
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCreateAdmin(false)
                            setNewAdmin({ name: '', email: '', hometown: '', city: '', state: '' })
                            setAdminPassword('')
                          }}
                          className="btn-secondary"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="border-t dark:border-gray-800 pt-4">
                  <h3 className="text-lg font-semibold mb-3 text-dark dark:text-white">
                    Current Admins ({admins.length})
                  </h3>
                  {admins.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-300 text-sm">No admins found.</p>
                  ) : (
                    <div className="space-y-2">
                      {admins.map((admin) => (
                        <div
                          key={admin._id}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <FiShield className="text-primary" />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{admin.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-300">{admin.email}</p>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-300">
                            {new Date(admin.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            </div>
          </main>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!communityToDelete}
        onClose={() => setCommunityToDelete(null)}
        onConfirm={handleDeleteCommunityConfirm}
        title="Delete Community"
        message="Are you sure you want to delete this community? This will permanently delete all posts, events, messages, and other data associated with this community. This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleteLoading}
        confirmClassName="bg-red-500 hover:bg-red-600"
      />
    </>
  )
  }

export default AdminDashboard
