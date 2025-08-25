export default () => ({
  port: parseInt(process.env.PORT || '3000', 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-service',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    },
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10) || 6379,
    password: process.env.REDIS_PASSWORD || '',
    db: parseInt(process.env.REDIS_DB || '0', 10) || 0,
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    maxFiles: process.env.LOG_MAX_FILES || '14d',
    maxSize: process.env.LOG_MAX_SIZE || '20m',
  },
});
