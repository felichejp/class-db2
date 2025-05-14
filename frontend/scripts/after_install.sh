#!/bin/bash
echo 'run after_install.sh: ' >> /home/ubuntu/class-db2/deploy.log
echo 'cd /home/ubuntu/class-db2' >> /home/ubuntu/class-db2/deploy.log

cd /home/ubuntu/class-db2 >> /home/ubuntu/class-db2/deploy.log

echo 'npm install' >> /home/ubuntu/class-db2/deploy.log 
npm install >> /home/ubuntu/class-db2/deploy.log
