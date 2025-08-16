// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const notificationRoutes = require('./routes/notificationRoutes');
const promClient = require('prom-client');
const register = promClient.register;
promClient.collectDefaultMetrics({ register });

const app = express();
const PORT = process.env.PORT || 4003;

app.use(express.json());

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