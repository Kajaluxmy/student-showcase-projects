const app = require('./app');
const env = require('./config/env');
const { testConnection } = require('./config/db');
const initializeDatabase = require('./config/initDb');
const registerListeners = require('./events/listeners');

async function startServer() {
  try {
    console.log('🚀 Starting Student Project Showcase Portal Backend Server...');

    // 1. Verify Database Connection Connectivity
    if (env.MOCK_DATABASE) {
      console.log('⚠️  [Mock DB Active] Bypassing MySQL connectivity checks. Running in-memory.');
    } else {
      const dbConnected = await testConnection();
      if (!dbConnected) {
        console.error('❌ Critical: Database offline. Halting startup.');
        process.exit(1);
      }
      
      // 2. Initialize Database Schemas and Tables
      await initializeDatabase();
    }

    // 3. Register Asynchronous Event Listeners
    registerListeners();

    // 4. Bind and listen on port
    const server = app.listen(env.PORT, () => {
      console.log(`🌐 Server running in ${env.NODE_ENV} mode on port: ${env.PORT}`);
    });

    // Graceful Shutdown Handler
    const handleShutdown = (signal) => {
      console.log(`\n🛑 Received ${signal}. Shutting down server gracefully...`);
      server.close(() => {
        console.log('🔌 HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
// Trigger nodemon reload for upload and fallback changes
