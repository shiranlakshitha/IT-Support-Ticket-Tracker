import "reflect-metadata";
import "dotenv/config";
import * as argon2 from "argon2";
import mongoose from "mongoose";
import { User, UserSchema } from "../auth/schemas/user.schema";

async function seedUser() {
  const mongoUri = process.env.MONGODB_URI;
  const email = process.env.SEED_USER_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_USER_PASSWORD;

  if (!mongoUri || !email || !password) {
    throw new Error(
      "MONGODB_URI, SEED_USER_EMAIL, and SEED_USER_PASSWORD must be set",
    );
  }

  await mongoose.connect(mongoUri);

  try {
    const userModel = mongoose.model(User.name, UserSchema);
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
    });

    await userModel.updateOne(
      { email },
      { $set: { email, passwordHash } },
      { upsert: true },
    );
    console.log(`Seeded user ${email}`);
  } finally {
    await mongoose.disconnect();
  }
}

seedUser().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
