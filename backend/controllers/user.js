// Package chiffrement
const bcrypt = require("bcrypt");
// Package json web token
const jwt = require("jsonwebtoken");
// Import du fichier user depuis le dossier models
const User = require("../models/User");

// Fonction SIGN UP pour l'utilisateur
exports.signup = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then((hash) => {
      // Création nouvelle utlilisateur
      const user = new User({
        email: req.body.email, // Adresse mail
        password: hash, // Mot de passe
      });
      user.save() // Stockage mongoose dans la bdd
        .then(() => res.status(201).json({ message: "Utilisateur crée." }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};

// Fonction Login pour l'utilisateur
exports.login = (req, res, next) => {
  // Vérification mail dans la bdd
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) { return res.status(401).json({ error: "Identifiant incorrecte." });
      }
      // Comparaison Mot de passe
      bcrypt.compare(req.body.password, user.password)
        .then((valid) => {
          if (!valid) { return res.status(401).json({ error: "Mot de passe incorrecte." });
          }
          // Génèration token de session pour l'utilisateur connecté
          const newToken = jwt.sign({ userId: user._id }, process.env.jwtRts, { expiresIn: "24h" });
          res.status(200).json({
            userId: user._id,
            token: newToken,
          });
        })
        .catch((error) => res.status(500).json({ error }));
    })
    .catch((error) => res.status(500).json({ error }));
};