<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# 🔒 Auth Service

A secure NestJS authentication service with GraphQL, MongoDB, and Redis.

## 🚨 Security Features

This service implements comprehensive security measures:

- **JWT Authentication** with secure token management
- **Rate Limiting** to prevent brute force attacks
- **Strong Password Validation** with complexity requirements
- **Security Headers** via Helmet
- **CORS Protection** with origin restrictions
- **GraphQL Security** (playground/introspection disabled in production)
- **Secure Logging** with sensitive data redaction
- **Fail-Secure Design** for security-critical operations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB 7.0+
- Redis 7.0+
- Docker & Docker Compose (optional)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd auth-service

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Generate secure secrets (IMPORTANT for production)
./scripts/generate-secrets.sh

# Update .env with generated secrets
```

### Environment Variables

**Required for production:**
```bash
JWT_SECRET=<64-char-random-string>
JWT_REFRESH_SECRET=<64-char-random-string>
MONGODB_URI=mongodb://user:password@localhost:27017/auth-service
REDIS_PASSWORD=<secure-redis-password>
ALLOWED_ORIGINS=https://yourdomain.com
```

### Development

```bash
# Start development server
npm run start:dev

# Start with Docker
docker-compose -f docker-compose.dev.yml up
```

### Production

```bash
# Build the application
npm run build

# Start production server
npm run start:prod

# Or use Docker
docker-compose up -d
```

## 🔒 Security Testing

```bash
# Run security tests
./scripts/security-test.sh

# Generate secure secrets
./scripts/generate-secrets.sh
```

## 🛡️ Security Checklist

- [ ] Environment variables configured with secure values
- [ ] JWT secrets are 64+ characters and randomly generated
- [ ] MongoDB and Redis have strong passwords
- [ ] CORS origins are restricted to trusted domains
- [ ] GraphQL playground disabled in production
- [ ] Rate limiting is active
- [ ] Security headers are present
- [ ] Sensitive data is not logged
- [ ] Fail-secure policies are implemented

## 📚 API Documentation

### GraphQL Endpoint

- **Development**: http://localhost:3000/graphql
- **Production**: https://yourdomain.com/graphql

### Authentication Mutations

```graphql
# Register new user
mutation {
  register(input: {
    email: "user@example.com"
    username: "username"
    password: "SecurePassword123!"
    firstName: "John"
    lastName: "Doe"
  }) {
    accessToken
    refreshToken
    user {
      id
      email
      username
    }
  }
}

# Login
mutation {
  login(input: {
    email: "user@example.com"
    password: "SecurePassword123!"
  }) {
    accessToken
    refreshToken
    user {
      id
      email
      username
    }
  }
}

# Refresh token
mutation {
  refreshToken(input: {
    refreshToken: "your-refresh-token"
  }) {
    accessToken
    refreshToken
    user {
      id
      email
      username
    }
  }
}

# Logout
mutation {
  logout(input: {
    refreshToken: "your-refresh-token"
  }) {
    message
  }
}
```

## 🏗️ Architecture

```
src/
├── auth/                 # Authentication module
│   ├── guards/          # JWT authentication guards
│   ├── services/        # Auth business logic
│   └── graphql/         # GraphQL resolvers and types
├── config/              # Configuration management
├── database/            # Database connection
├── services/            # Shared services (Redis, Security)
└── users/               # User management
```

## 🔍 Monitoring & Logging

The service includes comprehensive security logging:

- Failed login attempts
- Successful logins
- Token revocations
- Rate limit violations
- Suspicious activities

All security events are logged with IP addresses, user agents, and timestamps.

## 🚨 Security Incident Response

If you discover a security vulnerability:

1. **Do not** create a public issue
2. **Do** contact the security team immediately
3. **Do** follow responsible disclosure practices
4. **Do** document the incident and response

## 📄 License

[Your License Here]

## 🤝 Contributing

Please read our security guidelines before contributing. All code changes must pass security review.
