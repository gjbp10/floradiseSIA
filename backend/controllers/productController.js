import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"

// Helper to generate SKU (PKU) - Kept as is
const generateSKU = (category) => {
  const prefix = category.substring(0, 3).toUpperCase()
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(100 + Math.random() * 900)
  return `${prefix}-${timestamp}-${random}`
}

// Add product - Kept as is
const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, subCategory, bestseller, stock } = req.body

    const image1 = req.files?.image1?.[0]
    const image2 = req.files?.image2?.[0]
    const image3 = req.files?.image3?.[0]
    const image4 = req.files?.image4?.[0]

    const images = [image1, image2, image3, image4].filter(Boolean)

    const imagesUrl = await Promise.all(
      images.map(async (item) => {
        const result = await cloudinary.uploader.upload(item.path, { resource_type: "image" })
        return result.secure_url
      })
    )

    const productData = {
      sku: generateSKU(category),
      name,
      description,
      category,
      price: Number(price),
      subCategory,
      bestseller: bestseller === "true",
      stock: Number(stock) || 0,
      image: imagesUrl,
      date: Date.now(),
    }

    const product = new productModel(productData)
    await product.save()

    res.status(201).json({ success: true, message: "Product Added", product })
  } catch (error) {
    console.error("Add Product Error:", error);
    res.status(500).json({ success: false, message: error.message })
  }
}

// Update product - 🛠️ MODIFIED FOR FRONTEND COMPATIBILITY 🛠️
const updateProduct = async (req, res) => {
  try {
    // Fronted sends ID, sizes, and bestseller in the body.
    const { id, name, description, price, category, subCategory, bestseller, stock, sizes, status } = req.body

    // Ensure we have a product ID from the body
    if (!id) {
        return res.status(400).json({ success: false, message: "Product ID is required for update." });
    }

    const product = await productModel.findById(id)
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" })
    }

    // 1. Update simple fields, using existing values as fallback
    product.name = name || product.name
    product.description = description || product.description
    product.price = price ? Number(price) : product.price
    product.category = category || product.category
    product.subCategory = subCategory || product.subCategory

    // 2. Handle bestseller (sent as string "true" or "false" from FormData)
    if (bestseller !== undefined) {
        product.bestseller = bestseller === "true"
    }
    
    // 3. Handle stock and status
    if (stock !== undefined) product.stock = Number(stock)
    if (status !== undefined) product.status = status

    // 4. Handle sizes (sent as stringified JSON from FormData)
    if (sizes !== undefined) {
        try {
            // Check if sizes is a string (from FormData) and parse it
            product.sizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
        } catch (e) {
            console.error("Error parsing product sizes:", e);
            // Don't halt the update, but log the error.
        }
    }


    // 5. Image Update Logic
    if (req.files && Object.keys(req.files).length > 0) {
      const image1 = req.files?.image1?.[0]
      const image2 = req.files?.image2?.[0]
      const image3 = req.files?.image3?.[0]
      const image4 = req.files?.image4?.[0]

      const images = [image1, image2, image3, image4].filter(Boolean)

      if (images.length > 0) {
        const imagesUrl = await Promise.all(
          images.map(async (item) => {
            const result = await cloudinary.uploader.upload(item.path, { resource_type: "image" })
            return result.secure_url
          })
        )
        product.image = imagesUrl // Replace ALL images if ANY new image is uploaded
      }
    }

    await product.save()
    res.json({ success: true, message: "Product Updated", product })
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({ success: false, message: error.message })
  }
}

// List products - Kept as is
const listProducts = async (req, res) => {
  try {
    const products = await productModel.find({})
    res.json({ success: true, products })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Remove product - Kept as is
const removeProduct = async (req, res) => {
  try {
    const { id } = req.body
    const product = await productModel.findByIdAndDelete(id)
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" })
    }
    res.json({ success: true, message: "Product Removed" })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Single product info - Kept as is
const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body
    const product = await productModel.findById(productId)
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" })
    }
    res.json({ success: true, product })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export { listProducts, addProduct, removeProduct, singleProduct, updateProduct }
