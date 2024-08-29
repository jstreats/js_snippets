To integrate Swagger documentation into your Node.js Express app, with routes defined in separate files, follow these steps:

### Step 1: Install Dependencies

You'll need to install `swagger-jsdoc` and `swagger-ui-express`:

```bash
npm install swagger-jsdoc swagger-ui-express
```

### Step 2: Set Up Swagger in Your Main `app.js` or `index.js` File

Add the following to your `app.js` or `index.js`:

```javascript
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Your API Title',
    version: '1.0.0',
    description: 'Your API description',
  },
  servers: [
    {
      url: 'http://localhost:3000', // Change this to your server's URL
      description: 'Development server',
    },
  ],
};

// Options for the swagger docs
const options = {
  swaggerDefinition,
  apis: ['./routes/*.js'], // Path to the API docs
};

// Initialize swagger-jsdoc -> returns validated swagger spec in json format
const swaggerSpec = swaggerJsdoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
const routes = require('./routes'); // Assuming you have a routes/index.js file
app.use('/api', routes);

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
```

### Step 3: Add Swagger Comments to Your Route Files

In your `routes/` directory, you can document your APIs directly in the route files using JSDoc comments.

For example, in `routes/users.js`:

```javascript
const express = require('express');
const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the user
 *         name:
 *           type: string
 *           description: The user's name
 *         email:
 *           type: string
 *           description: The user's email
 *       example:
 *         id: d5fE_asz
 *         name: John Doe
 *         email: johndoe@example.com
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Returns the list of all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: The list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/', (req, res) => {
  res.send([
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Doe', email: 'jane@example.com' },
  ]);
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get the user by id
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id
 *     responses:
 *       200:
 *         description: The user description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: The user was not found
 */
router.get('/:id', (req, res) => {
  const user = { id: req.params.id, name: 'John Doe', email: 'john@example.com' };
  res.send(user);
});

module.exports = router;
```

### Step 4: Access Swagger UI

After setting up your app, you can access the Swagger documentation by visiting `http://localhost:3000/api-docs` in your browser.

### Additional Tips

- **Folder Structure**: Organize your routes and controllers to keep your codebase clean. For example, you could have `routes/`, `controllers/`, and `models/` directories.
- **Modular Swagger Docs**: If your project grows, consider breaking the Swagger configuration into modular files, especially if you're using multiple controllers.

This setup will allow you to easily document new APIs by adding JSDoc comments directly in the route files.