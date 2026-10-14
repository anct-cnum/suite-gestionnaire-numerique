-- Alignement sur le standard national des lieux de médiation numérique (#1995) :
-- main.modalite_acces voit « Ce lieu n'accueille pas de public » passer de
-- l'apostrophe typographique U+2019 à l'apostrophe droite U+0027. L'énumération
-- du schéma main est portée par Flyway côté dataspace (V174, 2026-09-23),
-- postérieure au dernier snapshot dataspace_integration de MIN.
-- Cette migration ne sert qu'aux bases locales / de test (MIN ne migre plus en
-- prod) : elle reproduit le RENAME VALUE de V174 à l'identique. Bloc gardé pour
-- rester rejouable une fois le snapshot régénéré par
-- scripts/sync-dataspace-migration.sh (le libellé y arrivera alors déjà aligné
-- — même pattern que lieu_appariement / V152).
DO $mig$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumtypid = to_regtype('main.modalite_acces')
          AND enumlabel = 'Ce lieu n’accueille pas de public'
    ) THEN
        EXECUTE $e$
        ALTER TYPE main.modalite_acces
            RENAME VALUE 'Ce lieu n’accueille pas de public' TO 'Ce lieu n''accueille pas de public'
        $e$;
    END IF;
END
$mig$;
