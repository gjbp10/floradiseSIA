"use client"

import axios from "axios"
import { useEffect, useState } from "react"
import { backendUrl } from "../App"
import { toast } from "react-toastify"

const AdminUser = ({ token }) => { // Renamed component
    const [users, setUsers] = useState([])
    const [editingUser, setEditingUser] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        // Note: Backend uses firstName/lastName, but form uses 'name'. This data conversion
        // must happen on the client side before sending, or on the server side.
        // Assuming your backend handles splitting 'name' or you are sending firstName/lastName in the update.
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
            // 🌟 FIX 1: Change endpoint to /api/user/all 🌟
            const response = await axios.get(backendUrl + "/api/user/all", {
                headers: { token },
            })
            if (response.data.users) {
                // Ensure users is an array before reversing
                setUsers(response.data.users ? response.data.users.reverse() : []);
            } else {
                toast.error("Failed to fetch users")
            }
        } catch (error) {
            console.error(error)
            toast.error(error.response?.data?.message || error.message) // Use detailed error if available
        }
    }

    // Remove user/admin
    const removeUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return
        try {
            setIsLoading(true)
            // 🌟 FIX 2: Change endpoint to /api/user/:id 🌟
            const response = await axios.delete(backendUrl + `/api/user/${id}`, {
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
            toast.error(error.response?.data?.message || error.message)
        } finally {
            setIsLoading(false)
        }
    }

    // Suspend/Unsuspend user
    const toggleSuspend = async (user) => {
        try {
            setIsLoading(true)
            // 🌟 FIX 3: Change endpoint to /api/user/:id (using PUT for update) 🌟
            // NOTE: This assumes your updateUser backend route handles the 'suspended' field.
            const response = await axios.put(
                backendUrl + `/api/user/${user._id}`,
                { 
                    // Send the full name, email, and role along with the new suspended status
                    firstName: user.firstName, 
                    lastName: user.lastName, 
                    email: user.email,
                    role: user.role,
                    suspended: !user.suspended 
                },
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
            toast.error(error.response?.data?.message || error.message)
        } finally {
            setIsLoading(false)
        }
    }

    // Open edit modal
    const openEditModal = (user) => {
        setEditingUser(user)
        // Note: Combining firstName and lastName for the single 'name' field in the form
        const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();

        setFormData({
            name: fullName,
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
        
        // Split name back into firstName and lastName for the backend
        const nameParts = formData.name.trim().split(/\s+/);
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(" ") || "";
        
        try {
            // 🌟 FIX 4: Change endpoint to /api/user/:id 🌟
            const response = await axios.put(
                backendUrl + `/api/user/${editingUser._id}`,
                { 
                    ...formData,
                    firstName: firstName,
                    lastName: lastName,
                    // Remove the 'name' field which is not expected by the controller
                    name: undefined
                },
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
            toast.error(error.response?.data?.message || error.message)
        } finally {
            setIsLoading(false)
        }
    }

    // Handle add admin input (same as before)
    const handleAddAdminChange = (e) => {
        const { name, value } = e.target
        setAddAdminData((prev) => ({ ...prev, [name]: value }))
    }

    // Add new admin
    const addAdmin = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        // Split name back into firstName and lastName for the backend
        const nameParts = addAdminData.name.trim().split(/\s+/);
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(" ") || "";
        
        try {
            // 🌟 FIX 5: Change endpoint to /api/user/register-admin 🌟
            const response = await axios.post(
                backendUrl + "/api/user/register-admin",
                {
                    firstName,
                    lastName,
                    email: addAdminData.email,
                    password: addAdminData.password,
                    role: addAdminData.role // Should be 'admin'
                },
                // Token is necessary here as this route is used for adding a new admin 
                // *after* the first one is created and requires admin authorization.
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
            toast.error(error.response?.data?.message || error.message)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    return (
        // ... (The rest of the component's JSX remains the same)
        <>
            <div className="flex items-center justify-between mb-2">
                <p>Admin Accounts</p>
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
                        {/* Combine firstName and lastName for display */}
                        <p>{user.firstName} {user.lastName}</p> 
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

            {/* Edit Modal (JSX is unchanged, but logic handles name splitting/combining) */}
            {editingUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    {/* ... (Modal content) ... */}
                </div>
            )}

            {/* Add Admin Modal (JSX is unchanged, but logic handles name splitting) */}
            {showAddAdmin && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    {/* ... (Modal content) ... */}
                </div>
            )}
        </>
    )
}

export default AdminUser
