# Pubbly SchoolHouse

Cordova project for Swahili and English APK submissions.

## Getting Started

The product of our Pubbly brand Design tools, Console, and Engine is a web packet. It consists of XML, assets (images, audio files), and a link to Pubbly Engine JavaScript. The JavaScript interprets the XML, loads the corresponding assets, and runs an HTML5 browser based interactive experience.

Pubbly Packets can be hosted on a server, launched from a local HTML file, or deployed using Cordova, PhoneGap, Electon, or any number of Android WebView/Chromium based wrappers. Team CCI used Cordova.

So before you go any further, install the Cordova CLI. [Installing Cordova](https://cordova.apache.org/docs/en/latest/guide/cli/#installing-the-cordova-cli)

### Adding content

All Pubbly related content is a webpage, which can run locally, on a web server, or in a Cordova wrapped APK. Each packet can be exported directly from the [Pubbly Design Tools](https://github.com/PubblyDevelopment/pubbly_design_tools), created and downloaded from a [Pubbly Console](https://github.com/PubblyDevelopment/pubbly_console), or manually added from the English/Swahili content root folders, found inside XprizePrograms folder.

### Adding content: Cordova boilerplate project

Regardless of the content you wish to add, you will first need to create a new "empty" Cordova project. 

* cordova create myProgram com.myCompany.myProgram myProgram
* cd myProgram
* cordova add platform android 
* Connect an android tablet for USB debugging
    * Buy a USB-C data transfer cable
    * Connect an Android device
    * Swipe down from top and put your Android device in file transfer mode
    * In security settings, enable USB debugging
    * In security settings, enable apps from unknown sources.
> To check that your device is ready, execute "adb devices" for an Android device in debug mode.
* cordova run android

Ensure that the Cordova boiler plate project has launched on your device. If it has, extract the downloaded map packet to your Cordova web root, and execute a clean build process.

* cordova clean android
* cordova build android

> Check your device. The APK should have installed and launched. If it didn't, check to make sure your device is in file transfer mode, with ADB debugging enabled, and allows applications from unknowns sources. You can also manually file transfer the generated APK to a tablet. The Cordova APK's path is given at the end of the build process in your terminal window. Copy that APK to your tablet, and manually install.

You now have a working Cordova project.

To add content from existing ready-to-build folders, use TeamCCI's English/Swahili web roots, section "Adding content: Xprize web roots"

To add new content from a custom Pubbly console generated map, see section "Adding content: Console Map packet"

To make a brand new submission, with different levels in each subject, or with a different number of subjects entirely, see "Adding content: New program"

### Adding content: Xprize web roots

The following are instructions for how to create a copy of our Xprize submission's APK.

First create your Cordova boiler plate project. You can use whatever program name/owner you want, but TeamCCI used
"cordova create schoolHouse com.cci.schoolHouse SchoolHouse". For general instructions, see section "Adding content: Cordova boilerplate project". After boilerplate steps, your CLI should generate an APK, although it is just a "this works" page. You can verify this APK on any Android tablet.

* Choose which language you wish to build 
    * For English, use folder "pubbly_schoolhouse/XpirizePrograms/EnglishWebRoot"
    * For Swahili, use folder "pubbly_schoolhouse/XpirizePrograms/SwahiliWebRoot"
* Empty the contents of your Cordova's www folder
    * rm -r {YourCordovaProject}/www/*
* Copy the contents of your selected language folder (EnglishWebRoot) into your boilerplate www folder
    * cp pubbly_schoolhouse/XpirizePrograms/EnglishWebRoot/* {YourCordovaProject}/www/
Your Cordova project should look something like this

<pre>
.  
├──   
|   └── www
|       ├── css
|       ├── img
|       ├── js
|       ├── school
|       ├── books.html
|       ├── index.html
|       ├── login.html
|       └── ...
</pre>

And the following plugins. [Adding Cordova plugins](https://cordova.apache.org/docs/en/3.0.0/guide/cli/index.html#add-features)

* cordova-plugin-autostart
* cordova-plugin-battery-status
* cordova-plugin-camera
* cordova-plugin-compat
* cordova-plugin-device
* cordova-plugin-file
* cordova-plugin-file-transfer
* cordova-plugin-ftp
* cordova-plugin-fullscreen
* cordova-plugin-media
* cordova-plugin-splashscreen
* cordova-plugin-whitelist
* cordova-plugin-zip

For locked full screen (Kiosk mode), install

* com.oddmouse.plugins.locktask
  
(Optional) Follow [this](https://github.com/oddmouse/cordova-plugin-locktask) instructions on how to create an admin receiver Java class. Name said Java receiver class as "MyAdmin"

Add splash screen of your choosing to the config.xml

```xml
<platform name="android">
    <splash density="land-hdpi" src="res/load_final.png" />
    <splash density="land-ldpi" src="res/load_final.png" />
    <splash density="land-mdpi" src="res/load_final.png" />
    <splash density="land-xhdpi" src="res/load_final.png" />
    <splash density="port-hdpi" src="res/load_final.png" />
    <splash density="port-ldpi" src="res/load_final.png" />
    <splash density="port-mdpi" src="res/load_final.png" />
    <splash density="port-xhdpi" src="res/load_final.png" />
    <allow-intent href="market:*" />
</platform>
```

Because each language package is rather large, a simple "cordova build" command will fail. In order to build an APK above 500MB, see section "Building: Large APK"

### Adding content: Console Map packet

* Create Pubbly console - [Pubbly Console](https://github.com/PubblyDevelopment/pubbly_console) section "Getting started"
* Create map nodes from Design Tools - [Pubbly Design Tools](https://github.com/PubblyDevelopment/pubbly_design_tools) section "Exports: Maps"
* Assemble map on Console - [Pubbly Console](https://github.com/PubblyDevelopment/pubbly_console) section "Assembling content: Mapping"
* Download map packet - [Pubbly Console](https://github.com/PubblyDevelopment/pubbly_console) section "Creating packets: Mapped Exports"

Create a new project and add the Android platform if you haven't already

If you ONLY want your application to be a console map packet, you're in luck. First, create and download a map from your console server. You can also build the Epic Quest map, a piece of our final Xprize submission, as it's own stand alone program.

* Find the map packet previously downloaded in your downloads folder
* Create a cordova boilerplate project (section "Adding content: Cordova boilerplate project")
* Empty the boilerplate's "www" folder
* Extract the targeted map to your now empty "www" folder

<pre>
.  
├── myProgram  
|   └── www
|       ├── pubbly_engine
|       ├── static-map_entrance
|       ├── variable-colorsOfTheRainbow
|       ├── index.html
|       └── ...
</pre>

Your Cordova project is now _that map_. To build regularly sized maps, see section "Building normal APK". For larger maps (500MB+), see section "Building large APK".

### Adding content: New program

What you're trying to do is very hard, and will take some work.

The Pubbly SchoolHouse is basically two parts: A light weight but messy front end, and a collection of Console created web packets. Initially, these two parts were to be separate entities, and you would be able to plug _any_ Console structure into a reactive front end with minimal modifications. As deadlines approached, the line between scripts that accessed the content, and the content itself, was blurred.

If you have already spent the necessary resources and time to design and build a brand new program from scratch, it is probably best to create a brand new front end to access that program. Web design isn't that hard, and once you link to a working Pubbly packet, that's the end of it.

If you liked our front end, the structure of it, the look and feel, it might be less work to use it as a jumping off point.

If you're dead set on plugging in newly structured content into the existing SchoolHouse front end, if you're absolutely sure that's what you want to do, roll up your sleeves.

Previously, the structure of the SchoolHouse Cordova project had to be determined from the Console itself. Each school was to have a grid based system, and each subject was to exist at a certain point in the grid. However, as the deadline approached, too many small changes were required, and so the application was half automated and half manually tweaked. The only way to add new content with a different structure (different NUMBER of levels/lessons, differently named/organized books in the bookshelf) is to use the existing English/Swahili web roots as a "jumping off point", i.e., through manual modification of the FS, the XML and even in some parts the JS.

The SchoolHouse application structure was developed specifically with our Xprize program in mind. There are a few limited ways to "tweak" it to accommodate new levels, new numbers of units in each level, new subjects, new subject placements in the UI, but if you're doing anything more complicated than not-very-complicated, it might be advisable to treat all Console generated packets as "content", and write your own front end to house it.

Since I can't know for sure what modified school structure you're attempting to squeeze in, these directions will be less steps and more guidelines.

The "school/Math" subject has a Subject/Level/Unit folder structure, as does the "school/Reading/Writing" subject. Both those subjects are described in "school/school.xml", which is loaded in JavaScript to create a the subject's respective pages. When a user creates a new account, a duplicate of the school.xml file is made specifically for that user. And as he finishes units in each subject, they are marked as "complete" and given a visual change.

If your school needs similarly structured level based subjects, you can make a new school.xml file to reflect the content in your file system. If you want subjects to be default "locked" or "unlocked", edit those values in the XML to fit. Any units not listed in the XML file will not be displayed in the subject specific page. The "row" and "col" values in the two subjects also effect their icon placement on screen.

Our Xprize submission has three other areas of content, two of which are listed in the xml. Tutorials (which are not subject or level related) and Books (which acted as a free form bookshelf). Both tutorials and books have hardcoded icon placement. The tutorials are at the top left, in a custom expand/collapse widget. And the bookshelf is behind the icon in the top right, which launches it's own non-tracked page (books.html).

If your school wants to keep these two "floating" content areas intact, feel free to replace their school.xml entries with your own.

The final "floating" subject, added in the final update of our Xprize submission, was the "Epic Quest". Epic Quest was a stand alone map packet. Unlike the Math and Reading subjects, it is not made up of Levels and Units that need to be visited sequentially, but instead interconnected map nodes, which all smartly link to each other. As such, it's representation in the school.xml is quite superficial. The regular functionality of clicking a subject is to refresh to "subject.html?NAME_OF_SUBJECT". However, the Epic Quest's click functionality was shamelessly hard coded in file js/viewSchool.js, line 382, to refresh to "school/Epic Quest/index.html". 

In retrospect, it would have been much easier to treat the APK as "structure only", and have each "pubbly package" download after the APK was installed on a tablet. Originally, we thought the Xprize end product, the deliverable, was to be _just_ an apk, and we therefore needed everything to be packaged together (for mass install without internet). Once we found out it was to be delivered as system image files, and once we figured out how to create system image files directly from a tablet, it was too late to restructure, and we just "made it work".

The process of "making it work" involved batch conversion from wav to ogg, and batch resizing of all images based on their XML height and width. It also involved moving all duplicate images (images in multiple packet asset folders (with different names), but essentially the same image 100 times over) to a shared asset folder.

... The way I did that was to write up a temporary Python script that renamed all images to an md5 hash of their image data, and copied (sometimes replaced) them into a shared asset folder. The script requires you to loop through XML and update the image name with the generated hash, then manually edit the JavaScript to look for image sources in a sharedAssets folder on load fail. This script actually worked, but due to multiple sequential build processes, my laptop overheated and died. The web root was saved, but the script was not, so you'll have to recreate.

## Building

Once you have either added our Xprize content folders, or created a new program of your own, it's time to build your project as an APK.

It should be noted, Cordova also builds to iOS, kindle, and your mothers toaster. We have not tested any of these options, however our Pubbly Engine does work on Safari on apple devices when hosted on remote servers, so it _may work just fine_, no promises.

### Building: Normal APK

* Open a command prompt or terminal window
* cd to your cordova directory (/home/USERNAME/projects/myProgram)
From your terminal/command prompt, execute the following
* cordova clean
* cordova build --verbose
> You can also use "cordova run", which will build and then ADB install on a connected tablet
* After the build finishes, check the platforms folder for your APK.
> A direct path to the APK is echoed into the terminal after a successful build.

If the build process fails, and mentions something about "Java heap space exhausted", the _size_ of the program is too large for the Java build scripts to keep in memory. You can temporarily increase java heap space from a terminal.

* SET _JAVA_OPTIONS="-Xmx500m"

If your cordova web root is excessively large, see section "Building large APK" (below)

### Building: Large APK

Cordova was not designed with larger APKs in mind. Our original Xprize submission was under 1GB, but it quickly grew enormous. While it is possible to build APKs of +4GB size with cordova, it does take patience, luck, a computer with at least 8GB of RAM and a lot of time. 

You can make small APKs with the Pubbly released tools. For instructions, see [Pubbly Console](https://github.com/PubblyDevelopment/pubbly_console) section "Creating packets: Mapped Exports".

> Clean the project
* cordova clean android
> Build from PowerShell
* cordova build android --verbose
> It will fail, after about 30 minutes per GB. Build again
* cordova build android --verbose
> Keep building from PowerShell until the failure takes less than 5 minutes.
> Run cmd.exe as admin, cd to the project, increase java heap size (to at least twice the size of the schoolHouse/www folder)
* SET _JAVA_OPTIONS="-Xmx4000m"
> Build again. 
* cordova build android --verbose
> It will also probably fail. After it does, open task manager, kill the java process with all the ram in it. Build a final time
* cordova build android --verbose

#### FYI

It might work, but from cmd.exe as admin only. The successful build process takes +30 minutes, with a long hang on "MergeDebugAssets". Although no one in their right mind would attempt to do this on a laptop, all Pubbly submissions were indeed built on my laptop. And if, for some horrific reason, you are also attempting to build a +4GB APK with cordova on a laptop yourself... Listen to a CPU fan slowdown mid MergeDebugAssets. If that happens, the build has failed, and you can exit the command (and save about an hour of your night). Although this may just be the ghosts in my personal machine, so grain of salt.

It is also possible to get successful incremental builds by gradually increasing the size of the web root folder of cordova 0.5-1GB at a time. First build with just script files. Then add 0.5-1GB of assets and build again. Repeat until entire submission is finished. For some reason, and I honestly can't imagine why, but for some reason this usually doesn't need to error out first. However, if you add too much too quickly, you have to start all over from a fresh build (cordova clean), no amount of rebuilds will "clear it out".

Once the build succeeds, you will have an APK in your platform folder.

### Installing APK on Google Pixel C

#### Installing APK: Fresh device

First, flash your desired Android operating system. Our submission was only tested with Android 7 NMF26H

* Find desired Pixel C OS from [developers.google.com](https://developers.google.com/android/images)
* Download and unzip images
* Install ADB and FastBoot on your machine
* Flash stock Android 7 ROM
> If fastboot is too old, you can manually extract and flash each image to it's partition with
    * sudo fastboot flash system system.img
> Reboot the device with
* sudo fastboot reboot
> Go through setup wizard. 
    * Setup as new device
    * Do not connect to internet
    * Set time to GMT+03:00 (Moscow)
    * Name is "CCI Xprize"
    * No unlock method
    * Turn all "Help out google" stuff off
    * All setup

#### Installing APK: Device preferences

> Cleanup homescreen
* Long drag each homescreen app to the trash
> Dismiss first time prompts
* Tap Google search bar at top of homescreen. "Close" Help build a better keyboard prompt.
* Go to 6 dots (bottom homescreen), and "Settings". From within settings...
* Screen lock -> None
> Xprize field tests posted regular analytic data to a local network FTP, so we set up regular Wifi autoconnected based on their specific credentials.
* Wifi -> Add Network -> Manually fill out WE WORK Wifi Credentials

    * SSID: XPRIZE
	* Security: none
	* Password: 
			
* Display 
    * Turn on Adaptive Brightness
    * Sleep after 10 minutes
    * When device is rotated: Stay in current orientation (landscape)
* Security -> Unknown Sources -> Allow
* Languages and Input -> Spell checker -> Off
* About tablet -> Tap build number 7 times for developer options
* Developer options -> Allow USB Debugging

#### Installing APK: ACTUALLY installing APK

* Connect Pixel C to computer
> If computer does not find Pixel C, download the entire Android studio to reinstall some USB drivers.
* Swipe down from top, change android "charge this device" to "transfer files"
* Allow USB debugging
* Transfer APK from computer to device
* On device, go to Files->Pixel C
* Launch SchoolHouse.apk
* Next next, install install, after installation choose "Done" NOT "Launch"
* Move SchoolHouse icon from 6 dots to homescreen top left.

#### Installing APK: Permissions

Because the application is teaching children who don't know how to read yet, it was imperative that children would not have to read a bunch of "permissions" requests from the tablet. This was not an issue in Android 6 as permissions are set during install, but a much needed upgrade to Android 7 added additional busy work for initial setup.

* Launch SchoolHouse from homescreen
* A prompt will say "Screen is pinned...", select "No thanks"
* In app, take a user profile pic and accept "Allow access to photos, files..." prompt
* Accept "Allow Camera to access device location" prompt
* Go to book shelf, middle book, Kwa Nini Viboko... (hippo book) or another book with a Record target
* Press record button and accept the "Allow SchoolHouse to record" prompt
* Use the square button to close the app
> All permissions have been accepted for new users.

#### Installing APK: Delete data you created to dismiss permissions.

* Go to Files->Pixel C
* Delete android_asset... (Recording from hippo book)
* Ensure Pixel C is connect to computer, and in file transfer mode, with debug enabled
* Relaunch SchoolHouse application
* Launch Chrome or Chromium from your connected computer, and start remote debugging the device
* Navigate to the "Log in" page, you should see a picture of your user account
* Open the JS console on your computer
* run...
* deleteFile("users.xml");
* With the bottom right "back" button, return to the launch page
* Return back to the login page, and double check that there are no user accounts on the device (delete worked)
> For non-debug APKs, you could also manually delete the users.xml file from an adb shell command, but we always used a debug APK.

#### Installing APK: (Optional) Force a locked Kiosk mode

To ensure the application automatically starts on launch, in a full screen un-quitable kiosk mode, 

* On computer, ensure adb is connected by issuing
	adb devices
	response -- {SerialNumber}    device
* Enter shell
	adb shell
	response -- dragon:/ $
* Set SchoolHouse as admin
	dpm set-device-owner com.cci.schoolHouse/.MyAdmin
	response -- Success: Something something, who cares, success...
* Square button on tablet, close all apps.
* Launch Pubbly from homescreen. Screen will pin.

You can remove the device owner as long as your ADB connection stays alive. As soon as you disconnect the cable, you will never be able to uninstall or even close the pubbly application. The only way to "reset" is to manually reboot to the bootloader (holding pow and vol-down keys on restart) and flash fresh images.

And if you somehow for some reason set-device-owner on a flashing locked tablet, you'd better like our submission, because your tablet won't do much else.

#### Installing APK: (Optional) DO NOT Force a locked Kiosk mode

If you do NOT want your build to be in Kiosk mode, change the file "schoolHouse/js/viewIndex.js" to reflect your preferences. If you want the application to autoStart and auto hide the bottom navigation buttons, use

```js
document.addEventListener("deviceready", function () {
    viewportFix();
    AndroidFullScreen.showSystemUI(function () {
        cordova.plugins.autoStart.enable();
        window.location.href = "welcome.html?firstLaunch";
    });
});
```

If you don't want autoStart or hidden navigation buttons, use

```js
document.addEventListener("deviceready", function () {
    viewportFix();
    window.location.href = "welcome.html?firstLaunch";
});
```

The tablet is now FULLY installed, and you can create TWRP system images

### Generating TWRP system images from installed Pixel

#### Generating images: 

* Reboot your tablet into fastboot mode
    * If adb is still connected, "adb reboot bootloader"
    * If not, manually reboot with "pow vol-down" hold
* Download [TWRP 3.0.2-23 dragon for Pixel C](https://androidfilehost.com/?fid=24727334850396245)
* Flash TWRP to recovery
* sudo fastboot flash recovery path/to/twrp.img
* sudo fastboot reboot
* Hold "pow vol-down" for bootloader
* Select "Android Recovery" (arrow down with volume buttons, confirm with power)
> Android recovery is actually TWRP recovery, cause flash
* Once TWRP has loaded, swipe right to allow modifications
* Choose "Backups"
* Check that ONLY the "Data" partition is selected
* Rename the stamp to whatever you want (I use a timestamp)
* Swipe right to back up
* Remove backup from device
    * cd ~/XprizeImage
    * adb pull /sdcard/TWRP/BACKUPS/serialno/NameOfBackup
    OR
    * Install working MTP drivers
    * Mount TWRP to local
    * Manually move backup from SD card to desired location

That folder of images is the entire Xprize submission.

## Deploying

The deploy process is equally complicated, and we wrote both Bash and Shell scripts to automate the headache. For more detailed instructions, checkout [Pubbly Submission Installation](https://github.com/PubblyDevelopment/pubbly_submission_installation)
