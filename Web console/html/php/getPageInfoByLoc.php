<?php
/**
 
 * User: Jason
 * Date: 8/26/2016
 * Time: 5:45 PM
 */

function getPageInfoByLoc($loc) {
    if ($loc) {
        if (file_exists($loc)) {
            $xml = simplexml_load_file($loc);
            $pageCount = count($xml->Pages->Page);
            $pageHeight = (string)$xml->Info->SinglePageHeight;
            $pageWidth = (string)$xml->Info->SinglePageWidth;
            $pageDisplay = (string)$xml->Info->PageDisplay;
                $ret = [];
                $ret[0] = [];
                $ret[0]["count"] = $pageCount;
                $ret[0]["width"] = $pageWidth;
                $ret[0]["height"] = $pageHeight;
                return $ret;
        }   else    {
            return "error: XML '$loc' not found";
        }
    }   else    {
        return "error: Only works for children of series or a fixed book";
    }
}
?>