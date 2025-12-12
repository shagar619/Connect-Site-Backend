import { Types } from "mongoose";

// =======================================================
// ১. 🛠️ সার্ভিস স্ট্যাটাস এনুম
// =======================================================
export enum ServiceStatus {
  LIVE = "LIVE",
  DRAFT = "DRAFT",
  PAUSED = "PAUSED",
}

// =======================================================
// ২. 💻 সার্ভিস ক্যাটাগরি এনুম (এখানে আপনি আপনার অনুমোদিত তালিকা রাখবেন)
// =======================================================
export enum ServiceCategory {
  WEB_DEVELOPMENT = "Web Development",
  UI_UX_DESIGN = "UI/UX Design",
  DIGITAL_MARKETING = "Digital Marketing",
  SOFTWARE_TESTING = "Software Testing",
  CONTENT_WRITING = "Content Writing",
  CYBER_SECURITY = "Cyber Security",
  MOBILE_DEVELOPMENT = "Mobile App Development",
  DATA_SCIENCE = "Data Science & AI",
  
}

// =======================================================
// ৩. 📄 IService ইন্টারফেস (ক্যাটাগরি ব্যবহার করে)
// =======================================================
export interface IService {
  _id?: Types.ObjectId;

  title: string;
  description: string;
  price: number;
  deliveryTime: number; // in days

  // 💡 পরিবর্তন: এখন 'category' স্ট্রিং না হয়ে ServiceCategory এনুম হবে
  category: ServiceCategory;

  tags: string[];

  // 📸 পরিবর্তন: একটি ইমেজ URL
  image: string;

  sellerId: Types.ObjectId; // User Model-এর সাথে রেফারেন্স

  averageRating: number;
  reviewCount: number;

  status: ServiceStatus;
  isDeleted: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}
