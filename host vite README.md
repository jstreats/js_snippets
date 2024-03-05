const\s+(.+?)\s+=\s+require\('(.+?)'\)
import $1 from '$2';

module\.exports\s+=\s+(.+)
export default $1


import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve Vite's public assets in development mode
if (process.env.NODE_ENV === 'development') {
  const vite = await import('vite').then(({ default: vite }) => vite);
  app.use(vite.middlewares);
} else {
  // Serve Vite's built frontend in production mode
  const distPath = path.join(__dirname, 'my-vite-app', 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

VITE_API_KEY=your_api_key
PORT=3000
NODE_ENV=production


module.exports = {
  apps: [
    {
      name: 'vite-frontend',
      script: 'npm', // Assuming 'npm run serve' starts the Vite development server
      args: 'run serve',
      cwd: './my-vite-app', // Path to your Vite project directory
      watch: true, // Watch for file changes in development
      instance_var: 'INSTANCE_ID', // Optional unique instance identifier
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'express-backend',
      script: './server.js',
      cwd: './', // Root directory with the Express server
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};