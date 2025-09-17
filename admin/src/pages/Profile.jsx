"use client"

import axios from "axios"
import React, { useEffect, useState } from "react"
import { backendUrl } from "../App"
import { toast } from "react-toastify"

const Profile = ({ token }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  })

  // Fetch user profile
  const fetchUserProfile = async () => {
    setIsLoading(true)
    try {
       const response = await axios.get(backendUrl + "/api/user/profile", {
    headers: { Authorization: `Bearer ${token}` },
  })
      if (response.data.success) {
        setUser(response.data.user)
        setFormData({
          firstName: response.data.user.firstName,
          lastName: response.data.user.lastName,
          email: response.data.user.email,
          phone: response.data.user.phone,
          address: response.data.user.address,
        })
      } else {
        toast.error(response.data.message || "Failed to fetch user profile.")
      }
    } catch (error) {
      console.error("Error fetching user profile:", error)
      toast.error("An error occurred while fetching the profile.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle profile update
  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await axios.put(backendUrl + "/api/user/profile", formData, {
        headers: { token },
      })
      if (response.data.success) {
        toast.success("Profile updated successfully!")
        setUser(response.data.user)
        setIsEditing(false)
      } else {
        toast.error(response.data.message || "Failed to update profile.")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("An error occurred while updating the profile.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchUserProfile()
    }
  }, [token])

  if (isLoading) {
    return <p className="text-gray-500">Loading profile...</p>
  }

  if (!user) {
    return <p className="text-gray-500">No profile data found.</p>
  }

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold text-gray-800">Your Profile</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-black text-white rounded text-sm"
          >
            Edit Profile
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleUpdateProfile}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label htmlFor="firstName" className="mb-1 text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="lastName" className="mb-1 text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="email" className="mb-1 text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="phone" className="mb-1 text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex flex-col md:col-span-2">
              <label htmlFor="address" className="mb-1 text-sm font-medium text-gray-700">Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div className="flex justify-end mt-6 gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded flex items-center"
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      ) : (
        <div>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <p className="text-gray-700 font-bold mb-2">Personal Information</p>
              <p className="text-gray-600">
                <span className="font-semibold">Name:</span> {user.firstName} {user.lastName}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Email:</span> {user.email}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Phone:</span> {user.phone}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-gray-700 font-bold mb-2">Shipping Address</p>
              <p className="text-gray-600">{user.address}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
