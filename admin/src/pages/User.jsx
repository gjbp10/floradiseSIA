"use client"

import axios from "axios"
import { useEffect, useState } from "react"
import { backendUrl } from "../App"
import { toast } from "react-toastify"

const Users = ({ token }) => {
  const [users, setUsers] = useState([])
  const [editingUser, setEditingUser] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
    suspended: false,
  })
  const [showAddAdmin, setShowAddAdmin] = useState(false)
  const [addAdminData, setAddAdminData] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
  })

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/admin/users", {
        headers: { token },
      })
      if (response.data.users) {
        setUsers(response.data.users.reverse())
      } else {
        toast.error("Failed to fetch users")
      }
    } catch (error) {
      console.error(error)
      toast.error(error.message)
    }
  }

  // Remove user/admin
  const removeUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return
    try {
      setIsLoading(true)
      const response = await axios.delete(backendUrl + `/api/admin/users/${id}`, {
        headers: { token },
      })
      if (response.data.message) {
        toast.success(response.data.message)
        await fetchUsers()
      } else {
        toast.error("Failed to delete user")
      }
    } catch (error) {
      console.error(error)
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Suspend/Unsuspend user
  const toggleSuspend = async (user) => {
    try {
      setIsLoading(true)
      const response = await axios.patch(
        backendUrl + `/api/admin/users/${user._id}/suspend`,
        { suspended: !user.suspended },
        { headers: { token } }
      )
      if (response.data.success) {
        toast.success(`User ${!user.suspended ? "suspended" : "unsuspended"} successfully`)
        await fetchUsers()
      } else {
        toast.error(response.data.message || "Failed to update suspension")
      }
    } catch (error) {
      console.error(error)
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Open edit modal
  const openEditModal = (user) => {
    setEditingUser(user)
    setFormData({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "user",
      suspended: user.suspended || false,
    })
  }

  // Close edit modal
  const closeEditModal = () => {
    setEditingUser(null)
    setFormData({ name: "", email: "", role: "user", suspended: false })
  }

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  // Update user
  const updateUser = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await axios.put(
        backendUrl + `/api/admin/users/${editingUser._id}`,
        formData,
        { headers: { token } }
      )
      if (response.data.success) {
        toast.success("User updated successfully")
        closeEditModal()
        await fetchUsers()
      } else {
        toast.error(response.data.message || "Update failed")
      }
    } catch (error) {
      console.error(error)
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle add admin input
  const handleAddAdminChange = (e) => {
    const { name, value } = e.target
    setAddAdminData((prev) => ({ ...prev, [name]: value }))
  }

  // Add new admin
  const addAdmin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await axios.post(
        backendUrl + "/api/admin/users",
        addAdminData,
        { headers: { token } }
      )
      if (response.data.success) {
        toast.success("Admin added successfully")
        setShowAddAdmin(false)
        setAddAdminData({ name: "", email: "", password: "", role: "admin" })
        await fetchUsers()
      } else {
        toast.error(response.data.message || "Failed to add admin")
      }
    } catch (error) {
      console.error(error)
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <p>All Users</p>
        <button
          className="px-4 py-2 bg-black text-white rounded text-sm"
          onClick={() => setShowAddAdmin(true)}
        >
          Add Admin
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-[2fr_3fr_2fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm">
          <b>Name</b>
          <b>Email</b>
          <b>Role</b>
          <b>Status</b>
          <b className="text-center">Action</b>
        </div>

        {/* User List */}
        {users.map((user, index) => (
          <div
            key={index}
            className="grid grid-cols-[2fr_3fr] md:grid-cols-[2fr_3fr_2fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm"
          >
            <p>{user.name}</p>
            <p>{user.email}</p>
            <p>{user.role}</p>
            <p>
              {user.suspended ? (
                <span className="text-red-500 font-semibold">Suspended</span>
              ) : (
                <span className="text-green-600 font-semibold">Active</span>
              )}
            </p>
            <div className="flex justify-end md:justify-center gap-3">
              <span
                onClick={() => openEditModal(user)}
                className="cursor-pointer text-blue-500"
              >
                EDIT
              </span>
              {user.role === "user" && (
                <span
                  onClick={() => toggleSuspend(user)}
                  className={`cursor-pointer ${user.suspended ? "text-green-600" : "text-orange-500"}`}
                >
                  {user.suspended ? "UNSUSPEND" : "SUSPEND"}
                </span>
              )}
              {user.role === "admin" && (
                <span
                  onClick={() => removeUser(user._id)}
                  className="cursor-pointer text-red-500"
                >
                  DELETE
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Edit User</h2>
            <form onSubmit={updateUser}>
              <div className="mb-4">
                <p className="mb-2">Name</p>
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
                />
              </div>

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
                  id="suspend-checkbox"
                />
                <label htmlFor="suspend-checkbox" className="text-sm">
                  Suspended
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
                  {isLoading ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Admin Modal */}
      {showAddAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Add Admin</h2>
            <form onSubmit={addAdmin}>
              <div className="mb-4">
                <p className="mb-2">Name</p>
                <input
                  type="text"
                  name="name"
                  value={addAdminData.name}
                  onChange={handleAddAdminChange}
                  className="w-full px-3 py-2 border"
                  required
                />
              </div>
              <div className="mb-4">
                <p className="mb-2">Email</p>
                <input
                  type="email"
                  name="email"
                  value={addAdminData.email}
                  onChange={handleAddAdminChange}
                  className="w-full px-3 py-2 border"
                  required
                />
              </div>
              <div className="mb-4">
                <p className="mb-2">Password</p>
                <input
                  type="password"
                  name="password"
                  value={addAdminData.password}
                  onChange={handleAddAdminChange}
                  className="w-full px-3 py-2 border"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddAdmin(false)}
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
                  {isLoading ? "Adding..." : "Add Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default Users
