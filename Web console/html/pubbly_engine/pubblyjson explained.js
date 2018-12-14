// This is a pubbly book, as described in JSON format.
{
	// Information about the book that applies to each page. Globals
    "info": {
		// Displayed at the top left
        "name": "Backyard Bugs",
		// Height of a single page
        "height": 600,
		// Width of a single page
        "width": 600,
		/* [Single, Double (not supported), Composite]
		 * Single: 
		 * 		Viewing area is 1X a single page's width (600px). 
		 * 		Turns slide the current page off screen (left/right -> next/previous), and the turn targeted page on screen.
		 * Composite: 
		 *		Viewing area is twice a single page's width (1200px). 
		 * 		Turns: 
		 *			Front cover to spread: Cover slides to right hand side (left:600), then the spread doubles over on itself in front of the cover page
		 * 			Spread to spread: TODO: FINISH THIS
		 */
		
		
        "display": "composite",
		// Color of square bullet (associated with book category)
        "bullet": "#8867AC",
		// Whether or not the pubbly's sequences can be interupted by user interaction (clicking, dragging)
        "interrupt": false,
		// Whether or not the page's state is to be reset to last safe state on user interruption
        "saveStates": false,
		// Whether or not the user is allowed to manually turn the page
        "navigation": true,
		// Whether dropped objects move towards the center of the dropped link, or stay in their dropped location on drop accept
        "snapDrops": true,
		// Whether or not the last page of a composite book is a cover or spread
		"lastPageSpread": true
    },
	// Array of pages in book
    "pages": [
        {
			// Points are page/book specific numeric values.
			// They can be increased/decreased/set through sequencing
			// They can be compared at a sequence's end and trigger new sequences if the comparisons match
            "points": {
				// List of point values that have been changed throughout a sequence
				// Used after sequence completion to check point related triggers
                "changed":[],
				// Default point container. Other custom containers can be added through design
				"Page Points":0
            },
			// Whether or not to reload a page after a turn as completed
            "reloadOnLeave": false,
			// Name of page, used in navigation dropdown UI.
            "name": "cover",
			/* Value of a page's countdown. 
			 * Once started/resumed, it will countdown 1 unit per second until it reaches 0
			 * Then, any associated countdownFinish triggers will be called
			 * Can also be incremented, decremented, set, finished (check triggers), and killed (no trigger check) through sequencing
			 * Fields can also display the value of a page's countdown timer.
			 */
			 // Future addition: Custom coutdowns, turn this into array similar to points
            "countdown": 0,
			// Array of objects on page
            "objs": [
                {
                    "type": "image",
                    "name": "bugs01",
                    "layer": 0,
                    "vis": true,
                    "loc": [
                        0,
                        0
                    ],
                    "width": 600,
                    "height": 600,
                    "opacity": 1,
                    "mobility": "fixed",
                    "frontDrag": false,
                    "animations": {},
                    "fileRoot": "bugs01",
                    "ext": "jpeg",
                    "swapMethod": false,
                    "swapHeight": false,
                    "swapWidth": false,
                    "init": {
                        "height": 600,
                        "width": 600,
                        "loc": [
                            0,
                            0
                        ],
                        "vis": true,
                        "layer": 6,
                        "mobility": "fixed",
                        "opacity": 1
                    },
                    "fileName": "bugs01.jpeg",
                    "src": "\/Market_2018\/html\/publication\/3\/images\/bugs01.jpeg"
                }
            ],
			/* Key used to reference specific object in array
			 * 	- Why use a numeric array for page prop "objs" 
            "objKey": {
                "bugs01": 0
            },
            "auds": [
                {
                    "ext": "wav",
                    "src": "\/Market_2018\/html\/publication\/3\/audio\/bugs1.wav",
                    "loaded": false,
                    "errored": false,
                    "filename": "bugs1"
                }
            ],
            "audKey": {
                "bugs1": 1
            },
            "links": [
                {
                    "triggers": {
                        "clicks": [
                            {
                                "type": "click",
                                "condition": "click",
                                "targets": [
                                    {
                                        "id": "tid0",
                                        "type": "audio",
                                        "action": "play",
                                        "destination": "bugs1",
                                        "blocking": false,
                                        "hold": "audios"
                                    }
                                ],
                                "run": 0
                            }
                        ],
                        "points": [],
                        "dragStops": [],
                        "lineStarts": [],
                        "lineStops": [],
                        "countdowns": [],
                        "openPages": []
                    },
                    "name": "Link 1",
                    "type": "graphic",
                    "drawing": "none",
                    "poly": [
                        [
                            41,
                            3
                        ],
                        [
                            564,
                            3
                        ],
                        [
                            564,
                            538
                        ],
                        [
                            41,
                            538
                        ]
                    ],
                    "enabled": "enabled",
                    "init": {
                        "poly": [
                            [
                                41,
                                3
                            ],
                            [
                                564,
                                3
                            ],
                            [
                                564,
                                538
                            ],
                            [
                                41,
                                538
                            ]
                        ],
                        "enabled": "enabled",
                        "drawing": "none",
                        "pinned": "undefined"
                    }
                },
                {
                    "triggers": {
                        "clicks": [],
                        "points": [],
                        "dragStops": [],
                        "lineStarts": [],
                        "lineStops": [],
                        "countdowns": [],
                        "openPages": [
                            {
                                "type": "openPage",
                                "condition": "every",
                                "targets": [
                                    {
                                        "id": "tid1",
                                        "type": "send",
                                        "action": "click",
                                        "destination": "Link 1",
                                        "blocking": false,
                                        "hold": false
                                    }
                                ],
                                "run": 0
                            }
                        ]
                    },
                    "name": "Page",
                    "type": "page",
                    "poly": [],
                    "init": {
                        "poly": [],
                        "enabled": "undefined",
                        "drawing": "undefined",
                        "pinned": "undefined"
                    }
                }
            ],
            "linkKeys": {
                "Link 1": 0,
                "Page": 1
            },
            "init": {
                "points": null
            }
        },
        {
            "points": {
                "changed":[],
				"Page Points":0
            },
            "reloadOnLeave": false,
            "name": "2-3",
            "countdown": 0,
            "objs": [
                {
                    "type": "image",
                    "name": "bugs03",
                    "layer": 0,
                    "vis": true,
                    "loc": [
                        0,
                        600
                    ],
                    "width": 600,
                    "height": 600,
                    "opacity": 1,
                    "mobility": "fixed",
                    "frontDrag": false,
                    "animations": {},
                    "fileRoot": "bugs03",
                    "ext": "jpeg",
                    "swapMethod": false,
                    "swapHeight": false,
                    "swapWidth": false,
                    "init": {
                        "height": 600,
                        "width": 600,
                        "loc": [
                            0,
                            600
                        ],
                        "vis": true,
                        "layer": 3,
                        "mobility": "fixed",
                        "opacity": 1
                    },
                    "fileName": "bugs03.jpeg",
                    "src": "\/Market_2018\/html\/publication\/3\/images\/bugs03.jpeg"
                },
                {
                    "type": "image",
                    "name": "bugs02",
                    "layer": 1,
                    "vis": true,
                    "loc": [
                        0,
                        0
                    ],
                    "width": 600,
                    "height": 600,
                    "opacity": 1,
                    "mobility": "fixed",
                    "frontDrag": false,
                    "animations": {},
                    "fileRoot": "bugs02",
                    "ext": "jpeg",
                    "swapMethod": false,
                    "swapHeight": false,
                    "swapWidth": false,
                    "init": {
                        "height": 600,
                        "width": 600,
                        "loc": [
                            0,
                            0
                        ],
                        "vis": true,
                        "layer": 4,
                        "mobility": "fixed",
                        "opacity": 1
                    },
                    "fileName": "bugs02.jpeg",
                    "src": "\/Market_2018\/html\/publication\/3\/images\/bugs02.jpeg"
                }
            ],
            "objKey": {
                "bugs03": 0,
                "bugs02": 1
            },
            "auds": [
                {
                    "ext": "wav",
                    "src": "\/Market_2018\/html\/publication\/3\/audio\/bugs3.wav",
                    "loaded": false,
                    "errored": false,
                    "filename": "bugs3"
                }
            ],
            "audKey": {
                "bugs3": 1
            },
            "links": [
                {
                    "triggers": {
                        "clicks": [
                            {
                                "type": "click",
                                "condition": "click",
                                "targets": [
                                    {
                                        "id": "tid2",
                                        "type": "audio",
                                        "action": "play",
                                        "destination": "bugs3",
                                        "blocking": false,
                                        "hold": "audios"
                                    }
                                ],
                                "run": 0
                            }
                        ],
                        "points": [],
                        "dragStops": [],
                        "lineStarts": [],
                        "lineStops": [],
                        "countdowns": [],
                        "openPages": []
                    },
                    "name": "Link 1",
                    "type": "graphic",
                    "drawing": "none",
                    "poly": [
                        [
                            665,
                            78
                        ],
                        [
                            1144,
                            78
                        ],
                        [
                            1144,
                            387
                        ],
                        [
                            665,
                            387
                        ]
                    ],
                    "enabled": "enabled",
                    "init": {
                        "poly": [
                            [
                                665,
                                78
                            ],
                            [
                                1144,
                                78
                            ],
                            [
                                1144,
                                387
                            ],
                            [
                                665,
                                387
                            ]
                        ],
                        "enabled": "enabled",
                        "drawing": "none",
                        "pinned": "undefined"
                    }
                },
                {
                    "triggers": {
                        "clicks": [],
                        "points": [],
                        "dragStops": [],
                        "lineStarts": [],
                        "lineStops": [],
                        "countdowns": [],
                        "openPages": [
                            {
                                "type": "openPage",
                                "condition": "every",
                                "targets": [
                                    {
                                        "id": "tid3",
                                        "type": "send",
                                        "action": "click",
                                        "destination": "Link 1",
                                        "blocking": false,
                                        "hold": false
                                    }
                                ],
                                "run": 0
                            }
                        ]
                    },
                    "name": "Page",
                    "type": "page",
                    "poly": [],
                    "init": {
                        "poly": [],
                        "enabled": "undefined",
                        "drawing": "undefined",
                        "pinned": "undefined"
                    }
                }
            ],
            "linkKeys": {
                "Link 1": 0,
                "Page": 1
            },
            "init": {
                "points": null
            }
        },
        {
            "points": {
                "changed":[],
				"Page Points":0
            },
            "reloadOnLeave": false,
            "name": "4-5",
            "countdown": 0,
            "objs": [
                {
                    "type": "image",
                    "name": "bugs05",
                    "layer": 0,
                    "vis": true,
                    "loc": [
                        0,
                        600
                    ],
                    "width": 600,
                    "height": 600,
                    "opacity": 1,
                    "mobility": "fixed",
                    "frontDrag": false,
                    "animations": {},
                    "fileRoot": "bugs05",
                    "ext": "jpeg",
                    "swapMethod": false,
                    "swapHeight": false,
                    "swapWidth": false,
                    "init": {
                        "height": 600,
                        "width": 600,
                        "loc": [
                            0,
                            600
                        ],
                        "vis": true,
                        "layer": 1,
                        "mobility": "fixed",
                        "opacity": 1
                    },
                    "fileName": "bugs05.jpeg",
                    "src": "\/Market_2018\/html\/publication\/3\/images\/bugs05.jpeg"
                },
                {
                    "type": "image",
                    "name": "bugs04",
                    "layer": 1,
                    "vis": true,
                    "loc": [
                        0,
                        0
                    ],
                    "width": 600,
                    "height": 600,
                    "opacity": 1,
                    "mobility": "fixed",
                    "frontDrag": false,
                    "animations": {},
                    "fileRoot": "bugs04",
                    "ext": "jpeg",
                    "swapMethod": false,
                    "swapHeight": false,
                    "swapWidth": false,
                    "init": {
                        "height": 600,
                        "width": 600,
                        "loc": [
                            0,
                            0
                        ],
                        "vis": true,
                        "layer": 2,
                        "mobility": "fixed",
                        "opacity": 1
                    },
                    "fileName": "bugs04.jpeg",
                    "src": "\/Market_2018\/html\/publication\/3\/images\/bugs04.jpeg"
                }
            ],
            "objKey": {
                "bugs05": 0,
                "bugs04": 1
            },
            "auds": [
                {
                    "ext": "wav",
                    "src": "\/Market_2018\/html\/publication\/3\/audio\/bugs4.wav",
                    "loaded": false,
                    "errored": false,
                    "filename": "bugs4"
                },
                {
                    "ext": "wav",
                    "src": "\/Market_2018\/html\/publication\/3\/audio\/bugs5.wav",
                    "loaded": false,
                    "errored": false,
                    "filename": "bugs5"
                }
            ],
            "audKey": {
                "bugs4": 1,
                "bugs5": 2
            },
            "links": [
                {
                    "triggers": {
                        "clicks": [
                            {
                                "type": "click",
                                "condition": "click",
                                "targets": [
                                    {
                                        "id": "tid4",
                                        "type": "audio",
                                        "action": "play",
                                        "destination": "bugs4",
                                        "blocking": false,
                                        "hold": "audios"
                                    },
                                    {
                                        "id": "tid5",
                                        "type": "wait",
                                        "action": "wait for",
                                        "destination": "silence",
                                        "blocking": "audios",
                                        "hold": false
                                    },
                                    {
                                        "id": "tid6",
                                        "type": "send",
                                        "action": "click",
                                        "destination": "Link 2",
                                        "blocking": false,
                                        "hold": false
                                    }
                                ],
                                "run": 0
                            }
                        ],
                        "points": [],
                        "dragStops": [],
                        "lineStarts": [],
                        "lineStops": [],
                        "countdowns": [],
                        "openPages": []
                    },
                    "name": "Link 1",
                    "type": "graphic",
                    "drawing": "none",
                    "poly": [
                        [
                            20,
                            446
                        ],
                        [
                            598,
                            446
                        ],
                        [
                            598,
                            589
                        ],
                        [
                            20,
                            589
                        ]
                    ],
                    "enabled": "enabled",
                    "init": {
                        "poly": [
                            [
                                20,
                                446
                            ],
                            [
                                598,
                                446
                            ],
                            [
                                598,
                                589
                            ],
                            [
                                20,
                                589
                            ]
                        ],
                        "enabled": "enabled",
                        "drawing": "none",
                        "pinned": "undefined"
                    }
                },
                {
                    "triggers": {
                        "clicks": [
                            {
                                "type": "click",
                                "condition": "click",
                                "targets": [
                                    {
                                        "id": "tid7",
                                        "type": "audio",
                                        "action": "play",
                                        "destination": "bugs5",
                                        "blocking": false,
                                        "hold": "audios"
                                    }
                                ],
                                "run": 0
                            }
                        ],
                        "points": [],
                        "dragStops": [],
                        "lineStarts": [],
                        "lineStops": [],
                        "countdowns": [],
                        "openPages": []
                    },
                    "name": "Link 2",
                    "type": "graphic",
                    "drawing": "none",
                    "poly": [
                        [
                            951,
                            24
                        ],
                        [
                            1167,
                            24
                        ],
                        [
                            1167,
                            264
                        ],
                        [
                            951,
                            264
                        ]
                    ],
                    "enabled": "enabled",
                    "init": {
                        "poly": [
                            [
                                951,
                                24
                            ],
                            [
                                1167,
                                24
                            ],
                            [
                                1167,
                                264
                            ],
                            [
                                951,
                                264
                            ]
                        ],
                        "enabled": "enabled",
                        "drawing": "none",
                        "pinned": "undefined"
                    }
                },
                {
                    "triggers": {
                        "clicks": [],
                        "points": [],
                        "dragStops": [],
                        "lineStarts": [],
                        "lineStops": [],
                        "countdowns": [],
                        "openPages": [
                            {
                                "type": "openPage",
                                "condition": "every",
                                "targets": [
                                    {
                                        "id": "tid8",
                                        "type": "send",
                                        "action": "click",
                                        "destination": "Link 1",
                                        "blocking": false,
                                        "hold": false
                                    }
                                ],
                                "run": 0
                            }
                        ]
                    },
                    "name": "Page",
                    "type": "page",
                    "poly": [],
                    "init": {
                        "poly": [],
                        "enabled": "undefined",
                        "drawing": "undefined",
                        "pinned": "undefined"
                    }
                }
            ],
            "linkKeys": {
                "Link 1": 0,
                "Link 2": 1,
                "Page": 2
            },
            "init": {
                "points": null
            }
        },
        {
            "points": {
                "changed":[],
				"Page Points":0
            },
            "reloadOnLeave": false,
            "name": "6-7",
            "countdown": 0,
            "objs": [
                {
                    "type": "image",
                    "name": "bugs07",
                    "layer": 0,
                    "vis": true,
                    "loc": [
                        0,
                        600
                    ],
                    "width": 600,
                    "height": 600,
                    "opacity": 1,
                    "mobility": "fixed",
                    "frontDrag": false,
                    "animations": {},
                    "fileRoot": "bugs07",
                    "ext": "jpeg",
                    "swapMethod": false,
                    "swapHeight": false,
                    "swapWidth": false,
                    "init": {
                        "height": 600,
                        "width": 600,
                        "loc": [
                            0,
                            600
                        ],
                        "vis": true,
                        "layer": 1,
                        "mobility": "fixed",
                        "opacity": 1
                    },
                    "fileName": "bugs07.jpeg",
                    "src": "\/Market_2018\/html\/publication\/3\/images\/bugs07.jpeg"
                },
                {
                    "type": "image",
                    "name": "bugs06",
                    "layer": 1,
                    "vis": true,
                    "loc": [
                        0,
                        0
                    ],
                    "width": 600,
                    "height": 600,
                    "opacity": 1,
                    "mobility": "fixed",
                    "frontDrag": false,
                    "animations": {},
                    "fileRoot": "bugs06",
                    "ext": "jpeg",
                    "swapMethod": false,
                    "swapHeight": false,
                    "swapWidth": false,
                    "init": {
                        "height": 600,
                        "width": 600,
                        "loc": [
                            0,
                            0
                        ],
                        "vis": true,
                        "layer": 2,
                        "mobility": "fixed",
                        "opacity": 1
                    },
                    "fileName": "bugs06.jpeg",
                    "src": "\/Market_2018\/html\/publication\/3\/images\/bugs06.jpeg"
                }
            ],
            "objKey": {
                "bugs07": 0,
                "bugs06": 1
            },
            "auds": [
                {
                    "ext": "wav",
                    "src": "\/Market_2018\/html\/publication\/3\/audio\/bugs6.wav",
                    "loaded": false,
                    "errored": false,
                    "filename": "bugs6"
                },
                {
                    "ext": "wav",
                    "src": "\/Market_2018\/html\/publication\/3\/audio\/bugs7.wav",
                    "loaded": false,
                    "errored": false,
                    "filename": "bugs7"
                }
            ],
            "audKey": {
                "bugs6": 1,
                "bugs7": 2
            },
            "links": [
                {
                    "triggers": {
                        "clicks": [
                            {
                                "type": "click",
                                "condition": "click",
                                "targets": [
                                    {
                                        "id": "tid9",
                                        "type": "audio",
                                        "action": "play",
                                        "destination": "bugs6",
                                        "blocking": false,
                                        "hold": "audios"
                                    },
                                    {
                                        "id": "tid10",
                                        "type": "wait",
                                        "action": "wait for",
                                        "destination": "silence",
                                        "blocking": "audios",
                                        "hold": false
                                    },
                                    {
                                        "id": "tid11",
                                        "type": "send",
                                        "action": "click",
                                        "destination": "Link 2",
                                        "blocking": false,
                                        "hold": false
                                    }
                                ],
                                "run": 0
                            }
                        ],
                        "points": [],
                        "dragStops": [],
                        "lineStarts": [],
                        "lineStops": [],
                        "countdowns": [],
                        "openPages": []
                    },
                    "name": "Link 1",
                    "type": "graphic",
                    "drawing": "none",
                    "poly": [
                        [
                            63,
                            21
                        ],
                        [
                            548,
                            21
                        ],
                        [
                            548,
                            170
                        ],
                        [
                            63,
                            170
                        ]
                    ],
                    "enabled": "enabled",
                    "init": {
                        "poly": [
                            [
                                63,
                                21
                            ],
                            [
                                548,
                                21
                            ],
                            [
                                548,
                                170
                            ],
                            [
                                63,
                                170
                            ]
                        ],
                        "enabled": "enabled",
                        "drawing": "none",
                        "pinned": "undefined"
                    }
                },
                {
                    "triggers": {
                        "clicks": [
                            {
                                "type": "click",
                                "condition": "click",
                                "targets": [
                                    {
                                        "id": "tid12",
                                        "type": "audio",
                                        "action": "play",
                                        "destination": "bugs7",
                                        "blocking": false,
                                        "hold": "audios"
                                    }
                                ],
                                "run": 0
                            }
                        ],
                        "points": [],
                        "dragStops": [],
                        "lineStarts": [],
                        "lineStops": [],
                        "countdowns": [],
                        "openPages": []
                    },
                    "name": "Link 2",
                    "type": "graphic",
                    "drawing": "none",
                    "poly": [
                        [
                            639,
                            310
                        ],
                        [
                            1165,
                            310
                        ],
                        [
                            1165,
                            488
                        ],
                        [
                            639,
                            488
                        ]
                    ],
                    "enabled": "enabled",
                    "init": {
                        "poly": [
                            [
                                639,
                                310
                            ],
                            [
                                1165,
                                310
                            ],
                            [
                                1165,
                                488
                            ],
                            [
                                639,
                                488
                            ]
                        ],
                        "enabled": "enabled",
                        "drawing": "none",
                        "pinned": "undefined"
                    }
                },
                {
                    "triggers": {
                        "clicks": [],
                        "points": [],
                        "dragStops": [],
                        "lineStarts": [],
                        "lineStops": [],
                        "countdowns": [],
                        "openPages": [
                            {
                                "type": "openPage",
                                "condition": "every",
                                "targets": [
                                    {
                                        "id": "tid13",
                                        "type": "send",
                                        "action": "click",
                                        "destination": "Link 1",
                                        "blocking": false,
                                        "hold": false
                                    }
                                ],
                                "run": 0
                            }
                        ]
                    },
                    "name": "Page",
                    "type": "page",
                    "poly": [],
                    "init": {
                        "poly": [],
                        "enabled": "undefined",
                        "drawing": "undefined",
                        "pinned": "undefined"
                    }
                }
            ],
            "linkKeys": {
                "Link 1": 0,
                "Link 2": 1,
                "Page": 2
            },
            "init": {
                "points": null
            }
        },
        {
            "points": {
                "changed":[],
				"Page Points":0
            },
            "reloadOnLeave": false,
            "name": "8-9",
            "countdown": 0,
            "objs": [
                {
                    "type": "image",
                    "name": "bugs09",
                    "layer": 0,
                    "vis": true,
                    "loc": [
                        0,
                        600
                    ],
                    "width": 600,
                    "height": 600,
                    "opacity": 1,
                    "mobility": "fixed",
                    "frontDrag": false,
                    "animations": {},
                    "fileRoot": "bugs09",
                    "ext": "jpeg",
                    "swapMethod": false,
                    "swapHeight": false,
                    "swapWidth": false,
                    "init": {
                        "height": 600,
                        "width": 600,
                        "loc": [
                            0,
                            600
                        ],
                        "vis": true,
                        "layer": 1,
                        "mobility": "fixed",
                        "opacity": 1
                    },
                    "fileName": "bugs09.jpeg",
                    "src": "\/Market_2018\/html\/publication\/3\/images\/bugs09.jpeg"
                },
                {
                    "type": "image",
                    "name": "bugs08",
                    "layer": 1,
                    "vis": true,
                    "loc": [
                        0,
                        0
                    ],
                    "width": 600,
                    "height": 600,
                    "opacity": 1,
                    "mobility": "fixed",
                    "frontDrag": false,
                    "animations": {},
                    "fileRoot": "bugs08",
                    "ext": "jpeg",
                    "swapMethod": false,
                    "swapHeight": false,
                    "swapWidth": false,
                    "init": {
                        "height": 600,
                        "width": 600,
                        "loc": [
                            0,
                            0
                        ],
                        "vis": true,
                        "layer": 2,
                        "mobility": "fixed",
                        "opacity": 1
                    },
                    "fileName": "bugs08.jpeg",
                    "src": "\/Market_2018\/html\/publication\/3\/images\/bugs08.jpeg"
                }
            ],
            "objKey": {
                "bugs09": 0,
                "bugs08": 1
            },
            "auds": [
                {
                    "ext": "wav",
                    "src": "\/Market_2018\/html\/publication\/3\/audio\/bugs8.wav",
                    "loaded": false,
                    "errored": false,
                    "filename": "bugs8"
                },
                {
                    "ext": "wav",
                    "src": "\/Market_2018\/html\/publication\/3\/audio\/bugs9.wav",
                    "loaded": false,
                    "errored": false,
                    "filename": "bugs9"
                }
            ],
            "audKey": {
                "bugs8": 1,
                "bugs9": 2
            },
            "links": [
                {
                    "triggers": {
                        "clicks": [
                            {
                                "type": "click",
                                "condition": "click",
                                "targets": [
                                    {
                                        "id": "tid14",
                                        "type": "audio",
                                        "action": "play",
                                        "destination": "bugs8",
                                        "blocking": false,
                                        "hold": "audios"
                                    },
                                    {
                                        "id": "tid15",
                                        "type": "wait",
                                        "action": "wait for",
                                        "destination": "silence",
                                        "blocking": "audios",
                                        "hold": false
                                    },
                                    {
                                        "id": "tid16",
                                        "type": "send",
                                        "action": "click",
                                        "destination": "Link 2",
                                        "blocking": false,
                                        "hold": false
                                    }
                                ],
                                "run": 0
                            }
                        ],
                        "points": [],
                        "dragStops": [],
                        "lineStarts": [],
                        "lineStops": [],
                        "countdowns": [],
                        "openPages": []
                    },
                    "name": "Link 1",
                    "type": "graphic",
                    "drawing": "none",
                    "poly": [
                        [
                            84,
                            30
                        ],
                        [
                            542,
                            30
                        ],
                        [
                            542,
                            218
                        ],
                        [
                            84,
                            218
                        ]
                    ],
                    "enabled": "enabled",
                    "init": {
                        "poly": [
                            [
                                84,
                                30
                            ],
                            [
                                542,
                                30
                            ],
                            [
                                542,
                                218
                            ],
                            [
                                84,
                                218
                            ]
                        ],
                        "enabled": "enabled",
                        "drawing": "none",
                        "pinned": "undefined"
                    }
                },
                {
                    "triggers": {
                        "clicks": [
                            {
                                "type": "click",
                                "condition": "click",
                                "targets": [
                                    {
                                        "id": "tid17",
                                        "type": "audio",
                                        "action": "play",
                                        "destination": "bugs9",
                                        "blocking": false,
                                        "hold": "audios"
                                    }
                                ],
                                "run": 0
                            }
                        ],
                        "points": [],
                        "dragStops": [],
                        "lineStarts": [],
                        "lineStops": [],
                        "countdowns": [],
                        "openPages": []
                    },
                    "name": "Link 2",
                    "type": "graphic",
                    "drawing": "none",
                    "poly": [
                        [
                            687,
                            397
                        ],
                        [
                            1115,
                            397
                        ],
                        [
                            1115,
                            577
                        ],
                        [
                            687,
                            577
                        ]
                    ],
                    "enabled": "enabled",
                    "init": {
                        "poly": [
                            [
                                687,
                                397
                            ],
                            [
                                1115,
                                397
                            ],
                            [
                                1115,
                                577
                            ],
                            [
                                687,
                                577
                            ]
                        ],
                        "enabled": "enabled",
                        "drawing": "none",
                        "pinned": "undefined"
                    }
                },
                {
                    "triggers": {
                        "clicks": [],
                        "points": [],
                        "dragStops": [],
                        "lineStarts": [],
                        "lineStops": [],
                        "countdowns": [],
                        "openPages": [
                            {
                                "type": "openPage",
                                "condition": "every",
                                "targets": [
                                    {
                                        "id": "tid18",
                                        "type": "send",
                                        "action": "click",
                                        "destination": "Link 1",
                                        "blocking": false,
                                        "hold": false
                                    }
                                ],
                                "run": 0
                            }
                        ]
                    },
                    "name": "Page",
                    "type": "page",
                    "poly": [],
                    "init": {
                        "poly": [],
                        "enabled": "undefined",
                        "drawing": "undefined",
                        "pinned": "undefined"
                    }
                }
            ],
            "linkKeys": {
                "Link 1": 0,
                "Link 2": 1,
                "Page": 2
            },
            "init": {
                "points": null
            }
        },
        {
            "points": {
                "changed":[],
				"Page Points":0
            },
            "reloadOnLeave": false,
            "name": "10-11",
            "countdown": 0,
            "objs": [
                {
                    "type": "image",
                    "name": "bugs11",
                    "layer": 0,
                    "vis": true,
                    "loc": [
                        0,
                        600
                    ],
                    "width": 600,
                    "height": 600,
                    "opacity": 1,
                    "mobility": "fixed",
                    "frontDrag": false,
                    "animations": {},
                    "fileRoot": "bugs11",
                    "ext": "jpeg",
                    "swapMethod": false,
                    "swapHeight": false,
                    "swapWidth": false,
                    "init": {
                        "height": 600,
                        "width": 600,
                        "loc": [
                            0,
                            600
                        ],
                        "vis": true,
                        "layer": 1,
                        "mobility": "fixed",
                        "opacity": 1
                    },
                    "fileName": "bugs11.jpeg",
                    "src": "\/Market_2018\/html\/publication\/3\/images\/bugs11.jpeg"
                },
                {
                    "type": "image",
                    "name": "bugs10",
                    "layer": 1,
                    "vis": true,
                    "loc": [
                        0,
                        0
                    ],
                    "width": 600,
                    "height": 600,
                    "opacity": 1,
                    "mobility": "fixed",
                    "frontDrag": false,
                    "animations": {},
                    "fileRoot": "bugs10",
                    "ext": "jpeg",
                    "swapMethod": false,
                    "swapHeight": false,
                    "swapWidth": false,
                    "init": {
                        "height": 600,
                        "width": 600,
                        "loc": [
                            0,
                            0
                        ],
                        "vis": true,
                        "layer": 2,
                        "mobility": "fixed",
                        "opacity": 1
                    },
                    "fileName": "bugs10.jpeg",
                    "src": "\/Market_2018\/html\/publication\/3\/images\/bugs10.jpeg"
                }
            ],
            "objKey": {
                "bugs11": 0,
                "bugs10": 1
            },
            "auds": [
                {
                    "ext": "wav",
                    "src": "\/Market_2018\/html\/publication\/3\/audio\/bugs10.wav",
                    "loaded": false,
                    "errored": false,
                    "filename": "bugs10"
                },
                {
                    "ext": "wav",
                    "src": "\/Market_2018\/html\/publication\/3\/audio\/bugs11.wav",
                    "loaded": false,
                    "errored": false,
                    "filename": "bugs11"
                }
            ],
            "audKey": {
                "bugs10": 1,
                "bugs11": 2
            },
            "links": [
                {
                    "triggers": {
                        "clicks": [
                            {
                                "type": "click",
                                "condition": "click",
                                "targets": [
                                    {
                                        "id": "tid19",
                                        "type": "audio",
                                        "action": "play",
                                        "destination": "bugs10",
                                        "blocking": false,
                                        "hold": "audios"
                                    },
                                    {
                                        "id": "tid20",
                                        "type": "wait",
                                        "action": "wait for",
                                        "destination": "silence",
                                        "blocking": "audios",
                                        "hold": false
                                    },
                                    {
                                        "id": "tid21",
                                        "type": "send",
                                        "action": "click",
                                        "destination": "Link 2",
                                        "blocking": false,
                                        "hold": false
                                    }
                                ],
                                "run": 0
                            }
                        ],
                        "points": [],
                        "dragStops": [],
                        "lineStarts": [],
                        "lineStops": [],
                        "countdowns": [],
                        "openPages": []
                    },
                    "name": "Link 1",
                    "type": "graphic",
                    "drawing": "none",
                    "poly": [
                        [
                            36,
                            86
                        ],
                        [
                            244,
                            86
                        ],
                        [
                            244,
                            472
                        ],
                        [
                            36,
                            472
                        ]
                    ],
                    "enabled": "enabled",
                    "init": {
                        "poly": [
                            [
                                36,
                                86
                            ],
                            [
                                244,
                                86
                            ],
                            [
                                244,
                                472
                            ],
                            [
                                36,
                                472
                            ]
                        ],
                        "enabled": "enabled",
                        "drawing": "none",
                        "pinned": "undefined"
                    }
                },
                {
                    "triggers": {
                        "clicks": [
                            {
                                "type": "click",
                                "condition": "click",
                                "targets": [
                                    {
                                        "id": "tid22",
                                        "type": "audio",
                                        "action": "play",
                                        "destination": "bugs11",
                                        "blocking": false,
                                        "hold": "audios"
                                    }
                                ],
                                "run": 0
                            }
                        ],
                        "points": [],
                        "dragStops": [],
                        "lineStarts": [],
                        "lineStops": [],
                        "countdowns": [],
                        "openPages": []
                    },
                    "name": "Link 2",
                    "type": "graphic",
                    "drawing": "none",
                    "poly": [
                        [
                            735,
                            34
                        ],
                        [
                            1086,
                            34
                        ],
                        [
                            1086,
                            177
                        ],
                        [
                            735,
                            177
                        ]
                    ],
                    "enabled": "enabled",
                    "init": {
                        "poly": [
                            [
                                735,
                                34
                            ],
                            [
                                1086,
                                34
                            ],
                            [
                                1086,
                                177
                            ],
                            [
                                735,
                                177
                            ]
                        ],
                        "enabled": "enabled",
                        "drawing": "none",
                        "pinned": "undefined"
                    }
                },
                {
                    "triggers": {
                        "clicks": [],
                        "points": [],
                        "dragStops": [],
                        "lineStarts": [],
                        "lineStops": [],
                        "countdowns": [],
                        "openPages": [
                            {
                                "type": "openPage",
                                "condition": "every",
                                "targets": [
                                    {
                                        "id": "tid23",
                                        "type": "send",
                                        "action": "click",
                                        "destination": "Link 1",
                                        "blocking": false,
                                        "hold": false
                                    }
                                ],
                                "run": 0
                            }
                        ]
                    },
                    "name": "Page",
                    "type": "page",
                    "poly": [],
                    "init": {
                        "poly": [],
                        "enabled": "undefined",
                        "drawing": "undefined",
                        "pinned": "undefined"
                    }
                }
            ],
            "linkKeys": {
                "Link 1": 0,
                "Link 2": 1,
                "Page": 2
            },
            "init": {
                "points": null
            }
        },
        {
            "points": {
                "changed":[],
				"Page Points":0
            },
            "reloadOnLeave": false,
            "name": "12-13",
            "countdown": 0,
            "objs": [
                {
                    "type": "image",
                    "name": "bugs13",
                    "layer": 0,
                    "vis": true,
                    "loc": [
                        0,
                        600
                    ],
                    "width": 600,
                    "height": 600,
                    "opacity": 1,
                    "mobility": "fixed",
                    "frontDrag": false,
                    "animations": {},
                    "fileRoot": "bugs13",
                    "ext": "jpeg",
                    "swapMethod": false,
                    "swapHeight": false,
                    "swapWidth": false,
                    "init": {
                        "height": 600,
                        "width": 600,
                        "loc": [
                            0,
                            600
                        ],
                        "vis": true,
                        "layer": 1,
                        "mobility": "fixed",
                        "opacity": 1
                    },
                    "fileName": "bugs13.jpeg",
                    "src": "\/Market_2018\/html\/publication\/3\/images\/bugs13.jpeg"
                },
                {
                    "type": "image",
                    "name": "bugs12",
                    "layer": 1,
                    "vis": true,
                    "loc": [
                        0,
                        0
                    ],
                    "width": 600,
                    "height": 600,
                    "opacity": 1,
                    "mobility": "fixed",
                    "frontDrag": false,
                    "animations": {},
                    "fileRoot": "bugs12",
                    "ext": "jpeg",
                    "swapMethod": false,
                    "swapHeight": false,
                    "swapWidth": false,
                    "init": {
                        "height": 600,
                        "width": 600,
                        "loc": [
                            0,
                            0
                        ],
                        "vis": true,
                        "layer": 2,
                        "mobility": "fixed",
                        "opacity": 1
                    },
                    "fileName": "bugs12.jpeg",
                    "src": "\/Market_2018\/html\/publication\/3\/images\/bugs12.jpeg"
                }
            ],
            "objKey": {
                "bugs13": 0,
                "bugs12": 1
            },
            "auds": [
                {
                    "ext": "wav",
                    "src": "\/Market_2018\/html\/publication\/3\/audio\/bugs12.wav",
                    "loaded": false,
                    "errored": false,
                    "filename": "bugs12"
                },
                {
                    "ext": "wav",
                    "src": "\/Market_2018\/html\/publication\/3\/audio\/bugs13.wav",
                    "loaded": false,
                    "errored": false,
                    "filename": "bugs13"
                }
            ],
            "audKey": {
                "bugs12": 1,
                "bugs13": 2
            },
            "links": [
                {
                    "triggers": {
                        "clicks": [
                            {
                                "type": "click",
                                "condition": "click",
                                "targets": [
                                    {
                                        "id": "tid24",
                                        "type": "audio",
                                        "action": "play",
                                        "destination": "bugs12",
                                        "blocking": false,
                                        "hold": "audios"
                                    },
                                    {
                                        "id": "tid25",
                                        "type": "wait",
                                        "action": "wait for",
                                        "destination": "silence",
                                        "blocking": "audios",
                                        "hold": false
                                    },
                                    {
                                        "id": "tid26",
                                        "type": "send",
                                        "action": "click",
                                        "destination": "Link 2",
                                        "blocking": false,
                                        "hold": false
                                    }
                                ],
                                "run": 0
                            }
                        ],
                        "points": [],
                        "dragStops": [],
                        "lineStarts": [],
                        "lineStops": [],
                        "countdowns": [],
                        "openPages": []
                    },
                    "name": "Link 1",
                    "type": "graphic",
                    "drawing": "none",
                    "poly": [
                        [
                            92,
                            31
                        ],
                        [
                            520,
                            31
                        ],
                        [
                            520,
                            173
                        ],
                        [
                            92,
                            173
                        ]
                    ],
                    "enabled": "enabled",
                    "init": {
                        "poly": [
                            [
                                92,
                                31
                            ],
                            [
                                520,
                                31
                            ],
                            [
                                520,
                                173
                            ],
                            [
                                92,
                                173
                            ]
                        ],
                        "enabled": "enabled",
                        "drawing": "none",
                        "pinned": "undefined"
                    }
                },
                {
                    "triggers": {
                        "clicks": [
                            {
                                "type": "click",
                                "condition": "click",
                                "targets": [
                                    {
                                        "id": "tid27",
                                        "type": "audio",
                                        "action": "play",
                                        "destination": "bugs13",
                                        "blocking": false,
                                        "hold": "audios"
                                    }
                                ],
                                "run": 0
                            }
                        ],
                        "points": [],
                        "dragStops": [],
                        "lineStarts": [],
                        "lineStops": [],
                        "countdowns": [],
                        "openPages": []
                    },
                    "name": "Link 2",
                    "type": "graphic",
                    "drawing": "none",
                    "poly": [
                        [
                            687,
                            299
                        ],
                        [
                            1118,
                            299
                        ],
                        [
                            1118,
                            464
                        ],
                        [
                            687,
                            464
                        ]
                    ],
                    "enabled": "enabled",
                    "init": {
                        "poly": [
                            [
                                687,
                                299
                            ],
                            [
                                1118,
                                299
                            ],
                            [
                                1118,
                                464
                            ],
                            [
                                687,
                                464
                            ]
                        ],
                        "enabled": "enabled",
                        "drawing": "none",
                        "pinned": "undefined"
                    }
                },
                {
                    "triggers": {
                        "clicks": [],
                        "points": [],
                        "dragStops": [],
                        "lineStarts": [],
                        "lineStops": [],
                        "countdowns": [],
                        "openPages": [
                            {
                                "type": "openPage",
                                "condition": "every",
                                "targets": [
                                    {
                                        "id": "tid28",
                                        "type": "send",
                                        "action": "click",
                                        "destination": "Link 1",
                                        "blocking": false,
                                        "hold": false
                                    }
                                ],
                                "run": 0
                            }
                        ]
                    },
                    "name": "Page",
                    "type": "page",
                    "poly": [],
                    "init": {
                        "poly": [],
                        "enabled": "undefined",
                        "drawing": "undefined",
                        "pinned": "undefined"
                    }
                }
            ],
            "linkKeys": {
                "Link 1": 0,
                "Link 2": 1,
                "Page": 2
            },
            "init": {
                "points": null
            }
        },
        {
            "points": {
                "changed":[],
				"Page Points":0
            },
            "reloadOnLeave": false,
            "name": "14-15",
            "countdown": 0,
            "objs": [
                {
                    "type": "image",
                    "name": "bugs15",
                    "layer": 0,
                    "vis": true,
                    "loc": [
                        0,
                        600
                    ],
                    "width": 600,
                    "height": 600,
                    "opacity": 1,
                    "mobility": "fixed",
                    "frontDrag": false,
                    "animations": {},
                    "fileRoot": "bugs15",
                    "ext": "jpeg",
                    "swapMethod": false,
                    "swapHeight": false,
                    "swapWidth": false,
                    "init": {
                        "height": 600,
                        "width": 600,
                        "loc": [
                            0,
                            600
                        ],
                        "vis": true,
                        "layer": 3,
                        "mobility": "fixed",
                        "opacity": 1
                    },
                    "fileName": "bugs15.jpeg",
                    "src": "\/Market_2018\/html\/publication\/3\/images\/bugs15.jpeg"
                },
                {
                    "type": "image",
                    "name": "bugs14",
                    "layer": 1,
                    "vis": true,
                    "loc": [
                        0,
                        0
                    ],
                    "width": 600,
                    "height": 600,
                    "opacity": 1,
                    "mobility": "fixed",
                    "frontDrag": false,
                    "animations": {},
                    "fileRoot": "bugs14",
                    "ext": "jpeg",
                    "swapMethod": false,
                    "swapHeight": false,
                    "swapWidth": false,
                    "init": {
                        "height": 600,
                        "width": 600,
                        "loc": [
                            0,
                            0
                        ],
                        "vis": true,
                        "layer": 4,
                        "mobility": "fixed",
                        "opacity": 1
                    },
                    "fileName": "bugs14.jpeg",
                    "src": "\/Market_2018\/html\/publication\/3\/images\/bugs14.jpeg"
                }
            ],
            "objKey": {
                "bugs15": 0,
                "bugs14": 1
            },
            "auds": [
                {
                    "ext": "wav",
                    "src": "\/Market_2018\/html\/publication\/3\/audio\/bugs14.wav",
                    "loaded": false,
                    "errored": false,
                    "filename": "bugs14"
                },
                {
                    "ext": "wav",
                    "src": "\/Market_2018\/html\/publication\/3\/audio\/bugs15.wav",
                    "loaded": false,
                    "errored": false,
                    "filename": "bugs15"
                }
            ],
            "audKey": {
                "bugs14": 1,
                "bugs15": 2
            },
            "links": [
                {
                    "triggers": {
                        "clicks": [
                            {
                                "type": "click",
                                "condition": "click",
                                "targets": [
                                    {
                                        "id": "tid29",
                                        "type": "audio",
                                        "action": "play",
                                        "destination": "bugs14",
                                        "blocking": false,
                                        "hold": "audios"
                                    },
                                    {
                                        "id": "tid30",
                                        "type": "wait",
                                        "action": "wait for",
                                        "destination": "silence",
                                        "blocking": "audios",
                                        "hold": false
                                    },
                                    {
                                        "id": "tid31",
                                        "type": "send",
                                        "action": "click",
                                        "destination": "Link 2",
                                        "blocking": false,
                                        "hold": false
                                    }
                                ],
                                "run": 0
                            }
                        ],
                        "points": [],
                        "dragStops": [],
                        "lineStarts": [],
                        "lineStops": [],
                        "countdowns": [],
                        "openPages": []
                    },
                    "name": "Link 1",
                    "type": "graphic",
                    "drawing": "none",
                    "poly": [
                        [
                            282,
                            255
                        ],
                        [
                            576,
                            255
                        ],
                        [
                            576,
                            446
                        ],
                        [
                            282,
                            446
                        ]
                    ],
                    "enabled": "enabled",
                    "init": {
                        "poly": [
                            [
                                282,
                                255
                            ],
                            [
                                576,
                                255
                            ],
                            [
                                576,
                                446
                            ],
                            [
                                282,
                                446
                            ]
                        ],
                        "enabled": "enabled",
                        "drawing": "none",
                        "pinned": "undefined"
                    }
                },
                {
                    "triggers": {
                        "clicks": [
                            {
                                "type": "click",
                                "condition": "click",
                                "targets": [
                                    {
                                        "id": "tid32",
                                        "type": "audio",
                                        "action": "play",
                                        "destination": "bugs15",
                                        "blocking": false,
                                        "hold": "audios"
                                    }
                                ],
                                "run": 0
                            }
                        ],
                        "points": [],
                        "dragStops": [],
                        "lineStarts": [],
                        "lineStops": [],
                        "countdowns": [],
                        "openPages": []
                    },
                    "name": "Link 2",
                    "type": "graphic",
                    "drawing": "none",
                    "poly": [
                        [
                            687,
                            25
                        ],
                        [
                            1132,
                            25
                        ],
                        [
                            1132,
                            185
                        ],
                        [
                            687,
                            185
                        ]
                    ],
                    "enabled": "enabled",
                    "init": {
                        "poly": [
                            [
                                687,
                                25
                            ],
                            [
                                1132,
                                25
                            ],
                            [
                                1132,
                                185
                            ],
                            [
                                687,
                                185
                            ]
                        ],
                        "enabled": "enabled",
                        "drawing": "none",
                        "pinned": "undefined"
                    }
                },
                {
                    "triggers": {
                        "clicks": [],
                        "points": [],
                        "dragStops": [],
                        "lineStarts": [],
                        "lineStops": [],
                        "countdowns": [],
                        "openPages": [
                            {
                                "type": "openPage",
                                "condition": "every",
                                "targets": [
                                    {
                                        "id": "tid33",
                                        "type": "send",
                                        "action": "click",
                                        "destination": "Link 1",
                                        "blocking": false,
                                        "hold": false
                                    }
                                ],
                                "run": 0
                            }
                        ]
                    },
                    "name": "Page",
                    "type": "page",
                    "poly": [],
                    "init": {
                        "poly": [],
                        "enabled": "undefined",
                        "drawing": "undefined",
                        "pinned": "undefined"
                    }
                }
            ],
            "linkKeys": {
                "Link 1": 0,
                "Link 2": 1,
                "Page": 2
            },
            "init": {
                "points": null
            }
        },
        {
            "points": {
                "changed":[],
				"Page Points":0
            },
            "reloadOnLeave": false,
            "name": "16",
            "countdown": 0,
            "objs": [
                {
                    "type": "image",
                    "name": "bugs16",
                    "layer": 0,
                    "vis": true,
                    "loc": [
                        0,
                        0
                    ],
                    "width": 600,
                    "height": 600,
                    "opacity": 1,
                    "mobility": "fixed",
                    "frontDrag": false,
                    "animations": {},
                    "fileRoot": "bugs16",
                    "ext": "jpeg",
                    "swapMethod": false,
                    "swapHeight": false,
                    "swapWidth": false,
                    "init": {
                        "height": 600,
                        "width": 600,
                        "loc": [
                            0,
                            0
                        ],
                        "vis": true,
                        "layer": 3,
                        "mobility": "fixed",
                        "opacity": 1
                    },
                    "fileName": "bugs16.jpeg",
                    "src": "\/Market_2018\/html\/publication\/3\/images\/bugs16.jpeg"
                }
            ],
            "objKey": {
                "bugs16": 0
            },
            "auds": [
                {
                    "ext": "wav",
                    "src": "\/Market_2018\/html\/publication\/3\/audio\/bugs16.wav",
                    "loaded": false,
                    "errored": false,
                    "filename": "bugs16"
                },
                {
                    "ext": "wav",
                    "src": "\/Market_2018\/html\/publication\/3\/audio\/sfx_flash_2.wav",
                    "loaded": false,
                    "errored": false,
                    "filename": "sfx_flash_2"
                }
            ],
            "audKey": {
                "bugs16": 1,
                "sfx_flash_2": 2
            },
            "links": [
                {
                    "triggers": {
                        "clicks": [
                            {
                                "type": "click",
                                "condition": "click",
                                "targets": [
                                    {
                                        "id": "tid34",
                                        "type": "audio",
                                        "action": "play",
                                        "destination": "bugs16",
                                        "blocking": false,
                                        "hold": "audios"
                                    },
                                    {
                                        "id": "tid35",
                                        "type": "wait",
                                        "action": "wait for",
                                        "destination": "silence",
                                        "blocking": "audios",
                                        "hold": false
                                    },
                                    {
                                        "id": "tid36",
                                        "type": "wait",
                                        "action": "wait for",
                                        "destination": 2,
                                        "blocking": "waits",
                                        "hold": false
                                    },
                                    {
                                        "id": "tid37",
                                        "type": "audio",
                                        "action": "play",
                                        "destination": "sfx_flash_2",
                                        "blocking": false,
                                        "hold": "audios"
                                    }
                                ],
                                "run": 0
                            }
                        ],
                        "points": [],
                        "dragStops": [],
                        "lineStarts": [],
                        "lineStops": [],
                        "countdowns": [],
                        "openPages": []
                    },
                    "name": "Link 1",
                    "type": "graphic",
                    "drawing": "none",
                    "poly": [
                        [
                            27,
                            60
                        ],
                        [
                            296,
                            60
                        ],
                        [
                            296,
                            375
                        ],
                        [
                            27,
                            375
                        ]
                    ],
                    "enabled": "enabled",
                    "init": {
                        "poly": [
                            [
                                27,
                                60
                            ],
                            [
                                296,
                                60
                            ],
                            [
                                296,
                                375
                            ],
                            [
                                27,
                                375
                            ]
                        ],
                        "enabled": "enabled",
                        "drawing": "none",
                        "pinned": "undefined"
                    }
                },
                {
                    "triggers": {
                        "clicks": [],
                        "points": [],
                        "dragStops": [],
                        "lineStarts": [],
                        "lineStops": [],
                        "countdowns": [],
                        "openPages": [
                            {
                                "type": "openPage",
                                "condition": "every",
                                "targets": [
                                    {
                                        "id": "tid38",
                                        "type": "send",
                                        "action": "click",
                                        "destination": "Link 1",
                                        "blocking": false,
                                        "hold": false
                                    }
                                ],
                                "run": 0
                            }
                        ]
                    },
                    "name": "Page",
                    "type": "page",
                    "poly": [],
                    "init": {
                        "poly": [],
                        "enabled": "undefined",
                        "drawing": "undefined",
                        "pinned": "undefined"
                    }
                }
            ],
            "linkKeys": {
                "Link 1": 0,
                "Page": 1
            },
            "init": {
                "points": null
            }
        }
    ],
    "points": {
		"changed":[],
	},
}