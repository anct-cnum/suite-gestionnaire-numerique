-- PostgreSQL database dump

-- Dumped from database version 16.4
-- Dumped by pg_dump version 16.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Name: admin; Type: SCHEMA; Schema: -; Owner: dataspace




-- Name: audit; Type: SCHEMA; Schema: -; Owner: dataspace




-- Name: main; Type: SCHEMA; Schema: -; Owner: dataspace




-- Name: reference; Type: SCHEMA; Schema: -; Owner: dataspace




-- Name: staging; Type: SCHEMA; Schema: -; Owner: dataspace

CREATE SCHEMA staging;


ALTER SCHEMA staging OWNER TO sonum;

-- Name: citext; Type: EXTENSION; Schema: -; Owner: -

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








-- Name: dispositif_programme_national; Type: TYPE; Schema: main; Owner: dataspace

CREATE TYPE main.dispositif_programme_national AS ENUM (
    'Aidants Connect',
    'Bibliothèques numérique de référence',
    'Certification PIX',
    'Conseillers numériques',
    'Emmaüs Connect',
    'France Services',
    'Grande école du numérique',
    'La Croix Rouge',
    'Point d''accès numérique CAF',
    'Promeneurs du net',
    'Relais numérique (Emmaüs Connect)'
);


ALTER TYPE main.dispositif_programme_national OWNER TO sonum;

-- Name: TYPE dispositif_programme_national; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON TYPE main.dispositif_programme_national IS 'Aligné sur l''enum coop.dispositif_programme_national (coop-mediation-numerique). Toute évolution doit être coordonnée avec l''équipe coop.';


-- Name: formation_label; Type: TYPE; Schema: main; Owner: dataspace

CREATE TYPE main.formation_label AS ENUM (
    'Formé à « Mon Espace Santé »',
    'Formé à « DUPLEX » (illettrisme)',
    'Arnia/MedNum BFC (Bourgogne-Franche-Comté)',
    'Collectif ressources et acteurs réemploi (Normandie)',
    'Fabriques de Territoire',
    'Les Éclaireurs du numérique (Drôme)',
    'Mes Papiers (Métropole de Lyon)',
    'ORDI 3.0',
    'SUD LABS (PACA)'
);


ALTER TYPE main.formation_label OWNER TO sonum;

-- Name: TYPE formation_label; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON TYPE main.formation_label IS 'Aligné sur l''enum coop.formation_label (coop-mediation-numerique). Toute évolution doit être coordonnée avec l''équipe coop.';


-- Name: frais_a_charge; Type: TYPE; Schema: main; Owner: dataspace

CREATE TYPE main.frais_a_charge AS ENUM (
    'Gratuit',
    'Gratuit sous condition',
    'Payant'
);


ALTER TYPE main.frais_a_charge OWNER TO sonum;

-- Name: TYPE frais_a_charge; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON TYPE main.frais_a_charge IS 'Aligné sur l''enum coop.frais_a_charge (coop-mediation-numerique). Toute évolution doit être coordonnée avec l''équipe coop.';


-- Name: itinerance; Type: TYPE; Schema: main; Owner: dataspace

CREATE TYPE main.itinerance AS ENUM (
    'Itinérant',
    'Fixe'
);


ALTER TYPE main.itinerance OWNER TO sonum;

-- Name: TYPE itinerance; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON TYPE main.itinerance IS 'Aligné sur l''enum coop.itinerance (coop-mediation-numerique). Toute évolution doit être coordonnée avec l''équipe coop.';


-- Name: modalite_acces; Type: TYPE; Schema: main; Owner: dataspace

CREATE TYPE main.modalite_acces AS ENUM (
    'Se présenter',
    'Téléphoner',
    'Contacter par mail',
    'Prendre un RDV en ligne',
    'Ce lieu n’accueille pas de public',
    'Envoyer un mail avec une fiche de prescription'
);


ALTER TYPE main.modalite_acces OWNER TO sonum;

-- Name: TYPE modalite_acces; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON TYPE main.modalite_acces IS 'Aligné sur l''enum coop.modalite_acces (coop-mediation-numerique). Contient l''apostrophe typographique U+2019 («n’accueille»), à préserver verbatim. Toute évolution doit être coordonnée avec l''équipe coop.';


-- Name: modalite_accompagnement; Type: TYPE; Schema: main; Owner: dataspace

CREATE TYPE main.modalite_accompagnement AS ENUM (
    'En autonomie',
    'Accompagnement individuel',
    'Dans un atelier collectif',
    'À distance'
);


ALTER TYPE main.modalite_accompagnement OWNER TO sonum;

-- Name: TYPE modalite_accompagnement; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON TYPE main.modalite_accompagnement IS 'Aligné sur l''enum coop.modalite_accompagnement (coop-mediation-numerique). Toute évolution doit être coordonnée avec l''équipe coop.';


-- Name: prise_en_charge_specifique; Type: TYPE; Schema: main; Owner: dataspace

CREATE TYPE main.prise_en_charge_specifique AS ENUM (
    'Surdité',
    'Handicaps moteurs',
    'Handicaps mentaux',
    'Illettrisme',
    'Langues étrangères (anglais)',
    'Langues étrangères (autres)',
    'Déficience visuelle'
);


ALTER TYPE main.prise_en_charge_specifique OWNER TO sonum;

-- Name: TYPE prise_en_charge_specifique; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON TYPE main.prise_en_charge_specifique IS 'Aligné sur l''enum coop.prise_en_charge_specifique (coop-mediation-numerique). Toute évolution doit être coordonnée avec l''équipe coop.';


-- Name: public_specifiquement_adresse; Type: TYPE; Schema: main; Owner: dataspace

CREATE TYPE main.public_specifiquement_adresse AS ENUM (
    'Jeunes',
    'Étudiants',
    'Familles et/ou enfants',
    'Seniors',
    'Femmes'
);


ALTER TYPE main.public_specifiquement_adresse OWNER TO sonum;

-- Name: TYPE public_specifiquement_adresse; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON TYPE main.public_specifiquement_adresse IS 'Aligné sur l''enum coop.public_specifiquement_adresse (coop-mediation-numerique). Toute évolution doit être coordonnée avec l''équipe coop.';


-- Name: service; Type: TYPE; Schema: main; Owner: dataspace

CREATE TYPE main.service AS ENUM (
    'Aide aux démarches administratives',
    'Maîtrise des outils numériques du quotidien',
    'Insertion professionnelle via le numérique',
    'Utilisation sécurisée du numérique',
    'Parentalité et éducation avec le numérique',
    'Loisirs et créations numériques',
    'Compréhension du monde numérique',
    'Accès internet et matériel informatique',
    'Acquisition de matériel informatique à prix solidaire'
);


ALTER TYPE main.service OWNER TO sonum;

-- Name: TYPE service; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON TYPE main.service IS 'Aligné sur l''enum coop.service (coop-mediation-numerique, schema.prisma). Toute évolution doit être coordonnée avec l''équipe coop.';


-- Name: typologie; Type: TYPE; Schema: main; Owner: dataspace

CREATE TYPE main.typologie AS ENUM (
    'ACI',
    'ACIPHC',
    'AFPA',
    'AI',
    'ASE',
    'ASSO',
    'ASSO_CHOMEUR',
    'Autre',
    'AVIP',
    'BIB',
    'CAARUD',
    'CADA',
    'CAF',
    'CAP_EMPLOI',
    'CAVA',
    'CC',
    'CCAS',
    'CCONS',
    'CD',
    'CDAS',
    'CFP',
    'CHRS',
    'CHU',
    'CIAS',
    'CIDFF',
    'CITMET',
    'CMP',
    'CMS',
    'CPAM',
    'CPH',
    'CS',
    'CSAPA',
    'CSC',
    'DEETS',
    'DEPT',
    'DIPLP',
    'E2C',
    'EA',
    'EATT',
    'EI',
    'EITI',
    'ENM',
    'EPCI',
    'EPI',
    'EPIDE',
    'EPN',
    'ES',
    'ESAT',
    'ESS',
    'ETTI',
    'EVS',
    'FABLAB',
    'FABRIQUE',
    'FAIS',
    'FT',
    'GEIQ',
    'HUDA',
    'LA_POSTE',
    'MDE',
    'MDH',
    'MDEF',
    'MDPH',
    'MDS',
    'MJC',
    'ML',
    'MQ',
    'MSA',
    'MSAP',
    'MUNI',
    'OACAS',
    'ODC',
    'OF',
    'OIL',
    'OPCS',
    'PAD',
    'PENSION',
    'PI',
    'PIJ_BIJ',
    'PIMMS',
    'PJJ',
    'PLIE',
    'PREF',
    'PREVENTION',
    'REG',
    'RELAIS_LECTURE',
    'RESSOURCERIE',
    'RFS',
    'RS_FJT',
    'SCP',
    'SPIP',
    'TIERS_LIEUX',
    'UDAF'
);


ALTER TYPE main.typologie OWNER TO sonum;

-- Name: TYPE typologie; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON TYPE main.typologie IS 'Aligné sur l''enum coop.typologie (coop-mediation-numerique, schema.prisma). Toute évolution doit être coordonnée avec l''équipe coop.';


-- Name: refresh_coll_terr(); Type: FUNCTION; Schema: admin; Owner: dataspace

CREATE FUNCTION admin.refresh_coll_terr() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    REFRESH MATERIALIZED VIEW admin.coll_terr;
END;
$$;


ALTER FUNCTION admin.refresh_coll_terr() OWNER TO sonum;

-- Name: FUNCTION refresh_coll_terr(); Type: COMMENT; Schema: admin; Owner: dataspace

COMMENT ON FUNCTION admin.refresh_coll_terr() IS 'Fonction permettant de rafraichir la MV admin.coll_terr sans droits de propriétaire';


-- Name: sorted_text_array(anyarray); Type: FUNCTION; Schema: main; Owner: dataspace

CREATE FUNCTION main.sorted_text_array(arr anyarray) RETURNS text[]
    LANGUAGE sql IMMUTABLE PARALLEL SAFE
    AS $$
    -- COALESCE sur l'entrée : préserve la distinction tableau vide '{}' vs NULL
    -- (unnest('{}') ne produit aucune ligne → array_agg renvoie NULL).
    SELECT COALESCE(
        (SELECT array_agg(elem::text ORDER BY elem::text) FROM unnest(arr) AS elem),
        arr::text[]
    );
$$;


ALTER FUNCTION main.sorted_text_array(arr anyarray) OWNER TO sonum;

-- Name: FUNCTION sorted_text_array(arr anyarray); Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON FUNCTION main.sorted_text_array(arr anyarray) IS 'Renvoie le tableau trié (ordre lexical, en text[]) pour comparer des arrays indépendamment de l''ordre des éléments. Accepte text[] et enum[] (V122). Préserve NULL et tableau vide. Utilisé par carto-dag / coop-dag pour ne pas détecter un faux changement métier lors d''un simple réordonnancement (seule la comparaison est triée, pas la valeur stockée).';


SET default_tablespace = '';

SET default_table_access_method = heap;

-- Name: commune; Type: TABLE; Schema: admin; Owner: dataspace

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

-- Name: COLUMN commune.statut; Type: COMMENT; Schema: admin; Owner: dataspace

COMMENT ON COLUMN admin.commune.statut IS 'Les communes peuvent avoir le statut : Capitale d''état, Préfecture de région, Préfecture, Sous-préfecture, Commune simple,  Arrondissement, Commune associée, Commune déléguée';


-- Name: COLUMN commune.code_insee_cr; Type: COMMENT; Schema: admin; Owner: dataspace

COMMENT ON COLUMN admin.commune.code_insee_cr IS 'Code insee de la commune de rattachement';


-- Name: departement; Type: TABLE; Schema: admin; Owner: dataspace

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

-- Name: region; Type: TABLE; Schema: admin; Owner: dataspace

CREATE TABLE admin.region (
    id integer NOT NULL,
    geom public.geometry(MultiPolygon,4326) NOT NULL,
    code character varying(2) NOT NULL,
    nom character varying(35) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone
);


ALTER TABLE admin.region OWNER TO sonum;

-- Name: coll_terr; Type: MATERIALIZED VIEW; Schema: admin; Owner: dataspace

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

-- Name: MATERIALIZED VIEW coll_terr; Type: COMMENT; Schema: admin; Owner: dataspace

COMMENT ON MATERIALIZED VIEW admin.coll_terr IS 'Table de regroupement des territoires (région, département, EPCI, commune) hors EPCI.';


-- Name: commune_epci; Type: TABLE; Schema: admin; Owner: dataspace

CREATE TABLE admin.commune_epci (
    id integer NOT NULL,
    commune_id integer NOT NULL,
    epci_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone
);


ALTER TABLE admin.commune_epci OWNER TO sonum;

-- Name: commune_epci_id_seq; Type: SEQUENCE; Schema: admin; Owner: dataspace

ALTER TABLE admin.commune_epci ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME admin.commune_epci_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: commune_id_seq; Type: SEQUENCE; Schema: admin; Owner: dataspace

ALTER TABLE admin.commune ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME admin.commune_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: departement_id_seq; Type: SEQUENCE; Schema: admin; Owner: dataspace

ALTER TABLE admin.departement ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME admin.departement_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: epci; Type: TABLE; Schema: admin; Owner: dataspace

CREATE TABLE admin.epci (
    id integer NOT NULL,
    geom public.geometry(MultiPolygon,4326) NOT NULL,
    code character varying(9) NOT NULL,
    type character varying(32) NOT NULL,
    nom character varying(90) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone,
    departement_id integer
);


ALTER TABLE admin.epci OWNER TO sonum;

-- Name: COLUMN epci.departement_id; Type: COMMENT; Schema: admin; Owner: dataspace

COMMENT ON COLUMN admin.epci.departement_id IS 'Département de rattachement officiel (Banatic/DGCL : département de la commune siège) ; repli département majoritaire en nombre de communes membres si absent de Banatic. Recalculé à chaque run du DAG init_ref_data.';


-- Name: epci_id_seq; Type: SEQUENCE; Schema: admin; Owner: dataspace

ALTER TABLE admin.epci ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME admin.epci_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: icp_departement; Type: TABLE; Schema: admin; Owner: dataspace

CREATE TABLE admin.icp_departement (
    id integer NOT NULL,
    code character varying(3) NOT NULL,
    label character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone
);


ALTER TABLE admin.icp_departement OWNER TO sonum;

-- Name: TABLE icp_departement; Type: COMMENT; Schema: admin; Owner: dataspace

COMMENT ON TABLE admin.icp_departement IS 'Table de gestion de l’indice de confiance des préfectures par département : https://pilote.modernisation.gouv.fr/';


-- Name: COLUMN icp_departement.code; Type: COMMENT; Schema: admin; Owner: dataspace

