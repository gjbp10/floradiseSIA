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

  // Remove user
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

  // Open edit modal
  const openEditModal = (user) => {
    setEditingUser(user)
    setFormData({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "user",
    })
  }

  // Close edit modal
  const closeEditModal = () => {
    setEditingUser(null)
    setFormData({ name: "", email: "", role: "user" })
  }

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
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

  useEffect(() => {
    fetchUsers()
  }, [])

  return (
    <>
      <p className="mb-2">All Users</p>
      <div className="flex flex-col gap-2">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-[2fr_3fr_2fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm">
          <b>Name</b>
          <b>Email</b>
          <b>Role</b>
          <b className="text-center">Action</b>
        </div>

        {/* User List */}
        {users.map((user, index) => (
          <div
            key={index}
            className="grid grid-cols-[2fr_3fr] md:grid-cols-[2fr_3fr_2fr_1fr] items-center gap-2 py-1 px-2 border text-sm"
          >
            <p>{user.name}</p>
            <p>{user.email}</p>
            <p>{user.role}</p>
            <div className="flex justify-end md:justify-center gap-3">
              <span
                onClick={() => openEditModal(user)}
                className="cursor-pointer text-blue-500"
              >
                EDIT
              </span>
              <span
                onClick={() => removeUser(user._id)}
                className="cursor-pointer text-red-500"
              >
                DELETE
              </span>
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
    </>
  )
}

export default Users
