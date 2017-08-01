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

global blMap

def getBlMap():
    blMap = {}
    r = requests.get('http://0.0.0.0:5000/ActualValues')
    res = dict(r.json())
    ret = {}
    for x in res.keys():
        if "Bl" in x:
            addr = int(re.search(r'\d+', x).group())
            if (addr == 0):
                blMap["MVoltage"] = 0
            else:
                blMap["Sl"+str(addr)+"Voltage"] = addr
    return blMap

