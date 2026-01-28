import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { healthRouter } from './routes/health.js';

// Initialize Express app
const app = express();

// Middleware
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/health', healthRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
  });
});

// Error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error('Error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: config.isDev ? err.message : 'An unexpected error occurred',
    });
  }
);

// Start server
app.listen(config.port, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║          OP Maker Backend Server               ║
╠════════════════════════════════════════════════╣
║  🚀 Server running on port ${config.port}               ║
║  📦 Environment: ${config.isDev ? 'development' : 'production'}               ║
║  🔗 API: http://localhost:${config.port}/api            ║
╚════════════════════════════════════════════════╝
  `);
});

export default app;
