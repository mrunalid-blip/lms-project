const swaggerJsdoc = require('swagger-jsdoc');

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LMS Content Service',
      version: '1.0.0',
      description: 'LMS Backend APIs'
    },

    tags: [
      { name: 'Health', description: 'System health monitoring and status' },
      { name: 'Public', description: 'Public endpoints (Authentication required)' },
      { name: 'Auth', description: 'Authentication APIs' },
      { name: 'Courses', description: 'Course APIs' },
      { name: 'Videos', description: 'Video APIs' },
      { name: 'Progress', description: 'Progress tracking APIs' },
      { name: 'Notes', description: 'Notes APIs' },
      { name: 'Bookmarks', description: 'Bookmarks APIs' },
      { name: 'Admin - Rate Limiting', description: 'Admin IP & rate limit APIs' }
    ],

    servers: [{ url: '/' }],

    // ✅ ADD THIS BLOCK
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },

  apis: ['./routes/*.js']
});

module.exports = swaggerSpec;


