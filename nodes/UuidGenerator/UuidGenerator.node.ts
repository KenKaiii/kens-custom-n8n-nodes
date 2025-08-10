import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
} from 'n8n-workflow';

import { randomBytes, createHash } from 'crypto';

export class UuidGenerator implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'UUID Generator',
		name: 'uuidGenerator',
		icon: 'fa:fingerprint',
		group: ['transform'],
		version: 1,
		description: 'Generate UUIDs, random IDs, and unique identifiers',
		defaults: {
			name: 'UUID Generator',
		},
		inputs: [{ displayName: '', type: NodeConnectionType.Main }],
		outputs: [{ displayName: '', type: NodeConnectionType.Main }],
		properties: [
			{
				displayName: 'ID Type',
				name: 'idType',
				type: 'options',
				options: [
					{
						name: 'UUID v4',
						value: 'uuid4',
						description: 'Standard random UUID (most common)',
					},
					{
						name: 'Short ID',
						value: 'shortId',
						description: 'Short random alphanumeric ID (8 characters)',
					},
					{
						name: 'Long ID',
						value: 'longId',
						description: 'Long random alphanumeric ID (16 characters)',
					},
					{
						name: 'Numeric ID',
						value: 'numericId',
						description: 'Random numeric ID',
					},
					{
						name: 'Hash ID',
						value: 'hashId',
						description: 'Generate hash from input data',
					},
				],
				default: 'uuid4',
				description: 'The type of unique identifier to generate',
			},
			{
				displayName: 'Field Name',
				name: 'fieldName',
				type: 'string',
				default: 'id',
				placeholder: 'id',
				description: 'Name of the field to add the generated ID to',
				required: true,
			},
			{
				displayName: 'Numeric ID Length',
				name: 'numericLength',
				type: 'number',
				displayOptions: {
					show: {
						idType: ['numericId'],
					},
				},
				default: 10,
				description: 'Number of digits for the numeric ID',
				typeOptions: {
					minValue: 4,
					maxValue: 20,
				},
			},
			{
				displayName: 'Hash Input Field',
				name: 'hashInputField',
				type: 'string',
				displayOptions: {
					show: {
						idType: ['hashId'],
					},
				},
				default: '',
				placeholder: 'email',
				description: 'Field name to use as input for hash generation',
				required: true,
			},
			{
				displayName: 'Hash Algorithm',
				name: 'hashAlgorithm',
				type: 'options',
				displayOptions: {
					show: {
						idType: ['hashId'],
					},
				},
				options: [
					{
						name: 'SHA-256',
						value: 'sha256',
					},
					{
						name: 'SHA-1',
						value: 'sha1',
					},
					{
						name: 'MD5',
						value: 'md5',
					},
				],
				default: 'sha256',
				description: 'Hash algorithm to use',
			},
			{
				displayName: 'Hash Length',
				name: 'hashLength',
				type: 'number',
				displayOptions: {
					show: {
						idType: ['hashId'],
					},
				},
				default: 8,
				description: 'Number of characters from the hash to use (full hash if 0)',
				typeOptions: {
					minValue: 0,
					maxValue: 64,
				},
			},
			{
				displayName: 'Quantity',
				name: 'quantity',
				type: 'number',
				default: 1,
				description: 'Number of IDs to generate per input item',
				typeOptions: {
					minValue: 1,
					maxValue: 100,
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const idType = this.getNodeParameter('idType', i) as string;
				const fieldName = this.getNodeParameter('fieldName', i) as string;
				const quantity = this.getNodeParameter('quantity', i) as number;

				const baseItem = { ...items[i].json };

				for (let q = 0; q < quantity; q++) {
					let generatedId: string;

					switch (idType) {
						case 'uuid4':
							generatedId = UuidGenerator.generateUUID4();
							break;
						case 'shortId':
							generatedId = UuidGenerator.generateAlphanumericId(8);
							break;
						case 'longId':
							generatedId = UuidGenerator.generateAlphanumericId(16);
							break;
						case 'numericId':
							const numericLength = this.getNodeParameter('numericLength', i) as number;
							generatedId = UuidGenerator.generateNumericId(numericLength);
							break;
						case 'hashId':
							const hashInputField = this.getNodeParameter('hashInputField', i) as string;
							const hashAlgorithm = this.getNodeParameter('hashAlgorithm', i) as string;
							const hashLength = this.getNodeParameter('hashLength', i) as number;
							const inputValue = baseItem[hashInputField];
							
							if (inputValue === undefined) {
								throw new Error(`Hash input field '${hashInputField}' not found in data`);
							}
							
							generatedId = UuidGenerator.generateHashId(String(inputValue), hashAlgorithm, hashLength);
							break;
						default:
							generatedId = UuidGenerator.generateUUID4();
					}

					const newItem: INodeExecutionData = {
						json: {
							...baseItem,
							[fieldName]: generatedId,
							_metadata: {
								idType,
								generatedAt: new Date().toISOString(),
								quantity: q + 1,
							},
						},
					};

					returnData.push(newItem);
				}
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

	static generateUUID4(): string {
		const bytes = randomBytes(16);
		
		// Set version (4) and variant bits
		bytes[6] = (bytes[6] & 0x0f) | 0x40;
		bytes[8] = (bytes[8] & 0x3f) | 0x80;
		
		const hex = bytes.toString('hex');
		return [
			hex.substring(0, 8),
			hex.substring(8, 12),
			hex.substring(12, 16),
			hex.substring(16, 20),
			hex.substring(20, 32),
		].join('-');
	}

	static generateAlphanumericId(length: number): string {
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		const bytes = randomBytes(length);
		let result = '';
		
		for (let i = 0; i < length; i++) {
			result += chars[bytes[i] % chars.length];
		}
		
		return result;
	}

	static generateNumericId(length: number): string {
		const bytes = randomBytes(length);
		let result = '';
		
		for (let i = 0; i < length; i++) {
			// Ensure first digit is not 0
			if (i === 0) {
				result += String((bytes[i] % 9) + 1);
			} else {
				result += String(bytes[i] % 10);
			}
		}
		
		return result;
	}

	static generateHashId(input: string, algorithm: string, length: number): string {
		const hash = createHash(algorithm).update(input).digest('hex');
		return length > 0 ? hash.substring(0, length) : hash;
	}
}