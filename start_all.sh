#!/bin/bash

clear
echo "Initializing webserver"
python -m SimpleHTTPServer > /dev/null 2>&1 &
echo "Webserver initialized"

echo "Initializing measurements"
cd ./python/
python app.py > /dev/null 2>&1 &
echo "Measurements initialized"

#echo "Initializing logging"
#python3 logging2db.py > /dev/null 2>&1 &
#echo "Logging initialized"

ps aux | grep python

