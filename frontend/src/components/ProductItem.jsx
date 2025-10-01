"use client"

import { useContext, useState } from "react"
import { ShopContext } from "../context/ShopContext"
import { Link } from "react-router-dom"

// Ensure 'addToCart' is destructured here
const ProductItem = ({ id, image, name, price, addToCart }) => {
  const { currency, addToWishlist, removeFromWishlist, wishlistItems } = useContext(ShopContext)
  const [isHovered, setIsHovered] = useState(false)

  // ... (omitted debug logs)

  // Check if item is in wishlist
  const isInWishlist = wishlistItems && wishlistItems[id]

  // Heart SVG Component (omitted for brevity)
  const HeartIcon = ({ filled = false, className = "" }) => (
    <svg
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  )

  const toggleWishlist = (e) => {
    e.preventDefault() // Prevent navigation when clicking heart
    e.stopPropagation()

    if (isInWishlist) {
      removeFromWishlist && removeFromWishlist(id)
    } else {
      addToWishlist && addToWishlist(id)
    }
  }

  // This handler prevents the whole card's <Link> navigation
  const handleAddToCartClick = (e) => {
    e.preventDefault()
    e.stopPropagation() 
    // We pass only the ID here, as the name is used in the Collection component's handler.
    addToCart && addToCart(id)
  }

  return (
    <Link
      to={`/product/${id}`}
      className="text-gray-700 cursor-pointer group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden rounded-lg bg-gray-100">
        <img
          className="hover:scale-110 transition ease-in-out duration-300 w-full aspect-square object-cover"
          src={image && image[0] ? image[0] : "/placeholder.svg?height=300&width=300"}
          alt={name}
        />

        {/* Heart Icon - Always visible, positioned in top-right */}
        <button
          onClick={toggleWishlist}
          className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg transition-all duration-300 hover:bg-white hover:scale-110 z-10"
        >
          <HeartIcon
            filled={isInWishlist}
            className={`w-5 h-5 transition-colors duration-200 ${
              isInWishlist ? "text-red-500" : "text-gray-600 hover:text-red-500"
            }`}
          />
        </button>

        {/* Optional: Wishlist badge */}
        {isInWishlist && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            ♥ Saved
          </div>
        )}

        {/* Add to Cart button: This is the main addition */}
        <button
          onClick={handleAddToCartClick}
          className={`absolute inset-x-0 bottom-0 py-2 text-sm font-semibold text-white bg-green-500 transition-all duration-300 
            ${isHovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"} 
            sm:translate-y-0 sm:opacity-100 sm:hover:bg-green-600`}
        >
          Add to Cart
        </button>
      </div>

      {/* Product Info with Heart Icon on the left of name */}
      <div className="pt-3 pb-1">
        <div className="flex items-center gap-2 mb-1">
          {/* Heart icon next to product name (optional and clickable) */}
          <button
            onClick={toggleWishlist}
            className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <HeartIcon
              filled={isInWishlist}
              className={`w-4 h-4 transition-colors duration-200 ${
                isInWishlist ? "text-red-500" : "text-gray-400 hover:text-red-500"
              }`}
            />
          </button>
          <p className="text-sm font-medium text-gray-800 line-clamp-2 flex-1">{name}</p>
        </div>
        <p className="text-sm font-bold text-gray-900">
          {currency}
          {price}
        </p>
      </div>
    </Link>
  )
}

export default ProductItem
