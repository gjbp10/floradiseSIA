
// src/admin/components/CustomerData.jsx
"use client"

import axios from "axios"
import { useEffect, useState } from "react"
// Assuming you have 'backendUrl' defined somewhere, like in App.js or a config file
import { backendUrl } from "../App" 
import { toast } from "react-toastify" 

// Renamed from 'Users' to 'CustomerData'
const CustomerData = ({ token }) => {
  const [customers, setCustomers] = useState([]) 
  const [editingCustomer, setEditingCustomer] = useState(null) 
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
    suspended: false,
  })
  // Added state to track fields needed for PUT requests
  const [extraData, setExtraData] = useState({
      firstName: "",
      lastName: "",
      phone: "",
      address: "",
  })

  // Fetch all users (customers and admins) and filter them to show only customers
  const fetchCustomers = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/user/all", {
        headers: { token },
      })
      
      if (response.data.users) {
        // Filter: Only keep users with role !== 'admin'
        const nonAdminUsers = response.data.users
          .filter(user => user.role !== "admin")
          .map(user => ({
            ...user,
            // Create a combined 'name' field for display
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
          }))
          .reverse()
          
        setCustomers(nonAdminUsers)
      } else {
        toast.error("Failed to fetch customer data")
      }
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || error.message)
    }
  }

  // Delete a user (only applicable to customers in this view)
  const removeCustomer = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this customer?")) return
    try {
      setIsLoading(true)
      const response = await axios.delete(backendUrl + `/api/user/${id}`, {
        headers: { token },
      })
      if (response.data.success) {
        toast.success(response.data.message)
        await fetchCustomers()
      } else {
        toast.error("Failed to delete customer")
      }
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Suspend/Unsuspend user
  const toggleSuspend = async (customer) => {
    // 🛑 FIX: Check if customer is defined before accessing its properties
    if (!customer) {
        toast.error("Error: Customer data is missing for this action.")
        return
    }

    try {
      setIsLoading(true)
      
      const newSuspendedStatus = !customer.suspended;

      // 🛑 FIX: Ensure all required fields are included, defaulting to empty string if missing.
      // This prevents 'Cannot read properties of undefined' if the original user object is incomplete.
      const updateData = {
          firstName: customer.firstName || "", 
          lastName: customer.lastName || "",
          email: customer.email, // Email should always exist if fetching from DB
          phone: customer.phone || "",
          address: customer.address || "",
          role: customer.role || "user", // Default role to prevent 'reading role' error
          suspended: newSuspendedStatus, 
      };

      // Endpoint: PUT /api/user/:id 
      const response = await axios.put(
        backendUrl + `/api/user/${customer._id}`,
        updateData,
        { headers: { token } }
      )
      
      if (response.data.success) {
        toast.success(`Customer ${newSuspendedStatus ? "suspended" : "unsuspended"} successfully`)
        await fetchCustomers()
      } else {
        toast.error(response.data.message || "Failed to update suspension")
      }
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Open edit modal
  const openEditModal = (customer) => {
    setEditingCustomer(customer)
    setFormData({
      name: customer.name || "",
      email: customer.email || "",
      role: customer.role || "user",
      suspended: customer.suspended || false,
    })
    // Populate extra fields needed for the PUT request
    setExtraData({
        firstName: customer.firstName || "", 
        lastName: customer.lastName || "",
        phone: customer.phone || "",
        address: customer.address || "",
    })
  }

  // Close edit modal
  const closeEditModal = () => {
    setEditingCustomer(null)
    setFormData({ name: "", email: "", role: "user", suspended: false })
    setExtraData({ firstName: "", lastName: "", phone: "", address: "" })
  }

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
    }))
  }

  // Update customer
  const updateCustomer = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // A simple (but imperfect) way to split the combined 'name' back to first/last name
    // NOTE: If you update 'name' in the modal, this logic determines what's saved.
    const nameParts = formData.name.trim().split(/\s+/);
    
    // Use data from both formData and extraData
    const updateData = {
        firstName: nameParts[0] || extraData.firstName || '', // Use split name or existing extraData
        lastName: nameParts.slice(1).join(' ') || extraData.lastName || '',
        email: formData.email,
        phone: extraData.phone || '',
        address: extraData.address || '',
        role: formData.role,
        suspended: formData.suspended,
    };
    
    try {
      // Endpoint: PUT /api/user/:id 
      const response = await axios.put(
        backendUrl + `/api/user/${editingCustomer._id}`,
        updateData,
        { headers: { token } }
      )
      if (response.data.success) {
        toast.success("Customer account updated successfully")
        closeEditModal()
        await fetchCustomers()
      } else {
        toast.error(response.data.message || "Update failed")
      }
    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || error.message)
    } finally {
      setIsLoading(false)
    }
  }


  useEffect(() => {
    fetchCustomers()
  }, [token]) // ✅ Added 'token' to dependencies for best practice

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xl font-bold">Customer Accounts</p>
        <button
          className="px-4 py-2 bg-gray-600 text-white rounded text-sm"
          onClick={fetchCustomers}
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing...' : 'Refresh List'}
        </button>
      </div>
      
      {/* Table Structure */}
      <div className="flex flex-col gap-2">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-[2fr_3fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm">
          <b>Name</b>
          <b>Email</b>
          <b>Role</b>
          <b>Status</b>
          <b className="text-center">Action</b>
        </div>

        {/* Customer List */}
        {customers.map((customer, index) => (
          <div
            key={index}
            className="grid grid-cols-[2fr_3fr] md:grid-cols-[2fr_3fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm"
          >
            <p>{customer.name}</p>
            <p>{customer.email}</p>
            <p>{customer.role}</p>
            <p>
              {customer.suspended ? (
                <span className="text-red-500 font-semibold">Suspended</span>
              ) : (
                <span className="text-green-600 font-semibold">Active</span>
              )}
            </p>
            <div className="flex justify-end md:justify-center gap-3">
              <span
                onClick={() => openEditModal(customer)}
                className="cursor-pointer text-blue-500 hover:text-blue-700"
              >
                EDIT
              </span>
              <span
                onClick={() => toggleSuspend(customer)}
                className={`cursor-pointer ${customer.suspended ? "text-green-600 hover:text-green-800" : "text-orange-500 hover:text-orange-700"}`}
              >
                {customer.suspended ? "UNSUSPEND" : "SUSPEND"}
              </span>
              <span
                onClick={() => removeCustomer(customer._id)}
                className="cursor-pointer text-red-500 hover:text-red-700"
              >
                DELETE
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Edit Customer Account</h2>
            <form onSubmit={updateCustomer}>
              {/* Name field */}
              <div className="mb-4">
                <p className="mb-2">Full Name</p>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border"
                  required
                />
              </div>

              <div className="mb-4">
                <p className="mb-2">Email</p>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border"
                  required
                  readOnly 
                  disabled
                />
              </div>

              {/* Role dropdown is kept but set to 'user' by default for customers */}
              <div className="mb-4">
                <p className="mb-2">Role</p>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="mb-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  name="suspended"
                  checked={formData.suspended}
                  onChange={handleInputChange}
                  id="suspend-checkbox-edit"
                />
                <label htmlFor="suspend-checkbox-edit" className="text-sm">
                  Account Suspended
                </label>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 bg-gray-200 rounded"
                  disabled={isLoading}
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
          </div>
        </div>
      )}
    </>
  )
}

export default CustomerData
