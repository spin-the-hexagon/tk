import type { Luau } from "./src/luau/ast"; const ast: Luau.Document = {
    "root": {
        "type": "AstStatBlock",
        "location": "0,0 - 123,15",
        "hasEnd": true,
        "body": [
            {
                "type": "AstStatLocal",
                "location": "4,0 - 4,67",
                "vars": [
                    {
                        "luauType": null,
                        "name": "plugin",
                        "type": "AstLocal",
                        "location": "4,6 - 4,12"
                    }
                ],
                "values": [
                    {
                        "type": "AstExprBinary",
                        "location": "4,15 - 4,67",
                        "op": "Or",
                        "left": {
                            "type": "AstExprGlobal",
                            "location": "4,15 - 4,21",
                            "global": "plugin"
                        },
                        "right": {
                            "type": "AstExprCall",
                            "location": "4,25 - 4,67",
                            "func": {
                                "type": "AstExprIndexName",
                                "location": "4,25 - 4,57",
                                "expr": {
                                    "type": "AstExprGlobal",
                                    "location": "4,25 - 4,31",
                                    "global": "script"
                                },
                                "index": "FindFirstAncestorWhichIsA",
                                "indexLocation": "4,32 - 4,57",
                                "op": ":"
                            },
                            "args": [
                                {
                                    "type": "AstExprConstantString",
                                    "location": "4,58 - 4,66",
                                    "value": "Plugin"
                                }
                            ],
                            "self": true,
                            "argLocation": "4,58 - 4,67"
                        }
                    }
                ]
            },
            {
                "type": "AstStatLocal",
                "location": "5,0 - 5,45",
                "vars": [
                    {
                        "luauType": null,
                        "name": "Rojo",
                        "type": "AstLocal",
                        "location": "5,6 - 5,10"
                    }
                ],
                "values": [
                    {
                        "type": "AstExprCall",
                        "location": "5,13 - 5,45",
                        "func": {
                            "type": "AstExprIndexName",
                            "location": "5,13 - 5,37",
                            "expr": {
                                "type": "AstExprGlobal",
                                "location": "5,13 - 5,19",
                                "global": "script"
                            },
                            "index": "FindFirstAncestor",
                            "indexLocation": "5,20 - 5,37",
                            "op": ":"
                        },
                        "args": [
                            {
                                "type": "AstExprConstantString",
                                "location": "5,38 - 5,44",
                                "value": "Rojo"
                            }
                        ],
                        "self": true,
                        "argLocation": "5,38 - 5,45"
                    }
                ]
            },
            {
                "type": "AstStatLocal",
                "location": "6,0 - 6,30",
                "vars": [
                    {
                        "luauType": null,
                        "name": "Packages",
                        "type": "AstLocal",
                        "location": "6,6 - 6,14"
                    }
                ],
                "values": [
                    {
                        "type": "AstExprIndexName",
                        "location": "6,17 - 6,30",
                        "expr": {
                            "type": "AstExprLocal",
                            "location": "6,17 - 6,21",
                            "local": {
                                "luauType": null,
                                "name": "Rojo",
                                "type": "AstLocal",
                                "location": "5,6 - 5,10"
                            }
                        },
                        "index": "Packages",
                        "indexLocation": "6,22 - 6,30",
                        "op": "."
                    }
                ]
            },
            {
                "type": "AstStatLocal",
                "location": "8,0 - 8,33",
                "vars": [
                    {
                        "luauType": null,
                        "name": "Log",
                        "type": "AstLocal",
                        "location": "8,6 - 8,9"
                    }
                ],
                "values": [
                    {
                        "type": "AstExprCall",
                        "location": "8,12 - 8,33",
                        "func": {
                            "type": "AstExprGlobal",
                            "location": "8,12 - 8,19",
                            "global": "require"
                        },
                        "args": [
                            {
                                "type": "AstExprIndexName",
                                "location": "8,20 - 8,32",
                                "expr": {
                                    "type": "AstExprLocal",
                                    "location": "8,20 - 8,28",
                                    "local": {
                                        "luauType": null,
                                        "name": "Packages",
                                        "type": "AstLocal",
                                        "location": "6,6 - 6,14"
                                    }
                                },
                                "index": "Log",
                                "indexLocation": "8,29 - 8,32",
                                "op": "."
                            }
                        ],
                        "self": false,
                        "argLocation": "8,20 - 8,33"
                    }
                ]
            },
            {
                "type": "AstStatLocal",
                "location": "9,0 - 9,37",
                "vars": [
                    {
                        "luauType": null,
                        "name": "Roact",
                        "type": "AstLocal",
                        "location": "9,6 - 9,11"
                    }
                ],
                "values": [
                    {
                        "type": "AstExprCall",
                        "location": "9,14 - 9,37",
                        "func": {
                            "type": "AstExprGlobal",
                            "location": "9,14 - 9,21",
                            "global": "require"
                        },
                        "args": [
                            {
                                "type": "AstExprIndexName",
                                "location": "9,22 - 9,36",
                                "expr": {
                                    "type": "AstExprLocal",
                                    "location": "9,22 - 9,30",
                                    "local": {
                                        "luauType": null,
                                        "name": "Packages",
                                        "type": "AstLocal",
                                        "location": "6,6 - 6,14"
                                    }
                                },
                                "index": "Roact",
                                "indexLocation": "9,31 - 9,36",
                                "op": "."
                            }
                        ],
                        "self": false,
                        "argLocation": "9,22 - 9,37"
                    }
                ]
            },
            {
                "type": "AstStatLocal",
                "location": "11,0 - 29,1",
                "vars": [
                    {
                        "luauType": null,
                        "name": "defaultSettings",
                        "type": "AstLocal",
                        "location": "11,6 - 11,21"
                    }
                ],
                "values": [
                    {
                        "type": "AstExprTable",
                        "location": "11,24 - 29,1",
                        "items": [
                            {
                                "type": "AstExprTableItem",
                                "kind": "record",
                                "key": {
                                    "type": "AstExprConstantString",
                                    "location": "12,3 - 12,24",
                                    "value": "openScriptsExternally"
                                },
                                "value": {
                                    "type": "AstExprConstantBool",
                                    "location": "12,27 - 12,32",
                                    "value": false
                                }
                            },
                            {
                                "type": "AstExprTableItem",
                                "kind": "record",
                                "key": {
                                    "type": "AstExprConstantString",
                                    "location": "13,3 - 13,13",
                                    "value": "twoWaySync"
                                },
                                "value": {
                                    "type": "AstExprConstantBool",
                                    "location": "13,16 - 13,21",
                                    "value": false
                                }
                            },
                            {
                                "type": "AstExprTableItem",
                                "kind": "record",
                                "key": {
                                    "type": "AstExprConstantString",
                                    "location": "14,3 - 14,16",
                                    "value": "autoReconnect"
                                },
                                "value": {
                                    "type": "AstExprConstantBool",
                                    "location": "14,19 - 14,24",
                                    "value": false
                                }
                            },
                            {
                                "type": "AstExprTableItem",
                                "kind": "record",
                                "key": {
                                    "type": "AstExprConstantString",
                                    "location": "15,3 - 15,20",
                                    "value": "showNotifications"
                                },
                                "value": {
                                    "type": "AstExprConstantBool",
                                    "location": "15,23 - 15,27",
                                    "value": true
                                }
                            },
                            {
                                "type": "AstExprTableItem",
                                "kind": "record",
                                "key": {
                                    "type": "AstExprConstantString",
                                    "location": "16,3 - 16,21",
                                    "value": "enableSyncFallback"
                                },
                                "value": {
                                    "type": "AstExprConstantBool",
                                    "location": "16,24 - 16,28",
                                    "value": true
                                }
                            },
                            {
                                "type": "AstExprTableItem",
                                "kind": "record",
                                "key": {
                                    "type": "AstExprConstantString",
                                    "location": "17,3 - 17,19",
                                    "value": "syncReminderMode"
                                },
                                "value": {
                                    "type": "AstExprTypeAssertion",
                                    "location": "17,22 - 17,66",
                                    "expr": {
                                        "type": "AstExprConstantString",
                                        "location": "17,22 - 17,30",
                                        "value": "Notify"
                                    },
                                    "annotation": {
                                        "type": "AstTypeUnion",
                                        "location": "17,34 - 17,66",
                                        "types": [
                                            {
                                                "type": "AstTypeSingletonString",
                                                "location": "17,34 - 17,40",
                                                "value": "None"
                                            },
                                            {
                                                "type": "AstTypeSingletonString",
                                                "location": "17,43 - 17,51",
                                                "value": "Notify"
                                            },
                                            {
                                                "type": "AstTypeSingletonString",
                                                "location": "17,54 - 17,66",
                                                "value": "Fullscreen"
                                            }
                                        ]
                                    }
                                }
                            },
                            {
                                "type": "AstExprTableItem",
                                "kind": "record",
                                "key": {
                                    "type": "AstExprConstantString",
                                    "location": "18,3 - 18,22",
                                    "value": "syncReminderPolling"
                                },
                                "value": {
                                    "type": "AstExprConstantBool",
                                    "location": "18,25 - 18,29",
                                    "value": true
                                }
                            },
                            {
                                "type": "AstExprTableItem",
                                "kind": "record",
                                "key": {
                                    "type": "AstExprConstantString",
                                    "location": "19,3 - 19,18",
                                    "value": "checkForUpdates"
                                },
                                "value": {
                                    "type": "AstExprConstantBool",
                                    "location": "19,21 - 19,25",
                                    "value": true
                                }
                            },
                            {
                                "type": "AstExprTableItem",
                                "kind": "record",
                                "key": {
                                    "type": "AstExprConstantString",
                                    "location": "20,3 - 20,22",
                                    "value": "checkForPrereleases"
                                },
                                "value": {
                                    "type": "AstExprConstantBool",
                                    "location": "20,25 - 20,30",
                                    "value": false
                                }
                            },
                            {
                                "type": "AstExprTableItem",
                                "kind": "record",
                                "key": {
                                    "type": "AstExprConstantString",
                                    "location": "21,3 - 21,28",
                                    "value": "autoConnectPlaytestServer"
                                },
                                "value": {
                                    "type": "AstExprConstantBool",
                                    "location": "21,31 - 21,36",
                                    "value": false
                                }
                            },
                            {
                                "type": "AstExprTableItem",
                                "kind": "record",
                                "key": {
                                    "type": "AstExprConstantString",
                                    "location": "22,3 - 22,23",
                                    "value": "confirmationBehavior"
                                },
                                "value": {
                                    "type": "AstExprTypeAssertion",
                                    "location": "22,26 - 22,97",
                                    "expr": {
                                        "type": "AstExprConstantString",
                                        "location": "22,26 - 22,35",
                                        "value": "Initial"
                                    },
                                    "annotation": {
                                        "type": "AstTypeUnion",
                                        "location": "22,39 - 22,97",
                                        "types": [
                                            {
                                                "type": "AstTypeSingletonString",
                                                "location": "22,39 - 22,46",
                                                "value": "Never"
                                            },
                                            {
                                                "type": "AstTypeSingletonString",
                                                "location": "22,49 - 22,58",
                                                "value": "Initial"
                                            },
                                            {
                                                "type": "AstTypeSingletonString",
                                                "location": "22,61 - 22,76",
                                                "value": "Large Changes"
                                            },
                                            {
                                                "type": "AstTypeSingletonString",
                                                "location": "22,79 - 22,97",
                                                "value": "Unlisted PlaceId"
                                            }
                                        ]
                                    }
                                }
                            },
                            {
                                "type": "AstExprTableItem",
                                "kind": "record",
                                "key": {
                                    "type": "AstExprConstantString",
                                    "location": "23,3 - 23,36",
                                    "value": "largeChangesConfirmationThreshold"
                                },
                                "value": {
                                    "type": "AstExprConstantNumber",
                                    "location": "23,39 - 23,40",
                                    "value": 5
                                }
                            },
                            {
                                "type": "AstExprTableItem",
                                "kind": "record",
                                "key": {
                                    "type": "AstExprConstantString",
                                    "location": "24,3 - 24,13",
                                    "value": "playSounds"
                                },
                                "value": {
                                    "type": "AstExprConstantBool",
                                    "location": "24,16 - 24,20",
                                    "value": true
                                }
                            },
                            {
                                "type": "AstExprTableItem",
                                "kind": "record",
                                "key": {
                                    "type": "AstExprConstantString",
                                    "location": "25,3 - 25,22",
                                    "value": "typecheckingEnabled"
                                },
                                "value": {
                                    "type": "AstExprConstantBool",
                                    "location": "25,25 - 25,30",
                                    "value": false
                                }
                            },
                            {
                                "type": "AstExprTableItem",
                                "kind": "record",
                                "key": {
                                    "type": "AstExprConstantString",
                                    "location": "26,3 - 26,11",
                                    "value": "logLevel"
                                },
                                "value": {
                                    "type": "AstExprConstantString",
                                    "location": "26,14 - 26,20",
                                    "value": "Info"
                                }
                            },
                            {
                                "type": "AstExprTableItem",
                                "kind": "record",
                                "key": {
                                    "type": "AstExprConstantString",
                                    "location": "27,3 - 27,20",
                                    "value": "timingLogsEnabled"
                                },
                                "value": {
                                    "type": "AstExprConstantBool",
                                    "location": "27,23 - 27,28",
                                    "value": false
                                }
                            },
                            {
                                "type": "AstExprTableItem",
                                "kind": "record",
                                "key": {
                                    "type": "AstExprConstantString",
                                    "location": "28,3 - 28,17",
                                    "value": "priorEndpoints"
                                },
                                "value": {
                                    "type": "AstExprTable",
                                    "location": "28,20 - 28,22",
                                    "items": []
                                }
                            }
                        ]
                    }
                ]
            },
            {
                "type": "AstStatLocal",
                "location": "31,0 - 31,19",
                "vars": [
                    {
                        "luauType": null,
                        "name": "Settings",
                        "type": "AstLocal",
                        "location": "31,6 - 31,14"
                    }
                ],
                "values": [
                    {
                        "type": "AstExprTable",
                        "location": "31,17 - 31,19",
                        "items": []
                    }
                ]
            },
            {
                "type": "AstStatAssign",
                "location": "33,0 - 33,47",
                "vars": [
                    {
                        "type": "AstExprIndexName",
                        "location": "33,0 - 33,16",
                        "expr": {
                            "type": "AstExprLocal",
                            "location": "33,0 - 33,8",
                            "local": {
                                "luauType": null,
                                "name": "Settings",
                                "type": "AstLocal",
                                "location": "31,6 - 31,14"
                            }
                        },
                        "index": "_values",
                        "indexLocation": "33,9 - 33,16",
                        "op": "."
                    }
                ],
                "values": [
                    {
                        "type": "AstExprCall",
                        "location": "33,19 - 33,47",
                        "func": {
                            "type": "AstExprIndexName",
                            "location": "33,19 - 33,30",
                            "expr": {
                                "type": "AstExprGlobal",
                                "location": "33,19 - 33,24",
                                "global": "table"
                            },
                            "index": "clone",
                            "indexLocation": "33,25 - 33,30",
                            "op": "."
                        },
                        "args": [
                            {
                                "type": "AstExprLocal",
                                "location": "33,31 - 33,46",
                                "local": {
                                    "luauType": null,
                                    "name": "defaultSettings",
                                    "type": "AstLocal",
                                    "location": "11,6 - 11,21"
                                }
                            }
                        ],
                        "self": false,
                        "argLocation": "33,31 - 33,47"
                    }
                ]
            },
            {
                "type": "AstStatAssign",
                "location": "34,0 - 34,30",
                "vars": [
                    {
                        "type": "AstExprIndexName",
                        "location": "34,0 - 34,25",
                        "expr": {
                            "type": "AstExprLocal",
                            "location": "34,0 - 34,8",
                            "local": {
                                "luauType": null,
                                "name": "Settings",
                                "type": "AstLocal",
                                "location": "31,6 - 31,14"
                            }
                        },
                        "index": "_updateListeners",
                        "indexLocation": "34,9 - 34,25",
                        "op": "."
                    }
                ],
                "values": [
                    {
                        "type": "AstExprTable",
                        "location": "34,28 - 34,30",
                        "items": []
                    }
                ]
            },
            {
                "type": "AstStatAssign",
                "location": "35,0 - 35,23",
                "vars": [
                    {
                        "type": "AstExprIndexName",
                        "location": "35,0 - 35,18",
                        "expr": {
                            "type": "AstExprLocal",
                            "location": "35,0 - 35,8",
                            "local": {
                                "luauType": null,
                                "name": "Settings",
                                "type": "AstLocal",
                                "location": "31,6 - 31,14"
                            }
                        },
                        "index": "_bindings",
                        "indexLocation": "35,9 - 35,18",
                        "op": "."
                    }
                ],
                "values": [
                    {
                        "type": "AstExprTable",
                        "location": "35,21 - 35,23",
                        "items": []
                    }
                ]
            },
            {
                "type": "AstStatIf",
                "location": "37,0 - 50,3",
                "condition": {
                    "type": "AstExprLocal",
                    "location": "37,3 - 37,9",
                    "local": {
                        "luauType": null,
                        "name": "plugin",
                        "type": "AstLocal",
                        "location": "4,6 - 4,12"
                    }
                },
                "thenbody": {
                    "type": "AstStatBlock",
                    "location": "37,14 - 50,0",
                    "hasEnd": true,
                    "body": [
                        {
                            "type": "AstStatForIn",
                            "location": "38,3 - 48,6",
                            "vars": [
                                {
                                    "luauType": null,
                                    "name": "name",
                                    "type": "AstLocal",
                                    "location": "38,7 - 38,11"
                                },
                                {
                                    "luauType": null,
                                    "name": "defaultValue",
                                    "type": "AstLocal",
                                    "location": "38,13 - 38,25"
                                }
                            ],
                            "values": [
                                {
                                    "type": "AstExprCall",
                                    "location": "38,29 - 38,52",
                                    "func": {
                                        "type": "AstExprGlobal",
                                        "location": "38,29 - 38,34",
                                        "global": "pairs"
                                    },
                                    "args": [
                                        {
                                            "type": "AstExprIndexName",
                                            "location": "38,35 - 38,51",
                                            "expr": {
                                                "type": "AstExprLocal",
                                                "location": "38,35 - 38,43",
                                                "local": {
                                                    "luauType": null,
                                                    "name": "Settings",
                                                    "type": "AstLocal",
                                                    "location": "31,6 - 31,14"
                                                }
                                            },
                                            "index": "_values",
                                            "indexLocation": "38,44 - 38,51",
                                            "op": "."
                                        }
                                    ],
                                    "self": false,
                                    "argLocation": "38,35 - 38,52"
                                }
                            ],
                            "body": {
                                "type": "AstStatBlock",
                                "location": "38,55 - 48,3",
                                "hasEnd": true,
                                "body": [
                                    {
                                        "type": "AstStatLocal",
                                        "location": "39,4 - 39,57",
                                        "vars": [
                                            {
                                                "luauType": null,
                                                "name": "savedValue",
                                                "type": "AstLocal",
                                                "location": "39,10 - 39,20"
                                            }
                                        ],
                                        "values": [
                                            {
                                                "type": "AstExprCall",
                                                "location": "39,23 - 39,57",
                                                "func": {
                                                    "type": "AstExprIndexName",
                                                    "location": "39,23 - 39,40",
                                                    "expr": {
                                                        "type": "AstExprLocal",
                                                        "location": "39,23 - 39,29",
                                                        "local": {
                                                            "luauType": null,
                                                            "name": "plugin",
                                                            "type": "AstLocal",
                                                            "location": "4,6 - 4,12"
                                                        }
                                                    },
                                                    "index": "GetSetting",
                                                    "indexLocation": "39,30 - 39,40",
                                                    "op": ":"
                                                },
                                                "args": [
                                                    {
                                                        "type": "AstExprBinary",
                                                        "location": "39,41 - 39,56",
                                                        "op": "Concat",
                                                        "left": {
                                                            "type": "AstExprConstantString",
                                                            "location": "39,41 - 39,48",
                                                            "value": "Rojo_"
                                                        },
                                                        "right": {
                                                            "type": "AstExprLocal",
                                                            "location": "39,52 - 39,56",
                                                            "local": {
                                                                "luauType": null,
                                                                "name": "name",
                                                                "type": "AstLocal",
                                                                "location": "38,7 - 38,11"
                                                            }
                                                        }
                                                    }
                                                ],
                                                "self": true,
                                                "argLocation": "39,41 - 39,57"
                                            }
                                        ]
                                    },
                                    {
                                        "type": "AstStatIf",
                                        "location": "41,4 - 47,7",
                                        "condition": {
                                            "type": "AstExprBinary",
                                            "location": "41,7 - 41,24",
                                            "op": "CompareEq",
                                            "left": {
                                                "type": "AstExprLocal",
                                                "location": "41,7 - 41,17",
                                                "local": {
                                                    "luauType": null,
                                                    "name": "savedValue",
                                                    "type": "AstLocal",
                                                    "location": "39,10 - 39,20"
                                                }
                                            },
                                            "right": {
                                                "type": "AstExprConstantNil",
                                                "location": "41,21 - 41,24"
                                            }
                                        },
                                        "thenbody": {
                                            "type": "AstStatBlock",
                                            "location": "41,29 - 45,4",
                                            "hasEnd": true,
                                            "body": [
                                                {
                                                    "type": "AstStatExpr",
                                                    "location": "43,5 - 43,73",
                                                    "expr": {
                                                        "type": "AstExprCall",
                                                        "location": "43,5 - 43,73",
                                                        "func": {
                                                            "type": "AstExprIndexName",
                                                            "location": "43,5 - 43,15",
                                                            "expr": {
                                                                "type": "AstExprGlobal",
                                                                "location": "43,5 - 43,9",
                                                                "global": "task"
                                                            },
                                                            "index": "spawn",
                                                            "indexLocation": "43,10 - 43,15",
                                                            "op": "."
                                                        },
                                                        "args": [
                                                            {
                                                                "type": "AstExprIndexName",
                                                                "location": "43,16 - 43,33",
                                                                "expr": {
                                                                    "type": "AstExprLocal",
                                                                    "location": "43,16 - 43,22",
                                                                    "local": {
                                                                        "luauType": null,
                                                                        "name": "plugin",
                                                                        "type": "AstLocal",
                                                                        "location": "4,6 - 4,12"
                                                                    }
                                                                },
                                                                "index": "SetSetting",
                                                                "indexLocation": "43,23 - 43,33",
                                                                "op": "."
                                                            },
                                                            {
                                                                "type": "AstExprLocal",
                                                                "location": "43,35 - 43,41",
                                                                "local": {
                                                                    "luauType": null,
                                                                    "name": "plugin",
                                                                    "type": "AstLocal",
                                                                    "location": "4,6 - 4,12"
                                                                }
                                                            },
                                                            {
                                                                "type": "AstExprBinary",
                                                                "location": "43,43 - 43,58",
                                                                "op": "Concat",
                                                                "left": {
                                                                    "type": "AstExprConstantString",
                                                                    "location": "43,43 - 43,50",
                                                                    "value": "Rojo_"
                                                                },
                                                                "right": {
                                                                    "type": "AstExprLocal",
                                                                    "location": "43,54 - 43,58",
                                                                    "local": {
                                                                        "luauType": null,
                                                                        "name": "name",
                                                                        "type": "AstLocal",
                                                                        "location": "38,7 - 38,11"
                                                                    }
                                                                }
                                                            },
                                                            {
                                                                "type": "AstExprLocal",
                                                                "location": "43,60 - 43,72",
                                                                "local": {
                                                                    "luauType": null,
                                                                    "name": "defaultValue",
                                                                    "type": "AstLocal",
                                                                    "location": "38,13 - 38,25"
                                                                }
                                                            }
                                                        ],
                                                        "self": false,
                                                        "argLocation": "43,16 - 43,73"
                                                    }
                                                },
                                                {
                                                    "type": "AstStatAssign",
                                                    "location": "44,5 - 44,42",
                                                    "vars": [
                                                        {
                                                            "type": "AstExprIndexExpr",
                                                            "location": "44,5 - 44,27",
                                                            "expr": {
                                                                "type": "AstExprIndexName",
                                                                "location": "44,5 - 44,21",
                                                                "expr": {
                                                                    "type": "AstExprLocal",
                                                                    "location": "44,5 - 44,13",
                                                                    "local": {
                                                                        "luauType": null,
                                                                        "name": "Settings",
                                                                        "type": "AstLocal",
                                                                        "location": "31,6 - 31,14"
                                                                    }
                                                                },
                                                                "index": "_values",
                                                                "indexLocation": "44,14 - 44,21",
                                                                "op": "."
                                                            },
                                                            "index": {
                                                                "type": "AstExprLocal",
                                                                "location": "44,22 - 44,26",
                                                                "local": {
                                                                    "luauType": null,
                                                                    "name": "name",
                                                                    "type": "AstLocal",
                                                                    "location": "38,7 - 38,11"
                                                                }
                                                            }
                                                        }
                                                    ],
                                                    "values": [
                                                        {
                                                            "type": "AstExprLocal",
                                                            "location": "44,30 - 44,42",
                                                            "local": {
                                                                "luauType": null,
                                                                "name": "defaultValue",
                                                                "type": "AstLocal",
                                                                "location": "38,13 - 38,25"
                                                            }
                                                        }
                                                    ]
                                                }
                                            ]
                                        },
                                        "elsebody": {
                                            "type": "AstStatBlock",
                                            "location": "45,8 - 47,4",
                                            "hasEnd": true,
                                            "body": [
                                                {
                                                    "type": "AstStatAssign",
                                                    "location": "46,5 - 46,40",
                                                    "vars": [
                                                        {
                                                            "type": "AstExprIndexExpr",
                                                            "location": "46,5 - 46,27",
                                                            "expr": {
                                                                "type": "AstExprIndexName",
                                                                "location": "46,5 - 46,21",
                                                                "expr": {
                                                                    "type": "AstExprLocal",
                                                                    "location": "46,5 - 46,13",
                                                                    "local": {
                                                                        "luauType": null,
                                                                        "name": "Settings",
                                                                        "type": "AstLocal",
                                                                        "location": "31,6 - 31,14"
                                                                    }
                                                                },
                                                                "index": "_values",
                                                                "indexLocation": "46,14 - 46,21",
                                                                "op": "."
                                                            },
                                                            "index": {
                                                                "type": "AstExprLocal",
                                                                "location": "46,22 - 46,26",
                                                                "local": {
                                                                    "luauType": null,
                                                                    "name": "name",
                                                                    "type": "AstLocal",
                                                                    "location": "38,7 - 38,11"
                                                                }
                                                            }
                                                        }
                                                    ],
                                                    "values": [
                                                        {
                                                            "type": "AstExprLocal",
                                                            "location": "46,30 - 46,40",
                                                            "local": {
                                                                "luauType": null,
                                                                "name": "savedValue",
                                                                "type": "AstLocal",
                                                                "location": "39,10 - 39,20"
                                                            }
                                                        }
                                                    ]
                                                }
                                            ]
                                        },
                                        "hasThen": true
                                    }
                                ]
                            },
                            "hasIn": true,
                            "hasDo": true
                        },
                        {
                            "type": "AstStatExpr",
                            "location": "49,3 - 49,49",
                            "expr": {
                                "type": "AstExprCall",
                                "location": "49,3 - 49,49",
                                "func": {
                                    "type": "AstExprIndexName",
                                    "location": "49,3 - 49,12",
                                    "expr": {
                                        "type": "AstExprLocal",
                                        "location": "49,3 - 49,6",
                                        "local": {
                                            "luauType": null,
                                            "name": "Log",
                                            "type": "AstLocal",
                                            "location": "8,6 - 8,9"
                                        }
                                    },
                                    "index": "trace",
                                    "indexLocation": "49,7 - 49,12",
                                    "op": "."
                                },
                                "args": [
                                    {
                                        "type": "AstExprConstantString",
                                        "location": "49,13 - 49,48",
                                        "value": "Loaded settings from plugin store"
                                    }
                                ],
                                "self": false,
                                "argLocation": "49,13 - 49,49"
                            }
                        }
                    ]
                },
                "hasThen": true
            },
            {
                "type": "AstStatFunction",
                "location": "52,0 - 58,3",
                "name": {
                    "type": "AstExprIndexName",
                    "location": "52,9 - 52,21",
                    "expr": {
                        "type": "AstExprLocal",
                        "location": "52,9 - 52,17",
                        "local": {
                            "luauType": null,
                            "name": "Settings",
                            "type": "AstLocal",
                            "location": "31,6 - 31,14"
                        }
                    },
                    "index": "get",
                    "indexLocation": "52,18 - 52,21",
                    "op": ":"
                },
                "func": {
                    "type": "AstExprFunction",
                    "location": "52,0 - 58,3",
                    "attributes": [],
                    "generics": [],
                    "genericPacks": [],
                    "self": {
                        "luauType": null,
                        "name": "self",
                        "type": "AstLocal",
                        "location": "52,0 - 52,8"
                    },
                    "args": [
                        {
                            "luauType": null,
                            "name": "name",
                            "type": "AstLocal",
                            "location": "52,22 - 52,26"
                        }
                    ],
                    "vararg": false,
                    "varargLocation": "0,0 - 0,0",
                    "body": {
                        "type": "AstStatBlock",
                        "location": "52,27 - 58,0",
                        "hasEnd": true,
                        "body": [
                            {
                                "type": "AstStatIf",
                                "location": "53,3 - 55,6",
                                "condition": {
                                    "type": "AstExprBinary",
                                    "location": "53,6 - 53,34",
                                    "op": "CompareEq",
                                    "left": {
                                        "type": "AstExprIndexExpr",
                                        "location": "53,6 - 53,27",
                                        "expr": {
                                            "type": "AstExprLocal",
                                            "location": "53,6 - 53,21",
                                            "local": {
                                                "luauType": null,
                                                "name": "defaultSettings",
                                                "type": "AstLocal",
                                                "location": "11,6 - 11,21"
                                            }
                                        },
                                        "index": {
                                            "type": "AstExprLocal",
                                            "location": "53,22 - 53,26",
                                            "local": {
                                                "luauType": null,
                                                "name": "name",
                                                "type": "AstLocal",
                                                "location": "52,22 - 52,26"
                                            }
                                        }
                                    },
                                    "right": {
                                        "type": "AstExprConstantNil",
                                        "location": "53,31 - 53,34"
                                    }
                                },
                                "thenbody": {
                                    "type": "AstStatBlock",
                                    "location": "53,39 - 55,3",
                                    "hasEnd": true,
                                    "body": [
                                        {
                                            "type": "AstStatExpr",
                                            "location": "54,4 - 54,55",
                                            "expr": {
                                                "type": "AstExprCall",
                                                "location": "54,4 - 54,55",
                                                "func": {
                                                    "type": "AstExprGlobal",
                                                    "location": "54,4 - 54,9",
                                                    "global": "error"
                                                },
                                                "args": [
                                                    {
                                                        "type": "AstExprBinary",
                                                        "location": "54,10 - 54,51",
                                                        "op": "Concat",
                                                        "left": {
                                                            "type": "AstExprConstantString",
                                                            "location": "54,10 - 54,33",
                                                            "value": "Invalid setings name "
                                                        },
                                                        "right": {
                                                            "type": "AstExprCall",
                                                            "location": "54,37 - 54,51",
                                                            "func": {
                                                                "type": "AstExprGlobal",
                                                                "location": "54,37 - 54,45",
                                                                "global": "tostring"
                                                            },
                                                            "args": [
                                                                {
                                                                    "type": "AstExprLocal",
                                                                    "location": "54,46 - 54,50",
                                                                    "local": {
                                                                        "luauType": null,
                                                                        "name": "name",
                                                                        "type": "AstLocal",
                                                                        "location": "52,22 - 52,26"
                                                                    }
                                                                }
                                                            ],
                                                            "self": false,
                                                            "argLocation": "54,46 - 54,51"
                                                        }
                                                    },
                                                    {
                                                        "type": "AstExprConstantNumber",
                                                        "location": "54,53 - 54,54",
                                                        "value": 2
                                                    }
                                                ],
                                                "self": false,
                                                "argLocation": "54,10 - 54,55"
                                            }
                                        }
                                    ]
                                },
                                "hasThen": true
                            },
                            {
                                "type": "AstStatReturn",
                                "location": "57,3 - 57,28",
                                "list": [
                                    {
                                        "type": "AstExprIndexExpr",
                                        "location": "57,10 - 57,28",
                                        "expr": {
                                            "type": "AstExprIndexName",
                                            "location": "57,10 - 57,22",
                                            "expr": {
                                                "type": "AstExprLocal",
                                                "location": "57,10 - 57,14",
                                                "local": {
                                                    "luauType": null,
                                                    "name": "self",
                                                    "type": "AstLocal",
                                                    "location": "52,0 - 52,8"
                                                }
                                            },
                                            "index": "_values",
                                            "indexLocation": "57,15 - 57,22",
                                            "op": "."
                                        },
                                        "index": {
                                            "type": "AstExprLocal",
                                            "location": "57,23 - 57,27",
                                            "local": {
                                                "luauType": null,
                                                "name": "name",
                                                "type": "AstLocal",
                                                "location": "52,22 - 52,26"
                                            }
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    "functionDepth": 1,
                    "debugname": "get"
                }
            },
            {
                "type": "AstStatFunction",
                "location": "60,0 - 78,3",
                "name": {
                    "type": "AstExprIndexName",
                    "location": "60,9 - 60,21",
                    "expr": {
                        "type": "AstExprLocal",
                        "location": "60,9 - 60,17",
                        "local": {
                            "luauType": null,
                            "name": "Settings",
                            "type": "AstLocal",
                            "location": "31,6 - 31,14"
                        }
                    },
                    "index": "set",
                    "indexLocation": "60,18 - 60,21",
                    "op": ":"
                },
                "func": {
                    "type": "AstExprFunction",
                    "location": "60,0 - 78,3",
                    "attributes": [],
                    "generics": [],
                    "genericPacks": [],
                    "self": {
                        "luauType": null,
                        "name": "self",
                        "type": "AstLocal",
                        "location": "60,0 - 60,8"
                    },
                    "args": [
                        {
                            "luauType": null,
                            "name": "name",
                            "type": "AstLocal",
                            "location": "60,22 - 60,26"
                        },
                        {
                            "luauType": null,
                            "name": "value",
                            "type": "AstLocal",
                            "location": "60,28 - 60,33"
                        }
                    ],
                    "vararg": false,
                    "varargLocation": "0,0 - 0,0",
                    "body": {
                        "type": "AstStatBlock",
                        "location": "60,34 - 78,0",
                        "hasEnd": true,
                        "body": [
                            {
                                "type": "AstStatAssign",
                                "location": "61,3 - 61,29",
                                "vars": [
                                    {
                                        "type": "AstExprIndexExpr",
                                        "location": "61,3 - 61,21",
                                        "expr": {
                                            "type": "AstExprIndexName",
                                            "location": "61,3 - 61,15",
                                            "expr": {
                                                "type": "AstExprLocal",
                                                "location": "61,3 - 61,7",
                                                "local": {
                                                    "luauType": null,
                                                    "name": "self",
                                                    "type": "AstLocal",
                                                    "location": "60,0 - 60,8"
                                                }
                                            },
                                            "index": "_values",
                                            "indexLocation": "61,8 - 61,15",
                                            "op": "."
                                        },
                                        "index": {
                                            "type": "AstExprLocal",
                                            "location": "61,16 - 61,20",
                                            "local": {
                                                "luauType": null,
                                                "name": "name",
                                                "type": "AstLocal",
                                                "location": "60,22 - 60,26"
                                            }
                                        }
                                    }
                                ],
                                "values": [
                                    {
                                        "type": "AstExprLocal",
                                        "location": "61,24 - 61,29",
                                        "local": {
                                            "luauType": null,
                                            "name": "value",
                                            "type": "AstLocal",
                                            "location": "60,28 - 60,33"
                                        }
                                    }
                                ]
                            },
                            {
                                "type": "AstStatIf",
                                "location": "62,3 - 64,6",
                                "condition": {
                                    "type": "AstExprIndexExpr",
                                    "location": "62,6 - 62,26",
                                    "expr": {
                                        "type": "AstExprIndexName",
                                        "location": "62,6 - 62,20",
                                        "expr": {
                                            "type": "AstExprLocal",
                                            "location": "62,6 - 62,10",
                                            "local": {
                                                "luauType": null,
                                                "name": "self",
                                                "type": "AstLocal",
                                                "location": "60,0 - 60,8"
                                            }
                                        },
                                        "index": "_bindings",
                                        "indexLocation": "62,11 - 62,20",
                                        "op": "."
                                    },
                                    "index": {
                                        "type": "AstExprLocal",
                                        "location": "62,21 - 62,25",
                                        "local": {
                                            "luauType": null,
                                            "name": "name",
                                            "type": "AstLocal",
                                            "location": "60,22 - 60,26"
                                        }
                                    }
                                },
                                "thenbody": {
                                    "type": "AstStatBlock",
                                    "location": "62,31 - 64,3",
                                    "hasEnd": true,
                                    "body": [
                                        {
                                            "type": "AstStatExpr",
                                            "location": "63,4 - 63,35",
                                            "expr": {
                                                "type": "AstExprCall",
                                                "location": "63,4 - 63,35",
                                                "func": {
                                                    "type": "AstExprIndexName",
                                                    "location": "63,4 - 63,28",
                                                    "expr": {
                                                        "type": "AstExprIndexExpr",
                                                        "location": "63,4 - 63,24",
                                                        "expr": {
                                                            "type": "AstExprIndexName",
                                                            "location": "63,4 - 63,18",
                                                            "expr": {
                                                                "type": "AstExprLocal",
                                                                "location": "63,4 - 63,8",
                                                                "local": {
                                                                    "luauType": null,
                                                                    "name": "self",
                                                                    "type": "AstLocal",
                                                                    "location": "60,0 - 60,8"
                                                                }
                                                            },
                                                            "index": "_bindings",
                                                            "indexLocation": "63,9 - 63,18",
                                                            "op": "."
                                                        },
                                                        "index": {
                                                            "type": "AstExprLocal",
                                                            "location": "63,19 - 63,23",
                                                            "local": {
                                                                "luauType": null,
                                                                "name": "name",
                                                                "type": "AstLocal",
                                                                "location": "60,22 - 60,26"
                                                            }
                                                        }
                                                    },
                                                    "index": "set",
                                                    "indexLocation": "63,25 - 63,28",
                                                    "op": "."
                                                },
                                                "args": [
                                                    {
                                                        "type": "AstExprLocal",
                                                        "location": "63,29 - 63,34",
                                                        "local": {
                                                            "luauType": null,
                                                            "name": "value",
                                                            "type": "AstLocal",
                                                            "location": "60,28 - 60,33"
                                                        }
                                                    }
                                                ],
                                                "self": false,
                                                "argLocation": "63,29 - 63,35"
                                            }
                                        }
                                    ]
                                },
                                "hasThen": true
                            },
                            {
                                "type": "AstStatIf",
                                "location": "66,3 - 69,6",
                                "condition": {
                                    "type": "AstExprLocal",
                                    "location": "66,6 - 66,12",
                                    "local": {
                                        "luauType": null,
                                        "name": "plugin",
                                        "type": "AstLocal",
                                        "location": "4,6 - 4,12"
                                    }
                                },
                                "thenbody": {
                                    "type": "AstStatBlock",
                                    "location": "66,17 - 69,3",
                                    "hasEnd": true,
                                    "body": [
                                        {
                                            "type": "AstStatExpr",
                                            "location": "68,4 - 68,65",
                                            "expr": {
                                                "type": "AstExprCall",
                                                "location": "68,4 - 68,65",
                                                "func": {
                                                    "type": "AstExprIndexName",
                                                    "location": "68,4 - 68,14",
                                                    "expr": {
                                                        "type": "AstExprGlobal",
                                                        "location": "68,4 - 68,8",
                                                        "global": "task"
                                                    },
                                                    "index": "spawn",
                                                    "indexLocation": "68,9 - 68,14",
                                                    "op": "."
                                                },
                                                "args": [
                                                    {
                                                        "type": "AstExprIndexName",
                                                        "location": "68,15 - 68,32",
                                                        "expr": {
                                                            "type": "AstExprLocal",
                                                            "location": "68,15 - 68,21",
                                                            "local": {
                                                                "luauType": null,
                                                                "name": "plugin",
                                                                "type": "AstLocal",
                                                                "location": "4,6 - 4,12"
                                                            }
                                                        },
                                                        "index": "SetSetting",
                                                        "indexLocation": "68,22 - 68,32",
                                                        "op": "."
                                                    },
                                                    {
                                                        "type": "AstExprLocal",
                                                        "location": "68,34 - 68,40",
                                                        "local": {
                                                            "luauType": null,
                                                            "name": "plugin",
                                                            "type": "AstLocal",
                                                            "location": "4,6 - 4,12"
                                                        }
                                                    },
                                                    {
                                                        "type": "AstExprBinary",
                                                        "location": "68,42 - 68,57",
                                                        "op": "Concat",
                                                        "left": {
                                                            "type": "AstExprConstantString",
                                                            "location": "68,42 - 68,49",
                                                            "value": "Rojo_"
                                                        },
                                                        "right": {
                                                            "type": "AstExprLocal",
                                                            "location": "68,53 - 68,57",
                                                            "local": {
                                                                "luauType": null,
                                                                "name": "name",
                                                                "type": "AstLocal",
                                                                "location": "60,22 - 60,26"
                                                            }
                                                        }
                                                    },
                                                    {
                                                        "type": "AstExprLocal",
                                                        "location": "68,59 - 68,64",
                                                        "local": {
                                                            "luauType": null,
                                                            "name": "value",
                                                            "type": "AstLocal",
                                                            "location": "60,28 - 60,33"
                                                        }
                                                    }
                                                ],
                                                "self": false,
                                                "argLocation": "68,15 - 68,65"
                                            }
                                        }
                                    ]
                                },
                                "hasThen": true
                            },
                            {
                                "type": "AstStatIf",
                                "location": "71,3 - 75,6",
                                "condition": {
                                    "type": "AstExprIndexExpr",
                                    "location": "71,6 - 71,33",
                                    "expr": {
                                        "type": "AstExprIndexName",
                                        "location": "71,6 - 71,27",
                                        "expr": {
                                            "type": "AstExprLocal",
                                            "location": "71,6 - 71,10",
                                            "local": {
                                                "luauType": null,
                                                "name": "self",
                                                "type": "AstLocal",
                                                "location": "60,0 - 60,8"
                                            }
                                        },
                                        "index": "_updateListeners",
                                        "indexLocation": "71,11 - 71,27",
                                        "op": "."
                                    },
                                    "index": {
                                        "type": "AstExprLocal",
                                        "location": "71,28 - 71,32",
                                        "local": {
                                            "luauType": null,
                                            "name": "name",
                                            "type": "AstLocal",
                                            "location": "60,22 - 60,26"
                                        }
                                    }
                                },
                                "thenbody": {
                                    "type": "AstStatBlock",
                                    "location": "71,38 - 75,3",
                                    "hasEnd": true,
                                    "body": [
                                        {
                                            "type": "AstStatForIn",
                                            "location": "72,4 - 74,7",
                                            "vars": [
                                                {
                                                    "luauType": null,
                                                    "name": "callback",
                                                    "type": "AstLocal",
                                                    "location": "72,8 - 72,16"
                                                }
                                            ],
                                            "values": [
                                                {
                                                    "type": "AstExprCall",
                                                    "location": "72,20 - 72,54",
                                                    "func": {
                                                        "type": "AstExprGlobal",
                                                        "location": "72,20 - 72,25",
                                                        "global": "pairs"
                                                    },
                                                    "args": [
                                                        {
                                                            "type": "AstExprIndexExpr",
                                                            "location": "72,26 - 72,53",
                                                            "expr": {
                                                                "type": "AstExprIndexName",
                                                                "location": "72,26 - 72,47",
                                                                "expr": {
                                                                    "type": "AstExprLocal",
                                                                    "location": "72,26 - 72,30",
                                                                    "local": {
                                                                        "luauType": null,
                                                                        "name": "self",
                                                                        "type": "AstLocal",
                                                                        "location": "60,0 - 60,8"
                                                                    }
                                                                },
                                                                "index": "_updateListeners",
                                                                "indexLocation": "72,31 - 72,47",
                                                                "op": "."
                                                            },
                                                            "index": {
                                                                "type": "AstExprLocal",
                                                                "location": "72,48 - 72,52",
                                                                "local": {
                                                                    "luauType": null,
                                                                    "name": "name",
                                                                    "type": "AstLocal",
                                                                    "location": "60,22 - 60,26"
                                                                }
                                                            }
                                                        }
                                                    ],
                                                    "self": false,
                                                    "argLocation": "72,26 - 72,54"
                                                }
                                            ],
                                            "body": {
                                                "type": "AstStatBlock",
                                                "location": "72,57 - 74,4",
                                                "hasEnd": true,
                                                "body": [
                                                    {
                                                        "type": "AstStatExpr",
                                                        "location": "73,5 - 73,32",
                                                        "expr": {
                                                            "type": "AstExprCall",
                                                            "location": "73,5 - 73,32",
                                                            "func": {
                                                                "type": "AstExprIndexName",
                                                                "location": "73,5 - 73,15",
                                                                "expr": {
                                                                    "type": "AstExprGlobal",
                                                                    "location": "73,5 - 73,9",
                                                                    "global": "task"
                                                                },
                                                                "index": "spawn",
                                                                "indexLocation": "73,10 - 73,15",
                                                                "op": "."
                                                            },
                                                            "args": [
                                                                {
                                                                    "type": "AstExprLocal",
                                                                    "location": "73,16 - 73,24",
                                                                    "local": {
                                                                        "luauType": null,
                                                                        "name": "callback",
                                                                        "type": "AstLocal",
                                                                        "location": "72,8 - 72,16"
                                                                    }
                                                                },
                                                                {
                                                                    "type": "AstExprLocal",
                                                                    "location": "73,26 - 73,31",
                                                                    "local": {
                                                                        "luauType": null,
                                                                        "name": "value",
                                                                        "type": "AstLocal",
                                                                        "location": "60,28 - 60,33"
                                                                    }
                                                                }
                                                            ],
                                                            "self": false,
                                                            "argLocation": "73,16 - 73,32"
                                                        }
                                                    }
                                                ]
                                            },
                                            "hasIn": true,
                                            "hasDo": true
                                        }
                                    ]
                                },
                                "hasThen": true
                            },
                            {
                                "type": "AstStatExpr",
                                "location": "77,3 - 77,78",
                                "expr": {
                                    "type": "AstExprCall",
                                    "location": "77,3 - 77,78",
                                    "func": {
                                        "type": "AstExprIndexName",
                                        "location": "77,3 - 77,12",
                                        "expr": {
                                            "type": "AstExprLocal",
                                            "location": "77,3 - 77,6",
                                            "local": {
                                                "luauType": null,
                                                "name": "Log",
                                                "type": "AstLocal",
                                                "location": "8,6 - 8,9"
                                            }
                                        },
                                        "index": "trace",
                                        "indexLocation": "77,7 - 77,12",
                                        "op": "."
                                    },
                                    "args": [
                                        {
                                            "type": "AstExprCall",
                                            "location": "77,13 - 77,77",
                                            "func": {
                                                "type": "AstExprIndexName",
                                                "location": "77,13 - 77,26",
                                                "expr": {
                                                    "type": "AstExprGlobal",
                                                    "location": "77,13 - 77,19",
                                                    "global": "string"
                                                },
                                                "index": "format",
                                                "indexLocation": "77,20 - 77,26",
                                                "op": "."
                                            },
                                            "args": [
                                                {
                                                    "type": "AstExprConstantString",
                                                    "location": "77,27 - 77,53",
                                                    "value": "Set setting '%s' to '%s'"
                                                },
                                                {
                                                    "type": "AstExprLocal",
                                                    "location": "77,55 - 77,59",
                                                    "local": {
                                                        "luauType": null,
                                                        "name": "name",
                                                        "type": "AstLocal",
                                                        "location": "60,22 - 60,26"
                                                    }
                                                },
                                                {
                                                    "type": "AstExprCall",
                                                    "location": "77,61 - 77,76",
                                                    "func": {
                                                        "type": "AstExprGlobal",
                                                        "location": "77,61 - 77,69",
                                                        "global": "tostring"
                                                    },
                                                    "args": [
                                                        {
                                                            "type": "AstExprLocal",
                                                            "location": "77,70 - 77,75",
                                                            "local": {
                                                                "luauType": null,
                                                                "name": "value",
                                                                "type": "AstLocal",
                                                                "location": "60,28 - 60,33"
                                                            }
                                                        }
                                                    ],
                                                    "self": false,
                                                    "argLocation": "77,70 - 77,76"
                                                }
                                            ],
                                            "self": false,
                                            "argLocation": "77,27 - 77,77"
                                        }
                                    ],
                                    "self": false,
                                    "argLocation": "77,13 - 77,78"
                                }
                            }
                        ]
                    },
                    "functionDepth": 1,
                    "debugname": "set"
                }
            },
            {
                "type": "AstStatFunction",
                "location": "80,0 - 94,3",
                "name": {
                    "type": "AstExprIndexName",
                    "location": "80,9 - 80,27",
                    "expr": {
                        "type": "AstExprLocal",
                        "location": "80,9 - 80,17",
                        "local": {
                            "luauType": null,
                            "name": "Settings",
                            "type": "AstLocal",
                            "location": "31,6 - 31,14"
                        }
                    },
                    "index": "onChanged",
                    "indexLocation": "80,18 - 80,27",
                    "op": ":"
                },
                "func": {
                    "type": "AstExprFunction",
                    "location": "80,0 - 94,3",
                    "attributes": [],
                    "generics": [],
                    "genericPacks": [],
                    "self": {
                        "luauType": null,
                        "name": "self",
                        "type": "AstLocal",
                        "location": "80,0 - 80,8"
                    },
                    "args": [
                        {
                            "luauType": null,
                            "name": "name",
                            "type": "AstLocal",
                            "location": "80,28 - 80,32"
                        },
                        {
                            "luauType": null,
                            "name": "callback",
                            "type": "AstLocal",
                            "location": "80,34 - 80,42"
                        }
                    ],
                    "vararg": false,
                    "varargLocation": "0,0 - 0,0",
                    "body": {
                        "type": "AstStatBlock",
                        "location": "80,43 - 94,0",
                        "hasEnd": true,
                        "body": [
                            {
                                "type": "AstStatLocal",
                                "location": "81,3 - 81,48",
                                "vars": [
                                    {
                                        "luauType": null,
                                        "name": "listeners",
                                        "type": "AstLocal",
                                        "location": "81,9 - 81,18"
                                    }
                                ],
                                "values": [
                                    {
                                        "type": "AstExprIndexExpr",
                                        "location": "81,21 - 81,48",
                                        "expr": {
                                            "type": "AstExprIndexName",
                                            "location": "81,21 - 81,42",
                                            "expr": {
                                                "type": "AstExprLocal",
                                                "location": "81,21 - 81,25",
                                                "local": {
                                                    "luauType": null,
                                                    "name": "self",
                                                    "type": "AstLocal",
                                                    "location": "80,0 - 80,8"
                                                }
                                            },
                                            "index": "_updateListeners",
                                            "indexLocation": "81,26 - 81,42",
                                            "op": "."
                                        },
                                        "index": {
                                            "type": "AstExprLocal",
                                            "location": "81,43 - 81,47",
                                            "local": {
                                                "luauType": null,
                                                "name": "name",
                                                "type": "AstLocal",
                                                "location": "80,28 - 80,32"
                                            }
                                        }
                                    }
                                ]
                            },
                            {
                                "type": "AstStatIf",
                                "location": "82,3 - 85,6",
                                "condition": {
                                    "type": "AstExprBinary",
                                    "location": "82,6 - 82,22",
                                    "op": "CompareEq",
                                    "left": {
                                        "type": "AstExprLocal",
                                        "location": "82,6 - 82,15",
                                        "local": {
                                            "luauType": null,
                                            "name": "listeners",
                                            "type": "AstLocal",
                                            "location": "81,9 - 81,18"
                                        }
                                    },
                                    "right": {
                                        "type": "AstExprConstantNil",
                                        "location": "82,19 - 82,22"
                                    }
                                },
                                "thenbody": {
                                    "type": "AstStatBlock",
                                    "location": "82,27 - 85,3",
                                    "hasEnd": true,
                                    "body": [
                                        {
                                            "type": "AstStatAssign",
                                            "location": "83,4 - 83,18",
                                            "vars": [
                                                {
                                                    "type": "AstExprLocal",
                                                    "location": "83,4 - 83,13",
                                                    "local": {
                                                        "luauType": null,
                                                        "name": "listeners",
                                                        "type": "AstLocal",
                                                        "location": "81,9 - 81,18"
                                                    }
                                                }
                                            ],
                                            "values": [
                                                {
                                                    "type": "AstExprTable",
                                                    "location": "83,16 - 83,18",
                                                    "items": []
                                                }
                                            ]
                                        },
                                        {
                                            "type": "AstStatAssign",
                                            "location": "84,4 - 84,43",
                                            "vars": [
                                                {
                                                    "type": "AstExprIndexExpr",
                                                    "location": "84,4 - 84,31",
                                                    "expr": {
                                                        "type": "AstExprIndexName",
                                                        "location": "84,4 - 84,25",
                                                        "expr": {
                                                            "type": "AstExprLocal",
                                                            "location": "84,4 - 84,8",
                                                            "local": {
                                                                "luauType": null,
                                                                "name": "self",
                                                                "type": "AstLocal",
                                                                "location": "80,0 - 80,8"
                                                            }
                                                        },
                                                        "index": "_updateListeners",
                                                        "indexLocation": "84,9 - 84,25",
                                                        "op": "."
                                                    },
                                                    "index": {
                                                        "type": "AstExprLocal",
                                                        "location": "84,26 - 84,30",
                                                        "local": {
                                                            "luauType": null,
                                                            "name": "name",
                                                            "type": "AstLocal",
                                                            "location": "80,28 - 80,32"
                                                        }
                                                    }
                                                }
                                            ],
                                            "values": [
                                                {
                                                    "type": "AstExprLocal",
                                                    "location": "84,34 - 84,43",
                                                    "local": {
                                                        "luauType": null,
                                                        "name": "listeners",
                                                        "type": "AstLocal",
                                                        "location": "81,9 - 81,18"
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                },
                                "hasThen": true
                            },
                            {
                                "type": "AstStatAssign",
                                "location": "86,3 - 86,29",
                                "vars": [
                                    {
                                        "type": "AstExprIndexExpr",
                                        "location": "86,3 - 86,22",
                                        "expr": {
                                            "type": "AstExprLocal",
                                            "location": "86,3 - 86,12",
                                            "local": {
                                                "luauType": null,
                                                "name": "listeners",
                                                "type": "AstLocal",
                                                "location": "81,9 - 81,18"
                                            }
                                        },
                                        "index": {
                                            "type": "AstExprLocal",
                                            "location": "86,13 - 86,21",
                                            "local": {
                                                "luauType": null,
                                                "name": "callback",
                                                "type": "AstLocal",
                                                "location": "80,34 - 80,42"
                                            }
                                        }
                                    }
                                ],
                                "values": [
                                    {
                                        "type": "AstExprConstantBool",
                                        "location": "86,25 - 86,29",
                                        "value": true
                                    }
                                ]
                            },
                            {
                                "type": "AstStatExpr",
                                "location": "88,3 - 88,76",
                                "expr": {
                                    "type": "AstExprCall",
                                    "location": "88,3 - 88,76",
                                    "func": {
                                        "type": "AstExprIndexName",
                                        "location": "88,3 - 88,12",
                                        "expr": {
                                            "type": "AstExprLocal",
                                            "location": "88,3 - 88,6",
                                            "local": {
                                                "luauType": null,
                                                "name": "Log",
                                                "type": "AstLocal",
                                                "location": "8,6 - 8,9"
                                            }
                                        },
                                        "index": "trace",
                                        "indexLocation": "88,7 - 88,12",
                                        "op": "."
                                    },
                                    "args": [
                                        {
                                            "type": "AstExprCall",
                                            "location": "88,13 - 88,75",
                                            "func": {
                                                "type": "AstExprIndexName",
                                                "location": "88,13 - 88,26",
                                                "expr": {
                                                    "type": "AstExprGlobal",
                                                    "location": "88,13 - 88,19",
                                                    "global": "string"
                                                },
                                                "index": "format",
                                                "indexLocation": "88,20 - 88,26",
                                                "op": "."
                                            },
                                            "args": [
                                                {
                                                    "type": "AstExprConstantString",
                                                    "location": "88,27 - 88,68",
                                                    "value": "Added listener for setting '%s' changes"
                                                },
                                                {
                                                    "type": "AstExprLocal",
                                                    "location": "88,70 - 88,74",
                                                    "local": {
                                                        "luauType": null,
                                                        "name": "name",
                                                        "type": "AstLocal",
                                                        "location": "80,28 - 80,32"
                                                    }
                                                }
                                            ],
                                            "self": false,
                                            "argLocation": "88,27 - 88,75"
                                        }
                                    ],
                                    "self": false,
                                    "argLocation": "88,13 - 88,76"
                                }
                            },
                            {
                                "type": "AstStatReturn",
                                "location": "90,3 - 93,6",
                                "list": [
                                    {
                                        "type": "AstExprFunction",
                                        "location": "90,10 - 93,6",
                                        "attributes": [],
                                        "generics": [],
                                        "genericPacks": [],
                                        "args": [],
                                        "vararg": false,
                                        "varargLocation": "0,0 - 0,0",
                                        "body": {
                                            "type": "AstStatBlock",
                                            "location": "90,20 - 93,3",
                                            "hasEnd": true,
                                            "body": [
                                                {
                                                    "type": "AstStatAssign",
                                                    "location": "91,4 - 91,29",
                                                    "vars": [
                                                        {
                                                            "type": "AstExprIndexExpr",
                                                            "location": "91,4 - 91,23",
                                                            "expr": {
                                                                "type": "AstExprLocal",
                                                                "location": "91,4 - 91,13",
                                                                "local": {
                                                                    "luauType": null,
                                                                    "name": "listeners",
                                                                    "type": "AstLocal",
                                                                    "location": "81,9 - 81,18"
                                                                }
                                                            },
                                                            "index": {
                                                                "type": "AstExprLocal",
                                                                "location": "91,14 - 91,22",
                                                                "local": {
                                                                    "luauType": null,
                                                                    "name": "callback",
                                                                    "type": "AstLocal",
                                                                    "location": "80,34 - 80,42"
                                                                }
                                                            }
                                                        }
                                                    ],
                                                    "values": [
                                                        {
                                                            "type": "AstExprConstantNil",
                                                            "location": "91,26 - 91,29"
                                                        }
                                                    ]
                                                },
                                                {
                                                    "type": "AstStatExpr",
                                                    "location": "92,4 - 92,79",
                                                    "expr": {
                                                        "type": "AstExprCall",
                                                        "location": "92,4 - 92,79",
                                                        "func": {
                                                            "type": "AstExprIndexName",
                                                            "location": "92,4 - 92,13",
                                                            "expr": {
                                                                "type": "AstExprLocal",
                                                                "location": "92,4 - 92,7",
                                                                "local": {
                                                                    "luauType": null,
                                                                    "name": "Log",
                                                                    "type": "AstLocal",
                                                                    "location": "8,6 - 8,9"
                                                                }
                                                            },
                                                            "index": "trace",
                                                            "indexLocation": "92,8 - 92,13",
                                                            "op": "."
                                                        },
                                                        "args": [
                                                            {
                                                                "type": "AstExprCall",
                                                                "location": "92,14 - 92,78",
                                                                "func": {
                                                                    "type": "AstExprIndexName",
                                                                    "location": "92,14 - 92,27",
                                                                    "expr": {
                                                                        "type": "AstExprGlobal",
                                                                        "location": "92,14 - 92,20",
                                                                        "global": "string"
                                                                    },
                                                                    "index": "format",
                                                                    "indexLocation": "92,21 - 92,27",
                                                                    "op": "."
                                                                },
                                                                "args": [
                                                                    {
                                                                        "type": "AstExprConstantString",
                                                                        "location": "92,28 - 92,71",
                                                                        "value": "Removed listener for setting '%s' changes"
                                                                    },
                                                                    {
                                                                        "type": "AstExprLocal",
                                                                        "location": "92,73 - 92,77",
                                                                        "local": {
                                                                            "luauType": null,
                                                                            "name": "name",
                                                                            "type": "AstLocal",
                                                                            "location": "80,28 - 80,32"
                                                                        }
                                                                    }
                                                                ],
                                                                "self": false,
                                                                "argLocation": "92,28 - 92,78"
                                                            }
                                                        ],
                                                        "self": false,
                                                        "argLocation": "92,14 - 92,79"
                                                    }
                                                }
                                            ]
                                        },
                                        "functionDepth": 2,
                                        "debugname": ""
                                    }
                                ]
                            }
                        ]
                    },
                    "functionDepth": 1,
                    "debugname": "onChanged"
                }
            },
            {
                "type": "AstStatFunction",
                "location": "96,0 - 111,3",
                "name": {
                    "type": "AstExprIndexName",
                    "location": "96,9 - 96,28",
                    "expr": {
                        "type": "AstExprLocal",
                        "location": "96,9 - 96,17",
                        "local": {
                            "luauType": null,
                            "name": "Settings",
                            "type": "AstLocal",
                            "location": "31,6 - 31,14"
                        }
                    },
                    "index": "getBinding",
                    "indexLocation": "96,18 - 96,28",
                    "op": ":"
                },
                "func": {
                    "type": "AstExprFunction",
                    "location": "96,0 - 111,3",
                    "attributes": [],
                    "generics": [],
                    "genericPacks": [],
                    "self": {
                        "luauType": null,
                        "name": "self",
                        "type": "AstLocal",
                        "location": "96,0 - 96,8"
                    },
                    "args": [
                        {
                            "luauType": null,
                            "name": "name",
                            "type": "AstLocal",
                            "location": "96,29 - 96,33"
                        }
                    ],
                    "vararg": false,
                    "varargLocation": "0,0 - 0,0",
                    "body": {
                        "type": "AstStatBlock",
                        "location": "96,34 - 111,0",
                        "hasEnd": true,
                        "body": [
                            {
                                "type": "AstStatLocal",
                                "location": "97,3 - 97,38",
                                "vars": [
                                    {
                                        "luauType": null,
                                        "name": "cached",
                                        "type": "AstLocal",
                                        "location": "97,9 - 97,15"
                                    }
                                ],
                                "values": [
                                    {
                                        "type": "AstExprIndexExpr",
                                        "location": "97,18 - 97,38",
                                        "expr": {
                                            "type": "AstExprIndexName",
                                            "location": "97,18 - 97,32",
                                            "expr": {
                                                "type": "AstExprLocal",
                                                "location": "97,18 - 97,22",
                                                "local": {
                                                    "luauType": null,
                                                    "name": "self",
                                                    "type": "AstLocal",
                                                    "location": "96,0 - 96,8"
                                                }
                                            },
                                            "index": "_bindings",
                                            "indexLocation": "97,23 - 97,32",
                                            "op": "."
                                        },
                                        "index": {
                                            "type": "AstExprLocal",
                                            "location": "97,33 - 97,37",
                                            "local": {
                                                "luauType": null,
                                                "name": "name",
                                                "type": "AstLocal",
                                                "location": "96,29 - 96,33"
                                            }
                                        }
                                    }
                                ]
                            },
                            {
                                "type": "AstStatIf",
                                "location": "98,3 - 100,6",
                                "condition": {
                                    "type": "AstExprLocal",
                                    "location": "98,6 - 98,12",
                                    "local": {
                                        "luauType": null,
                                        "name": "cached",
                                        "type": "AstLocal",
                                        "location": "97,9 - 97,15"
                                    }
                                },
                                "thenbody": {
                                    "type": "AstStatBlock",
                                    "location": "98,17 - 100,3",
                                    "hasEnd": true,
                                    "body": [
                                        {
                                            "type": "AstStatReturn",
                                            "location": "99,4 - 99,22",
                                            "list": [
                                                {
                                                    "type": "AstExprIndexName",
                                                    "location": "99,11 - 99,22",
                                                    "expr": {
                                                        "type": "AstExprLocal",
                                                        "location": "99,11 - 99,17",
                                                        "local": {
                                                            "luauType": null,
                                                            "name": "cached",
                                                            "type": "AstLocal",
                                                            "location": "97,9 - 97,15"
                                                        }
                                                    },
                                                    "index": "bind",
                                                    "indexLocation": "99,18 - 99,22",
                                                    "op": "."
                                                }
                                            ]
                                        }
                                    ]
                                },
                                "hasThen": true
                            },
                            {
                                "type": "AstStatLocal",
                                "location": "102,3 - 102,60",
                                "vars": [
                                    {
                                        "luauType": null,
                                        "name": "bind",
                                        "type": "AstLocal",
                                        "location": "102,9 - 102,13"
                                    },
                                    {
                                        "luauType": null,
                                        "name": "set",
                                        "type": "AstLocal",
                                        "location": "102,15 - 102,18"
                                    }
                                ],
                                "values": [
                                    {
                                        "type": "AstExprCall",
                                        "location": "102,21 - 102,60",
                                        "func": {
                                            "type": "AstExprIndexName",
                                            "location": "102,21 - 102,40",
                                            "expr": {
                                                "type": "AstExprLocal",
                                                "location": "102,21 - 102,26",
                                                "local": {
                                                    "luauType": null,
                                                    "name": "Roact",
                                                    "type": "AstLocal",
                                                    "location": "9,6 - 9,11"
                                                }
                                            },
                                            "index": "createBinding",
                                            "indexLocation": "102,27 - 102,40",
                                            "op": "."
                                        },
                                        "args": [
                                            {
                                                "type": "AstExprIndexExpr",
                                                "location": "102,41 - 102,59",
                                                "expr": {
                                                    "type": "AstExprIndexName",
                                                    "location": "102,41 - 102,53",
                                                    "expr": {
                                                        "type": "AstExprLocal",
                                                        "location": "102,41 - 102,45",
                                                        "local": {
                                                            "luauType": null,
                                                            "name": "self",
                                                            "type": "AstLocal",
                                                            "location": "96,0 - 96,8"
                                                        }
                                                    },
                                                    "index": "_values",
                                                    "indexLocation": "102,46 - 102,53",
                                                    "op": "."
                                                },
                                                "index": {
                                                    "type": "AstExprLocal",
                                                    "location": "102,54 - 102,58",
                                                    "local": {
                                                        "luauType": null,
                                                        "name": "name",
                                                        "type": "AstLocal",
                                                        "location": "96,29 - 96,33"
                                                    }
                                                }
                                            }
                                        ],
                                        "self": false,
                                        "argLocation": "102,41 - 102,60"
                                    }
                                ]
                            },
                            {
                                "type": "AstStatAssign",
                                "location": "103,3 - 106,4",
                                "vars": [
                                    {
                                        "type": "AstExprIndexExpr",
                                        "location": "103,3 - 103,23",
                                        "expr": {
                                            "type": "AstExprIndexName",
                                            "location": "103,3 - 103,17",
                                            "expr": {
                                                "type": "AstExprLocal",
                                                "location": "103,3 - 103,7",
                                                "local": {
                                                    "luauType": null,
                                                    "name": "self",
                                                    "type": "AstLocal",
                                                    "location": "96,0 - 96,8"
                                                }
                                            },
                                            "index": "_bindings",
                                            "indexLocation": "103,8 - 103,17",
                                            "op": "."
                                        },
                                        "index": {
                                            "type": "AstExprLocal",
                                            "location": "103,18 - 103,22",
                                            "local": {
                                                "luauType": null,
                                                "name": "name",
                                                "type": "AstLocal",
                                                "location": "96,29 - 96,33"
                                            }
                                        }
                                    }
                                ],
                                "values": [
                                    {
                                        "type": "AstExprTable",
                                        "location": "103,26 - 106,4",
                                        "items": [
                                            {
                                                "type": "AstExprTableItem",
                                                "kind": "record",
                                                "key": {
                                                    "type": "AstExprConstantString",
                                                    "location": "104,4 - 104,8",
                                                    "value": "bind"
                                                },
                                                "value": {
                                                    "type": "AstExprLocal",
                                                    "location": "104,11 - 104,15",
                                                    "local": {
                                                        "luauType": null,
                                                        "name": "bind",
                                                        "type": "AstLocal",
                                                        "location": "102,9 - 102,13"
                                                    }
                                                }
                                            },
                                            {
                                                "type": "AstExprTableItem",
                                                "kind": "record",
                                                "key": {
                                                    "type": "AstExprConstantString",
                                                    "location": "105,4 - 105,7",
                                                    "value": "set"
                                                },
                                                "value": {
                                                    "type": "AstExprLocal",
                                                    "location": "105,10 - 105,13",
                                                    "local": {
                                                        "luauType": null,
                                                        "name": "set",
                                                        "type": "AstLocal",
                                                        "location": "102,15 - 102,18"
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                "type": "AstStatExpr",
                                "location": "108,3 - 108,69",
                                "expr": {
                                    "type": "AstExprCall",
                                    "location": "108,3 - 108,69",
                                    "func": {
                                        "type": "AstExprIndexName",
                                        "location": "108,3 - 108,12",
                                        "expr": {
                                            "type": "AstExprLocal",
                                            "location": "108,3 - 108,6",
                                            "local": {
                                                "luauType": null,
                                                "name": "Log",
                                                "type": "AstLocal",
                                                "location": "8,6 - 8,9"
                                            }
                                        },
                                        "index": "trace",
                                        "indexLocation": "108,7 - 108,12",
                                        "op": "."
                                    },
                                    "args": [
                                        {
                                            "type": "AstExprCall",
                                            "location": "108,13 - 108,68",
                                            "func": {
                                                "type": "AstExprIndexName",
                                                "location": "108,13 - 108,26",
                                                "expr": {
                                                    "type": "AstExprGlobal",
                                                    "location": "108,13 - 108,19",
                                                    "global": "string"
                                                },
                                                "index": "format",
                                                "indexLocation": "108,20 - 108,26",
                                                "op": "."
                                            },
                                            "args": [
                                                {
                                                    "type": "AstExprConstantString",
                                                    "location": "108,27 - 108,61",
                                                    "value": "Created binding for setting '%s'"
                                                },
                                                {
                                                    "type": "AstExprLocal",
                                                    "location": "108,63 - 108,67",
                                                    "local": {
                                                        "luauType": null,
                                                        "name": "name",
                                                        "type": "AstLocal",
                                                        "location": "96,29 - 96,33"
                                                    }
                                                }
                                            ],
                                            "self": false,
                                            "argLocation": "108,27 - 108,68"
                                        }
                                    ],
                                    "self": false,
                                    "argLocation": "108,13 - 108,69"
                                }
                            },
                            {
                                "type": "AstStatReturn",
                                "location": "110,3 - 110,14",
                                "list": [
                                    {
                                        "type": "AstExprLocal",
                                        "location": "110,10 - 110,14",
                                        "local": {
                                            "luauType": null,
                                            "name": "bind",
                                            "type": "AstLocal",
                                            "location": "102,9 - 102,13"
                                        }
                                    }
                                ]
                            }
                        ]
                    },
                    "functionDepth": 1,
                    "debugname": "getBinding"
                }
            },
            {
                "type": "AstStatFunction",
                "location": "113,0 - 121,3",
                "name": {
                    "type": "AstExprIndexName",
                    "location": "113,9 - 113,29",
                    "expr": {
                        "type": "AstExprLocal",
                        "location": "113,9 - 113,17",
                        "local": {
                            "luauType": null,
                            "name": "Settings",
                            "type": "AstLocal",
                            "location": "31,6 - 31,14"
                        }
                    },
                    "index": "getBindings",
                    "indexLocation": "113,18 - 113,29",
                    "op": ":"
                },
                "func": {
                    "type": "AstExprFunction",
                    "location": "113,0 - 121,3",
                    "attributes": [],
                    "generics": [],
                    "genericPacks": [],
                    "self": {
                        "luauType": null,
                        "name": "self",
                        "type": "AstLocal",
                        "location": "113,0 - 113,8"
                    },
                    "args": [],
                    "vararg": true,
                    "varargLocation": "113,30 - 113,33",
                    "varargAnnotation": {
                        "type": "AstTypePackVariadic",
                        "location": "113,35 - 113,41",
                        "variadicType": {
                            "type": "AstTypeReference",
                            "location": "113,35 - 113,41",
                            "name": "string",
                            "nameLocation": "113,35 - 113,41",
                            "parameters": []
                        }
                    },
                    "body": {
                        "type": "AstStatBlock",
                        "location": "113,42 - 121,0",
                        "hasEnd": true,
                        "body": [
                            {
                                "type": "AstStatLocal",
                                "location": "114,3 - 114,22",
                                "vars": [
                                    {
                                        "luauType": null,
                                        "name": "bindings",
                                        "type": "AstLocal",
                                        "location": "114,9 - 114,17"
                                    }
                                ],
                                "values": [
                                    {
                                        "type": "AstExprTable",
                                        "location": "114,20 - 114,22",
                                        "items": []
                                    }
                                ]
                            },
                            {
                                "type": "AstStatFor",
                                "location": "115,3 - 118,6",
                                "var": {
                                    "luauType": null,
                                    "name": "i",
                                    "type": "AstLocal",
                                    "location": "115,7 - 115,8"
                                },
                                "from": {
                                    "type": "AstExprConstantNumber",
                                    "location": "115,11 - 115,12",
                                    "value": 1
                                },
                                "to": {
                                    "type": "AstExprCall",
                                    "location": "115,14 - 115,30",
                                    "func": {
                                        "type": "AstExprGlobal",
                                        "location": "115,14 - 115,20",
                                        "global": "select"
                                    },
                                    "args": [
                                        {
                                            "type": "AstExprConstantString",
                                            "location": "115,21 - 115,24",
                                            "value": "#"
                                        },
                                        {
                                            "type": "AstExprVarargs",
                                            "location": "115,26 - 115,29"
                                        }
                                    ],
                                    "self": false,
                                    "argLocation": "115,21 - 115,30"
                                },
                                "body": {
                                    "type": "AstStatBlock",
                                    "location": "115,33 - 118,3",
                                    "hasEnd": true,
                                    "body": [
                                        {
                                            "type": "AstStatLocal",
                                            "location": "116,4 - 116,33",
                                            "vars": [
                                                {
                                                    "luauType": null,
                                                    "name": "source",
                                                    "type": "AstLocal",
                                                    "location": "116,10 - 116,16"
                                                }
                                            ],
                                            "values": [
                                                {
                                                    "type": "AstExprCall",
                                                    "location": "116,19 - 116,33",
                                                    "func": {
                                                        "type": "AstExprGlobal",
                                                        "location": "116,19 - 116,25",
                                                        "global": "select"
                                                    },
                                                    "args": [
                                                        {
                                                            "type": "AstExprLocal",
                                                            "location": "116,26 - 116,27",
                                                            "local": {
                                                                "luauType": null,
                                                                "name": "i",
                                                                "type": "AstLocal",
                                                                "location": "115,7 - 115,8"
                                                            }
                                                        },
                                                        {
                                                            "type": "AstExprVarargs",
                                                            "location": "116,29 - 116,32"
                                                        }
                                                    ],
                                                    "self": false,
                                                    "argLocation": "116,26 - 116,33"
                                                }
                                            ]
                                        },
                                        {
                                            "type": "AstStatAssign",
                                            "location": "117,4 - 117,46",
                                            "vars": [
                                                {
                                                    "type": "AstExprIndexExpr",
                                                    "location": "117,4 - 117,20",
                                                    "expr": {
                                                        "type": "AstExprLocal",
                                                        "location": "117,4 - 117,12",
                                                        "local": {
                                                            "luauType": null,
                                                            "name": "bindings",
                                                            "type": "AstLocal",
                                                            "location": "114,9 - 114,17"
                                                        }
                                                    },
                                                    "index": {
                                                        "type": "AstExprLocal",
                                                        "location": "117,13 - 117,19",
                                                        "local": {
                                                            "luauType": null,
                                                            "name": "source",
                                                            "type": "AstLocal",
                                                            "location": "116,10 - 116,16"
                                                        }
                                                    }
                                                }
                                            ],
                                            "values": [
                                                {
                                                    "type": "AstExprCall",
                                                    "location": "117,23 - 117,46",
                                                    "func": {
                                                        "type": "AstExprIndexName",
                                                        "location": "117,23 - 117,38",
                                                        "expr": {
                                                            "type": "AstExprLocal",
                                                            "location": "117,23 - 117,27",
                                                            "local": {
                                                                "luauType": null,
                                                                "name": "self",
                                                                "type": "AstLocal",
                                                                "location": "113,0 - 113,8"
                                                            }
                                                        },
                                                        "index": "getBinding",
                                                        "indexLocation": "117,28 - 117,38",
                                                        "op": ":"
                                                    },
                                                    "args": [
                                                        {
                                                            "type": "AstExprLocal",
                                                            "location": "117,39 - 117,45",
                                                            "local": {
                                                                "luauType": null,
                                                                "name": "source",
                                                                "type": "AstLocal",
                                                                "location": "116,10 - 116,16"
                                                            }
                                                        }
                                                    ],
                                                    "self": true,
                                                    "argLocation": "117,39 - 117,46"
                                                }
                                            ]
                                        }
                                    ]
                                },
                                "hasDo": true
                            },
                            {
                                "type": "AstStatReturn",
                                "location": "120,3 - 120,38",
                                "list": [
                                    {
                                        "type": "AstExprCall",
                                        "location": "120,10 - 120,38",
                                        "func": {
                                            "type": "AstExprIndexName",
                                            "location": "120,10 - 120,28",
                                            "expr": {
                                                "type": "AstExprLocal",
                                                "location": "120,10 - 120,15",
                                                "local": {
                                                    "luauType": null,
                                                    "name": "Roact",
                                                    "type": "AstLocal",
                                                    "location": "9,6 - 9,11"
                                                }
                                            },
                                            "index": "joinBindings",
                                            "indexLocation": "120,16 - 120,28",
                                            "op": "."
                                        },
                                        "args": [
                                            {
                                                "type": "AstExprLocal",
                                                "location": "120,29 - 120,37",
                                                "local": {
                                                    "luauType": null,
                                                    "name": "bindings",
                                                    "type": "AstLocal",
                                                    "location": "114,9 - 114,17"
                                                }
                                            }
                                        ],
                                        "self": false,
                                        "argLocation": "120,29 - 120,38"
                                    }
                                ]
                            }
                        ]
                    },
                    "functionDepth": 1,
                    "debugname": "getBindings"
                }
            },
            {
                "type": "AstStatReturn",
                "location": "123,0 - 123,15",
                "list": [
                    {
                        "type": "AstExprLocal",
                        "location": "123,7 - 123,15",
                        "local": {
                            "luauType": null,
                            "name": "Settings",
                            "type": "AstLocal",
                            "location": "31,6 - 31,14"
                        }
                    }
                ]
            }
        ]
    },
    "commentLocations": [
        {
            "type": "BlockComment",
            "location": "0,0 - 2,2"
        },
        {
            "type": "Comment",
            "location": "42,5 - 42,97"
        },
        {
            "type": "Comment",
            "location": "67,4 - 67,96"
        }
    ]
}