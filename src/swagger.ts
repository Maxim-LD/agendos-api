import { Express, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import fs from 'fs';
import path from 'path';
import { logger } from './utils/logger';
import { config } from './config';

/**
 * Setup Swagger UI documentation middleware
 * Serves OpenAPI documentation at /docs endpoint
 * Also provides raw spec endpoints: /docs.json and /docs.yaml
 *
 * @param app Express application instance
 */
export const setupSwagger = (app: Express): void => {
  try {
    // Read the OpenAPI YAML file from project root
    const yamlFilePath = path.join(__dirname, '..', 'openapi.yaml');
    
    // Check if openapi.yaml file exists
    if (!fs.existsSync(yamlFilePath)) {
      logger.warn('OpenAPI specification file not found', {
        path: yamlFilePath
      });
      return;
    }

    // Read YAML file
    const yamlContent = fs.readFileSync(yamlFilePath, 'utf8');
    
    // Parse YAML to JSON
    const swaggerDocument = YAML.parse(yamlContent);

    // Serve Swagger UI at /docs
    app.use(
      '/docs',
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument, {
        swaggerOptions: {
          persistAuthorization: true,
          displayOperationId: true,
        },
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Agendos API Docs',
      })
    );

    // Serve the raw OpenAPI spec as JSON
    app.get('/docs.json', (_req: Request, res: Response): void => {
      res.setHeader('Content-Type', 'application/json');
      res.json(swaggerDocument);
    });

    // Serve the raw OpenAPI spec as YAML
    app.get('/docs.yaml', (_req: Request, res: Response): void => {
      res.setHeader('Content-Type', 'application/yaml; charset=utf-8');
      res.send(yamlContent);
    });

    const docsUrl = `http://localhost:${config.port}/docs`;
    logger.info('Swagger documentation initialized', {
      url: docsUrl,
      jsonUrl: `http://localhost:${config.port}/docs.json`,
      yamlUrl: `http://localhost:${config.port}/docs.yaml`
    });
  } catch (error) {
    logger.error('Failed to setup Swagger documentation', {
      error: error instanceof Error ? error.stack : String(error)
    });
  }
};
