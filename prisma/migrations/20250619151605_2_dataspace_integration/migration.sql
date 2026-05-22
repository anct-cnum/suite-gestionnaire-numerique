CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA min;


-- Name: EXTENSION citext; Type: COMMENT; Schema: -; Owner:

COMMENT ON EXTENSION citext IS 'data type for case-insensitive character strings';


-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner:

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';








-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner:

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


-- Name: unaccent; Type: EXTENSION; Schema: -; Owner: -

CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;


-- Name: EXTENSION unaccent; Type: COMMENT; Schema: -; Owner:

COMMENT ON EXTENSION unaccent IS 'text search dictionary that removes accents';


-- Name: refresh_coll_terr(); Type: FUNCTION; Schema: admin; Owner: sonum

CREATE FUNCTION admin.refresh_coll_terr() RETURNS void
  LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    REFRESH MATERIALIZED VIEW admin.coll_terr;
END;
$$;


ALTER FUNCTION admin.refresh_coll_terr() OWNER TO sonum;

-- Name: FUNCTION refresh_coll_terr(); Type: COMMENT; Schema: admin; Owner: sonum

COMMENT ON FUNCTION admin.refresh_coll_terr() IS 'Fonction permettant de rafraichir la MV admin.coll_terr sans droits de propriétaire';


-- Name: commune; Type: TABLE; Schema: admin; Owner: sonum

CREATE TABLE admin.commune (
                             id integer NOT NULL,
                             geom public.geometry(MultiPolygon,4326) NOT NULL,
                             departement_id integer NOT NULL,
                             statut character varying(24),
                             code_insee character varying(5) NOT NULL,
                             nom character varying(50) NOT NULL,
                             population integer,
                             created_at timestamp without time zone DEFAULT now(),
                             updated_at timestamp without time zone,
                             code_insee_cr character varying(5) DEFAULT NULL::character varying
);


ALTER TABLE admin.commune OWNER TO sonum;

-- Name: COLUMN commune.statut; Type: COMMENT; Schema: admin; Owner: sonum

COMMENT ON COLUMN admin.commune.statut IS 'Les communes peuvent avoir le statut : Capitale d''état, Préfecture de région, Préfecture, Sous-préfecture, Commune simple,  Arrondissement, Commune associée, Commune déléguée';


-- Name: COLUMN commune.code_insee_cr; Type: COMMENT; Schema: admin; Owner: sonum

COMMENT ON COLUMN admin.commune.code_insee_cr IS 'Code insee de la commune de rattachement';


-- Name: departement; Type: TABLE; Schema: admin; Owner: sonum

CREATE TABLE admin.departement (
                                 id integer NOT NULL,
                                 geom public.geometry(MultiPolygon,4326) NOT NULL,
                                 region_id integer NOT NULL,
                                 code character varying(3) NOT NULL,
                                 nom character varying(30) NOT NULL,
                                 created_at timestamp without time zone DEFAULT now(),
                                 updated_at timestamp without time zone
);


ALTER TABLE admin.departement OWNER TO sonum;

-- Name: region; Type: TABLE; Schema: admin; Owner: sonum

CREATE TABLE admin.region (
                            id integer NOT NULL,
                            geom public.geometry(MultiPolygon,4326) NOT NULL,
                            code character varying(2) NOT NULL,
                            nom character varying(35) NOT NULL,
                            created_at timestamp without time zone DEFAULT now(),
                            updated_at timestamp without time zone
);


ALTER TABLE admin.region OWNER TO sonum;

-- Name: coll_terr; Type: MATERIALIZED VIEW; Schema: admin; Owner: sonum

CREATE MATERIALIZED VIEW admin.coll_terr AS
SELECT region.id AS region_id,
       region.code AS region_code,
       region.nom AS region_nom,
       departement.id AS departement_id,
       departement.code AS departement_code,
       departement.nom AS departement_nom,
       commune.id AS commune_id,
       commune.code_insee,
       commune.nom AS commune_nom
FROM ((admin.commune commune
  LEFT JOIN admin.departement departement ON ((commune.departement_id = departement.id)))
  LEFT JOIN admin.region region ON ((departement.region_id = region.id)))
  WITH NO DATA;


ALTER MATERIALIZED VIEW admin.coll_terr OWNER TO sonum;

-- Name: MATERIALIZED VIEW coll_terr; Type: COMMENT; Schema: admin; Owner: sonum

COMMENT ON MATERIALIZED VIEW admin.coll_terr IS 'Table de regroupement des territoires (région, département, commune) hors EPCI.';


-- Name: commune_epci; Type: TABLE; Schema: admin; Owner: sonum

CREATE TABLE admin.commune_epci (
                                  id integer NOT NULL,
                                  commune_id integer NOT NULL,
                                  epci_id integer NOT NULL,
                                  created_at timestamp without time zone DEFAULT now(),
                                  updated_at timestamp without time zone
);


ALTER TABLE admin.commune_epci OWNER TO sonum;

-- Name: commune_epci_id_seq; Type: SEQUENCE; Schema: admin; Owner: sonum

ALTER TABLE admin.commune_epci ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME admin.commune_epci_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: commune_id_seq; Type: SEQUENCE; Schema: admin; Owner: sonum

ALTER TABLE admin.commune ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME admin.commune_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: departement_id_seq; Type: SEQUENCE; Schema: admin; Owner: sonum

ALTER TABLE admin.departement ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME admin.departement_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: epci; Type: TABLE; Schema: admin; Owner: sonum

CREATE TABLE admin.epci (
                          id integer NOT NULL,
                          geom public.geometry(MultiPolygon,4326) NOT NULL,
                          code character varying(9) NOT NULL,
                          type character varying(32) NOT NULL,
                          nom character varying(90) NOT NULL,
                          created_at timestamp without time zone DEFAULT now(),
                          updated_at timestamp without time zone
);


ALTER TABLE admin.epci OWNER TO sonum;

-- Name: epci_id_seq; Type: SEQUENCE; Schema: admin; Owner: sonum

ALTER TABLE admin.epci ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME admin.epci_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: icp_departement; Type: TABLE; Schema: admin; Owner: sonum

CREATE TABLE admin.icp_departement (
                                     id integer NOT NULL,
                                     code character varying(3) NOT NULL,
                                     label character varying,
                                     created_at timestamp without time zone DEFAULT now(),
                                     updated_at timestamp without time zone
);


ALTER TABLE admin.icp_departement OWNER TO sonum;

-- Name: TABLE icp_departement; Type: COMMENT; Schema: admin; Owner: sonum

COMMENT ON TABLE admin.icp_departement IS 'Table de gestion de l’indice de confiance des préfectures par département : https://pilote.modernisation.gouv.fr/';


-- Name: COLUMN icp_departement.code; Type: COMMENT; Schema: admin; Owner: sonum

COMMENT ON COLUMN admin.icp_departement.code IS 'Code département : un code à 2 ou 3 chiffres qui identifie
le département français, en métropole ou en outre-mer.
Exemple : "13" pour les Bouches-du-Rhône.';


-- Name: COLUMN icp_departement.label; Type: COMMENT; Schema: admin; Owner: sonum

COMMENT ON COLUMN admin.icp_departement.label IS 'Appréciation qualitative de l’avancement des objectifs :
 - OBJECTIFS SÉCURISÉS : les cibles sont déjà atteintes ou sécurisées.
 - OBJECTIFS ATTEIGNABLES : les cibles sont en bonne voie d’être atteintes.
 - APPUIS NÉCESSAIRES : des actions ou soutiens complémentaires sont requis.
 - OBJECTIFS COMPROMIS : les cibles risquent fortement de ne pas être atteintes.
 - Non renseignée : aucune appréciation n’a été saisie.';


-- Name: icp_departement_id_seq; Type: SEQUENCE; Schema: admin; Owner: sonum

ALTER TABLE admin.icp_departement ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME admin.icp_departement_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: ifn_commune; Type: TABLE; Schema: admin; Owner: sonum

CREATE TABLE admin.ifn_commune (
                                 id integer NOT NULL,
                                 code_insee character varying(5) NOT NULL,
                                 score numeric NOT NULL,
                                 created_at timestamp without time zone DEFAULT now(),
                                 updated_at timestamp without time zone
);


ALTER TABLE admin.ifn_commune OWNER TO sonum;

-- Name: TABLE ifn_commune; Type: COMMENT; Schema: admin; Owner: sonum

COMMENT ON TABLE admin.ifn_commune IS 'Table des Indices de Fragilité Numérique communaux : https://fragilite-numerique.fr/.';


-- Name: COLUMN ifn_commune.code_insee; Type: COMMENT; Schema: admin; Owner: sonum

COMMENT ON COLUMN admin.ifn_commune.code_insee IS 'Code INSEE de la commune.';


-- Name: COLUMN ifn_commune.score; Type: COMMENT; Schema: admin; Owner: sonum

COMMENT ON COLUMN admin.ifn_commune.score IS 'Valeur de 0 à 10 indiquant l''indice de fragilité numérique de la commune. Cette valeur est la somme de plusieurs indicateurs, pour plus d''informations : https://infos.fragilite-numerique.fr/ressources-cgu.';


-- Name: ifn_commune_id_seq; Type: SEQUENCE; Schema: admin; Owner: sonum

ALTER TABLE admin.ifn_commune ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME admin.ifn_commune_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: ifn_departement; Type: TABLE; Schema: admin; Owner: sonum

CREATE TABLE admin.ifn_departement (
                                     id integer NOT NULL,
                                     code character varying(3) NOT NULL,
                                     score numeric NOT NULL,
                                     created_at timestamp without time zone DEFAULT now(),
                                     updated_at timestamp without time zone
);


ALTER TABLE admin.ifn_departement OWNER TO sonum;

-- Name: TABLE ifn_departement; Type: COMMENT; Schema: admin; Owner: sonum

COMMENT ON TABLE admin.ifn_departement IS 'Table de gestion des départements IFN - Indice de Fragilité Numérique : https://fragilite-numerique.fr/';


-- Name: COLUMN ifn_departement.code; Type: COMMENT; Schema: admin; Owner: sonum

COMMENT ON COLUMN admin.ifn_departement.code IS 'Code département : un code à 2 ou 3 chiffres qui identifie le département français, en métropole ou en outre-mer. Par exemple, "13" pour les Bouches-du-Rhône.';


-- Name: COLUMN ifn_departement.score; Type: COMMENT; Schema: admin; Owner: sonum

COMMENT ON COLUMN admin.ifn_departement.score IS 'Score : Un nombre réel qui varie de [0 - 10] indiquant l''indice de fragilité numérique du département. cette valeur est une somme totale de plusieurs indicateurs, pour plus d''informations, voir le site : https://infos.fragilite-numerique.fr/ressources-cgu';


