#!/usr/bin/env python

#Test procedure 2:
#1) Opladen tot 100% SOC
#2) Ontladen tot 40% SOC (72 Ah want SOC tov werkelijke capaciteit)
#3) Opladen tot 60% SOC (24 Ah opladen)
#4) Ontladen tot 40% SOC (24 Ah ontladen)
#5) Opladen tot 100% SOC (72 Ah)

import os
import logging
import logconf
import logging.config
import signal
from libraries import EAEL9080 as bb
from libraries import EAPSI8720 as au
import math
import csv
import numpy as np import time as tm
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
bb.startSerial('/dev/ttyUSB1', "02")
bb.setRemoteControllOn()
bb.setInputOn()
bb.setCCMode()
bb.setPowerA(1000)
bb.setVoltageA(17.)
bb.setCurrentA(0)
bb.clearBuffer()


tm.sleep(1)

au.startSerial('/dev/ttyUSB0')
au.remoteControllOn()
au.readAndTreat()
au.setCurrent(15)
au.setVoltage(16.)
au.setPower(500)
au.getSetVoltage()

#au.setCurrent(0.3)
#
refreshtime = 60*60*2
pausetime = 180
ctime = tm.time()

setflag = True

def opladen100SOC(interval = 1):
    chargeFlag = True
    au.setCurrent(15.)
    voltages = getActualValues().keys()
    while (sum(voltages) < 3.96*4):
        ctime = tm.time()
        voltages = getActualValues()
        if (max(voltages.keys()) > 3.8 and chargeFlag):
            au.setCurrent(1.)
            chargeFlag = False
        if not chargeFlag:
            topBalancing(voltages)
        tm.sleep(interval - (tm.time() - ctime))

def ontladenSOC(Ah):
    '''Ah is the amount of amperehoures that needs to be discharged. This method takes a fixed interval of 20 minutes charging -- 1 houre relaxation untill the desired Ah is discharged.'''
    dischargeAh     = float(Ah)            #in Amperehoure
    dischargeTime   = dischargeAh/15.*3600  #in seconds
    starttime       = tm.time()
    interval        = 20*60                 #discharge interval in seconds
    intervalstart   = tm.time()
    bb.setCurrentA(15.)
    ctime           = tm.time()
    while((ctime - starttime) < dischargeTime):
        ctime = tm.time()
        if ((ctime - intervalstart) > interval):
            bb.setCurrentA(0.)
            tm.sleep(60*60)
            intervalstart = tm.time()
            bb.setCurrentA(15.)
        tm.sleep(1 - (tm.time() - ctime))
    bb.setCurrentA(0.)
    return 1

def opladenSOC(Ah):
    '''Ah is the amount of amperehoures that needs to be charged. This method takes a fixed interval of 20 minutes charging -- 1 houre relaxation untill the desired Ah is charged.'''
    bb.setCurrentA(0.)
    chargeAh     = float(Ah)           #in Amperehoure
    chargeTime   = chargeAh/15.*3600    #in seconds
    starttime       = tm.time()
    interval        = 20*60             #charge interval in seconds
    intervalstart   = tm.time()
    au.setCurrentA(15.)
    ctime           = tm.time()
    while((ctime - starttime) < chargeTime):
        ctime = tm.time()
        if ((ctime - intervalstart) > interval):
            au.setCurrent(0.)
            tm.sleep(60*60)
            intervalstart = tm.time()
            au.setCurrent(15.)
        tm.sleep(1 - (tm.time() - ctime))
    au.setCurrent(0.)
    return 1


try:
    #test 2
    opladen100SOC()
    ontladenSOC(72)
    opladenSOC(24)
    ontladenSOC(24)
    opladenSOC(72)

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

print("TEST DONE")
sys.exit(1)

