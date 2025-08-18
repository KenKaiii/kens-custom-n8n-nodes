[
  {
    "timestamp": "2025-08-18T16:21:43.241Z",
    "ms_debug": {
      "exists": false,
      "type": "undefined",
      "is_function": false,
      "test_attempts": {},
      "error": "ms is not defined"
    },
    "currency_debug": {
      "exists": true,
      "type": "object",
      "is_function": false,
      "test_attempts": {
        "error": "currency is not a function",
        "stack": "TypeError: currency is not a function\n    at evalmachine.<anonymous>:79:17\n    at evalmachine.<anonymous>:162:6\n    at Script.runInContext (node:vm:149:12)\n    at runInContext (node:vm:301:6)\n    at SuperCodeNode.executeCodeBatch (/home/ken/.n8n/nodes/node_modules/@kenkaiii/n8n-nodes-supercode/dist/SuperCodeNode.node.bundled.js:217774:52)\n    at ExecuteContext.execute (/home/ken/.n8n/nodes/node_modules/@kenkaiii/n8n-nodes-supercode/dist/SuperCodeNode.node.bundled.js:217922:24)\n    at WorkflowExecute.runNode (/home/ken/.nvm/versions/node/v24.3.0/lib/node_modules/n8n/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1212:9)\n    at /home/ken/.nvm/versions/node/v24.3.0/lib/node_modules/n8n/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:1582:27\n    at /home/ken/.nvm/versions/node/v24.3.0/lib/node_modules/n8n/node_modules/n8n-core/src/execution-engine/workflow-execute.ts:2158:11"
      },
      "properties": [
        "__esModule",
        "default"
      ]
    },
    "environment_info": {
      "available_globals": [
        "$",
        "$input",
        "$binary",
        "$data",
        "$env",
        "$evaluateExpression",
        "$item",
        "$fromAI",
        "$fromai",
        "$fromAi",
        "$items",
        "$json",
        "$node",
        "$self",
        "$parameter",
        "$rawParameter",
        "$prevNode",
        "$runIndex",
        "$mode",
        "$workflow"
      ],
      "has_require": false,
      "has_module": false,
      "has_exports": false,
      "has_global": true,
      "has_process": false,
      "nodejs_version": "N/A"
    },
    "working_library_samples": {
      "lodash": {
        "exists": true,
        "test": 6
      },
      "dayjs": {
        "exists": true,
        "test": "2025-08-19T02:21:43+10:00"
      },
      "uuid": {
        "exists": true,
        "test": 36
      }
    }
  }
]
