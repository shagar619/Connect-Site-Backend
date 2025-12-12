/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { envVars } from "../config/env";

import bcryptjs from "bcryptjs";
import { User } from "../modules/user/user.model";
import { IsActiv, Role } from "../modules/user/user.interface";

export const seedSuperAdmin = async () => {
  try {
    const isSuporAdminExist = await User.findOne({
      email: envVars.SUPER_ADMIN_EMAIL,
      role: Role.SUPER_ADMIN,
    });
    if (isSuporAdminExist) {
      console.log("Super Admin Already Exists!");
      return;
    }

    console.log("Trying to create Super Admin...");

    const hashedPassword = await bcryptjs.hash(
      envVars.SUPER_ADMIN_PASSWORD,
      Number(envVars.BCRYPT_SALT_ROUND)
    );

    const payload = {
      name: "Super Admin",
      role: Role.SUPER_ADMIN,
      email: envVars.SUPER_ADMIN_EMAIL,
      password: hashedPassword,
      address: "Dhaka, Bangladesh",
      isVerified: true,
      is_active: IsActiv.ACTIVE,
    };

    const superAdmin = await User.create(payload);
    // ✅ কনসোল আউটপুটের জন্য ডেটা পরিষ্কার করা
    const result: any = superAdmin.toObject();

    delete result.password;
    delete result.skills;
    delete result.averageRating;

    delete result.bio;

    console.log("Super Admin Created Successfully! \n");
    console.log(result);
  } catch (error) {
    console.log(error);
  }
};
