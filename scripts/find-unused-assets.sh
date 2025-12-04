#!/bin/bash

# Script de détection des assets inutilisés dans public/
# Recherche les fichiers non référencés dans le code source
#
# Usage: ./scripts/find-unused-assets.sh [options] [répertoire]
#
# Options:
#   --delete     Supprime les fichiers inutilisés (avec confirmation)
#   --force      Avec --delete, supprime sans confirmation
#   --json       Sortie au format JSON
#   --help       Affiche cette aide
#
# Si aucun répertoire n'est spécifié, utilise public/ par défaut

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration par défaut
DELETE_MODE=false
FORCE_MODE=false
JSON_MODE=false
TARGET_DIR="public"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Extensions à analyser
ASSET_EXTENSIONS="png|jpg|jpeg|gif|svg|webp|ico|pdf|woff|woff2|ttf|eot|mp4|webm|mp3|wav"

# Répertoires de code source à scanner
SOURCE_DIRS="src"

# Fichiers à exclure de l'analyse (toujours utilisés)
EXCLUDE_PATTERNS=(
    "favicon"
    "apple-touch-icon"
    "dsfr"
    "matomo"
    "robots.txt"
    "sitemap"
    ".well-known"
)

# Tableaux pour stocker les résultats
declare -a UNUSED_FILES=()
declare -a USED_FILES=()

# Affichage de l'aide
show_help() {
    echo "Script de détection des assets inutilisés dans public/"
    echo ""
    echo "Usage: $0 [options] [répertoire]"
    echo ""
    echo "Options:"
    echo "  --delete     Supprime les fichiers inutilisés (avec confirmation)"
    echo "  --force      Avec --delete, supprime sans confirmation"
    echo "  --json       Sortie au format JSON"
    echo "  --help       Affiche cette aide"
    echo ""
    echo "Si aucun répertoire n'est spécifié, utilise public/ par défaut"
    echo ""
    echo "Exemples:"
    echo "  $0                          # Analyse public/"
    echo "  $0 public/vitrine           # Analyse uniquement public/vitrine"
    echo "  $0 --delete                 # Analyse et propose de supprimer"
    echo "  $0 --delete --force         # Supprime sans confirmation"
    echo "  $0 --json                   # Sortie JSON pour intégration CI"
}

# Vérifier si un fichier doit être exclu
should_exclude() {
    local file="$1"
    local basename=$(basename "$file")

    for pattern in "${EXCLUDE_PATTERNS[@]}"; do
        if [[ "$file" == *"$pattern"* ]] || [[ "$basename" == *"$pattern"* ]]; then
            return 0
        fi
    done
    return 1
}

# Vérifier si un fichier est référencé dans le code
is_file_referenced() {
    local file="$1"
    local basename=$(basename "$file")
    local relative_path="${file#public/}"

    # Rechercher le nom du fichier dans le code source
    # On cherche : le basename, le chemin relatif depuis public/, ou le chemin complet
    if grep -rq --include="*.tsx" --include="*.ts" --include="*.css" --include="*.scss" --include="*.json" --include="*.md" \
        -e "$basename" \
        -e "/$relative_path" \
        -e "\"$relative_path\"" \
        -e "'$relative_path'" \
        "$SOURCE_DIRS" 2>/dev/null; then
        return 0
    fi

    # Vérifier aussi dans public/ lui-même (ex: manifest.json référence des icônes)
    if grep -rq --include="*.json" --include="*.html" --include="*.xml" \
        -e "$basename" \
        public/ 2>/dev/null; then
        return 0
    fi

    return 1
}

# Formater la taille
format_size() {
    local size=$1
    if [ "$size" -ge 1048576 ]; then
        echo "$(echo "scale=2; $size / 1048576" | bc) Mo"
    elif [ "$size" -ge 1024 ]; then
        echo "$(echo "scale=2; $size / 1024" | bc) Ko"
    else
        echo "$size o"
    fi
}

# Analyser les assets
analyze_assets() {
    local total_unused_size=0
    local count=0

    while IFS= read -r -d '' file; do
        # Ignorer les fichiers exclus
        if should_exclude "$file"; then
            continue
        fi

        count=$((count + 1))

        if ! is_file_referenced "$file"; then
            UNUSED_FILES+=("$file")
            local size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file")
            total_unused_size=$((total_unused_size + size))
        else
            USED_FILES+=("$file")
        fi
    done < <(find "$TARGET_DIR" -type f -regextype posix-extended -regex ".*\.($ASSET_EXTENSIONS)$" -print0 2>/dev/null)

    echo "$total_unused_size"
}

