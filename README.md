# E-commerce Backend API

A robust and scalable e-commerce backend built with Express.js, TypeScript, and PostgreSQL.

## 🚀 Features

- **Authentication & Authorization**

  - JWT-based authentication
  - Role-based access control (Admin/Customer)
  - Secure password hashing
  - Password change functionality

- **API Documentation**

  - Interactive Swagger documentation
  - Detailed API specifications
  - Request/Response examples

- **Database**

  - PostgreSQL with Prisma ORM
  - Type-safe database queries
  - Automated migrations
  - Data validation

- **Security**

  - CORS protection
  - Rate limiting
  - Input validation
  - XSS protection
  - Security headers

- **Development Tools**
  - TypeScript for type safety
  - Hot reloading
  - Code linting
  - Automated testing

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/ecommerce-backend.git
   cd ecommerce-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**

   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Application
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce_db"

# Authentication
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="24h"

# CORS
CORS_ORIGIN="http://localhost:3000"
```

## 📚 API Documentation

Once the server is running, access the Swagger documentation at:

```
http://localhost:5000/docs
```

### Key Endpoints

#### Authentication

- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login
- POST `/api/auth/change-password` - Change password (requires authentication)

## 🧪 Testing

Run tests using the following commands:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🛡️ Security

- All passwords are hashed using bcrypt
- JWT tokens for authentication
- Input validation using Zod
- Proper error handling and logging
- Security headers implementation
- Rate limiting on sensitive endpoints

## 💻 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Run Prisma Studio
npm run prisma:studio
```

### Project Structure

```
ecommerce-backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── docs/          # Swagger documentation
│   ├── middlewares/   # Express middlewares
│   ├── routes/        # API routes
│   ├── services/      # Business logic
│   ├── types/         # TypeScript types
│   ├── utils/         # Utility functions
│   ├── app.ts         # Express app setup
│   └── server.ts      # Server entry point
├── prisma/            # Prisma schema and migrations
├── tests/             # Test files
├── .env              # Environment variables
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## 📝 Code Style

- Use TypeScript features where possible
- Follow ESLint rules
- Write tests for new features
- Document new endpoints in Swagger
- Use meaningful commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work - [YourGithub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Express.js team
- Prisma team
- OpenAPI/Swagger team
- All contributors

## 📧 Support

For support, email your-email@example.com or open an issue in the repository.

---

Made with ❤️ by [Your Name](https://github.com/yourusername)