COMMENT ON COLUMN admin.icp_departement.code IS 'Code département : un code à 2 ou 3 chiffres qui identifie 
le département français, en métropole ou en outre-mer.
Exemple : "13" pour les Bouches-du-Rhône.';


-- Name: COLUMN icp_departement.label; Type: COMMENT; Schema: admin; Owner: dataspace

COMMENT ON COLUMN admin.icp_departement.label IS 'Appréciation qualitative de l’avancement des objectifs :
 - OBJECTIFS SÉCURISÉS : les cibles sont déjà atteintes ou sécurisées.
 - OBJECTIFS ATTEIGNABLES : les cibles sont en bonne voie d’être atteintes.
 - APPUIS NÉCESSAIRES : des actions ou soutiens complémentaires sont requis.
 - OBJECTIFS COMPROMIS : les cibles risquent fortement de ne pas être atteintes.
 - Non renseignée : aucune appréciation n’a été saisie.';


-- Name: icp_departement_id_seq; Type: SEQUENCE; Schema: admin; Owner: dataspace

ALTER TABLE admin.icp_departement ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME admin.icp_departement_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: ifn_commune; Type: TABLE; Schema: admin; Owner: dataspace

CREATE TABLE admin.ifn_commune (
    id integer NOT NULL,
    code_insee character varying(5) NOT NULL,
    score numeric NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone
);


ALTER TABLE admin.ifn_commune OWNER TO sonum;

-- Name: TABLE ifn_commune; Type: COMMENT; Schema: admin; Owner: dataspace

COMMENT ON TABLE admin.ifn_commune IS 'Table des Indices de Fragilité Numérique communaux : https://fragilite-numerique.fr/.';


-- Name: COLUMN ifn_commune.code_insee; Type: COMMENT; Schema: admin; Owner: dataspace

COMMENT ON COLUMN admin.ifn_commune.code_insee IS 'Code INSEE de la commune.';


-- Name: COLUMN ifn_commune.score; Type: COMMENT; Schema: admin; Owner: dataspace

COMMENT ON COLUMN admin.ifn_commune.score IS 'Valeur de 0 à 10 indiquant l''indice de fragilité numérique de la commune. Cette valeur est la somme de plusieurs indicateurs, pour plus d''informations : https://infos.fragilite-numerique.fr/ressources-cgu.';


-- Name: ifn_commune_id_seq; Type: SEQUENCE; Schema: admin; Owner: dataspace

ALTER TABLE admin.ifn_commune ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME admin.ifn_commune_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: ifn_departement; Type: TABLE; Schema: admin; Owner: dataspace

CREATE TABLE admin.ifn_departement (
    id integer NOT NULL,
    code character varying(3) NOT NULL,
    score numeric NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone
);


ALTER TABLE admin.ifn_departement OWNER TO sonum;

-- Name: TABLE ifn_departement; Type: COMMENT; Schema: admin; Owner: dataspace

COMMENT ON TABLE admin.ifn_departement IS 'Table de gestion des départements IFN - Indice de Fragilité Numérique : https://fragilite-numerique.fr/';


-- Name: COLUMN ifn_departement.code; Type: COMMENT; Schema: admin; Owner: dataspace

COMMENT ON COLUMN admin.ifn_departement.code IS 'Code département : un code à 2 ou 3 chiffres qui identifie le département français, en métropole ou en outre-mer. Par exemple, "13" pour les Bouches-du-Rhône.';


-- Name: COLUMN ifn_departement.score; Type: COMMENT; Schema: admin; Owner: dataspace

COMMENT ON COLUMN admin.ifn_departement.score IS 'Score : Un nombre réel qui varie de [0 - 10] indiquant l''indice de fragilité numérique du département. cette valeur est une somme totale de plusieurs indicateurs, pour plus d''informations, voir le site : https://infos.fragilite-numerique.fr/ressources-cgu';


-- Name: ifn_departement_id_seq; Type: SEQUENCE; Schema: admin; Owner: dataspace

ALTER TABLE admin.ifn_departement ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME admin.ifn_departement_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: insee_cp; Type: TABLE; Schema: admin; Owner: dataspace

CREATE TABLE admin.insee_cp (
    id integer NOT NULL,
    code_insee character varying(5) NOT NULL,
    code_postal character varying(5) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone
);


ALTER TABLE admin.insee_cp OWNER TO sonum;

-- Name: insee_cp_id_seq; Type: SEQUENCE; Schema: admin; Owner: dataspace

ALTER TABLE admin.insee_cp ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME admin.insee_cp_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: insee_historique; Type: TABLE; Schema: admin; Owner: dataspace

CREATE TABLE admin.insee_historique (
    id integer NOT NULL,
    code_insee_ancien character varying(5) NOT NULL,
    code_insee_nouveau character varying(5) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone
);


ALTER TABLE admin.insee_historique OWNER TO sonum;

-- Name: TABLE insee_historique; Type: COMMENT; Schema: admin; Owner: dataspace

COMMENT ON TABLE admin.insee_historique IS 'Table d''historisation des modifications des codes INSEE (création, suppression, fusion etc. des communes).';


-- Name: COLUMN insee_historique.code_insee_ancien; Type: COMMENT; Schema: admin; Owner: dataspace

COMMENT ON COLUMN admin.insee_historique.code_insee_ancien IS 'Ancien code INSEE.';


-- Name: COLUMN insee_historique.code_insee_nouveau; Type: COMMENT; Schema: admin; Owner: dataspace

COMMENT ON COLUMN admin.insee_historique.code_insee_nouveau IS 'Nouveau code INSEE.';


-- Name: insee_historique_id_seq; Type: SEQUENCE; Schema: admin; Owner: dataspace

ALTER TABLE admin.insee_historique ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME admin.insee_historique_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: region_id_seq; Type: SEQUENCE; Schema: admin; Owner: dataspace

ALTER TABLE admin.region ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME admin.region_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: zonage; Type: TABLE; Schema: admin; Owner: dataspace

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

-- Name: TABLE zonage; Type: COMMENT; Schema: admin; Owner: dataspace

COMMENT ON TABLE admin.zonage IS 'Table de gestion des zonages administratifs FRR et QPV.';


-- Name: COLUMN zonage.code; Type: COMMENT; Schema: admin; Owner: dataspace

COMMENT ON COLUMN admin.zonage.code IS 'Identifiant unique du zonage concerne QPV uniquement - généré par l''API.';


-- Name: COLUMN zonage.libelle; Type: COMMENT; Schema: admin; Owner: dataspace

COMMENT ON COLUMN admin.zonage.libelle IS 'Libelle du zonage concerne QPV uniquement - généré par l''API.';


-- Name: COLUMN zonage.type; Type: COMMENT; Schema: admin; Owner: dataspace

COMMENT ON COLUMN admin.zonage.type IS 'Type de zonage (QPV: Quartier Prioritaire de la Ville, FRR: France Ruralités Revitalisation).';


-- Name: COLUMN zonage.commentaire; Type: COMMENT; Schema: admin; Owner: dataspace

COMMENT ON COLUMN admin.zonage.commentaire IS 'Commentaire sur le zonage - généré par l''API.';


-- Name: zonage_id_seq; Type: SEQUENCE; Schema: admin; Owner: dataspace

ALTER TABLE admin.zonage ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME admin.zonage_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: adresse; Type: TABLE; Schema: main; Owner: dataspace

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

-- Name: COLUMN adresse.departement; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON COLUMN main.adresse.departement IS 'Code département, généré à partir du code_insee';


-- Name: lieu_inclusion; Type: TABLE; Schema: main; Owner: dataspace

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
    itinerance main.itinerance[],
    services main.service[],
    modalites_acces main.modalite_acces[],
    modalites_accompagnement main.modalite_accompagnement[],
    publics_specifiquement_adresses main.public_specifiquement_adresse[],
    prise_en_charge_specifique main.prise_en_charge_specifique[],
    frais_a_charge main.frais_a_charge[],
    formations_labels main.formation_label[],
    autres_formations_labels text[],
    dispositif_programmes_nationaux main.dispositif_programme_national[],
    typologies main.typologie[],
    contact jsonb,
    mediateurs_en_activite integer,
    emplois integer,
    source character varying,
    edited_by character varying(50),
    created_at timestamp without time zone DEFAULT now(),
    structure_coop_id uuid,
    import_warnings jsonb,
    updated_at_carto timestamp without time zone,
    updated_at_coop timestamp without time zone,
    updated_at_min timestamp without time zone,
    updated_at timestamp without time zone GENERATED ALWAYS AS (GREATEST(updated_at_carto, updated_at_coop, updated_at_min)) STORED,
    complement_adresse text,
    siret_a_l_enrichissement character varying(14),
    nom_usage character varying(255),
    deleted_at timestamp without time zone
);


ALTER TABLE main.lieu_inclusion OWNER TO sonum;

-- Name: TABLE lieu_inclusion; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON TABLE main.lieu_inclusion IS 'Lieu physique d''inclusion numérique (bibliothèque, France Services, médiathèque, EPN…). Successeur de main.structure pour ce concept dans la refonte 2026 (cf docs/refonte-structure-plan.md).';


-- Name: COLUMN lieu_inclusion.old_main_structure_id; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON COLUMN main.lieu_inclusion.old_main_structure_id IS 'Audit / mapping pendant la transition refonte : id de la ligne main.structure d''origine (1:1, pas de fusion côté lieu). À dropper en phase 6.';


-- Name: COLUMN lieu_inclusion.structure_cartographie_nationale_id; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON COLUMN main.lieu_inclusion.structure_cartographie_nationale_id IS 'Identifiant mednum-cli du lieu — seule clé naturelle externe garantie (pas de SIRET côté lieu, le SIRET appartient à la structure_administrative liée par asso).';


-- Name: COLUMN lieu_inclusion.contact; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON COLUMN main.lieu_inclusion.contact IS 'Coordonnées publiques anonymes du lieu (telephone, courriels, site_web). Sémantiquement distinct du contact JSONB côté structure_administrative qui contient des référents nommés.';


-- Name: COLUMN lieu_inclusion.source; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON COLUMN main.lieu_inclusion.source IS 'Origine mednum-cli (Hinaura, Fredo, Paca, Paris, Coop numérique…). Spécifique au lieu, ne s''applique pas à la structure_administrative.';


-- Name: COLUMN lieu_inclusion.updated_at_carto; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON COLUMN main.lieu_inclusion.updated_at_carto IS 'Date du dernier changement métier réel détecté par carto-dag.';


-- Name: COLUMN lieu_inclusion.updated_at_coop; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON COLUMN main.lieu_inclusion.updated_at_coop IS 'Date du dernier changement métier réel détecté par coop-dag.';


-- Name: COLUMN lieu_inclusion.updated_at_min; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON COLUMN main.lieu_inclusion.updated_at_min IS 'Date du dernier changement métier réel effectué via l''application MIN.';


-- Name: COLUMN lieu_inclusion.updated_at; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON COLUMN main.lieu_inclusion.updated_at IS 'Date du dernier changement métier réel toutes sources confondues (colonne calculée).';


-- Name: COLUMN lieu_inclusion.complement_adresse; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON COLUMN main.lieu_inclusion.complement_adresse IS 'Complément d''adresse libre saisi à la main sur le lieu (bâtiment, étage…). Propriété du lieu et non de main.adresse (normalisée BAN, mutualisée entre lieux et SA).';


-- Name: COLUMN lieu_inclusion.siret_a_l_enrichissement; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON COLUMN main.lieu_inclusion.siret_a_l_enrichissement IS 'SIRET déclaré à la création du lieu côté coop-mediation-numerique. Entrée déclarative pour l''enrichissement / l''association lieu↔structure_administrative ; le SIRET canonique reste celui de la structure_administrative liée par asso (cf V069).';


-- Name: COLUMN lieu_inclusion.nom_usage; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON COLUMN main.lieu_inclusion.nom_usage IS 'Nom d''usage du lieu, saisi côté coop-mediation-numerique (coop.lieu_inclusion.nom_usage).';


-- Name: COLUMN lieu_inclusion.deleted_at; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON COLUMN main.lieu_inclusion.deleted_at IS 'Date de suppression logique (soft delete). NULL = lieu actif.';


-- Name: personne; Type: TABLE; Schema: main; Owner: dataspace

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
    deleted_by text[],
    is_referent_ac boolean DEFAULT false NOT NULL,
    updated_at_ac timestamp without time zone,
    is_visible boolean,
    updated_at_coop timestamp without time zone,
    updated_at_idposte timestamp without time zone
);


ALTER TABLE main.personne OWNER TO sonum;

-- Name: COLUMN personne.is_referent_ac; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON COLUMN main.personne.is_referent_ac IS 'Indique si la personne est référente (non aidante active) selon Aidants Connect';


-- Name: COLUMN personne.updated_at_ac; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON COLUMN main.personne.updated_at_ac IS 'Dernière date de mise à jour côté API Aidants Connect (updated_at)';


-- Name: COLUMN personne.is_visible; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON COLUMN main.personne.is_visible IS 'Détermine si la personne souhaite apparaître publiquement dans les API exposées (notamment api.carto et api.get_carto_mediateur). FALSE => la personne est entièrement exclue des résultats publics ; NULL (défaut) ou TRUE => visible.';


-- Name: COLUMN personne.updated_at_coop; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON COLUMN main.personne.updated_at_coop IS 'Dernière date de mise à jour côté API coop-numerique (utilisateurs.updated_at)';


-- Name: COLUMN personne.updated_at_idposte; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON COLUMN main.personne.updated_at_idposte IS 'Dernière date de mise à jour côté extract idposte (timestamp du batch)';


-- Name: personne_affectations_emploi; Type: TABLE; Schema: main; Owner: dataspace

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

-- Name: TABLE personne_affectations_emploi; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON TABLE main.personne_affectations_emploi IS 'Relations d''emploi entre une personne et une structure_administrative (employeur ↔ employé). Successeur du type=structure_emploi de main.personne_affectations dans la refonte 2026.';


-- Name: COLUMN personne_affectations_emploi.source; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON COLUMN main.personne_affectations_emploi.source IS 'Source d''écriture de l''affectation : idposte (CSV CoNum), aidants-connect (API AC), coop (API Coop), min (création MIN).';


-- Name: COLUMN personne_affectations_emploi.est_active; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON COLUMN main.personne_affectations_emploi.est_active IS 'TRUE si la relation d''emploi est active (employé en poste). FALSE si résiliée (historique).';


-- Name: personne_affectations_lieu; Type: TABLE; Schema: main; Owner: dataspace

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

-- Name: TABLE personne_affectations_lieu; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON TABLE main.personne_affectations_lieu IS 'Relations de présence d''une personne sur un lieu_inclusion (médiateur intervient / travaille sur le lieu). Successeur du type=lieu_activite de main.personne_affectations dans la refonte 2026.';


