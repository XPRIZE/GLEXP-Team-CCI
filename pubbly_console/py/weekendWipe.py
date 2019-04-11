import MySQLdb
import sys, os

###### Empty out MySQL tables ######

tables = ['map','books','childassetnotes','levels','schools','subjects','swaps','unitpages','units'] 

db = MySQLdb.connect(host='localhost', db='console', user='console', password='SuperLongAndComplicatedPasswordThatIsProbablySimpleEnoughForADictionaryAttackButTooLongForItToMatterEatItSpecialCharacters')

cur = db.cursor()

for t in tables:
	cur.execute("DELETE FROM %s WHERE 1;" % t)

db.commit()

db.close()

###### Remove contents of appropriate directories ######

folders = ['books','zips','schools','deletedBooks','units','deletedChildren','series','deletedSeries','map']

for f in folders:
	os.system("rm -r -f /var/www/html/%s/*" % f)
