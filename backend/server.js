import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'

import productRoutes from './routes/products.js'
import userRoutes from './routes/users.js'
import orderRoutes from './routes/orders.js'
import sellerRoutes from './routes/seller.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err))

app.use('/api/products', productRoutes)
app.use('/api/users', userRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/seller', sellerRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'ZepClone API is running!' })
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