-- Name: COLUMN personne_affectations_lieu.source; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON COLUMN main.personne_affectations_lieu.source IS 'Source d''écriture : coop (API Coop), aidants-connect (rare, principalement employeuse), carto (lien implicite avec lieu), min.';


-- Name: COLUMN personne_affectations_lieu.est_active; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON COLUMN main.personne_affectations_lieu.est_active IS 'TRUE si le médiateur intervient actuellement sur ce lieu. FALSE si historique.';


-- Name: structure_administrative; Type: TABLE; Schema: main; Owner: dataspace

CREATE TABLE main.structure_administrative (
    id integer NOT NULL,
    old_main_structure_id integer,
    siret character varying(14),
    ridet character varying(10),
    denomination_sirene character varying,
    rna character varying(10),
    denomination_antenne character varying(255),
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
    est_grand_reseau boolean DEFAULT false NOT NULL,
    est_hub boolean DEFAULT false NOT NULL,
    CONSTRAINT structure_administrative_ridet_format_check CHECK (((ridet IS NULL) OR ((ridet)::text ~ '^\d{7,10}$'::text))),
    CONSTRAINT structure_administrative_siret_format_check CHECK (((siret IS NULL) OR ((siret)::text ~ '^\d{14}$'::text)))
);


ALTER TABLE main.structure_administrative OWNER TO sonum;

-- Name: TABLE structure_administrative; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON TABLE main.structure_administrative IS 'Entité légale (identifiée par SIRET ou RIDET) qui peut employer des médiateurs, bénéficier de subventions, porter une gouvernance, héberger des lieux d''inclusion. Successeur de main.structure dans la refonte 2026 (cf docs/refonte-structure-plan.md).';


-- Name: COLUMN structure_administrative.old_main_structure_id; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON COLUMN main.structure_administrative.old_main_structure_id IS 'Audit / mapping pendant la transition refonte : id de la ligne main.structure choisie lors de la fusion par SIRET (cf phase 2). À dropper en phase 6 quand main.structure est supprimée. Pour le mapping complet des lignes absorbées par fusion, joindre via siret.';


-- Name: COLUMN structure_administrative.siret; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON COLUMN main.structure_administrative.siret IS 'SIRET (métropole, 14 chiffres). NULL accepté pour les structures historiques MIN sans ancrage SIRENE.';


-- Name: COLUMN structure_administrative.ridet; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON COLUMN main.structure_administrative.ridet IS 'RIDET (Nouvelle-Calédonie / Polynésie, 7-10 chiffres). NULL si non applicable.';


-- Name: COLUMN structure_administrative.denomination_antenne; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON COLUMN main.structure_administrative.denomination_antenne IS 'Discriminant pour le pattern "grand réseau" (plusieurs antennes partageant le SIRET du siège : Emmaüs Connect, Reconnect Groupe SOS, Petits Débrouillards…). NULL = entité unique pour ce SIRET. Sinon nom legacy de l''antenne. Sert également de discriminant pour les SA sans SIRET (assos nationales).';


-- Name: COLUMN structure_administrative.contact; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON COLUMN main.structure_administrative.contact IS 'Contact JSONB hérité de main.structure (référent nommé : nom, prenom, courriels, telephone). Dépréciation V047 vers main.contact + main.contact_structure_administrative non close par cette refonte (cf plan §Next N1).';


-- Name: COLUMN structure_administrative.deleted_by; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON COLUMN main.structure_administrative.deleted_by IS 'Liste cumulative des sources ayant marqué la suppression (V033 pattern).';


-- Name: COLUMN structure_administrative.edited_by; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON COLUMN main.structure_administrative.edited_by IS 'Marqueur de la source d''écriture : coop, id-poste, aidants-connect, carto, min.';


-- Name: COLUMN structure_administrative.est_grand_reseau; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON COLUMN main.structure_administrative.est_grand_reseau IS 'Structure appartenant à un grand réseau (SIREN multi-départements, hors collectivités) — délégations territoriales à ne pas fusionner (#1681)';


-- Name: COLUMN structure_administrative.est_hub; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON COLUMN main.structure_administrative.est_hub IS 'Tête de réseau régionale médiation numérique (hub ou porteur de consortium) — exclue des fusions automatiques (#1681, référentiel Hubs_SIRET)';


-- Name: categories_juridiques; Type: TABLE; Schema: reference; Owner: dataspace

CREATE TABLE reference.categories_juridiques (
    id integer NOT NULL,
    code character varying(4) NOT NULL,
    nom character varying(150) NOT NULL,
    niveau smallint NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone
);


ALTER TABLE reference.categories_juridiques OWNER TO sonum;

-- Name: personne_merge_log; Type: TABLE; Schema: audit; Owner: dataspace

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

-- Name: personne_merge_log_id_seq; Type: SEQUENCE; Schema: audit; Owner: dataspace

CREATE SEQUENCE audit.personne_merge_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE audit.personne_merge_log_id_seq OWNER TO sonum;

-- Name: personne_merge_log_id_seq; Type: SEQUENCE OWNED BY; Schema: audit; Owner: dataspace

ALTER SEQUENCE audit.personne_merge_log_id_seq OWNED BY audit.personne_merge_log.id;


-- Name: structure_merge_log; Type: TABLE; Schema: audit; Owner: dataspace

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

-- Name: structure_merge_log_id_seq; Type: SEQUENCE; Schema: audit; Owner: dataspace

CREATE SEQUENCE audit.structure_merge_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE audit.structure_merge_log_id_seq OWNER TO sonum;

-- Name: structure_merge_log_id_seq; Type: SEQUENCE OWNED BY; Schema: audit; Owner: dataspace

ALTER SEQUENCE audit.structure_merge_log_id_seq OWNED BY audit.structure_merge_log.id;


-- Name: activites_coop; Type: TABLE; Schema: main; Owner: dataspace

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
    updated_at_coop timestamp without time zone,
    beneficiaires jsonb
);


ALTER TABLE main.activites_coop OWNER TO sonum;

-- Name: COLUMN activites_coop.duree; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON COLUMN main.activites_coop.duree IS 'Valeur en minutes';


-- Name: COLUMN activites_coop.beneficiaires; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON COLUMN main.activites_coop.beneficiaires IS 'Agrégats non nominatifs des bénéficiaires de l''activité (total, genres, tranches_age, statuts). Source: API coop-numerique /api/v1/activites attributes.beneficiaires';


-- Name: formation; Type: TABLE; Schema: main; Owner: dataspace

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
    CONSTRAINT formation_label_check CHECK (((label)::text = ANY ((ARRAY['CCP1'::character varying, 'CCP2'::character varying, 'CCP2 & CCP3'::character varying])::text[]))),
    CONSTRAINT formation_parcours_check CHECK (((parcours)::text = ANY ((ARRAY['70h'::character varying, '175h'::character varying, '315h'::character varying, '105h'::character varying, '420h'::character varying, '280h'::character varying, '350h'::character varying])::text[])))
);


ALTER TABLE main.formation OWNER TO sonum;

-- Name: TABLE formation; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON TABLE main.formation IS 'Table de gestion des formations des Conseillers Numériques.';


-- Name: COLUMN formation.label; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON COLUMN main.formation.label IS 'Label de la formation, exemple : CCP1, CCP2, CCP2 & CCP3';


-- Name: COLUMN formation.parcours; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON COLUMN main.formation.parcours IS 'Parcours de formation défini après un test de positionnement : débutant (315h), intermédiaire (175h), ou avancé (70h).';


-- Name: contact; Type: TABLE; Schema: main; Owner: dataspace

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

-- Name: contact_structure_administrative; Type: TABLE; Schema: main; Owner: dataspace

CREATE TABLE main.contact_structure_administrative (
    id integer NOT NULL,
    structure_administrative_id integer NOT NULL,
    contact_id integer NOT NULL,
    created_at timestamp(6) without time zone DEFAULT now()
);


ALTER TABLE main.contact_structure_administrative OWNER TO sonum;

-- Name: contrat; Type: TABLE; Schema: main; Owner: dataspace

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
    CONSTRAINT contrat_type_check CHECK (((type)::text = ANY ((ARRAY['CDD'::character varying, 'CDI'::character varying, 'CDP'::character varying, 'PEC'::character varying])::text[])))
);


ALTER TABLE main.contrat OWNER TO sonum;

-- Name: poste; Type: TABLE; Schema: main; Owner: dataspace

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
    CONSTRAINT poste_etat_check CHECK (((etat)::text = ANY ((ARRAY['vacant'::character varying, 'occupe'::character varying, 'rendu'::character varying])::text[]))),
    CONSTRAINT poste_typologie_check CHECK (((typologie)::text = ANY ((ARRAY['conum'::character varying, 'coordo'::character varying, 'dns'::character varying])::text[])))
);


ALTER TABLE main.poste OWNER TO sonum;

-- Name: subvention; Type: TABLE; Schema: main; Owner: dataspace

CREATE TABLE main.subvention (
    id integer NOT NULL,
    poste_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone,
    date_debut_convention_dgcl date,
    date_debut_financement_dgcl date,
    date_fin_convention_dgcl date,
    date_fin_financement_dgcl date,
    mois_utilises_periode_financement_dgcl smallint,
    date_debut_convention_ditp date,
    date_debut_financement_ditp date,
    date_fin_convention_ditp date,
    date_fin_financement_ditp date,
    mois_utilises_periode_financement_ditp smallint,
    date_debut_convention_dge date,
    date_debut_financement_dge date,
    date_fin_convention_dge date,
    date_fin_financement_dge date,
    mois_utilises_periode_financement_dge smallint,
    montant_subvention_v1 bigint,
    montant_versement_v1 bigint,
    montant_avoir_v1 bigint,
    montant_bonification_v2 bigint,
    montant_subvention_v2 bigint,
    montant_avoir_v2 bigint,
    versement_1_v2 bigint,
    versement_2_v2 bigint,
    versement_3_v2 bigint,
    date_versement_1_v2 date,
    date_versement_2_v2 date,
    date_versement_3_v2 date
);


ALTER TABLE main.subvention OWNER TO sonum;

-- Name: TABLE subvention; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON TABLE main.subvention IS 'Table des subventions par poste. Une ligne par poste avec colonnes spécifiques pour DGCL (V1), DITP (V2) et DGE (V2)';


-- Name: ac_accompagnements_mensuels; Type: TABLE; Schema: main; Owner: dataspace

CREATE TABLE main.ac_accompagnements_mensuels (
    aidant_connect_id bigint NOT NULL,
    mois date NOT NULL,
    nb_accompagnements integer NOT NULL,
    fetched_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT mois_premier_jour CHECK ((mois = (date_trunc('month'::text, (mois)::timestamp with time zone))::date))
);


ALTER TABLE main.ac_accompagnements_mensuels OWNER TO sonum;

-- Name: TABLE ac_accompagnements_mensuels; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON TABLE main.ac_accompagnements_mensuels IS 'Nombre d''accompagnements par aidant et par mois, snapshoté mensuellement depuis l''API Aidants Connect (fenêtre glissante de 6 mois, upsert sur recouvrement).';


-- Name: COLUMN ac_accompagnements_mensuels.aidant_connect_id; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON COLUMN main.ac_accompagnements_mensuels.aidant_connect_id IS 'Identifiant de l''aidant côté Aidants Connect (champ id de l''API).';


-- Name: COLUMN ac_accompagnements_mensuels.mois; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON COLUMN main.ac_accompagnements_mensuels.mois IS 'Premier jour du mois concerné (index 0 du payload = mois du fetch, 1 = M-1, etc.).';


-- Name: COLUMN ac_accompagnements_mensuels.nb_accompagnements; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON COLUMN main.ac_accompagnements_mensuels.nb_accompagnements IS 'Nombre d''accompagnements du mois, dernière valeur connue (le mois courant est partiel jusqu''au snapshot suivant).';


-- Name: COLUMN ac_accompagnements_mensuels.fetched_at; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON COLUMN main.ac_accompagnements_mensuels.fetched_at IS 'Horodatage du dernier snapshot ayant écrit ou mis à jour la ligne.';


-- Name: activites_coop_id_seq; Type: SEQUENCE; Schema: main; Owner: dataspace

ALTER TABLE main.activites_coop ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME main.activites_coop_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: adresse_id_seq; Type: SEQUENCE; Schema: main; Owner: dataspace

ALTER TABLE main.adresse ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME main.adresse_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: contact_id_seq; Type: SEQUENCE; Schema: main; Owner: dataspace

CREATE SEQUENCE main.contact_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE main.contact_id_seq OWNER TO sonum;

-- Name: contact_id_seq; Type: SEQUENCE OWNED BY; Schema: main; Owner: dataspace

ALTER SEQUENCE main.contact_id_seq OWNED BY main.contact.id;


-- Name: contact_structure_id_seq; Type: SEQUENCE; Schema: main; Owner: dataspace

CREATE SEQUENCE main.contact_structure_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE main.contact_structure_id_seq OWNER TO sonum;

-- Name: contact_structure_id_seq; Type: SEQUENCE OWNED BY; Schema: main; Owner: dataspace

ALTER SEQUENCE main.contact_structure_id_seq OWNED BY main.contact_structure_administrative.id;


-- Name: contrat_id_seq; Type: SEQUENCE; Schema: main; Owner: dataspace

ALTER TABLE main.contrat ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME main.contrat_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: conum_labellisation; Type: TABLE; Schema: main; Owner: dataspace

CREATE TABLE main.conum_labellisation (
    id integer NOT NULL,
    structure_id integer NOT NULL,
    utilisateur_id integer NOT NULL,
    date_attestation timestamp(3) without time zone NOT NULL
);


ALTER TABLE main.conum_labellisation OWNER TO sonum;

-- Name: conum_labellisation_id_seq; Type: SEQUENCE; Schema: main; Owner: dataspace

CREATE SEQUENCE main.conum_labellisation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE main.conum_labellisation_id_seq OWNER TO sonum;

-- Name: conum_labellisation_id_seq; Type: SEQUENCE OWNED BY; Schema: main; Owner: dataspace

ALTER SEQUENCE main.conum_labellisation_id_seq OWNED BY main.conum_labellisation.id;


-- Name: coordination_mediation; Type: TABLE; Schema: main; Owner: dataspace

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

-- Name: COLUMN coordination_mediation.suppression; Type: COMMENT; Schema: main; Owner: dataspace

COMMENT ON COLUMN main.coordination_mediation.suppression IS 'Date de suppression de la coordination médiation (NULL si en cours).';


-- Name: coordination_mediation_id_seq; Type: SEQUENCE; Schema: main; Owner: dataspace

ALTER TABLE main.coordination_mediation ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME main.coordination_mediation_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: formation_id_seq; Type: SEQUENCE; Schema: main; Owner: dataspace

ALTER TABLE main.formation ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME main.formation_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: lieu_inclusion_id_seq; Type: SEQUENCE; Schema: main; Owner: dataspace

