DO
$do$
BEGIN
   IF EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'sonum') THEN

      RAISE NOTICE 'Role "sonum" already exists. Skipping.';
   ELSE
      CREATE ROLE sonum LOGIN PASSWORD 'my_password';
   END IF;
END
$do$;


DO
$do$
BEGIN
   IF EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'app_python') THEN

      RAISE NOTICE 'Role "app_python" already exists. Skipping.';
   ELSE
      CREATE ROLE app_python LOGIN PASSWORD 'my_password';
   END IF;
END
$do$;

DO
$do$
BEGIN
   IF EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'min_dev') THEN

      RAISE NOTICE 'Role "min_dev" already exists. Skipping.';
   ELSE
      CREATE ROLE min_dev  LOGIN PASSWORD 'my_password';
   END IF;
END
$do$;

DO
$do$
BEGIN
   IF EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'min_scalingo') THEN

      RAISE NOTICE 'Role "min_scalingo" already exists. Skipping.';
   ELSE
      CREATE ROLE min_scalingo  LOGIN PASSWORD 'my_password';
   END IF;
END
$do$;

--
-- Name: admin; Type: SCHEMA; Schema: -; Owner: sonum
--

CREATE SCHEMA IF NOT EXISTS admin;


ALTER SCHEMA admin OWNER TO sonum;

--
-- Name: main; Type: SCHEMA; Schema: -; Owner: sonum
--

CREATE SCHEMA IF NOT EXISTS main;


ALTER SCHEMA main OWNER TO sonum;

--
-- Name: reference; Type: SCHEMA; Schema: -; Owner: sonum
--

CREATE SCHEMA IF NOT EXISTS reference;


ALTER SCHEMA reference OWNER TO sonum;
