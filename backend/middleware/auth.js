// Package json web token
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    // Récupèration token de la requête entrante
    const token = req.headers.authorization.split(" ")[1];
    // Vérification token
    const decodedToken = jwt.verify(token, process.env.jwtRts);
    // Récupèration l'id du token
    const userId = decodedToken.userId;
    // Comparaison id user de la requête avec le token
    req.auth = {
      userId: userId,
    };
    next();
  } catch (error) {
    res.status(401).json({ error: error | "Requête non authentifiée !" });
  }
};