/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


document.addEventListener("deviceready", function () {
    window.QuickCamera = function (folder, fileName, callback) {
        var THIS = this;

        this.snap = function (folder, fileName, callback) {
            THIS.folder = folder; // MyAppFolder
            THIS.fileName = fileName; // pic
            THIS.callback = callback;
            capturePhoto();
        }

        // A button will call this function
        function capturePhoto() {
            sessionStorage.removeItem('imagepath');
            // Take picture using device camera and retrieve image as base64-encoded string
            navigator.camera.getPicture(onPhotoDataSuccess, onFail, {quality: 50, destinationType: Camera.DestinationType.FILE_URI, cameraDirection: 1});
            // Github says "Any cameraDirection value results in a back-facing photo". So fuck.
        }

        function onPhotoDataSuccess(imageURI) {
            // console.log("got URI");
            // Uncomment to view the base64 encoded image data
            // console.log(imageData);

            // Get image handle
            //
            // var imgProfile = document.getElementById('imgProfile');

            // Show the captured photo
            // The inline CSS rules are used to resize the image
            //
            // imgProfile.src = imageURI;
            if (sessionStorage.isprofileimage == 1) {
                getLocation();
            }
            movePic(imageURI);
        }

        // Called if something bad happens.
        function onFail(message) {
            // use default bunny pic
            //
            // DOESN'T WORK, because something something fucked up with the user.xml
            // THIS.callback("default");
        }

        function movePic(file) {
            window.resolveLocalFileSystemURI(file, resolveOnSuccess, resOnError);
        }

        //Callback function when the file system uri has been resolved
        function resolveOnSuccess(entry) {
            //new file name
            var newFileName = THIS.fileName + ".jpg";
            var myFolderApp = THIS.folder;
            // console.log("requesting FS");
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSys) {
                // console.log("request granted");
                //The folder is created if doesn't exist
                fileSys.root.getDirectory(myFolderApp,
                  {create: true, exclusive: false},
                  function (directory) {
                      entry.moveTo(directory, newFileName, successMove, resOnError);
                  },
                  resOnError);
            },
              resOnError);
        }

        //Callback function when the file has been moved successfully - inserting the complete path
        function successMove(entry) {
            // console.log("good move");
            //Store imagepath in session for future use
            // like to store it in database
            sessionStorage.setItem('imagepath', entry.fullPath);
            // document.getElementById("imgProfile").setAttribute("src", entry.nativeURL);
            THIS.callback(entry.nativeURL);
        }

        function resOnError(error) {
            // alert(error.code);
        }

    };
});
