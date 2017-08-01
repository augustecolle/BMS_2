import MySQLdb
import sys

with open("writeDB.txt") as f:
    content = f.readlines()

db = MySQLdb.connect(host="localhost", user="python", passwd="pypasswd", db="test")

with db as cur:
    for row in content:
        cur.execute("INSERT INTO Metingen VALUES (" + row.strip()+")")
db.commit()
db.close()

#quit program
sys.exit(0)

