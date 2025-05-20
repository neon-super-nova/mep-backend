import { verifyToken } from "../config/serverSessions/jwt.js";

export function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader)
    return res.status(401).json({ error: "Unauthorized: No token" });

  const token = authHeader.split(" ")[1];
  if (!token)
    return res.status(401).json({ error: "Unauthorized: Malformed token" });

  try {
    const decoded = verifyToken(token); // use your verify function

    req.user = {
      userId: decoded.userId, // assuming your token has userId
      username: decoded.username, // and username
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
}
