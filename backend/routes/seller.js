import express from 'express'
import Product from '../models/Product.js'
import User from '../models/User.js'
import auth from '../middleware/auth.js'
import sellerAuth from '../middleware/seller.js'

const router = express.Router()

// GET seller's products
router.get('/products', auth, sellerAuth, async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 })
    res.json(products)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' })
  }
})

// POST add new product (with base64 image)
router.post('/products', auth, sellerAuth, async (req, res) => {
  try {
    const { name, price, image, description, category, stock } = req.body

    // Validate that image is provided (can be base64 or URL)
    if (!image) {
      return res.status(400).json({ error: 'Product image is required' })
    }

    const product = new Product({
      name,
      price,
      image, // This can now be base64 data URL or external URL
      description,
      category: category || 'General',
      stock: stock || 100,
      seller: req.user._id,
      sellerName: req.user.shopName || req.user.name
    })

    await product.save()
    res.status(201).json(product)
  } catch (error) {
    console.error('Add product error:', error)
    res.status(400).json({ error: 'Failed to add product' })
  }
})

// PUT update product
router.put('/products/:id', auth, sellerAuth, async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, seller: req.user._id })
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    const updates = ['name', 'price', 'image', 'description', 'category', 'stock']
    updates.forEach(field => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field]
      }
    })

    await product.save()
    res.json(product)
  } catch (error) {
    res.status(400).json({ error: 'Failed to update product' })
  }
})

// DELETE product
router.delete('/products/:id', auth, sellerAuth, async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, seller: req.user._id })
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    res.json({ message: 'Product deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' })
  }
})

// GET seller dashboard stats
router.get('/stats', auth, sellerAuth, async (req, res) => {
  try {
    const productCount = await Product.countDocuments({ seller: req.user._id })
    const products = await Product.find({ seller: req.user._id })
    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0)
    
    res.json({
      productCount,
      totalStock,
      shopName: req.user.shopName || req.user.name
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' })
  }
})

export default router

