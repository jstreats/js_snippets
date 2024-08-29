const { check, validationResult } = require('express-validator');

app.post('/your-route', [
  // Validate PostgreSQL BIGINT
  check('yourFieldName')
    .isInt({ min: -9223372036854775808, max: 9223372036854775807 })
    .withMessage('The input must be a valid PostgreSQL BIGINT'),

  // Validate month_year in yyyy-mm-dd format
  check('month_year')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('month_year must be in the format yyyy-mm-dd'),

  // Validate year in yyyy format
  check('year')
    .matches(/^\d{4}$/)
    .withMessage('year must be in the format yyyy')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Your logic here if validation passed
});