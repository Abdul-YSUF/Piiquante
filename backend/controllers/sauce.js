// Import du fichier sauce depuis le dossier models
const Sauce = require("../models/Sauce");
// Package file system
const fs = require("fs");

// Lecture de toutes les sauces dans la bdd (GET)
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(404).json({ error }));
};

// Lecture d'une sauce avec son ID (GET)
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

// Création d'une nouvelle sauce (POST)
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject.id;
  delete sauceObject.userId;
  // Création nouvel objet sauce avec le model sauce
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    // Url de l'image enregistrée dans le dossier images backend et aussi dans la bdd
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
  });
  // Enregistrement de l'objet sauce dans la bdd
  sauce.save()
    .then(() => res.status(201).json({ message: "Sauce enregistrée" }))
    .catch((error) => res.status(400).json({ error }));
};

// Mise à jour de la modification d'une sauce (PUT)
exports.modifySauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      // Vérification si utilisateur a le droit de modifier l'image
      if (sauce.userId != req.auth.userId && req.file) {
        fs.unlink(`images/${req.file.filename}`, () => {
          res.status(401).json({ error: "Requête non autorisée" });
        }); // Vérification si utilisateur a le droit de modifier les textes
      } else if (sauce.userId !== req.auth.userId) {
        res.status(401).json({ error: "Requête non autorisée" });
      } else {
        // Si utilisateur a le droit de modifier l'image et les textes
        if (req.file) {
          // Annule et remplace image précédente et les textes précédents
          const filename = sauce.imageUrl.split("/images/")[1];
          fs.unlink(`images/${filename}`, () => {
            const sauceObject = {
              ...JSON.parse(req.body.sauce),
              imageUrl: `${req.protocol}://${req.get("host")}/images/${
                req.file.filename
              }`,
            };
            delete sauceObject.userId;
            Sauce.updateOne(
              { _id: req.params.id },
              { ...sauceObject, _id: req.params.id }
            )
              .then(() => res.status(200).json({ message: "Sauce modifiée!" }))
              .catch((error) => res.status(401).json({ error }));
          });
        } else { // Modification texte uniquement
          const sauceObject = { ...req.body };
          delete sauceObject.userId;
          Sauce.updateOne(
            { _id: req.params.id },
            { ...sauceObject, _id: req.params.id }
          )
            .then(() => res.status(200).json({ message: "Sauce modifiée!" }))
            .catch((error) => res.status(401).json({ error }));
        }
      }
    })
    .catch((error) => { // En cas d'erreur on supprime l'image
      if (req.file) {
        fs.unlink(`images/${req.file.filename}`, () => {});
      }
      res.status(400).json({ error });
    });
};

// Suppression d'une sauce (DELETE)
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      // Vérification utilisateur a le droit de supprimer ou non
      if (sauce.userId !== req.auth.userId) {
        res.status(401).json({ error: "Requête non autorisée" });
      } else {
        // Récupération du nom du fichier
        const filename = sauce.imageUrl.split("/images/")[1];
        // Supprime l'image
        fs.unlink(`images/${filename}`, () => {
          // Supprime la sauce dans la bdd  et l'image
          Sauce.deleteOne({ _id: req.params.id }, { ...req.body.imageUrl })
            .then(() => res.status(200).json({ message: "Sauce supprimée" }))
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

// Like ou Dislike
exports.likeOrDislike = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      // Si l'utilisateur like la sauce
      if (!sauce.usersLiked.includes(req.auth.userId) && !sauce.usersDisliked.includes(req.auth.userId) && req.body.like === 1
      ) {
        // Ajouter 1 like et Envoie dans le tableau usersLiked
        Sauce.updateOne(
          { _id: req.params.id },
          { $inc: { likes: 1 }, $push: { usersLiked: req.auth.userId } }
        )
          .then(() => res.status(200).json({ message: "Like ajouté" }))
          .catch((error) => res.status(400).json({ error }));
      }
      // Enlève un like du tableau userLiked
      else if (sauce.usersLiked.includes(req.auth.userId) && req.body.like === 0
      ) {
        Sauce.updateOne(
          { _id: req.params.id },
          { $inc: { likes: -1 }, $pull: { usersLiked: req.auth.userId } }
        )
          .then(() => {
            res.status(200).json({ message: "Like supprimé !" });
          })
          .catch((error) => res.status(400).json({ error }));
      }
      // Si l'utilisateur dislike la sauce
      else if (!sauce.usersDisliked.includes(req.auth.userId) && !sauce.usersLiked.includes(req.auth.userId) && req.body.like === -1
      ) {
        // Ajouter 1 dislike et Envoie dans le tableau usersDisliked
        Sauce.updateOne(
          { _id: req.params.id },
          { $inc: { dislikes: 1 }, $push: { usersDisliked: req.auth.userId } }
        )
          .then(() => res.status(200).json({ message: "Dislike ajouté !" }))
          .catch((error) => res.status(400).json({ error }));
      }
      // Enlève un dislike du tableau userDisliked
      else if (sauce.usersDisliked.includes(req.auth.userId) && req.body.like === 0
      ) {
        Sauce.updateOne(
          { _id: req.params.id },
          { $inc: { dislikes: -1 }, $pull: { usersDisliked: req.auth.userId } }
        )
          .then(() => {
            res.status(200).json({ message: "Dislike supprimé !" });
          })
          .catch((error) => res.status(400).json({ error }));
      }
      // Vérifier que l'utilisateur ne peut faire la même action
      else if ( sauce.usersLiked.includes(req.auth.userId) && req.body.like === 1
      ) {
        res.status(400).json({error: "Utilisateur ne peut pas liker plusieurs fois la même sauce",
        });
      } else if (sauce.usersDisliked.includes(req.auth.userId) && req.body.like === -1
      ) {
        res.status(400).json({error: "Utilisateur ne peut pas disliker plusieurs fois la même sauce",
        });
      } else {
        res.status(400).json({ error: "Action non autorisée" });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};
