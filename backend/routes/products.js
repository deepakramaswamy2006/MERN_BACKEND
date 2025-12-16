import express from 'express'
import Product from '../models/Product.js'

const router = express.Router()

// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find()
    res.json(products)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// GET single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    res.json(product)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' })
  }
})

// POST create new product (for seeding/admin)
router.post('/', async (req, res) => {
  try {
    const product = new Product(req.body)
    await product.save()
    res.status(201).json(product)
  } catch (error) {
    res.status(400).json({ error: 'Failed to create product' })
  }
})

// POST seed multiple products
router.post('/seed', async (req, res) => {
  try {
    const { products } = req.body
    await Product.deleteMany({}) // Clear existing products
    const created = await Product.insertMany(products)
    res.status(201).json({ message: `${created.length} products seeded successfully` })
  } catch (error) {
    res.status(400).json({ error: 'Failed to seed products' })
  }
})

export default router

