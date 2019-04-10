# Pubbly Console

The pubbly console is what TeamCCI developed in house and used to create the content for their finalist submission in the Global Learning Xprize

## Getting started

If you don't want to buy your own server and install our LAMP CMS yourself, you can register at [sandbox.pubbly.com](sandbox.pubbly.com). We are currently hosting this server, and you may upload your own content but all user posted files will be wiped on a weekly basis. If you want to host your own personal console repository, manual install is not so bad. I will be giving instructions for a clean up to date AWS ubuntu server, with ports open for SSH, SFTP, and HTTP. You _can_ use other servers builds, but this is largely untested/unsupported

### Install Apache 2.0, MySQL, and PHP 7+

* Buy or rent an ubuntu server (I use AWS, but have previously self hosted)
* (Optional) Associate a domain or alias for easy group usage.
* SSH into server (I prefer putty)
* sudo apt-get upgrade
* sudo apt-get update
* sudo apt install tasksel
* sudo tasksel install lamp-server
> You can verify the LAMP server installation by checking the IP address in a browser... It should resolve to the Apache default page.

### Download console repo to your server's web root

* cd /var/www
* sudo rm -r html
* sudo chown ubuntu:ubuntu . -R
* sudo git clone https://github.com/PubblyDevelopment/pubbly_console.git .
* cd /var/www/
* sudo git submodule update --init --recursive
> Pasting in putty or similar HTML shells is done with Control - Shift - Insert.
> To check that the clone worked, navigate to (YourDomain)/phpinfo.php or (YourIP)/phpinfo.php. This will show system information for your server. If it does, PHP is working and the console has been cloned. (Console WILL NOT work without further setup)

### Install PHP plugins 

* sudo apt-get install php-zip
* sudo apt-get install php-xml

### Edit your php.ini to increase max upload file size.

* sudo vim /etc/php/7.2/apache2/php.ini
> Your php.ini location may vary with alternative apache versions, php versions, or Linux OS verions. To find your specific php.ini location, reference the domain/phpinfo.php, column "Loaded Configuration File"
* find upload_max_filesize
* change to "200M"
* Write and quite
> The Pubbly Design Tools exports used in the Xprize were usually large in size, about 5MB per page.

### Import our database structure, using your own password (PutPasswordHere)

* sudo mysql -u root -p
> mysql root password is default empty, and you should probably change that.
* CREATE DATABASE pubbly_console;
* CREATE USER 'pubbly_console'@'localhost' IDENTIFIED BY 'PutPasswordHere';
* grant all privileges on pubbly_console.* to 'phpmyadmin'@'localhost';
* flush privileges;
> This creates a new user account and database on your server, to be used exclusively by PHP scripts running via ajax calls. This allows you to have multiple projects on the same server without site contamination risks.
* USE mysql;
* SET sql_mode='STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';
> Some SQL queries used for console projects require multiple group by statements, and MySQL has a default "ONLY_FULL_GROUP_BY" set. If you're using other sql modes for other projects, it is (presently) suffice to remove only the "ONLY_FULL_GROUP_BY" property from the sql_mode string.
* exit;
* sudo mysql -u root -p pubbly_console < /var/www/sql/FreshBuild.sql
> This imports the _structure only_ for console servers, which allows Export uploading and management.

### Copy and modify the server's config file

* cd /var/www/html/
* sudo vim config_default.php
* change password on line 4 to whatever you used for PutPasswordHere
* (Optional) Enable open registration (allows ANY IPs to registrer as new users to your console)
    * Change line 14 from 'define("OPEN_REGISTRATION", false);' to 'define("OPEN_REGISTRATION", true);'
* (Optional) Attach your own brand name (will prefix all pages with inputed string)
    * Change line 15 from 'define("BRAND", "");' to 'define("BRAND", "YourBrandHere");'
* save as "config.php"
> config.php is git ignored, to prevent YOUR password from getting uploaded to the main repository. Without a correct MySQL password, all php script on the site will be unable to run (security error). 

You can test your steps so far by refreshing your Domain name or IP address (not /phpinfo.php). If it resoloves to a console login page, it worked!

> If it didn't work, you can debug by enabling php errors and warnings in the php.ini file you edited above. This will at least show what kind of an error you're getting. It may be a good idea to enable errors/warnings anyway, for bug fixing and your own development.

### (Optional) Get python up and running 

Python is not currently critical for console projects, but we may use it in the future.

