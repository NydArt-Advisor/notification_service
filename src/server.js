// Load environment variables from .env file
require('dotenv').config();
const cors = require('cors');

const express = require('express');
const notificationRoutes = require('./routes/notificationRoutes');
const promClient = require('prom-client');
const register = promClient.register;
promClient.collectDefaultMetrics({ register });

const app = express();
const PORT = process.env.PORT || 4003;

// Trust proxy configuration for rate limiting behind load balancers/proxies
app.set('trust proxy', 1);

app.use(express.json());

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        const allowedOrigins = [
            process.env.FRONTEND_URL,
            process.env.CLIENT_URL,
            // Add both Vercel domains
            'https://nydartadvisor-p3gw0m3og-darylnyds-projects.vercel.app',
            'https://nydartadvisor.vercel.app',
            'https://nydartadvisor-git-main-darylnyds-projects.vercel.app',
            // Add any other Vercel preview domains
            /^https:\/\/nydartadvisor.*\.vercel\.app$/,
        ];
        
        // Check if origin matches any allowed origins
        const isAllowed = allowedOrigins.some(allowedOrigin => {
            if (typeof allowedOrigin === 'string') {
                return origin === allowedOrigin;
            } else if (allowedOrigin instanceof RegExp) {
                return allowedOrigin.test(origin);
            }
            return false;
        });
        
        if (isAllowed) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            // For development, allow all origins
            if (process.env.NODE_ENV === 'development') {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Access-Control-Request-Method', 'Access-Control-Request-Headers'],
    exposedHeaders: ['Content-Length', 'X-Requested-With'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

app.get("/", (req, res) => {
  res.send("Notification Service is running");
});

// Use notification routes
app.use('/', notificationRoutes);

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.listen(PORT, () => {
  console.log(`Notification service running on port ${PORT}`);
}); 