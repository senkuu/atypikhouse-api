#!/bin/sh

ssh bebop@ip_du_serveur <<EOF
 cd ~/node-app
 git pull
 npm install — production
 pm2 restart all
 exit
EOF
