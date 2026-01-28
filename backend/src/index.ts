import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { requestLogger, error, ErrorCodes, RequestWithId } from './utils/index.js';

// Initialize Express app
const app = express();

// ============================================
// Middleware Stack
// ============================================

// Request logging (adds request ID and logs requests)
app.use(requestLogger);

// CORS for local dev frontend
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// API Routes
// ============================================

// Mount all API routes under /api
app.use('/api', apiRouter);

// ============================================
// Error Handling
// ============================================

// 404 handler
app.use((req, res) => {
  const requestId = (req as RequestWithId).requestId;
  error(
    res,
    ErrorCodes.NOT_FOUND,
    'The requested resource was not found',
    404,
    { path: req.path },
    requestId
  );
});

// Global error handler
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    const requestId = (req as RequestWithId).requestId;
    console.error(`[${requestId}] Error:`, err);

    // Handle multer errors
    if (err.name === 'MulterError') {
      error(
        res,
        ErrorCodes.BAD_REQUEST,
        err.message,
        400,
        { type: 'file_upload_error' },
        requestId
      );
      return;
    }

    // Handle validation errors
    if (err.message.includes('Invalid file type')) {
      error(
        res,
        ErrorCodes.VALIDATION_ERROR,
        err.message,
        400,
        { type: 'invalid_file_type' },
        requestId
      );
      return;
    }

    // Generic server error
    error(
      res,
      ErrorCodes.INTERNAL_ERROR,
      config.isDev ? err.message : 'An unexpected error occurred',
      500,
      config.isDev ? { stack: err.stack } : undefined,
      requestId
    );
  }
);

// ============================================
// Start Server
// ============================================

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