ALTER TABLE main.lieu_inclusion ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME main.lieu_inclusion_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: personne_affectations_emploi_id_seq; Type: SEQUENCE; Schema: main; Owner: dataspace

ALTER TABLE main.personne_affectations_emploi ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME main.personne_affectations_emploi_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: personne_affectations_lieu_id_seq; Type: SEQUENCE; Schema: main; Owner: dataspace

ALTER TABLE main.personne_affectations_lieu ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME main.personne_affectations_lieu_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: personne_id_seq; Type: SEQUENCE; Schema: main; Owner: dataspace

ALTER TABLE main.personne ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME main.personne_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: poste_id_seq; Type: SEQUENCE; Schema: main; Owner: dataspace

ALTER TABLE main.poste ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME main.poste_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: structure_administrative_id_seq; Type: SEQUENCE; Schema: main; Owner: dataspace

ALTER TABLE main.structure_administrative ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME main.structure_administrative_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: subvention_id_seq; Type: SEQUENCE; Schema: main; Owner: dataspace

ALTER TABLE main.subvention ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME main.subvention_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: categories_juridiques_id_seq; Type: SEQUENCE; Schema: reference; Owner: dataspace

ALTER TABLE reference.categories_juridiques ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME reference.categories_juridiques_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: naf; Type: TABLE; Schema: reference; Owner: dataspace

CREATE TABLE reference.naf (
    id integer NOT NULL,
    code character varying(6) NOT NULL,
    intitule_long character varying(150) NOT NULL,
    intitule_court character varying(65) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone
);


ALTER TABLE reference.naf OWNER TO sonum;

-- Name: naf_id_seq; Type: SEQUENCE; Schema: reference; Owner: dataspace

ALTER TABLE reference.naf ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME reference.naf_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


-- Name: ac__accompagnements; Type: TABLE; Schema: staging; Owner: dataspace

CREATE TABLE staging.ac__accompagnements (
    run_id text NOT NULL,
    staged_at timestamp with time zone DEFAULT now() NOT NULL,
    aidant_connect_id bigint NOT NULL,
    mois date NOT NULL,
    nb_accompagnements integer NOT NULL
);


ALTER TABLE staging.ac__accompagnements OWNER TO sonum;

-- Name: ac__aidants; Type: TABLE; Schema: staging; Owner: dataspace

CREATE TABLE staging.ac__aidants (
    run_id text NOT NULL,
    staged_at timestamp with time zone DEFAULT now() NOT NULL,
    aidant_connect_id bigint,
    updated_at_ac timestamp without time zone,
    prenom text,
    nom text,
    is_active_ac boolean,
    formation_fne_ac boolean,
    profession_ac text,
    nb_accompagnements_ac integer,
    is_referent_ac boolean,
    structure_ac_id text
);


ALTER TABLE staging.ac__aidants OWNER TO sonum;

-- Name: ac__structures; Type: TABLE; Schema: staging; Owner: dataspace

CREATE TABLE staging.ac__structures (
    run_id text NOT NULL,
    staged_at timestamp with time zone DEFAULT now() NOT NULL,
    structure_ac_id text,
    updated_at_ac timestamp without time zone,
    is_active_ac boolean,
    nom text,
    siret text,
    nom_commune text,
    code_postal text,
    code_insee text,
    adresse text,
    nb_mandats_ac integer,
    dispositif_programmes_nationaux text
);


ALTER TABLE staging.ac__structures OWNER TO sonum;

-- Name: carto__structures; Type: TABLE; Schema: staging; Owner: dataspace

CREATE TABLE staging.carto__structures (
    run_id text NOT NULL,
    staged_at timestamp with time zone DEFAULT now() NOT NULL,
    id text NOT NULL,
    structure_coop_id uuid,
    pivot text NOT NULL,
    nom text NOT NULL,
    commune text NOT NULL,
    code_postal text NOT NULL,
    code_insee text,
    adresse text NOT NULL,
    complement_adresse text,
    latitude real,
    longitude real,
    typologie text,
    telephone text,
    courriels text,
    site_web text,
    horaires text,
    presentation_resume text,
    presentation_detail text,
    source text,
    itinerance text,
    date_maj date NOT NULL,
    services text,
    publics_specifiquement_adresses text,
    prise_en_charge_specifique text,
    frais_a_charge text,
    dispositif_programmes_nationaux text,
    formations_labels text,
    autres_formations_labels text,
    modalites_acces text,
    modalites_accompagnement text,
    fiche_acces_libre text,
    prise_rdv text
);


ALTER TABLE staging.carto__structures OWNER TO sonum;

-- Name: coop__structures; Type: TABLE; Schema: staging; Owner: dataspace

CREATE TABLE staging.coop__structures (
    run_id text NOT NULL,
    staged_at timestamp with time zone DEFAULT now() NOT NULL,
    structure_coop_id text,
    updated_at_coop timestamp without time zone,
    deleted_at_coop timestamp without time zone,
    nom text,
    siret text,
    adresse text,
    latitude double precision,
    longitude double precision,
    code_insee text,
    code_postal text,
    commune text,
    rna text,
    contact text,
    typologies text,
    presentation_resume text,
    presentation_detail text,
    horaires text,
    prise_rdv text,
    services text,
    publics_specifiquement_adresses text,
    prise_en_charge_specifique text,
    frais_a_charge text,
    dispositif_programmes_nationaux text,
    formations_labels text,
    autres_formations_labels text,
    itinerance text,
    modalites_acces text,
    modalites_accompagnement text,
    mediateurs_en_activite integer,
    emplois integer,
    source text
);


ALTER TABLE staging.coop__structures OWNER TO sonum;

-- Name: coop__utilisateurs; Type: TABLE; Schema: staging; Owner: dataspace

CREATE TABLE staging.coop__utilisateurs (
    run_id text NOT NULL,
    staged_at timestamp with time zone DEFAULT now() NOT NULL,
    coop_id text,
    updated_at_coop timestamp without time zone,
    deleted_at_coop timestamp without time zone,
    nom text,
    prenom text,
    contact text,
    cn_pg_id bigint,
    is_visible boolean,
    conseiller_numerique_id text,
    is_mediateur boolean,
    is_coordinateur boolean,
    personne_affectations text,
    coordination_mediation text
);


ALTER TABLE staging.coop__utilisateurs OWNER TO sonum;

-- Name: frr__zonage; Type: TABLE; Schema: staging; Owner: dataspace

CREATE TABLE staging.frr__zonage (
    run_id text NOT NULL,
    staged_at timestamp with time zone DEFAULT now() NOT NULL,
    code_insee text NOT NULL,
    type text NOT NULL,
    commentaire text
);


ALTER TABLE staging.frr__zonage OWNER TO sonum;

-- Name: geocodage__cache; Type: TABLE; Schema: staging; Owner: dataspace

CREATE TABLE staging.geocodage__cache (
    adresse text NOT NULL,
    code_insee text DEFAULT ''::text NOT NULL,
    code_postal text DEFAULT ''::text NOT NULL,
    run_id text NOT NULL,
    enriched_at timestamp with time zone DEFAULT now() NOT NULL,
    code_insee_geocode text,
    numero_voie text,
    nom_voie text,
    nom_commune text,
    code_postal_geocode text,
    longitude double precision,
    latitude double precision,
    score_geocodage double precision,
    label_geocodage text,
    geom text,
    clef_interop text,
    code_ban text
);


ALTER TABLE staging.geocodage__cache OWNER TO sonum;

-- Name: idposte__contrat; Type: TABLE; Schema: staging; Owner: dataspace

CREATE TABLE staging.idposte__contrat (
    run_id text NOT NULL,
    staged_at timestamp with time zone DEFAULT now() NOT NULL,
    cn_pg_id bigint NOT NULL,
    structure_tp_id bigint,
    date_debut date,
    date_fin date,
    date_rupture date,
    type text
);


ALTER TABLE staging.idposte__contrat OWNER TO sonum;

-- Name: idposte__formation; Type: TABLE; Schema: staging; Owner: dataspace

CREATE TABLE staging.idposte__formation (
    run_id text NOT NULL,
    staged_at timestamp with time zone DEFAULT now() NOT NULL,
    personne_id_pg bigint NOT NULL,
    lot bigint,
    marche_formation text,
    label text,
    date_debut date,
    date_fin date,
    lieu text,
    parcours text,
    pix boolean,
    remn boolean,
    observations text
);


ALTER TABLE staging.idposte__formation OWNER TO sonum;

-- Name: idposte__personne; Type: TABLE; Schema: staging; Owner: dataspace

CREATE TABLE staging.idposte__personne (
    run_id text NOT NULL,
    staged_at timestamp with time zone DEFAULT now() NOT NULL,
    cn_pg_id bigint NOT NULL,
    structure_tp_id bigint,
    nom text,
    prenom text,
    contact text
);


ALTER TABLE staging.idposte__personne OWNER TO sonum;

-- Name: idposte__poste; Type: TABLE; Schema: staging; Owner: dataspace

CREATE TABLE staging.idposte__poste (
    run_id text NOT NULL,
    staged_at timestamp with time zone DEFAULT now() NOT NULL,
    poste_conum_id bigint NOT NULL,
    structure_tp_id bigint,
    etat text,
    etat_instruction_v1 text,
    etat_instruction_v2 text,
    cn_pg_id bigint,
    date_attribution date,
    date_rendu_poste date,
    typologie text,
    origine_transfert bigint,
    poste_renouvele boolean,
    action_coselec text
);


ALTER TABLE staging.idposte__poste OWNER TO sonum;

-- Name: idposte__structure; Type: TABLE; Schema: staging; Owner: dataspace

CREATE TABLE staging.idposte__structure (
    run_id text NOT NULL,
    staged_at timestamp with time zone DEFAULT now() NOT NULL,
    structure_tp_id bigint,
    nom text,
    siret text,
    publique boolean,
    adresse text,
    code_insee text,
    code_postal text,
    contact text
);


ALTER TABLE staging.idposte__structure OWNER TO sonum;

-- Name: idposte__subvention; Type: TABLE; Schema: staging; Owner: dataspace

CREATE TABLE staging.idposte__subvention (
    run_id text NOT NULL,
    staged_at timestamp with time zone DEFAULT now() NOT NULL,
    poste_id bigint NOT NULL,
    date_debut_convention_dgcl date,
    date_debut_financement_dgcl date,
    date_fin_convention_dgcl date,
    date_fin_financement_dgcl date,
    mois_utilises_periode_financement_dgcl bigint,
    date_debut_convention_ditp date,
    date_debut_financement_ditp date,
    date_fin_convention_ditp date,
    date_fin_financement_ditp date,
    mois_utilises_periode_financement_ditp bigint,
    date_debut_convention_dge date,
    date_debut_financement_dge date,
    date_fin_convention_dge date,
    date_fin_financement_dge date,
    mois_utilises_periode_financement_dge bigint,
    montant_subvention_v1 bigint,
    montant_versement_v1 bigint,
    montant_avoir_v1 bigint,
    montant_bonification_v2 bigint,
    montant_subvention_v2 bigint,
    montant_avoir_v2 bigint,
    versement_1_v2 bigint,
    versement_2_v2 bigint,
    versement_3_v2 bigint,
    date_versement_1_v2 date,
    date_versement_2_v2 date,
    date_versement_3_v2 date
);


ALTER TABLE staging.idposte__subvention OWNER TO sonum;

-- Name: qpv__zonage; Type: TABLE; Schema: staging; Owner: dataspace

CREATE TABLE staging.qpv__zonage (
    run_id text NOT NULL,
    staged_at timestamp with time zone DEFAULT now() NOT NULL,
    geom_wkt text,
    code text,
    libelle text,
    code_insee text,
    type text NOT NULL,
    source_file text
);


ALTER TABLE staging.qpv__zonage OWNER TO sonum;

-- Name: rejets; Type: TABLE; Schema: staging; Owner: dataspace

CREATE TABLE staging.rejets (
    id bigint NOT NULL,
    rejete_at timestamp with time zone DEFAULT now() NOT NULL,
    run_id text,
    flux text NOT NULL,
    etape text NOT NULL,
    motif text NOT NULL,
    source_key text,
    payload jsonb NOT NULL
);


ALTER TABLE staging.rejets OWNER TO sonum;

-- Name: rejets_id_seq; Type: SEQUENCE; Schema: staging; Owner: dataspace

CREATE SEQUENCE staging.rejets_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE staging.rejets_id_seq OWNER TO sonum;

-- Name: rejets_id_seq; Type: SEQUENCE OWNED BY; Schema: staging; Owner: dataspace

ALTER SEQUENCE staging.rejets_id_seq OWNED BY staging.rejets.id;


-- Name: sirene__cache; Type: TABLE; Schema: staging; Owner: dataspace

CREATE TABLE staging.sirene__cache (
    siret text NOT NULL,
    run_id text NOT NULL,
    enriched_at timestamp with time zone DEFAULT now() NOT NULL,
    etat_administratif text,
    code_activite_principale text,
    categorie_juridique text,
    denomination_sirene text,
    adresse_sirene text,
    code_insee_sirene text,
    code_postal_sirene text,
    date_creation_sirene text,
    tranche_effectifs_sirene text
);


ALTER TABLE staging.sirene__cache OWNER TO sonum;

-- Name: sirene__etablissements; Type: TABLE; Schema: staging; Owner: dataspace

CREATE TABLE staging.sirene__etablissements (
    run_id text NOT NULL,
    staged_at timestamp with time zone DEFAULT now() NOT NULL,
    structure_id bigint NOT NULL,
    siret text NOT NULL,
    etat_administratif text,
    code_activite_principale text,
    categorie_juridique text,
    denomination_sirene text,
    adresse_sirene text,
    code_insee_sirene text,
    code_postal_sirene text,
    date_creation_sirene date,
    tranche_effectifs_sirene text,
    sirene_trouve boolean NOT NULL
);


ALTER TABLE staging.sirene__etablissements OWNER TO sonum;

-- Name: personne_merge_log id; Type: DEFAULT; Schema: audit; Owner: dataspace

ALTER TABLE ONLY audit.personne_merge_log ALTER COLUMN id SET DEFAULT nextval('audit.personne_merge_log_id_seq'::regclass);


-- Name: structure_merge_log id; Type: DEFAULT; Schema: audit; Owner: dataspace

ALTER TABLE ONLY audit.structure_merge_log ALTER COLUMN id SET DEFAULT nextval('audit.structure_merge_log_id_seq'::regclass);


-- Name: contact id; Type: DEFAULT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.contact ALTER COLUMN id SET DEFAULT nextval('main.contact_id_seq'::regclass);


-- Name: contact_structure_administrative id; Type: DEFAULT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.contact_structure_administrative ALTER COLUMN id SET DEFAULT nextval('main.contact_structure_id_seq'::regclass);


