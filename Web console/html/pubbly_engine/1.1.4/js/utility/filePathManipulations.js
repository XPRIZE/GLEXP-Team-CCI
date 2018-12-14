/*
 Naming conventions...
 
 General term for all these dang examples?? PATH
 
 Describes left end
 ABSOLUTE    >> first /     to      ????
 RELATIVE    >> cwd()       to      ????
 
 Describes right end
 BASE        >> ????        to      cwd()
 DIRECTORY   >> ????        to      Last folder
 PATH        >> ????        to      EOF
 
 ABSOLUTE BASE - baseFolder
 /var/www/html(WE_ARE_HERE)
 
 ABSOLUTE DIRECTORY - absFolder
 /var/www/html(WE_ARE_HERE)/assets/logos
 
 ABSOLUTE PATH - absPath
 /var/www/html(WE_ARE_HERE)/assets/logos/file.ext
 
 RELATIVE BASE - cwd
 html(WE_ARE_HERE)
 
 RELATIVE DIRECTORY - relDir
 assets/logos
 
 RELATIVE PATH - relPath
 assets/logos/file.ext
 
 ---
 

 DIRECTORY SOURCE - dSrc
 logos/file.ext

 DIRECTORY NAME - dName
 logos
 
 FILE SOURCE - fSrc
 file.ext
 
 FILE NAME - fName
 file
 
 EXTENSION - ext
 ext
 */
function changeExtFromPath(path, changeTo) {
    // path     >> ???/???/file.nope.ext
    // changeTo >> png
    // return   >> ???/???/file.nope.png
    let tmp = path.split(".") // ['???/???/file', 'nope', 'ext']
    tmp.splice(tmp.length - 1, 1, changeTo); // ['???/???/file', 'nope', 'png']
    return tmp.join("."); // ???/???/file.nope.png
}

function getFileSourceFromPath(path) {
    // path     >> ???/???/file.nope.ext
    // return   >> file.nope.ext
    let fileSource = path.split("/").pop(); // file.nope.ext
    return fileSource;
}
function getExtFromPath(path) {
    // path     >> ???/???/file.nope.ext
    // return   >> file.nope.ext
    let fileName = path.split("/").pop(); // file.nope.ext
    let tmp = fileName.split("."); // ['file', 'nope', 'ext']
    return tmp.pop(); // 'ext'
}
function getFileNameFromPath(path) {
    // path     >> ???/???/file.nope.ext
    // return   >> file.nope
    let fileSource = path.split("/").pop(); // file.nope.ext
    let tmp1 = fileSource.split("."); // ['file', 'nope', 'ext']
    tmp1.pop(); // ['file', 'nope']
    let fileName = tmp1.join(".");
    return fileName;
}

// TODO: More as needed
// TODO: / and \ paths splits