* sudo apt-get install python3
* sudo vim /etc/apache2/conf-available/cgi-enabled.conf
```xml
 <Directory "/var/www/html/py">
    Options +ExecCGI
    AddHandler cgi-script .cgi .py
 </Directory>
```
* sudo a2enconf cgi-enabled

### Permissions and restarts

Change permissions on folders accessed via Ajax called php scripts

* cd /var/www/html
* sudo chmod 755 books series schools map zips deleted* -R
* sudo chown www-data:ubuntu books series schools map zips deleted* -R

Restart apache 2 to update with all custom settings
* sudo service apache2 restart

### FINISH

Your server is now ready. I strongly advice that you change the root password to something secure, that you disallow the following of system indexes, and other smart software people things.

This is a "from scratch" build of the console, and has no pre-loaded content. To create and upload your own new content, see section "Adding content". You can also create a mirror image of TeamCCI's xprize console. For full instructions, see [Pubbly](https://github.com/PubblyDevelopment/pubbly) section "Submission from existing content". For convenience sake, I have also included a copy of the server specific "Adding content: Preloading Xprize content" steps below.

## Adding content

It is entirely possible to create a brand new program from brand new assets using our tools. This is a large job, and will take artists, content creators, and developers. For a full overview of the process, checkout [Pubbly](https://github.com/PubblyDevelopment/pubbly) section "Submission from scratch".

If you would like to instead start with a mirror image of the console TeamCCI used to create Xprize android applications, checkout [Pubbly](https://github.com/PubblyDevelopment/pubbly) section "Submission from existing: Xprize console duplication"

You can upload new content to either scratch consoles or Xprize dupe console in the same way.

### Adding content: Design Tools Export

To upload content to the pubbly console, first author and export a zip from the design tools. Full instructions can be found at [Pubbly Design Tools](https://github.com/PubblyDevelopment/pubbly_design_tools) section "Authoring books" and "Exports"

Once you have a zip, you can upload to two places in the console, Static and Variable exports. A list of all Design Tools exported zips used to create our Xprize Console can be found at [Pubbly Xprize Original Exports](https://github.com/PubblyDevelopment/pubbly_xprize_original_exports)

### Adding content: Uploading to Static

A static export is a book that does not need any templating or changes. It is exactly what you see in the pubbly design tools preview mode.

To upload a new static export, 

* Navigate to "Static Exports"
* Select "New static export"
* Enter a name (unique)
- Optional: Select a folder, or type in a name for a new folder
* Click "upload zip", and select the zip you just exported from the design tools

Static export uploaded. It can be found, viewed, downloaded, reuploaded and renamed from the Static Export main page.

### Adding content: Uploading to Variable

A variable export is a book that needs certain assets to be "swapped out". Variable exports are very useful when creating large amounts of content with few developers/authors.

First, create a book in the pubbly design tools with some of the assets set to "variable". Full instructions can be found at [Pubbly Design Tools](https://github.com/PubblyDevelopment/pubbly_design_tools), section "Exports: Variable"

Once you have a zip, log into your console

* Choose "Variable Exports"
* Click the top right tab for "New Series"
* Give your series a name (unique)
- Optional: Select a folder, or type in a name for a new folder
* Click "Create new series"
* DragDrop your Design tools exported Zip 
    * (Or click the drop zone and select the zip you wish to upload)
* Click "Go series"

This will take you to the "Swap App". To navigate here with an existing series

* Open the folder you put your seires in
* Select the series you want to swap
* Click "Swap App"

Once on the swap app, you will see a representation of the "parent" assets in the left column. The right column, the vast majority of the screen, will be empty as there are no children.

* Create a new child with the "new" button
* Give it a name
* Drag a new asset (image or audio) to the white dropzone in the row you wish to replace
* It will upload, and the preview to the left will update
    * If you're swapping an audio file, you should be able to click the large blue button to hear it play)
* You can also add placeholder text (if you do not yet have the asset) or Notes (if the asset is wrong).
* Swapped images will be at the same X-Y center location as the image they replaced.
    * You can toggle between swapping out via "Size" or "Location"
        * a Size swapped image will fix the largest non-skewing dimensions of the original image
        * a Loc swapped image will come in at their own native resolution, at center X and Y
* Swapped audio files will simply play until they finish, regularless of the length of the file they replaced.

You can preview the new child book (with swapped assets) with the "View button. You can set it's progress with the "progress" dropdown. And once finished, you can "lock" edits with the lock button (although anyone else can unlock).

Any children created and swaps done will persist (when able), even if you reupload a modified Variable Export. This allows you to "fix" small issues with the Export within the design tools, without erasing "swaps".

## Assembling content

The pubbly console can also create new content from existing uploads. "Stitched Exports" are books that source their pages from other Variable and Static exports, to create a new "frankenstein" book (not the official name). "Mapped Exports" are collections of Static/Variable/Stitched books, connected by a series of URL links with a pin board style UI.

### Assembling content: Stitching

Stitched exports are held in a preset 4 tier hierarchy. The actual export itself is a "Unit". Multiple "Units" make up a "Level", multiple "Levels" make up a "Subject", and multiple "Subjects" make up a "School".

> The reason for the 4 tier structure was that our original Xprize application was going to be a single "School", made up of 2 subjects (Reading/Math), each with 4 Levels, each with 10-25 Units. However, as the project progressed, we quickly added more "throw in" areas to the application, such as a bookshelf, a set of "how to use" tutorials, and eventually a mapped out adventure game. Although the structure is no longer a perfect fit, content creators have mentioned it is still a helpful organizational tool, so we've kept it in.

First, create a new School, Subject, Level and Unit with the "New" buttons in each tier's row. Select the unit (either with the drop down, or from the list on the right), and click "Edit". This will take you to another webpage, where you can assemble.

Select either a series/child from the Variable Exports drop down, or a Static Export at the top left of the screen. Click "Add", and it will add each Page of the selected Export to the "Workbench" below. You can add multiple Exports to your workbench.

Select an export from your workbench, and you will see a list of pages on the "Workbench Page List" (middle column. You can drag and drop these pages individually to the "Unit Page List" (bottom right). Once you have added the pages you want to stitch together (in the correct order), you can "Save" the unit page list. This will create a new export on the server, made up of the assets and page structure from each targeted page.

If any of the sourced pages are updated, the unit will show as "OUTDATED" on the previous page. You can select outdated units and "Update and View", which will re-stitch with all new source pages.

> This proved specifically handy for commonly referenced Static pages. In the Xprize program, many of the units ended with a celebratory screen, full of cheers and stars. That screen was a single page, sourced by almost every unit. If any updates needed to be made to the celebratory end page, the source Static Export could be downloaded, modified, and reuploaded. Reliant units could be updated in mass (with the Update all units button).

### Assembling content: Mapping

* Go to Maps
* Click "New"
* Enter a new name for your map
* Select your map
* Click Edit

Add content to your map from either of the three export types (Stitched, Variable, Static) from the left hand column

* Select the type of export you want
* Select the export from the hierarchy (Stitched: School/Subject/Level), (Variable: Folder/Series), (Static: Folder)
* Double click to add to your map
* Page will refresh and a new "node" will be visible on the main area of your map.
* Move the export around the grey area to change it's location.

Upload a cover image to this node, so you know what it is.

* Select the node from the grey map area (will have a red border once selected)
* Bottom left node will update with selected node name
* Click the cover (currently empty) and select a png on your desktop
* Page will refresh with new "cover image" in place.

Upload, add, and position multiple nodes to your map. Once your map is loaded with content, determine which links go to which nodes

* Click a node on the map.
* All links with To Be Determined targets will load into the middle dropdown
* Select the target you wish to "determine"
* Shift select another node on the map
* Click the green ">" button to link that target inside that link inside that page of the left export to navigate to the shift clicked right export.
* Click the green ">>" button to link ALL targets inside your left export to navigate to the right export.

Determine an "entry point" for your map

* Select any node on the map
* Click the "star" button on the far right of the UI
* Viewing the map will now start you at the selected node

- You can preview a map from any node by selecting a node, and clicking the "eye glasses" button
- You can "save" the positioning of your map with the "save" button
- You can zoom in and out with the magnifier buttons

Update content referenced on map

* If you decide to change any referenced exports on a map, reupload new content where ever the "source" of the export is loaded.
    * If the export is a stitched unit, and you update _its_ source, first update the stitched.
* Once all exports have been "fixed", edit your map, and click the "Recycle" button (two circular arrows)

The process of updating a map takes time. We originally wanted to only update changed content, but time constraints forced us to implement a brute force method of simply re-copying and applying node connections to every node of the map.

Once your map is "perfect", select it in the map selection screen, and click the "Export for Local/APK" button. This will create and download a single zip file. This zip file works "out of the box". You can extract to a server. You can view offline from your local machine. You can also put the map inside a cordova project and export as an APK. Any link to the root folder's index.html file will "start" the map at the entry point specified, and all determined navigation nodes will refresh the browsers URL to the connected node.

## Downloading/Editing content

Much of the Console Content was tweaked and reuploaded before the finished product. Any changes made from the console itself would reapply (when possible) to updated exports.

### Downloading/Editing a Static Export

* Select the static export you want to modify
* Select "Download"
* Unzip and open the MAIN file in the Pubbly Design Tools
* Export for Console
* From console, reselect the same Static Export
* Click "Reupload"

Maps or Stitched content reliant on that specific Static Export will mark itself "OUTDATED". Updating the stitch or map will reflect any changes done in design.

### Downloading/Editing a Variable Export

* Select the Series you wish to download
* Click "Download Parent"
* Unzip and open the MAIN file in the Pubbly Design Tools
* Make edits
* Export for Console
* From console, reselect the same Series
* Drag/drop the zip into the "Upload Zip file" dropzone OR
* Click the dropzone, and reselect your edited Design Tools export.

Any children based on the parent will rebuild, and all swaps will reapply when possible. For swaps to reapply, the asset in question must not have changed it's name, location in the page (from page 4 to page 5), or column in the asset manager.

Maps or Stitched content reliant on a child in that Variable Export's series will mark itself as "OUTDATED". Updating the stitch or map will reflect any changes done in design

### Downloading/Editing a Stitched Export

Unfortunately, stitched units are compilations of pages created from other content. As such, there is no original "Main" file, and units cannot be opened in the design tools.

You can however edit the source content, and update each unit individually.

* Go to Stitch App in console
* Select the School, Subject, and Level of your unit. Then select your unit.
* Select "Edit" (Bottom right)
* This will open a new page, where you can create, edit, or check source of any units.
* At the bottom right of this screen you should see a list of pages that make up the unit.
* Hover the mouse over whichever page you wish to update.
* The tool tip should tell you which series the page comes from

Download/edit/reupload whichever variable export or static export corresponds to the page you wish to change

* Once the source page has changed, navigate back to the unit in question
* You should see a red "OUTDATED" next to the unit name.
* Select the unit, and click "Update + View", or "Update ALL" to update all outdated units in said level

---

We are developing an experimental feature which allows the design tools to create a new Main file from imported XML. You are welcome to experiment, but there are still bugs in this system.

To import an XML file into the Design tools, first download a unit.

* Go to Stitch App
* Select school, subject, and level of your unit
* Select Unit
* Select Downlod Unit button (bottom right)
* Extract zip to a new folder on your desktop, and feel free to delete all Main.VERSION.json files
* Run the Pubbly Design Tools
* From file, choose "import"
* Select the XML file you wish to import

The design tools should create a new design tools main file, and you should be able to make any edits and export the new project as you would any other.


### Downloading/Editing a Mapped Export

Maps are made up of multiple different exports, static, variable, or stitched. As such, they cannot be opened by the design tools, nor can the _entire_ map be imported in any meaningful way. If you wish to edit a map, edit the source for each node, and update the map. To find the source of a Map's node,

* Select the map in question
* Click "Edit"
* Wait for the map to load
* Click the node you wish to source
* Look at it's node name (below cover image)

Node names are "-" joined strings of their source.

| Source   | Node Name                          |
|----------|------------------------------------|
| Static   | static-$exportName                 |
| Variable | variable-$seriesName-$childName    |
| Stitched | unit-$school-$subject-$level-$unit |

Unfortunately, map outdating is buggy. If you update a Static/Variable/Stitched export, reliant maps will NOT mark themselves as outdated. But if you manually update, changes will flow through.

Update with the double circular arrow buttons second from the bottom on the Edit Map page

## Creating packets

The pubbly console is just an intermediary, the end product of all console CMS work are collections of pubbly web packets. Packets can be downloaded individually or in aggregate. Pubbly packets, or a collection of packets, can be deployed to any number of environments as they are simply HTML/XML files, associated assets, and javascript to tie them all together.

### Creating packets: Static Exports

To create a web packet from a static export

* Select your export in the console, and click the "download" button

The downloaded zip file should contain a file named "MainXML.xml". It may also contain a folder of "images", a folder of "audio" files, or a "Main.{version-number}.json" file.

* Attach the pubbly engine

For full instructions on how to attach the pubbly engine to your packet, checkout the [Pubbly Engine](https://github.com/PubblyDevelopment/pubbly_engine) repository readme, section "Attaching"

### Creating packets: Variable Exports

We never needed to do specifically this, so the instructions are a little raw, but it still can be done.

* Log into your pubbly console brand server via a FTP/SFTP program (eg FileZilla)
* Create a temporary folder on your desktop (~/tmp)
* Navigate to the variable export you want to download (eg /var/www/html/series/{NAME_OF_VARIABLE_EXPORT})
* Download folder "audio", "images", "videos" along with every XML file to your desktop folder ~/tmp
* Clone the [Pubbly Engine](https://github.com/PubblyDevelopment/pubbly_engine) repository to your local
> The Pubbly Engine is the required JS and CSS to take the XML and assets of a console based Export, and create an interactive web page (for deployment via Cordova APK wrapper, hosted server, or offline hand-to-hand zips).
* From the Pubbly Engine repository on your local, copy and paste 
    - pubbly_engine/assets to ~/tmp/pubbly_engine/assets
    - pubbly_engine/css to ~/tmp/pubbly_engine/css
    - pubbly_engine/js to ~/tmp/pubbly_engine/js
    - pubbly_engine/fonts to ~/tmp/pubbly_engine/fonts
* From the pubbly_engine repository, copy and paste 
    - "pubbly_engine/html/offline-xml.html" to ~/tmp/index.html
* Edit tmp/index.html
    - Replace "{PATH_TO_ENGINE}" with "pubbly_engine"
    - Replace "{PATH_TO_BOOK}" with "" (blank because current working directory)
    - Replace "{XML_STRING}" with the contents of whichever child XML file you wish to run
* Launch index.html, packet now runs in a browser

If you wish to do this with multiple children, simply repeat the above steps, except rename your "index.html" file to "Child_name_here.html".

You may also rework the PATH_TO_ENGINE and PATH_TO_BOOK variables to whatever alternate file system structure you wish. If the variables reflect a browser executable URL, the book will load and run fine.

### Creating packets: Stitched Exports

Originally, the "stitch app" section of the console was to be the final assembly point for the cordova APK. However time constraints required that we assemble the cordova school structure manually, with a lesson by lesson approach. 

### Creating packets: Mapped Exports

* Navigate to the "Mapped Exports" section of the console.
* Select the map you wish to package.
* Click "Create Packet".

This process may take time for larger maps, but it will automatically download a zipped packet. NOTE: This packet (unlike Static, Variable and Stitched packets) has a Pubbly Engine automatically attached. 

## Deploying Packets

### Deploying a Static/Variable Packet

TODO: Instructions in engine?

### Deploying a Stitched school packet.

Unfinished... TODO: Code and instructions (5hr)

Still possible with SFTP or SSH access to server. Real quick instructions, SFTP into your server, cd to /var/www/html/schools, download the school in question, use batch FS manipulation (vim works) to get rid of junk data (.php files, .html files, .json files), use ffmpeg to batch convert WAV to OGG for size, go through each unit individually, copy paste in the XML to a template in the pubbly engine folder, use a decent macro to automate it, make coffee, finished. It's not perfect, but this is literally what I did to make it work, and these are the instructions to do it again... Will make a button that does all that server size, spits out a nice zip.

### Deploying a Mapped Packet

To deploy a packet, first create and download the packet to your local machine. (Steps in section Creating Packets). If you wish to deploy as an offline zip, to be viewed from a desktop browser, email it to whoever you want to have it, tell them to extract and open the index.html file. If you wish to deploy as a hosted webpage, extract to a web accessible folder on your server.

If you wish to distribute as a cordova APK, see [Pubbly SchoolHouse](https://github.com/PubblyDevelopment/pubbly_schoolhouse) section Adding content: Console Map packet

### Deploying a Pubbly School house

For our submission in the XPRIZE, Pubbly created a lightweight but messy HTML front end cordova application, and filled it with Stitched and Mapped console packets.

For full instructions on how to take new console packets and distribute in our exact structure, or how to modify the application structure to fit your new idea for a learning program, see [Pubbly SchoolHouse](https://github.com/PubblyDevelopment/pubbly_schoolhouse) section "Adding content" and "Adding content: New program"
