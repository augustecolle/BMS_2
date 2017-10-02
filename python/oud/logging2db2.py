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

numslaves = 7 #link to database settings
loginterval = 1 #link to database settings
logging = 1 #link to database settings

slave_addresses = [0x08, 0x21, 0x02, 0x19, 0x03, 0x15, 0x16]

tablestruct = ["Timestamp REAL", "Current REAL", "MVoltage REAL", "Sl1Voltage REAL", "Sl2Voltage REAL", "Sl3Voltage REAL", "Sl4Voltage REAL", "Sl5Voltage REAL", "Sl6Voltage REAL", "Sl7Voltage REAL", "Sl8Voltage REAL", "Sl9Voltage REAL", "Sl10Voltage REAL", "Sl11Voltage REAL", "Sl12Voltage REAL", "Sl13Voltage REAL", "Sl14Voltage REAL", "Sl15Voltage REAL"]
headerBl = ["Sl0Bl", "Sl1Bl", "Sl2Bl", "Sl3Bl", "Sl4Bl", "Sl5Bl", "Sl6Bl", "Sl7Bl", "Sl8Bl", "Sl9Bl", "Sl10Bl", "Sl11Bl", "Sl12Bl", "Sl13Bl", "Sl14Bl", "Sl15Bl"]

dbTable = "Timestamp REAL, Current REAL, Sl0Voltage REAL"

for x in slave_addresses:
    dbTable = dbTable + ", " + "Sl" + str(x) + "Voltage REAL"

dbTable = dbTable + ", " + "Sl0Bl REAL"

for x in slave_addresses:
    dbTable = dbTable + ", " + "Sl" + str(x) + "Bl REAL"

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

numlines = 100

try:
    canau.master_init()
    canau.init_meting(slave_addresses)
    canau.currentCal(50)
    datalist = [None]*numlines
    print("DONE")
    count = 0
    tempcount = 0
    db = MySQLdb.connect(host="localhost", user="python", passwd="pypasswd", db="test")
    #db = lite.connect('../database/test.db', timeout = 15.0)
    with db as cur:
        cur.execute("TRUNCATE TABLE Metingen");
        #cur.execute("DROP TABLE IF EXISTS Metingen")
        #cur.execute("CREATE TABLE Metingen("+ dbTable +")")
        #cur.execute("DROP TABLE IF EXISTS MostRecentMeasurement")
        #cur.execute("CREATE TABLE MostRecentMeasurement("+ dbTable +")")
        cur.execute("TRUNCATE TABLE MostRecentMeasurement")
    while True:
        #db = lite.connect('../database/test.db', timeout = 15.0)
        #con = lite.connect('../database/test.db', timeout = 15.0)
        db = MySQLdb.connect(host="localhost", user="python", passwd="pypasswd", db="test")
        with db as cur:
            start = time.time()
            #print("Getting voltage")
            voltageAll = canau.getAll(slave_addresses)
            print("JA")
            #print("Got voltage")
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
            datalist[count] = voltagestr
            #for temp in sensorlist:
            #    voltagestr = voltagestr + "," + str(tempdict[temp])
            #print("Dropping and creating mostrecentmeasurements")
            #cur.execute("DROP TABLE IF EXISTS MostRecentMeasurement")
            #cur.execute("CREATE TABLE MostRecentMeasurement("+ dbTable +")")
            #cur.execute("DELETE FROM MostRecentMeasurement WHERE 1")
            #cur.execute("INSERT INTO MostRecentMeasurement VALUES("+voltagestr+")")
            #print("DROPPED")
            #print("CREATING")
            #db.commit()
            #print("Dropped and created mostrecentmeasurements")
            #print("Inserting values")

            #cur.execute("INSERT INTO Metingen VALUES("+voltagestr+")")
            #cur.execute("INSERT INTO MostRecentMeasurement VALUES("+voltagestr+")")
            #print("Inserted values")
            #db.commit()
        #db.close()
        #print("committed")
        count = count + 1
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
                #print("BLEEDING FOR:")
                #print(int(re.search(r'\d+', key).group()))
                canau.setBleedingOn(int(re.search(r'\d+', key).group()))
            else:
                #print("STOP BLEEDING FOR:")
                #print(int(re.search(r'\d+', key).group()))
                canau.setBleedingOff(int(re.search(r'\d+', key).group()))
        bldict = bldictn.copy()
        sltime = loginterval - (time.time() - start)
        #print("DONE")
        if (sltime > 0 and sltime < 0.9): time.sleep(sltime)
        #print(count)
except (MySQLdb.Error, MySQLdb.Warning) as e:
    logger.debug("An error occurred: " + str(e.args[0]))
except Exception as e:
    print(str(e.args[0]))
    GPIO.cleanup()
    print(sys.exc_info()[0])
    sys.exit(0)
