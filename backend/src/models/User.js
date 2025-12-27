const mongoose = require('mongoose');

const roles = ['viewer', 'creator', 'admin'];
const statuses = ['active', 'suspended', 'deleted'];

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    displayName: { type: String, trim: true },
    role: { type: String, enum: roles, default: 'viewer' },
    status: { type: String, enum: statuses, default: 'active' }
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('User', UserSchema);
