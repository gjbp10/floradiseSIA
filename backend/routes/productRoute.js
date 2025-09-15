import express from "express"
import {
  listProducts,
  addProduct,
  removeProduct,
  singleProduct,
  updateProduct,
} from "../controllers/productController.js"
import upload from "../middleware/multer.js"
import adminAuth from "../middleware/adminAuth.js"
import Product from "../models/productModel.js" 

const productRouter = express.Router()

// Route to update only product status (no file upload, just JSON)
productRouter.post(
  "/update-status",
  adminAuth,
  async (req, res) => {
    try {
      const { id, status } = req.body
      if (!id || !status) {
        return res.status(400).json({ success: false, message: "Missing id or status" })
      }
      const product = await Product.findByIdAndUpdate(id, { status }, { new: true })
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" })
      }
      res.json({ success: true, product })
    } catch (err) {
      res.status(500).json({ success: false, message: err.message })
    }
  }
)

// Route to add a new product
productRouter.post(
  "/add",
  adminAuth,
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  addProduct,
)

// Route to update an existing product (with images)
productRouter.post(
  "/update",
  adminAuth,
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  updateProduct,
)

// Route to remove a product
productRouter.post("/remove", adminAuth, removeProduct)

// Route to get a single product
productRouter.post("/single", singleProduct)

// Route to list all products
productRouter.get("/list", listProducts)

// New route to update stock levels
productRouter.post("/update-stock", adminAuth, async (req, res) => {
  const { productId, stock } = req.body;

  try {
    await Product.findByIdAndUpdate(productId, { stock }, { new: true });
    res.json({ success: true, message: 'Stock updated successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating stock.' });
  }
});

export default productRouter