import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: String,
  price: Number,
  qty: {
    type: Number,
    required: true,
    min: 1
  }
})

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  total: {
    type: Number,
    required: true
  },
  shippingAddress: {
    name: String,
    email: String,
    phone: String,
    address: String
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'cod'],
    default: 'cod'
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
})

export default mongoose.model('Order', orderSchema)