-- Name: conum_labellisation id; Type: DEFAULT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.conum_labellisation ALTER COLUMN id SET DEFAULT nextval('main.conum_labellisation_id_seq'::regclass);


-- Name: rejets id; Type: DEFAULT; Schema: staging; Owner: dataspace

ALTER TABLE ONLY staging.rejets ALTER COLUMN id SET DEFAULT nextval('staging.rejets_id_seq'::regclass);


-- Name: SCHEMA admin; Type: ACL; Schema: -; Owner: dataspace

GRANT USAGE ON SCHEMA admin TO app_python;
GRANT USAGE ON SCHEMA admin TO min_scalingo;
GRANT USAGE ON SCHEMA admin TO min_dev;


-- Name: SCHEMA audit; Type: ACL; Schema: -; Owner: dataspace

GRANT USAGE ON SCHEMA audit TO min_scalingo;


-- Name: SCHEMA main; Type: ACL; Schema: -; Owner: dataspace

GRANT USAGE ON SCHEMA main TO app_python;
GRANT USAGE ON SCHEMA main TO min_scalingo;
GRANT USAGE ON SCHEMA main TO min_dev;


-- Name: SCHEMA reference; Type: ACL; Schema: -; Owner: dataspace

GRANT USAGE ON SCHEMA reference TO min_scalingo;
GRANT USAGE ON SCHEMA reference TO min_dev;


-- Name: SCHEMA staging; Type: ACL; Schema: -; Owner: dataspace

GRANT USAGE ON SCHEMA staging TO app_python;


-- Name: FUNCTION refresh_coll_terr(); Type: ACL; Schema: admin; Owner: dataspace

GRANT ALL ON FUNCTION admin.refresh_coll_terr() TO app_python;


-- Name: TABLE commune; Type: ACL; Schema: admin; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE admin.commune TO app_python;
GRANT SELECT,REFERENCES ON TABLE admin.commune TO min_scalingo;
GRANT SELECT ON TABLE admin.commune TO min_dev;


-- Name: TABLE departement; Type: ACL; Schema: admin; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE admin.departement TO app_python;
GRANT SELECT,REFERENCES ON TABLE admin.departement TO min_scalingo;
GRANT SELECT ON TABLE admin.departement TO min_dev;


-- Name: TABLE region; Type: ACL; Schema: admin; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE admin.region TO app_python;
GRANT SELECT,REFERENCES ON TABLE admin.region TO min_scalingo;
GRANT SELECT ON TABLE admin.region TO min_dev;


-- Name: TABLE coll_terr; Type: ACL; Schema: admin; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE admin.coll_terr TO app_python;
GRANT SELECT,REFERENCES ON TABLE admin.coll_terr TO min_scalingo;
GRANT SELECT ON TABLE admin.coll_terr TO min_dev;


-- Name: TABLE commune_epci; Type: ACL; Schema: admin; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE admin.commune_epci TO app_python;
GRANT SELECT,REFERENCES ON TABLE admin.commune_epci TO min_scalingo;
GRANT SELECT ON TABLE admin.commune_epci TO min_dev;


-- Name: SEQUENCE commune_epci_id_seq; Type: ACL; Schema: admin; Owner: dataspace

GRANT USAGE,UPDATE ON SEQUENCE admin.commune_epci_id_seq TO app_python;


-- Name: SEQUENCE commune_id_seq; Type: ACL; Schema: admin; Owner: dataspace

GRANT USAGE,UPDATE ON SEQUENCE admin.commune_id_seq TO app_python;


-- Name: SEQUENCE departement_id_seq; Type: ACL; Schema: admin; Owner: dataspace

GRANT USAGE,UPDATE ON SEQUENCE admin.departement_id_seq TO app_python;


-- Name: TABLE epci; Type: ACL; Schema: admin; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE admin.epci TO app_python;
GRANT SELECT,REFERENCES ON TABLE admin.epci TO min_scalingo;
GRANT SELECT ON TABLE admin.epci TO min_dev;


-- Name: SEQUENCE epci_id_seq; Type: ACL; Schema: admin; Owner: dataspace

GRANT USAGE,UPDATE ON SEQUENCE admin.epci_id_seq TO app_python;


-- Name: TABLE icp_departement; Type: ACL; Schema: admin; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE admin.icp_departement TO app_python;
GRANT SELECT ON TABLE admin.icp_departement TO min_scalingo;
GRANT SELECT ON TABLE admin.icp_departement TO min_dev;


-- Name: SEQUENCE icp_departement_id_seq; Type: ACL; Schema: admin; Owner: dataspace

GRANT USAGE,UPDATE ON SEQUENCE admin.icp_departement_id_seq TO app_python;


-- Name: TABLE ifn_commune; Type: ACL; Schema: admin; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE admin.ifn_commune TO app_python;
GRANT SELECT,REFERENCES ON TABLE admin.ifn_commune TO min_scalingo;
GRANT SELECT ON TABLE admin.ifn_commune TO min_dev;


-- Name: SEQUENCE ifn_commune_id_seq; Type: ACL; Schema: admin; Owner: dataspace

GRANT USAGE,UPDATE ON SEQUENCE admin.ifn_commune_id_seq TO app_python;


-- Name: TABLE ifn_departement; Type: ACL; Schema: admin; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE admin.ifn_departement TO app_python;
GRANT SELECT,REFERENCES ON TABLE admin.ifn_departement TO min_scalingo;
GRANT SELECT ON TABLE admin.ifn_departement TO min_dev;


-- Name: SEQUENCE ifn_departement_id_seq; Type: ACL; Schema: admin; Owner: dataspace

GRANT USAGE,UPDATE ON SEQUENCE admin.ifn_departement_id_seq TO app_python;


-- Name: TABLE insee_cp; Type: ACL; Schema: admin; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE admin.insee_cp TO app_python;
GRANT SELECT,REFERENCES ON TABLE admin.insee_cp TO min_scalingo;
GRANT SELECT ON TABLE admin.insee_cp TO min_dev;


-- Name: SEQUENCE insee_cp_id_seq; Type: ACL; Schema: admin; Owner: dataspace

GRANT USAGE,UPDATE ON SEQUENCE admin.insee_cp_id_seq TO app_python;


-- Name: TABLE insee_historique; Type: ACL; Schema: admin; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE admin.insee_historique TO app_python;
GRANT SELECT,REFERENCES ON TABLE admin.insee_historique TO min_scalingo;
GRANT SELECT ON TABLE admin.insee_historique TO min_dev;


-- Name: SEQUENCE insee_historique_id_seq; Type: ACL; Schema: admin; Owner: dataspace

GRANT USAGE,UPDATE ON SEQUENCE admin.insee_historique_id_seq TO app_python;


-- Name: SEQUENCE region_id_seq; Type: ACL; Schema: admin; Owner: dataspace

GRANT USAGE,UPDATE ON SEQUENCE admin.region_id_seq TO app_python;


-- Name: TABLE zonage; Type: ACL; Schema: admin; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE admin.zonage TO app_python;
GRANT SELECT,REFERENCES ON TABLE admin.zonage TO min_scalingo;
GRANT SELECT ON TABLE admin.zonage TO min_dev;


-- Name: SEQUENCE zonage_id_seq; Type: ACL; Schema: admin; Owner: dataspace

GRANT USAGE,UPDATE ON SEQUENCE admin.zonage_id_seq TO app_python;


-- Name: TABLE adresse; Type: ACL; Schema: main; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE main.adresse TO app_python;
GRANT SELECT,INSERT,REFERENCES,UPDATE ON TABLE main.adresse TO min_scalingo;
GRANT SELECT ON TABLE main.adresse TO min_dev;


-- Name: TABLE lieu_inclusion; Type: ACL; Schema: main; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE main.lieu_inclusion TO app_python;
GRANT SELECT,INSERT,REFERENCES,UPDATE ON TABLE main.lieu_inclusion TO min_scalingo;
GRANT SELECT ON TABLE main.lieu_inclusion TO min_dev;
GRANT ALL ON TABLE main.lieu_inclusion TO sonum;


-- Name: TABLE personne; Type: ACL; Schema: main; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE main.personne TO app_python;
GRANT SELECT,REFERENCES ON TABLE main.personne TO min_scalingo;
GRANT SELECT ON TABLE main.personne TO min_dev;


-- Name: TABLE personne_affectations_emploi; Type: ACL; Schema: main; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE main.personne_affectations_emploi TO app_python;
GRANT SELECT,INSERT,REFERENCES,DELETE,UPDATE ON TABLE main.personne_affectations_emploi TO min_scalingo;
GRANT SELECT ON TABLE main.personne_affectations_emploi TO min_dev;
GRANT ALL ON TABLE main.personne_affectations_emploi TO sonum;


-- Name: TABLE personne_affectations_lieu; Type: ACL; Schema: main; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE main.personne_affectations_lieu TO app_python;
GRANT SELECT,INSERT,REFERENCES,UPDATE ON TABLE main.personne_affectations_lieu TO min_scalingo;
GRANT SELECT ON TABLE main.personne_affectations_lieu TO min_dev;
GRANT ALL ON TABLE main.personne_affectations_lieu TO sonum;


-- Name: TABLE structure_administrative; Type: ACL; Schema: main; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE main.structure_administrative TO app_python;
GRANT SELECT,INSERT,REFERENCES,UPDATE ON TABLE main.structure_administrative TO min_scalingo;
GRANT SELECT ON TABLE main.structure_administrative TO min_dev;
GRANT ALL ON TABLE main.structure_administrative TO sonum;


-- Name: TABLE categories_juridiques; Type: ACL; Schema: reference; Owner: dataspace

GRANT SELECT,REFERENCES ON TABLE reference.categories_juridiques TO min_scalingo;
GRANT SELECT ON TABLE reference.categories_juridiques TO min_dev;


-- Name: TABLE structure_merge_log; Type: ACL; Schema: audit; Owner: dataspace

GRANT SELECT,INSERT ON TABLE audit.structure_merge_log TO min_scalingo;


-- Name: SEQUENCE structure_merge_log_id_seq; Type: ACL; Schema: audit; Owner: dataspace

GRANT USAGE ON SEQUENCE audit.structure_merge_log_id_seq TO min_scalingo;


-- Name: TABLE activites_coop; Type: ACL; Schema: main; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE main.activites_coop TO app_python;
GRANT SELECT,REFERENCES ON TABLE main.activites_coop TO min_scalingo;
GRANT SELECT ON TABLE main.activites_coop TO min_dev;


-- Name: TABLE formation; Type: ACL; Schema: main; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE main.formation TO app_python;
GRANT SELECT,REFERENCES ON TABLE main.formation TO min_scalingo;
GRANT SELECT ON TABLE main.formation TO min_dev;


-- Name: TABLE contact; Type: ACL; Schema: main; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE main.contact TO app_python;
GRANT SELECT,INSERT,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE main.contact TO min_scalingo;
GRANT SELECT ON TABLE main.contact TO min_dev;


-- Name: TABLE contact_structure_administrative; Type: ACL; Schema: main; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE main.contact_structure_administrative TO app_python;
GRANT SELECT,INSERT,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE main.contact_structure_administrative TO min_scalingo;
GRANT SELECT ON TABLE main.contact_structure_administrative TO min_dev;


-- Name: TABLE contrat; Type: ACL; Schema: main; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE main.contrat TO app_python;
GRANT SELECT,REFERENCES,UPDATE ON TABLE main.contrat TO min_scalingo;
GRANT SELECT ON TABLE main.contrat TO min_dev;


-- Name: TABLE poste; Type: ACL; Schema: main; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE main.poste TO app_python;
GRANT SELECT,REFERENCES,UPDATE ON TABLE main.poste TO min_scalingo;
GRANT SELECT ON TABLE main.poste TO min_dev;


-- Name: TABLE subvention; Type: ACL; Schema: main; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE main.subvention TO app_python;
GRANT SELECT,REFERENCES ON TABLE main.subvention TO min_scalingo;
GRANT SELECT ON TABLE main.subvention TO min_dev;


-- Name: TABLE ac_accompagnements_mensuels; Type: ACL; Schema: main; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE main.ac_accompagnements_mensuels TO app_python;
GRANT SELECT ON TABLE main.ac_accompagnements_mensuels TO min_scalingo;
GRANT SELECT ON TABLE main.ac_accompagnements_mensuels TO min_dev;


-- Name: SEQUENCE activites_coop_id_seq; Type: ACL; Schema: main; Owner: dataspace

GRANT USAGE ON SEQUENCE main.activites_coop_id_seq TO app_python;


-- Name: SEQUENCE adresse_id_seq; Type: ACL; Schema: main; Owner: dataspace

GRANT USAGE ON SEQUENCE main.adresse_id_seq TO app_python;
GRANT USAGE ON SEQUENCE main.adresse_id_seq TO min_scalingo;


-- Name: SEQUENCE contact_id_seq; Type: ACL; Schema: main; Owner: dataspace

GRANT USAGE ON SEQUENCE main.contact_id_seq TO app_python;
GRANT USAGE ON SEQUENCE main.contact_id_seq TO min_scalingo;


-- Name: SEQUENCE contact_structure_id_seq; Type: ACL; Schema: main; Owner: dataspace

GRANT USAGE ON SEQUENCE main.contact_structure_id_seq TO app_python;
GRANT USAGE ON SEQUENCE main.contact_structure_id_seq TO min_scalingo;


-- Name: SEQUENCE contrat_id_seq; Type: ACL; Schema: main; Owner: dataspace

GRANT USAGE ON SEQUENCE main.contrat_id_seq TO app_python;


-- Name: TABLE conum_labellisation; Type: ACL; Schema: main; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE main.conum_labellisation TO app_python;
GRANT SELECT,INSERT ON TABLE main.conum_labellisation TO min_scalingo;
GRANT SELECT ON TABLE main.conum_labellisation TO min_dev;


-- Name: SEQUENCE conum_labellisation_id_seq; Type: ACL; Schema: main; Owner: dataspace

GRANT USAGE ON SEQUENCE main.conum_labellisation_id_seq TO app_python;
GRANT USAGE ON SEQUENCE main.conum_labellisation_id_seq TO min_scalingo;


-- Name: TABLE coordination_mediation; Type: ACL; Schema: main; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE main.coordination_mediation TO app_python;
GRANT SELECT,REFERENCES ON TABLE main.coordination_mediation TO min_scalingo;
GRANT SELECT ON TABLE main.coordination_mediation TO min_dev;


-- Name: SEQUENCE coordination_mediation_id_seq; Type: ACL; Schema: main; Owner: dataspace

GRANT USAGE ON SEQUENCE main.coordination_mediation_id_seq TO app_python;


-- Name: SEQUENCE formation_id_seq; Type: ACL; Schema: main; Owner: dataspace

GRANT USAGE ON SEQUENCE main.formation_id_seq TO app_python;


-- Name: SEQUENCE lieu_inclusion_id_seq; Type: ACL; Schema: main; Owner: dataspace

