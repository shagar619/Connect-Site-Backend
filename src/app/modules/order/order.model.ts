import { Schema, model } from "mongoose";
import { IOrder, OrderStatus } from "./order.interface";

const orderSchema = new Schema<IOrder>(
  {
    // 🔗 রেফারেন্স ফিল্ডস
    serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true },

    // 💡 FIX: buyerId এর বদলে clientId ব্যবহার করা হলো
    clientId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // 💵 আর্থিক ফিল্ডস
    totalPrice: { type: Number, required: true },
    platformFee: { type: Number, required: true },

    // 💡 FIX: sellerEarnings এর বদলে netAmount ব্যবহার করা হলো
    netAmount: { type: Number, required: true },

    // 💳 পেমেন্ট তথ্য
    paymentIntentId: { type: String, required: true, unique: true },

    // 💡 ADD: transactionId যোগ করা হলো
    transactionId: { type: Schema.Types.ObjectId, ref: "Transaction" },

    // ⚙️ স্ট্যাটাস এবং সময়
    // 💡 FIX: status এর বদলে orderStatus ব্যবহার করা হলো
    orderStatus: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
      required: true, // স্ট্যাটাস সবসময় থাকবে
    },

    // 💡 ADD: isPaid যোগ করা হলো
    isPaid: { type: Boolean, default: false },
    cancellationReason: { type: String },
    deliveryDate: { type: Date },

    // ⚠️ অতিরিক্ত ডেটা (এগুলো IOrder ইন্টারফেসে নেই, তাই সতর্ক থাকুন)
    // cancellationReason: { type: String },
    // deliveryDate: { type: Date },
    // যদি এগুলো দরকার হয়, তবে IOrder ইন্টারফেসটিও আপডেট করতে হবে।
  },
  { timestamps: true }
);

// দ্রুত সেলার/ক্লায়েন্ট অর্ডার খোঁজার জন্য ইনডেক্সিং
// 💡 FIX: buyerId এর বদলে clientId ব্যবহার করা হলো
orderSchema.index({ sellerId: 1, orderStatus: 1 });
orderSchema.index({ clientId: 1, orderStatus: 1 });

export const Order = model<IOrder>("Order", orderSchema);
