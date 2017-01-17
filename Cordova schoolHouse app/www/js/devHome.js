/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


document.addEventListener("deviceready", function () {
    // clearCache(); // not working... maybe just fuck it then.
    readFile("skip", function (ret) {
	ret = true;
	if (ret) {
	    window.location.href = "login.html";
	} else {
	    webix.ui({
		rows: [
		    {template: "" +
			  "<h2>School House Development Homepage</h2>",
			height: 75,
		    },
		    {},
		    {cols: [
			    {},
			    {view: "button", value: "Prep for deployment", height: 200, width: 200, css: "", on: {
				    onItemClick: function () {
					webix.confirm("This will remove the developer home page. The only way to reset is by redownloading the app. Are you sure you want to do this?", function (confirmation) {
					    if (confirmation) {
						createFile("skip", function () {
						    writeFile("skip", "1", function () {
							ClearDirectory("users", function () {
							    deleteFile("users.xml", function () {
								deleteFile("firstLaunch.txt", function () {
								    webix.message("quit this app, it's ready.");
								});
							    });
							});
						    });
						});
					    }
					});
				    }
				}},
			    {},

			    {view: "button", value: "Test book", height: 200, width: 200, on: {
				    onItemClick: function () {
					window.location.href = "school/book/index.html";
				    }
				},
			    },
			    {},
			]
		    },
		    {},
		    {
			cols: [
			    {},
			    {view: "button", id: "schoolUpdate", value: "Download school", height: 200, width: 200, css: "", on: {
				    onItemClick: function () {
					$$("selectSchoolDownload").show();
					$$("downloadSchoolFull").disable();
					$$("downloadSchoolPartial").disable();

				    }
				}},
			    {},
			    {view: "button", id: "appUpdate", value: "Download app", height: 200, width: 200, css: "", on: {
				    onItemClick: function () {
					openURL("http://54.210.118.224/Downloads/App/android-debug.apk");
				    }
				}},
			    {},
			]
		    },
		    {},
		    {
			cols: [
			    {},
			    {view: "button", value: "Delete user data", height: 200, width: 200, css: "", on: {
				    onItemClick: function () {
					ClearDirectory("users", function () {
					    deleteFile("users.xml", function () {
						deleteFile("firstLaunch.txt", function () {
						    webix.message("All done");
						});
					    });
					});
				    }
				},
			    },
			    {},
			    {view: "button", id: "schoolPreview", value: "Preview school", height: 200, width: 200, css: "", disable: false, on: {
				    onItemClick: function () {
					window.location.href = "login.html";
				    }
				},
			    },
			    {},
			]
		    },
		    {},
		    {template: "" +
			  "<p id=deviceLog>...</p>",
			height: 75,
		    },
		]
	    });

	    $("#deviceLog").html("" +
	      "Device: " + device.cordova + " - " +
	      "Model:  " + device.model + " - " +
	      "Platform " + device.platform + " - " +
	      "UUID: " + device.uuid + " - " +
	      "Version:  " + device.version +
	      "");

	    function checkAppVersion() {
		$.ajax({
		    type: "GET",
		    url: encodeURI("http://54.210.118.224/Downloads/App/version?" + Math.random()),
		    dataType: "text",
		    success: function (doc) {
			var webVersion = parseFloat(doc);
			if (window.appVersion < webVersion) {
			    $$("appUpdate").define("value", "App is outdated! Click to download new copy");
			    $$("appUpdate").refresh();
			} else {
			    $$("appUpdate").define("value", "Download app");
			    $$("appUpdate").refresh();
			}
		    },
		    error: function () {
			console.error("Error: Cannot check for app updates");
		    }
		});
	    }

	    $.ajax({
		type: "GET",
		url: encodeURI("http://52.21.126.241/schools/getSchools.php"),
		dataType: "text",
		success: function (ret) {
		    window.availableSchools = window.eval(ret);
		    var downloadOptions = ["-- Choose --"];
		    for (var s = 0; s < window.availableSchools.length; s++) {
			var name = window.availableSchools[s].name;
			var size = window.availableSchools[s].size;
			var sizeMB = Math.max(1, Math.ceil(size / 1000000));
			downloadOptions.push(name + ": " + sizeMB + "mb");
		    }
		    $$("selectSchoolDropdownChooser").data.options = downloadOptions;
		    $$("selectSchoolDropdownChooser").refresh();
		},
		error: function () {
		    console.error("Error: Cannot check for school updates");
		}
	    });

	    function checkSchoolVersion() {
		$.ajax({
		    type: "GET",
		    url: schoolLoc + "/school.xml?" + Math.random(),
		    dataType: "xml",
		    success: function (xml) {
			$.ajax({
			    type: "GET",
			    url: encodeURI("http://52.21.126.241/schools/getSchools.php"),
			    dataType: "text",
			    success: function (ret) {
				$$("schoolPreview").enable();
				window.availableSchools = window.eval(ret);
				var webVersion = false, localVersion = false;
				for (var r = 0; r < window.availableSchools.length; r++) {
				    if (window.availableSchools[r].name == xml.getElementsByTagName("name")[0].innerHTML) {
					webVersion = parseFloat(window.availableSchools[r].version);
					if (xml.getElementsByTagName("version")[0]) {
					    localVersion = parseFloat(xml.getElementsByTagName("version")[0].innerHTML);
					} else {
					    localVersion = 0;
					}

				    }
				}
				if (webVersion) {
				    if (localVersion < webVersion) {
					$$("schoolUpdate").define("value", "Download school");
					$$("schoolUpdate").refresh();
				    } else {
					$$("schoolUpdate").define("value", "Download school");
					$$("schoolUpdate").refresh();
				    }
				} else {
				    $$("schoolUpdate").define("value", "Download school");
				    $$("schoolUpdate").refresh();
				}

				var downloadOptions = ["-- Choose --"];
				for (var s = 0; s < window.availableSchools.length; s++) {
				    var name = window.availableSchools[s].name;
				    var size = window.availableSchools[s].size;
				    var sizeMB = Math.max(1, Math.ceil(size / 1000000));
				    downloadOptions.push(name + ": " + sizeMB + "mb");
				}
				$$("selectSchoolDropdownChooser").data.options = downloadOptions;
				$$("selectSchoolDropdownChooser").refresh();
			    },
			    error: function () {
				console.error("Error: Cannot check for school updates");
			    }
			});
		    },
		    error: function () {
			// $$("schoolPreview").disable();
			// No school downloaded yet
			$$("schoolUpdate").define("value", "Download school.");
			$$("schoolUpdate").refresh();

		    }
		});
	    }
	    webix.ui({
		view: "window",
		id: "selectSchoolDownload",
		head: {
		    view: "toolbar", margin: -4, cols: [
			{view: "label", label: "Download school"},
			{view: "icon", icon: "times-circle", css: "alter",
			    click: "$$('selectSchoolDownload').hide();"}
		    ]
		},
		position: "center",
		body: {
		    cols: [
			{view: "select", id: "selectSchoolDropdownChooser", value: "-- Choose --", options: [], on: {onChange: function (newV) {
				    window.schoolName = newV.split(": ")[0];
				    for (var s = 0; s < window.availableSchools.length; s++) {
					if (window.availableSchools[s].name == newV.split(": ")[0]) {
					    window.schoolSize = window.availableSchools[s].size;
					}
				    }
				    if (newV == "-- Choose --") {
					$$("downloadSchoolFull").disable();
					$$("downloadSchoolPartial").disable();
				    } else {
					$$("downloadSchoolFull").enable();
					$$("downloadSchoolPartial").enable();
				    }

				}}},
			{view: "button", id: "downloadSchoolFull", value: "Full", disable: true, on: {onItemClick: function () {
				    downloadSchool("full");
				}
			    }
			},
			{view: "button", id: "downloadSchoolPartial", value: "Partial", disable: true, on: {onItemClick: function () {
				    downloadSchool("partial");
				}
			    }
			},
		    ]
		}
	    });
	    function downloadSchool(type) {
		// console.log("clearing users");
		if (device.platform == "browser") {
		    startDownload(schoolName, schoolSize, type);
		} else {
		    ClearDirectory("users", function () {
			// console.log("deleting user.xml");
			deleteFile("users.xml", function () {
			    // console.log("clearing school");
			    ClearDirectory("school", function () {
				// console.log("starting download of " + schoolName);
				startDownload(schoolName, schoolSize, type);
			    });
			});
		    });
		}
	    }
	    checkAppVersion();
	    checkSchoolVersion();
	}
    });
}, false);
/*
 readFile("prefs.xml", function (xml) {
 if (xml === false) {
 createFile("prefs.xml", function () {
 writeFile("prefs.xml", "<prefs><downloadType>partial</downloadType></prefs>", function () {
 $$("toggleDownloadType").define("value", "Download school structure, ");
 $$("toggleDownloadType").refresh();
 });
 });
 } else {
 parseXML(xml);
 }
 });

 */
