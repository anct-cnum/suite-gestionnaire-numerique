#! /bin/bash

ssh -N -f -L $DS_BDD_IP $DS_BASTION_IP -p $DS_BASTION_PORT && yarn prisma:migrate && yarn prisma:generate:fne && next build
