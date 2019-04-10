/*
Needed for last minute work arounds...

Stitched books can have their interruptions disabled/enabled via the stick app toggle, but parent/child or straight exports to any other server have no such UI location
So instead of building a different UI for every possible deploy case, I stuck this in...

Flow goes

HTML echoed with swapped variables from PHP or whatever server side language you like
XML location (or string) sent to the _Build entrance point.
XML converted to JSON from xmlToJson js scripts
JSON sent back to _Build entrance to be directly pumpted into _Pubbly entrance or rerouted to the AJAX build thing

BUT BEFORE IT'S BUILT, authors get ONE LAST CHANCE to make any small touchups. Such as

Change the name
Toggle navigation disabled/enabled
Toggle interruptions disabled/enabled
... maybe other stuff later on

THat's this.
*/
class hotfixUI {
    buildWebix(missingAssets) {
        webix.ui({
            container: "preflight_load_cont", css:"hotfixUI",
            rows:[
                { view:"template", type:"header", template:"Author hotfix UI", css:"centerAlign biggerText"},
                { view: "template", template: "<hr>", height:20},
                {cols: [
                    {view: "toggle", id: "wc_interruptions", 
                        value:this.json.info.interrupt, type: "iconButton",
                        onLabel: "Interruptions allowed", offLabel: "Interruptions disallowed",
                        on:{onChange: function() {
                            this.json.info.interrupt = Boolean($$("wc_interruptions").getValue());
                        }.bind(this)}},
                    {view: "toggle", id: "wc_navigation",
                        value:this.json.info.navigation, type: "iconButton",
                        onLabel: "Navigation allowed", offLabel: "Navigation disallowed",
                        on:{onChange: function() {
                            this.json.info.navigation = Boolean($$("wc_navigation").getValue());
                        }.bind(this)}},
                ]},
                {view: "form", elements: [
                    { view: "text", label: "Display name: ", id: "displayName",
                        value: this.json.info.name, labelWidth: 100, 
                        validate:webix.rules.isNotEmpty,
                    },
                ], elementsConfig: {on:{onChange: function() {
                    let name = $$("displayName").getValue();
                    // if (/^[a-zA-Z0-9() !?,:]+$/.test(name) || true) {
                    if (name !== "") {
                        // YES you can change a display name and then SAVE without fake setting assets to blank... who cares.
                        $$("wc_done").enable();
                        this.json.info.name = name;
                    }   else    {
                        $$("wc_done").disable();
                        webix.message("Display names can only have letters, numbers, and chars !?,:", "error");
                    }
                }.bind(this)}}},
                {view: "label", id: "wc_no_missing_assets", hidden: "true",
                    label: "No missing assets!", align: "center"},
                {id: "wc_assets_container", rows: [
                    {view: "label", label: "Book is missing the following assets: ", align: "center"},
                    {view: "list", id: "wc_missing_assets", height: 105,
                        label: "Missing images", css: "missingAsset",
                        data: missingAssets,
                    },
                    {cols:[
                        {},
                        {view: "button", id: "wc_set_missing_to_blank",
                            value: "Set all missing assets to blanks", on:{
                                onItemClick:function() {
                                    $$("wc_set_missing_to_blank").disable();
                                    $$("wc_done").enable();
                                    webix.html.addCss($$("wc_missing_assets").getNode(),"ignored");
                                    for (let id in $$("wc_missing_assets").data.pull) {
                                        let item = $$("wc_missing_assets").data.pull[id].value;
                                        let newStr = item.split(":")[0] + ": Blank";
                                        $$("wc_missing_assets").data.pull[id].value = newStr;
                                    }
                                    $$("wc_missing_assets").refresh();
                                }
                            }},
                        {},
                    ]},
                ]},
                {},
                {cols: [
                    {},
                    {},
                    { view: "button", id: "wc_done", disabled:true,
                        type: "submit", value: "Save pubbly changes", on:{
                            onItemClick: function() {
                                this.cbs.done(this.json);
                            }.bind(this)
                        }}
                ]},
            ]
        });
        if (missingAssets.length) {
        }   else    {
            $$("wc_done").enable();
            $$("wc_assets_container").hide();
            $$("wc_no_missing_assets").show();
        }
    }
    constructor(json, cbs) {
        this.cbs = assignDefaultCallbacks(cbs);
        let missingImages = [];
        let missingVideos = [];
        let missingAudio = [];
        json.pages.map(page => {
            page.objs.map(obj => {
                if (obj.missing && missingImages.indexOf(obj.name) === -1) {
                    if (obj.type === "image") {
                        missingImages.push(obj.name);
                    }   else if (obj.type === "video") {
                        missingVideos.push(obj.name);
                    }
                }
            });
            page.auds.map(aud => {
                if (aud.missing && missingAudio.indexOf(aud.fName) === -1) {
                    missingAudio.push(aud.fName);
                }
            });
        });
        let missingAssets = [];
        missingImages.map((img, i) => {
            missingAssets.push({"id": i, "value": "Image: " + img});
        });
        missingVideos.map((vid, i) => {
            missingAssets.push({
                "id": i + + missingImages.length,
                "value": "Video: " + vid});
        });
        missingAudio.map((aud, i) => {
            missingAssets.push({
                "id": i + missingImages.length + missingVideos.length,
                "value": "Audio: " + aud});
        });
        this.json = json;
        this.buildWebix(missingAssets);
    }
}
