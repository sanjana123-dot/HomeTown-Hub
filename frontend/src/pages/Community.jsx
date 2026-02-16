import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import PostCard from '../components/PostCard'
import CreatePost from '../components/CreatePost'
import CreateEvent from '../components/CreateEvent'
import EventCard from '../components/EventCard'
import AnnouncementCard from '../components/AnnouncementCard'
import CreateAnnouncement from '../components/CreateAnnouncement'
import LoadingSpinner from '../components/LoadingSpinner'
import ConfirmDialog from '../components/ConfirmDialog'
import { FiUsers, FiMapPin, FiCalendar, FiPlusCircle, FiBell } from 'react-icons/fi'
import api from '../services/api'

const Community = () => {
  const { id } = useParams()
  const location = useLocation()
  const [community, setCommunity] = useState(null)
  const [posts, setPosts] = useState([])
  const [events, setEvents] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'announcements')
  const [loading, setLoading] = useState(true)
  const [isMember, setIsMember] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [isCommunityAdmin, setIsCommunityAdmin] = useState(false)
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [showCreateAnnouncement, setShowCreateAnnouncement] = useState(false)
  const [editingRules, setEditingRules] = useState(false)
  const [rulesDraft, setRulesDraft] = useState('')
  const [memberToRemoveId, setMemberToRemoveId] = useState(null)
  const [removeMemberLoading, setRemoveMemberLoading] = useState(false)
  const announcementRefsMap = useRef({})

  useEffect(() => {
    fetchCommunityData()
  }, [id])

  useEffect(() => {
    if (location.state?.tab) setActiveTab(location.state.tab)
  }, [location.state?.tab])

  // Scroll to specific announcement when opened from notification
  useEffect(() => {
    const highlightId = location.state?.highlightAnnouncementId
    if (!highlightId || announcements.length === 0) return
    const el = announcementRefsMap.current[highlightId]
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300)
    }
  }, [announcements, location.state?.highlightAnnouncementId])

  const fetchCommunityData = async () => {
    try {
      const [communityRes, postsRes, eventsRes, announcementsRes] = await Promise.all([
        api.get(`/communities/${id}`),
        api.get(`/communities/${id}/posts`),
        api.get(`/communities/${id}/events`),
        api.get(`/communities/${id}/announcements`).catch(() => ({ data: [] })),
      ])
      setCommunity(communityRes.data)
      setPosts(postsRes.data)
      setEvents(eventsRes.data)
      setAnnouncements(announcementsRes.data || [])
      setIsMember(communityRes.data.isMember || false)
      setIsPending(communityRes.data.isPending || false)
      setIsCommunityAdmin(communityRes.data.isCommunityAdmin || false)
    } catch (error) {
      console.error('Error fetching community data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleJoin = async () => {
    try {
      await api.post(`/communities/${id}/join`)
      await fetchCommunityData()
    } catch (error) {
      console.error('Error joining community:', error)
    }
  }

  const handleApprove = async (userId) => {
    try {
      await api.post(`/communities/${id}/requests/${userId}/approve`)
      await fetchCommunityData()
    } catch (error) {
      console.error('Error approving member:', error)
    }
  }

  const handleReject = async (userId) => {
    try {
      await api.post(`/communities/${id}/requests/${userId}/reject`)
      await fetchCommunityData()
    } catch (error) {
      console.error('Error rejecting member:', error)
    }
  }

  const handleRemoveMemberClick = (userId) => setMemberToRemoveId(userId)

  const handleRemoveMemberConfirm = async () => {
    if (!memberToRemoveId) return
    setRemoveMemberLoading(true)
    try {
      await api.delete(`/communities/${id}/members/${memberToRemoveId}`)
      setMemberToRemoveId(null)
      await fetchCommunityData()
    } catch (error) {
      console.error('Error removing member:', error)
      alert(error.response?.data?.message || 'Failed to remove member')
    } finally {
      setRemoveMemberLoading(false)
    }
  }

  const handleUpdateSettings = async (updates) => {
    try {
      await api.patch(`/communities/${id}/settings`, updates)
      await fetchCommunityData()
    } catch (error) {
      console.error('Error updating community settings:', error)
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

  if (!community) {
    return (
      <div className="min-h-screen bg-light dark:bg-black dark:text-white transition-colors">
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <p className="text-gray-500 dark:text-gray-300">Community not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-light dark:bg-black dark:text-white transition-colors">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Community Header */}
            <div className="card mb-6 dark:bg-gray-900 dark:border-gray-800">
              <div className="h-48 bg-gradient-to-r from-primary to-secondary rounded-lg mb-4"></div>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h1 className="text-3xl font-bold text-dark dark:text-white">{community.name}</h1>
                    {community.status === 'pending' && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                        Pending Approval
                      </span>
                    )}
                    {community.status === 'rejected' && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                        Rejected
                      </span>
                    )}
                    {community.status === 'approved' && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                        Approved
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300 mb-2">
                    <FiMapPin className="mr-2" />
                    <span>{community.city}, {community.state}</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300 mb-4">
                    <FiUsers className="mr-2" />
                    <span>{community.memberCount || 0} Members</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{community.description}</p>
                  {/* Community rules: visible to everyone; admin can edit inline */}
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase mb-1">
                      Community rules
                    </p>
                    {editingRules ? (
                      <div className="space-y-2">
                        <textarea
                          value={rulesDraft}
                          onChange={(e) => setRulesDraft(e.target.value)}
                          placeholder="Enter community rules (visible to all members)..."
                          rows={5}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-dark dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={async () => {
                              await handleUpdateSettings({ rules: rulesDraft })
                              setEditingRules(false)
                            }}
                            className="btn-primary text-sm"
                          >
                            Save rules
                          </button>
                          <button
                            onClick={() => {
                              setEditingRules(false)
                              setRulesDraft(community.rules || '')
                            }}
                            className="btn-secondary text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                        {community.rules ? (
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {community.rules}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                            No rules set yet.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2 text-right">
                  {community.status === 'pending' && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-2">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                        ⏳ This community is pending platform admin approval. Joining is not available yet.
                      </p>
                    </div>
                  )}
                  {community.status === 'rejected' && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-2">
                      <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                        ✗ This community was rejected by platform admin. Joining is not available.
                      </p>
                    </div>
                  )}
                  {community.status === 'approved' && !isMember && !isPending && (
                    <button onClick={handleJoin} className="btn-primary">
                      {community.requiresApproval ? 'Request to Join' : 'Join Community'}
                    </button>
                  )}
                  {community.status === 'approved' && isPending && (
                    <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                      Join request pending approval
                    </p>
                  )}
                  {community.status !== 'approved' && (
                    <button disabled className="btn-primary opacity-50 cursor-not-allowed">
                      Join Community
                    </button>
                  )}
                  {isCommunityAdmin && !editingRules && (
                    <button
                      onClick={() => {
                        setRulesDraft(community.rules || '')
                        setEditingRules(true)
                      }}
                      className="text-xs text-gray-500 hover:text-primary underline"
                    >
                      Edit rules
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Pending join requests (admins only) */}
            {isCommunityAdmin &&
              community.pendingMembers &&
              community.pendingMembers.length > 0 && (
                <div className="card mb-6 dark:bg-gray-900 dark:border-gray-800">
                  <h3 className="text-lg font-semibold text-dark dark:text-white mb-3">
                    Pending join requests
                  </h3>
                  <ul className="space-y-2">
                    {community.pendingMembers.map((member) => (
                      <li
                        key={member._id}
                        className="flex items-center justify-between py-2 border-b dark:border-gray-800 last:border-b-0"
                      >
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">
                            {member.name || 'User'}
                          </p>
                          {member.email && (
                            <p className="text-xs text-gray-500 dark:text-gray-300">{member.email}</p>
                          )}
                        </div>
                        <div className="space-x-2">
                          <button
                            onClick={() => handleApprove(member._id)}
                            className="btn-primary px-3 py-1 text-sm"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(member._id)}
                            className="btn-secondary px-3 py-1 text-sm"
                          >
                            Reject
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Tabs */}
            <div className="flex space-x-4 mb-6 border-b dark:border-gray-800">
              <button
                onClick={() => setActiveTab('announcements')}
                className={`pb-2 px-4 font-semibold flex items-center gap-2 ${
                  activeTab === 'announcements'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-500 dark:text-gray-300'
                }`}
              >
                <FiBell />
                Announcements
              </button>
              <button
                onClick={() => setActiveTab('posts')}
                className={`pb-2 px-4 font-semibold ${
                  activeTab === 'posts'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-500 dark:text-gray-300'
                }`}
              >
                Posts
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`pb-2 px-4 font-semibold ${
                  activeTab === 'events'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-500 dark:text-gray-300'
                }`}
              >
                Events
              </button>
            </div>

            {/* Content */}
            {activeTab === 'announcements' && (
              <div>
                {isMember && (
                  <>
                    {!showCreateAnnouncement ? (
                      <div className="card mb-6 dark:bg-gray-900 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-dark dark:text-white mb-1">
                              Create an Announcement
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                              Share important updates with the community
                            </p>
                          </div>
                          <button
                            onClick={() => setShowCreateAnnouncement(true)}
                            className="btn-primary flex items-center space-x-2"
                          >
                            <FiPlusCircle className="text-xl" />
                            <span>New Announcement</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <CreateAnnouncement
                        communityId={id}
                        onAnnouncementCreated={() => {
                          setShowCreateAnnouncement(false)
                          fetchCommunityData()
                        }}
                        onCancel={() => setShowCreateAnnouncement(false)}
                      />
                    )}
                  </>
                )}

                {announcements.length === 0 ? (
                  <div className="card text-center py-12 dark:bg-gray-900 dark:border-gray-800">
                    <FiBell className="text-5xl text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-300 mb-4">
                      No announcements yet.
                    </p>
                    {isMember && (
                      <button
                        onClick={() => setShowCreateAnnouncement(true)}
                        className="btn-primary inline-flex items-center space-x-2"
                      >
                        <FiPlusCircle />
                        <span>Create the First Announcement</span>
                      </button>
                    )}
                  </div>
                ) : (
                  announcements.map((announcement) => (
                    <div
                      key={announcement._id}
                      ref={(el) => {
                        if (el) announcementRefsMap.current[announcement._id] = el
                      }}
                      className={location.state?.highlightAnnouncementId === announcement._id ? 'ring-2 ring-primary ring-offset-2 rounded-xl transition-shadow' : ''}
                    >
                      <AnnouncementCard
                        announcement={announcement}
                        onUpdate={fetchCommunityData}
                        isCommunityAdmin={isCommunityAdmin}
                      />
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'posts' && (
              <div>
                {isMember && <CreatePost onPostCreated={fetchCommunityData} />}
                {posts.length === 0 ? (
                  <div className="card text-center py-12 dark:bg-gray-900 dark:border-gray-800">
                    <p className="text-gray-500 dark:text-gray-300">No posts yet. Be the first to post!</p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <PostCard key={post._id} post={post} onUpdate={fetchCommunityData} />
                  ))
                )}
              </div>
            )}

            {activeTab === 'events' && (
              <div>
                {isMember && (
                  <div className="card mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-dark mb-1">Create an Event</h3>
                        <p className="text-gray-600 text-sm">Organize an event for this community</p>
                      </div>
                      <button
                        onClick={() => setShowCreateEvent(true)}
                        className="btn-primary flex items-center space-x-2"
                      >
                        <FiPlusCircle className="text-xl" />
                        <span>Create Event</span>
                      </button>
                    </div>
                  </div>
                )}

                {showCreateEvent && (
                  <div className="card mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-dark">Create New Event</h3>
                      <button
                        onClick={() => setShowCreateEvent(false)}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                      >
                        ×
                      </button>
                    </div>
                    <CreateEvent
                      onEventCreated={() => {
                        setShowCreateEvent(false)
                        fetchCommunityData()
                      }}
                      onCancel={() => setShowCreateEvent(false)}
                      defaultCommunity={id}
                    />
                  </div>
                )}

                {events.length === 0 ? (
                  <div className="card text-center py-12">
                    <div className="max-w-md mx-auto">
                      <FiCalendar className="text-5xl text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">No events yet.</p>
                      {isMember && (
                        <button
                          onClick={() => setShowCreateEvent(true)}
                          className="btn-primary inline-flex items-center space-x-2"
                        >
                          <FiPlusCircle />
                          <span>Create the First Event</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {events.map((event) => (
                      <EventCard key={event._id} event={event} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <ConfirmDialog
        isOpen={!!memberToRemoveId}
        onClose={() => setMemberToRemoveId(null)}
        onConfirm={handleRemoveMemberConfirm}
        title="Remove member"
        message="Are you sure you want to remove this member from the community?"
        confirmLabel="Confirm"
        cancelLabel="Cancel"
        loading={removeMemberLoading}
      />
    </div>
  )
}

export default Community





