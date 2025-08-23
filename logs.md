[
  {
    "metadata": {
      "version": "1.4.3",
      "timestamp": "2025-08-23T16:16:29.448Z",
      "totalLibraries": 48,
      "successCount": 44,
      "failureCount": 4
    },
    "libraries": {
      "lodash": {
        "status": "success",
        "available": true,
        "sample": {
          "map": [
            2,
            4,
            6,
            8,
            10
          ],
          "filter": [
            3,
            4,
            5
          ],
          "chunk": [
            [
              1,
              2
            ],
            [
              3,
              4
            ],
            [
              5
            ]
          ],
          "uniq": [
            1,
            2,
            3
          ]
        }
      },
      "moment": {
        "status": "success",
        "available": true,
        "sample": {
          "current": "2025-08-23 16:16:29",
          "addDays": "2025-08-30",
          "timezone": "2024-01-01T00:00:00-05:00",
          "fromNow": "2 years ago"
        }
      },
      "dayjs": {
        "status": "success",
        "available": true,
        "sample": {
          "current": "2025-08-23 16:16:29",
          "addDays": "2025-08-30",
          "diff": -235,
          "isValid": true
        }
      },
      "dateFns": {
        "status": "success",
        "available": true,
        "sample": {
          "format": "2025-08-23",
          "addDays": "2025-08-30",
          "differenceInDays": -235,
          "isAfter": true
        }
      },
      "axios": {
        "status": "success",
        "available": true,
        "type": "function",
        "methods": [
          "get",
          "post",
          "put",
          "delete"
        ],
        "sample": {
          "description": "HTTP client for API requests",
          "usage": "await axios.get(\"https://api.example.com/data\")"
        }
      },
      "cheerio": {
        "status": "success",
        "available": true,
        "sample": {
          "h1Text": "Title",
          "pText": "Hello World",
          "elementCount": 6,
          "hasClass": true
        }
      },
      "joi": {
        "status": "success",
        "available": true,
        "sample": {
          "validData": true,
          "invalidData": true,
          "errorMessage": "\"name\" is required"
        }
      },
      "yup": {
        "status": "success",
        "available": true,
        "sample": {
          "validEmail": true,
          "invalidEmail": true,
          "schemaFields": [
            "email",
            "age"
          ]
        }
      },
      "zod": {
        "status": "failed",
        "error": "z is not defined"
      },
      "cryptoJs": {
        "status": "success",
        "available": true,
        "sample": {
          "md5": "b10a8db164e0754105b7a99be72e3fe5",
          "sha256": "a591a6d40bf42040...",
          "hmac": "0e599bb7e462cdcf...",
          "aesEncrypt": "U2FsdGVkX1/qmbacKQmC..."
        }
      },
      "uuid": {
        "status": "success",
        "available": true,
        "sample": {
          "v4": "5af8e0ee-705a-437d-abc5-aebf21b06209",
          "v1": "86b46dd0-803c-11f0-b8e4-d97acafdaada",
          "validate": true,
          "nil": "00000000-0000-0000-0000-000000000000"
        }
      },
      "jsonwebtoken": {
        "status": "success",
        "available": true,
        "sample": {
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiO...",
          "decoded": {
            "userId": 123,
            "role": "admin",
            "iat": 1755965789
          },
          "verified": true
        }
      },
      "xml2js": {
        "status": "success",
        "available": true,
        "sample": {
          "parsed": {
            "root": {
              "item": [
                {
                  "_": "Test",
                  "$": {
                    "id": "1"
                  }
                }
              ]
            }
          },
          "builder": "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n<test>\n  <value>hello</value>\n</test>"
        }
      },
      "yaml": {
        "status": "success",
        "available": true,
        "sample": {
          "stringify": "name: test\nitems:\n  - 1\n  - 2\n  - 3\n",
          "parse": {
            "name": "test",
            "items": [
              1,
              2
            ]
          },
          "isValid": true
        }
      },
      "csvParse": {
        "status": "failed",
        "error": "csvParse is not a function"
      },
      "papaParse": {
        "status": "success",
        "available": true,
        "sample": {
          "data": [
            {
              "name": "John",
              "age": "30",
              "city": "NYC"
            },
            {
              "name": "Jane",
              "age": "25",
              "city": "LA"
            }
          ],
          "fields": [
            "name",
            "age",
            "city"
          ],
          "rowCount": 2
        }
      },
      "xlsx": {
        "status": "failed",
        "error": "xlsx is not defined"
      },
      "pdfLib": {
        "status": "success",
        "available": true,
        "sample": {
          "PDFDocument": true,
          "rgb": true,
          "degrees": true,
          "description": "PDF creation and manipulation"
        }
      },
      "archiver": {
        "status": "success",
        "available": true,
        "type": "function",
        "sample": {
          "description": "Create ZIP and TAR archives",
          "usage": "archiver(\"zip\", { zlib: { level: 9 } })"
        }
      },
      "jimp": {
        "status": "success",
        "available": true,
        "sample": {
          "description": "Image processing in pure JavaScript",
          "methods": [
            "loadFont"
          ]
        }
      },
      "qrcode": {
        "status": "success",
        "available": true,
        "sample": {
          "description": "QR code generation",
          "methods": [
            "toDataURL",
            "toString",
            "toCanvas"
          ]
        }
      },
      "mathjs": {
        "status": "success",
        "available": true,
        "sample": {
          "evaluate": 14,
          "sqrt": 4,
          "factorial": 120,
          "matrix": [
            2,
            2
          ]
        }
      },
      "stringSimilarity": {
        "status": "success",
        "available": true,
        "sample": {
          "similarity": 0.4444444444444444,
          "bestMatch": {
            "target": "hello",
            "rating": 1
          },
          "ratings": [
            {
              "target": "hi",
              "rating": 0
            },
            {
              "target": "hello",
              "rating": 1
            }
          ]
        }
      },
      "fuse": {
        "status": "success",
        "available": true,
        "sample": {
          "searchResult": {
            "name": "Jane"
          },
          "resultCount": 2,
          "description": "Fuzzy search library"
        }
      },
      "slug": {
        "status": "success",
        "available": true,
        "sample": {
          "basic": "hello-world",
          "unicode": "2024",
          "custom": "helloworld"
        }
      },
      "pluralize": {
        "status": "success",
        "available": true,
        "sample": {
          "plural": "apples",
          "singular": "apple",
          "isPlural": true,
          "isSingular": true
        }
      },
      "nanoid": {
        "status": "success",
        "available": true,
        "sample": {
          "id": "XrFPjjOoIcvWk9f1mhm7D",
          "length": 21,
          "description": "Tiny, secure URL-safe unique ID generator"
        }
      },
      "ms": {
        "status": "success",
        "available": true,
        "sample": {
          "toMs": 7200000,
          "toString": "1m",
          "days": 864000000
        }
      },
      "bytes": {
        "status": "success",
        "available": true,
        "sample": {
          "parse": 1024,
          "format": "1KB",
          "formatOptions": "1.46 KB"
        }
      },
      "currency": {
        "status": "failed",
        "error": "value.add(...).value is not a function"
      },
      "qs": {
        "status": "success",
        "available": true,
        "sample": {
          "stringify": "name=John&age=30&tags%5B0%5D=js&tags%5B1%5D=node",
          "parse": {
            "name": "John",
            "age": "30"
          },
          "nested": "user%5Bname%5D=Jane"
        }
      },
      "formData": {
        "status": "success",
        "available": true,
        "sample": {
          "type": "function",
          "canAppend": true,
          "canGetHeaders": true
        }
      },
      "ini": {
        "status": "success",
        "available": true,
        "sample": {
          "stringify": "[database]\nhost=localhost\nport=3306\n",
          "parse": {
            "database": {
              "host": "localhost",
              "port": "3306"
            }
          },
          "sections": [
            "database"
          ]
        }
      },
      "toml": {
        "status": "success",
        "available": true,
        "sample": {
          "parsed": {
            "title": "Example",
            "database": {
              "host": "localhost"
            }
          },
          "title": "Example",
          "hasDatabase": true
        }
      },
      "phoneNumber": {
        "status": "success",
        "available": true,
        "sample": {
          "isValid": true,
          "country": "US",
          "nationalNumber": "4155552671",
          "format": "+1 415 555 2671"
        }
      },
      "iban": {
        "status": "success",
        "available": true,
        "sample": {
          "isValid": true,
          "country": "DE",
          "printFormat": "DE89 3704 0044 0532 0130 00"
        }
      },
      "ethers": {
        "status": "success",
        "available": true,
        "sample": {
          "hasWallet": true,
          "hasUtils": false,
          "description": "Ethereum blockchain interaction"
        }
      },
      "web3": {
        "status": "success",
        "available": true,
        "sample": {
          "type": "object",
          "description": "Ethereum JavaScript API"
        }
      },
      "ytdl": {
        "status": "success",
        "available": true,
        "sample": {
          "type": "function",
          "description": "YouTube video downloader",
          "usage": "ytdl(url, { quality: \"highest\" })"
        }
      },
      "ffmpeg": {
        "status": "success",
        "available": true,
        "sample": {
          "type": "function",
          "description": "Video/audio processing",
          "usage": "ffmpeg(inputPath).output(outputPath)"
        }
      },
      "franc": {
        "status": "success",
        "available": true,
        "sample": {
          "english": "eng",
          "spanish": "spa",
          "french": "fra",
          "german": "deu",
          "detection": "eng"
        }
      },
      "compromise": {
        "status": "success",
        "available": true,
        "sample": {
          "people": [
            "Steve Jobs"
          ],
          "places": [
            "Cupertino, California."
          ],
          "organizations": [
            "Apple",
            "Inc."
          ],
          "verbs": [
            "was founded"
          ],
          "nouns": [
            "Apple Inc.",
            "Steve Jobs in Cupertino, California."
          ]
        }
      },
      "pRetry": {
        "status": "success",
        "available": true,
        "type": "function",
        "sample": {
          "description": "Retry failed promises with exponential backoff",
          "hasAbortError": true,
          "usage": "await pRetry(asyncFunc, { retries: 3 })"
        }
      },
      "pLimit": {
        "status": "success",
        "available": true,
        "sample": {
          "type": "function",
          "limitCreated": true,
          "activeCount": 0,
          "pendingCount": 0,
          "description": "Run async functions with limited concurrency"
        }
      },
      "htmlToText": {
        "status": "success",
        "available": true,
        "sample": {
          "input": "<h1>Title</h1><p>This is <strong>bold</strong> text.</p><a href=\"#\">Link</a>",
          "output": "TITLE\n\nThis is bold text.\n\nLink",
          "hasNoHtml": true
        }
      },
      "marked": {
        "status": "success",
        "available": true,
        "sample": {
          "input": "# Title\n\n**Bold** and *italic* text.\n\n- Item 1\n- Item 2",
          "output": "<h1>Title</h1>\n<p><strong>Bold</strong> and <em>italic</em> text.</p>\n<ul>\n<li>Item 1</li>\n<li>Item ...",
          "hasHtml": true
        }
      },
      "jsonDiff": {
        "status": "success",
        "available": true,
        "sample": {
          "obj1": {
            "a": 1,
            "b": 2,
            "c": {
              "d": 3
            }
          },
          "obj2": {
            "a": 1,
            "b": 3,
            "c": {
              "d": 3,
              "e": 4
            },
            "f": 5
          },
          "differences": [
            {
              "type": "UPDATE",
              "key": "b",
              "value": 3,
              "oldValue": 2
            },
            {
              "type": "UPDATE",
              "key": "c",
              "changes": [
                {
                  "type": "ADD",
                  "key": "e",
                  "value": 4
                }
              ]
            },
            {
              "type": "ADD",
              "key": "f",
              "value": 5
            }
          ],
          "hasChanges": true
        }
      },
      "cronParser": {
        "status": "success",
        "available": true,
        "sample": {
          "expression": "0 0 * * * (daily at midnight)",
          "parsed": null,
          "nextRuns": [],
          "hasParser": false
        }
      }
    },
    "summary": {
      "overall": {
        "total": 48,
        "success": 44,
        "failed": 4,
        "successRate": "92%"
      },
      "byCategory": {
        "Core Utilities": {
          "total": 1,
          "success": 1,
          "failed": 0,
          "libraries": [
            {
              "name": "lodash",
              "status": "success"
            }
          ]
        },
        "Date/Time": {
          "total": 3,
          "success": 3,
          "failed": 0,
          "libraries": [
            {
              "name": "moment",
              "status": "success"
            },
            {
              "name": "dayjs",
              "status": "success"
            },
            {
              "name": "dateFns",
              "status": "success"
            }
          ]
        },
        "HTTP & Web": {
          "total": 2,
          "success": 2,
          "failed": 0,
          "libraries": [
            {
              "name": "axios",
              "status": "success"
            },
            {
              "name": "cheerio",
              "status": "success"
            }
          ]
        },
        "Validation": {
          "total": 3,
          "success": 2,
          "failed": 1,
          "libraries": [
            {
              "name": "joi",
              "status": "success"
            },
            {
              "name": "yup",
              "status": "success"
            },
            {
              "name": "zod",
              "status": "failed"
            }
          ]
        },
        "Crypto & Security": {
          "total": 3,
          "success": 3,
          "failed": 0,
          "libraries": [
            {
              "name": "cryptoJs",
              "status": "success"
            },
            {
              "name": "uuid",
              "status": "success"
            },
            {
              "name": "jsonwebtoken",
              "status": "success"
            }
          ]
        },
        "Data Formats": {
          "total": 4,
          "success": 3,
          "failed": 1,
          "libraries": [
            {
              "name": "xml2js",
              "status": "success"
            },
            {
              "name": "yaml",
              "status": "success"
            },
            {
              "name": "csvParse",
              "status": "failed"
            },
            {
              "name": "papaParse",
              "status": "success"
            }
          ]
        },
        "File Processing": {
          "total": 3,
          "success": 2,
          "failed": 1,
          "libraries": [
            {
              "name": "xlsx",
              "status": "failed"
            },
            {
              "name": "pdfLib",
              "status": "success"
            },
            {
              "name": "archiver",
              "status": "success"
            }
          ]
        },
        "Image & Media": {
          "total": 2,
          "success": 2,
          "failed": 0,
          "libraries": [
            {
              "name": "jimp",
              "status": "success"
            },
            {
              "name": "qrcode",
              "status": "success"
            }
          ]
        },
        "Math": {
          "total": 1,
          "success": 1,
          "failed": 0,
          "libraries": [
            {
              "name": "mathjs",
              "status": "success"
            }
          ]
        },
        "Text Processing": {
          "total": 4,
          "success": 4,
          "failed": 0,
          "libraries": [
            {
              "name": "stringSimilarity",
              "status": "success"
            },
            {
              "name": "fuse",
              "status": "success"
            },
            {
              "name": "slug",
              "status": "success"
            },
            {
              "name": "pluralize",
              "status": "success"
            }
          ]
        },
        "Utilities": {
          "total": 4,
          "success": 3,
          "failed": 1,
          "libraries": [
            {
              "name": "nanoid",
              "status": "success"
            },
            {
              "name": "ms",
              "status": "success"
            },
            {
              "name": "bytes",
              "status": "success"
            },
            {
              "name": "currency",
              "status": "failed"
            }
          ]
        },
        "Form & HTTP": {
          "total": 2,
          "success": 2,
          "failed": 0,
          "libraries": [
            {
              "name": "qs",
              "status": "success"
            },
            {
              "name": "formData",
              "status": "success"
            }
          ]
        },
        "File Formats": {
          "total": 2,
          "success": 2,
          "failed": 0,
          "libraries": [
            {
              "name": "ini",
              "status": "success"
            },
            {
              "name": "toml",
              "status": "success"
            }
          ]
        },
        "International": {
          "total": 2,
          "success": 2,
          "failed": 0,
          "libraries": [
            {
              "name": "phoneNumber",
              "status": "success"
            },
            {
              "name": "iban",
              "status": "success"
            }
          ]
        },
        "Blockchain": {
          "total": 2,
          "success": 2,
          "failed": 0,
          "libraries": [
            {
              "name": "ethers",
              "status": "success"
            },
            {
              "name": "web3",
              "status": "success"
            }
          ]
        },
        "Media": {
          "total": 2,
          "success": 2,
          "failed": 0,
          "libraries": [
            {
              "name": "ytdl",
              "status": "success"
            },
            {
              "name": "ffmpeg",
              "status": "success"
            }
          ]
        },
        "NLP & Language (NEW)": {
          "total": 2,
          "success": 2,
          "failed": 0,
          "libraries": [
            {
              "name": "franc",
              "status": "success"
            },
            {
              "name": "compromise",
              "status": "success"
            }
          ]
        },
        "Async Control (NEW)": {
          "total": 2,
          "success": 2,
          "failed": 0,
          "libraries": [
            {
              "name": "pRetry",
              "status": "success"
            },
            {
              "name": "pLimit",
              "status": "success"
            }
          ]
        },
        "Text Conversion (NEW)": {
          "total": 2,
          "success": 2,
          "failed": 0,
          "libraries": [
            {
              "name": "htmlToText",
              "status": "success"
            },
            {
              "name": "marked",
              "status": "success"
            }
          ]
        },
        "Data Operations (NEW)": {
          "total": 2,
          "success": 2,
          "failed": 0,
          "libraries": [
            {
              "name": "jsonDiff",
              "status": "success"
            },
            {
              "name": "cronParser",
              "status": "success"
            }
          ]
        }
      }
    },
    "newLibrariesStatus": {
      "message": "Version 1.4.x Added Libraries",
      "libraries": {
        "franc": "success",
        "compromise": "success",
        "pRetry": "success",
        "pLimit": "success",
        "htmlToText": "success",
        "marked": "success",
        "jsonDiff": "success",
        "cronParser": "success"
      },
      "allWorking": true
    }
  }
]