GRANT USAGE ON SEQUENCE main.lieu_inclusion_id_seq TO app_python;


-- Name: SEQUENCE personne_affectations_emploi_id_seq; Type: ACL; Schema: main; Owner: dataspace

GRANT USAGE ON SEQUENCE main.personne_affectations_emploi_id_seq TO app_python;


-- Name: SEQUENCE personne_affectations_lieu_id_seq; Type: ACL; Schema: main; Owner: dataspace

GRANT USAGE ON SEQUENCE main.personne_affectations_lieu_id_seq TO app_python;


-- Name: SEQUENCE personne_id_seq; Type: ACL; Schema: main; Owner: dataspace

GRANT USAGE ON SEQUENCE main.personne_id_seq TO app_python;


-- Name: SEQUENCE poste_id_seq; Type: ACL; Schema: main; Owner: dataspace

GRANT USAGE ON SEQUENCE main.poste_id_seq TO app_python;


-- Name: SEQUENCE structure_administrative_id_seq; Type: ACL; Schema: main; Owner: dataspace

GRANT USAGE ON SEQUENCE main.structure_administrative_id_seq TO app_python;


-- Name: SEQUENCE subvention_id_seq; Type: ACL; Schema: main; Owner: dataspace

GRANT USAGE ON SEQUENCE main.subvention_id_seq TO app_python;


-- Name: TABLE naf; Type: ACL; Schema: reference; Owner: dataspace

GRANT SELECT,REFERENCES ON TABLE reference.naf TO min_scalingo;
GRANT SELECT ON TABLE reference.naf TO min_dev;


-- Name: TABLE ac__accompagnements; Type: ACL; Schema: staging; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE staging.ac__accompagnements TO app_python;


-- Name: TABLE ac__aidants; Type: ACL; Schema: staging; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE staging.ac__aidants TO app_python;


-- Name: TABLE ac__structures; Type: ACL; Schema: staging; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE staging.ac__structures TO app_python;


-- Name: TABLE carto__structures; Type: ACL; Schema: staging; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE staging.carto__structures TO app_python;


-- Name: TABLE coop__structures; Type: ACL; Schema: staging; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE staging.coop__structures TO app_python;


-- Name: TABLE coop__utilisateurs; Type: ACL; Schema: staging; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE staging.coop__utilisateurs TO app_python;


-- Name: TABLE frr__zonage; Type: ACL; Schema: staging; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE staging.frr__zonage TO app_python;


-- Name: TABLE geocodage__cache; Type: ACL; Schema: staging; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE staging.geocodage__cache TO app_python;


-- Name: TABLE idposte__contrat; Type: ACL; Schema: staging; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE staging.idposte__contrat TO app_python;


-- Name: TABLE idposte__formation; Type: ACL; Schema: staging; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE staging.idposte__formation TO app_python;


-- Name: TABLE idposte__personne; Type: ACL; Schema: staging; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE staging.idposte__personne TO app_python;


-- Name: TABLE idposte__poste; Type: ACL; Schema: staging; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE staging.idposte__poste TO app_python;


-- Name: TABLE idposte__structure; Type: ACL; Schema: staging; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE staging.idposte__structure TO app_python;


-- Name: TABLE idposte__subvention; Type: ACL; Schema: staging; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE staging.idposte__subvention TO app_python;


-- Name: TABLE qpv__zonage; Type: ACL; Schema: staging; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE staging.qpv__zonage TO app_python;


-- Name: TABLE rejets; Type: ACL; Schema: staging; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE staging.rejets TO app_python;


-- Name: SEQUENCE rejets_id_seq; Type: ACL; Schema: staging; Owner: dataspace

GRANT USAGE,UPDATE ON SEQUENCE staging.rejets_id_seq TO app_python;


-- Name: TABLE sirene__cache; Type: ACL; Schema: staging; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE staging.sirene__cache TO app_python;


-- Name: TABLE sirene__etablissements; Type: ACL; Schema: staging; Owner: dataspace

GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLE staging.sirene__etablissements TO app_python;


-- PostgreSQL database dump complete

CREATE OR REPLACE FUNCTION public.updated_at_column() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE OR REPLACE FUNCTION public.edited_by_column() RETURNS TRIGGER AS $$ BEGIN IF NEW.edited_by IS NULL THEN NEW.edited_by = current_user; END IF; RETURN NEW; END; $$ LANGUAGE plpgsql;
-- PostgreSQL database dump

-- Dumped from database version 16.4
-- Dumped by pg_dump version 16.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

-- Name: commune_epci commune_epci_pkey; Type: CONSTRAINT; Schema: admin; Owner: dataspace

ALTER TABLE ONLY admin.commune_epci
    ADD CONSTRAINT commune_epci_pkey PRIMARY KEY (id);


-- Name: commune_epci commune_epci_ukey; Type: CONSTRAINT; Schema: admin; Owner: dataspace

ALTER TABLE ONLY admin.commune_epci
    ADD CONSTRAINT commune_epci_ukey UNIQUE (commune_id, epci_id);


-- Name: commune commune_pkey; Type: CONSTRAINT; Schema: admin; Owner: dataspace

ALTER TABLE ONLY admin.commune
    ADD CONSTRAINT commune_pkey PRIMARY KEY (id);


-- Name: commune commune_ukey; Type: CONSTRAINT; Schema: admin; Owner: dataspace

ALTER TABLE ONLY admin.commune
    ADD CONSTRAINT commune_ukey UNIQUE (code_insee);


-- Name: departement departement_pkey; Type: CONSTRAINT; Schema: admin; Owner: dataspace

ALTER TABLE ONLY admin.departement
    ADD CONSTRAINT departement_pkey PRIMARY KEY (id);


-- Name: departement departement_ukey; Type: CONSTRAINT; Schema: admin; Owner: dataspace

ALTER TABLE ONLY admin.departement
    ADD CONSTRAINT departement_ukey UNIQUE (code);


-- Name: epci epci_pkey; Type: CONSTRAINT; Schema: admin; Owner: dataspace

ALTER TABLE ONLY admin.epci
    ADD CONSTRAINT epci_pkey PRIMARY KEY (id);


-- Name: epci epci_ukey; Type: CONSTRAINT; Schema: admin; Owner: dataspace

ALTER TABLE ONLY admin.epci
    ADD CONSTRAINT epci_ukey UNIQUE (code);


-- Name: icp_departement icp_departement_code_ukey; Type: CONSTRAINT; Schema: admin; Owner: dataspace

ALTER TABLE ONLY admin.icp_departement
    ADD CONSTRAINT icp_departement_code_ukey UNIQUE (code);


-- Name: icp_departement icp_departement_pkey; Type: CONSTRAINT; Schema: admin; Owner: dataspace

ALTER TABLE ONLY admin.icp_departement
    ADD CONSTRAINT icp_departement_pkey PRIMARY KEY (id);


-- Name: ifn_commune ifn_commune_pkey; Type: CONSTRAINT; Schema: admin; Owner: dataspace

ALTER TABLE ONLY admin.ifn_commune
    ADD CONSTRAINT ifn_commune_pkey PRIMARY KEY (id);


-- Name: ifn_commune ifn_commune_ukey; Type: CONSTRAINT; Schema: admin; Owner: dataspace

ALTER TABLE ONLY admin.ifn_commune
    ADD CONSTRAINT ifn_commune_ukey UNIQUE (code_insee);


-- Name: ifn_departement ifn_departement_code_dept_unique; Type: CONSTRAINT; Schema: admin; Owner: dataspace

ALTER TABLE ONLY admin.ifn_departement
    ADD CONSTRAINT ifn_departement_code_dept_unique UNIQUE (code);


-- Name: ifn_departement ifn_departement_pkey; Type: CONSTRAINT; Schema: admin; Owner: dataspace

ALTER TABLE ONLY admin.ifn_departement
    ADD CONSTRAINT ifn_departement_pkey PRIMARY KEY (id);


-- Name: insee_cp insee_cp_pkey; Type: CONSTRAINT; Schema: admin; Owner: dataspace

ALTER TABLE ONLY admin.insee_cp
    ADD CONSTRAINT insee_cp_pkey PRIMARY KEY (id);


-- Name: insee_cp insee_cp_ukey; Type: CONSTRAINT; Schema: admin; Owner: dataspace

ALTER TABLE ONLY admin.insee_cp
    ADD CONSTRAINT insee_cp_ukey UNIQUE (code_postal, code_insee);


-- Name: insee_historique insee_historique_pkey; Type: CONSTRAINT; Schema: admin; Owner: dataspace

ALTER TABLE ONLY admin.insee_historique
    ADD CONSTRAINT insee_historique_pkey PRIMARY KEY (id);


-- Name: insee_historique insee_historique_ukey; Type: CONSTRAINT; Schema: admin; Owner: dataspace

ALTER TABLE ONLY admin.insee_historique
    ADD CONSTRAINT insee_historique_ukey UNIQUE (code_insee_ancien, code_insee_nouveau);


-- Name: region region_pkey; Type: CONSTRAINT; Schema: admin; Owner: dataspace

ALTER TABLE ONLY admin.region
    ADD CONSTRAINT region_pkey PRIMARY KEY (id);


-- Name: region region_ukey; Type: CONSTRAINT; Schema: admin; Owner: dataspace

ALTER TABLE ONLY admin.region
    ADD CONSTRAINT region_ukey UNIQUE (code);


-- Name: zonage zonage_pkey; Type: CONSTRAINT; Schema: admin; Owner: dataspace

ALTER TABLE ONLY admin.zonage
    ADD CONSTRAINT zonage_pkey PRIMARY KEY (id);


-- Name: zonage zonage_qpv_ukey; Type: CONSTRAINT; Schema: admin; Owner: dataspace

ALTER TABLE ONLY admin.zonage
    ADD CONSTRAINT zonage_qpv_ukey UNIQUE (code, code_insee);


-- Name: personne_merge_log personne_merge_log_pkey; Type: CONSTRAINT; Schema: audit; Owner: dataspace

ALTER TABLE ONLY audit.personne_merge_log
    ADD CONSTRAINT personne_merge_log_pkey PRIMARY KEY (id);


-- Name: structure_merge_log structure_merge_log_pkey; Type: CONSTRAINT; Schema: audit; Owner: dataspace

ALTER TABLE ONLY audit.structure_merge_log
    ADD CONSTRAINT structure_merge_log_pkey PRIMARY KEY (id);


-- Name: ac_accompagnements_mensuels ac_accompagnements_mensuels_pkey; Type: CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.ac_accompagnements_mensuels
    ADD CONSTRAINT ac_accompagnements_mensuels_pkey PRIMARY KEY (aidant_connect_id, mois);


-- Name: activites_coop activites_coop_coop_id_ukey; Type: CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.activites_coop
    ADD CONSTRAINT activites_coop_coop_id_ukey UNIQUE (coop_id);


-- Name: activites_coop activites_coop_pkey; Type: CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.activites_coop
    ADD CONSTRAINT activites_coop_pkey PRIMARY KEY (id);


-- Name: adresse adresse_code_ban_ukey; Type: CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.adresse
    ADD CONSTRAINT adresse_code_ban_ukey UNIQUE (code_ban);


-- Name: adresse adresse_pkey; Type: CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.adresse
    ADD CONSTRAINT adresse_pkey PRIMARY KEY (id);


-- Name: contact contact_pkey; Type: CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.contact
    ADD CONSTRAINT contact_pkey PRIMARY KEY (id);


-- Name: contact_structure_administrative contact_structure_administrative_pkey; Type: CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.contact_structure_administrative
    ADD CONSTRAINT contact_structure_administrative_pkey PRIMARY KEY (id);


-- Name: contact_structure_administrative contact_structure_administrative_unique; Type: CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.contact_structure_administrative
    ADD CONSTRAINT contact_structure_administrative_unique UNIQUE (structure_administrative_id, contact_id);


-- Name: contrat contrat_pkey; Type: CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.contrat
    ADD CONSTRAINT contrat_pkey PRIMARY KEY (id);


-- Name: conum_labellisation conum_labellisation_pkey; Type: CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.conum_labellisation
    ADD CONSTRAINT conum_labellisation_pkey PRIMARY KEY (id);


-- Name: coordination_mediation coordination_mediation_pkey; Type: CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.coordination_mediation
    ADD CONSTRAINT coordination_mediation_pkey PRIMARY KEY (id);


-- Name: formation formation_pkey; Type: CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.formation
    ADD CONSTRAINT formation_pkey PRIMARY KEY (id);


-- Name: lieu_inclusion lieu_inclusion_carto_id_ukey; Type: CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.lieu_inclusion
    ADD CONSTRAINT lieu_inclusion_carto_id_ukey UNIQUE (structure_cartographie_nationale_id);


-- Name: lieu_inclusion lieu_inclusion_old_main_structure_id_ukey; Type: CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.lieu_inclusion
    ADD CONSTRAINT lieu_inclusion_old_main_structure_id_ukey UNIQUE (old_main_structure_id);


-- Name: lieu_inclusion lieu_inclusion_pkey; Type: CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.lieu_inclusion
    ADD CONSTRAINT lieu_inclusion_pkey PRIMARY KEY (id);


-- Name: lieu_inclusion lieu_inclusion_structure_coop_id_ukey; Type: CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.lieu_inclusion
    ADD CONSTRAINT lieu_inclusion_structure_coop_id_ukey UNIQUE (structure_coop_id);


-- Name: personne_affectations_emploi personne_affectations_emploi_pkey; Type: CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.personne_affectations_emploi
    ADD CONSTRAINT personne_affectations_emploi_pkey PRIMARY KEY (id);


-- Name: personne_affectations_lieu personne_affectations_lieu_pkey; Type: CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.personne_affectations_lieu
    ADD CONSTRAINT personne_affectations_lieu_pkey PRIMARY KEY (id);


-- Name: personne personne_aidant_connect_id_ukey; Type: CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.personne
    ADD CONSTRAINT personne_aidant_connect_id_ukey UNIQUE (aidant_connect_id);


-- Name: personne personne_cn_pg_id_ukey; Type: CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.personne
    ADD CONSTRAINT personne_cn_pg_id_ukey UNIQUE (cn_pg_id);


-- Name: personne personne_conseiller_numerique_id_ukey; Type: CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.personne
    ADD CONSTRAINT personne_conseiller_numerique_id_ukey UNIQUE (conseiller_numerique_id);


-- Name: personne personne_coop_id_ukey; Type: CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.personne
    ADD CONSTRAINT personne_coop_id_ukey UNIQUE (coop_id);


-- Name: personne personne_pkey; Type: CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.personne
    ADD CONSTRAINT personne_pkey PRIMARY KEY (id);


-- Name: poste poste_pkey; Type: CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.poste
    ADD CONSTRAINT poste_pkey PRIMARY KEY (id);


