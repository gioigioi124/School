import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: process.env.SUPABASE_JWKS_URL || '',
      }),
      algorithms: ['RS256', 'ES256', 'HS256'],
    });
  }

  async validate(payload: any) {
    // The payload is the decoded JWT from Supabase
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
