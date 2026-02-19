import prisma from "../../utils/prisma";
import { User } from "./user.schema";

export const getUser = async (email: string): Promise<User | null> => {
  const user = await prisma.user.findFirst({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  return user;
};
