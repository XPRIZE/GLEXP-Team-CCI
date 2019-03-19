# __Installation instructions for CCI project__
  ### 1. __Install cordova using following command in cmd.__
         npm install -g cordova
  ### 2. __Create a new cordova project using following command.__
         cordova create CCIApp com.example.cciapp CCIAPP
  ### 3. __Add android platform using following command__.
         cordova platform add android
  ### 4. __Add required plugins using following commands__.
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
  ### 5. __Add splash screen to config.xml file.__
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
  ### 6. __Set the path of cloned Flutter directory in the local.properties file of Maui projectAdd Java class for the locktask plugin by creating MyAdmin class inside CCIApp\platforms\android\app\src\main\java\com\example\CCIApp folder and added following lines to the class__
         package com.example.CCIApp;
         import android.app.admin.DeviceAdminReceiver;
         public class MyAdmin extends DeviceAdminReceiver {
            // Some code here if you want but not necessary
         }
  ### 7. __Add following lines in the AndroidManifest.xml file__
         <receiver android:label="@string/app_name" android:name="MyAdmin" android:permission="android.permission.BIND_DEVICE_ADMIN">
            <meta-data android:name="android.app.device_admin" android:resource="@xml/device_admin" />
            <intent-filter>
            <action android:name="android.app.action.DEVICE_ADMIN_ENABLED" />
            </intent-filter>
         </receiver>
  ### 8. __Create xml folder inside res folder and generated device_admin.xml file with following content__
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
  ### 9. __Paste the contents of EnglishWebRoot folder inside www folder.__
  ### 10. __Clean using following command.__
         cordova clean android
  ### 11. __Build the application from powershell using following command.__
         cordova build android –verbose

## __FAQ__
	1. Source path doesnot exist: res/load_final.png
	Solution: Place load_final.png into res/folder and rerun the build command.
	2. app:processDebugResources xml/camera_provider_paths.xml not found
	Solution: Place camera_provider_paths.xml file into the platforms\android\app\src\main\res\xml folder.
	3. Execution failed because of Java heap space 
	Solution: Increase the Java heap space using following command.
	SET _JAVA_OPTIONS="-Xmx4000m"
