import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    cartData: { type: Object, default: {} },
    wishlistData: { type: Object, default: {} },
  },
  { minimize: false, timestamps: true },
)

const userModel = mongoose.models.user || mongoose.model("user", userSchema)

export default userModel
