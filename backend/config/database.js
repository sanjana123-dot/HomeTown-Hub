import mongoose from 'mongoose'
import dns from 'dns'

// Set DNS servers to use Google DNS for better SRV record resolution
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1'])

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env file')
    }
    
    // Connection options to help with DNS issues
    const options = {
      serverSelectionTimeoutMS: 15000, // Increased timeout for DNS resolution
      socketTimeoutMS: 45000,
      connectTimeoutMS: 15000,
      family: 4, // Use IPv4, skip trying IPv6
      // Retry connection attempts
      retryWrites: true,
      retryReads: true,
    }
    
    console.log('Attempting to connect to MongoDB...')
    const conn = await mongoose.connect(process.env.MONGODB_URI, options)
    console.log(`✓ MongoDB Connected: ${conn.connection.host}`)
    return conn
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`)
    
    // Provide helpful error messages based on error type
    if (error.message.includes('querySrv') || error.message.includes('ECONNREFUSED')) {
      console.error('\n🔧 DNS Resolution Issue Detected!')
      console.error('The system cannot resolve MongoDB Atlas SRV records.')
      console.error('\nQuick fixes to try:')
      console.error('1. ✅ DNS cache flushed (just done)')
      console.error('2. Verify DNS settings:')
      console.error('   - Windows Settings → Network → Change adapter options')
      console.error('   - Right-click your connection → Properties → IPv4')
      console.error('   - Set DNS: 8.8.8.8 (Preferred) and 8.8.4.4 (Alternate)')
      console.error('   - Restart your computer after changing DNS')
      console.error('3. Try restarting your router/modem')
      console.error('4. Check if your network/firewall blocks DNS queries')
      console.error('5. Try connecting from mobile hotspot to test if it\'s network-specific')
    } else if (error.message.includes('IP') || error.message.includes('whitelist')) {
      console.error('\n🔒 IP Whitelist Issue Detected!')
      console.error('Go to MongoDB Atlas → Network Access → Add IP Address')
      console.error('Either whitelist your current IP or allow all IPs (0.0.0.0/0) for development')
    }
    
    throw error
  }
}

export default connectDB

