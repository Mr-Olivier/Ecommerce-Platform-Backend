// src/docs/swagger.ts
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

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
    components: {
      schemas: require("./components/schemas.json"),
      responses: require("./components/responses.json"),
      parameters: require("./components/parameters.json"),
      securitySchemes: require("./components/security.json"),
    },
    paths: require("./paths/auth.json"),
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export const setupSwagger = (app: Express): void => {
  // Swagger UI options
  const options: swaggerUi.SwaggerUiOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      tryItOutEnabled: true,
    },
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "E-commerce API Documentation",
  };

  // Log available paths for debugging
  const paths = (swaggerSpec as any).paths;
  if (paths) {
    console.log("Available API paths:", Object.keys(paths));
  }

  // Serve Swagger UI
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, options));

  // Serve Swagger spec as JSON
  app.get("/docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
};
