import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { APP_GUARD } from "@nestjs/core";
import { AuthModule } from "./auth/auth.module";
import { OriginGuard } from "./auth/origin.guard";

function validateEnvironment(config: Record<string, unknown>) {
  const requiredVariables = ["APP_ORIGIN", "MONGODB_URI", "JWT_SECRET"] as const;

  for (const variable of requiredVariables) {
    if (typeof config[variable] !== "string" || !config[variable].trim()) {
      throw new Error(`${variable} must be set`);
    }
  }

  try {
    new URL(config.APP_ORIGIN as string);
  } catch {
    throw new Error("APP_ORIGIN must be a valid absolute URL");
  }

  return config;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>("MONGODB_URI"),
      }),
    }),
    AuthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: OriginGuard,
    },
  ],
})
export class AppModule {}
