import { z } from "zod";
import { Role } from "./user.interface";

// Role enum zod compatible হিসাবে
const roleEnum = z.nativeEnum(Role);

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long."),

  email: z.string().email("Invalid email format."),

  password: z.string().min(6, "Password must be at least 6 characters long."),

  role: roleEnum.default(Role.CLIENT), // সঠিকভাবে default সেট ✔

  title: z.string().optional(),
  bio: z.string().optional(),

  skills: z.array(z.string()).optional(),

  address: z.string().optional(),
  contactNumber: z
    .string()
    .optional()
    .default("")
    .refine((val) => val === "" || /^\+?[0-9]{7,15}$/.test(val), {
      message: "Invalid contact  number",
    }),
  profilePicture: z.string().url().optional(),
});

 export const updateUserSchema = registerSchema
   .pick({
     name: true,
     title: true,
     bio: true,
     skills: true,
     address: true,
     contactNumber: true,
     profilePicture: true,
   })
   .partial() // PICK করার পরে সমস্ত ফিল্ডকে ঐচ্ছিক করা হলো
   .extend({
     // কাস্টম ফিল্ড: প্রোফাইল পিকচার ডিলিট করার জন্য
     deleteProfilePicture: z.boolean().optional(),

     // কাস্টম ফিল্ড: Postman form-data থেকে আসা JSON স্ট্রিং হ্যান্ডেল করার জন্য
     data: z.any().optional(),
   });
  

module.exports = {
  registerSchema,
  updateUserSchema
};
