import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { FiCalendar, FiMapPin, FiUsers } from 'react-icons/fi'

const EventCard = ({ event }) => {
  // Generate a gradient color based on event title for visual appeal
  const getGradientColor = (title) => {
    const colors = [
      'from-blue-500 to-purple-600',
      'from-green-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-pink-500 to-rose-600',
      'from-indigo-500 to-blue-600',
      'from-yellow-500 to-orange-600',
    ]
    const index = title.length % colors.length
    return colors[index]
  }

  const isPast = new Date(event.date) < new Date()

  return (
    <Link to={`/event/${event._id}`} className="card hover:shadow-xl transition-all duration-300 block overflow-hidden group">
      {/* Event Image/Header */}
      <div className={`h-48 bg-gradient-to-br ${getGradientColor(event.title)} relative overflow-hidden mb-4`}>
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isPast 
              ? 'bg-gray-100 text-gray-700' 
              : 'bg-white text-gray-800'
          }`}>
            {isPast ? 'Past' : (event.status || 'Upcoming')}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-2xl font-bold text-white drop-shadow-lg line-clamp-2">
            {event.title}
          </h3>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="space-y-2 text-gray-600">
          <div className="flex items-center">
            <FiCalendar className="mr-2 text-primary flex-shrink-0" />
            <span className="text-sm">{format(new Date(event.date), 'MMM dd, yyyy')} at {event.time}</span>
          </div>
          <div className="flex items-center">
            <FiMapPin className="mr-2 text-primary flex-shrink-0" />
            <span className="text-sm line-clamp-1">{event.location}</span>
          </div>
          <div className="flex items-center">
            <FiUsers className="mr-2 text-primary flex-shrink-0" />
            <span className="text-sm">{event.attendees?.length || 0} Going</span>
          </div>
        </div>
        
        {event.description && (
          <p className="text-gray-600 text-sm line-clamp-2 mt-3">{event.description}</p>
        )}
        
        {event.community && (
          <div className="pt-3 border-t">
            <span className="text-xs text-gray-500">Community: {event.community.name || 'Unknown'}</span>
          </div>
        )}
      </div>
    </Link>
  )
}

export default EventCard






