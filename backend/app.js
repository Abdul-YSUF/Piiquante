// Importation express, helmet et mongoose
const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
// Donne accés au chemin du système de fichiers
const path = require("path");
// Stockage variables d'environnement
require("dotenv").config();
// Importation sauceRoutes et userRoutes
const sauceRoutes = require("./routes/sauce");
const userRoutes = require("./routes/user");

// Connexion à la bdd avec mongoose
mongoose.set("strictQuery", true);
mongoose.connect(process.env.mongodbConnection, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

// Créer application express
const app = express();
// Parse application/json
app.use(express.json());
// Headers pour éviter les erreurs de CORS
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

// Enregistrement des routeurs
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/api/sauces", sauceRoutes);
app.use("/api/auth", userRoutes);

// Export de l'application
module.exports = app;