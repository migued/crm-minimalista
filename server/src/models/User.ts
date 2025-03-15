import mongoose, { Document, Schema } from 'mongoose';

export enum UserRole {
  ADMIN = 'admin',
  AGENT = 'agent',
  SUPERVISOR = 'supervisor'
}

export interface IUser extends Document {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId: mongoose.Types.ObjectId;
  profilePictureUrl?: string;
  firebaseUid?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  lastLogin?: Date;
  permissions: {
    canManageUsers: boolean;
    canManageSettings: boolean;
    canManagePipelines: boolean;
    canManageCampaigns: boolean;
    canManageWhatsApp: boolean;
    canManageContacts: boolean;
  };
}

const UserSchema = new Schema<IUser>(
  {
    email: { 
      type: String, 
      required: true, 
      trim: true, 
      lowercase: true,
      unique: true
    },
    firstName: { 
      type: String, 
      required: true, 
      trim: true 
    },
    lastName: { 
      type: String, 
      required: true, 
      trim: true 
    },
    role: { 
      type: String, 
      enum: Object.values(UserRole),
      default: UserRole.AGENT,
      required: true 
    },
    organizationId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Organization', 
      required: true 
    },
    profilePictureUrl: { 
      type: String 
    },
    firebaseUid: { 
      type: String,
      required: true,
      unique: true 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    lastLogin: { 
      type: Date 
    },
    permissions: {
      canManageUsers: { type: Boolean, default: false },
      canManageSettings: { type: Boolean, default: false },
      canManagePipelines: { type: Boolean, default: false },
      canManageCampaigns: { type: Boolean, default: false },
      canManageWhatsApp: { type: Boolean, default: false },
      canManageContacts: { type: Boolean, default: true }
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Método para establecer permisos según el rol
UserSchema.pre('save', function(next) {
  if (this.isModified('role')) {
    switch(this.role) {
      case UserRole.ADMIN:
        this.permissions = {
          canManageUsers: true,
          canManageSettings: true,
          canManagePipelines: true,
          canManageCampaigns: true,
          canManageWhatsApp: true,
          canManageContacts: true
        };
        break;
      case UserRole.SUPERVISOR:
        this.permissions = {
          canManageUsers: false,
          canManageSettings: false,
          canManagePipelines: true,
          canManageCampaigns: true,
          canManageWhatsApp: true,
          canManageContacts: true
        };
        break;
      case UserRole.AGENT:
        this.permissions = {
          canManageUsers: false,
          canManageSettings: false,
          canManagePipelines: false,
          canManageCampaigns: false,
          canManageWhatsApp: true,
          canManageContacts: true
        };
        break;
    }
  }
  next();
});

export default mongoose.model<IUser>('User', UserSchema);