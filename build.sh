#! /bin/bash

ssh -N -f -L $DS_BDD_IP $DS_BASTION_IP -p $DS_BASTION_PORT && pnpm prisma:generate && NODE_OPTIONS=--stack-size=8192 next build
