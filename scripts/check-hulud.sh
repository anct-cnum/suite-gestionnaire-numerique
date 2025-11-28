#!/bin/bash

# Script de vérification des paquets vulnérables Shai-Hulud (Version optimisée)
# Usage: ./check-hulud.sh <lock-file> [--debug]
# Version sans dépendance jq

set -e

# Démarrer le timer
START_TIME=$(date +%s)

VULNERABLE_PACKAGES_URL="https://raw.githubusercontent.com/tenable/shai-hulud-second-coming-affected-packages/main/list.json"
LOCK_FILE="$1"
DEBUG=false

# Vérifier si --debug est passé
if [ "$2" = "--debug" ] || [ "$1" = "--debug" ]; then
    DEBUG=true
    if [ "$1" = "--debug" ]; then
        LOCK_FILE="$2"
    fi
fi

TEMP_DIR=$(mktemp -d)
VULNERABLE_LIST="$TEMP_DIR/vulnerable.json"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
ORANGE='\033[0;33m'
NC='\033[0m' # No Color

# Fonction de nettoyage
cleanup() {
    rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

# Fonction d'aide
usage() {
    echo "Usage: $0 <lock-file> [--debug]"
    echo ""
    echo "Vérifie si des paquets vulnérables (Shai-Hulud) sont présents dans votre fichier lock"
    echo ""
    echo "Fichiers supportés:"
    echo "  - yarn.lock"
    echo "  - package-lock.json"
    echo "  - pnpm-lock.yaml"
    echo ""
    echo "Exemple:"
    echo "  $0 yarn.lock"
    echo "  $0 package-lock.json --debug"
    exit 1
}

# Vérification des arguments
if [ -z "$LOCK_FILE" ]; then
    echo -e "${RED}Erreur: Fichier lock manquant${NC}"
    usage
fi

if [ ! -f "$LOCK_FILE" ]; then
    echo -e "${RED}Erreur: Le fichier '$LOCK_FILE' n'existe pas${NC}"
    exit 1
fi

# Vérification de la présence de curl
if ! command -v curl &> /dev/null; then
    echo -e "${RED}Erreur: curl n'est pas installé${NC}"
    exit 1
fi

echo -e "${YELLOW}📥 Téléchargement de la liste des paquets vulnérables...${NC}"
if ! curl -s "$VULNERABLE_PACKAGES_URL" -o "$VULNERABLE_LIST"; then
    echo -e "${RED}Erreur: Impossible de télécharger la liste des paquets vulnérables${NC}"
    exit 1
fi

# Vérification basique que c'est du JSON
if ! grep -q '{' "$VULNERABLE_LIST" || ! grep -q '}' "$VULNERABLE_LIST"; then
    echo -e "${RED}Erreur: Le fichier téléchargé ne semble pas être un JSON valide${NC}"
    exit 1
fi

echo -e "${YELLOW}🔍 Analyse de $LOCK_FILE...${NC}"
echo ""

# Détection du type de fichier lock
LOCK_TYPE=""
if [[ "$LOCK_FILE" == *"yarn.lock"* ]]; then
    LOCK_TYPE="yarn"
elif [[ "$LOCK_FILE" == *"package-lock.json"* ]]; then
    LOCK_TYPE="npm"
elif [[ "$LOCK_FILE" == *"pnpm-lock.yaml"* ]]; then
    LOCK_TYPE="pnpm"
else
    echo -e "${RED}Erreur: Type de fichier lock non reconnu${NC}"
    echo "Fichiers supportés: yarn.lock, package-lock.json, pnpm-lock.yaml"
    exit 1
fi

# OPTIMISATION: Pré-extraire toutes les versions installées dans un fichier temporaire
INSTALLED_VERSIONS="$TEMP_DIR/installed.txt"

case "$LOCK_TYPE" in
    "yarn")
        # Extraire tous les paquets@version du yarn.lock
        # Format: "package@..." suivi de version "x.x.x"
        awk '
        /^[" ]*[^# ].*@/ {
            # Ligne avec package@...
            gsub(/^[" ]*/, "")
            gsub(/[":].*$/, "")
            package = $0
            getline
            if ($1 == "version") {
                gsub(/[" ]/, "", $2)
                # Extraire juste le nom du paquet (avant @)
                split(package, parts, "@")
                pkg_name = parts[1]
                for (i = 2; i < length(parts); i++) {
                    pkg_name = pkg_name "@" parts[i]
                }
                print pkg_name ":" $2
            }
        }
        ' "$LOCK_FILE" > "$INSTALLED_VERSIONS"
        ;;
    
    "npm")
        # Extraire de package-lock.json
        grep -E '"(node_modules/|dependencies)' -A 3 "$LOCK_FILE" | \
        awk '
        /"node_modules\// || /"[^"]+": \{$/ {
            if (/"node_modules\//) {
                gsub(/.*node_modules\//, "")
                gsub(/".*/, "")
                package = $0
            } else {
                gsub(/[" :].*/, "")
                package = $1
            }
        }
        /"version":/ {
            gsub(/[", ]/, "", $2)
            if (package != "") print package ":" $2
        }
        ' > "$INSTALLED_VERSIONS"
        ;;
    
    "pnpm")
        # Extraire de pnpm-lock.yaml
        awk '
        /^  [^ ].*:$/ {
            gsub(/:.*/, "")
            gsub(/^  /, "")
            package = $0
        }
        /^    version:/ {
            gsub(/.*version: /, "")
            if (package != "") print package ":" $0
        }
        /^  \/.*@[0-9]/ {
            line = $0
            gsub(/^  \//, "", line)
            gsub(/:.*/, "", line)
            split(line, parts, "@")
            if (parts[1] ~ /^@/) {
                # Scoped package
                package = "@" parts[2]
                version = parts[3]
            } else {
                package = parts[1]
                version = parts[2]
            }
            print package ":" version
        }
        ' "$LOCK_FILE" > "$INSTALLED_VERSIONS"
        ;;
esac

if [ "$DEBUG" = true ]; then
    echo "[DEBUG] Nombre de paquets installés détectés:" >&2
    wc -l < "$INSTALLED_VERSIONS" >&2
    echo "[DEBUG] Premiers paquets installés:" >&2
    head -5 "$INSTALLED_VERSIONS" >&2
    echo "" >&2
fi

# Parser la liste des paquets vulnérables
PARSED_VULNERABLE="$TEMP_DIR/vulnerable_parsed.txt"
current_package=""

while IFS= read -r line; do
    # Chercher un nom de paquet
    if echo "$line" | grep -q '"[^"]*"[[:space:]]*:[[:space:]]*{'; then
        current_package=$(echo "$line" | grep -o '"[^"]*"' | head -1 | tr -d '"')
    fi
    
    # Chercher les versions
    if echo "$line" | grep -q '"[0-9]'; then
        echo "$line" | grep -o '"[0-9][^"]*"' | tr -d '"' | while read -r version; do
            if [ -n "$version" ] && [ -n "$current_package" ]; then
                echo "$current_package:$version"
            fi
        done
    fi
done < "$VULNERABLE_LIST" > "$PARSED_VULNERABLE"

if [ "$DEBUG" = true ]; then
    echo "[DEBUG] Nombre de paquets vulnérables:" >&2
    wc -l < "$PARSED_VULNERABLE" >&2
    echo "[DEBUG] Premiers paquets vulnérables:" >&2
    head -5 "$PARSED_VULNERABLE" >&2
    echo "" >&2
fi

# OPTIMISATION: Comparer les deux fichiers directement avec grep -F (fixed strings)
VULNERABLE_COUNT=0
WARNING_COUNT=0
declare -a FOUND_VULNERABILITIES
declare -a FOUND_WARNINGS

# Créer une liste des paquets affectés (sans version) pour détecter les warnings
AFFECTED_PACKAGES="$TEMP_DIR/affected_packages.txt"
cut -d: -f1 "$PARSED_VULNERABLE" | sort -u > "$AFFECTED_PACKAGES"

echo -e "${YELLOW}Recherche de correspondances...${NC}"
echo ""

# D'abord, vérifier les vulnérabilités exactes
while IFS=':' read -r package version; do
    if [ "$DEBUG" = true ]; then
        echo "[DEBUG] Vérification de $package@$version" >&2
    fi
    
    # Recherche avec grep -Fx pour correspondance exacte de la ligne complète
    if grep -Fx "$package:$version" "$INSTALLED_VERSIONS" > /dev/null; then
        echo -e "${RED}⚠️  VULNÉRABILITÉ DÉTECTÉE: $package@$version${NC}"
        FOUND_VULNERABILITIES+=("$package@$version")
        ((VULNERABLE_COUNT++))
    elif [ "$DEBUG" = true ]; then
        echo "[DEBUG]   -> Pas trouvé" >&2
    fi
done < "$PARSED_VULNERABLE"

# Ensuite, vérifier les paquets installés qui sont dans la liste mais avec une version différente
echo ""
echo -e "${YELLOW}Vérification des paquets affectés dans d'autres versions...${NC}"
echo ""

while IFS=':' read -r package version; do
    # Vérifier si ce paquet exact est dans la liste des affectés (correspondance exacte)
    if grep -Fx "$package" "$AFFECTED_PACKAGES" > /dev/null; then
        # Vérifier si cette version spécifique n'est PAS vulnérable
        if ! grep -Fx "$package:$version" "$PARSED_VULNERABLE" > /dev/null; then
            echo -e "${ORANGE}ℹ️  ATTENTION: $package@$version est installé (version non vulnérable, mais le paquet a des versions affectées)${NC}"
            FOUND_WARNINGS+=("$package@$version")
            ((WARNING_COUNT++))
        fi
    fi
done < "$INSTALLED_VERSIONS"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Calculer le temps d'exécution
END_TIME=$(date +%s)
EXECUTION_TIME=$((END_TIME - START_TIME))

if [ $VULNERABLE_COUNT -eq 0 ]; then
    echo -e "${GREEN}✅ Aucune version vulnérable détectée${NC}"
    echo ""
    
    if [ $WARNING_COUNT -gt 0 ]; then
        echo -e "${ORANGE}⚠️  Avertissement: $WARNING_COUNT paquet(s) présent(s) dans la liste des paquets affectés${NC}"
        echo -e "${ORANGE}   (mais dans une version différente de celles identifiées comme compromises)${NC}"
        echo ""
        for warn in "${FOUND_WARNINGS[@]}"; do
            echo -e "   ${ORANGE}• $warn${NC}"
        done
        echo ""
        echo -e "${ORANGE}📋 Note importante:${NC}"
        echo -e "${ORANGE}   Ces paquets ont eu des versions compromises. Votre version actuelle n'est pas${NC}"
        echo -e "${ORANGE}   dans la liste des versions vulnérables connues, mais restez vigilant.${NC}"
        echo ""
    fi
    
    echo -e "${YELLOW}💡 Recommandations:${NC}"
    echo "   • NE PAS mettre à jour vos dépendances pour le moment"
    echo "   • Tous les paquets compromis n'ont probablement pas encore été identifiés"
    echo "   • Surveillez les mises à jour de la liste officielle"
    echo "   • En cas de doute, consultez un expert en sécurité"
    echo ""
    echo -e "${YELLOW}📚 Ressources:${NC}"
    echo "   • Liste officielle: https://github.com/tenable/shai-hulud-second-coming-affected-packages"
    echo "   • Blog Tenable: https://www.tenable.com/blog/faq-about-sha1-hulud-2-0"
    echo ""
    echo -e "⏱️  Temps d'exécution: ${EXECUTION_TIME}s"
    echo ""
    exit 0
else
    echo -e "${RED}❌ $VULNERABLE_COUNT version(s) vulnérable(s) détectée(s)${NC}"
    echo ""
    echo -e "${RED}🔴 Paquets compromis identifiés:${NC}"
    for vuln in "${FOUND_VULNERABILITIES[@]}"; do
        echo -e "   ${RED}• $vuln${NC}"
    done
    echo ""
    
    if [ $WARNING_COUNT -gt 0 ]; then
        echo -e "${ORANGE}⚠️  Autres paquets affectés (versions différentes):${NC}"
        for warn in "${FOUND_WARNINGS[@]}"; do
            echo -e "   ${ORANGE}• $warn${NC}"
        done
        echo ""
    fi
    
    echo -e "${RED}🚨 Actions urgentes:${NC}"
    echo "   1. NE PAS mettre à jour vos dépendances"
    echo "   2. Isolez l'environnement concerné si possible"
    echo "   3. Vérifiez vos logs pour toute activité suspecte"
    echo "   4. Contactez votre équipe de sécurité ou un expert"
    echo ""
    echo -e "${YELLOW}⚠️  Important:${NC}"
    echo "   • La liste des paquets compromis continue d'évoluer"
    echo "   • D'autres versions peuvent être affectées"
    echo "   • Rotez vos secrets (tokens npm, GitHub, cloud, etc.)"
    echo "   • Auditez vos repositories GitHub pour des workflows suspects"
    echo ""
    echo -e "${YELLOW}📚 Ressources:${NC}"
    echo "   • Liste officielle: https://github.com/tenable/shai-hulud-second-coming-affected-packages"
    echo "   • Blog Tenable: https://www.tenable.com/blog/faq-about-sha1-hulud-2-0"
    echo "   • Analyse Wiz: https://www.wiz.io/blog/shai-hulud-2-0-ongoing-supply-chain-attack"
    echo ""
    echo -e "⏱️  Temps d'exécution: ${EXECUTION_TIME}s"
    echo ""
    exit 1
fi

