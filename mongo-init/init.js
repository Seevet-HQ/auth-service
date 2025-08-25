// MongoDB initialization script
db = db.getSiblingDB('auth-service');

// Create a user for the auth-service database
db.createUser({
  user: 'auth-service-user',
  pwd: 'auth-service-password',
  roles: [
    {
      role: 'readWrite',
      db: 'auth-service'
    }
  ]
});

// Create initial collections
db.createCollection('users');
db.createCollection('sessions');
db.createCollection('refresh_tokens');

// Create indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.sessions.createIndex({ "userId": 1 });
db.refresh_tokens.createIndex({ "token": 1 }, { unique: true });
db.refresh_tokens.createIndex({ "userId": 1 });

print('MongoDB initialization completed successfully');
