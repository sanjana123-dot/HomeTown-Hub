import dotenv from 'dotenv'
import connectDB from '../config/database.js'
import User from '../models/User.js'

dotenv.config()

const createAdmin = async () => {
  try {
    await connectDB()
    
    const args = process.argv.slice(2)
    
    if (args.length < 2) {
      console.log('Usage: node createAdmin.js <email> <name> [hometown] [city] [state]')
      console.log('Example: node createAdmin.js admin@example.com "Admin User" "New York" "New York" "NY"')
      process.exit(1)
    }

    const [email, name, hometown = 'Admin', city = 'Admin', state = 'Admin'] = args

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    
    if (existingUser) {
      if (existingUser.role === 'admin') {
        console.log(`✓ User ${email} is already an admin`)
        process.exit(0)
      } else {
        // Update existing user to admin
        existingUser.role = 'admin'
        await existingUser.save()
        console.log(`✓ Updated user ${email} to admin role`)
        process.exit(0)
      }
    }

    // Generate a random password
    const password = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12) + 'A1!'
    
    const admin = await User.create({
      name,
      email,
      password,
      hometown,
      city,
      state,
      role: 'admin',
    })

    console.log('\n✓ Admin user created successfully!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Email: ${admin.email}`)
    console.log(`Name: ${admin.name}`)
    console.log(`Password: ${password}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n⚠️  IMPORTANT: Save this password securely!')
    console.log('   The user should change it after first login.\n')
    
    process.exit(0)
  } catch (error) {
    console.error('Error creating admin:', error.message)
    process.exit(1)
  }
}

createAdmin()


