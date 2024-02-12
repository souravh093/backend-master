import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader === null || authHeader === undefined) {
      return res.json({
        status: 401,
        message: "Unauthorized",
      });
    }

    const token = authHeader.split(" ")[1];

    // * Verify the JWT token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(401).json({
          status: 401,
          message: "UnAuthorized",
        });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    console.log(`JWT error ${error}`);
    return res.status(500).json({
      status: 500,
      message: "Authorization error",
    });
  }
};

export default authMiddleware;
