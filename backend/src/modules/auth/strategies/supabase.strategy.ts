import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const jwksUri = process.env.SUPABASE_JWKS_URL;
    const jwtSecret = process.env.SUPABASE_JWT_SECRET;

    if (jwksUri) {
      super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        secretOrKeyProvider: passportJwtSecret({
          cache: true,
          rateLimit: true,
          jwksRequestsPerMinute: 5,
          jwksUri: jwksUri,
        }),
        algorithms: ['RS256', 'ES256', 'HS256'],
      });
    } else {
      super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        secretOrKey: jwtSecret || 'default-dev-secret-change-in-production',
        algorithms: ['HS256', 'RS256', 'ES256'],
      });
    }
  }

  async validate(payload: any) {
    // The payload is the decoded JWT from Supabase
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role || payload.app_metadata?.role || 'authenticated',
      appMetadata: payload.app_metadata,
      userMetadata: payload.user_metadata,
    };
  }
}
