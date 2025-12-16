import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import auth from '../middleware/auth.js'

const router = express.Router()

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

// POST signup (buyer)
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    // Create new user as buyer
    const user = new User({ name, email, password, role: 'buyer' })
    await user.save()

    res.status(201).json({ message: 'Account created successfully' })
  } catch (error) {
    res.status(400).json({ error: 'Signup failed' })
  }
})

// POST signup as seller
router.post('/signup/seller', async (req, res) => {
  try {
    const { name, email, password, shopName } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    // Create new seller
    const user = new User({
      name,
      email,
      password,
      role: 'seller',
      shopName: shopName || name + "'s Shop"
    })
    await user.save()

    res.status(201).json({ message: 'Seller account created successfully' })
  } catch (error) {
    console.error('Seller signup error:', error)
    res.status(400).json({ error: 'Signup failed' })
  }
})

// POST login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body

    console.log('Login attempt for:', email, 'as', role) // Debug log

    // Find user by email (lowercase to match schema)
    const user = await User.findOne({ email: email.toLowerCase() })
    console.log('User found:', user ? 'Yes' : 'No') // Debug log
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Check if role matches
    if (role && user.role !== role) {
      if (role === 'seller') {
        return res.status(401).json({ error: 'This account is not registered as a seller. Please login as a buyer or create a seller account.' })
      } else {
        return res.status(401).json({ error: 'This account is registered as a seller. Please login as a seller.' })
      }
    }

    // Check password
    console.log('Comparing password...')
    const isMatch = await user.comparePassword(password)
    console.log('Password match:', isMatch)
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Generate token
    const token = generateToken(user._id)
    console.log('Login successful, token generated')

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        shopName: user.shopName
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(400).json({ error: 'Login failed' })
  }
})

// GET current user profile
router.get('/me', auth, async (req, res) => {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    shopName: req.user.shopName
  })
})

export default router

