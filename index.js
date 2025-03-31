const app = require('./src/app');
const { initializeDatabase } = require('./src/utils/dbInit');
require('dotenv').config();

const port = process.env.PORT || 3000; // Note: Capitalized PORT for environment variable


// Database initialization and server startup
const startServer = async () => {
  try {
    // Initialize database first
    const dbInitialized = await initializeDatabase();
    
    if (!dbInitialized) {
      console.error('Failed to initialize database');
      process.exit(1);
    }
    
    console.log('Database initialized successfully');
    
    // Start server after database is ready
    const server = app.listen(port, () => {
      console.info(`Server running on port ${port}`);
    });
    
    // Define graceful shutdown logic
    const exitHandler = () => {
      if (server) {
        server.close(() => {
          console.info('Server closed');
          process.exit(1);
        });
      } else {
        process.exit(1);
      }
    };
    
    // Handle unexpected errors
    const unexpectedErrorHandler = (error) => {
      console.error('Unexpected error:', error);
      exitHandler();
    };
    
    // Register event handlers
    process.on('uncaughtException', unexpectedErrorHandler);
    process.on('unhandledRejection', unexpectedErrorHandler);
    process.on('SIGTERM', () => {
      console.info('SIGTERM received');
      if (server) {
        server.close(() => {
          console.info('Server closed');
          process.exit(0);
        });
      }
    });
    
    return server;
  } catch (error) {
    console.error('Startup error:', error);
    process.exit(1);
  }
};

// Start the server
startServer();