-- Name: ifn_departement_id_seq; Type: SEQUENCE; Schema: admin; Owner: sonum

ALTER TABLE admin.ifn_departement ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME admin.ifn_departement_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: insee_cp; Type: TABLE; Schema: admin; Owner: sonum

CREATE TABLE admin.insee_cp (
                              id integer NOT NULL,
                              code_insee character varying(5) NOT NULL,
                              code_postal character varying(5) NOT NULL,
                              created_at timestamp without time zone DEFAULT now(),
                              updated_at timestamp without time zone
);


ALTER TABLE admin.insee_cp OWNER TO sonum;

-- Name: insee_cp_id_seq; Type: SEQUENCE; Schema: admin; Owner: sonum

ALTER TABLE admin.insee_cp ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME admin.insee_cp_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: insee_historique; Type: TABLE; Schema: admin; Owner: sonum

CREATE TABLE admin.insee_historique (
                                      id integer NOT NULL,
                                      code_insee_ancien character varying(5) NOT NULL,
                                      code_insee_nouveau character varying(5) NOT NULL,
                                      created_at timestamp without time zone DEFAULT now(),
                                      updated_at timestamp without time zone
);


ALTER TABLE admin.insee_historique OWNER TO sonum;

-- Name: TABLE insee_historique; Type: COMMENT; Schema: admin; Owner: sonum

COMMENT ON TABLE admin.insee_historique IS 'Table d''historisation des modifications des codes INSEE (création, suppression, fusion etc. des communes).';


-- Name: COLUMN insee_historique.code_insee_ancien; Type: COMMENT; Schema: admin; Owner: sonum

COMMENT ON COLUMN admin.insee_historique.code_insee_ancien IS 'Ancien code INSEE.';


-- Name: COLUMN insee_historique.code_insee_nouveau; Type: COMMENT; Schema: admin; Owner: sonum

COMMENT ON COLUMN admin.insee_historique.code_insee_nouveau IS 'Nouveau code INSEE.';


-- Name: insee_historique_id_seq; Type: SEQUENCE; Schema: admin; Owner: sonum

ALTER TABLE admin.insee_historique ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME admin.insee_historique_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: region_id_seq; Type: SEQUENCE; Schema: admin; Owner: sonum

ALTER TABLE admin.region ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME admin.region_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: zonage; Type: TABLE; Schema: admin; Owner: sonum

CREATE TABLE admin.zonage (
                            id integer NOT NULL,
                            geom public.geometry(MultiPolygon,4326) DEFAULT NULL::public.geometry,
                            code character varying(8),
                            libelle character varying(255),
                            code_insee character varying(5) NOT NULL,
                            type character varying(3) NOT NULL,
                            commentaire text,
                            created_at timestamp without time zone DEFAULT now(),
                            updated_at timestamp without time zone
);


ALTER TABLE admin.zonage OWNER TO sonum;

-- Name: TABLE zonage; Type: COMMENT; Schema: admin; Owner: sonum

COMMENT ON TABLE admin.zonage IS 'Table de gestion des zonages administratifs FRR et QPV.';


-- Name: COLUMN zonage.code; Type: COMMENT; Schema: admin; Owner: sonum

COMMENT ON COLUMN admin.zonage.code IS 'Identifiant unique du zonage concerne QPV uniquement - généré par l''API.';


-- Name: COLUMN zonage.libelle; Type: COMMENT; Schema: admin; Owner: sonum

COMMENT ON COLUMN admin.zonage.libelle IS 'Libelle du zonage concerne QPV uniquement - généré par l''API.';


-- Name: COLUMN zonage.type; Type: COMMENT; Schema: admin; Owner: sonum

COMMENT ON COLUMN admin.zonage.type IS 'Type de zonage (QPV: Quartier Prioritaire de la Ville, FRR: France Ruralités Revitalisation).';


-- Name: COLUMN zonage.commentaire; Type: COMMENT; Schema: admin; Owner: sonum

COMMENT ON COLUMN admin.zonage.commentaire IS 'Commentaire sur le zonage - généré par l''API.';


-- Name: zonage_id_seq; Type: SEQUENCE; Schema: admin; Owner: sonum

ALTER TABLE admin.zonage ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME admin.zonage_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: adresse; Type: TABLE; Schema: main; Owner: sonum

CREATE TABLE main.adresse (
                            id integer NOT NULL,
                            geom public.geometry(Point,4326),
                            clef_interop character varying(50),
                            code_ban uuid,
                            code_postal character varying(5) NOT NULL,
                            code_insee character varying(5) NOT NULL,
                            nom_commune character varying(255) NOT NULL,
                            nom_voie character varying(255),
                            repetition character varying(10),
                            numero_voie smallint,
                            created_at timestamp without time zone DEFAULT now(),
                            updated_at timestamp without time zone,
                            departement character varying(3) GENERATED ALWAYS AS (
                              CASE
                                WHEN (((code_insee)::text ~ '^97'::text) OR ((code_insee)::text ~ '^98'::text)) THEN "left"((code_insee)::text, 3)
    ELSE "left"((code_insee)::text, 2)
END) STORED
);


ALTER TABLE main.adresse OWNER TO sonum;

-- Name: COLUMN adresse.departement; Type: COMMENT; Schema: main; Owner: sonum

COMMENT ON COLUMN main.adresse.departement IS 'Code département, généré à partir du code_insee';


-- Name: personne; Type: TABLE; Schema: main; Owner: sonum

CREATE TABLE main.personne (
                             id integer NOT NULL,
                             prenom character varying(50),
                             nom character varying(50),
                             contact jsonb,
                             aidant_connect_id integer,
                             conseiller_numerique_id character varying(50),
                             cn_pg_id integer,
                             coop_id uuid,
                             is_coordinateur boolean,
                             is_mediateur boolean,
                             formation_fne_ac boolean,
                             profession_ac character varying,
                             nb_accompagnements_ac integer,
                             created_at timestamp without time zone DEFAULT now(),
                             updated_at timestamp without time zone,
                             edited_by character varying(50),
                             deleted_at timestamp without time zone,
                             deleted_by text[]
);


ALTER TABLE main.personne OWNER TO sonum;

-- Name: structure_administrative; Type: TABLE; Schema: main; Owner: sonum
-- Refonte 2026 : entité légale (SIRET ou RIDET) qui emploie, reçoit des
-- subventions, porte une gouvernance, héberge des lieux d'inclusion.
-- Successeur de l'aspect "employeuse" de main.structure.

CREATE TABLE main.structure_administrative (
    id integer NOT NULL,
    old_main_structure_id integer,
    siret character varying(14),
    ridet character varying(10),
    denomination_sirene character varying,
    rna character varying(10),
    adresse_id integer,
    structure_coop_id uuid,
    structure_tp_id integer,
    structure_ac_id uuid,
    etat_administratif character varying,
    code_activite_principale character varying(6),
    categorie_juridique character varying(4) DEFAULT NULL::character varying,
    publique boolean,
    nb_mandats_ac integer,
    contact jsonb,
    deleted_at timestamp without time zone,
    deleted_by text[],
    edited_by character varying(50),
    last_sirene_enrich_at date,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone,
    updated_at_coop timestamp without time zone,
    updated_at_idposte timestamp without time zone,
    updated_at_ac timestamp without time zone,
    CONSTRAINT structure_administrative_ridet_format_check CHECK (((ridet IS NULL) OR ((ridet)::text ~ '^\d{7,10}$'::text))),
    CONSTRAINT structure_administrative_siret_format_check CHECK (((siret IS NULL) OR ((siret)::text ~ '^\d{14}$'::text)))
);

ALTER TABLE main.structure_administrative OWNER TO sonum;

-- Name: lieu_inclusion; Type: TABLE; Schema: main; Owner: sonum
-- Refonte 2026 : lieu physique d'inclusion numérique (France Services,
-- médiathèque, EPN…). Successeur de l'aspect "lieu" de main.structure.

CREATE TABLE main.lieu_inclusion (
    id integer NOT NULL,
    old_main_structure_id integer,
    nom character varying(255) NOT NULL,
    adresse_id integer,
    structure_cartographie_nationale_id character varying,
    visible_pour_cartographie_nationale boolean,
    fiche_acces_libre character varying,
    presentation_resume text,
    presentation_detail text,
    horaires character varying,
    prise_rdv character varying,
    itinerance text[],
    services text[],
    modalites_acces text[],
    modalites_accompagnement text[],
    publics_specifiquement_adresses text[],
    prise_en_charge_specifique text[],
    frais_a_charge text[],
    formations_labels text[],
    autres_formations_labels text[],
    dispositif_programmes_nationaux text[],
    typologies text[],
    contact jsonb,
    mediateurs_en_activite integer,
    emplois integer,
    source character varying,
    edited_by character varying(50),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone,
    structure_coop_id uuid,
    import_warnings jsonb
);

ALTER TABLE main.lieu_inclusion OWNER TO sonum;

-- Name: lieu_inclusion_structure_administrative; Type: TABLE; Schema: main; Owner: sonum
-- Refonte 2026 : asso N:N entre lieu_inclusion et structure_administrative.

CREATE TABLE main.lieu_inclusion_structure_administrative (
    id integer NOT NULL,
    lieu_id integer NOT NULL,
    structure_administrative_id integer NOT NULL,
    edited_by character varying(50),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone
);

ALTER TABLE main.lieu_inclusion_structure_administrative OWNER TO sonum;

-- Name: personne_affectations_emploi; Type: TABLE; Schema: main; Owner: sonum
-- Refonte 2026 : successeur de type='structure_emploi' de personne_affectations.

CREATE TABLE main.personne_affectations_emploi (
    id integer NOT NULL,
    personne_id integer NOT NULL,
    structure_administrative_id integer NOT NULL,
    source character varying NOT NULL,
    est_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone,
    CONSTRAINT personne_affectations_emploi_source_check CHECK (((source)::text = ANY ((ARRAY['idposte'::character varying, 'aidants-connect'::character varying, 'coop'::character varying, 'min'::character varying])::text[])))
);

ALTER TABLE main.personne_affectations_emploi OWNER TO sonum;

-- Name: personne_affectations_lieu; Type: TABLE; Schema: main; Owner: sonum
-- Refonte 2026 : successeur de type='lieu_activite' de personne_affectations.

CREATE TABLE main.personne_affectations_lieu (
    id integer NOT NULL,
    personne_id integer NOT NULL,
    lieu_id integer NOT NULL,
    source character varying NOT NULL,
    est_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone,
    CONSTRAINT personne_affectations_lieu_source_check CHECK (((source)::text = ANY ((ARRAY['coop'::character varying, 'aidants-connect'::character varying, 'carto'::character varying, 'min'::character varying])::text[])))
);

