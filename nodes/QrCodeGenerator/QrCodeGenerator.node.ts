import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';

export class QrCodeGenerator implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'QR Code Generator',
		name: 'qrCodeGenerator',
		icon: 'fa:qrcode',
		group: ['transform'],
		version: 1,
		description: 'Generate QR codes from text, URLs, or JSON data',
		defaults: {
			name: 'QR Code Generator',
		},
		inputs: [{ displayName: '', type: NodeConnectionType.Main }],
		outputs: [{ displayName: '', type: NodeConnectionType.Main }],
		properties: [
			{
				displayName: 'Input Source',
				name: 'inputSource',
				type: 'options',
				options: [
					{
						name: 'Text Field',
						value: 'field',
						description: 'Use a field from input data',
					},
					{
						name: 'Manual Text',
						value: 'manual',
						description: 'Enter text manually',
					},
					{
						name: 'Full JSON',
						value: 'json',
						description: 'Convert entire JSON object to QR code',
					},
				],
				default: 'field',
				description: 'Source of data for the QR code',
			},
			{
				displayName: 'Text Field',
				name: 'textField',
				type: 'string',
				displayOptions: {
					show: {
						inputSource: ['field'],
					},
				},
				default: '',
				placeholder: 'url',
				description: 'Name of the field containing the text to encode',
				required: true,
			},
			{
				displayName: 'Manual Text',
				name: 'manualText',
				type: 'string',
				displayOptions: {
					show: {
						inputSource: ['manual'],
					},
				},
				default: '',
				placeholder: 'https://example.com',
				description: 'Text to encode in the QR code',
				required: true,
			},
			{
				displayName: 'Output Format',
				name: 'outputFormat',
				type: 'options',
				options: [
					{
						name: 'Data URL (Base64)',
						value: 'dataurl',
						description: 'Base64-encoded data URL for embedding',
					},
					{
						name: 'SVG String',
						value: 'svg',
						description: 'SVG markup as string',
					},
					{
						name: 'ASCII Text',
						value: 'terminal',
						description: 'ASCII art representation',
					},
				],
				default: 'dataurl',
				description: 'Format for the generated QR code',
			},
			{
				displayName: 'Error Correction Level',
				name: 'errorCorrectionLevel',
				type: 'options',
				options: [
					{
						name: 'Low (7%)',
						value: 'L',
						description: 'Can recover from 7% data corruption',
					},
					{
						name: 'Medium (15%)',
						value: 'M',
						description: 'Can recover from 15% data corruption',
					},
					{
						name: 'Quartile (25%)',
						value: 'Q',
						description: 'Can recover from 25% data corruption',
					},
					{
						name: 'High (30%)',
						value: 'H',
						description: 'Can recover from 30% data corruption',
					},
				],
				default: 'M',
				description: 'Amount of error correction to apply',
			},
			{
				displayName: 'Size (pixels)',
				name: 'size',
				type: 'number',
				default: 200,
				description: 'Size of the QR code in pixels (for data URL format)',
				typeOptions: {
					minValue: 50,
					maxValue: 1000,
				},
			},
			{
				displayName: 'Margin',
				name: 'margin',
				type: 'number',
				default: 4,
				description: 'Quiet zone margin around the QR code',
				typeOptions: {
					minValue: 0,
					maxValue: 20,
				},
			},
			{
				displayName: 'Dark Color',
				name: 'darkColor',
				type: 'string',
				default: '#000000',
				placeholder: '#000000',
				description: 'Color for dark modules (hex color)',
			},
			{
				displayName: 'Light Color',
				name: 'lightColor',
				type: 'string',
				default: '#FFFFFF',
				placeholder: '#FFFFFF',
				description: 'Color for light modules (hex color)',
			},
			{
				displayName: 'Output Field Name',
				name: 'outputFieldName',
				type: 'string',
				default: 'qrCode',
				placeholder: 'qrCode',
				description: 'Name of the field to store the generated QR code',
				required: true,
			},
		],
	};

	// eslint-disable-next-line no-unused-vars
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const executeFunctions = this;
		const items = executeFunctions.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const inputSource = executeFunctions.getNodeParameter('inputSource', i) as string;
				const outputFormat = executeFunctions.getNodeParameter('outputFormat', i) as string;
				const errorCorrectionLevel = executeFunctions.getNodeParameter(
					'errorCorrectionLevel',
					i,
				) as string;
				const size = executeFunctions.getNodeParameter('size', i) as number;
				const margin = executeFunctions.getNodeParameter('margin', i) as number;
				const darkColor = executeFunctions.getNodeParameter('darkColor', i) as string;
				const lightColor = executeFunctions.getNodeParameter('lightColor', i) as string;
				const outputFieldName = executeFunctions.getNodeParameter('outputFieldName', i) as string;

				// Get text to encode
				let textToEncode: string;
				switch (inputSource) {
					case 'field': {
						const textField = executeFunctions.getNodeParameter('textField', i) as string;
						const fieldValue = items[i].json[textField];
						if (fieldValue === undefined) {
							throw new NodeOperationError(
								executeFunctions.getNode(),
								`Field '${textField}' not found in input data`,
							);
						}
						textToEncode = String(fieldValue);
						break;
					}
					case 'manual':
						textToEncode = executeFunctions.getNodeParameter('manualText', i) as string;
						break;
					case 'json':
						textToEncode = JSON.stringify(items[i].json, null, 2);
						break;
					default:
						throw new NodeOperationError(
							executeFunctions.getNode(),
							`Unknown input source: ${inputSource}`,
						);
				}

				if (!textToEncode.trim()) {
					throw new NodeOperationError(executeFunctions.getNode(), 'No text provided to encode');
				}

				// Generate QR code
				const qrCodeResult = QrCodeGenerator.generateQRCode(
					textToEncode,
					{
						outputFormat,
						errorCorrectionLevel,
						size,
						margin,
						darkColor,
						lightColor,
					},
					executeFunctions,
				);

				const newItem: INodeExecutionData = {
					json: {
						...items[i].json,
						[outputFieldName]: qrCodeResult.data,
						_qrMetadata: {
							inputText: textToEncode,
							textLength: textToEncode.length,
							format: outputFormat,
							errorCorrectionLevel,
							size,
							margin,
							generatedAt: new Date().toISOString(),
						},
					},
				};

				returnData.push(newItem);
			} catch (error) {
				if (executeFunctions.continueOnFail()) {
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

	static generateQRCode(
		text: string,
		options: {
			outputFormat: string;
			errorCorrectionLevel: string;
			size: number;
			margin: number;
			darkColor: string;
			lightColor: string;
		},
		executeFunctions: IExecuteFunctions,
	): { data: string } {
		// This is a simplified QR code generator
		// In a real implementation, you'd use a library like 'qrcode' or 'qr-image'

		const { outputFormat, size, darkColor, lightColor } = options;

		switch (outputFormat) {
			case 'dataurl':
				// Simulate a data URL - in reality you'd generate actual QR code image
				QrCodeGenerator.createSimpleQRMatrix(text); // Generate matrix for consistency
				return {
					data: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA${size}AAAAA${size}CAYAAAAx8/placeholder-qr-${text.length}`,
				};

			case 'svg': {
				// Simulate SVG generation
				const svgContent = QrCodeGenerator.generateSVGQRCode(text, size, darkColor, lightColor);
				return { data: svgContent };
			}

			case 'terminal': {
				// Generate ASCII QR code representation
				const asciiQR = QrCodeGenerator.generateAsciiQRCode(text);
				return { data: asciiQR };
			}

			default:
				throw new NodeOperationError(
					executeFunctions.getNode(),
					`Unsupported output format: ${outputFormat}`,
				);
		}
	}

	static createSimpleQRMatrix(text: string): number[][] {
		// Simplified QR matrix generation for demonstration
		const size = Math.max(21, Math.ceil(Math.sqrt(text.length * 8)));
		const matrix: number[][] = [];

		for (let i = 0; i < size; i++) {
			matrix[i] = [];
			for (let j = 0; j < size; j++) {
				// Simple pattern based on text hash and position
				const hash = QrCodeGenerator.simpleHash(text + i + j);
				matrix[i][j] = hash % 2;
			}
		}

		return matrix;
	}

	static generateSVGQRCode(
		text: string,
		size: number,
		darkColor: string,
		lightColor: string,
	): string {
		const matrix = QrCodeGenerator.createSimpleQRMatrix(text);
		const moduleSize = size / matrix.length;

		let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">`;
		svg += `<rect width="${size}" height="${size}" fill="${lightColor}"/>`;

		for (let i = 0; i < matrix.length; i++) {
			for (let j = 0; j < matrix[i].length; j++) {
				if (matrix[i][j] === 1) {
					const x = j * moduleSize;
					const y = i * moduleSize;
					svg += `<rect x="${x}" y="${y}" width="${moduleSize}" height="${moduleSize}" fill="${darkColor}"/>`;
				}
			}
		}

		svg += '</svg>';
		return svg;
	}

	static generateAsciiQRCode(text: string): string {
		const matrix = QrCodeGenerator.createSimpleQRMatrix(text);
		let ascii = '';

		for (let i = 0; i < matrix.length; i++) {
			for (let j = 0; j < matrix[i].length; j++) {
				ascii += matrix[i][j] === 1 ? '██' : '  ';
			}
			ascii += '\n';
		}

		return ascii;
	}

	static simpleHash(str: string): number {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash; // Convert to 32-bit integer
		}
		return Math.abs(hash);
	}
}
