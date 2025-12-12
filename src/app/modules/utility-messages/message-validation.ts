// src/validation/contact.validation.ts
import { z } from "zod";
import { IssueType } from "./message-interface";

export const contactFormSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  issueType: z.nativeEnum(IssueType),
  message: z.string().min(10),
});
