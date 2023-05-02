// Package mongoose
const mongoose = require("mongoose");
// Package vérification email unique
const uniqueValidator = require("mongoose-unique-validator");

// Création du model User pour un stockage dans la bdd
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// uniqueValidator pour éviter que plusieurs utilisateurs s'inscrivent avec le même email
userSchema.plugin(uniqueValidator);

// Export mongoose
module.exports = mongoose.model("User", userSchema);