-- Name: poste poste_ukey; Type: CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.poste
    ADD CONSTRAINT poste_ukey UNIQUE (poste_conum_id, structure_id, personne_id);


-- Name: structure_administrative structure_administrative_old_main_structure_id_ukey; Type: CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.structure_administrative
    ADD CONSTRAINT structure_administrative_old_main_structure_id_ukey UNIQUE (old_main_structure_id);


-- Name: structure_administrative structure_administrative_pkey; Type: CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.structure_administrative
    ADD CONSTRAINT structure_administrative_pkey PRIMARY KEY (id);


-- Name: structure_administrative structure_administrative_ridet_ukey; Type: CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.structure_administrative
    ADD CONSTRAINT structure_administrative_ridet_ukey UNIQUE (ridet);


-- Name: structure_administrative structure_administrative_siret_antenne_ukey; Type: CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.structure_administrative
    ADD CONSTRAINT structure_administrative_siret_antenne_ukey UNIQUE NULLS NOT DISTINCT (siret, denomination_antenne);


-- Name: structure_administrative structure_administrative_structure_ac_id_ukey; Type: CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.structure_administrative
    ADD CONSTRAINT structure_administrative_structure_ac_id_ukey UNIQUE (structure_ac_id);


-- Name: structure_administrative structure_administrative_structure_coop_id_ukey; Type: CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.structure_administrative
    ADD CONSTRAINT structure_administrative_structure_coop_id_ukey UNIQUE (structure_coop_id);


-- Name: structure_administrative structure_administrative_structure_tp_id_ukey; Type: CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.structure_administrative
    ADD CONSTRAINT structure_administrative_structure_tp_id_ukey UNIQUE (structure_tp_id);


-- Name: subvention subvention_pkey; Type: CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.subvention
    ADD CONSTRAINT subvention_pkey PRIMARY KEY (id);


-- Name: categories_juridiques categories_juridiques_pkey; Type: CONSTRAINT; Schema: reference; Owner: dataspace

ALTER TABLE ONLY reference.categories_juridiques
    ADD CONSTRAINT categories_juridiques_pkey PRIMARY KEY (id);


-- Name: categories_juridiques categories_juridiques_ukey; Type: CONSTRAINT; Schema: reference; Owner: dataspace

ALTER TABLE ONLY reference.categories_juridiques
    ADD CONSTRAINT categories_juridiques_ukey UNIQUE (code);


-- Name: naf naf_pkey; Type: CONSTRAINT; Schema: reference; Owner: dataspace

ALTER TABLE ONLY reference.naf
    ADD CONSTRAINT naf_pkey PRIMARY KEY (id);


-- Name: naf naf_ukey; Type: CONSTRAINT; Schema: reference; Owner: dataspace

ALTER TABLE ONLY reference.naf
    ADD CONSTRAINT naf_ukey UNIQUE (code);


-- Name: geocodage__cache geocodage__cache_pkey; Type: CONSTRAINT; Schema: staging; Owner: dataspace

ALTER TABLE ONLY staging.geocodage__cache
    ADD CONSTRAINT geocodage__cache_pkey PRIMARY KEY (adresse, code_insee, code_postal);


-- Name: rejets rejets_pkey; Type: CONSTRAINT; Schema: staging; Owner: dataspace

ALTER TABLE ONLY staging.rejets
    ADD CONSTRAINT rejets_pkey PRIMARY KEY (id);


-- Name: sirene__cache sirene__cache_pkey; Type: CONSTRAINT; Schema: staging; Owner: dataspace

ALTER TABLE ONLY staging.sirene__cache
    ADD CONSTRAINT sirene__cache_pkey PRIMARY KEY (siret);


-- Name: commune_geom_idx; Type: INDEX; Schema: admin; Owner: dataspace

CREATE INDEX commune_geom_idx ON admin.commune USING gist (geom);


-- Name: commune_nom_idx; Type: INDEX; Schema: admin; Owner: dataspace

CREATE INDEX commune_nom_idx ON admin.commune USING btree (nom);


-- Name: departement_code_idx; Type: INDEX; Schema: admin; Owner: dataspace

CREATE UNIQUE INDEX departement_code_idx ON admin.departement USING btree (code);


-- Name: departement_nom_idx; Type: INDEX; Schema: admin; Owner: dataspace

CREATE INDEX departement_nom_idx ON admin.departement USING btree (nom);


-- Name: epci_departement_id_idx; Type: INDEX; Schema: admin; Owner: dataspace

CREATE INDEX epci_departement_id_idx ON admin.epci USING btree (departement_id);


-- Name: ifn_commune_code_insee_idx; Type: INDEX; Schema: admin; Owner: dataspace

CREATE INDEX ifn_commune_code_insee_idx ON admin.ifn_commune USING btree (code_insee);


-- Name: ifn_departement_code_dept_idx; Type: INDEX; Schema: admin; Owner: dataspace

CREATE INDEX ifn_departement_code_dept_idx ON admin.ifn_departement USING btree (code);


-- Name: region_code_idx; Type: INDEX; Schema: admin; Owner: dataspace

CREATE UNIQUE INDEX region_code_idx ON admin.region USING btree (code);


-- Name: region_nom_idx; Type: INDEX; Schema: admin; Owner: dataspace

CREATE INDEX region_nom_idx ON admin.region USING btree (nom);


-- Name: zonage_code_insee_idx; Type: INDEX; Schema: admin; Owner: dataspace

CREATE INDEX zonage_code_insee_idx ON admin.zonage USING btree (code_insee);


-- Name: zonage_frr_ukey; Type: INDEX; Schema: admin; Owner: dataspace

CREATE UNIQUE INDEX zonage_frr_ukey ON admin.zonage USING btree (code_insee) WHERE ((type)::text = 'FRR'::text);


-- Name: zonage_geom_idx; Type: INDEX; Schema: admin; Owner: dataspace

CREATE INDEX zonage_geom_idx ON admin.zonage USING gist (geom);


-- Name: personne_merge_log_loser_idx; Type: INDEX; Schema: audit; Owner: dataspace

CREATE INDEX personne_merge_log_loser_idx ON audit.personne_merge_log USING btree (loser_id);


-- Name: personne_merge_log_merged_at_idx; Type: INDEX; Schema: audit; Owner: dataspace

CREATE INDEX personne_merge_log_merged_at_idx ON audit.personne_merge_log USING btree (merged_at);


-- Name: personne_merge_log_run_idx; Type: INDEX; Schema: audit; Owner: dataspace

CREATE INDEX personne_merge_log_run_idx ON audit.personne_merge_log USING btree (run_id);


-- Name: personne_merge_log_winner_idx; Type: INDEX; Schema: audit; Owner: dataspace

CREATE INDEX personne_merge_log_winner_idx ON audit.personne_merge_log USING btree (winner_id);


-- Name: structure_merge_log_loser_idx; Type: INDEX; Schema: audit; Owner: dataspace

CREATE INDEX structure_merge_log_loser_idx ON audit.structure_merge_log USING btree (loser_id);


-- Name: structure_merge_log_merged_at_idx; Type: INDEX; Schema: audit; Owner: dataspace

CREATE INDEX structure_merge_log_merged_at_idx ON audit.structure_merge_log USING btree (merged_at);


-- Name: structure_merge_log_run_idx; Type: INDEX; Schema: audit; Owner: dataspace

CREATE INDEX structure_merge_log_run_idx ON audit.structure_merge_log USING btree (run_id);


-- Name: structure_merge_log_winner_idx; Type: INDEX; Schema: audit; Owner: dataspace

CREATE INDEX structure_merge_log_winner_idx ON audit.structure_merge_log USING btree (winner_id);


-- Name: activites_coop_lieu_code_insee_idx; Type: INDEX; Schema: main; Owner: dataspace

CREATE INDEX activites_coop_lieu_code_insee_idx ON main.activites_coop USING btree (lieu_code_insee);


-- Name: activites_coop_periode_idx; Type: INDEX; Schema: main; Owner: dataspace

CREATE INDEX activites_coop_periode_idx ON main.activites_coop USING btree (periode);


-- Name: activites_coop_personne_id_idx; Type: INDEX; Schema: main; Owner: dataspace

CREATE INDEX activites_coop_personne_id_idx ON main.activites_coop USING btree (personne_id);


-- Name: adresse_code_insee_idx; Type: INDEX; Schema: main; Owner: dataspace

CREATE INDEX adresse_code_insee_idx ON main.adresse USING btree (code_insee);


-- Name: adresse_geom_idx; Type: INDEX; Schema: main; Owner: dataspace

CREATE INDEX adresse_geom_idx ON main.adresse USING gist (geom);


-- Name: adresse_ukey; Type: INDEX; Schema: main; Owner: dataspace

CREATE UNIQUE INDEX adresse_ukey ON main.adresse USING btree (code_postal, nom_commune, nom_voie, COALESCE((numero_voie)::integer, 0), COALESCE(repetition, ''::character varying)) NULLS NOT DISTINCT;


-- Name: contact_structure_administrative_structure_id_idx; Type: INDEX; Schema: main; Owner: dataspace

CREATE INDEX contact_structure_administrative_structure_id_idx ON main.contact_structure_administrative USING btree (structure_administrative_id);


-- Name: contact_structure_contact_id_idx; Type: INDEX; Schema: main; Owner: dataspace

CREATE INDEX contact_structure_contact_id_idx ON main.contact_structure_administrative USING btree (contact_id);


-- Name: conum_labellisation_structure_id_idx; Type: INDEX; Schema: main; Owner: dataspace

CREATE INDEX conum_labellisation_structure_id_idx ON main.conum_labellisation USING btree (structure_id);


-- Name: coordination_mediation_ukey; Type: INDEX; Schema: main; Owner: dataspace

CREATE UNIQUE INDEX coordination_mediation_ukey ON main.coordination_mediation USING btree (coordinateur_id, mediateur_id, COALESCE(suppression, '1234-01-02 03:04:05+00'::timestamp with time zone));


-- Name: formation_personne_id_idx; Type: INDEX; Schema: main; Owner: dataspace

CREATE INDEX formation_personne_id_idx ON main.formation USING btree (personne_id);


-- Name: idx_personne_affectations_emploi_active; Type: INDEX; Schema: main; Owner: dataspace

CREATE INDEX idx_personne_affectations_emploi_active ON main.personne_affectations_emploi USING btree (structure_administrative_id, est_active) WHERE (est_active = true);


-- Name: idx_personne_affectations_emploi_personne_id; Type: INDEX; Schema: main; Owner: dataspace

CREATE INDEX idx_personne_affectations_emploi_personne_id ON main.personne_affectations_emploi USING btree (personne_id);


-- Name: idx_personne_affectations_emploi_structure_administrative_id; Type: INDEX; Schema: main; Owner: dataspace

CREATE INDEX idx_personne_affectations_emploi_structure_administrative_id ON main.personne_affectations_emploi USING btree (structure_administrative_id);


-- Name: idx_personne_affectations_lieu_active; Type: INDEX; Schema: main; Owner: dataspace

CREATE INDEX idx_personne_affectations_lieu_active ON main.personne_affectations_lieu USING btree (lieu_id, est_active) WHERE (est_active = true);


-- Name: idx_personne_affectations_lieu_lieu_id; Type: INDEX; Schema: main; Owner: dataspace

CREATE INDEX idx_personne_affectations_lieu_lieu_id ON main.personne_affectations_lieu USING btree (lieu_id);


-- Name: idx_personne_affectations_lieu_personne_id; Type: INDEX; Schema: main; Owner: dataspace

CREATE INDEX idx_personne_affectations_lieu_personne_id ON main.personne_affectations_lieu USING btree (personne_id);


-- Name: lieu_inclusion_adresse_id_idx; Type: INDEX; Schema: main; Owner: dataspace

CREATE INDEX lieu_inclusion_adresse_id_idx ON main.lieu_inclusion USING btree (adresse_id);


-- Name: lieu_inclusion_nom_idx; Type: INDEX; Schema: main; Owner: dataspace

CREATE INDEX lieu_inclusion_nom_idx ON main.lieu_inclusion USING btree (nom);


-- Name: lieu_inclusion_visible_idx; Type: INDEX; Schema: main; Owner: dataspace

CREATE INDEX lieu_inclusion_visible_idx ON main.lieu_inclusion USING btree (visible_pour_cartographie_nationale) WHERE (visible_pour_cartographie_nationale = true);


-- Name: personne_affectations_emploi_ukey; Type: INDEX; Schema: main; Owner: dataspace

CREATE UNIQUE INDEX personne_affectations_emploi_ukey ON main.personne_affectations_emploi USING btree (personne_id, structure_administrative_id, source);


-- Name: personne_affectations_lieu_ukey; Type: INDEX; Schema: main; Owner: dataspace

CREATE UNIQUE INDEX personne_affectations_lieu_ukey ON main.personne_affectations_lieu USING btree (personne_id, lieu_id, source);


-- Name: personne_patronyme; Type: INDEX; Schema: main; Owner: dataspace

CREATE INDEX personne_patronyme ON main.personne USING btree (nom, prenom);


-- Name: personne_trgm_idx; Type: INDEX; Schema: main; Owner: dataspace

CREATE INDEX personne_trgm_idx ON main.personne USING gist (((((prenom)::text || ' '::text) || (nom)::text)) public.gist_trgm_ops (siglen='64'));


-- Name: structure_administrative_adresse_id_idx; Type: INDEX; Schema: main; Owner: dataspace

CREATE INDEX structure_administrative_adresse_id_idx ON main.structure_administrative USING btree (adresse_id);


-- Name: structure_administrative_denomination_sirene_idx; Type: INDEX; Schema: main; Owner: dataspace

CREATE INDEX structure_administrative_denomination_sirene_idx ON main.structure_administrative USING btree (denomination_sirene);


-- Name: rejets_flux_rejete_at_idx; Type: INDEX; Schema: staging; Owner: dataspace

CREATE INDEX rejets_flux_rejete_at_idx ON staging.rejets USING btree (flux, rejete_at DESC);


-- Name: icp_departement admin_icp_departement_updated_at; Type: TRIGGER; Schema: admin; Owner: dataspace

CREATE TRIGGER admin_icp_departement_updated_at BEFORE UPDATE ON admin.icp_departement FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();


-- Name: ifn_departement admin_ifn_departement_updated_at; Type: TRIGGER; Schema: admin; Owner: dataspace

CREATE TRIGGER admin_ifn_departement_updated_at BEFORE UPDATE ON admin.ifn_departement FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();


-- Name: commune updated_at; Type: TRIGGER; Schema: admin; Owner: dataspace

CREATE TRIGGER updated_at BEFORE UPDATE ON admin.commune FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();


-- Name: commune_epci updated_at; Type: TRIGGER; Schema: admin; Owner: dataspace

CREATE TRIGGER updated_at BEFORE UPDATE ON admin.commune_epci FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();


-- Name: departement updated_at; Type: TRIGGER; Schema: admin; Owner: dataspace

