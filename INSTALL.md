# __Installation instructions for CCI project__
  ### 1. __Install cordova using following command in cmd.__
         npm install -g cordova
  ### 2. __Add android platform using following command__.
         cordova platform add android
  ### 3. __Add required plugins using following commands__.
         i.    cordova plugin add https://github.com/oddmouse/cordova-plugin-locktask.git
         ii.   cordova plugin add https://github.com/ToniKorin/cordova-plugin-autostart.git
         iii.  cordova plugin add cordova-plugin-battery-status
         iv.   cordova plugin add cordova-plugin-camera
         v.    cordova plugin add cordova-plugin-compat (deprecated as the functionalities it provide are already handled for Android 6.0.0)
         vi.   cordova plugin add cordova-plugin-device
         vii.  cordova plugin add cordova-plugin-file
         viii. cordova plugin add cordova-plugin-file-transfer
         ix.   cordova plugin add cordova-plugin-ftp
         x.    cordova plugin add cordova-plugin-fullscreen
         xi.   cordova plugin add cordova-plugin-media
         xii.  cordova plugin add cordova-plugin-splashscreen
         xii.  cordova plugin add cordova-plugin-whitelist
         xiii. cordova plugin add cordova-plugin-zip
  ### 4. __Add splash screen to config.xml file.__
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
  ### 5. __Set the path of cloned Flutter directory in the local.properties file of Maui projectAdd Java class for the locktask plugin by creating MyAdmin class inside CCIApp\platforms\android\app\src\main\java\com\example\CCIApp folder and added following lines to the class__
         package com.example.CCIApp;
         import android.app.admin.DeviceAdminReceiver;
         public class MyAdmin extends DeviceAdminReceiver {
            // Some code here if you want but not necessary
         }
  ### 6. __Add following lines in the AndroidManifest.xml file__
         <receiver android:label="@string/app_name" android:name="MyAdmin" android:permission="android.permission.BIND_DEVICE_ADMIN">
            <meta-data android:name="android.app.device_admin" android:resource="@xml/device_admin" />
            <intent-filter>
            <action android:name="android.app.action.DEVICE_ADMIN_ENABLED" />
            </intent-filter>
         </receiver>
  ### 7. __Create xml folder inside res folder and generated device_admin.xml file with following content__
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
  ### 8. __Put EnglishWebRoot folder inside www folder.__
  ### 9. __Clean using following command.__
         cordova clean android
  ### 10. __Build the application from powershell using following command.__
         cordova build android –verbose

## __FAQ__
	1. "Not a git repository" error while executing git packages get command in any one of the repositories
	Solution: Delete C:\Users\USERNAME\AppData\Roaming\Pub\Cache\git\cache folder and rerun the above command
	2. Plugin import dependency error in the any of the repositories
	Solution:
	  i. Create a lib folder in parent directory of the concerned project repository
	 ii. Copy flutter.jar file from the _FLUTTER_SDK_ROOT_DIR_\bin\cache\artifacts\engine\android-arm folder into lib folder
	iii. From Android Studio right click the newly added jar file and then select "Add as library"
