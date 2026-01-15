const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../models/User')

const MONGO_URI = process.env.MONGODB_URI || 'mongodb+srv://school:school@cluster0.hyp6ymn.mongodb.net/'

async function createAdmin() {
  try {
    await mongoose.connect(MONGO_URI)

    const existingAdmin = await User.findOne({ role: 'admin' })
    if (existingAdmin) {
      console.log('Admin already exists')
      process.exit(0)
    }

    const hashedPassword = await bcrypt.hash('admin123', 10)

    const admin = new User({
        username: 'admin',
        id: 'admin',
        name: 'admin',
        email: 'admin@edves.com',
        password: 'admin',
        role: 'admin'
    })

    await admin.save()
    console.log('Admin user created successfully')
    process.exit(0)
  } catch (err) {
    console.error('Error creating admin:', err)
    process.exit(1)
  }
}

createAdmin()
