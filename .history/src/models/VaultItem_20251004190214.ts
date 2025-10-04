// src/models/VaultItem.ts

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVaultItem extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  title: string;
  iv: string;
  encryptedData: string;
}

const VaultItemSchema: Schema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  iv: { // Initialization Vector for AES encryption
    type: String,
    required: true,
  },
  encryptedData: { // The encrypted username, password, url, notes
    type: String,
    required: true,
  },
}, {
  timestamps: true
});

// Avoid recompiling the model
const VaultItem: Model<IVaultItem> = mongoose.models.VaultItem || mongoose.model<IVaultItem>('VaultItem', VaultItemSchema);

export default VaultItem;