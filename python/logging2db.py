#!/usr/bin/env python3

import os
import logging
import logconf
import logging.config
import signal
from libraries import can_lib_auguste as canau #import temp_reading_multithreading as ds18b20
import time
import RPi.GPIO as GPIO
import sys
import json
import re
import MySQLdb
import numpy as np
import subprocess
import urllib

#ds18b20.read_temp_raw() #start temperature conversion in sensors
tempinterval = 2

#import logger
logging.config.dictConfig(logconf.LOGGING)
logger = logging.getLogger('logging2db')

with open('blconf.json', 'r') as f:
    try:
        bldict = json.load(f)
    except:
        print("Exception in loading of blconf.json")

#setup signal handler
def signal_handler(signal_s, frame):
    logger.critical('EXITING LOGGING2DB')
    sys.exit(1)

def signal_bleeding(signal_s, frame):
    print("SIGUSR1")
    logger.debug("signal for bleeding received")

signal.signal(signal.SIGTERM, signal_handler)
signal.signal(signal.SIGINT, signal_handler)
#signal.signal(signal.SIGUSR1, signal_bleeding)

numslaves = 3 #link to database settings
loginterval = 1 #link to database settings
logging = 1 #link to database settings

slave_addresses = [0x11,0x12,0x14,0x15,0x16,0x19,0x21]

dbTable = "Timestamp REAL, Current REAL, Sl0Voltage REAL"
for x in slave_addresses:
    dbTable = dbTable + ", " + "Sl" + str(x) + "Voltage REAL"

dbTable = dbTable + ", " + "Sl0Bl REAL"
for x in slave_addresses:
    dbTable = dbTable + ", " + "Sl" + str(x) + "Bl REAL"

header = dbTable.split()[::2]

sensorlist = []
tempdict = {}

#global bllist
#bllist = [0 for x in range(numslaves + 1)]

#for sensor in ds18b20.device_folder:
#    #print(sensor[-15:])
#    sensorlist.append("T" + sensor[-12:])
#    tempdict["T" + sensor[-12:]] = 0
#    dbTable = dbTable + ", " + "T" + sensor[-12:] + " REAL"

#print(dbTable)

numlines = 10

try:
    canau.master_init()
    canau.init_meting(slave_addresses)
    canau.currentCal(50)
    datalist = [None]*numlines
    print("DONE")
    count = 0
    tempcount = 0
    db = MySQLdb.connect(host="localhost", user="python", passwd="test123", db="test")
    #db = lite.connect('../database/test.db', timeout = 15.0)
    with db as cur:
        #cur.execute("TRUNCATE TABLE Metingen");
        cur.execute("DROP TABLE IF EXISTS Metingen")
        cur.execute("CREATE TABLE Metingen("+ dbTable +")")
        cur.execute("DROP TABLE IF EXISTS MostRecentMeasurement")
        cur.execute("CREATE TABLE MostRecentMeasurement("+ dbTable +")")
        #cur.execute("TRUNCATE TABLE MostRecentMeasurement")
    while True:
        start = time.time()
        #print("Getting voltage")
        voltageAll = canau.getAll(slave_addresses)
        print("voltage all")
        print(voltageAll)
        voltagestr = str(time.time())
        #Only once in 2 measurements (2 seconds interval) because temp reading takes 1.1 seconds
        #if (count % tempinterval == 0):
        #    tmp = ds18b20.read_temp()
        #    if(len(tmp.values()) == 4):
        #        tempdict = tmp
        #        count = 0
        #    else:
        #        logger.debug("only got %d values from tempsensors", len(tmp))
        #    ds18b20.read_temp_raw()

        #for numslave in range(numslaves + 2):
        #    voltagestr = voltagestr + "," + str(voltageAll[numslave])
        #for numslave in range(numslaves + 2, numslaves*2 +3):
        #    voltagestr = voltagestr + "," + str(voltageAll[numslave])
        for x in voltageAll:
            voltagestr = voltagestr + "," + str(x)
        #for temp in sensorlist:
        #    voltagestr = voltagestr + "," + str(tempdict[temp])
        datapoint   = np.array([float(x) for x in voltagestr.split(',')])
        #np.savetxt("writeDBMR.txt", [datapoint], header=', '.join(header), delimiter=',', newline='\n', fmt='%.6f')
        with open("writeDBMR.txt", 'wb') as f:
            f.write(', '.join(header))
            f.write('\n')
            f.write(', '.join([str(x) for x in datapoint]))
            f.write('\n')
        #write2db = subprocess.Popen(['/usr/bin/python2', 'write2dbMR.py'])
        datalist[count] = datapoint
        count = count + 1
        #print(count)
        #print("Bleeding conf")
        with open('blconf.json', 'r') as f:
            try:
                bldictn = json.load(f)
            except:
                print("Exception in loading of blconf.json")
        bl = dict(set(bldictn.items()) - set(bldict.items()))
        for (key, value) in bl.items():
            #print(key)
            if (value):
                print("BLEEDING FOR:")
                print(int(re.search(r'\d+', key).group()))
                canau.setBleedingOn(int(re.search(r'\d+', key).group()))
            else:
                #print("STOP BLEEDING FOR:")
                #print(int(re.search(r'\d+', key).group()))
                canau.setBleedingOff(int(re.search(r'\d+', key).group()))
        bldict = bldictn.copy()
        if (count % (numlines) == 0):
            np.savetxt("writeDB.txt", datalist, fmt='%.6f', delimiter=',', newline='\n')
            datalist = [None]*numlines
            count = 0
            write2db = subprocess.Popen(['/usr/bin/python2', 'write2db.py'])
        sltime = loginterval - (time.time() - start)
        urllib.urlopen("http://localhost:5000/ActualValues")
        if (sltime > 0 and sltime < 0.9): time.sleep(sltime)
except (MySQLdb.Error, MySQLdb.Warning) as e:
    logger.debug("An error occurred: " + str(e.args[0]))
except Exception as e:
    print(str(e.args[0]))
    GPIO.cleanup()
    print(sys.exc_info()[0])
    sys.exit(0)
