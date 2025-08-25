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

# Auth Service

A NestJS-based authentication service with GraphQL API, MongoDB, Redis, and comprehensive logging.

## Features

- 🚀 NestJS with GraphQL
- 🗄️ MongoDB integration with Mongoose
- 🔴 Redis for caching and sessions
- 📝 Winston logging with daily rotation
- 🐳 Docker and Docker Compose support
- 🔍 Health check endpoints
- 🔧 Environment-based configuration

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- npm or yarn

## Quick Start with Docker

### 1. Clone and Setup

```bash
git clone <repository-url>
cd auth-service
cp env.example .env
# Edit .env file with your configuration
```

### 2. Start Services

```bash
# Development mode with hot reloading
docker-compose -f docker-compose.dev.yml up --build

# Production mode
docker-compose up --build
```

### 3. Access Services

- **Auth Service**: http://localhost:3000
- **GraphQL Playground**: http://localhost:3000/graphql
- **Health Check**: http://localhost:3000/health
- **MongoDB Express**: http://localhost:8081 (admin/password123)
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

## Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure it:

```bash
cp env.example .env
```

Edit `.env` with your local configuration.

### 3. Start Development Services

```bash
# Start only MongoDB and Redis
docker-compose -f docker-compose.dev.yml up mongo redis mongo-express

# Start the application locally
npm run start:dev
```

### 4. Run Tests

```bash
npm run test
npm run test:e2e
```

## Docker Commands

### Development

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up --build

# Start specific services
docker-compose -f docker-compose.dev.yml up mongo redis

# View logs
docker-compose -f docker-compose.dev.yml logs -f auth-service

# Stop services
docker-compose -f docker-compose.dev.yml down
```

### Production

```bash
# Start production environment
docker-compose up --build

# Scale services
docker-compose up --scale auth-service=3

# View logs
docker-compose logs -f auth-service

# Stop services
docker-compose down
```

## Database Management

### MongoDB

- **Connection String**: `mongodb://admin:password123@localhost:27017/auth-service`
- **Admin User**: admin/password123
- **Service User**: auth-service-user/auth-service-password

### Redis

- **Host**: localhost
- **Port**: 6379
- **Password**: (none by default)
- **Database**: 0

## Logging

The application uses Winston for logging with the following features:

- **Console Logging**: Colored, formatted logs for development
- **File Logging**: Daily rotated log files
- **Error Logging**: Separate error log files with stack traces
- **Log Rotation**: Automatic log rotation with compression

### Log Files

- `logs/combined-YYYY-MM-DD.log` - All application logs
- `logs/error-YYYY-MM-DD.log` - Error logs only

### Log Configuration

Logs are configured via environment variables:

- `LOG_LEVEL`: Log level (default: info)
- `LOG_MAX_FILES`: Maximum log files to keep (default: 14d)
- `LOG_MAX_SIZE`: Maximum log file size (default: 20m)

## Health Checks

The service provides health check endpoints:

- **GET /health**: Overall service health including MongoDB and Redis connections
- **Docker Health Check**: Built-in Docker health check for container orchestration

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | development |
| `PORT` | Service port | 3000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/auth-service |
| `REDIS_HOST` | Redis host | localhost |
| `REDIS_PORT` | Redis port | 6379 |
| `REDIS_PASSWORD` | Redis password | (empty) |
| `REDIS_DB` | Redis database | 0 |
| `LOG_LEVEL` | Log level | info |
| `LOG_MAX_FILES` | Max log files | 14d |
| `LOG_MAX_SIZE` | Max log size | 20m |

## Project Structure

```
auth-service/
├── src/
│   ├── config/          # Configuration files
│   ├── database/        # Database connection modules
│   ├── health/          # Health check endpoints
│   └── app.module.ts    # Main application module
├── logs/                # Application logs
├── mongo-init/          # MongoDB initialization scripts
├── docker-compose.yml   # Production Docker Compose
├── docker-compose.dev.yml # Development Docker Compose
├── Dockerfile           # Production Docker image
├── Dockerfile.dev       # Development Docker image
└── .dockerignore        # Docker build exclusions
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :3000
   # Kill the process or change the port in docker-compose.yml
   ```

2. **MongoDB Connection Failed**
   ```bash
   # Check MongoDB container status
   docker-compose ps mongo
   # View MongoDB logs
   docker-compose logs mongo
   ```

3. **Redis Connection Failed**
   ```bash
   # Check Redis container status
   docker-compose ps redis
   # View Redis logs
   docker-compose logs redis
   ```

4. **Permission Issues with Logs**
   ```bash
   # Fix log directory permissions
   sudo chown -R $USER:$USER logs/
   ```

### Reset Everything

```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Start fresh
docker-compose up --build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
