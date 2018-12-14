#!/Library/Frameworks/Python.framework/Versions/3.7/bin/python3

import glob
import cgi
from pathlib import Path
import os
import shutil
from shutil import *
import fileinput
import strreplace as strr
import datetime

print("Content-Type: text/html\n\n")

class OfflineBundler:
    def __init__(self, mn):
        self.mapName = mn
        self.initMap = Path('../map/' + self.mapName)
        self.stagePath = Path('../staging/' + self.mapName)
        self.entryPoint = ""
        self.engineNo = open(Path('../pubbly_engine/latest.txt'), 'r').read()
        self.enginePath = Path('../pubbly_engine/' + self.engineNo)
        self.sharedPath = Path('../pubbly_engine/shared')
        self.units = next(os.walk(self.initMap))[1]
        self.zipLoc = ""
        self.warnings = []

    def checkIfEntryPointExists(self):
        errors = []

        try:
            self.entryPoint = open(Path('../map/' + self.mapName + "/" + "entryPoint.txt"), "r").read()
        except:
            errors.append("Fatal: No entry point specified.")

        self.printErrors(errors)
        return errors

    def copyToStagingArea(self):
        # TODO: Decide what to do if that map already exists in staging area. Wipe it? Make another copy?

        errors = []

        try:
            shutil.copytree(self.initMap, self.stagePath,
                            ignore=ignore_patterns("entryPoint.*", "test.py", "*.sh", "*.html", ".DS_Store"))
        except FileExistsError:
            errors.append("Fatal: Staging area already exists. Weird.")

        self.printErrors(errors)
        return errors



    def checkJSONExistsNewerEngine(self):
        errors = []

        unitJSON = ""

        self.jsonFiles = {}

        for u in self.units:
            filesToCheck = os.listdir(Path(str(self.stagePath) + "/" + u))
            for f in filesToCheck:
                if ".json" in f and "modified" not in f:
                    unitJSON = Path(str(self.stagePath) + "/" + u + "/" + f)
                    try:
                        # Save JSON so we can use it later, important!
                        self.jsonFiles[u] = unitJSON

                        # Check to see that the version in the filename matches the latest engine
                        version = (f[f.index("1"):f.index(".json")])
                        if version != self.engineNo:
                           self.warnings.append("Warning: JSON created for outdated engine (" + version + ") at " + u)
                    except:
                        errors.append("Fatal: Something went wrong at " + u + ". Missing JSON, maybe?")

                if "MainXML" in f:
                    unitXML = Path(str(self.stagePath) + "/" + u + "/" + f)

            if not unitJSON:
                errors.append("Fatal: JSON file missing at: " + u)
            if not unitXML:
                errors.append("Fatal: XML missing at: " + u)
            if self.isNewer(unitJSON, unitXML):
                self.warnings.append("Warning: JSON outdated at " + u)

        self.printErrors(errors)
        return errors

    def buildRunHTML(self):
        ### TODO: Add some error stuff here:

        errors = []

        for u in self.units:
            shutil.copy(str(self.enginePath) + "/run.html", self.stagePath)

            # try:
            with fileinput.FileInput(self.jsonFiles[u], inplace=True) as file:
                for line in file:
                    print(strr.replaceAll(
                        line, [
                            ["map\/" + self.mapName + "\/", ""]
                        ]), end='')

            with open(self.jsonFiles[u], 'r') as jsonFile:
                jsonData = jsonFile.read()

            with fileinput.FileInput(Path(str(self.stagePath) + "/run.html"), inplace="True") as file:
                for line in file:
                    print(strr.replaceAll(
                        line, [
                            ["{REL_ROOT}", "."],
                            ["{ENGINE}", self.engineNo],
                            ["{PUBBLY_JSON}", jsonData],
                        ]), end='')
            # except:
            #    self.errors.append("Fatal: Constructing run files failed.")

            os.rename(Path(str(self.stagePath) + "/run.html"),
                      Path(str(self.stagePath) + "/" + u + ".html"))

        self.printErrors(errors)
        return errors

    def copyEngineShared(self):
        errors = []

        try:
            shutil.copytree(self.enginePath, Path(str(self.stagePath) + "/pubbly_engine/" + self.engineNo))
        except FileExistsError:
            errors.append("Fatal: A copy of the engine (" + self.engineNo + ") already exists. Weird.")
        try:
            shutil.copytree(self.sharedPath, Path(str(self.stagePath) + "/pubbly_engine/shared"))
        except FileExistsError:
            errors.append("A copy of the engine (" + self.engineNo + ") already exists. Weird.")

        self.printErrors(errors)
        return errors

    def makeIndexFile(self):
        errors = []

        try:
            shutil.copyfile(Path(str(self.stagePath) + "/" + self.entryPoint + ".html"),
                            Path(str(self.stagePath) + "/index.html"))
        except:
            errors.append("Fatal: Making index file failed.")

        self.printErrors(errors)
        return errors

    def makeZip(self):
        errors = []

        # May want to use later to distinguish when zips were made:
        # today = str(datetime.date.today())

        zipName = Path(str(self.initMap) + "/offline")

        #print (zipName)
        try:
            shutil.make_archive(zipName, "zip", self.stagePath)
            self.zipLoc = str(zipName) + ".zip"
        except:
            errors.append("Fatal: Making zip failed for some reason.")

        self.printErrors(errors)
        return errors

    def removeStageFiles(self):
        errors = []

        try:
            shutil.rmtree(self.stagePath)
        except:
            self.warnings.append("Warning: Stage file removal. Possibly someone else's problem.")

        return errors

    def isNewer(self, new, old):

        result = os.path.getmtime(new) - os.path.getmtime(old)
        if (result is 0):
           self.warnings.append("Warning: The files were created at the same exact time. Weird.")
        else:
            return (result < 0)

    def printErrors(self, errors):
        for e in errors:
            print ("<br>* " + e)

    '''def getErrors(self):
        if (len(self.errors) is 0):
            print("Success! File made at: " + self.zipLoc)
        else:
            print("Errors found: ")
            for k, v in self.errors.items():
                print (v + "! " + k)'''


    def doTheThing(self):
        '''
        self.checkIfEntryPointExists()
        self.copyToStagingArea()
        self.checkJSONExistsNewerEngine()
        self.buildRunHTML()
        self.copyEngineShared()
        self.makeIndexFile()
        self.makeZip()
        '''

        steps = [self.checkIfEntryPointExists,
                 self.copyToStagingArea,
                 self.checkJSONExistsNewerEngine,
                 self.buildRunHTML,
                 self.copyEngineShared,
                 self.makeIndexFile,
                 self.makeZip,
                 self.removeStageFiles]

        step = steps.pop(0)
        worked = bool(len(step()) is 0)

        while worked and len(steps) > 0:
            step = steps.pop(0)
            worked = bool(len(step()) is 0)

        if worked and len(steps) == 0:
            print("<br><b>Success!</b> Click <a href=\"" + self.zipLoc + "\">here</a> to download.<br>")
            print("<br><br><font color=\"red\">Some issues came up: ")
            for w in self.warnings:
                print ("<br>* " + w)
            print("</font>")
        else:
            print("<br>Something went horribly wrong. I don't know what to tell you.")


form = cgi.FieldStorage()
mapNameInput = form.getvalue('mapName')
offObj = OfflineBundler(mapNameInput)
offObj.doTheThing()