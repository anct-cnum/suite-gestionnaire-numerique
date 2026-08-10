-- Refacto des références éditeur qui pointaient sur min.utilisateur.sso_id
-- (identifiant externe ProConnect, instable selon le fournisseur d'identité)
-- vers la clé interne min.utilisateur.id (#1689).
-- Miroir de la migration Flyway du dataspace :
--   V141_20260807__convertir_editeurs_vers_utilisateur_id

-- 1. min.gouvernance.editeur_note_privee_id (nullable, ON DELETE SET NULL)
ALTER TABLE min.gouvernance ADD COLUMN editeur_note_privee_id_new INTEGER;
UPDATE min.gouvernance g
SET editeur_note_privee_id_new = u.id
FROM min.utilisateur u
WHERE u.sso_id = g.editeur_note_privee_id;
ALTER TABLE min.gouvernance DROP CONSTRAINT gouvernance_editeur_note_privee_id_fkey;
ALTER TABLE min.gouvernance DROP COLUMN editeur_note_privee_id;
ALTER TABLE min.gouvernance RENAME COLUMN editeur_note_privee_id_new TO editeur_note_privee_id;
ALTER TABLE min.gouvernance ADD CONSTRAINT gouvernance_editeur_note_privee_id_fkey
    FOREIGN KEY (editeur_note_privee_id) REFERENCES min.utilisateur(id) ON UPDATE CASCADE ON DELETE SET NULL;

-- 2. min.gouvernance.editeur_note_de_contexte_id (nullable, ON DELETE SET NULL)
ALTER TABLE min.gouvernance ADD COLUMN editeur_note_de_contexte_id_new INTEGER;
UPDATE min.gouvernance g
SET editeur_note_de_contexte_id_new = u.id
FROM min.utilisateur u
WHERE u.sso_id = g.editeur_note_de_contexte_id;
ALTER TABLE min.gouvernance DROP CONSTRAINT gouvernance_editeur_note_de_contexte_id_fkey;
ALTER TABLE min.gouvernance DROP COLUMN editeur_note_de_contexte_id;
ALTER TABLE min.gouvernance RENAME COLUMN editeur_note_de_contexte_id_new TO editeur_note_de_contexte_id;
ALTER TABLE min.gouvernance ADD CONSTRAINT gouvernance_editeur_note_de_contexte_id_fkey
    FOREIGN KEY (editeur_note_de_contexte_id) REFERENCES min.utilisateur(id) ON UPDATE CASCADE ON DELETE SET NULL;

-- 3. min.comite.editeur_utilisateur_id (NOT NULL, ON DELETE RESTRICT)
ALTER TABLE min.comite ADD COLUMN editeur_utilisateur_id_new INTEGER;
UPDATE min.comite c
SET editeur_utilisateur_id_new = u.id
FROM min.utilisateur u
WHERE u.sso_id = c.editeur_utilisateur_id;
ALTER TABLE min.comite DROP CONSTRAINT comite_editeur_utilisateur_id_fkey;
ALTER TABLE min.comite DROP COLUMN editeur_utilisateur_id;
ALTER TABLE min.comite RENAME COLUMN editeur_utilisateur_id_new TO editeur_utilisateur_id;
-- Garde-fou : échoue si une ligne n'a pas été backfillée (impossible en pratique, la FK d'origine garantit la jointure)
ALTER TABLE min.comite ALTER COLUMN editeur_utilisateur_id SET NOT NULL;
ALTER TABLE min.comite ADD CONSTRAINT comite_editeur_utilisateur_id_fkey
    FOREIGN KEY (editeur_utilisateur_id) REFERENCES min.utilisateur(id) ON UPDATE CASCADE ON DELETE RESTRICT;

-- 4. min.feuille_de_route.editeur_utilisateur_id (nullable, ON DELETE SET NULL)
ALTER TABLE min.feuille_de_route ADD COLUMN editeur_utilisateur_id_new INTEGER;
UPDATE min.feuille_de_route f
SET editeur_utilisateur_id_new = u.id
FROM min.utilisateur u
WHERE u.sso_id = f.editeur_utilisateur_id;
ALTER TABLE min.feuille_de_route DROP CONSTRAINT feuille_de_route_editeur_utilisateur_id_fkey;
ALTER TABLE min.feuille_de_route DROP COLUMN editeur_utilisateur_id;
ALTER TABLE min.feuille_de_route RENAME COLUMN editeur_utilisateur_id_new TO editeur_utilisateur_id;
ALTER TABLE min.feuille_de_route ADD CONSTRAINT feuille_de_route_editeur_utilisateur_id_fkey
    FOREIGN KEY (editeur_utilisateur_id) REFERENCES min.utilisateur(id) ON UPDATE CASCADE ON DELETE SET NULL;
