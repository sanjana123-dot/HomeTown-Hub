import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import LoadingSpinner from '../components/LoadingSpinner'
import ChatPanel from '../components/ChatPanel'
import { FiMessageCircle, FiUsers, FiSearch, FiPlus, FiX } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const Inbox = () => {
  const { communityId, receiverId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [communities, setCommunities] = useState([])
  const [selectedCommunity, setSelectedCommunity] = useState(null)
  const [conversations, setConversations] = useState([])
  const [communityMembers, setCommunityMembers] = useState([])
  const [showNewChat, setShowNewChat] = useState(false)
  const [searchMember, setSearchMember] = useState('')
  const [searchChat, setSearchChat] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserCommunities()
  }, [])

  useEffect(() => {
    if (selectedCommunity) {
      fetchConversations(selectedCommunity._id)
      fetchCommunityMembers(selectedCommunity._id)
      // Poll for new messages every 5 seconds
      const interval = setInterval(() => {
        fetchConversations(selectedCommunity._id)
      }, 5000)
      return () => clearInterval(interval)
    }
  }, [selectedCommunity])

  const fetchCommunityMembers = async (commId) => {
    try {
      const response = await api.get(`/communities/${commId}`)
      const members = response.data.members || []
      // Filter out current user
      const otherMembers = members.filter(
        (member) => member._id !== user?._id
      )
      setCommunityMembers(otherMembers)
    } catch (error) {
      console.error('Error fetching community members:', error)
    }
  }

  useEffect(() => {
    if (communityId && communities.length > 0) {
      const community = communities.find((c) => c._id === communityId)
      if (community) {
        setSelectedCommunity(community)
      }
    }
  }, [communityId, communities])

  const fetchUserCommunities = async () => {
    try {
      const response = await api.get('/communities/my')
      setCommunities(response.data)
      if (response.data.length > 0 && !selectedCommunity) {
        setSelectedCommunity(response.data[0])
      }
    } catch (error) {
      console.error('Error fetching communities:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchConversations = async (commId) => {
    try {
      const response = await api.get(`/messages/community/${commId}/conversations`)
      setConversations(response.data)
    } catch (error) {
      console.error('Error fetching conversations:', error)
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Inbox</h1>

            <div className={`grid grid-cols-1 gap-6 ${receiverId ? 'lg:grid-cols-12' : 'lg:grid-cols-4'}`}>
              {/* Communities Sidebar */}
              <div className={receiverId ? 'lg:col-span-2' : 'lg:col-span-1'}>
                <div className="card dark:bg-gray-900 dark:border-gray-800">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <FiUsers className="mr-2" />
                    Communities
                  </h2>
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {communities.length === 0 ? (
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        No communities yet
                      </p>
                    ) : (
                      communities.map((community) => (
                        <button
                          key={community._id}
                          onClick={() => {
                            setSelectedCommunity(community)
                            navigate(`/inbox/${community._id}`)
                          }}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            selectedCommunity?._id === community._id
                              ? 'bg-primary text-white'
                              : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                          }`}
                        >
                          <p className="font-semibold">{community.name}</p>
                          <p className="text-xs opacity-75">{community.city}</p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Conversations List */}
              <div className={receiverId ? 'lg:col-span-4' : 'lg:col-span-3'}>
                {selectedCommunity ? (
                  <div className="card dark:bg-gray-900 dark:border-gray-800 h-full flex flex-col overflow-hidden">
                    <div className="shrink-0 mb-2">
                      <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Search or start a new chat"
                          value={searchChat}
                          onChange={(e) => setSearchChat(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-3 shrink-0">
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        {selectedCommunity.name}
                      </h2>
                      <button
                        onClick={() => setShowNewChat(true)}
                        className="text-primary dark:text-blue-400 font-medium text-sm hover:underline flex items-center gap-1"
                      >
                        <FiPlus className="w-4 h-4" />
                        New chat
                      </button>
                    </div>

                    {/* New Chat Modal */}
                    {showNewChat && (
                      <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold text-gray-900 dark:text-white">
                            Start New Chat
                          </h3>
                          <button
                            onClick={() => {
                              setShowNewChat(false)
                              setSearchMember('')
                            }}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                          >
                            <FiX className="text-gray-700 dark:text-gray-300" />
                          </button>
                        </div>
                        <div className="relative mb-3">
                          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                          <input
                            type="text"
                            placeholder="Search members..."
                            value={searchMember}
                            onChange={(e) => setSearchMember(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto space-y-2">
                          {communityMembers
                            .filter((member) =>
                              member.name
                                ?.toLowerCase()
                                .includes(searchMember.toLowerCase())
                            )
                            .map((member) => (
                              <button
                                key={member._id}
                                onClick={() => {
                                  navigate(
                                    `/inbox/${selectedCommunity._id}/chat/${member._id}`
                                  )
                                  setShowNewChat(false)
                                }}
                                className="w-full text-left p-3 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-slate-500 rounded-lg flex items-center space-x-3 transition-colors"
                              >
                                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                                  {member.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white">
                                    {member.name}
                                  </p>
                                  {member.username && (
                                    <p className="text-xs text-gray-600 dark:text-gray-300">
                                      @{member.username}
                                    </p>
                                  )}
                                </div>
                              </button>
                            ))}
                          {communityMembers.filter((member) =>
                            member.name
                              ?.toLowerCase()
                              .includes(searchMember.toLowerCase())
                          ).length === 0 && (
                            <p className="text-center text-gray-600 dark:text-gray-300 py-4">
                              No members found
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {conversations.length === 0 ? (
                      <div className="text-center py-12">
                        <FiMessageCircle className="text-5xl text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-300 font-medium">
                          No conversations yet
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          Start a new chat with a community member.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-0 overflow-y-auto flex-1 min-h-0 -mx-1">
                        {conversations
                          .filter((conversation) => {
                            if (!searchChat.trim()) return true
                            const q = searchChat.toLowerCase()
                            const name = conversation.partner?.name?.toLowerCase() || ''
                            const last = conversation.lastMessage?.content?.toLowerCase() || ''
                            return name.includes(q) || last.includes(q)
                          })
                          .map((conversation) => {
                            const partner = conversation.partner
                            const lastMessage = conversation.lastMessage
                            const isImage = lastMessage?.image || lastMessage?.files?.some((f) => f.fileType === 'image')
                            const isVideo = lastMessage?.video || lastMessage?.files?.some((f) => f.fileType === 'video')
                            const isFile = lastMessage?.files?.some((f) => f.fileType !== 'image' && f.fileType !== 'video')
                            const preview = lastMessage?.content || (isImage ? '📷 Photo' : isVideo ? '🎥 Video' : isFile ? '📎 File' : '')

                            return (
                              <button
                                key={partner._id}
                                onClick={() =>
                                  navigate(`/inbox/${selectedCommunity._id}/chat/${partner._id}`)
                                }
                                className={`w-full text-left flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                                  receiverId === partner._id
                                    ? 'bg-primary/15 dark:bg-primary/25'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                              >
                                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg shrink-0">
                                  {partner.name?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                                      {partner.name}
                                    </p>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                                      {lastMessage?.createdAt
                                        ? new Date(lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                        : ''}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    {conversation.unreadCount > 0 && (
                                      <span className="bg-primary text-white text-xs font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0">
                                        {conversation.unreadCount}
                                      </span>
                                    )}
                                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                      {preview || 'No messages yet'}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            )
                          })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="card dark:bg-gray-900 dark:border-gray-800 text-center py-12">
                    <FiMessageCircle className="text-5xl text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300 font-medium">
                      Select a community to view conversations
                    </p>
                  </div>
                )}
              </div>

              {/* Active chat - DM conversation (Instagram-style) */}
              {receiverId && communityId && (
                <div className="lg:col-span-6 flex flex-col min-h-[600px]">
                  <ChatPanel
                    communityId={communityId}
                    receiverId={receiverId}
                    embedded
                    onBack={() => navigate(`/inbox/${communityId}`)}
                    onConversationUpdate={() => selectedCommunity && fetchConversations(selectedCommunity._id)}
                  />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Inbox
