import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import path from "path";

// Import components and paths
const schemas = require("./components/schemas.json");
const responses = require("./components/responses.json");
const security = require("./components/security.json");
const authPaths = require("./paths/auth.json");
const adminPaths = require("./paths/admin.json");

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-commerce API Documentation",
      version: "1.0.0",
      description: `
        API documentation for E-commerce platform.
        
        ## Authentication
        - JWT-based authentication
        - Role-based access control (Admin/Customer)
        - Email verification
        - Multi-factor authentication (MFA)
        
        ## Admin Features
        - User management
        - Role management
        - Activity monitoring
        - Security controls
      `,
    },
    servers: [
      {
        url: "/",
        description: "Development server",
      },
    ],
    tags: [
      {
        name: "Authentication",
        description: "User authentication and authorization endpoints",
      },
      {
        name: "Profile",
        description: "User profile management endpoints",
      },
      {
        name: "Admin",
        description: "Admin-only endpoints for user management and monitoring",
      },
      {
        name: "Sessions",
        description: "Session management and security endpoints",
      },
    ],
    components: {
      schemas,
      responses,
      securitySchemes: security,
    },
    paths: {
      ...authPaths,
      ...adminPaths,
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [], // We're not using file scanning since we're importing directly
};

interface SwaggerSpec {
  paths?: Record<string, any>;
  tags?: Array<{ name: string }>;
}

export const setupSwagger = (app: Express): void => {
  const swaggerSpec = swaggerJsdoc(swaggerOptions) as SwaggerSpec;

  const options: swaggerUi.SwaggerUiOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: "list",
      filter: true,
      displayRequestDuration: true,
    },
    customSiteTitle: "E-commerce API Documentation",
  };

  // Log available paths and tags for debugging
  const paths = Object.keys(swaggerSpec.paths ?? {});
  const tags = swaggerSpec.tags?.map((tag: { name: string }) => tag.name) || [];

  console.log("Available API paths:", paths);
  console.log("API Tags:", tags);

  // Serve Swagger UI
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, options));

  // Serve Swagger spec as JSON
  app.get("/docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  // Serve OpenAPI spec as YAML (optional, for tools that prefer YAML)
  app.get("/docs.yaml", (req, res) => {
    const YAML = require("yamljs");
    res.setHeader("Content-Type", "text/yaml");
    res.send(YAML.stringify(swaggerSpec, 10));
  });
};