ALTER TABLE main.personne_affectations_lieu OWNER TO sonum;

-- Name: categories_juridiques; Type: TABLE; Schema: reference; Owner: sonum

CREATE TABLE reference.categories_juridiques (
                                               id integer NOT NULL,
                                               code character varying(4) NOT NULL,
                                               nom character varying(150) NOT NULL,
                                               niveau smallint NOT NULL,
                                               created_at timestamp without time zone DEFAULT now(),
                                               updated_at timestamp without time zone
);


ALTER TABLE reference.categories_juridiques OWNER TO sonum;

-- Name: personne_merge_log; Type: TABLE; Schema: audit; Owner: sonum

CREATE TABLE audit.personne_merge_log (
                                        id bigint NOT NULL,
                                        merged_at timestamp with time zone DEFAULT now() NOT NULL,
                                        status text NOT NULL,
                                        dag_id text,
                                        run_id text,
                                        task_id text,
                                        map_index integer,
                                        try_number integer,
                                        winner_id integer NOT NULL,
                                        loser_id integer NOT NULL,
                                        similarity_score numeric,
                                        similarity_threshold numeric,
                                        winner_before jsonb,
                                        loser_before jsonb,
                                        winner_after jsonb,
                                        moved_identifiers jsonb,
                                        error_message text,
                                        match_type text,
                                        CONSTRAINT personne_merge_log_status_check CHECK ((status = ANY (ARRAY['SUCCESS'::text, 'FAILURE'::text])))
);


ALTER TABLE audit.personne_merge_log OWNER TO sonum;

-- Name: personne_merge_log_id_seq; Type: SEQUENCE; Schema: audit; Owner: sonum

CREATE SEQUENCE audit.personne_merge_log_id_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;


ALTER SEQUENCE audit.personne_merge_log_id_seq OWNER TO sonum;

-- Name: personne_merge_log_id_seq; Type: SEQUENCE OWNED BY; Schema: audit; Owner: sonum

ALTER SEQUENCE audit.personne_merge_log_id_seq OWNED BY audit.personne_merge_log.id;


-- Name: structure_merge_log; Type: TABLE; Schema: audit; Owner: sonum

CREATE TABLE audit.structure_merge_log (
                                         id bigint NOT NULL,
                                         merged_at timestamp with time zone DEFAULT now() NOT NULL,
                                         status text NOT NULL,
                                         dag_id text,
                                         run_id text,
                                         task_id text,
                                         map_index integer,
                                         try_number integer,
                                         winner_id integer NOT NULL,
                                         loser_id integer NOT NULL,
                                         similarity_score numeric,
                                         similarity_threshold numeric,
                                         winner_before jsonb,
                                         loser_before jsonb,
                                         winner_after jsonb,
                                         moved_identifiers jsonb,
                                         error_message text,
                                         CONSTRAINT structure_merge_log_status_check CHECK ((status = ANY (ARRAY['SUCCESS'::text, 'FAILURE'::text])))
);


ALTER TABLE audit.structure_merge_log OWNER TO sonum;

-- Name: structure_merge_log_id_seq; Type: SEQUENCE; Schema: audit; Owner: sonum

CREATE SEQUENCE audit.structure_merge_log_id_seq
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;


ALTER SEQUENCE audit.structure_merge_log_id_seq OWNER TO sonum;

-- Name: structure_merge_log_id_seq; Type: SEQUENCE OWNED BY; Schema: audit; Owner: sonum

ALTER SEQUENCE audit.structure_merge_log_id_seq OWNED BY audit.structure_merge_log.id;


-- Name: activites_coop; Type: TABLE; Schema: main; Owner: sonum

CREATE TABLE main.activites_coop (
                                   id integer NOT NULL,
                                   coop_id uuid,
                                   lieu_id integer,
                                   personne_id integer,
                                   type character varying(100) NOT NULL,
                                   date date NOT NULL,
                                   duree integer NOT NULL,
                                   lieu_code_insee character varying(5),
                                   type_lieu character varying(100) NOT NULL,
                                   autonomie character varying(100),
                                   structure_de_redirection character varying(255),
                                   oriente_vers_structure boolean,
                                   precisions_demarche text,
                                   degre_de_finalisation_demarche character varying(50),
                                   titre_atelier character varying(255),
                                   niveau_atelier character varying(50),
                                   accompagnements integer DEFAULT 0 NOT NULL,
                                   thematiques text[],
                                   materiels text[],
                                   thematiques_demarche_administrative text[],
                                   created_at timestamp without time zone DEFAULT now(),
                                   updated_at timestamp without time zone,
                                   periode date GENERATED ALWAYS AS ((date_trunc('month'::text, (date)::timestamp without time zone))::date) STORED,
    created_at_coop timestamp without time zone,
    updated_at_coop timestamp without time zone
);


ALTER TABLE main.activites_coop OWNER TO sonum;

-- Name: COLUMN activites_coop.duree; Type: COMMENT; Schema: main; Owner: sonum

COMMENT ON COLUMN main.activites_coop.duree IS 'Valeur en minutes';


-- Name: poste; Type: TABLE; Schema: main; Owner: sonum

CREATE TABLE main.poste (
                          id integer NOT NULL,
                          poste_conum_id integer NOT NULL,
                          structure_id integer,
                          personne_id integer,
                          typologie character varying(6),
                          date_attribution date NOT NULL,
                          date_rendu_poste date,
                          poste_renouvele boolean,
                          action_coselec character varying(255),
                          origine_transfert integer,
                          etat character varying(6),
                          created_at timestamp without time zone DEFAULT now(),
                          updated_at timestamp without time zone,
                          etat_instruction_v1 character varying,
                          etat_instruction_v2 character varying,
                          CONSTRAINT poste_check CHECK ((NOT (((etat)::text = 'rendu'::text) AND (date_rendu_poste IS NULL)))),
    CONSTRAINT poste_etat_check CHECK (((etat)::text = ANY (ARRAY[('vacant'::character varying)::text, ('occupe'::character varying)::text, ('rendu'::character varying)::text]))),
    CONSTRAINT poste_typologie_check CHECK (((typologie)::text = ANY (ARRAY[('conum'::character varying)::text, ('coordo'::character varying)::text, ('dns'::character varying)::text])))
);


ALTER TABLE main.poste OWNER TO sonum;

-- Name: formation; Type: TABLE; Schema: main; Owner: sonum

CREATE TABLE main.formation (
                              id integer NOT NULL,
                              personne_id integer NOT NULL,
                              label character varying(11),
                              parcours character varying(4),
                              lot smallint,
                              marche_formation character varying(8),
                              lieu character varying(255),
                              date_debut date,
                              date_fin date,
                              pix boolean,
                              remn boolean,
                              observations text,
                              created_at timestamp without time zone DEFAULT now(),
                              updated_at timestamp without time zone,
                              CONSTRAINT formation_label_check CHECK (((label)::text = ANY (ARRAY[('CCP1'::character varying)::text, ('CCP2'::character varying)::text, ('CCP2 & CCP3'::character varying)::text]))),
    CONSTRAINT formation_parcours_check CHECK (((parcours)::text = ANY (ARRAY[('70h'::character varying)::text, ('175h'::character varying)::text, ('315h'::character varying)::text, ('105h'::character varying)::text, ('420h'::character varying)::text, ('280h'::character varying)::text, ('350h'::character varying)::text])))
);


ALTER TABLE main.formation OWNER TO sonum;

-- Name: TABLE formation; Type: COMMENT; Schema: main; Owner: sonum

COMMENT ON TABLE main.formation IS 'Table de gestion des formations des Conseillers Numériques.';


-- Name: COLUMN formation.label; Type: COMMENT; Schema: main; Owner: sonum

COMMENT ON COLUMN main.formation.label IS 'Label de la formation, exemple : CCP1, CCP2, CCP2 & CCP3';


-- Name: COLUMN formation.parcours; Type: COMMENT; Schema: main; Owner: sonum

COMMENT ON COLUMN main.formation.parcours IS 'Parcours de formation défini après un test de positionnement : débutant (315h), intermédiaire (175h), ou avancé (70h).';


-- Name: contact; Type: TABLE; Schema: main; Owner: sonum

CREATE TABLE main.contact (
                            id integer NOT NULL,
                            nom character varying(255) NOT NULL,
                            prenom character varying(255) NOT NULL,
                            email character varying(255) NOT NULL,
                            telephone character varying(20) DEFAULT ''::character varying NOT NULL,
                            fonction character varying(255) DEFAULT ''::character varying NOT NULL,
                            est_referent_fne boolean DEFAULT false NOT NULL,
                            created_at timestamp(6) without time zone DEFAULT now(),
                            updated_at timestamp(6) without time zone DEFAULT now()
);


ALTER TABLE main.contact OWNER TO sonum;

-- Name: contact_structure_administrative; Type: TABLE; Schema: main; Owner: sonum
-- Refonte 2026 : ex-main.contact_structure renommé (V080), FK basculée vers
-- main.structure_administrative.

CREATE TABLE main.contact_structure_administrative (
    id integer NOT NULL,
    structure_administrative_id integer NOT NULL,
    contact_id integer NOT NULL,
    created_at timestamp(6) without time zone DEFAULT now()
);

ALTER TABLE main.contact_structure_administrative OWNER TO sonum;

-- Name: contrat; Type: TABLE; Schema: main; Owner: sonum

CREATE TABLE main.contrat (
                            id integer NOT NULL,
                            personne_id integer NOT NULL,
                            date_debut date,
                            date_fin date,
                            date_rupture date,
                            type character varying(3),
                            created_at timestamp without time zone DEFAULT now(),
                            updated_at timestamp without time zone,
                            structure_id integer,
                            CONSTRAINT contrat_type_check CHECK (((type)::text = ANY (ARRAY[('CDD'::character varying)::text, ('CDI'::character varying)::text, ('CDP'::character varying)::text, ('PEC'::character varying)::text])))
);


ALTER TABLE main.contrat OWNER TO sonum;

-- Name: subvention; Type: TABLE; Schema: main; Owner: sonum

