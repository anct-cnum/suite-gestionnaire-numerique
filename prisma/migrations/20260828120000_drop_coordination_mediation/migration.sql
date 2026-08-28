-- Miroir de la migration Flyway dataspace V157 (2026-08-28, SEPT #1707) :
-- suppression de main.coordination_mediation (réplique de
-- coop.mediateurs_coordonnes, plus aucun consommateur) et de la RPC
-- api.get_mediateur (son unique lecteur, plus aucun client depuis que la coop
-- lit main directement). Cette migration ne sert qu'aux bases locales / de
-- test (MIN ne migre plus le schéma main en prod) ; IF EXISTS pour rester
-- rejouable une fois le snapshot dataspace_integration régénéré.
DROP FUNCTION IF EXISTS api.get_mediateur(text);
DROP TABLE IF EXISTS main.coordination_mediation CASCADE;
ALTER TABLE IF EXISTS staging.coop__utilisateurs DROP COLUMN IF EXISTS coordination_mediation;
