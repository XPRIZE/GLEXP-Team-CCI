# Pubbly Engine

The runtime environment for pubbly brand books, createad from the design tools and/or the pubbly console server.

## Getting started

The pubbly engine is designed to be used in a number of different versitile ways. As such there are different HTML files 


## Attaching

The pubbly engine can be attached to a pubbly web packet to create an interactive experience. The packets can run on a remote server, on a local offline computer, or wrapped in a cordova APK application. In addition, packets can be "attached" after design tools export, after manipulation via the pubbly console Swap app or Stitch app, after being build as a map, or after manual XML manipulation. The steps to attach vary depending on the situation.

### Attaching to a design tools export



## Offline export

To use the pubbly engine in an offline environment, use the following html template file

> html/offline-build.html

Place the file along side the images and audio folders of the book you wish to display. Find and replace the following two variables in the HTML file

* {PATH_TO_ENGINE}
The full path to the pubbly engine git project root

* {XML_STRING}
The full contents of the MainXML.xml file exported by the pubbly design tools

(Reasons behind this... For most offline browsers, jquery cannot load an external XML file -- cross origin policy -- And even though the file is on the same computer as the JS, the browser sees it as contamination and blocks the request. An inline XML file solves this issue)

* Optional: {PATH_TO_BOOK}
Full path from index file to the book you wish to view. Useful for previewing multiple books


