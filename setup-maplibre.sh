#!/bin/bash

# Copie le worker MapLibre (et le chunk partagé qu'il importe) dans public/ : depuis maplibre-gl 6 (ESM only),
# le worker est chargé par URL et Next/Turbopack ne l'émet pas correctement depuis node_modules
# (cf. https://maplibre.org/maplibre-gl-js/docs/#installation, onglet Turbopack). Sans ce worker,
# la carte se monte mais ne charge jamais aucune tuile.

echo "Copying MapLibre worker..."

PACKAGE_DIR=$(pwd)
FROM="$PACKAGE_DIR/node_modules/maplibre-gl/dist"
TO="$PACKAGE_DIR/public/maplibre"

mkdir -p "$TO"

cp "$FROM/maplibre-gl-worker.mjs" "$TO/" || { echo "Failed to copy maplibre-gl-worker.mjs"; exit 1; }
cp "$FROM/maplibre-gl-shared.mjs" "$TO/" || { echo "Failed to copy maplibre-gl-shared.mjs"; exit 1; }

echo "MapLibre worker copied successfully."
