import express from 'express'
import Order from '../models/Order.js'
import auth from '../middleware/auth.js'

const router = express.Router()

// POST create new order
router.post('/', auth, async (req, res) => {
  try {
    const { items, total, shippingAddress, paymentMethod } = req.body

    const order = new Order({
      user: req.user._id,
      items,
      total,
      shippingAddress,
      paymentMethod,
      status: 'confirmed'
    })

    await order.save()

    res.status(201).json({
      success: true,
      orderId: order._id,
      message: 'Order placed successfully'
    })
  } catch (error) {
    res.status(400).json({ error: 'Failed to place order' })
  }
})

// GET user's orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.product')
    res.json(orders)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' })
  }
})

// GET single order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('items.product')

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    res.json(order)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' })
  }
})

export default router

