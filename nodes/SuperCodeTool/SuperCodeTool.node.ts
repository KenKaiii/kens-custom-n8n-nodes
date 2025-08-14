import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	ISupplyDataFunctions,
	NodeConnectionType,
	NodeOperationError,
	SupplyData,
} from 'n8n-workflow';

export class SuperCodeTool implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Super Code Tool',
		name: 'superCodeTool',
		icon: { light: 'file:supercode.svg', dark: 'file:supercode.svg' },
		group: ['transform'],
		version: 1,
		description: 'AI Agent code execution tool with JavaScript/Python and 34+ enhanced libraries',
		defaults: {
			name: 'Super Code Tool',
		},
		inputs: [],
		outputs: [NodeConnectionType.AiTool],
		outputNames: ['Tool'],
		credentials: [],
		properties: [],
	};

	async supplyData(this: ISupplyDataFunctions, _itemIndex: number): Promise<SupplyData> {
		// Return the SuperCode tool
		const tool = {
			name: 'super_code_tool',
			description:
				'Execute JavaScript/Python code with enhanced libraries including lodash, axios, pandas, numpy, and 30+ more libraries',
			schema: {
				type: 'object',
				properties: {
					language: {
						type: 'string',
						enum: ['javascript', 'python'],
						description: 'Programming language to execute (javascript or python)',
					},
					code: {
						type: 'string',
						description: 'Code to execute with access to enhanced libraries',
					},
				},
				required: ['language', 'code'],
			},
		};

		return { response: [tool] };
	}

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		// This node doesn't execute in the traditional sense
		// It only supplies data (tools) via supplyData
		throw new NodeOperationError(
			this.getNode(),
			'This node only provides tools to AI agents and cannot be executed directly.',
		);
	}
}