CREATE TRIGGER updated_at BEFORE UPDATE ON admin.departement FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();


-- Name: epci updated_at; Type: TRIGGER; Schema: admin; Owner: dataspace

CREATE TRIGGER updated_at BEFORE UPDATE ON admin.epci FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();


-- Name: ifn_commune updated_at; Type: TRIGGER; Schema: admin; Owner: dataspace

CREATE TRIGGER updated_at BEFORE UPDATE ON admin.ifn_commune FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();


-- Name: insee_cp updated_at; Type: TRIGGER; Schema: admin; Owner: dataspace

CREATE TRIGGER updated_at BEFORE UPDATE ON admin.insee_cp FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();


-- Name: insee_historique updated_at; Type: TRIGGER; Schema: admin; Owner: dataspace

CREATE TRIGGER updated_at BEFORE UPDATE ON admin.insee_historique FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();


-- Name: region updated_at; Type: TRIGGER; Schema: admin; Owner: dataspace

CREATE TRIGGER updated_at BEFORE UPDATE ON admin.region FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();


-- Name: zonage updated_at; Type: TRIGGER; Schema: admin; Owner: dataspace

CREATE TRIGGER updated_at BEFORE UPDATE ON admin.zonage FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();


-- Name: personne edited_by; Type: TRIGGER; Schema: main; Owner: dataspace

CREATE TRIGGER edited_by BEFORE INSERT OR UPDATE ON main.personne FOR EACH ROW EXECUTE FUNCTION public.edited_by_column();


-- Name: activites_coop updated_at; Type: TRIGGER; Schema: main; Owner: dataspace

CREATE TRIGGER updated_at BEFORE UPDATE ON main.activites_coop FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();


-- Name: adresse updated_at; Type: TRIGGER; Schema: main; Owner: dataspace

CREATE TRIGGER updated_at BEFORE UPDATE ON main.adresse FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();


-- Name: contrat updated_at; Type: TRIGGER; Schema: main; Owner: dataspace

CREATE TRIGGER updated_at BEFORE UPDATE ON main.contrat FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();


-- Name: coordination_mediation updated_at; Type: TRIGGER; Schema: main; Owner: dataspace

CREATE TRIGGER updated_at BEFORE UPDATE ON main.coordination_mediation FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();


-- Name: formation updated_at; Type: TRIGGER; Schema: main; Owner: dataspace

CREATE TRIGGER updated_at BEFORE UPDATE ON main.formation FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();


-- Name: personne updated_at; Type: TRIGGER; Schema: main; Owner: dataspace

CREATE TRIGGER updated_at BEFORE UPDATE ON main.personne FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();


-- Name: personne_affectations_emploi updated_at; Type: TRIGGER; Schema: main; Owner: dataspace

CREATE TRIGGER updated_at BEFORE UPDATE ON main.personne_affectations_emploi FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();


-- Name: personne_affectations_lieu updated_at; Type: TRIGGER; Schema: main; Owner: dataspace

CREATE TRIGGER updated_at BEFORE UPDATE ON main.personne_affectations_lieu FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();


-- Name: poste updated_at; Type: TRIGGER; Schema: main; Owner: dataspace

CREATE TRIGGER updated_at BEFORE UPDATE ON main.poste FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();


-- Name: structure_administrative updated_at; Type: TRIGGER; Schema: main; Owner: dataspace

CREATE TRIGGER updated_at BEFORE UPDATE ON main.structure_administrative FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();


-- Name: subvention updated_at; Type: TRIGGER; Schema: main; Owner: dataspace

CREATE TRIGGER updated_at BEFORE UPDATE ON main.subvention FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();


-- Name: activites_coop updated_at_insert; Type: TRIGGER; Schema: main; Owner: dataspace

CREATE TRIGGER updated_at_insert BEFORE INSERT ON main.activites_coop FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();


-- Name: adresse updated_at_insert; Type: TRIGGER; Schema: main; Owner: dataspace

CREATE TRIGGER updated_at_insert BEFORE INSERT ON main.adresse FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();


-- Name: contrat updated_at_insert; Type: TRIGGER; Schema: main; Owner: dataspace

CREATE TRIGGER updated_at_insert BEFORE INSERT ON main.contrat FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();


-- Name: coordination_mediation updated_at_insert; Type: TRIGGER; Schema: main; Owner: dataspace

CREATE TRIGGER updated_at_insert BEFORE INSERT ON main.coordination_mediation FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();


-- Name: formation updated_at_insert; Type: TRIGGER; Schema: main; Owner: dataspace

CREATE TRIGGER updated_at_insert BEFORE INSERT ON main.formation FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();


-- Name: personne updated_at_insert; Type: TRIGGER; Schema: main; Owner: dataspace

CREATE TRIGGER updated_at_insert BEFORE INSERT ON main.personne FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();


-- Name: poste updated_at_insert; Type: TRIGGER; Schema: main; Owner: dataspace

CREATE TRIGGER updated_at_insert BEFORE INSERT ON main.poste FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();


-- Name: subvention updated_at_insert; Type: TRIGGER; Schema: main; Owner: dataspace

CREATE TRIGGER updated_at_insert BEFORE INSERT ON main.subvention FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();


-- Name: categories_juridiques updated_at; Type: TRIGGER; Schema: reference; Owner: dataspace

CREATE TRIGGER updated_at BEFORE UPDATE ON reference.categories_juridiques FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();


-- Name: naf updated_at; Type: TRIGGER; Schema: reference; Owner: dataspace

CREATE TRIGGER updated_at BEFORE UPDATE ON reference.naf FOR EACH ROW EXECUTE FUNCTION public.updated_at_column();


-- Name: commune commune_departement_id; Type: FK CONSTRAINT; Schema: admin; Owner: dataspace

ALTER TABLE ONLY admin.commune
    ADD CONSTRAINT commune_departement_id FOREIGN KEY (departement_id) REFERENCES admin.departement(id);


-- Name: commune_epci commune_epci_commune_id; Type: FK CONSTRAINT; Schema: admin; Owner: dataspace

ALTER TABLE ONLY admin.commune_epci
    ADD CONSTRAINT commune_epci_commune_id FOREIGN KEY (commune_id) REFERENCES admin.commune(id);


-- Name: commune_epci commune_epci_epci_id; Type: FK CONSTRAINT; Schema: admin; Owner: dataspace

ALTER TABLE ONLY admin.commune_epci
    ADD CONSTRAINT commune_epci_epci_id FOREIGN KEY (epci_id) REFERENCES admin.epci(id);


-- Name: departement departement_region_id; Type: FK CONSTRAINT; Schema: admin; Owner: dataspace

ALTER TABLE ONLY admin.departement
    ADD CONSTRAINT departement_region_id FOREIGN KEY (region_id) REFERENCES admin.region(id);


-- Name: epci epci_departement_id; Type: FK CONSTRAINT; Schema: admin; Owner: dataspace

ALTER TABLE ONLY admin.epci
    ADD CONSTRAINT epci_departement_id FOREIGN KEY (departement_id) REFERENCES admin.departement(id);


-- Name: zonage zonage_code_insee_fkey; Type: FK CONSTRAINT; Schema: admin; Owner: dataspace

ALTER TABLE ONLY admin.zonage
    ADD CONSTRAINT zonage_code_insee_fkey FOREIGN KEY (code_insee) REFERENCES admin.commune(code_insee);


-- Name: activites_coop activites_coop_lieu_id_fkey; Type: FK CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.activites_coop
    ADD CONSTRAINT activites_coop_lieu_id_fkey FOREIGN KEY (lieu_id) REFERENCES main.lieu_inclusion(id) ON DELETE SET NULL;


-- Name: activites_coop activites_coop_personne_id_fkey; Type: FK CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.activites_coop
    ADD CONSTRAINT activites_coop_personne_id_fkey FOREIGN KEY (personne_id) REFERENCES main.personne(id);


-- Name: contact_structure_administrative contact_structure_administrative_structure_id_fkey; Type: FK CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.contact_structure_administrative
    ADD CONSTRAINT contact_structure_administrative_structure_id_fkey FOREIGN KEY (structure_administrative_id) REFERENCES main.structure_administrative(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Name: contact_structure_administrative contact_structure_contact_id_fkey; Type: FK CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.contact_structure_administrative
    ADD CONSTRAINT contact_structure_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES main.contact(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Name: contrat contrat_personne_id_fkey; Type: FK CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.contrat
    ADD CONSTRAINT contrat_personne_id_fkey FOREIGN KEY (personne_id) REFERENCES main.personne(id);


-- Name: contrat contrat_structure_id_fkey; Type: FK CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.contrat
    ADD CONSTRAINT contrat_structure_id_fkey FOREIGN KEY (structure_id) REFERENCES main.structure_administrative(id);


-- Name: conum_labellisation conum_labellisation_structure_id_fkey; Type: FK CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.conum_labellisation
    ADD CONSTRAINT conum_labellisation_structure_id_fkey FOREIGN KEY (structure_id) REFERENCES main.structure_administrative(id) ON UPDATE CASCADE ON DELETE RESTRICT;


-- Name: conum_labellisation conum_labellisation_utilisateur_id_fkey; Type: FK CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.conum_labellisation
    ADD CONSTRAINT conum_labellisation_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES min.utilisateur(id) ON UPDATE CASCADE ON DELETE RESTRICT;


-- Name: coordination_mediation coordination_mediation_coodinateur_id_fkey; Type: FK CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.coordination_mediation
    ADD CONSTRAINT coordination_mediation_coodinateur_id_fkey FOREIGN KEY (coordinateur_id) REFERENCES main.personne(id);


-- Name: coordination_mediation coordination_mediation_mediateur_id_fkey; Type: FK CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.coordination_mediation
    ADD CONSTRAINT coordination_mediation_mediateur_id_fkey FOREIGN KEY (mediateur_id) REFERENCES main.personne(id);


-- Name: formation formation_personne_id_fkey; Type: FK CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.formation
    ADD CONSTRAINT formation_personne_id_fkey FOREIGN KEY (personne_id) REFERENCES main.personne(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Name: lieu_inclusion lieu_inclusion_adresse_fkey; Type: FK CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.lieu_inclusion
    ADD CONSTRAINT lieu_inclusion_adresse_fkey FOREIGN KEY (adresse_id) REFERENCES main.adresse(id);


-- Name: personne_affectations_emploi personne_affectations_emploi_admin_fkey; Type: FK CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.personne_affectations_emploi
    ADD CONSTRAINT personne_affectations_emploi_admin_fkey FOREIGN KEY (structure_administrative_id) REFERENCES main.structure_administrative(id);


-- Name: personne_affectations_emploi personne_affectations_emploi_personne_fkey; Type: FK CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.personne_affectations_emploi
    ADD CONSTRAINT personne_affectations_emploi_personne_fkey FOREIGN KEY (personne_id) REFERENCES main.personne(id);


-- Name: personne_affectations_lieu personne_affectations_lieu_lieu_fkey; Type: FK CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.personne_affectations_lieu
    ADD CONSTRAINT personne_affectations_lieu_lieu_fkey FOREIGN KEY (lieu_id) REFERENCES main.lieu_inclusion(id);


-- Name: personne_affectations_lieu personne_affectations_lieu_personne_fkey; Type: FK CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.personne_affectations_lieu
    ADD CONSTRAINT personne_affectations_lieu_personne_fkey FOREIGN KEY (personne_id) REFERENCES main.personne(id);


-- Name: poste poste_personne_id_fkey; Type: FK CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.poste
    ADD CONSTRAINT poste_personne_id_fkey FOREIGN KEY (personne_id) REFERENCES main.personne(id);


-- Name: poste poste_structure_id_fkey; Type: FK CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.poste
    ADD CONSTRAINT poste_structure_id_fkey FOREIGN KEY (structure_id) REFERENCES main.structure_administrative(id);


-- Name: structure_administrative structure_administrative_adresse_fkey; Type: FK CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.structure_administrative
    ADD CONSTRAINT structure_administrative_adresse_fkey FOREIGN KEY (adresse_id) REFERENCES main.adresse(id);


-- Name: structure_administrative structure_administrative_categorie_juridique_fkey; Type: FK CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.structure_administrative
    ADD CONSTRAINT structure_administrative_categorie_juridique_fkey FOREIGN KEY (categorie_juridique) REFERENCES reference.categories_juridiques(code);


-- Name: subvention subvention_poste_id_fkey; Type: FK CONSTRAINT; Schema: main; Owner: dataspace

ALTER TABLE ONLY main.subvention
    ADD CONSTRAINT subvention_poste_id_fkey FOREIGN KEY (poste_id) REFERENCES main.poste(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: admin; Owner: dataspace

ALTER DEFAULT PRIVILEGES FOR ROLE sonum IN SCHEMA admin GRANT USAGE,UPDATE ON SEQUENCES TO app_python;


-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: admin; Owner: dataspace

ALTER DEFAULT PRIVILEGES FOR ROLE sonum IN SCHEMA admin GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLES TO app_python;
ALTER DEFAULT PRIVILEGES FOR ROLE sonum IN SCHEMA admin GRANT SELECT ON TABLES TO min_scalingo;
ALTER DEFAULT PRIVILEGES FOR ROLE sonum IN SCHEMA admin GRANT SELECT ON TABLES TO min_dev;


-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: main; Owner: dataspace

ALTER DEFAULT PRIVILEGES FOR ROLE sonum IN SCHEMA main GRANT USAGE ON SEQUENCES TO app_python;


-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: main; Owner: dataspace

ALTER DEFAULT PRIVILEGES FOR ROLE sonum IN SCHEMA main GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLES TO app_python;
ALTER DEFAULT PRIVILEGES FOR ROLE sonum IN SCHEMA main GRANT SELECT ON TABLES TO min_scalingo;
ALTER DEFAULT PRIVILEGES FOR ROLE sonum IN SCHEMA main GRANT SELECT ON TABLES TO min_dev;


-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: reference; Owner: dataspace

ALTER DEFAULT PRIVILEGES FOR ROLE sonum IN SCHEMA reference GRANT SELECT ON TABLES TO min_scalingo;
ALTER DEFAULT PRIVILEGES FOR ROLE sonum IN SCHEMA reference GRANT SELECT ON TABLES TO min_dev;


-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: staging; Owner: dataspace

ALTER DEFAULT PRIVILEGES FOR ROLE sonum IN SCHEMA staging GRANT USAGE,UPDATE ON SEQUENCES TO app_python;


-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: staging; Owner: dataspace

ALTER DEFAULT PRIVILEGES FOR ROLE sonum IN SCHEMA staging GRANT SELECT,INSERT,DELETE,TRUNCATE,UPDATE ON TABLES TO app_python;


-- Name: coll_terr; Type: MATERIALIZED VIEW DATA; Schema: admin; Owner: dataspace

REFRESH MATERIALIZED VIEW admin.coll_terr;


-- PostgreSQL database dump complete

