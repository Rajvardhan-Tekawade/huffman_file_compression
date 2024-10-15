import mammoth from 'mammoth';
import pdfjs from './pdfWorker';

// HuffmanNode class to represent a node in the Huffman tree
class HuffmanNode {
    char: string;
    freq: number;
    left: HuffmanNode | null;
    right: HuffmanNode | null;

    constructor(char: string, freq: number) {
        this.char = char;
        this.freq = freq;
        this.left = null;
        this.right = null;
    }
}

// Function to build the Huffman tree from the given text
function buildHuffmanTree(text: string): HuffmanNode {
    const freqMap: Map<string, number> = new Map();

    // Calculate frequency of each character in the text
    for (const char of text) {
        freqMap.set(char, (freqMap.get(char) || 0) + 1);
    }

    // Create an array of HuffmanNodes from the frequency map
    const nodes: HuffmanNode[] = Array.from(freqMap.entries()).map(([char, freq]) => new HuffmanNode(char, freq));

    // Build the Huffman tree using a priority queue (min-heap)
    while (nodes.length > 1) {
        // Sort the nodes based on frequency
        nodes.sort((a, b) => a.freq - b.freq);
        
        // Take the two nodes with the smallest frequencies
        const left = nodes.shift()!;
        const right = nodes.shift()!;
        
        // Create a new internal node with these two nodes as children
        const parent = new HuffmanNode('', left.freq + right.freq);
        parent.left = left;
        parent.right = right;
        
        // Add the new node back to the array
        nodes.push(parent);
    }

    // The last node is the root of the Huffman tree
    return nodes[0];
}

// Function to build the Huffman codes from the Huffman tree
function buildHuffmanCodes(root: HuffmanNode): Map<string, string> {
    const codes: Map<string, string> = new Map();

    function traverse(node: HuffmanNode, code: string) {
        if (!node.left && !node.right) {
            // Leaf node, store the character and its code
            codes.set(node.char, code);
            return;
        }
        if (node.left) traverse(node.left, code + '0'); // Append '0' for left child
        if (node.right) traverse(node.right, code + '1'); // Append '1' for right child
    }

    traverse(root, '');
    return codes;
}

// Function to get text from various file types
async function getTextFromFile(file: File): Promise<string> {
    const extension = file.name.split('.').pop()?.toLowerCase();

    switch (extension) {
        case 'docx':
            const arrayBufferDocx = await file.arrayBuffer();
            const bufferDocx = new Uint8Array(arrayBufferDocx);
            const { value: docxText } = await mammoth.extractRawText({ arrayBuffer: bufferDocx });
            return docxText;
        case 'pdf':
            const arrayBufferPdf = await file.arrayBuffer();
            const pdf = await pdfjs.getDocument({ data: arrayBufferPdf }).promise;
            let pdfText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                pdfText += content.items.map((item: any) => item.str).join(' ') + '\n';
            }
            return pdfText;
        case 'txt':
            return await file.text();
        default:
            throw new Error('Unsupported file format. Please upload .txt, .docx, or .pdf files.');
    }
}

// Function to preprocess text (removing extra spaces)
function preprocessText(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
}

// Function to compress the file using Huffman coding
export const compressFile = async (file: File): Promise<Uint8Array> => {
    console.log('Starting file compression...');
    const text = preprocessText(await getTextFromFile(file));
    const root = buildHuffmanTree(text);
    const codes = buildHuffmanCodes(root);

    let encodedText = '';
    for (const char of text) {
        encodedText += codes.get(char);
    }

    const padding = 8 - (encodedText.length % 8);
    encodedText = encodedText.padEnd(encodedText.length + padding, '0');

    // Store the character frequencies
    const freqMap = new Map<string, number>();
    for (const char of text) {
        freqMap.set(char, (freqMap.get(char) || 0) + 1);
    }

    // Convert frequency map to a binary format
    const freqEntries = Array.from(freqMap.entries());
    const freqData = new Uint8Array(freqEntries.length * 3); // 2 bytes for char code, 1 byte for frequency
    freqEntries.forEach(([char, freq], index) => {
        const charCode = char.charCodeAt(0);
        freqData[index * 3] = charCode >> 8; // High byte of char code
        freqData[index * 3 + 1] = charCode & 0xFF; // Low byte of char code
        freqData[index * 3 + 2] = freq > 255 ? 255 : freq; // Frequency (capped at 255)
    });

    // Prepare compressed data
    const compressedData = new Uint8Array(Math.ceil(encodedText.length / 8) + 1);
    compressedData[0] = padding;

    for (let i = 0; i < encodedText.length; i += 8) {
        const byte = parseInt(encodedText.slice(i, i + 8), 2);
        compressedData[Math.floor(i / 8) + 1] = byte;
    }

    // Combine frequency data with compressed data
    const finalData = new Uint8Array(4 + freqData.length + compressedData.length);
    new DataView(finalData.buffer).setUint32(0, freqData.length / 3); // Store number of frequency entries
    finalData.set(freqData, 4);
    finalData.set(compressedData, 4 + freqData.length);

    return finalData;
}

// Function to decompress the file using Huffman coding
export const decompressFile = async (file: File): Promise<Uint8Array> => {
    console.log('Starting file decompression...');
    const buffer = await file.arrayBuffer();
    const data = new Uint8Array(buffer);

    // Extract frequency data
    const freqEntriesCount = new DataView(data.buffer).getUint32(0);
    const freqData = data.slice(4, 4 + freqEntriesCount * 3);
    const freqMap = new Map<string, number>();

    for (let i = 0; i < freqEntriesCount; i++) {
        const charCode = (freqData[i * 3] << 8) | freqData[i * 3 + 1];
        const freq = freqData[i * 3 + 2];
        freqMap.set(String.fromCharCode(charCode), freq);
    }

    // Reconstruct Huffman tree
    const root = buildHuffmanTree(Array.from(freqMap.entries()).map(([char, freq]) => char.repeat(freq)).join(''));

    // Extract compressed data
    const compressedData = data.slice(4 + freqEntriesCount * 3);
    const padding = compressedData[0];
    let encodedText = '';

    for (let i = 1; i < compressedData.length; i++) {
        encodedText += compressedData[i].toString(2).padStart(8, '0');
    }

    encodedText = encodedText.slice(0, -padding);

    let current = root;
    let decodedText = '';

    for (const bit of encodedText) {
        if (bit === '0') {
            current = current.left!;
        } else {
            current = current.right!;
        }

        if (!current.left && !current.right) {
            decodedText += current.char;
            current = root;
        }
    }

    // Convert the decoded text back to a Uint8Array
    const result: Uint8Array = new TextEncoder().encode(decodedText);
    
    return result;
}
