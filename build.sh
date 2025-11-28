#! /bin/bash

ssh -N -f -L $DS_BDD_IP $DS_BASTION_IP -p $DS_BASTION_PORT && yarn prisma:generate  && node --stack-size=8192 ./node_modules/.bin/next build
