// Package express
const express = require("express");
// Création router
const router = express.Router();
// Import du fichier sauce depuis le dossier controllers
const sauceCtrl = require("../controllers/sauce");
// Import du fichier auth depuis le dossier middleware pour d'authentifier
const auth = require("../middleware/auth");
// Import du fichier multer-config depuis le dossier middleware pour définir destination et le non de fichiers images
const multer = require("../middleware/multer-config");

// les Routes
router.get("/", auth, sauceCtrl.getAllSauces);
router.get("/:id", auth, sauceCtrl.getOneSauce);
router.post("/", auth, multer, sauceCtrl.createSauce);
router.put("/:id", auth, multer, sauceCtrl.modifySauce);
router.delete("/:id", auth, sauceCtrl.deleteSauce);
router.post("/:id/like", auth, sauceCtrl.likeOrDislike);

// Export du router
module.exports = router;