CREATE TABLE main.subvention (
                               id integer NOT NULL,
                               poste_id integer NOT NULL,
                               -- DGCL (V1)
                               date_debut_convention_dgcl date,
                               date_debut_financement_dgcl date,
                               date_fin_convention_dgcl date,
                               date_fin_financement_dgcl date,
                               mois_utilises_periode_financement_dgcl smallint,
                               -- DITP (V2)
                               date_debut_convention_ditp date,
                               date_debut_financement_ditp date,
                               date_fin_convention_ditp date,
                               date_fin_financement_ditp date,
                               mois_utilises_periode_financement_ditp smallint,
                               -- DGE (V2)
                               date_debut_convention_dge date,
                               date_debut_financement_dge date,
                               date_fin_convention_dge date,
                               date_fin_financement_dge date,
                               mois_utilises_periode_financement_dge smallint,
                               -- Montants V1
                               montant_subvention_v1 bigint,
                               montant_versement_v1 bigint,
                               montant_avoir_v1 bigint,
                               -- Montants V2
                               montant_bonification_v2 bigint,
                               montant_subvention_v2 bigint,
                               montant_avoir_v2 bigint,
                               -- Versements V2
                               versement_1_v2 bigint,
                               versement_2_v2 bigint,
                               versement_3_v2 bigint,
                               date_versement_1_v2 date,
                               date_versement_2_v2 date,
                               date_versement_3_v2 date,
                               created_at timestamp without time zone DEFAULT now(),
                               updated_at timestamp without time zone
);


ALTER TABLE main.subvention OWNER TO sonum;

-- Name: TABLE subvention; Type: COMMENT; Schema: main; Owner: sonum

COMMENT ON TABLE main.subvention IS 'Table des subventions par poste. Une ligne par poste avec colonnes spécifiques pour DGCL (V1), DITP (V2) et DGE (V2)';


-- Name: activites_coop_id_seq; Type: SEQUENCE; Schema: main; Owner: sonum

ALTER TABLE main.activites_coop ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME main.activites_coop_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: adresse_id_seq; Type: SEQUENCE; Schema: main; Owner: sonum

ALTER TABLE main.adresse ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME main.adresse_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: contact_id_seq; Type: SEQUENCE; Schema: main; Owner: sonum

CREATE SEQUENCE main.contact_id_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;


ALTER SEQUENCE main.contact_id_seq OWNER TO sonum;

-- Name: contact_id_seq; Type: SEQUENCE OWNED BY; Schema: main; Owner: sonum

ALTER SEQUENCE main.contact_id_seq OWNED BY main.contact.id;


-- Name: contact_structure_id_seq; Type: SEQUENCE; Schema: main; Owner: sonum

CREATE SEQUENCE main.contact_structure_id_seq
  AS integer
  START WITH 1
  INCREMENT BY 1
  NO MINVALUE
  NO MAXVALUE
  CACHE 1;


ALTER SEQUENCE main.contact_structure_id_seq OWNER TO sonum;

-- Name: contact_structure_id_seq; Type: SEQUENCE OWNED BY; Schema: main; Owner: sonum

ALTER SEQUENCE main.contact_structure_id_seq OWNED BY main.contact_structure_administrative.id;


-- Name: contrat_id_seq; Type: SEQUENCE; Schema: main; Owner: sonum

ALTER TABLE main.contrat ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME main.contrat_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: coordination_mediation; Type: TABLE; Schema: main; Owner: sonum

CREATE TABLE main.coordination_mediation (
                                           id integer NOT NULL,
                                           coordinateur_id integer NOT NULL,
                                           mediateur_id integer NOT NULL,
                                           coordinateur_coop_id uuid NOT NULL,
                                           mediateur_coop_id uuid NOT NULL,
                                           created_at timestamp without time zone DEFAULT now(),
                                           updated_at timestamp without time zone,
                                           suppression timestamp with time zone
);


ALTER TABLE main.coordination_mediation OWNER TO sonum;

-- Name: COLUMN coordination_mediation.suppression; Type: COMMENT; Schema: main; Owner: sonum

COMMENT ON COLUMN main.coordination_mediation.suppression IS 'Date de suppression de la coordination médiation (NULL si en cours).';


-- Name: coordination_mediation_id_seq; Type: SEQUENCE; Schema: main; Owner: sonum

ALTER TABLE main.coordination_mediation ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME main.coordination_mediation_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: formation_id_seq; Type: SEQUENCE; Schema: main; Owner: sonum

ALTER TABLE main.formation ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME main.formation_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: personne_affectations_emploi_id_seq; Type: SEQUENCE; Schema: main; Owner: sonum

ALTER TABLE main.personne_affectations_emploi ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME main.personne_affectations_emploi_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

-- Name: personne_affectations_lieu_id_seq; Type: SEQUENCE; Schema: main; Owner: sonum

ALTER TABLE main.personne_affectations_lieu ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME main.personne_affectations_lieu_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: personne_id_seq; Type: SEQUENCE; Schema: main; Owner: sonum

ALTER TABLE main.personne ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME main.personne_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: poste_id_seq; Type: SEQUENCE; Schema: main; Owner: sonum

ALTER TABLE main.poste ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME main.poste_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: structure_administrative_id_seq; Type: SEQUENCE; Schema: main; Owner: sonum

ALTER TABLE main.structure_administrative ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME main.structure_administrative_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

-- Name: lieu_inclusion_id_seq; Type: SEQUENCE; Schema: main; Owner: sonum

ALTER TABLE main.lieu_inclusion ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME main.lieu_inclusion_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);

-- Name: lieu_inclusion_structure_administrative_id_seq; Type: SEQUENCE; Schema: main; Owner: sonum

ALTER TABLE main.lieu_inclusion_structure_administrative ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME main.lieu_inclusion_structure_administrative_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: subvention_id_seq; Type: SEQUENCE; Schema: main; Owner: sonum

ALTER TABLE main.subvention ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME main.subvention_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: categories_juridiques_id_seq; Type: SEQUENCE; Schema: reference; Owner: sonum

ALTER TABLE reference.categories_juridiques ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME reference.categories_juridiques_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: naf; Type: TABLE; Schema: reference; Owner: sonum

CREATE TABLE reference.naf (
                             id integer NOT NULL,
                             code character varying(6) NOT NULL,
                             intitule_long character varying(150) NOT NULL,
                             intitule_court character varying(65) NOT NULL,
                             created_at timestamp without time zone DEFAULT now(),
                             updated_at timestamp without time zone
);


ALTER TABLE reference.naf OWNER TO sonum;

-- Name: naf_id_seq; Type: SEQUENCE; Schema: reference; Owner: sonum

ALTER TABLE reference.naf ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME reference.naf_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: personne_merge_log id; Type: DEFAULT; Schema: audit; Owner: sonum

ALTER TABLE ONLY audit.personne_merge_log ALTER COLUMN id SET DEFAULT nextval('audit.personne_merge_log_id_seq'::regclass);


-- Name: structure_merge_log id; Type: DEFAULT; Schema: audit; Owner: sonum

ALTER TABLE ONLY audit.structure_merge_log ALTER COLUMN id SET DEFAULT nextval('audit.structure_merge_log_id_seq'::regclass);


-- Name: contact id; Type: DEFAULT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.contact ALTER COLUMN id SET DEFAULT nextval('main.contact_id_seq'::regclass);


-- Name: contact_structure_administrative id; Type: DEFAULT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.contact_structure_administrative ALTER COLUMN id SET DEFAULT nextval('main.contact_structure_id_seq'::regclass);


-- Name: SCHEMA admin; Type: ACL; Schema: -; Owner: sonum

GRANT USAGE ON SCHEMA admin TO app_python;
GRANT USAGE ON SCHEMA admin TO min_scalingo;
GRANT USAGE ON SCHEMA admin TO min_dev;


-- Name: SCHEMA main; Type: ACL; Schema: -; Owner: sonum

GRANT USAGE ON SCHEMA main TO app_python;
GRANT USAGE ON SCHEMA main TO min_scalingo;
GRANT USAGE ON SCHEMA main TO min_dev;


-- Name: SCHEMA reference; Type: ACL; Schema: -; Owner: sonum

GRANT USAGE ON SCHEMA reference TO min_scalingo;
GRANT USAGE ON SCHEMA reference TO min_dev;


-- Name: FUNCTION refresh_coll_terr(); Type: ACL; Schema: admin; Owner: sonum

GRANT ALL ON FUNCTION admin.refresh_coll_terr() TO app_python;


-- Name: TABLE commune; Type: ACL; Schema: admin; Owner: sonum

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE admin.commune TO app_python;
GRANT SELECT,REFERENCES ON TABLE admin.commune TO min_scalingo;
GRANT SELECT ON TABLE admin.commune TO min_dev;


-- Name: TABLE departement; Type: ACL; Schema: admin; Owner: sonum

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE admin.departement TO app_python;
GRANT SELECT,REFERENCES ON TABLE admin.departement TO min_scalingo;
GRANT SELECT ON TABLE admin.departement TO min_dev;


-- Name: TABLE region; Type: ACL; Schema: admin; Owner: sonum

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE admin.region TO app_python;
GRANT SELECT,REFERENCES ON TABLE admin.region TO min_scalingo;
GRANT SELECT ON TABLE admin.region TO min_dev;


-- Name: TABLE coll_terr; Type: ACL; Schema: admin; Owner: sonum

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE admin.coll_terr TO app_python;
GRANT SELECT,REFERENCES ON TABLE admin.coll_terr TO min_scalingo;
GRANT SELECT ON TABLE admin.coll_terr TO min_dev;


-- Name: TABLE commune_epci; Type: ACL; Schema: admin; Owner: sonum

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE admin.commune_epci TO app_python;
GRANT SELECT,REFERENCES ON TABLE admin.commune_epci TO min_scalingo;
GRANT SELECT ON TABLE admin.commune_epci TO min_dev;


-- Name: SEQUENCE commune_epci_id_seq; Type: ACL; Schema: admin; Owner: sonum

GRANT USAGE,UPDATE ON SEQUENCE admin.commune_epci_id_seq TO app_python;


-- Name: SEQUENCE commune_id_seq; Type: ACL; Schema: admin; Owner: sonum

GRANT USAGE,UPDATE ON SEQUENCE admin.commune_id_seq TO app_python;


-- Name: SEQUENCE departement_id_seq; Type: ACL; Schema: admin; Owner: sonum

GRANT USAGE,UPDATE ON SEQUENCE admin.departement_id_seq TO app_python;


-- Name: TABLE epci; Type: ACL; Schema: admin; Owner: sonum

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE admin.epci TO app_python;
GRANT SELECT,REFERENCES ON TABLE admin.epci TO min_scalingo;
GRANT SELECT ON TABLE admin.epci TO min_dev;


-- Name: SEQUENCE epci_id_seq; Type: ACL; Schema: admin; Owner: sonum

GRANT USAGE,UPDATE ON SEQUENCE admin.epci_id_seq TO app_python;


