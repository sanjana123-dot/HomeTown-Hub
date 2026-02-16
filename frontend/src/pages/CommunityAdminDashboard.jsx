import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import LoadingSpinner from '../components/LoadingSpinner'
import {
  FiUsers,
  FiSettings,
  FiHome,
  FiShield,
  FiUserCheck,
  FiUserX,
  FiTrash2,
  FiEdit,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import ConfirmDialog from '../components/ConfirmDialog'
import api from '../services/api'

const CommunityAdminDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [communities, setCommunities] = useState([])
  const [selectedCommunity, setSelectedCommunity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editingRulesId, setEditingRulesId] = useState(null)
  const [rulesDraft, setRulesDraft] = useState('')
  const [editingNameId, setEditingNameId] = useState(null)
  const [nameDraft, setNameDraft] = useState('')
  const [memberToRemove, setMemberToRemove] = useState(null) // { communityId, userId }
  const [removeLoading, setRemoveLoading] = useState(false)

  useEffect(() => {
    fetchAdminCommunities()
  }, [])

  const fetchAdminCommunities = async () => {
    try {
      const response = await api.get('/communities/my/admin')
      setCommunities(response.data)
    } catch (error) {
      console.error('Error fetching admin communities:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveMember = async (communityId, userId) => {
    try {
      await api.post(`/communities/${communityId}/requests/${userId}/approve`)
      fetchAdminCommunities()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to approve member')
    }
  }

  const handleRejectMember = async (communityId, userId) => {
    try {
      await api.post(`/communities/${communityId}/requests/${userId}/reject`)
      fetchAdminCommunities()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reject member')
    }
  }

  const handleRemoveMemberClick = (communityId, userId) => {
    setMemberToRemove({ communityId, userId })
  }

  const handleRemoveMemberConfirm = async () => {
    if (!memberToRemove) return
    setRemoveLoading(true)
    try {
      await api.delete(`/communities/${memberToRemove.communityId}/members/${memberToRemove.userId}`)
      setMemberToRemove(null)
      fetchAdminCommunities()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to remove member')
    } finally {
      setRemoveLoading(false)
    }
  }

  const startEditingRules = (community) => {
    setEditingRulesId(community._id)
    setRulesDraft(community.rules || '')
  }

  const cancelEditingRules = () => {
    setEditingRulesId(null)
    setRulesDraft('')
  }

  const saveRules = async (communityId) => {
    try {
      await api.patch(`/communities/${communityId}/settings`, { rules: rulesDraft })
      setEditingRulesId(null)
      setRulesDraft('')
      fetchAdminCommunities()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update rules')
    }
  }

  const handleToggleRequiresApproval = async (communityId, currentValue) => {
    try {
      await api.patch(`/communities/${communityId}/settings`, {
        requiresApproval: !currentValue,
      })
      fetchAdminCommunities()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update settings')
    }
  }

  const startEditingName = (community) => {
    setEditingNameId(community._id)
    setNameDraft(community.name)
  }

  const cancelEditingName = () => {
    setEditingNameId(null)
    setNameDraft('')
  }

  const saveName = async (communityId) => {
    if (!nameDraft.trim()) {
      alert('Community name cannot be empty')
      return
    }
    try {
      await api.patch(`/communities/${communityId}/settings`, { name: nameDraft.trim() })
      setEditingNameId(null)
      setNameDraft('')
      fetchAdminCommunities()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update community name')
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
    <div className="min-h-screen bg-light dark:bg-black dark:text-white transition-colors">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-dark dark:text-white">
                  Community Admin Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Manage your communities, members, and content
                </p>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-secondary flex items-center space-x-2"
              >
                <FiHome />
                <span>User Dashboard</span>
              </button>
            </div>

            {communities.length === 0 ? (
              <div className="card dark:bg-gray-900 dark:border-gray-800 text-center py-12">
                <FiShield className="text-5xl text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-dark dark:text-white mb-2">
                  No Communities to Manage
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  You're not an admin or moderator of any communities yet.
                </p>
                <button onClick={() => navigate('/create-community')} className="btn-primary">
                  Create Your First Community
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {communities.map((community) => (
                  <div
                    key={community._id}
                    className="card dark:bg-gray-900 dark:border-gray-800"
                  >
                    {/* Community Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {editingNameId === community._id ? (
                            <div className="flex items-center space-x-2 flex-1">
                              <input
                                type="text"
                                value={nameDraft}
                                onChange={(e) => setNameDraft(e.target.value)}
                                className="text-2xl font-bold px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-dark dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Community name"
                              />
                              <button
                                onClick={() => saveName(community._id)}
                                className="btn-primary text-sm"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEditingName}
                                className="btn-secondary text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <>
                              <h2 className="text-2xl font-bold text-dark dark:text-white">
                                {community.name}
                              </h2>
                              <button
                                onClick={() => startEditingName(community)}
                                className="p-1 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary"
                                title="Edit community name"
                              >
                                <FiEdit />
                              </button>
                            </>
                          )}
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              community.adminRole === 'creator'
                                ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200'
                                : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                            }`}
                          >
                            {community.adminRole === 'creator' ? 'Creator' : 'Moderator'}
                          </span>
                          {community.status === 'pending' && (
                            <span className="text-xs px-2 py-1 rounded bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                              Pending Approval
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-2">
                          {community.description}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-300">
                          {community.city}, {community.state} • {community.memberCount || 0} Members
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => navigate(`/community/${community._id}`)}
                          className="btn-primary text-sm"
                        >
                          View Community
                        </button>
                      </div>
                    </div>

                    {/* Community Settings */}
                    <div className="border-t dark:border-gray-800 pt-4 mb-4">
                      <h3 className="text-lg font-semibold mb-3 text-dark dark:text-white">
                        Community Settings
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-dark dark:text-white">
                              Require Approval for New Members
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              When enabled, users must request to join and you must approve them
                            </p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={community.requiresApproval || false}
                              onChange={() =>
                                handleToggleRequiresApproval(
                                  community._id,
                                  community.requiresApproval
                                )
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                          </label>
                        </div>
                        <div>
                          <p className="font-medium text-dark dark:text-white mb-2">
                            Community Rules
                          </p>
                          {editingRulesId === community._id ? (
                            <div className="space-y-2">
                              <textarea
                                value={rulesDraft}
                                onChange={(e) => setRulesDraft(e.target.value)}
                                placeholder="Enter community rules (visible to all members)..."
                                rows={6}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-dark dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                              />
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => saveRules(community._id)}
                                  className="btn-primary text-sm"
                                >
                                  Save Rules
                                </button>
                                <button
                                  onClick={cancelEditingRules}
                                  className="btn-secondary text-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                {community.rules ? (
                                  <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                                    {community.rules}
                                  </p>
                                ) : (
                                  <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                    No rules set yet. Add rules so members know what to expect.
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => startEditingRules(community)}
                                className="btn-secondary text-sm flex items-center space-x-1 shrink-0"
                              >
                                <FiEdit />
                                <span>Edit Rules</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Pending Join Requests */}
                    {community.pendingMembers && community.pendingMembers.length > 0 && (
                      <div className="border-t dark:border-gray-800 pt-4 mb-4">
                        <h3 className="text-lg font-semibold mb-3 text-dark dark:text-white flex items-center">
                          <FiAlertCircle className="mr-2 text-accent" />
                          Pending Join Requests ({community.pendingMembers.length})
                        </h3>
                        <div className="space-y-2">
                          {community.pendingMembers.map((member) => (
                            <div
                              key={member._id}
                              className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
                            >
                              <div>
                                <p className="font-medium text-dark dark:text-white">
                                  {member.name}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  {member.email}
                                </p>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleApproveMember(community._id, member._id)}
                                  className="btn-primary text-sm px-3 py-1 flex items-center space-x-1"
                                >
                                  <FiCheckCircle />
                                  <span>Approve</span>
                                </button>
                                <button
                                  onClick={() => handleRejectMember(community._id, member._id)}
                                  className="bg-red-500 text-white text-sm px-3 py-1 rounded-lg hover:bg-red-600 flex items-center space-x-1"
                                >
                                  <FiXCircle />
                                  <span>Reject</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Current Members */}
                    <div className="border-t dark:border-gray-800 pt-4">
                      <h3 className="text-lg font-semibold mb-3 text-dark dark:text-white flex items-center">
                        <FiUsers className="mr-2" />
                        Current Members ({community.members?.length || 0})
                      </h3>
                      {!community.members || community.members.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-300 text-sm">No members yet.</p>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {community.members.map((member) => {
                            const isCreator =
                              community.creator._id.toString() === member._id.toString()
                            const isModerator = community.moderators.some(
                              (mod) => mod._id.toString() === member._id.toString()
                            )
                            return (
                              <div
                                key={member._id}
                                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                              >
                                <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                                    {member.name?.charAt(0).toUpperCase() || 'U'}
                                  </div>
                                  <div>
                                    <p className="font-medium text-dark dark:text-white text-sm">
                                      {member.name}
                                      {isCreator && (
                                        <span className="ml-2 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-1.5 py-0.5 rounded">
                                          Creator
                                        </span>
                                      )}
                                      {isModerator && !isCreator && (
                                        <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded">
                                          Moderator
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                                {!isCreator && (
                                  <button
                                    onClick={() => handleRemoveMemberClick(community._id, member._id)}
                                    className="text-red-500 hover:text-red-700 p-1"
                                    title="Remove member"
                                  >
                                    <FiTrash2 />
                                  </button>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <ConfirmDialog
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemoveMemberConfirm}
        title="Remove member"
        message="Are you sure you want to remove this member from the community?"
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        loading={removeLoading}
      />
    </div>
  )
}

export default CommunityAdminDashboard
