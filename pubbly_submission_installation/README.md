# CCI Xprize Pixel C install steps

Manual and automated installation options for CCI's Xprize entry.

## Requirements

### Hardware

* A google pixel C tablet
	* Tablet must have an [unlocked bootloader](https://source.android.com/setup/build/running) (Unlocking the bootloader)
	* Tablet must be connected in [fastboot mode](https://source.android.com/setup/build/running) (Booting into fastboot mode)
* A USB-C data cable
* And Windows, Mac or Linux machine to build from.

### Software

* Fastboot
* Android Debug Bridge

* Fastboot and Android Debug Bridge can be downloaded as part of the Android SDK or as standalone platform tools
	[Android SDK](https://developer.android.com/studio/)
	[Standalone Platform Tools](https://developer.android.com/studio/releases/platform-tools#download)

* Android 7.1.1 (NMF26H) for the Google Pixel C
	[7.1.1 NMF26H](https://developers.google.com/android/images)

* Team Windows Recovery Project for Dragon
	[twrp-3.2.3-0-dragon](https://dl.twrp.me/dragon/twrp-3.2.3-0-dragon.img.html)


* One of the three official CCI Xprize submissions
	[TODO: Open source submission here]()


### Paths

* Extract the Android 7.1.1 stock images  
<pre>
FROM ~/Downloads/ryu-nmf26h-factory-52ad10d8.zip/ryu-nmf26h/*  
TO   ./AndroidSystemImages/image-ryu-nmf26h/*  
</pre>

* Move TWRP image  
<pre>
FROM ~/Downloads/twrp-3.2.3-0-dragon.img  
TO   ./TWRP/twrp-3.2.3-0-dragon.img  
</pre>

* Move a CCI submission.  
<pre>
FROM ~/Downloads/{A_CCI_XPRIZE_SUBMISSION}/  
TO   ./Submissions/{A_CCI_XPRIZE_SUBMISSION}/  
</pre>

* Ensure that adb and fastboot are both executable from your terminal or command line path.
	* adb --version
	* fastboot --version
	- Should both return version numbers.
	
- NOTE, if you are running the .bat file from a Command Line (not powershell), ensure that cmd.exe was launched As Administrator. Fastboot commands with otherwise not work.

* Check your git for the following hierarchy

<pre>
.  
├── Submissions  
|   └── {A_CCI_XPRIZE_SUBMISSION}  
|       ├── data.ext4.win000  
|       ├── data.ext4.win000.md5  
|       ├── data.ext4.win001  
|       ├── data.ext4.win001.md5  
|       └── ... (more depending on size)  
├── AndroidSystemImages/  
|   └── image-ryu-nmf26h  
|       ├── boot.img  
|       ├── cache.img  
|       ├── recovery.img  
|       ├── vendor.img  
|       └── system.img  
├── TWRP  
|   └── twrp-3.2.3-0-dragon.img  
├── Install_Submission.bat  
├── Install_Submission_Manual.txt  
└── README.md  
</pre>

* You are now ready to install the submission.

## Installation

For automated installation, use the Install_Submission.bat file for Windows machines and the Install_Submission.sh file for Mac and Linux machines. The installation process is fully automated, and takes between 10-20 minutes. It will beep when finished, and you can connect another Pixel C (flashing unlocked, in fastboot mode) and repeat the process.

## Troubleshooting

If the installation fails for any reason, first attempt the manual instructions first. Each step has a command line response to look for. Here is a list of all the things that have at one point in time gone wrong

* Some USB-C cables do not transfer data. Buy a USDB-C data cable.
* Windows sometimes doesn't have USB drivers for the Pixel tablet. The driver can be downloaded from the [Android SDK manager](https://developer.android.com/studio/run/win-usb) and [installed manually](https://developer.android.com/studio/run/oem-usb#InstallingDriver)

* Bad EXT4 partition on Pixel C tablet: 
On some windows distributions, an ext2fs will be sent instead of the ext4fs. This causes TWRP to see a full partition, and it will have no extra space to download the submittal. To manually correct this, reset the partition file type from within TWRP.
	-> Select "Wipe"
	-> Select "Advanced Wipe"
	-> Check "data"
	-> Select "Repair or Change File System"
	-> Select "Change File System"
	-> Select "EXT2"
	-> Swipe "Swipe to Change"
	-> Wait until finish
	-> Select "EXT4"
	-> Swipe "Swipe to Change"
	-> Wait until finish
	-> Back out to TWRP home.
	-- Userdata partition has been reset, and you can now safely restore
You can also correct by flashing Android 7 NMF26H stock images from fastboot, then rebooting to the initial setup wizard.

## Notes

Why did we use TWRP? 

 -- Believe it or not, TWRP was the easiest way to take a full image of the userdata partition. As we were not making any system software modifications, but did require initial setup, permissions, and a DPM set device owner command. Android backup files did not save permissions, and making a userdata partition from only the APK did not save device admin.

Why the bat and sh scripts?

 -- This submission was designed to be installed on many tablets during the field test. We wanted the fasted and most error free way of accomplishing this.

## Author

* **Jason Horsley**

## License

This project has not been licensed yet, but will be open sourced at the end of the Global Learning Xprize contest.
