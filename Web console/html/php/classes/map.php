<?php

class Map {

    public $info = [];
    public $units = [];
    private $sql = false;

    public function saveJson($json) {
        
    }

    private function getID() {
        $this->info['id'] = $this->sql->fetchArray("SELECT mp.map_id FROM map WHERE name = ?", ["s", $mapName]);
    }

    private function getJson() {
        $nodePathMap = $this->sql->fetchArray("
SELECT
    mp.map_id,
    mp.name AS mapName,
    mn.map_node_id AS map_node_id,
    mn.name AS nodeName,
    mn.has_cover AS hasCover,
    np.from_node_id AS from_node_id,
    fn.name AS from_node_name,
    np.from_link_name AS from_link_name,
    np.from_link_page AS from_link_page,
    np.to_node_id AS to_node_id,
    tn.name AS to_node_name
FROM
    map mp
RIGHT JOIN map_node mn ON
    mp.map_id = mn.map_id
RIGHT JOIN map_node_path np ON
    mn.map_node_id = np.from_node_id
LEFT JOIN map_node fn ON 
    np.from_node_id = fn.map_node_id
LEFT JOIN map_node tn ON 
    np.to_node_id = tn.map_node_id
WHERE
    mp.name = ?", ["s", $this->name]);
        // pprint_r($nodePathMap);
        $map = [];
        $baseCoverSrc = "map/" . $this->name;
        for ($i =  0; $i < count($nodePathMap); $i++) {
            $node = $nodePathMap[$i];
            $nodeName = $node['nodeName'];
            if (!isset($map[$nodeName])) {
                
                $cover = ($node['hasCover']) ? 
                        "$baseCoverSrc/$nodeName/cover.png" : 
                        false;
                $map[$nodeName] = [
                    "node_id" => $node['map_node_id'],
                    "name" => $nodeName,
                    "cover" => $cover,
                    "links" => []
                ];
            }
            $toLinkName = (isset($node['to_node_name'])) ? 
                    $node['to_node_name'] : false;
            $fromLinkPage = $node['from_link_page'] + 1;
            $link = [
                "name" => $node['from_node_name'],
                "page" => $fromLinkPage,
                "url" => $toLinkName
            ];
            array_push($map[$node['nodeName']]['links'], $link);
        }
        return json_encode($map);
    }

    /* ---------------------------------------------------------------------- */

    function __construct($mapName) {
        $this->sql = new Mysql_query();

        $this->name = $mapName;
        $this->mapID = $this->sql->fetchSingle("SELECT map_id FROM map WHERE name = ?", ["s", $mapName]);

        $this->json = $this->getJson();
    }

}
