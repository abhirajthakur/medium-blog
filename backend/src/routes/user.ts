import { signinInput, signupInput } from "@abhirajthakur/medium-common";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { sign } from "hono/jwt";

type Bindings = {
  DATABASE_URL: string;
  SECRET_KEY: string;
};

export const userRouter = new Hono<{ Bindings: Bindings }>();

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();

  const encodedPassword = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encodedPassword);

  const hashedPassword = [...new Uint8Array(hashBuffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hashedPassword;
}

userRouter.post("/signup", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();
  const { success } = signupInput.safeParse(body);
  if (!success) {
    c.status(411);
    return c.json({ error: "Incorrect inputs" });
  }

  const passwordHash = await hashPassword(body.password);

  try {
    const user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        password: passwordHash,
      },
    });
    const token = await sign({ id: user.id }, c.env.SECRET_KEY);
    return c.json({ token: token, name: body.name });
  } catch (e: any) {
    if (e.code === "P2002") {
      c.status(409);
      return c.json({ error: "User already exists" });
    }
    c.status(403);
    return c.json({ error: "Error while signing up" });
  }
});

userRouter.post("/signin", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();
  const { success } = signinInput.safeParse(body);
  if (!success) {
    c.status(411);
    return c.json({ error: "Incorrect inputs" });
  }

  const passwordHash = await hashPassword(body.password);

  try {
    const user = await prisma.user.findFirst({
      where: {
        email: body.email,
        password: passwordHash,
      },
    });

    if (!user) {
      c.status(403);
      return c.json({ error: "User not found" });
    }

    const token = await sign({ id: user.id }, c.env.SECRET_KEY);
    return c.json({ token: token, name: user.name });
  } catch (err) {
    c.status(411);
    return c.json({ error: "Invalid" });
  }
});
