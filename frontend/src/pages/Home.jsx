import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import { FiUsers, FiCalendar, FiMessageSquare, FiMapPin } from 'react-icons/fi'

const Home = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-light dark:bg-black dark:text-white transition-colors">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary to-secondary text-white py-16 lg:py-20">
        <div className="absolute inset-0 opacity-20">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.pexels.com/photos/5724873/pexels-photo-5724873.jpeg?auto=compress&cs=tinysrgb&w=1600')",
            }}
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="text-left">
              <p className="uppercase tracking-[0.2em] text-sm mb-4 text-white/80">
                Welcome to HomeTown Hub
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight drop-shadow-md">
                Bring your
                <span className="block">community closer together.</span>
              </h1>
              <p className="text-lg md:text-xl mb-8 max-w-xl text-white/90">
                Discover neighbourhood stories, organize local events, and stay connected with people
                from your hometown — all in one beautiful, easy‑to‑use space.
              </p>
              {!user && (
                <div className="flex flex-wrap items-center gap-4">
                  <Link to="/register" className="btn-primary shadow-lg shadow-black/20">
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-6 py-2 rounded-lg border border-white/70 text-white font-semibold hover:bg-white hover:text-primary transition-colors"
                  >
                    Login
                  </Link>
                </div>
              )}
              {user && (
                <div className="mt-4 text-sm text-white/80">
                  Logged in as <span className="font-semibold">{user.name}</span>. Head over to your{' '}
                  <Link to="/dashboard" className="underline font-medium">
                    dashboard
                  </Link>
                  .
                </div>
              )}
            </div>

            {/* Hero Image Collage */}
            <div className="hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="rounded-3xl overflow-hidden shadow-2xl shadow-black/30 transform translate-y-4 hover:-translate-y-0.5 hover:shadow-primary/40 transition">
                    <img
                      src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1200"
                      alt="Neighbors talking"
                      className="w-full h-44 object-cover"
                    />
                  </div>
                  <div className="rounded-3xl overflow-hidden shadow-2xl shadow-black/30 hover:-translate-y-0.5 hover:shadow-secondary/40 transition">
                    <img
                      src="https://images.pexels.com/photos/6209130/pexels-photo-6209130.jpeg?auto=compress&cs=tinysrgb&w=1200"
                      alt="Community gathering"
                      className="w-full h-40 object-cover"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="rounded-3xl overflow-hidden shadow-2xl shadow-black/30 hover:-translate-y-0.5 hover:shadow-accent/40 transition">
                    <img
                      src="https://images.pexels.com/photos/7551447/pexels-photo-7551447.jpeg?auto=compress&cs=tinysrgb&w=1200"
                      alt="Local event"
                      className="w-full h-40 object-cover"
                    />
                  </div>
                  <div className="rounded-3xl overflow-hidden shadow-2xl shadow-black/30 transform -translate-y-4 hover:-translate-y-0.5 hover:shadow-primary/40 transition">
                    <img
                      src="https://images.pexels.com/photos/6646914/pexels-photo-6646914.jpeg?auto=compress&cs=tinysrgb&w=1200"
                      alt="City skyline"
                      className="w-full h-44 object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-20 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-dark dark:text-white">Why HomeTown Hub?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card text-center border border-gray-100 hover:border-primary/40 hover:shadow-lg transition">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md shadow-primary/40">
                <FiUsers className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 dark:text-white">Connect Locally</h3>
              <p className="text-gray-600 dark:text-gray-300">Join your city or village community and connect with neighbors.</p>
            </div>
            
            <div className="card text-center border border-gray-100 hover:border-secondary/40 hover:shadow-lg transition">
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md shadow-secondary/40">
                <FiMessageSquare className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 dark:text-white">Share Updates</h3>
              <p className="text-gray-600 dark:text-gray-300">Post announcements, news, and updates for your community.</p>
            </div>
            
            <div className="card text-center border border-gray-100 hover:border-accent/40 hover:shadow-lg transition">
              <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md shadow-accent/40">
                <FiCalendar className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 dark:text-white">Organize Events</h3>
              <p className="text-gray-600 dark:text-gray-300">Create and join local events, gatherings, and celebrations.</p>
            </div>
            
            <div className="card text-center border border-gray-100 hover:border-primary/40 hover:shadow-lg transition">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md shadow-primary/40">
                <FiMapPin className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 dark:text-white">Stay Informed</h3>
              <p className="text-gray-600 dark:text-gray-300">Get notified about local news, issues, and community initiatives.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Gallery */}
      <section className="py-16 bg-light dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4 text-dark dark:text-white">Life inside communities</h2>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto">
            See what people are doing in their hometowns – from street festivals to quiet park
            meet‑ups.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition transform hover:-translate-y-1 bg-white dark:bg-gray-900">
              <img
                src="https://images.pexels.com/photos/842571/pexels-photo-842571.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Food festival"
                className="w-full h-52 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-dark dark:text-white mb-1">Weekend food festival</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Neighbors sharing homemade dishes in the town square.</p>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition transform hover:-translate-y-1 bg-white dark:bg-gray-900">
              <img
                src="https://images.pexels.com/photos/5648353/pexels-photo-5648353.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Community clean up"
                className="w-full h-52 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-dark dark:text-white mb-1">Community clean‑up drive</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Volunteers keeping their streets and parks beautiful.</p>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition transform hover:-translate-y-1 bg-white dark:bg-gray-900">
              <img
                src="https://images.pexels.com/photos/842567/pexels-photo-842567.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Evening meetup"
                className="w-full h-52 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-dark dark:text-white mb-1">Evening meet‑ups</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Friends catching up at local cafés and hangout spots.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-dark dark:text-white">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">1</div>
              <h3 className="text-xl font-semibold mb-2 dark:text-white">Sign Up</h3>
              <p className="text-gray-600 dark:text-gray-300">Create your account and select your hometown.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-secondary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">2</div>
              <h3 className="text-xl font-semibold mb-2 dark:text-white">Join Community</h3>
              <p className="text-gray-600 dark:text-gray-300">Find and join your local community or create a new one.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-accent text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">3</div>
              <h3 className="text-xl font-semibold mb-2 dark:text-white">Start Connecting</h3>
              <p className="text-gray-600 dark:text-gray-300">Share posts, join events, and engage with your community.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 HomeTown Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Home