-- Name: TABLE icp_departement; Type: ACL; Schema: admin; Owner: sonum

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE admin.icp_departement TO app_python;
GRANT SELECT,REFERENCES ON TABLE admin.icp_departement TO min_scalingo;
GRANT SELECT ON TABLE admin.icp_departement TO min_dev;


-- Name: SEQUENCE icp_departement_id_seq; Type: ACL; Schema: admin; Owner: sonum

GRANT USAGE,UPDATE ON SEQUENCE admin.icp_departement_id_seq TO app_python;


-- Name: TABLE ifn_commune; Type: ACL; Schema: admin; Owner: sonum

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE admin.ifn_commune TO app_python;
GRANT SELECT,REFERENCES ON TABLE admin.ifn_commune TO min_scalingo;
GRANT SELECT ON TABLE admin.ifn_commune TO min_dev;


-- Name: SEQUENCE ifn_commune_id_seq; Type: ACL; Schema: admin; Owner: sonum

GRANT USAGE,UPDATE ON SEQUENCE admin.ifn_commune_id_seq TO app_python;


-- Name: TABLE ifn_departement; Type: ACL; Schema: admin; Owner: sonum

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE admin.ifn_departement TO app_python;
GRANT SELECT,REFERENCES ON TABLE admin.ifn_departement TO min_scalingo;
GRANT SELECT ON TABLE admin.ifn_departement TO min_dev;


-- Name: SEQUENCE ifn_departement_id_seq; Type: ACL; Schema: admin; Owner: sonum

GRANT USAGE,UPDATE ON SEQUENCE admin.ifn_departement_id_seq TO app_python;


-- Name: TABLE insee_cp; Type: ACL; Schema: admin; Owner: sonum

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE admin.insee_cp TO app_python;
GRANT SELECT,REFERENCES ON TABLE admin.insee_cp TO min_scalingo;
GRANT SELECT ON TABLE admin.insee_cp TO min_dev;


-- Name: SEQUENCE insee_cp_id_seq; Type: ACL; Schema: admin; Owner: sonum

GRANT USAGE,UPDATE ON SEQUENCE admin.insee_cp_id_seq TO app_python;


-- Name: TABLE insee_historique; Type: ACL; Schema: admin; Owner: sonum

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE admin.insee_historique TO app_python;
GRANT SELECT,REFERENCES ON TABLE admin.insee_historique TO min_scalingo;
GRANT SELECT ON TABLE admin.insee_historique TO min_dev;


-- Name: SEQUENCE insee_historique_id_seq; Type: ACL; Schema: admin; Owner: sonum

GRANT USAGE,UPDATE ON SEQUENCE admin.insee_historique_id_seq TO app_python;


-- Name: SEQUENCE region_id_seq; Type: ACL; Schema: admin; Owner: sonum

GRANT USAGE,UPDATE ON SEQUENCE admin.region_id_seq TO app_python;


-- Name: TABLE zonage; Type: ACL; Schema: admin; Owner: sonum

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE admin.zonage TO app_python;
GRANT SELECT,REFERENCES ON TABLE admin.zonage TO min_scalingo;
GRANT SELECT ON TABLE admin.zonage TO min_dev;


-- Name: SEQUENCE zonage_id_seq; Type: ACL; Schema: admin; Owner: sonum

GRANT USAGE,UPDATE ON SEQUENCE admin.zonage_id_seq TO app_python;


-- Name: TABLE adresse; Type: ACL; Schema: main; Owner: sonum

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE main.adresse TO app_python;
GRANT SELECT,INSERT,REFERENCES,UPDATE ON TABLE main.adresse TO min_scalingo;
GRANT SELECT ON TABLE main.adresse TO min_dev;


-- Name: TABLE personne; Type: ACL; Schema: main; Owner: sonum

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE main.personne TO app_python;
GRANT SELECT,REFERENCES ON TABLE main.personne TO min_scalingo;
GRANT SELECT ON TABLE main.personne TO min_dev;


-- Name: TABLE personne_affectations_emploi; Type: ACL; Schema: main; Owner: sonum

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE main.personne_affectations_emploi TO app_python;
GRANT SELECT,REFERENCES ON TABLE main.personne_affectations_emploi TO min_scalingo;
GRANT SELECT ON TABLE main.personne_affectations_emploi TO min_dev;


-- Name: TABLE personne_affectations_lieu; Type: ACL; Schema: main; Owner: sonum

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE main.personne_affectations_lieu TO app_python;
GRANT SELECT,REFERENCES ON TABLE main.personne_affectations_lieu TO min_scalingo;
GRANT SELECT ON TABLE main.personne_affectations_lieu TO min_dev;


-- Name: TABLE structure_administrative; Type: ACL; Schema: main; Owner: sonum

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE main.structure_administrative TO app_python;
GRANT SELECT,INSERT,REFERENCES,UPDATE ON TABLE main.structure_administrative TO min_scalingo;
GRANT SELECT ON TABLE main.structure_administrative TO min_dev;


-- Name: TABLE lieu_inclusion; Type: ACL; Schema: main; Owner: sonum

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE main.lieu_inclusion TO app_python;
GRANT SELECT,INSERT,REFERENCES,UPDATE ON TABLE main.lieu_inclusion TO min_scalingo;
GRANT SELECT ON TABLE main.lieu_inclusion TO min_dev;


-- Name: TABLE lieu_inclusion_structure_administrative; Type: ACL; Schema: main; Owner: sonum

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE main.lieu_inclusion_structure_administrative TO app_python;
GRANT SELECT,INSERT,REFERENCES,UPDATE ON TABLE main.lieu_inclusion_structure_administrative TO min_scalingo;
GRANT SELECT ON TABLE main.lieu_inclusion_structure_administrative TO min_dev;


-- Name: TABLE categories_juridiques; Type: ACL; Schema: reference; Owner: sonum

GRANT SELECT,REFERENCES ON TABLE reference.categories_juridiques TO min_scalingo;
GRANT SELECT ON TABLE reference.categories_juridiques TO min_dev;


-- Name: TABLE activites_coop; Type: ACL; Schema: main; Owner: sonum

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE main.activites_coop TO app_python;
GRANT SELECT,REFERENCES ON TABLE main.activites_coop TO min_scalingo;
GRANT SELECT ON TABLE main.activites_coop TO min_dev;


-- Name: TABLE poste; Type: ACL; Schema: main; Owner: sonum

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE main.poste TO app_python;
GRANT SELECT,REFERENCES ON TABLE main.poste TO min_scalingo;
GRANT SELECT ON TABLE main.poste TO min_dev;


-- Name: TABLE formation; Type: ACL; Schema: main; Owner: sonum

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE main.formation TO app_python;
GRANT SELECT,REFERENCES ON TABLE main.formation TO min_scalingo;
GRANT SELECT ON TABLE main.formation TO min_dev;


-- Name: TABLE contact; Type: ACL; Schema: main; Owner: sonum

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE main.contact TO app_python;
GRANT SELECT ON TABLE main.contact TO min_scalingo;
GRANT SELECT ON TABLE main.contact TO min_dev;


-- Name: TABLE contact_structure_administrative; Type: ACL; Schema: main; Owner: sonum

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE main.contact_structure_administrative TO app_python;
GRANT SELECT ON TABLE main.contact_structure_administrative TO min_scalingo;
GRANT SELECT ON TABLE main.contact_structure_administrative TO min_dev;


-- Name: TABLE contrat; Type: ACL; Schema: main; Owner: sonum

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE main.contrat TO app_python;
GRANT SELECT,REFERENCES ON TABLE main.contrat TO min_scalingo;
GRANT SELECT ON TABLE main.contrat TO min_dev;


-- Name: TABLE subvention; Type: ACL; Schema: main; Owner: sonum

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE main.subvention TO app_python;
GRANT SELECT,REFERENCES ON TABLE main.subvention TO min_scalingo;
GRANT SELECT ON TABLE main.subvention TO min_dev;


-- Name: SEQUENCE activites_coop_id_seq; Type: ACL; Schema: main; Owner: sonum

GRANT USAGE ON SEQUENCE main.activites_coop_id_seq TO app_python;


-- Name: SEQUENCE adresse_id_seq; Type: ACL; Schema: main; Owner: sonum

GRANT USAGE ON SEQUENCE main.adresse_id_seq TO app_python;
GRANT USAGE ON SEQUENCE main.adresse_id_seq TO min_scalingo;


-- Name: SEQUENCE contact_id_seq; Type: ACL; Schema: main; Owner: sonum

GRANT USAGE ON SEQUENCE main.contact_id_seq TO app_python;


-- Name: SEQUENCE contact_structure_id_seq; Type: ACL; Schema: main; Owner: sonum

GRANT USAGE ON SEQUENCE main.contact_structure_id_seq TO app_python;


-- Name: SEQUENCE contrat_id_seq; Type: ACL; Schema: main; Owner: sonum

GRANT USAGE ON SEQUENCE main.contrat_id_seq TO app_python;


-- Name: TABLE coordination_mediation; Type: ACL; Schema: main; Owner: sonum

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE main.coordination_mediation TO app_python;
GRANT SELECT,REFERENCES ON TABLE main.coordination_mediation TO min_scalingo;
GRANT SELECT ON TABLE main.coordination_mediation TO min_dev;


-- Name: SEQUENCE coordination_mediation_id_seq; Type: ACL; Schema: main; Owner: sonum

GRANT USAGE ON SEQUENCE main.coordination_mediation_id_seq TO app_python;


-- Name: SEQUENCE formation_id_seq; Type: ACL; Schema: main; Owner: sonum

GRANT USAGE ON SEQUENCE main.formation_id_seq TO app_python;


-- Name: SEQUENCE personne_affectations_id_seq; Type: ACL; Schema: main; Owner: sonum

GRANT USAGE ON SEQUENCE main.personne_affectations_id_seq TO app_python;


-- Name: SEQUENCE personne_id_seq; Type: ACL; Schema: main; Owner: sonum

GRANT USAGE ON SEQUENCE main.personne_id_seq TO app_python;


-- Name: SEQUENCE poste_id_seq; Type: ACL; Schema: main; Owner: sonum

GRANT USAGE ON SEQUENCE main.poste_id_seq TO app_python;


-- Name: SEQUENCE structure_id_seq; Type: ACL; Schema: main; Owner: sonum

GRANT USAGE ON SEQUENCE main.structure_id_seq TO app_python;
GRANT USAGE ON SEQUENCE main.structure_id_seq TO min_scalingo;


-- Name: SEQUENCE subvention_id_seq; Type: ACL; Schema: main; Owner: sonum

GRANT USAGE ON SEQUENCE main.subvention_id_seq TO app_python;


-- Name: TABLE naf; Type: ACL; Schema: reference; Owner: sonum

