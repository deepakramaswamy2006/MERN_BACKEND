import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Product from './models/Product.js'

dotenv.config()

// This script removes all products that were NOT added by sellers
// Only seller-uploaded products will remain

async function cleanNonSellerProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to MongoDB')

    // Delete products that don't have a seller field (manually seeded products)
    const result = await Product.deleteMany({ seller: { $exists: false } })
    console.log(`Removed ${result.deletedCount} non-seller products`)

    // Also delete products where seller is null
    const result2 = await Product.deleteMany({ seller: null })
    console.log(`Removed ${result2.deletedCount} products with null seller`)

    // Show remaining products
    const remaining = await Product.find({})
    console.log(`\nRemaining products (${remaining.length}):`)
    remaining.forEach(p => {
      console.log(`  - ${p.name} (by ${p.sellerName || 'Unknown'})`)
    })

    await mongoose.disconnect()
    console.log('\nDisconnected from MongoDB')
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

cleanNonSellerProducts()

