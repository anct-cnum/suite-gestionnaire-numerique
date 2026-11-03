-- Miroir de la migration Flyway dataspace V198 (2026-11-03, DS-ADR-004) :
-- valeurs dérivées « conseiller numérique » en vues de référence.
--
-- Ne sert qu'aux bases locales et de test : MIN ne migre plus le schéma main en
-- production, où ces vues sont créées par Flyway.
--
-- ⚠️ Gardes « si absente » : en local, la base peut être la base de dev du
-- dataspace, où V198 a déjà posé les VRAIES définitions. Elles ne doivent jamais
-- être écrasées par la version simplifiée ci-dessous.
--
-- main.conseiller_numerique_en_poste : définition identique à V198.
--
-- main.lieu_dispositifs : version de TEST, mêmes colonnes. La base de test n'a ni
-- schéma coop ni main.personne_visibilite_carto, et personne_affectations_lieu y
-- est une table. Le drapeau « en poste » y est calculé à partir des affectations de
-- lieu actives ; le drapeau « affiché » ne peut pas l'être (pas de choix de
-- visibilité) et recopie le premier. La règle de référence est celle de V198.
DO $miroir$
BEGIN
    IF to_regclass('main.conseiller_numerique_en_poste') IS NULL THEN
        EXECUTE $v$
        CREATE VIEW main.conseiller_numerique_en_poste AS
        SELECT DISTINCT pae.personne_id
          FROM main.personne_affectations_emploi pae
         WHERE pae.source::text = 'idposte'::text
           AND pae.est_active = true
        $v$;
    END IF;

    IF to_regclass('main.lieu_dispositifs') IS NULL THEN
        EXECUTE $v$
        CREATE VIEW main.lieu_dispositifs AS
         WITH cn AS (
                 SELECT pal.lieu_id,
                    bool_or(pal.est_active) AS a_conseiller_numerique_en_poste
                   FROM main.personne_affectations_lieu pal
                     JOIN main.conseiller_numerique_en_poste cnp ON cnp.personne_id = pal.personne_id
                  GROUP BY pal.lieu_id
                )
         SELECT li.id AS lieu_id,
            li.dispositif_programmes_nationaux AS dispositifs_declares,
            COALESCE(cn.a_conseiller_numerique_en_poste, false) AS a_conseiller_numerique_en_poste,
            COALESCE(cn.a_conseiller_numerique_en_poste, false) AS a_conseiller_numerique_affiche,
            CASE
                WHEN COALESCE(cn.a_conseiller_numerique_en_poste, false)
                 AND NOT ('Conseillers numériques'::main.dispositif_programme_national
                          = ANY (COALESCE(li.dispositif_programmes_nationaux, '{}'::main.dispositif_programme_national[])))
                THEN COALESCE(li.dispositif_programmes_nationaux, '{}'::main.dispositif_programme_national[])
                     || 'Conseillers numériques'::main.dispositif_programme_national
                ELSE li.dispositif_programmes_nationaux
            END AS dispositifs_publics,
            CASE
                WHEN COALESCE(cn.a_conseiller_numerique_en_poste, false)
                 AND NOT ('Conseillers numériques'::main.dispositif_programme_national
                          = ANY (COALESCE(li.dispositif_programmes_nationaux, '{}'::main.dispositif_programme_national[])))
                THEN COALESCE(li.dispositif_programmes_nationaux, '{}'::main.dispositif_programme_national[])
                     || 'Conseillers numériques'::main.dispositif_programme_national
                ELSE li.dispositif_programmes_nationaux
            END AS dispositifs_internes
           FROM main.lieu_inclusion li
             LEFT JOIN cn ON cn.lieu_id = li.id
        $v$;
    END IF;
END
$miroir$;
