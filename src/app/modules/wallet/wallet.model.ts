import { Schema, model, Types, Document } from "mongoose";

export interface WalletDocument extends Document {
  userId: Types.ObjectId;
  balance: number; // Current available balance
  totalWithdrawn: number; // Total withdrawn
  totalEarned: number; // Total earned
  updatedAt: Date;
  createdAt: Date;
}

const walletSchema = new Schema<WalletDocument>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, unique: true, ref: "User" },
    balance: { type: Number, default: 0 },
    totalWithdrawn: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Wallet = model<WalletDocument>("Wallet", walletSchema);
