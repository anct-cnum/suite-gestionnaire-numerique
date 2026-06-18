-- Ajouter le flag is_beta_testeur sur l'utilisateur
-- Réservé à un nombre restreint d'utilisateurs (dév / support avancé) pour ouvrir l'accès à des fonctionnalités en cours

ALTER TABLE "min"."utilisateur" ADD COLUMN "is_beta_testeur" BOOLEAN NOT NULL DEFAULT false;
