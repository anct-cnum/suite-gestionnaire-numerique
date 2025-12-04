#!/bin/bash

# Script d'optimisation des images pour le web
# Utilise : optipng, pngquant, jpegoptim, cwebp (libwebp)
#
# Usage: ./scripts/optimize-images.sh [options] [répertoire]
#
# Options:
#   --dry-run    Affiche ce qui serait fait sans modifier les fichiers
#   --webp       Génère également des versions WebP des images
#   --help       Affiche cette aide
#
# Si aucun répertoire n'est spécifié, utilise public/vitrine par défaut

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration par défaut
DRY_RUN=false
GENERATE_WEBP=false
TARGET_DIR="public/vitrine"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Compteurs
TOTAL_ORIGINAL_SIZE=0
TOTAL_OPTIMIZED_SIZE=0
PNG_COUNT=0
JPG_COUNT=0
WEBP_COUNT=0
SKIPPED_COUNT=0

# Affichage de l'aide
show_help() {
    echo "Script d'optimisation des images pour le web"
    echo ""
    echo "Usage: $0 [options] [répertoire]"
    echo ""
    echo "Options:"
    echo "  --dry-run    Affiche ce qui serait fait sans modifier les fichiers"
    echo "  --webp       Génère également des versions WebP des images"
    echo "  --help       Affiche cette aide"
    echo ""
    echo "Si aucun répertoire n'est spécifié, utilise public/vitrine par défaut"
    echo ""
    echo "Prérequis (installés via devbox):"
    echo "  - optipng    : Optimisation PNG sans perte"
    echo "  - pngquant   : Optimisation PNG avec perte (très efficace)"
    echo "  - jpegoptim  : Optimisation JPEG"
    echo "  - libwebp    : Conversion WebP (cwebp)"
}

