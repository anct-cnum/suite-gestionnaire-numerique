FILE=.env.local

if [ ! -f $FILE ]; then
  cp .env $FILE
fi

if type openssl > /dev/null; then
  echo NEXTAUTH_SECRET=$(openssl rand -base64 32) >> $FILE
else
  echo "******************************************************"
  echo "* Il faut que tu affectes NEXTAUTH_SECRET à la main. *"
  echo "******************************************************"
fi
