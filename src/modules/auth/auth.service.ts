import bcrypt from "bcrypt";
import prisma from "../../utils/prisma";
import { RegisterInput, LoginInput, AuthResponse, GoogleAuthResponse } from "./auth.schema";
import { generateToken } from "../../utils/jwt";

export const register = async (data: RegisterInput): Promise<AuthResponse> => {
  const { email, password, name } = data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: name || null,
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  const token = generateToken({
    userId: user.id,
    email: user.email,
  });

  return {
    user,
    token,
  };
};

export const login = async (data: LoginInput): Promise<AuthResponse> => {
  const { email, password } = data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (!user.password) {
    throw new Error("This account uses Google sign-in. Please sign in with Google.");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    token,
  };
};

export const findOrCreateGoogleUser = async (
  googleId: string,
  email: string,
  name?: string
): Promise<GoogleAuthResponse> => {
  let isNewUser = false;

  let user = await prisma.user.findUnique({
    where: { googleId },
  });

  // 2. If not found — try by email
  if (!user) {
    const userByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (userByEmail) {
      user = await prisma.user.update({
        where: { id: userByEmail.id },
        data: {
          googleId,
          ...(name && { name }),
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email,
          googleId,
          name: name ?? null,
        },
      });
      isNewUser = true;
    }
  }
  // 3. Update name if changed
  else if (name && user.name !== name) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { name },
    });
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
  });

  return {
    user,
    token,
    isNewUser,
  };
};