GRANT SELECT,REFERENCES ON TABLE reference.naf TO min_scalingo;
GRANT SELECT ON TABLE reference.naf TO min_dev;


-- Name: commune_epci commune_epci_pkey; Type: CONSTRAINT; Schema: admin; Owner: sonum

ALTER TABLE ONLY admin.commune_epci
  ADD CONSTRAINT commune_epci_pkey PRIMARY KEY (id);


-- Name: commune_epci commune_epci_ukey; Type: CONSTRAINT; Schema: admin; Owner: sonum

ALTER TABLE ONLY admin.commune_epci
  ADD CONSTRAINT commune_epci_ukey UNIQUE (commune_id, epci_id);


-- Name: commune commune_pkey; Type: CONSTRAINT; Schema: admin; Owner: sonum

ALTER TABLE ONLY admin.commune
  ADD CONSTRAINT commune_pkey PRIMARY KEY (id);


-- Name: commune commune_ukey; Type: CONSTRAINT; Schema: admin; Owner: sonum

ALTER TABLE ONLY admin.commune
  ADD CONSTRAINT commune_ukey UNIQUE (code_insee);


-- Name: departement departement_pkey; Type: CONSTRAINT; Schema: admin; Owner: sonum

ALTER TABLE ONLY admin.departement
  ADD CONSTRAINT departement_pkey PRIMARY KEY (id);


-- Name: departement departement_ukey; Type: CONSTRAINT; Schema: admin; Owner: sonum

ALTER TABLE ONLY admin.departement
  ADD CONSTRAINT departement_ukey UNIQUE (code);


-- Name: epci epci_pkey; Type: CONSTRAINT; Schema: admin; Owner: sonum

ALTER TABLE ONLY admin.epci
  ADD CONSTRAINT epci_pkey PRIMARY KEY (id);


-- Name: epci epci_ukey; Type: CONSTRAINT; Schema: admin; Owner: sonum

ALTER TABLE ONLY admin.epci
  ADD CONSTRAINT epci_ukey UNIQUE (code);


-- Name: icp_departement icp_departement_code_ukey; Type: CONSTRAINT; Schema: admin; Owner: sonum

ALTER TABLE ONLY admin.icp_departement
  ADD CONSTRAINT icp_departement_code_ukey UNIQUE (code);


-- Name: icp_departement icp_departement_pkey; Type: CONSTRAINT; Schema: admin; Owner: sonum

ALTER TABLE ONLY admin.icp_departement
  ADD CONSTRAINT icp_departement_pkey PRIMARY KEY (id);


-- Name: ifn_commune ifn_commune_pkey; Type: CONSTRAINT; Schema: admin; Owner: sonum

ALTER TABLE ONLY admin.ifn_commune
  ADD CONSTRAINT ifn_commune_pkey PRIMARY KEY (id);


-- Name: ifn_commune ifn_commune_ukey; Type: CONSTRAINT; Schema: admin; Owner: sonum

ALTER TABLE ONLY admin.ifn_commune
  ADD CONSTRAINT ifn_commune_ukey UNIQUE (code_insee);


-- Name: ifn_departement ifn_departement_code_dept_unique; Type: CONSTRAINT; Schema: admin; Owner: sonum

ALTER TABLE ONLY admin.ifn_departement
  ADD CONSTRAINT ifn_departement_code_dept_unique UNIQUE (code);


-- Name: ifn_departement ifn_departement_pkey; Type: CONSTRAINT; Schema: admin; Owner: sonum

ALTER TABLE ONLY admin.ifn_departement
  ADD CONSTRAINT ifn_departement_pkey PRIMARY KEY (id);


-- Name: insee_cp insee_cp_pkey; Type: CONSTRAINT; Schema: admin; Owner: sonum

ALTER TABLE ONLY admin.insee_cp
  ADD CONSTRAINT insee_cp_pkey PRIMARY KEY (id);


-- Name: insee_cp insee_cp_ukey; Type: CONSTRAINT; Schema: admin; Owner: sonum

ALTER TABLE ONLY admin.insee_cp
  ADD CONSTRAINT insee_cp_ukey UNIQUE (code_postal, code_insee);


-- Name: insee_historique insee_historique_pkey; Type: CONSTRAINT; Schema: admin; Owner: sonum

ALTER TABLE ONLY admin.insee_historique
  ADD CONSTRAINT insee_historique_pkey PRIMARY KEY (id);


-- Name: insee_historique insee_historique_ukey; Type: CONSTRAINT; Schema: admin; Owner: sonum

ALTER TABLE ONLY admin.insee_historique
  ADD CONSTRAINT insee_historique_ukey UNIQUE (code_insee_ancien, code_insee_nouveau);


-- Name: region region_pkey; Type: CONSTRAINT; Schema: admin; Owner: sonum

ALTER TABLE ONLY admin.region
  ADD CONSTRAINT region_pkey PRIMARY KEY (id);


-- Name: region region_ukey; Type: CONSTRAINT; Schema: admin; Owner: sonum

ALTER TABLE ONLY admin.region
  ADD CONSTRAINT region_ukey UNIQUE (code);


-- Name: zonage zonage_code_ukey; Type: CONSTRAINT; Schema: admin; Owner: sonum

ALTER TABLE ONLY admin.zonage
  ADD CONSTRAINT zonage_code_ukey UNIQUE (code, code_insee);


-- Name: zonage zonage_pkey; Type: CONSTRAINT; Schema: admin; Owner: sonum

ALTER TABLE ONLY admin.zonage
  ADD CONSTRAINT zonage_pkey PRIMARY KEY (id);


-- Name: personne_merge_log personne_merge_log_pkey; Type: CONSTRAINT; Schema: audit; Owner: sonum

ALTER TABLE ONLY audit.personne_merge_log
  ADD CONSTRAINT personne_merge_log_pkey PRIMARY KEY (id);


-- Name: structure_merge_log structure_merge_log_pkey; Type: CONSTRAINT; Schema: audit; Owner: sonum

ALTER TABLE ONLY audit.structure_merge_log
  ADD CONSTRAINT structure_merge_log_pkey PRIMARY KEY (id);


-- Name: activites_coop activites_coop_coop_id_ukey; Type: CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.activites_coop
  ADD CONSTRAINT activites_coop_coop_id_ukey UNIQUE (coop_id);


-- Name: activites_coop activites_coop_pkey; Type: CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.activites_coop
  ADD CONSTRAINT activites_coop_pkey PRIMARY KEY (id);


-- Name: adresse adresse_code_ban_ukey; Type: CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.adresse
  ADD CONSTRAINT adresse_code_ban_ukey UNIQUE (code_ban);


-- Name: adresse adresse_pkey; Type: CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.adresse
  ADD CONSTRAINT adresse_pkey PRIMARY KEY (id);


-- Name: contact contact_pkey; Type: CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.contact
  ADD CONSTRAINT contact_pkey PRIMARY KEY (id);


-- Name: contact_structure_administrative contact_structure_administrative_pkey; Type: CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.contact_structure_administrative
  ADD CONSTRAINT contact_structure_administrative_pkey PRIMARY KEY (id);


-- Name: contact_structure_administrative contact_structure_administrative_unique; Type: CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.contact_structure_administrative
  ADD CONSTRAINT contact_structure_administrative_unique UNIQUE (structure_administrative_id, contact_id);


-- Name: contrat contrat_pkey; Type: CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.contrat
  ADD CONSTRAINT contrat_pkey PRIMARY KEY (id);


-- Name: coordination_mediation coordination_mediation_pkey; Type: CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.coordination_mediation
  ADD CONSTRAINT coordination_mediation_pkey PRIMARY KEY (id);


-- Name: formation formation_pkey; Type: CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.formation
  ADD CONSTRAINT formation_pkey PRIMARY KEY (id);


-- Name: personne_affectations_emploi personne_affectations_emploi_pkey; Type: CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.personne_affectations_emploi
  ADD CONSTRAINT personne_affectations_emploi_pkey PRIMARY KEY (id);


-- Name: personne_affectations_lieu personne_affectations_lieu_pkey; Type: CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.personne_affectations_lieu
  ADD CONSTRAINT personne_affectations_lieu_pkey PRIMARY KEY (id);


-- Name: personne personne_aidant_connect_id_ukey; Type: CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.personne
  ADD CONSTRAINT personne_aidant_connect_id_ukey UNIQUE (aidant_connect_id);


-- Name: personne personne_cn_pg_id_ukey; Type: CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.personne
  ADD CONSTRAINT personne_cn_pg_id_ukey UNIQUE (cn_pg_id);


-- Name: personne personne_conseiller_numerique_id_ukey; Type: CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.personne
  ADD CONSTRAINT personne_conseiller_numerique_id_ukey UNIQUE (conseiller_numerique_id);


-- Name: personne personne_coop_id_ukey; Type: CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.personne
  ADD CONSTRAINT personne_coop_id_ukey UNIQUE (coop_id);


-- Name: personne personne_pkey; Type: CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.personne
  ADD CONSTRAINT personne_pkey PRIMARY KEY (id);


-- Name: poste poste_pkey; Type: CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.poste
  ADD CONSTRAINT poste_pkey PRIMARY KEY (id);


-- Name: poste poste_ukey; Type: CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.poste
  ADD CONSTRAINT poste_ukey UNIQUE (poste_conum_id, structure_id, personne_id);


-- Name: lieu_inclusion lieu_inclusion_carto_id_ukey; Type: CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.lieu_inclusion
  ADD CONSTRAINT lieu_inclusion_carto_id_ukey UNIQUE (structure_cartographie_nationale_id);


-- Name: lieu_inclusion lieu_inclusion_old_main_structure_id_ukey; Type: CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.lieu_inclusion
  ADD CONSTRAINT lieu_inclusion_old_main_structure_id_ukey UNIQUE (old_main_structure_id);


-- Name: lieu_inclusion lieu_inclusion_pkey; Type: CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.lieu_inclusion
  ADD CONSTRAINT lieu_inclusion_pkey PRIMARY KEY (id);


-- Name: lieu_inclusion lieu_inclusion_structure_coop_id_ukey; Type: CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.lieu_inclusion
  ADD CONSTRAINT lieu_inclusion_structure_coop_id_ukey UNIQUE (structure_coop_id);


-- Name: lieu_inclusion_structure_administrative lieu_inclusion_structure_administrative_pkey; Type: CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.lieu_inclusion_structure_administrative
  ADD CONSTRAINT lieu_inclusion_structure_administrative_pkey PRIMARY KEY (id);


-- Name: lieu_inclusion_structure_administrative lieu_inclusion_structure_administrative_ukey; Type: CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.lieu_inclusion_structure_administrative
  ADD CONSTRAINT lieu_inclusion_structure_administrative_ukey UNIQUE (lieu_id, structure_administrative_id);


