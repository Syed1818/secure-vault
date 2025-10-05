import mongoose, { Schema, Document, Model, Types } from 'mongoose';

// Interface for VaultItem
export interface IVaultItem extends Document {
  userId: Types.ObjectId;      // Reference to the User
  title: string;               // Vault item title
  iv: string;                  // Initialization Vector for AES encryption
  encryptedData: string;       // Encrypted credentials or notes
  createdAt: Date;             // Timestamp
  updatedAt: Date;             // Timestamp
}

// Define the Schema
const VaultItemSchema: Schema<IVaultItem> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    iv: {
      type: String,
      required: true,
    },
    encryptedData: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Check if model already exists to prevent recompilation in serverless environments
const VaultItem: Model<IVaultItem> =
  mongoose.models.VaultItem || mongoose.model<IVaultItem>('VaultItem', VaultItemSchema);

export default VaultItem;
