const Ajv = require('ajv');

const ajv = new Ajv({ allErrors: true });

function validateBody(schema) {
  const validate = ajv.compile(schema);

  return (req, res, next) => {
    const valid = validate(req.body);

    if (!valid) {
      return res.status(400).json({
        success: false,
        error: 'validation_error',
        details: validate.errors
      });
    }

    return next();
  };
}

module.exports = {
  validateBody
};