-- Name: structure_administrative structure_administrative_old_main_structure_id_ukey; Type: CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.structure_administrative
  ADD CONSTRAINT structure_administrative_old_main_structure_id_ukey UNIQUE (old_main_structure_id);


-- Name: structure_administrative structure_administrative_pkey; Type: CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.structure_administrative
  ADD CONSTRAINT structure_administrative_pkey PRIMARY KEY (id);


-- Name: structure_administrative structure_administrative_ridet_ukey; Type: CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.structure_administrative
  ADD CONSTRAINT structure_administrative_ridet_ukey UNIQUE (ridet);


-- Name: structure_administrative structure_administrative_siret_ukey; Type: CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.structure_administrative
  ADD CONSTRAINT structure_administrative_siret_ukey UNIQUE (siret);


-- Name: structure_administrative structure_administrative_structure_ac_id_ukey; Type: CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.structure_administrative
  ADD CONSTRAINT structure_administrative_structure_ac_id_ukey UNIQUE (structure_ac_id);


-- Name: structure_administrative structure_administrative_structure_coop_id_ukey; Type: CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.structure_administrative
  ADD CONSTRAINT structure_administrative_structure_coop_id_ukey UNIQUE (structure_coop_id);


-- Name: structure_administrative structure_administrative_structure_tp_id_ukey; Type: CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.structure_administrative
  ADD CONSTRAINT structure_administrative_structure_tp_id_ukey UNIQUE (structure_tp_id);


-- Name: subvention subvention_pkey; Type: CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.subvention
  ADD CONSTRAINT subvention_pkey PRIMARY KEY (id);


-- Name: categories_juridiques categories_juridiques_pkey; Type: CONSTRAINT; Schema: reference; Owner: sonum

ALTER TABLE ONLY reference.categories_juridiques
  ADD CONSTRAINT categories_juridiques_pkey PRIMARY KEY (id);


-- Name: categories_juridiques categories_juridiques_ukey; Type: CONSTRAINT; Schema: reference; Owner: sonum

ALTER TABLE ONLY reference.categories_juridiques
  ADD CONSTRAINT categories_juridiques_ukey UNIQUE (code);


-- Name: naf naf_pkey; Type: CONSTRAINT; Schema: reference; Owner: sonum

ALTER TABLE ONLY reference.naf
  ADD CONSTRAINT naf_pkey PRIMARY KEY (id);


-- Name: naf naf_ukey; Type: CONSTRAINT; Schema: reference; Owner: sonum

ALTER TABLE ONLY reference.naf
  ADD CONSTRAINT naf_ukey UNIQUE (code);


-- Name: commune_geom_idx; Type: INDEX; Schema: admin; Owner: sonum

CREATE INDEX commune_geom_idx ON admin.commune USING gist (geom);


-- Name: commune_nom_idx; Type: INDEX; Schema: admin; Owner: sonum

CREATE INDEX commune_nom_idx ON admin.commune USING btree (nom);


-- Name: ifn_commune_code_insee_idx; Type: INDEX; Schema: admin; Owner: sonum

CREATE INDEX ifn_commune_code_insee_idx ON admin.ifn_commune USING btree (code_insee);


-- Name: ifn_departement_code_dept_idx; Type: INDEX; Schema: admin; Owner: sonum

CREATE INDEX ifn_departement_code_dept_idx ON admin.ifn_departement USING btree (code);


-- Name: zonage_code_insee_idx; Type: INDEX; Schema: admin; Owner: sonum

CREATE INDEX zonage_code_insee_idx ON admin.zonage USING btree (code_insee);


-- Name: zonage_frr_ukey; Type: INDEX; Schema: admin; Owner: sonum

CREATE UNIQUE INDEX zonage_frr_ukey ON admin.zonage USING btree (code_insee) WHERE ((type)::text = 'FRR'::text);


-- Name: zonage_geom_idx; Type: INDEX; Schema: admin; Owner: sonum

CREATE INDEX zonage_geom_idx ON admin.zonage USING gist (geom);


-- Name: personne_merge_log_loser_idx; Type: INDEX; Schema: audit; Owner: sonum

CREATE INDEX personne_merge_log_loser_idx ON audit.personne_merge_log USING btree (loser_id);


-- Name: personne_merge_log_merged_at_idx; Type: INDEX; Schema: audit; Owner: sonum

CREATE INDEX personne_merge_log_merged_at_idx ON audit.personne_merge_log USING btree (merged_at);


-- Name: personne_merge_log_run_idx; Type: INDEX; Schema: audit; Owner: sonum

CREATE INDEX personne_merge_log_run_idx ON audit.personne_merge_log USING btree (run_id);


-- Name: personne_merge_log_winner_idx; Type: INDEX; Schema: audit; Owner: sonum

CREATE INDEX personne_merge_log_winner_idx ON audit.personne_merge_log USING btree (winner_id);


-- Name: structure_merge_log_loser_idx; Type: INDEX; Schema: audit; Owner: sonum

CREATE INDEX structure_merge_log_loser_idx ON audit.structure_merge_log USING btree (loser_id);


-- Name: structure_merge_log_merged_at_idx; Type: INDEX; Schema: audit; Owner: sonum

CREATE INDEX structure_merge_log_merged_at_idx ON audit.structure_merge_log USING btree (merged_at);


-- Name: structure_merge_log_run_idx; Type: INDEX; Schema: audit; Owner: sonum

CREATE INDEX structure_merge_log_run_idx ON audit.structure_merge_log USING btree (run_id);


-- Name: structure_merge_log_winner_idx; Type: INDEX; Schema: audit; Owner: sonum

CREATE INDEX structure_merge_log_winner_idx ON audit.structure_merge_log USING btree (winner_id);


-- Name: activites_coop_lieu_code_insee_idx; Type: INDEX; Schema: main; Owner: sonum

CREATE INDEX activites_coop_lieu_code_insee_idx ON main.activites_coop USING btree (lieu_code_insee);


-- Name: activites_coop_periode_idx; Type: INDEX; Schema: main; Owner: sonum

CREATE INDEX activites_coop_periode_idx ON main.activites_coop USING btree (periode);


-- Name: activites_coop_personne_id_idx; Type: INDEX; Schema: main; Owner: sonum

CREATE INDEX activites_coop_personne_id_idx ON main.activites_coop USING btree (personne_id);


-- Name: adresse_code_insee_idx; Type: INDEX; Schema: main; Owner: sonum

CREATE INDEX adresse_code_insee_idx ON main.adresse USING btree (code_insee);


-- Name: adresse_geom_idx; Type: INDEX; Schema: main; Owner: sonum

CREATE INDEX adresse_geom_idx ON main.adresse USING gist (geom);


-- Name: adresse_ukey; Type: INDEX; Schema: main; Owner: sonum

CREATE UNIQUE INDEX adresse_ukey ON main.adresse USING btree (code_postal, nom_commune, nom_voie, COALESCE((numero_voie)::integer, 0), COALESCE(repetition, ''::character varying));


-- Name: contact_structure_contact_id_idx; Type: INDEX; Schema: main; Owner: sonum

CREATE INDEX contact_structure_contact_id_idx ON main.contact_structure_administrative USING btree (contact_id);


-- Name: contact_structure_administrative_structure_id_idx; Type: INDEX; Schema: main; Owner: sonum

CREATE INDEX contact_structure_administrative_structure_id_idx ON main.contact_structure_administrative USING btree (structure_administrative_id);


-- Name: coordination_mediation_ukey; Type: INDEX; Schema: main; Owner: sonum

CREATE UNIQUE INDEX coordination_mediation_ukey ON main.coordination_mediation USING btree (coordinateur_id, mediateur_id, COALESCE(suppression, '1234-01-02 03:04:05+00'::timestamp with time zone));


-- Name: formation_personne_id_idx; Type: INDEX; Schema: main; Owner: sonum

CREATE INDEX formation_personne_id_idx ON main.formation USING btree (personne_id);


-- Name: idx_activites_coop_lieu_id; Type: INDEX; Schema: main; Owner: sonum

CREATE INDEX idx_activites_coop_lieu_id ON main.activites_coop USING btree (lieu_id);


-- Name: idx_contrat_structure_id; Type: INDEX; Schema: main; Owner: sonum

CREATE INDEX idx_contrat_structure_id ON main.contrat USING btree (structure_id);


-- Name: idx_personne_affectations_emploi_personne_id; Type: INDEX; Schema: main; Owner: sonum

CREATE INDEX idx_personne_affectations_emploi_personne_id ON main.personne_affectations_emploi USING btree (personne_id);


-- Name: idx_personne_affectations_emploi_structure_administrative_id; Type: INDEX; Schema: main; Owner: sonum

CREATE INDEX idx_personne_affectations_emploi_structure_administrative_id ON main.personne_affectations_emploi USING btree (structure_administrative_id);


-- Name: idx_personne_affectations_emploi_active; Type: INDEX; Schema: main; Owner: sonum

CREATE INDEX idx_personne_affectations_emploi_active ON main.personne_affectations_emploi USING btree (structure_administrative_id, est_active) WHERE (est_active = true);


-- Name: idx_personne_affectations_lieu_personne_id; Type: INDEX; Schema: main; Owner: sonum

CREATE INDEX idx_personne_affectations_lieu_personne_id ON main.personne_affectations_lieu USING btree (personne_id);


-- Name: idx_personne_affectations_lieu_lieu_id; Type: INDEX; Schema: main; Owner: sonum

CREATE INDEX idx_personne_affectations_lieu_lieu_id ON main.personne_affectations_lieu USING btree (lieu_id);


-- Name: idx_personne_affectations_lieu_active; Type: INDEX; Schema: main; Owner: sonum

CREATE INDEX idx_personne_affectations_lieu_active ON main.personne_affectations_lieu USING btree (lieu_id, est_active) WHERE (est_active = true);


-- Name: idx_poste_structure_id; Type: INDEX; Schema: main; Owner: sonum

CREATE INDEX idx_poste_structure_id ON main.poste USING btree (structure_id);


-- Name: personne_affectations_emploi_ukey; Type: INDEX; Schema: main; Owner: sonum

CREATE UNIQUE INDEX personne_affectations_emploi_ukey ON main.personne_affectations_emploi USING btree (personne_id, structure_administrative_id, source);


-- Name: personne_affectations_lieu_ukey; Type: INDEX; Schema: main; Owner: sonum

CREATE UNIQUE INDEX personne_affectations_lieu_ukey ON main.personne_affectations_lieu USING btree (personne_id, lieu_id, source);


-- Name: personne_patronyme; Type: INDEX; Schema: main; Owner: sonum

