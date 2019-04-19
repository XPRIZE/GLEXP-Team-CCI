# Pubbly Engine

The runtime environment for pubbly brand books, created from the design tools and/or the pubbly console server.

## Getting started

The pubbly engine is designed to be used in a number of different versatile ways. As such there are different HTML files 

## Attaching

The pubbly engine can be attached to a pubbly web packet to create an interactive experience. The packets can run on a remote server, on a local offline computer, or wrapped in a cordova APK application. In addition, packets can be "attached" after design tools export, after manipulation via the pubbly console Swap app or Stitch app, after being build as a map, or after manual XML manipulation. The steps to attach vary depending on the situation.

### Attaching: Input as XML

To use the pubbly engine in an offline environment, use the following html template file

> html/offline-xml.html

Place the file along side the images and audio folders of the book you wish to display. Find and replace the following two variables in the HTML file

* {PATH_TO_ENGINE}
The full path to the pubbly engine git project root

* {XML_STRING}
The full contents of the MainXML.xml file exported by the pubbly design tools

(Reasons behind this... For most offline browsers, jquery cannot load an external XML file -- cross origin policy -- And even though the file is on the same computer as the JS, the browser sees it as contamination and blocks the request. An inline XML file solves this issue)

* Optional: {PATH_TO_BOOK}
Full path from index file to the book you wish to view. Useful for previewing multiple books

### Attaching: Input as JSON

Because the pubbly engine needs to convert the original XML element into an easier native JSON object, SOME time can be saved in the preload process by simply passing in the JSON direct. You can also skip including a few unnessisary scripts used in the conversion process from XML to JSON.

To use the pubbly engine from a JSON origin instead of the regular XML, use the following template file

> html/offline-json.html

Find and replace the following variable

* {PUBBLY_JSON}
The full contents of the Main.versionNumber.json file (Can be found on Console server)

* {PATH_TO_ENGINE}
The full path to the pubbly engine git project root

Note: Because the JSON is created with direct asset paths, whatever location the book had relative to it's engine and assets must remain the same. Changing the asset folder location after manually hard coding the JSON will break the book.