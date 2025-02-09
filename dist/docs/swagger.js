"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = void 0;
// src/docs/swagger.ts
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swaggerOptions = {
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
const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
const setupSwagger = (app) => {
    // Swagger UI options
    const options = {
        swaggerOptions: {
            persistAuthorization: true,
            tryItOutEnabled: true,
        },
        customCss: ".swagger-ui .topbar { display: none }",
        customSiteTitle: "E-commerce API Documentation",
    };
    // Log available paths for debugging
    const paths = swaggerSpec.paths;
    if (paths) {
        console.log("Available API paths:", Object.keys(paths));
    }
    // Serve Swagger UI
    app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec, options));
    // Serve Swagger spec as JSON
    app.get("/docs.json", (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });
};
exports.setupSwagger = setupSwagger;
