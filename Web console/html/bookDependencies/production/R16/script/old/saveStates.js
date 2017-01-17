// Save states here
function saveState(at) {
	if (book.useSaveStates) {		
		// Saving state loses constructor name... but we don't use this so whatevs.
		saveStates[at] = {};
		var toClone = [];
		toClone.push('clicks');
		toClone.push('drops');
		toClone.push('lineStarts');
		toClone.push('lineEnds');
		toClone.push('pageOpens');
		toClone.push('workspaces');
		toClone.push('workspaceKey');
		for (var c = 0; c < toClone.length; c++) {
			var attrName = toClone[c];
			saveStates[at][attrName] = JSON.parse(JSON.stringify(book[at][attrName]));
		}
		saveStates[at].points = book[at].points;
		saveStates[at].objs = {};
		for (var b = 0; b < book[at].objKey.length; b++) {
			var name = book[at].objKey[b];
			var obj = book[at].objs[name];
			if (!obj || obj.type == "highlighter") {
			} else if (obj.type == "drawing") {
				saveStates[at].objs[name] = {};
				saveStates[at].objs[name].type = "drawing";
				saveStates[at].objs[name].drawn = book[at].objs[name].drawn;
			} else {
				saveStates[at].objs[name] = JSON.parse(JSON.stringify(obj));
				saveStates[at].objs[name].elem = book[at].objs[name].elem;
				if ((obj.extension == "gif" || obj.isSequence) && obj.frames) {
					saveStates[at].objs[name].frames = [];
					for (var f = 0; f < obj.frames.length; f++) {
						saveStates[at].objs[name].frames[f] = book[at].objs[name].frames[f];
					}
				}
			}
		}
		if (showsequence) {
			console.log("State saved");
		}
	}
}
function loadState(at) {
	if (book.useSaveStates) {
		if (window.saveStates[at] != null && typeof window.saveStates[at] == "object") {
			var toClone = [];
			toClone.push('clicks');
			toClone.push('drops');
			toClone.push('lineStarts');
			toClone.push('lineEnds');
			toClone.push('pageOpens');
			toClone.push('workspaces');
			toClone.push('workspaceKey');
			for (var c = 0; c < toClone.length; c++) {
				var attrName = toClone[c];
				book[at][attrName] = JSON.parse(JSON.stringify(saveStates[at][attrName]));
			}
			book[at].points = saveStates[at].points;

			for (var b = 0; b < book[at].objKey.length; b++) {
				var name = book[at].objKey[b];
				var obj = saveStates[at].objs[name];
				if (!obj) {
					// Object not saved, therefore do not load. Probably a highlighter.
				} else if (obj.type == "drawing") {
					book[at].objs[name].drawn = saveStates[at].objs[name].drawn;
				} else {
					book[at].objs[name] = JSON.parse(JSON.stringify(obj));
					book[at].objs[name].elem = obj.elem;
					if ((obj.extension == "gif" || obj.isSequence) && obj.frames) {
						book[at].objs[name].frames = [];
						for (var f = 0; f < saveStates[at].objs[name].frames.length; f++) {
							book[at].objs[name].frames[f] = saveStates[at].objs[name].frames[f];
						}
					}
				}
			}
			// book[at].redraw();
		}
		if (showsequence) {
			console.log("State loaded");
		}	
	}
}