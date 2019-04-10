class PubblyPresetAssets {
	add(asset) {
		let already = this.list.find(a => a.src === asset.src);
		if (!already) {
			this.list.push(asset);
		}
	}

	constructor(enginePathPrefix) {
		this.list = [];
		this.loader = new AssetListLoader();
		this.load = this.loader.load.bind(this.loader, this.list);

		this.enginePathPrefix = (enginePathPrefix) ? enginePathPrefix : "";

		this.add({type: "image", relPath: this.enginePathPrefix + "pubbly_engine/shared/textures/blackBoardBG.png"});
		this.add({type: "image", relPath: this.enginePathPrefix + "pubbly_engine/shared/cursors/pencil.png"});
		this.add({type: "image", relPath: this.enginePathPrefix + "pubbly_engine/shared/cursors/chalk.png"});
		this.add({type: "image", relPath: this.enginePathPrefix + "pubbly_engine/shared/cursors/eraser.png"});
		this.add({type: "image", relPath: this.enginePathPrefix + "pubbly_engine/shared/cursors/pen.png"});
		this.add({type: "image", relPath: this.enginePathPrefix + "pubbly_engine/shared/logos/logoEmptyColors.png"});
		this.add({type: "audio", relPath: this.enginePathPrefix + "pubbly_engine/shared/audio/blank.mp3"});
	}
}
