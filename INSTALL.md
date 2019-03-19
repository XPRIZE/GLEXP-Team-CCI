# CCI Installation Steps

1. Install cordova using following command in cmd.
   npm install -g cordova
2. Add android platform using following command
   cordova platform add android
3. Added plugins using following commands
   cordova plugin add https://github.com/oddmouse/cordova-plugin-locktask.git
   cordova plugin add https://github.com/ToniKorin/cordova-plugin-autostart.git
   cordova plugin add cordova-plugin-battery-status
   cordova plugin add cordova-plugin-camera
   cordova plugin add cordova-plugin-compat (deprecated as the functionalities it provide are already handled for Android 6.0.0)
   cordova plugin add cordova-plugin-device
   cordova plugin add cordova-plugin-file
   cordova plugin add cordova-plugin-file-transfer
   cordova plugin add cordova-plugin-ftp
   cordova plugin add cordova-plugin-fullscreen
   cordova plugin add cordova-plugin-media
   cordova plugin add cordova-plugin-splashscreen
   cordova plugin add cordova-plugin-whitelist
   cordova plugin add cordova-plugin-zip
Step 4: Added splash screen to config.xml file
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
Step 5: Add Java class for the locktask plugin by creating MyAdmin class inside CCIApp\platforms\android\app\src\main\java\com\example\CCIApp folder and added following lines to the class
    package com.example.CCIApp;
    import android.app.admin.DeviceAdminReceiver;
    public class MyAdmin extends DeviceAdminReceiver {
      // Some code here if you want but not necessary
    }
    Add following lines in the AndroidManifest.xml file
    <receiver android:label="@string/app_name" android:name="MyAdmin" android:permission="android.permission.BIND_DEVICE_ADMIN">
            <meta-data android:name="android.app.device_admin" android:resource="@xml/device_admin" />
            <intent-filter>
            <action android:name="android.app.action.DEVICE_ADMIN_ENABLED" />
            </intent-filter>
    </receiver>
    Create xml folder inside res folder and generated device_admin.xml file with following content
    <device-admin xmlns:android="http://schemas.android.com/apk/res/android">
        <uses-policies>
            <limit-password />
            <watch-login />
            <reset-password />
            <force-lock />
            <wipe-data />
            <expire-password />
            <encrypted-storage />
            <disable-camera />
            </uses-policies>
    </device-admin>
Step 6: Put EnglishWebRoot folder inside www folder
Step 7: Clean using ‘cordova clean android’ command
Step 8: Build the application from powershell using ‘cordova build android –verbose’ command