# Vérification des outils requis
check_dependencies() {
    local missing=()

    for cmd in optipng pngquant jpegoptim cwebp; do
        if ! command -v "$cmd" &> /dev/null; then
            missing+=("$cmd")
        fi
    done

    if [ ${#missing[@]} -ne 0 ]; then
        echo -e "${RED}Erreur: Les outils suivants sont manquants: ${missing[*]}${NC}"
        echo ""
        echo "Installez-les avec devbox:"
        echo "  devbox shell"
        echo ""
        echo "Ou ajoutez-les au devbox.json :"
        echo "  optipng, pngquant, jpegoptim, libwebp"
        exit 1
    fi
}

# Formatage de la taille en Ko/Mo
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

# Calcul du pourcentage de réduction
calc_reduction() {
    local original=$1
    local optimized=$2
    if [ "$original" -eq 0 ]; then
        echo "0"
    else
        echo "scale=1; (($original - $optimized) * 100) / $original" | bc
    fi
}

# Optimisation d'un fichier PNG
optimize_png() {
    local file="$1"
    local original_size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file")

    if [ "$DRY_RUN" = true ]; then
        echo -e "  ${BLUE}[DRY-RUN]${NC} Optimiserait: $file ($(format_size $original_size))"
        return
    fi

    # Créer une copie temporaire
    local temp_file="${file}.tmp"
    cp "$file" "$temp_file"

    # Optimisation avec pngquant (avec perte, très efficace)
    # --quality=65-80 : qualité acceptable pour le web
    # --skip-if-larger : ne pas remplacer si le résultat est plus grand
    pngquant --quality=65-80 --skip-if-larger --force --output "$temp_file" "$file" 2>/dev/null || true

    # Optimisation sans perte supplémentaire avec optipng
    optipng -o2 -quiet "$temp_file" 2>/dev/null || true

    local optimized_size=$(stat -c%s "$temp_file" 2>/dev/null || stat -f%z "$temp_file")

    # Ne remplacer que si le fichier est plus petit
    if [ "$optimized_size" -lt "$original_size" ]; then
        mv "$temp_file" "$file"
        local reduction=$(calc_reduction $original_size $optimized_size)
        echo -e "  ${GREEN}✓${NC} $file: $(format_size $original_size) → $(format_size $optimized_size) (${GREEN}-${reduction}%${NC})"
        TOTAL_ORIGINAL_SIZE=$((TOTAL_ORIGINAL_SIZE + original_size))
        TOTAL_OPTIMIZED_SIZE=$((TOTAL_OPTIMIZED_SIZE + optimized_size))
        PNG_COUNT=$((PNG_COUNT + 1))
    else
        rm -f "$temp_file"
        echo -e "  ${YELLOW}⊘${NC} $file: déjà optimisé ($(format_size $original_size))"
        SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
    fi
}

# Optimisation d'un fichier JPEG
optimize_jpg() {
    local file="$1"
    local original_size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file")

    if [ "$DRY_RUN" = true ]; then
        echo -e "  ${BLUE}[DRY-RUN]${NC} Optimiserait: $file ($(format_size $original_size))"
        return
    fi

    # Optimisation avec jpegoptim
    # --max=80 : qualité max 80%
    # --strip-all : supprime les métadonnées
    jpegoptim --max=80 --strip-all --quiet "$file" 2>/dev/null || true

    local optimized_size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file")

    if [ "$optimized_size" -lt "$original_size" ]; then
        local reduction=$(calc_reduction $original_size $optimized_size)
        echo -e "  ${GREEN}✓${NC} $file: $(format_size $original_size) → $(format_size $optimized_size) (${GREEN}-${reduction}%${NC})"
        TOTAL_ORIGINAL_SIZE=$((TOTAL_ORIGINAL_SIZE + original_size))
        TOTAL_OPTIMIZED_SIZE=$((TOTAL_OPTIMIZED_SIZE + optimized_size))
        JPG_COUNT=$((JPG_COUNT + 1))
    else
        echo -e "  ${YELLOW}⊘${NC} $file: déjà optimisé ($(format_size $original_size))"
        SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
    fi
}

# Génération d'une version WebP
generate_webp() {
    local file="$1"
    local webp_file="${file%.*}.webp"
    local original_size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file")

    # Ne pas régénérer si le WebP existe déjà et est plus récent
    if [ -f "$webp_file" ] && [ "$webp_file" -nt "$file" ]; then
        echo -e "  ${YELLOW}⊘${NC} $webp_file: existe déjà"
        return
    fi

    if [ "$DRY_RUN" = true ]; then
        echo -e "  ${BLUE}[DRY-RUN]${NC} Générerait: $webp_file"
        return
    fi

    # Conversion en WebP
    # -q 80 : qualité 80%
    cwebp -q 80 -quiet "$file" -o "$webp_file" 2>/dev/null

    if [ -f "$webp_file" ]; then
        local webp_size=$(stat -c%s "$webp_file" 2>/dev/null || stat -f%z "$webp_file")
        local reduction=$(calc_reduction $original_size $webp_size)
        echo -e "  ${GREEN}✓${NC} $webp_file créé: $(format_size $original_size) → $(format_size $webp_size) (${GREEN}-${reduction}%${NC})"
        WEBP_COUNT=$((WEBP_COUNT + 1))
    fi
}

# Traitement principal
main() {
    # Parsing des arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --webp)
                GENERATE_WEBP=true
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

    # Vérifier les dépendances
    check_dependencies

    # Se placer à la racine du projet
    cd "$PROJECT_ROOT"

    # Vérifier que le répertoire cible existe
    if [ ! -d "$TARGET_DIR" ]; then
        echo -e "${RED}Erreur: Le répertoire '$TARGET_DIR' n'existe pas${NC}"
        exit 1
    fi

    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  Optimisation des images pour le web${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "Répertoire: ${YELLOW}$TARGET_DIR${NC}"
    if [ "$DRY_RUN" = true ]; then
        echo -e "Mode: ${YELLOW}DRY-RUN (aucune modification)${NC}"
    fi
    if [ "$GENERATE_WEBP" = true ]; then
        echo -e "WebP: ${GREEN}activé${NC}"
    fi
    echo ""

    # Traitement des PNG
    echo -e "${BLUE}▶ Optimisation des fichiers PNG...${NC}"
    while IFS= read -r -d '' file; do
        optimize_png "$file"
        if [ "$GENERATE_WEBP" = true ]; then
            generate_webp "$file"
        fi
    done < <(find "$TARGET_DIR" -type f -iname "*.png" -print0)
    echo ""

    # Traitement des JPEG
    echo -e "${BLUE}▶ Optimisation des fichiers JPEG...${NC}"
    while IFS= read -r -d '' file; do
        optimize_jpg "$file"
        if [ "$GENERATE_WEBP" = true ]; then
            generate_webp "$file"
        fi
    done < <(find "$TARGET_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" \) -print0)
    echo ""

    # Résumé
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  Résumé${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}Mode DRY-RUN - Aucun fichier n'a été modifié${NC}"
    else
        echo -e "  PNG optimisés:     ${GREEN}$PNG_COUNT${NC}"
        echo -e "  JPEG optimisés:    ${GREEN}$JPG_COUNT${NC}"
        if [ "$GENERATE_WEBP" = true ]; then
            echo -e "  WebP générés:      ${GREEN}$WEBP_COUNT${NC}"
        fi
        echo -e "  Fichiers ignorés:  ${YELLOW}$SKIPPED_COUNT${NC} (déjà optimisés)"
        echo ""

        if [ $TOTAL_ORIGINAL_SIZE -gt 0 ]; then
            local saved=$((TOTAL_ORIGINAL_SIZE - TOTAL_OPTIMIZED_SIZE))
            local reduction=$(calc_reduction $TOTAL_ORIGINAL_SIZE $TOTAL_OPTIMIZED_SIZE)
            echo -e "  Taille originale:  $(format_size $TOTAL_ORIGINAL_SIZE)"
            echo -e "  Taille optimisée:  $(format_size $TOTAL_OPTIMIZED_SIZE)"
            echo -e "  ${GREEN}Économie totale:    $(format_size $saved) (-${reduction}%)${NC}"
        fi
    fi
    echo ""
}

main "$@"
