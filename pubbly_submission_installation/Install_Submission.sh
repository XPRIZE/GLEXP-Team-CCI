#!/bin/bash
cd "$(dirname "$0")"

RED='\033[1;31m'
NC="\033[0m"

precheck=true

submissionName="XprizeUpdate2"
# CHECK IF XPRIZE FILES EXIST:
if [ ! -f "Submissions/${submissionName}/data.ext4.win" ]; then
    precheck=false
    echo "data.ext4.win is missing."
fi

if [ ! -f "Submissions/${submissionName}/data.ext4.win.sha2" ]; then
    precheck=false
    echo "data.ext4.win.sha2 is missing."
fi

if [ ! -f "Submissions/${submissionName}/data.info" ]; then
    precheck=false
    echo "data.info is missing."
fi

if [ ! -f "Submissions/${submissionName}/recovery.log" ]; then
    precheck=false
    echo "recovery.log is missing"
fi

continue=true
if [ ${precheck} = true ]; then
    while [ ${continue} = true ]
    do
        
        echo "Installing, please connect an OEM unlocked Google Pixel C in fastboot mode"
		# INSTALL MEAT HERE
		
        sudo fastboot devices
		sudo fastboot flash recovery TWRP/twrp-3.2.3-0-dragon.img
        sudo fastboot boot TWRP/twrp-3.2.3-0-dragon.img
        echo "Waiting for ADB, do not interrupt"
        sleep 8
        adb reboot recovery
        echo "Waiting for full TWRP launch, do not interrupt"
        sleep 60
        adb devices
        echo "pushing submission"
        adb shell twrp backup D folderHack
        adb push Submissions/XprizeUpdate2 /sdcard/TWRP/BACKUPS/serialno/
        adb shell twrp restore XprizeUpdate2
        adb reboot bootloader
        sudo fastboot devices
        sudo fastboot flash recovery AndroidSystemImages/image-ryu-nmf26h/recovery.img
        sudo fastboot flash cache AndroidSystemImages/image-ryu-nmf26h/cache.img
        sudo fastboot flash vendor AndroidSystemImages/image-ryu-nmf26h/vendor.img
        sudo fastboot flash boot AndroidSystemImages/image-ryu-nmf26h/boot.img
        sudo fastboot flash system AndroidSystemImages/image-ryu-nmf26h/system.img
        sudo fastboot reboot
        echo "Install finished, feel free to disconnect device."
        for i in 1 2 3
        do 
            tput bel
        done
        read -p "Install another device? [Y/N]: " confirm
        if [ ${confirm} = "Y" ] || [ ${confirm} = "y" ]; then
            continue=true
            break;
        else
            continue=false
            echo "DONE!" 
        fi
    done
else
    continue=false
    echo -e "${RED}ERROR: ${NC}"
    echo "Required assets missing. Please ensure the following hirearechy at cwd"
    echo "Error: Required assets missing. Please ensure the following hirearechy at cwd"
	echo "├── Submissions  "
	echo "|   └── ${submissionName}  "
	echo "|       ├── data.ext4.win  "
	echo "|       ├── data.ext4.win.sha2  "
	echo "|       └── ... (more depending on size)  "
	echo "├── AndroidSystemImages/  "
	echo "|   └── image-ryu-nmf26h  "
	echo "|       ├── boot.img  "
	echo "|       ├── cache.img  "
	echo "|       ├── recovery.img  "
	echo "|       ├── vendor.img  "
	echo "|       └── system.img  "
	echo "├── TWRP  "
	echo "|   └── twrp-3.2.3-0-dragon.img  "
	echo "├── Install_Submission.bat  "
	echo "└── README.md  "
fi