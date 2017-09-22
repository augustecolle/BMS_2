#!/usr/bin/env python

import os
import logging
import logconf
import logging.config
import signal
from flask import Flask, request
from flask_restful import Resource, Api
#from libraries import can_lib_auguste as canau
from libraries import EAEL9080 as bb
from libraries import EAPSI8720 as au
#import temp_reading_multithreading as ds18b20
import json
from RPi import GPIO
import ast
import time
import MySQLdb
import sys
import subprocess
import numpy as np
import psutil
import tempconf
import requests

with open('blconfr.json', 'r') as f:
    resetdict = json.load(f)
with open('blconf.json', 'w') as f:
    json.dump(resetdict, f)

logging.config.dictConfig(logconf.LOGGING)
global logger
logger = logging.getLogger('app')

GPIO.setmode(GPIO.BCM)
GPIO.setup(17, GPIO.OUT) #slave select


au.startSerial('/dev/ttyUSB1')
time.sleep(0.1)
au.remoteControllOn()
#au.getActualValues()
au.readAndTreat()
au.readAndTreat()
au.setCurrent(0.)
au.setVoltage(32)
au.setPower(500)
#
bb.startSerial('/dev/ttyUSB0', "02")
bb.setRemoteControllOn()
time.sleep(0.1)
#bb.getActualValues()
bb.readAndTreat()
bb.readAndTreat()
bb.setInputOn()
bb.setCCMode()
bb.clearBuffer()
bb.setPowerA(1000)
bb.setVoltageA(24.)
bb.setCurrentA(0)
bb.clearBuffer()

def shutdown():
    func = request.environ.get('werkzeug.server.shutdown')
    if func is None:
        raise RuntimeError('Not running with the Werkzeug Server')
    func()
    
def signal_handler(signal_s, frame):
    logger.critical('EXITING SYSTEM')
    time.sleep(0.1)
    bb.setCurrentA(0)
    time.sleep(0.1)
    bb.setVoltageA(0)
    time.sleep(0.5)
    #bb.setPowerA(0)
    time.sleep(0.1)
    bb.setInputOff()
    time.sleep(0.1)
    bb.setRemoteControllOff()
    time.sleep(0.1)
    bb.stopSerial()
    time.sleep(0.1)
    au.setVoltage(0)
    time.sleep(0.1)
    au.setCurrent(0)
    time.sleep(0.1)
    au.stopSerial()
    time.sleep(0.1)
    for x in get_pid("python"):
        process = psutil.Process(int(x))
        logger.debug("FOUND PYTHON PROCESS WITH ID: %d IN SIGNAL HANDLER OF APP.PY", x)
        logger.debug("Content of process.cmdline(): %s", process.cmdline())
        if (int(x) != int(os.getpid()) and process.cmdline() != [] and 'test' in process.cmdline()[1]):
            os.kill(int(x), signal.SIGKILL)
    plogging.kill()
    GPIO.cleanup()
    quit()
    sys.exit(1)

signal.signal(signal.SIGTERM, signal_handler)
signal.signal(signal.SIGINT, signal_handler)

def get_pid(name):
    return map(int, subprocess.check_output(["pidof", name]).split())

#plogging = subprocess.Popen([sys.executable, './logging2db.py'])
time.sleep(2) #waiting for current calibration

numslaves = 7 #link to database settings
con = None

app = Flask(__name__)
api = Api(app)

#header = ["Timestamp", "Current", "MVoltage", "Sl1Voltage", "Sl2Voltage", "Sl3Voltage", "Sl4Voltage", "Sl5Voltage", "Sl6Voltage", "Sl7Voltage", "Sl8Voltage", "Sl9Voltage", "Sl10Voltage", "Sl11Voltage", "Sl12Voltage", "Sl13Voltage", "Sl14Voltage", "Sl15Voltage"]
global cut_off_voltage_low
cut_off_voltage_low = 2.8
global cut_off_voltage_high
cut_off_voltage_high = 4.

#Sl0Bl is the master
#headerBl = ["Sl0Bl", "Sl1Bl", "Sl2Bl", "Sl3Bl", "Sl4Bl", "Sl5Bl", "Sl6Bl", "Sl7Bl", "Sl8Bl", "Sl9Bl", "Sl10Bl", "Sl11Bl", "Sl12Bl", "Sl13Bl", "Sl14Bl", "Sl15Bl"]

with open('blconfr.json', 'r') as f:
    bldict = json.load(f)

