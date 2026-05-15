FILE=.env.local

if [ ! -f $FILE ]; then
  cp .env $FILE
fi

if grep -q '^NEXTAUTH_SECRET=' $FILE; then
  echo "* NEXTAUTH_SECRET déjà présent dans $FILE, on ne le régénère pas. *"
elif type openssl > /dev/null; then
  echo NEXTAUTH_SECRET=$(openssl rand -base64 32) >> $FILE
else
  echo "******************************************************"
  echo "* Il faut que tu affectes NEXTAUTH_SECRET à la main. *"
  echo "******************************************************"
fi

# Navigateur requis par Playwright pour l'export PDF des rapports
pnpm exec playwright install chromium
