import bcrypt from "bcrypt";

import prisma from "../../utils/prisma";
import { RegisterUserInput, UserResponse } from "./user.schema";

export const createUser = async (data: RegisterUserInput): Promise<UserResponse> => {
  const { email, password } = data;
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Hash the password with bcrypt (10 salt rounds)
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  return user;
};
