# Script made to force implementation of static IP. Contact Auguste for questions
systemctl restart networking.service
systemctl daemon-reload
ifup eth0
