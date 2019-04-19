@Echo off
Pushd "%~dp0"
cls

:: Main
if not exist Submissions goto preflightFail
SET submission="XprizeUpdate2"
set /P c=Are you installing Xprize second update? [Y/N]: 
if /I "%c%" EQU "Y" goto preflightChecks
if /I "%c%" EQU "N" goto chooseSubmission
EXIT /B %ERRORLEVEL%
:: End main

:chooseSubmission
	echo.
	echo.
	ls Submissions
	echo.
	echo ________________
	set /p submission="Please choose a submission to install from the list above: "
	if exist Submissions/%submission%/data.info (
		goto preflightChecks
	)	else	(
		echo "Error: %submission% does not appear to be a valid TWRP backup folder"
		goto chooseSubmission
	)
	exit

:preflightChecks
	if not exist Submissions/%submission%/data.info goto preflightFail
	if not exist AndroidSystemImages/image-ryu-nmf26h/boot.img goto preflightFail
	if not exist AndroidSystemImages/image-ryu-nmf26h/cache.img goto preflightFail
	if not exist AndroidSystemImages/image-ryu-nmf26h/recovery.img goto preflightFail
	if not exist AndroidSystemImages/image-ryu-nmf26h/system.img goto preflightFail
	if not exist AndroidSystemImages/image-ryu-nmf26h/vendor.img goto preflightFail
	if not exist TWRP/twrp-3.2.3-0-dragon.img goto preflightFail
	goto fullInstall
	exit

:preflightFail
    echo "Error: Required assets missing. Please ensure the following hirearechy at cwd"
	echo "├── Submissions
	echo "|   └── {A_CCI_XPRIZE_SUBMISSION}"
	echo "|       ├── data.ext4.win"
	echo "|       ├── data.ext4.win.sha2"
	echo "|       └── ... (more depending on size)"
	echo "├── AndroidSystemImages/"
	echo "|   └── image-ryu-nmf26h"
	echo "|       ├── boot.img"
	echo "|       ├── cache.img"
	echo "|       ├── recovery.img"
	echo "|       ├── vendor.img"
	echo "|       └── system.img"
	echo "├── TWRP  "
	echo "|   └── twrp-3.2.3-0-dragon.img  "
	echo "├── Install_Submission.bat  "
	echo "└── README.md  "
	exit

:fullInstall
	echo Installing, please connect an OEM unlocked Google Pixel C in fastboot mode.
	fastboot devices
	CALL :fastbootToTwrp
	CALL :twrpInstall
	fastboot devices
	CALL :flashStock
	fastboot reboot
	GOTO :anotherInstallPrompt
	exit

:flashStock
	fastboot flash recovery AndroidSystemImages/image-ryu-nmf26h/recovery.img
	fastboot flash cache AndroidSystemImages/image-ryu-nmf26h/cache.img
	fastboot flash vendor AndroidSystemImages/image-ryu-nmf26h/vendor.img
	fastboot flash boot AndroidSystemImages/image-ryu-nmf26h/boot.img
	fastboot flash system AndroidSystemImages/image-ryu-nmf26h/system.img
	fastboot flash recovery AndroidSystemImages/image-ryu-nmf26h/recovery.img
	GOTO:EOF

:fastbootToTwrp
	fastboot flash recovery TWRP/twrp-3.2.3-0-dragon.img
	fastboot boot TWRP/twrp-3.2.3-0-dragon.img
	echo Waiting for ADB, do not interrupt
	SLEEP 8
	adb reboot recovery
	echo Waiting for full TWRP launch. May take 1 minute, do not interrupt
	SLEEP 60
	adb devices
	GOTO:EOF
	
:twrpInstall
	echo pushing %submission%
	adb shell twrp backup D folderHack
	adb push Submissions/%submission% /sdcard/TWRP/BACKUPS/serialno/
	adb shell twrp restore %submission%
	adb reboot bootloader
	GOTO:EOF

:anotherInstallPrompt
	echo Xprize submission has been successfully installed, feel free to disconnect.
	echo 
	set /P c=Would you like to install on another tablet [Y/N]?
	if /I "%c%" EQU "Y" goto fullInstall
	if /I "%c%" EQU "N" goto bye

:bye
	pause










