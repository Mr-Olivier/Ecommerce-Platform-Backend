// src/docs/swagger.ts
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import path from "path";

// Import components and paths
const schemas = require("./components/schemas.json");
const responses = require("./components/responses.json");
const security = require("./components/security.json");
const authPaths = require("./paths/auth.json");

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-commerce API Documentation",
      version: "1.0.0",
      description: "API documentation for E-commerce platform",
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
        description: "Authentication endpoints",
      },
    ],
    components: {
      schemas,
      responses,
      securitySchemes: security,
    },
    paths: {
      ...authPaths, // Include auth paths explicitly
    },
  },
  apis: [], // We're not using file scanning since we're importing directly
};

export const setupSwagger = (app: Express): void => {
  const swaggerSpec = swaggerJsdoc(swaggerOptions);

  const options: swaggerUi.SwaggerUiOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      tryItOutEnabled: true,
      docExpansion: "list",
      filter: true,
    },
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "E-commerce API Documentation",
  };

  // Log available paths for debugging
  console.log("Available API paths:", Object.keys(swaggerSpec.paths || {}));

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, options));

  app.get("/docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
};
