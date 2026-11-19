import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { JwtService } from "@nestjs/jwt";
import * as argon2 from "argon2";
import { Model } from "mongoose";
import { ACCESS_TOKEN_TTL_SECONDS } from "./auth.constants";
import type { AuthUser } from "./auth.types";
import { User, type UserDocument } from "./schemas/user.schema";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async login(emailInput: string, password: string): Promise<{
    accessToken: string;
    user: AuthUser;
  }> {
    const email = emailInput.trim().toLowerCase();
    const user = await this.userModel
      .findOne({ email })
      .select("+passwordHash")
      .exec();

    const isValid = user
      ? await argon2.verify(user.passwordHash, password).catch(() => false)
      : false;

    if (!user || !isValid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const authUser = {
      id: user._id.toString(),
      email: user.email,
    };
    const accessToken = await this.jwtService.signAsync(
      { email: authUser.email },
      {
        subject: authUser.id,
        expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      },
    );

    return { accessToken, user: authUser };
  }
}
