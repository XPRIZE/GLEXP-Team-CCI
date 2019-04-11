# Pubbly design tools

A livecode cross platform application to create pubbly brand export files

## Getting Started

To start using the pubbly design tools to create content, download the windows or Mac packages, extract or install, and launch the application.

Packages can be found in this repository's "Releases" folder, or downloaded directly from [our website](Pubbly.com)

For help on how to create content, read through the applications built in help menu, specifically the Terms and Concepts.

### Developers

To start editing the source code of the Pubbly Design Tools, first download a copy of [LiveCode Community 7.1.4](https://downloads.livecode.com/livecode/). Download and unzip the Window.zip package, and rename the file Tools.pbly to Tools.livecode. Open the Tools file from within Livecode.

Changes must be done from within the Livecode IDE.

## Authoring books

A full help section is available inside the design tools them selves. Please refer to help -> Terms and Concepts, or our [YouTube tutorials](https://www.youtube.com/channel/UCnkoKt9PYqaMumT1V2giGbQ)

## Exports

There are four main types of "Exports".

* Static exports: Created from Design tools. "As is".
* Variable exports: Created from Design tools. Templated and mass produced on console.
* Stitched exports: Created from above two exports on console CMS. Collection of pages from number of different sources
* Map exports: Multiple interconnected exports tied together with URL links, downloaded as a fully connected package (for APK, offline, or serverside deployment).

Every export has as associated XML file. If you plug that XML file into the Pubbly Engine, it can run online, offline, or wrapped in a cordova created APK. Instructions for how to do that are at [Pubbly Engine](https://github.com/PubblyDevelopment/pubbly_engine) section building from xml.

For a more project friendly approach, use a pubbly console. To build a console from scratch, follow instructions at [Pubbly Console](https://github.com/PubblyDevelopment/pubbly_console) section "Getting Started". This will allow you complete control over the environment.

To "try out" an existing console, register on [sandbox.pubbly.com](sandbox.pubbly.com). It is hosted by us, and although you can upload, all content is wiped on a weekly basis.

### Exports: Static

Static exports are books that require no changes from their preview mode. What you see in design tools is what you want in the browser.

* Chose File -> Export -> Project to Console
* Find the newly created zip file on your desktop (will be named same as project)
* Launch a pubbly console.
* Log into the pubbly console of your choosing
* Select "Static Exports"
* Create a new static export, and upload your exported zip.

For instructions on Creating and Managing Static exports with the console, see [Pubbly Console](https://github.com/PubblyDevelopment/pubbly_console) section "Adding content: Uploading to Static"

### Exports: Variable

Variable exports are books that need to be templated and mass produced. As an example, you need to create 26 books, each for a letter in the alphabet. Each book has a different picture of the letter, and a different associated audio file "speaks" the letter. But everything else (background images, link placement, points, everything) is the same between all 26 books.

* Create a pubbly book
* Choose File -> Asset Manager
* Move any assets you want to _change between templated children in series_ from the "Fixed" to the "Variable" column
* Close that window
* Chose File -> Export -> Project to Console
* Launch a pubbly console, or log into an existing one.
* Create a new Variable Export, and upload your exported zip.
* Create children based off that variable export
* Swap assets to create a series of templated content.

For instructions on Creating and Managing Variable exports with the console, see [Pubbly Console](https://github.com/PubblyDevelopment/pubbly_console) section "Adding content: Uploading to Variable"

### Exports: Stitched

Stitched exports are frankenstein books, created from multiple different pages on the console CMS. Page 1 comes from a Variable export. Page 2 comes from a Static export. Page 3-5 comes from 3 different static exports. Page 6 comes from the 9th page of a Variable export. Basically, Stitched exports are conglomerates from other sources. The main advantage is, you can update the "source" page once, and batch update all stitched exports that rely on the source page automatically.

Stitched exports are not _created_ in the design tools. The design tools _can_ create the Static and Variable exports which eventually get sourced to Stitched exports on the console.

For instructions on how to assemble a stitch with the console, see [Pubbly Console](https://github.com/PubblyDevelopment/pubbly_console) section "Assembling content: Stitching"

### Exports: Maps

Maps are multiple different exports (Static, Variable, or Stitched) that link to each other. A map is a designers way to create a fully interconnected collection of multiple working exports, and build directly as an APK.

* Create a pubbly book
    * Launch pubbly, file -> new, name your project
* Add a link
    * Click the Blue header text (Objects, Animations, Links) until you are on "Links"
    * Choose a shape tool (Polygon, square, circle) from the top right
    * Draw a link on 
* Name your link
    * Right click Link column (first column) and select "rename"
    * Enter a new name
* Add a To be Determined target
    * Right click target column of your link -> Other Targets -> To be Determined
* Export your project
* Upload your project to a pubbly console
    * You can upload this project as a Static or Variable, and you may also create a Stitched export from it.

For instructions on how to assemble a map from the console, see [Pubbly Console](https://github.com/PubblyDevelopment/pubbly_console) section "Assembling content: Mapping"