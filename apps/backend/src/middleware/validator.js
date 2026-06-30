function validate(schema, source = 'body') {
  return (req, res, next) => {
    const parsed = schema.safeParse(req[source]);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Input parameter validation failed.',
          details: parsed.error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        }
      });
    }
    // Replace with validated, parsed, and casted data (handles string -> integer conversion)
    req[source] = parsed.data;
    next();
  };
}

module.exports = validate;
