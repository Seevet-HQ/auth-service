export default () => {
  // Validate required environment variables in production
  const validateRequired = (value: string | undefined, name: string): string => {
    if (!value && process.env.NODE_ENV === 'production') {
      throw new Error(`${name} environment variable is required in production`);
    }
    if (!value) {
      throw new Error(`${name} environment variable is required`);
    }
    return value;
  };

  // Validate MongoDB URI includes authentication in production
  const getMongoUri = (): string => {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('MONGODB_URI is required in production');
      }
      return 'mongodb://localhost:27017/auth-service';
    }
    
    // Validate that production URIs include authentication
    if (process.env.NODE_ENV === 'production' && !uri.includes('@')) {
      console.warn('WARNING: Production MongoDB URI should include authentication credentials');
      console.warn('Example: mongodb://username:password@host:port/database');
    }
    
    return uri;
  };

  return {
    port: parseInt(process.env.PORT || '3000', 10) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',

    database: {
      mongodb: {
        uri: getMongoUri(),
        options: {
          ssl: process.env.NODE_ENV === 'production',
          authSource: 'admin',
          retryWrites: true,
          w: 'majority',
        },
      },
    },

    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10) || 6379,
      password: process.env.REDIS_PASSWORD || '',
      db: parseInt(process.env.REDIS_DB || '0', 10) || 0,
      tls: process.env.NODE_ENV === 'production' ? {} : undefined,
      retryDelayOnFailover: 100,
      enableReadyCheck: true,
      lazyConnect: true,
    },

    jwt: {
      secret: validateRequired(process.env.JWT_SECRET, 'JWT_SECRET'),
      refreshSecret: validateRequired(process.env.JWT_REFRESH_SECRET, 'JWT_REFRESH_SECRET'),
      accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      refreshExpiresInSeconds:
        parseInt(process.env.JWT_REFRESH_EXPIRES_IN_SECONDS || '604800', 10) ||
        604800, // 7 days
    },

    logging: {
      level: process.env.LOG_LEVEL || 'info',
      maxFiles: process.env.LOG_MAX_FILES || '14d',
      maxSize: process.env.LOG_MAX_SIZE || '20m',
    },

    security: {
      allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      enablePlayground: process.env.NODE_ENV === 'development',
      enableIntrospection: process.env.NODE_ENV === 'development',
    },
  };
};
