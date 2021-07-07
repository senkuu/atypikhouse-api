#!/bin/sh

ssh ubuntu@vps-f0007953.vps.ovh.net <<EOF
 cd ~/api
 git pull
 docker-compose build
 docker-compose up -d --force-recreate --no-deps api
EOF
