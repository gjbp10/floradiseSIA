import { v2 as cloudinary } from "cloudinary"
import productModel from "../models/productModel.js"

// Add product
const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, subCategory, sizes, bestseller } = req.body

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
      name,
      description,
      category,
      price: Number(price),
      subCategory,
      bestseller: bestseller === "true" ? true : false,
      sizes: typeof sizes === "string" ? JSON.parse(sizes) : sizes,
      image: imagesUrl,
      date: Date.now(),
    }

    const product = new productModel(productData)
    await product.save()

    res.status(201).json({ success: true, message: "Product Added" })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Update product
const updateProduct = async (req, res) => {
  try {
    const { id, name, description, price, category, subCategory, sizes, bestseller } = req.body

    const product = await productModel.findById(id)
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" })
    }

    product.name = name
    product.description = description
    product.price = Number(price)
    product.category = category
    product.subCategory = subCategory
    product.bestseller = bestseller === "true" ? true : false
    product.sizes = typeof sizes === "string" ? JSON.parse(sizes) : sizes

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
        product.image = imagesUrl
      }
    }

    await product.save()
    res.json({ success: true, message: "Product Updated" })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// List products
const listProducts = async (req, res) => {
  try {
    const products = await productModel.find({})
    res.json({ success: true, products })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Remove product
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

// Single product info
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