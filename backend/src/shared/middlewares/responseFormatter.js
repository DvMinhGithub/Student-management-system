const DEFAULT_SUCCESS_MESSAGE = "Success";
const DEFAULT_ERROR_MESSAGE = "Request failed";

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const unwrapSuccessData = (payloadObject) => {
  const { message, ...rest } = payloadObject;
  const keys = Object.keys(rest);

  if (keys.length === 0) return null;
  if (keys.length === 1 && hasOwn(rest, "data")) return rest.data;
  return rest;
};

const unwrapErrorData = (payloadObject) => {
  const errors =
    payloadObject.errors ??
    payloadObject.error ??
    payloadObject.details ??
    payloadObject.detail ??
    null;

  if (errors) return errors;

  const { message, status, statusCode, ...rest } = payloadObject;
  return Object.keys(rest).length > 0 ? rest : null;
};

const normalizeMessage = (payloadObject, success) => {
  if (isPlainObject(payloadObject) && typeof payloadObject.message === "string") {
    return payloadObject.message;
  }
  if (typeof payloadObject === "string") return payloadObject;
  return success ? DEFAULT_SUCCESS_MESSAGE : DEFAULT_ERROR_MESSAGE;
};

const shouldSkipFormatting = (body) =>
  isPlainObject(body) &&
  body.__raw === true &&
  hasOwn(body, "payload");

const responseFormatter = () => (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = (body) => {
    if (shouldSkipFormatting(body)) {
      return originalJson(body.payload);
    }

    const statusCode = res.statusCode || 200;
    const success = statusCode < 400;
    const payloadObject = isPlainObject(body) ? body : {};
    const message = normalizeMessage(body, success);

    const response = {
      success,
      statusCode,
      message,
      data: success
        ? isPlainObject(body)
          ? unwrapSuccessData(payloadObject)
          : body ?? null
        : null,
      errors: success
        ? null
        : isPlainObject(body)
          ? unwrapErrorData(payloadObject)
          : body ?? null,
    };

    return originalJson(response);
  };

  next();
};

module.exports = responseFormatter;
