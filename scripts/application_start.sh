#!/bin/bash

echo 'run application_start.sh: ' >> /home/ubuntu/class-db2/deploy.log
# nodejs-app is the same name as stored in pm2 process
echo 'pm2 restart index.js' >> /home/ubuntu/class-db2/deploy.log
pm2 restart index.js >> /home/ubuntu/class-db2/deploy.log

