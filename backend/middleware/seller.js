// Middleware to check if user is a seller
const sellerAuth = (req, res, next) => {
  if (req.user.role !== 'seller') {
    return res.status(403).json({ error: 'Access denied. Seller account required.' })
  }
  next()
}

export default sellerAuth

