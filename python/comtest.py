from libraries import can_lib_auguste as au
import RPi.GPIO as GPIO
import imp

imp.reload(au)

numslaves = 7 #link to database settings
loginterval = 1 #link to database settings
logging = 1 #link to database settings

slave_addresses = [0x11,0x12,0x14,0x15,0x16,0x19, 0x21]

dbTable = "Timestamp REAL, Current REAL, Sl0Voltage REAL"
for x in slave_addresses:
    dbTable = dbTable + ", " + "Sl" + str(x) + "Voltage REAL"
dbTable = dbTable + ", " + "Sl0Bl REAL"
for x in slave_addresses:
    dbTable = dbTable + ", " + "Sl" + str(x) + "Bl REAL"

header = dbTable.split()[::2]

sensorlist = []
tempdict = {}

numlines = 10


au.master_init(SS=17)
au.init_meting(slave_addresses)

au.currentCal(50)
print("DONE")
au.getCurrent(SS=17)

au.getVoltageMaster(SS = 17)

au.getVoltageSlaves(slave_addresses)

res = au.getAll(slave_addresses, SS = 17)
print(res)

au.setBleedingMasterOn()
au.setBleedingMasterOff()

print(res)

mvoltage = au.getVoltageMaster(SS = 17)


