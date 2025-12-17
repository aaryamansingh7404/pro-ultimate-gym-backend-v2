// Model for MembershipPlan
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  address: String,
  state: String,
  city: String,
  password: String,
  membershipPlan: Number, 
  membershipStartDate: Date,
  assignedCoach: String,
  profilePhoto: { type: String, default: "" }

});

const User = mongoose.model("User", userSchema);

export default User;
