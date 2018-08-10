<?php
/**
 
 * User: Jason
 * Date: 10/21/2016
 * Time: 3:39 PM
 */
function splitGif($dir, $src)
{
    if (!file_exists($dir . "/gifFrames")) {
        mkdir($dir . "/gifFrames");
        chmod($dir . "/gifFrames", 0777);
    }
    $shellStr = 'convert -coalesce -limit memory 2MB "' .
        $dir . "/" . $src . '.gif" "' . $dir . '/gifFrames/' . $src . '-frame.png"';
    shell_exec($shellStr);
    $curFrame = -1;
    do {
        $curFrame++;
        $checkName = $dir . "/gifFrames/$src-frame-$curFrame.png";
    } while (file_exists($checkName));
    $gifLength = $curFrame;

    if (!file_exists($dir . "/gifFrames/gifInfo.xml")) {
        file_put_contents($dir . "/gifFrames/gifInfo.xml", "<gifs></gifs>");
    }
    $gifs = simplexml_load_file($dir . "/gifFrames/gifInfo.xml");
    $gifFound = false;
    foreach ($gifs->children() as $gif) {
        if ((string)$gif->name == $src) {
            $gifFound = true;
            $gif->length = $gifLength;
        }
    }
    if (!$gifFound) {
        $gif = $gifs->addChild("gif");
        $gif->name = $src;
        $gif->length = $gifLength;
    }
    saveXML($gifs, $dir . "/gifFrames/gifInfo.xml");

    // fuck it, xml to js, lets do this

    $jsStr = "window.gifInfo = {";
    $gifs = simplexml_load_file($dir . "/gifFrames/gifInfo.xml");
    foreach ($gifs->children() as $gif) {
        $n = (string)$gif->name;
        $l = (string)$gif->length;
        $jsStr = $jsStr . "'$n': {'length':'$l'},";
    }
    $jsStr = $jsStr . "};";
    file_put_contents($dir . "/gifFrames/gifInfo.js", $jsStr);
}
