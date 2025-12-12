import { z } from "zod";
import { Types } from "mongoose";
import { OrderStatus } from "./order.interface";

// 💡 মঙ্গোজ ObjectId কে স্ট্রিং হিসেবে ভ্যালিডেট করার জন্য কাস্টম ফিক্স
const objectIdSchema = z
  .string()
  .nonempty("Service ID is required.")
  .refine((val) => Types.ObjectId.isValid(val), {
    message: "Invalid ObjectId format",
  });


// অর্ডারের স্ট্যাটাস এনুম
const orderStatusEnum = z.nativeEnum(OrderStatus);

// =========================================================================
// 1. অর্ডার তৈরি (POST /orders)
// ক্লায়েন্টের কাছ থেকে শুধু serviceId এবং ঐচ্ছিকভাবে quantity আসবে।
// =========================================================================
export const createOrderSchema = z.object({
 
    // 🔗 কোন সার্ভিস অর্ডার করা হচ্ছে, তার ID
    serviceId: objectIdSchema,

    // 🔢 যদি আপনার প্ল্যাটফর্মে কোনো সার্ভিসের একাধিক ইউনিট অর্ডার করা যায়
    quantity: z
      .number()
      .int()
      .min(1, "Quantity must be at least 1.")
      .optional()
      .default(1),

    // 💡 note: ক্লায়েন্টের ID, সেলারের ID এবং মূল্য সব সার্ভার-সাইডে (কন্ট্রোলারে) যুক্ত হবে।
 
});

// =========================================================================
// 2. অর্ডার স্ট্যাটাস আপডেট (PATCH /orders/:orderId)
// সেলার বা ক্লায়েন্ট কর্তৃক স্ট্যাটাস পরিবর্তনের জন্য
// =========================================================================
export const updateOrderStatusSchema = z.object({



    orderStatus: orderStatusEnum.optional(),
    cancellationReason: z.string().optional(),
    deliveryDate: z.string().datetime().optional(),
  
});


// =========================================================================
// 3. অর্ডার ফিল্টার করা (GET /orders) - Query Validation
// =========================================================================
export const getOrderQuerySchema = z.object({
  query: z
    .object({
      // ঐচ্ছিক ফিল্টার প্যারামিটার
      orderStatus: orderStatusEnum.optional(),
      isPaid: z
        .string()
        .optional()
        .transform((val) => {
          // 'true'/'false' স্ট্রিং থেকে boolean এ রূপান্তর
          if (val === "true") return true;
          if (val === "false") return false;
          return undefined;
        }),

      // পেজিনেশন এবং সর্টিং
      page: z.string().transform(Number).optional(),
      limit: z.string().transform(Number).optional(),
      sortBy: z.string().optional(),
    })
    .optional(),
});
