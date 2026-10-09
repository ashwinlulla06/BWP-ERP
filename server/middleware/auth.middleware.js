const jwt = require("jsonwebtoken");

function authenticationRequired(request, response, next) {
  const authorization = request.get("authorization") || "";
  const match = authorization.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return response.status(401).json({
      success: false,
      data: null,
      message: "A valid Bearer token is required.",
    });
  }

  try {
    const payload = jwt.verify(match[1], process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    const userId = Number(payload.sub);
    if (!Number.isInteger(userId) || userId < 1) {
      throw new Error("Invalid token subject");
    }

    request.auth = { userId };
    return next();
  } catch {
    return response.status(401).json({
      success: false,
      data: null,
      message: "The authentication token is invalid or expired.",
    });
  }
}

module.exports = authenticationRequired;