# Afficher les résultats en JSON
output_json() {
    local total_size=$1
    echo "{"
    echo "  \"unused_count\": ${#UNUSED_FILES[@]},"
    echo "  \"used_count\": ${#USED_FILES[@]},"
    echo "  \"total_unused_size\": $total_size,"
    echo "  \"unused_files\": ["
    local first=true
    for file in "${UNUSED_FILES[@]}"; do
        if [ "$first" = true ]; then
            first=false
        else
            echo ","
        fi
        local size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file")
        echo -n "    {\"path\": \"$file\", \"size\": $size}"
    done
    echo ""
    echo "  ]"
    echo "}"
}

# Afficher les résultats
output_results() {
    local total_size=$1

    if [ "$JSON_MODE" = true ]; then
        output_json "$total_size"
        return
    fi

    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  Analyse des assets inutilisés${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "Répertoire analysé: ${YELLOW}$TARGET_DIR${NC}"
    echo -e "Assets analysés:    ${#USED_FILES[@]} utilisés, ${#UNUSED_FILES[@]} inutilisés"
    echo ""

    if [ ${#UNUSED_FILES[@]} -eq 0 ]; then
        echo -e "${GREEN}✓ Tous les assets sont utilisés !${NC}"
        return
    fi

    echo -e "${YELLOW}Assets potentiellement inutilisés :${NC}"
    echo ""

    # Grouper par répertoire
    local current_dir=""
    for file in "${UNUSED_FILES[@]}"; do
        local dir=$(dirname "$file")
        local size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file")

        if [ "$dir" != "$current_dir" ]; then
            current_dir="$dir"
            echo -e "\n  ${BLUE}📁 $dir/${NC}"
        fi

        echo -e "    ${RED}✗${NC} $(basename "$file") ($(format_size $size))"
    done

    echo ""
    echo -e "${BLUE}───────────────────────────────────────────────────────────${NC}"
    echo -e "  Total inutilisé: ${RED}${#UNUSED_FILES[@]} fichiers${NC} ($(format_size $total_size))"
    echo -e "${BLUE}───────────────────────────────────────────────────────────${NC}"
}

# Supprimer les fichiers inutilisés
delete_unused() {
    if [ ${#UNUSED_FILES[@]} -eq 0 ]; then
        return
    fi

    if [ "$FORCE_MODE" = false ]; then
        echo ""
        echo -e "${YELLOW}Voulez-vous supprimer ces ${#UNUSED_FILES[@]} fichiers ? (oui/non)${NC}"
        read -r response
        if [[ ! "$response" =~ ^(oui|o|yes|y)$ ]]; then
            echo "Annulé."
            return
        fi
    fi

    echo ""
    echo -e "${BLUE}Suppression en cours...${NC}"

    local deleted=0
    for file in "${UNUSED_FILES[@]}"; do
        if rm "$file" 2>/dev/null; then
            echo -e "  ${GREEN}✓${NC} Supprimé: $file"
            deleted=$((deleted + 1))
        else
            echo -e "  ${RED}✗${NC} Erreur: $file"
        fi
    done

    echo ""
    echo -e "${GREEN}$deleted fichier(s) supprimé(s)${NC}"

    # Nettoyer les répertoires vides
    find "$TARGET_DIR" -type d -empty -delete 2>/dev/null || true
}

# Traitement principal
main() {
    # Parsing des arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --delete)
                DELETE_MODE=true
                shift
                ;;
            --force)
                FORCE_MODE=true
                shift
                ;;
            --json)
                JSON_MODE=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                TARGET_DIR="$1"
                shift
                ;;
        esac
    done

    # Se placer à la racine du projet
    cd "$PROJECT_ROOT"

    # Vérifier que le répertoire cible existe
    if [ ! -d "$TARGET_DIR" ]; then
        echo -e "${RED}Erreur: Le répertoire '$TARGET_DIR' n'existe pas${NC}"
        exit 1
    fi

    # Analyser les assets
    local total_unused_size=$(analyze_assets)

    # Afficher les résultats
    output_results "$total_unused_size"

    # Supprimer si demandé
    if [ "$DELETE_MODE" = true ]; then
        delete_unused
    elif [ ${#UNUSED_FILES[@]} -gt 0 ] && [ "$JSON_MODE" = false ]; then
        echo ""
        echo -e "${YELLOW}Conseil: Utilisez --delete pour supprimer ces fichiers${NC}"
    fi

    # Code de sortie non-zéro si des fichiers inutilisés (utile pour CI)
    if [ ${#UNUSED_FILES[@]} -gt 0 ]; then
        exit 1
    fi
}

main "$@"
