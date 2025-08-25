import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SecurityEvent {
  event: string;
  details: any;
  userId?: string;
  ip?: string;
  userAgent?: string;
  timestamp: string;
}

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);

  constructor(private readonly configService: ConfigService) {}

  logSecurityEvent(event: string, details: any, userId?: string): void {
    const securityEvent: SecurityEvent = {
      event,
      details,
      userId,
      ip: details.ip || details.req?.ip,
      userAgent: details.userAgent || details.req?.headers?.['user-agent'],
      timestamp: new Date().toISOString(),
    };

    // Log security events at warn level for monitoring
    this.logger.warn(`SECURITY_EVENT: ${event}`, securityEvent);

    // In production, you might want to send this to a security monitoring service
    if (this.configService.get('nodeEnv') === 'production') {
      // TODO: Integrate with security monitoring service (e.g., Sentry, LogRocket)
      this.logger.log('Security event logged to monitoring service');
    }
  }

  logFailedLogin(email: string, context: any): void {
    this.logSecurityEvent('FAILED_LOGIN', {
      email,
      ip: context.req?.ip,
      userAgent: context.req?.headers?.['user-agent'],
      req: context.req,
    });
  }

  logSuccessfulLogin(userId: string, email: string, context: any): void {
    this.logSecurityEvent('SUCCESSFUL_LOGIN', {
      userId,
      email,
      ip: context.req?.ip,
      userAgent: context.req?.headers?.['user-agent'],
      req: context.req,
    });
  }

  logTokenRevocation(userId: string, tokenType: string, context: any): void {
    this.logSecurityEvent('TOKEN_REVOCATION', {
      userId,
      tokenType,
      ip: context.req?.ip,
      userAgent: context.req?.headers?.['user-agent'],
      req: context.req,
    });
  }

  logRateLimitExceeded(ip: string, endpoint: string, limit: number): void {
    this.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
      ip,
      endpoint,
      limit,
    });
  }

  logSuspiciousActivity(activity: string, details: any, context: any): void {
    this.logSecurityEvent('SUSPICIOUS_ACTIVITY', {
      activity,
      details,
      ip: context.req?.ip,
      userAgent: context.req?.headers?.['user-agent'],
      req: context.req,
    });
  }
}