CREATE INDEX personne_patronyme ON main.personne USING btree (nom, prenom);


-- Name: personne_trgm_idx; Type: INDEX; Schema: main; Owner: sonum

CREATE INDEX personne_trgm_idx ON main.personne USING gist (((((prenom)::text || ' '::text) || (nom)::text)) public.gist_trgm_ops (siglen='64'));


-- Name: lieu_inclusion_adresse_id_idx; Type: INDEX; Schema: main; Owner: sonum

CREATE INDEX lieu_inclusion_adresse_id_idx ON main.lieu_inclusion USING btree (adresse_id);


-- Name: lieu_inclusion_nom_idx; Type: INDEX; Schema: main; Owner: sonum

CREATE INDEX lieu_inclusion_nom_idx ON main.lieu_inclusion USING btree (nom);


-- Name: lieu_inclusion_visible_idx; Type: INDEX; Schema: main; Owner: sonum

CREATE INDEX lieu_inclusion_visible_idx ON main.lieu_inclusion USING btree (visible_pour_cartographie_nationale) WHERE (visible_pour_cartographie_nationale = true);


-- Name: lieu_inclusion_structure_administrative_admin_id_idx; Type: INDEX; Schema: main; Owner: sonum

CREATE INDEX lieu_inclusion_structure_administrative_admin_id_idx ON main.lieu_inclusion_structure_administrative USING btree (structure_administrative_id);


-- Name: lieu_inclusion_structure_administrative_lieu_id_idx; Type: INDEX; Schema: main; Owner: sonum

CREATE INDEX lieu_inclusion_structure_administrative_lieu_id_idx ON main.lieu_inclusion_structure_administrative USING btree (lieu_id);


-- Name: structure_administrative_adresse_id_idx; Type: INDEX; Schema: main; Owner: sonum

CREATE INDEX structure_administrative_adresse_id_idx ON main.structure_administrative USING btree (adresse_id);


-- Name: structure_administrative_denomination_sirene_idx; Type: INDEX; Schema: main; Owner: sonum

CREATE INDEX structure_administrative_denomination_sirene_idx ON main.structure_administrative USING btree (denomination_sirene);


-- Name: commune commune_departement_id; Type: FK CONSTRAINT; Schema: admin; Owner: sonum

ALTER TABLE ONLY admin.commune
  ADD CONSTRAINT commune_departement_id FOREIGN KEY (departement_id) REFERENCES admin.departement(id);


-- Name: commune_epci commune_epci_commune_id; Type: FK CONSTRAINT; Schema: admin; Owner: sonum

ALTER TABLE ONLY admin.commune_epci
  ADD CONSTRAINT commune_epci_commune_id FOREIGN KEY (commune_id) REFERENCES admin.commune(id);


-- Name: commune_epci commune_epci_epci_id; Type: FK CONSTRAINT; Schema: admin; Owner: sonum

ALTER TABLE ONLY admin.commune_epci
  ADD CONSTRAINT commune_epci_epci_id FOREIGN KEY (epci_id) REFERENCES admin.epci(id);


-- Name: departement departement_region_id; Type: FK CONSTRAINT; Schema: admin; Owner: sonum

ALTER TABLE ONLY admin.departement
  ADD CONSTRAINT departement_region_id FOREIGN KEY (region_id) REFERENCES admin.region(id);


-- Name: zonage zonage_code_insee_fkey; Type: FK CONSTRAINT; Schema: admin; Owner: sonum

ALTER TABLE ONLY admin.zonage
  ADD CONSTRAINT zonage_code_insee_fkey FOREIGN KEY (code_insee) REFERENCES admin.commune(code_insee);


-- Name: activites_coop activites_coop_personne_id_fkey; Type: FK CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.activites_coop
  ADD CONSTRAINT activites_coop_personne_id_fkey FOREIGN KEY (personne_id) REFERENCES main.personne(id);


-- Name: activites_coop activites_coop_lieu_id_fkey; Type: FK CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.activites_coop
  ADD CONSTRAINT activites_coop_lieu_id_fkey FOREIGN KEY (lieu_id) REFERENCES main.lieu_inclusion(id) ON DELETE SET NULL;


-- Name: contact_structure_administrative contact_structure_contact_id_fkey; Type: FK CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.contact_structure_administrative
  ADD CONSTRAINT contact_structure_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES main.contact(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Name: contact_structure_administrative contact_structure_administrative_structure_id_fkey; Type: FK CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.contact_structure_administrative
  ADD CONSTRAINT contact_structure_administrative_structure_id_fkey FOREIGN KEY (structure_administrative_id) REFERENCES main.structure_administrative(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Name: contrat contrat_personne_id_fkey; Type: FK CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.contrat
  ADD CONSTRAINT contrat_personne_id_fkey FOREIGN KEY (personne_id) REFERENCES main.personne(id);


-- Name: contrat contrat_structure_id_fkey; Type: FK CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.contrat
  ADD CONSTRAINT contrat_structure_id_fkey FOREIGN KEY (structure_id) REFERENCES main.structure_administrative(id);


-- Name: coordination_mediation coordination_mediation_coodinateur_id_fkey; Type: FK CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.coordination_mediation
  ADD CONSTRAINT coordination_mediation_coodinateur_id_fkey FOREIGN KEY (coordinateur_id) REFERENCES main.personne(id);


-- Name: coordination_mediation coordination_mediation_mediateur_id_fkey; Type: FK CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.coordination_mediation
  ADD CONSTRAINT coordination_mediation_mediateur_id_fkey FOREIGN KEY (mediateur_id) REFERENCES main.personne(id);


-- Name: formation formation_personne_id_fkey; Type: FK CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.formation
  ADD CONSTRAINT formation_personne_id_fkey FOREIGN KEY (personne_id) REFERENCES main.personne(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Name: personne_affectations_emploi personne_affectations_emploi_personne_fkey; Type: FK CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.personne_affectations_emploi
  ADD CONSTRAINT personne_affectations_emploi_personne_fkey FOREIGN KEY (personne_id) REFERENCES main.personne(id);


-- Name: personne_affectations_emploi personne_affectations_emploi_admin_fkey; Type: FK CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.personne_affectations_emploi
  ADD CONSTRAINT personne_affectations_emploi_admin_fkey FOREIGN KEY (structure_administrative_id) REFERENCES main.structure_administrative(id);


-- Name: personne_affectations_lieu personne_affectations_lieu_personne_fkey; Type: FK CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.personne_affectations_lieu
  ADD CONSTRAINT personne_affectations_lieu_personne_fkey FOREIGN KEY (personne_id) REFERENCES main.personne(id);


-- Name: personne_affectations_lieu personne_affectations_lieu_lieu_fkey; Type: FK CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.personne_affectations_lieu
  ADD CONSTRAINT personne_affectations_lieu_lieu_fkey FOREIGN KEY (lieu_id) REFERENCES main.lieu_inclusion(id);


-- Name: lieu_inclusion lieu_inclusion_adresse_fkey; Type: FK CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.lieu_inclusion
  ADD CONSTRAINT lieu_inclusion_adresse_fkey FOREIGN KEY (adresse_id) REFERENCES main.adresse(id);


-- Name: lieu_inclusion_structure_administrative lieu_inclusion_structure_administrative_admin_fkey; Type: FK CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.lieu_inclusion_structure_administrative
  ADD CONSTRAINT lieu_inclusion_structure_administrative_admin_fkey FOREIGN KEY (structure_administrative_id) REFERENCES main.structure_administrative(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Name: lieu_inclusion_structure_administrative lieu_inclusion_structure_administrative_lieu_fkey; Type: FK CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.lieu_inclusion_structure_administrative
  ADD CONSTRAINT lieu_inclusion_structure_administrative_lieu_fkey FOREIGN KEY (lieu_id) REFERENCES main.lieu_inclusion(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Name: poste poste_personne_id_fkey; Type: FK CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.poste
  ADD CONSTRAINT poste_personne_id_fkey FOREIGN KEY (personne_id) REFERENCES main.personne(id);


-- Name: poste poste_structure_id_fkey; Type: FK CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.poste
  ADD CONSTRAINT poste_structure_id_fkey FOREIGN KEY (structure_id) REFERENCES main.structure_administrative(id);


-- Name: structure_administrative structure_administrative_adresse_fkey; Type: FK CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.structure_administrative
  ADD CONSTRAINT structure_administrative_adresse_fkey FOREIGN KEY (adresse_id) REFERENCES main.adresse(id);


-- Name: structure_administrative structure_administrative_categorie_juridique_fkey; Type: FK CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.structure_administrative
  ADD CONSTRAINT structure_administrative_categorie_juridique_fkey FOREIGN KEY (categorie_juridique) REFERENCES reference.categories_juridiques(code);


-- Name: subvention subvention_poste_id_fkey; Type: FK CONSTRAINT; Schema: main; Owner: sonum

ALTER TABLE ONLY main.subvention
  ADD CONSTRAINT subvention_poste_id_fkey FOREIGN KEY (poste_id) REFERENCES main.poste(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: admin; Owner: sonum

ALTER DEFAULT PRIVILEGES FOR ROLE sonum IN SCHEMA admin GRANT USAGE,UPDATE ON SEQUENCES TO app_python;


-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: admin; Owner: sonum

ALTER DEFAULT PRIVILEGES FOR ROLE sonum IN SCHEMA admin GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLES TO app_python;
ALTER DEFAULT PRIVILEGES FOR ROLE sonum IN SCHEMA admin GRANT SELECT ON TABLES TO min_scalingo;
ALTER DEFAULT PRIVILEGES FOR ROLE sonum IN SCHEMA admin GRANT SELECT ON TABLES TO min_dev;


-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: main; Owner: sonum

ALTER DEFAULT PRIVILEGES FOR ROLE sonum IN SCHEMA main GRANT USAGE ON SEQUENCES TO app_python;


-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: main; Owner: sonum

ALTER DEFAULT PRIVILEGES FOR ROLE sonum IN SCHEMA main GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLES TO app_python;
ALTER DEFAULT PRIVILEGES FOR ROLE sonum IN SCHEMA main GRANT SELECT ON TABLES TO min_scalingo;
ALTER DEFAULT PRIVILEGES FOR ROLE sonum IN SCHEMA main GRANT SELECT ON TABLES TO min_dev;


-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: reference; Owner: sonum

ALTER DEFAULT PRIVILEGES FOR ROLE sonum IN SCHEMA reference GRANT SELECT ON TABLES TO min_scalingo;
ALTER DEFAULT PRIVILEGES FOR ROLE sonum IN SCHEMA reference GRANT SELECT ON TABLES TO min_dev;




SET default_tablespace = '';

SET default_table_access_method = heap;