class ActualValues(Resource):
    global cut_off_voltage_low
    global cut_off_voltage_high
    global logger
    def get(self):
        dataDict = {}
        #db = MySQLdb.connect(host="localhost", user="python", passwd="pypasswd", db="test")
        #with db:
        #    cur = db.cursor()
        #    success = False
        #    while not success:
        #        try:
        #            cur.execute("select * from MostRecentMeasurement")
        #            row = cur.fetchone()
        #            if (row):
        #                success = True
        #        except:
        #            time.sleep(0.01)
        #    colNames = list(map(lambda x: x[0], cur.description))
        #    #print(colNames)
        #    #print(row)
        #    dataDict = dict(zip(colNames, row))
        #    #print("DATADICT")
        #    #print(dataDict)
        #    # map keys to their number of rings on the data cable
        #    #for (key, val) in tempconf.tempmap.items():
        #    #    if key in dataDict:
        #    #        dataDict[val] = dataDict.pop(key)
        #if db: db.close()
        with open("writeDBMR.txt",  'r') as f:
            row = f.readlines()
        header  = row[0].strip().split(', ')
        data    = [float(x) for x in row[1].strip().split(', ')]
        dataDict = dict(zip(header, data))
        print("Datadict:")
        print(dataDict)
        for x in dataDict.keys():
            if "Voltage" in x:
                #print(x)
                dataDict[x] = round(dataDict[x], 5)
                #print(round(dataDict[x], 5))
                #print(dataDict[x])
                if (dataDict[x] < cut_off_voltage_low and dataDict[x] >= 0):
                    logger.critical('UNDERVOLTAGE ON SLAVE %s REACHED, VOLTAGE NOW IS: %1.2f' % (x, dataDict[x]))
                    if (dataDict[x] < 0):
                        self.quit(2)
                    else:
                        self.quit(1)

                elif (dataDict[x] > cut_off_voltage_high):
                    logger.critical('OVERVOLTAGE ON SLAVE %s REACHED, VOLTAGE NOW IS: %1.2f' % (x, dataDict[x]))
                    self.quit(2)
            else:
                dataDict[x] = round(dataDict[x], 2)
        #print(dataDict)
        return dataDict

    def quit(self, num):
        try:
            for x in get_pid("python"):
                process = psutil.Process(int(x))
                logger.debug("FOUND PYTHON PROCESS WITH ID: %d", x)
                if (int(x) != int(os.getpid()) and ('test' in process.cmdline()[1])):
                    logger.debug("Sent SIGKILL to process ID: %d", int(x))
                    os.kill(int(x), signal.SIGKILL)
                    time.sleep(1.)
        except:
            print("EXCEPTION")
            logger.debug("exception in SIGKILL")
            logger.debug(str(sys.exc_info()[0]))

        if (num == 1):
            bb.setCurrentA(0)
            au.setCurrent(15)
            time.sleep(15)
            au.setCurrent(0)

        elif (num == 2):
            au.setCurrent(0)
            bb.setCurrentA(15)
            time.sleep(15)
            bb.setCurrentA(0)
        else:
            au.setCurrent(0)
            bb.setCurrentA(0)
            time.sleep(15.)

        #set bleeding off
        with open('blconfr.json', 'r') as f:
            resetdict = json.load(f)
        with open('blconf.json', 'w') as f:
            json.dump(resetdict, f)
        #os.kill(int(os.getpid()), signal.SIGTERM)

class BleedingControll(Resource):
    #def get(self, slave_id):
    #    print("GET")
    #    print(slave_id)
    #    return bldict[slave_id]

    def get(self, slave_id):
        #print("GET")
        #print(slave_id)
        if (slave_id[-2:].lower() == 'on'):
            bldict[slave_id[:-2]] = 1 
            try:
                #canau.setBleedingOn(int(filter(str.isdigit, str(slave_id))))
                #canau.setBleedingOn(int(filter(str.isdigit, str(slave_id))))
                print("turned slave bleeding on")
            except:
                print("EXCEPTION")
                print(int(filter(str.isdigit, str(slave_id))))
                print(slave_id)
                logger.debug("Invallid slave id")
        elif (slave_id[-3:].lower() == 'off'):
            bldict[slave_id[:-3]] = 0 
            try:
                #canau.setBleedingOff(int(filter(str.isdigit, str(slave_id))))
                #canau.setBleedingOff(int(filter(str.isdigit, str(slave_id))))
                print("turned slave bleeding off")
            except:
                logger.debug("Invallid slave id")
        else:
            return bldict[slave_id]
        with open('blconf.json', 'w') as f:
            print("writing bldict")
            print(bldict)
            json.dump(bldict, f)
        #os.kill(plogging.pid, signal.SIGUSR1)
        return 201

class write2db(Resource):
    try:
        db = MySQLdb.connect(host="localhost", user="python", passwd="test123", db="test")
        cur = db.cursor()
        cur.execute('SELECT VERSION()')
        db.commit()
        data = cur.fetchone()
        print("MySQL version: " + str(data))
    except (MySQLdb.Error, MySQLdb.Warning) as e:
        print("Error " + str(e.args[0]))
        sys.exit(1)
    finally:
        if db:
            db.close()

    def get(self):
        pass


api.add_resource(ActualValues, '/ActualValues')
api.add_resource(write2db, '/write2db')
api.add_resource(BleedingControll, '/BleedingControll/<string:slave_id>')

#--- Enable CORS (cross origin requests), from: http://coalkids.github.io/flask-cors.html
@app.before_request
def option_autoreply():
    """ Always reply 200 on OPTIONS request """

    if request.method == 'OPTIONS':
        resp = app.make_default_options_response()

        headers = None
        if 'ACCESS_CONTROL_REQUEST_HEADERS' in request.headers:
            headers = request.headers['ACCESS_CONTROL_REQUEST_HEADERS']

        h = resp.headers 
        # Allow the origin which made the XHR
        h['Access-Control-Allow-Origin'] = request.headers['Origin']
        # Allow the actual method
        h['Access-Control-Allow-Methods'] = request.headers['Access-Control-Request-Method']
        # Allow for 10 seconds
        h['Access-Control-Max-Age'] = "10"

        # We also keep current headers
        if headers is not None:
            h['Access-Control-Allow-Headers'] = headers
        return resp


@app.after_request
def set_allow_origin(resp):
    """ Set origin for GET, POST, PUT, DELETE requests """

    h = resp.headers 
    # Allow crossdomain for other HTTP Verbs
    if request.method != 'OPTIONS' and 'Origin' in request.headers:

        h['Access-Control-Allow-Origin'] = request.headers['Origin']
    return resp


if __name__ == "__main__":
    plogging = subprocess.Popen(['/usr/bin/python2', 'logging2db.py'])
    app.run(debug=False, host="0.0.0.0", port=5000, threaded=True)
    print("DONE")

