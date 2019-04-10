<?php
/**
 * Created by PhpStorm.
 * User: Jason
 * Date: 10/22/2016
 * Time: 1:14 PM
 */

function saveXML($node, $name)
{
    // blank lines
    $str = file_get_contents($name);
    $str = preg_replace("/(^[\r\n]*|[\r\n]+)[\s\t]*[\r\n]+/", "\n", $str);
    file_put_contents($name, $str);
    // Pretty print the xml.
    $domxml = new DOMDocument('1.0');
    $domxml->preserveWhiteSpace = false;
    $domxml->formatOutput = true;
    $domxml->loadXML($node->asXML());
    $domxml->save($name);
}

?>