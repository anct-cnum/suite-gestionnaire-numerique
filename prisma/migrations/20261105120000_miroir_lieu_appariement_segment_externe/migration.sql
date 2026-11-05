-- Miroir de la migration Flyway dataspace V195 (2026-11-02, SEPT #2218) :
-- main.lieu_appariement accepte la méthode 'segment_externe' (mémoire des
-- segments portés par les fiches non coop).
--
-- Ne sert qu'aux bases locales et de test : MIN ne migre plus le schéma main en
-- production, où la contrainte est posée par Flyway. Rejouable : sur une base
-- où V195 est déjà passée, la contrainte est recréée à l'identique.
ALTER TABLE main.lieu_appariement
    DROP CONSTRAINT IF EXISTS lieu_appariement_methode_check,
    ADD CONSTRAINT lieu_appariement_methode_check
        CHECK (methode IN ('segment_coop', 'similarite', 'segment_externe'));
