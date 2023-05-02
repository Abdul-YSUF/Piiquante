// Package express
const express = require("express");
const router = express.Router();
// Import du fichier user depuis le dossier controllers
const userCtrl = require("../controllers/user");

// Routes méthode post pour créer le compte ou connecter (demandé par frontend)
router.post("/signup", userCtrl.signup);
router.post("/login", userCtrl.login);

// Export du router
module.exports = router;