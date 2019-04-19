/*
Every book needs the drawing tools assets, and I didn't want to load them as base64 encoded strings or whatever,
so we're just taking the root to engine, which EVERY html build has swapped in, and loading them before first draw of _Pubbly

That plus a blackboard texture for fields that have that weird property we invented set
*/
class PubblyPresetAssets {
    add(asset) {
        this.list.push(asset);
    }

    constructor(rootToEngine) {
        this.list = [];
        this.loader = new AssetListLoader();
        this.load = this.loader.load.bind(this.loader, this.list);

        // Maybe just get rid of this thing entirely... preload assets in a no display field in the html
        this.add({type: "image", relPath: rootToEngine + "assets/texture_blackboard.png"});
        this.add({type: "image", relPath: rootToEngine + "assets/cursor_pencil.png"});
        this.add({type: "image", relPath: rootToEngine + "assets/cursor_chalk.png"});
        this.add({type: "image", relPath: rootToEngine + "assets/cursor_eraser.png"});
        this.add({type: "image", relPath: rootToEngine + "assets/cursor_pencil.png"});
        this.add({type: "image", relPath: rootToEngine + "assets/logo_fill_letters.png"});
        // not found?
//        this.add({type: "audio", relPath: rootToEngine + "assets/audio_blank.mp3"});
    }
}
