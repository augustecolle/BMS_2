#!/usr/bin/env python

import os
import logging
import logconf
import logging.config
import signal
from libraries import EAEL9080 as bb
from libraries import EAPSI8720 as au
import math
import csv
import numpy as np
import time as tm
import sys
import requests
import re

global minVn
global minVv
minVn = None
minVv = None

def getBlMap():
    blMap = {}
    r = requests.get('http://0.0.0.0:5000/ActualValues')
    res = dict(r.json())
    ret = {}
    for x in res.keys():
        if "Bl" in x:
            addr = int(re.search(r'\d+', x).group())
            blMap["Sl"+str(addr)+"Voltage"] = addr
    return blMap

global blMap
blMap = getBlMap()

def turnBleedingOn(slave):
    numtimes = 1
    while (numtimes > 0):
        r = requests.get('http://0.0.0.0:5000/BleedingControll/Sl' + str(slave) + 'BlOn')
        if (r.status_code == 200):
            return r.status_code
        else:
            numtimes = numtimes - 1
            tm.sleep(0.5)
    return -1

def turnBleedingOff(slave):
    numtimes = 1
    while (numtimes > 0):
        r = requests.get('http://0.0.0.0:5000/BleedingControll/Sl' + str(slave) + 'BlOff')
        if (r.status_code == 200):
            return r.status_code
        else:
            numtimes = numtimes - 1
            tm.sleep(0.5)
    return -1

def getActualValues():
    '''returns dictionary of voltages with value of voltage as keys for easy sorting'''
    r = requests.get('http://0.0.0.0:5000/ActualValues')
    res = dict(r.json())
    ret = {}
    for x in res.keys():
        if "Voltage" in x:
            ret[res[x]] = x
    return ret

def topBalancing(actualValues, blAcc = 1e-2):
    '''Get distance for implementing top balancing, blAcc is bleeding accuracy'''
    global blMap
    global minVn
    global minVv
    minVn = None
    if (len(actualValues.keys()) > 0):
        if (minVn == None):
            values = np.array(actualValues.keys())
            values = np.sort(values)
            (minVv, minVn) = (values[0], actualValues[values[0]]) #minVn now contains the cell name of the battery with the lowest voltage, minVv the value
        if (minVn in actualValues.values()):
            minVv = [key for (key, value) in actualValues.iteritems() if (value == minVn)][0]
            turnBleedingOff(blMap[minVn])
            del actualValues[[key for (key, value) in actualValues.iteritems() if (value == minVn)][0]]
    
        values = np.array(actualValues.keys())
        diffVal = [x - minVv for x in values]

        for i in range(len(diffVal)):
            if diffVal[i] > blAcc and values[i] > 3.6:
                print("BleedingOn")
                turnBleedingOn(blMap[actualValues[values[i]]])
            else:
                print("Bleeding Off")
                turnBleedingOff(blMap[actualValues[values[i]]])
    else:
        return -1
    return 0

logging.config.dictConfig(logconf.LOGGING)
logger_test = logging.getLogger('test')
 
#set signal handler
def signal_handler(signal, frame):
    logger_test.critical('EXITING TEST SCRIPT')
    for x in [0,1,2,3]:
        turnBleedingOff(x)
    tm.sleep(1)
    bb.setCurrentA(0)
    bb.setVoltageA(0)
    #bb.setPowerA(0) #takes too long
    bb.setInputOff()
    bb.setRemoteControllOff()
    bb.stopSerial()
    au.setVoltage(0)
    au.setCurrent(0)
    au.stopSerial()   

#on kill and interrupt execute the signal_handler
signal.signal(signal.SIGTERM, signal_handler)
signal.signal(signal.SIGINT, signal_handler)

#imp.reload(bb)
bb.startSerial('/dev/ttyUSB0', "02")
bb.setRemoteControllOn()
bb.getActualValues()
bb.setInputOn()
bb.setCCMode()
bb.setPowerA(1000)
bb.setVoltageA(24.)
bb.setCurrentA(0.)
bb.getVoltageA()
bb.clearBuffer()

tm.sleep(1)

au.startSerial('/dev/ttyUSB1')
au.remoteControllOn()
au.readAndTreat()
au.getActualValues()
au.setCurrent(0.)
au.setVoltage(32.)
#au.setPower(500)
au.getSetVoltage()

#au.setCurrent(0.3)
#
refreshtime = 60*60*2
pausetime = 180
ctime = tm.time()

setflag = True

try:
    while True:
        try:
            a = getActualValues()
            topBalancing(a)
            #print("try")
        except:
            print("EMPTY MAX VALUE")
        tm.sleep(1)
        #print("setting current to 15A")
        if (setflag):
            au.setCurrent(10.)
            setflag = False
        #tm.sleep(3*60*60)

except Exception as e:
    for x in [0,1,2,3]:
        turnBleedingOff(x)
    tm.sleep(1)
    print(str(e.args[0]))
    print(sys.exc_info()[0])
    logger_test.debug("Exception occured")
    logger_test.debug(sys.exc_info()[0])
    #bb.setCurrentA(0)
    #bb.setVoltageA(0)
    ##bb.setPowerA(0) #takes too long
    bb.setInputOff()
    bb.setRemoteControllOff()
    au.setVoltage(0)
    au.setCurrent(0)
    bb.stopSerial()
    au.stopSerial()
    sys.exit(1)
    quit()

