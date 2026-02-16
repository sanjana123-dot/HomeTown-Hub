import dotenv from 'dotenv'
import connectDB from '../config/database.js'
import User from '../models/User.js'

dotenv.config()

const createFixedPlatformAdmin = async () => {
  try {
    await connectDB()

    // Fixed credentials requested
    const username = 'platformadmin1234'
    const email = 'platformadmin1234@example.com'
    const password = '6A129gb3ha06JE'

    const hometown = 'Platform HQ'
    const city = 'Platform City'
    const state = 'Platform State'

    // Check if the fixed admin user already exists (by email or username)
    let user = await User.findOne({ 
      $or: [
        { email },
        { username: username.toLowerCase() }
      ]
    })

    if (!user) {
      // Create a new platform admin with the fixed credentials
      user = await User.create({
        name: username,
        username: username.toLowerCase(),
        email,
        password, // Will be hashed by the User model pre-save hook
        hometown,
        city,
        state,
        role: 'admin',
      })

      console.log('\n✓ Fixed Platform Admin user created successfully!')
    } else {
      // Ensure this user is an admin and has the fixed credentials
      user.name = username
      user.username = username.toLowerCase()
      user.password = password // Will be re-hashed on save
      user.hometown = hometown
      user.city = city
      user.state = state
      user.role = 'admin'
      await user.save()

      console.log('\n✓ Existing user updated to Fixed Platform Admin!')
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Username: ${username}`)
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\nYou can now login on the website using:')
    console.log(`Email: ${email}`)
    console.log(`OR Username: ${username}`)
    console.log(`Password: ${password}\n`)

    process.exit(0)
  } catch (error) {
    console.error('Error creating fixed platform admin:', error.message)
    process.exit(1)
  }
}

createFixedPlatformAdmin()

