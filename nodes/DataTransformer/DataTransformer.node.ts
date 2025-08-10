import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
	NodeConnectionType,
} from 'n8n-workflow';

export class DataTransformer implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Data Transformer',
		name: 'dataTransformer',
		icon: 'fa:exchange-alt',
		group: ['transform'],
		version: 1,
		description: 'Transform and manipulate JSON data with various operations',
		defaults: {
			name: 'Data Transformer',
		},
		inputs: [{ displayName: '', type: NodeConnectionType.Main }],
		outputs: [{ displayName: '', type: NodeConnectionType.Main }],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: false,
				options: [
					{
						name: 'Add Field',
						value: 'addField',
						description: 'Add a new field to the data',
						action: 'Add a field to the data',
					},
					{
						name: 'Remove Field',
						value: 'removeField',
						description: 'Remove a field from the data',
						action: 'Remove a field from the data',
					},
					{
						name: 'Rename Field',
						value: 'renameField',
						description: 'Rename an existing field',
						action: 'Rename a field in the data',
					},
					{
						name: 'Transform Text',
						value: 'transformText',
						description: 'Transform text field (uppercase, lowercase, etc.)',
						action: 'Transform text in the data',
					},
					{
						name: 'Calculate',
						value: 'calculate',
						description: 'Perform mathematical calculations',
						action: 'Perform calculations on numeric data',
					},
				],
				default: 'addField',
				description: 'The operation to perform on the data',
			},
			// Add Field Options
			{
				displayName: 'Field Name',
				name: 'fieldName',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['addField', 'removeField'],
					},
				},
				default: '',
				description: 'Name of the field to add or remove',
				required: true,
			},
			{
				displayName: 'Field Value',
				name: 'fieldValue',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['addField'],
					},
				},
				default: '',
				description: 'Value for the new field (supports expressions)',
			},
			// Rename Field Options
			{
				displayName: 'Original Field Name',
				name: 'originalFieldName',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['renameField', 'transformText'],
					},
				},
				default: '',
				description: 'Current name of the field',
				required: true,
			},
			{
				displayName: 'New Field Name',
				name: 'newFieldName',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['renameField'],
					},
				},
				default: '',
				description: 'New name for the field',
				required: true,
			},
			// Transform Text Options
			{
				displayName: 'Transform Type',
				name: 'transformType',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['transformText'],
					},
				},
				options: [
					{
						name: 'Uppercase',
						value: 'uppercase',
					},
					{
						name: 'Lowercase',
						value: 'lowercase',
					},
					{
						name: 'Title Case',
						value: 'titlecase',
					},
					{
						name: 'Reverse',
						value: 'reverse',
					},
				],
				default: 'uppercase',
				description: 'How to transform the text',
			},
			// Calculate Options
			{
				displayName: 'Field 1',
				name: 'field1',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['calculate'],
					},
				},
				default: '',
				description: 'First field for calculation',
				required: true,
			},
			{
				displayName: 'Operation Type',
				name: 'operationType',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['calculate'],
					},
				},
				options: [
					{
						name: 'Add',
						value: 'add',
					},
					{
						name: 'Subtract',
						value: 'subtract',
					},
					{
						name: 'Multiply',
						value: 'multiply',
					},
					{
						name: 'Divide',
						value: 'divide',
					},
				],
				default: 'add',
				description: 'Mathematical operation to perform',
			},
			{
				displayName: 'Field 2',
				name: 'field2',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['calculate'],
					},
				},
				default: '',
				description: 'Second field for calculation',
				required: true,
			},
			{
				displayName: 'Result Field Name',
				name: 'resultFieldName',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['calculate'],
					},
				},
				default: 'result',
				description: 'Name of the field to store the calculation result',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;
				let newItem: INodeExecutionData = {
					json: { ...items[i].json },
				};

				switch (operation) {
					case 'addField': {
						const fieldName = this.getNodeParameter('fieldName', i) as string;
						const fieldValue = this.getNodeParameter('fieldValue', i) as string;
						newItem.json[fieldName] = fieldValue;
						break;
					}

					case 'removeField': {
						const fieldName = this.getNodeParameter('fieldName', i) as string;
						delete newItem.json[fieldName];
						break;
					}

					case 'renameField': {
						const originalFieldName = this.getNodeParameter('originalFieldName', i) as string;
						const newFieldName = this.getNodeParameter('newFieldName', i) as string;
						
						if (newItem.json[originalFieldName] !== undefined) {
							newItem.json[newFieldName] = newItem.json[originalFieldName];
							delete newItem.json[originalFieldName];
						}
						break;
					}

					case 'transformText': {
						const fieldName = this.getNodeParameter('originalFieldName', i) as string;
						const transformType = this.getNodeParameter('transformType', i) as string;
						const originalValue = newItem.json[fieldName];

						if (typeof originalValue === 'string') {
							let transformedValue: string;
							switch (transformType) {
								case 'uppercase':
									transformedValue = originalValue.toUpperCase();
									break;
								case 'lowercase':
									transformedValue = originalValue.toLowerCase();
									break;
								case 'titlecase':
									transformedValue = originalValue.replace(/\w\S*/g, (txt) =>
										txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
									);
									break;
								case 'reverse':
									transformedValue = originalValue.split('').reverse().join('');
									break;
								default:
									transformedValue = originalValue;
							}
							newItem.json[fieldName] = transformedValue;
						}
						break;
					}

					case 'calculate': {
						const field1 = this.getNodeParameter('field1', i) as string;
						const field2 = this.getNodeParameter('field2', i) as string;
						const operationType = this.getNodeParameter('operationType', i) as string;
						const resultFieldName = this.getNodeParameter('resultFieldName', i) as string;

						const value1 = parseFloat(String(newItem.json[field1]));
						const value2 = parseFloat(String(newItem.json[field2]));

						if (isNaN(value1) || isNaN(value2)) {
							throw new NodeOperationError(this.getNode(), `Cannot perform calculation: ${field1}=${newItem.json[field1]}, ${field2}=${newItem.json[field2]}`);
						}

						let result: number;
						switch (operationType) {
							case 'add':
								result = value1 + value2;
								break;
							case 'subtract':
								result = value1 - value2;
								break;
							case 'multiply':
								result = value1 * value2;
								break;
							case 'divide':
								if (value2 === 0) {
									throw new NodeOperationError(this.getNode(), 'Cannot divide by zero');
								}
								result = value1 / value2;
								break;
							default:
								throw new NodeOperationError(this.getNode(), `Unknown operation type: ${operationType}`);
						}

						newItem.json[resultFieldName] = result;
						break;
					}

					default:
						throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
				}

				returnData.push(newItem);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
							input: items[i].json,
						},
						error,
						pairedItem: { item: i },
					});
				} else {
					throw error;
				}
			}
		}

		return [returnData];
	}
}