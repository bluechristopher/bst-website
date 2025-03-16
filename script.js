class TreeNode {
	constructor(val) {
		this.val = val;
		this.left = null;
		this.right = null;
	}
}

class BST {
	constructor() {
		this.root = null;
		this.duplicates = []; 
	}
	
	insert(val) {
		const newNode = new TreeNode(val);
		
		if (!this.root) {
			this.root = newNode;
			return true;
		}
		
		const insertNode = (node, newNode) => {
			if (newNode.val === node.val) {
				return false;
			}
			
			if (typeof newNode.val === 'string') {
				if (newNode.val < node.val) {
					if (node.left === null) {
						node.left = newNode;
						return true;
					} else {
						return insertNode(node.left, newNode);
					}
				} else {
					if (node.right === null) {
						node.right = newNode;
						return true;
					} else {
						return insertNode(node.right, newNode);
					}
				}
			} else {
				if (newNode.val < node.val) {
					if (node.left === null) {
						node.left = newNode;
						return true;
					} else {
						return insertNode(node.left, newNode);
					}
				} else {
					if (node.right === null) {
						node.right = newNode;
						return true;
					} else {
						return insertNode(node.right, newNode);
					}
				}
			}
		};
		
		return insertNode(this.root, newNode);
	}
	
	preOrderTraversal(callback) {
		const traverse = (node) => {
			if (node !== null) {
				callback(node.val);
				traverse(node.left);
				traverse(node.right);
			}
		};
		
		traverse(this.root);
	}
	
	inOrderTraversal(callback) {
		const traverse = (node) => {
			if (node !== null) {
				traverse(node.left);
				callback(node.val);
				traverse(node.right);
			}
		};
		
		traverse(this.root);
	}
	
	postOrderTraversal(callback) {
		const traverse = (node) => {
			if (node !== null) {
				traverse(node.left);
				traverse(node.right);
				callback(node.val);
			}
		};
		
		traverse(this.root);
	}
	
	getHeight() {
		const findHeight = (node) => {
			if (node === null) return 0;
			
			const leftHeight = findHeight(node.left);
			const rightHeight = findHeight(node.right);
			
			return Math.max(leftHeight, rightHeight) + 1;
		};
		
		return findHeight(this.root);
	}
	
	getCoordinates() {
		const coordinates = {};
		const nodesByLevel = {};
		
		const groupByLevel = (node, level = 0) => {
			if (!node) return;
			
			if (!nodesByLevel[level]) {
				nodesByLevel[level] = [];
			}
			
			nodesByLevel[level].push(node);
			groupByLevel(node.left, level + 1);
			groupByLevel(node.right, level + 1);
		};
		
		function findParent(node, potentialParents) {
			for (const potential of potentialParents) {
				if (potential.left === node || potential.right === node) {
					return potential;
				}
			}
			return null;
		}
		
		groupByLevel(this.root);
		
		if (this.root) {
			coordinates[this.root.val] = { x: 0.5, y: 50 };
		}
		
		const levels = Object.keys(nodesByLevel).sort((a, b) => parseInt(a) - parseInt(b));
		for (let i = 1; i < levels.length; i++) {
			const level = parseInt(levels[i]);
			const nodesAtLevel = nodesByLevel[level];
			
			const sortedNodes = [...nodesAtLevel].sort((a, b) => {
				const parentA = findParent(a, nodesByLevel[level - 1] || []);
				const parentB = findParent(b, nodesByLevel[level - 1] || []);
				if (!parentA || !parentB || !coordinates[parentA.val] || !coordinates[parentB.val]) return 0;
				return coordinates[parentA.val].x - coordinates[parentB.val].x;
			});
			
			let lastX = 0;
			const minNodeSpacing = 0.1 / level;
			
			for (const node of sortedNodes) {
				const parent = findParent(node, nodesByLevel[level - 1] || []);
				if (!parent || !coordinates[parent.val]) continue;
				
				const parentCoords = coordinates[parent.val];
				const baseOffset = 0.25 / (level + 1);
				
				let x = node === parent.left 
					? parentCoords.x - baseOffset 
					: parentCoords.x + baseOffset;
					
				if (lastX > 0 && x - lastX < minNodeSpacing) {
					x = lastX + minNodeSpacing;
				}
				
				lastX = x;
				
				coordinates[node.val] = { 
					x: x, 
					y: parentCoords.y + 70 
				};
			}
		}
		
		return coordinates;
	}
}

function generateBST() {
	const errorElement = document.getElementById('error-message');
	const inputSequence = document.getElementById('input-sequence').value.trim();
	
	if (!inputSequence) {
		errorElement.textContent = 'Please enter a sequence of values.';
		return;
	}
	
	const values = inputSequence.split(',').map(val => val.trim());
	
	if (values.length === 0) {
		errorElement.textContent = 'Please enter valid values separated by commas.';
		return;
	}
	
	if (values.length > 100) {
		errorElement.textContent = 'Too many values. Please limit to 100 or fewer items.';
		return;
	}
	
	if (values.some(val => val.length > 20)) {
		errorElement.textContent = 'Values are too long. Please limit each value to 20 characters or less.';
		return;
	}
	
	errorElement.textContent = '';
	
	const bst = new BST();
	const duplicates = [];
	
	const isNumeric = values.every(val => !isNaN(val) && val !== '');
	
	values.forEach(val => {
		let valueToInsert;
		
		if (isNumeric) {
			const numVal = parseFloat(val);
			if (numVal > Number.MAX_SAFE_INTEGER || numVal < Number.MIN_SAFE_INTEGER) {
				errorElement.textContent = 'Number values too large. Please use smaller numbers.';
				return;
			}
			valueToInsert = numVal;
		} else {
			valueToInsert = val;
		}
		
		const inserted = bst.insert(valueToInsert);
		if (!inserted) {
			duplicates.push(valueToInsert);
		}
	});
	
	if (duplicates.length > 0) {
		const warningMessage = `Warning: Duplicate value(s) found and not added: ${duplicates.join(', ')}`;
		
		if (errorElement.textContent) {
			errorElement.textContent += '. ' + warningMessage;
		} else {
			errorElement.textContent = warningMessage;
		}
		
		errorElement.style.color = 'orange';
	} else {
		errorElement.style.color = 'red';
	}
	
	displayTraversals(bst);
	visualizeTree(bst);
}

function displayTraversals(bst) {
	const preOrderResult = [];
	const inOrderResult = [];
	const postOrderResult = [];
	
	bst.preOrderTraversal(val => preOrderResult.push(val));
	bst.inOrderTraversal(val => inOrderResult.push(val));
	bst.postOrderTraversal(val => postOrderResult.push(val));
	
	const sanitizeArray = (arr) => arr.map(val => 
		String(val)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;')
	);
	
	document.getElementById('preorder-result').textContent = sanitizeArray(preOrderResult).join(', ');
	document.getElementById('inorder-result').textContent = sanitizeArray(inOrderResult).join(', ');
	document.getElementById('postorder-result').textContent = sanitizeArray(postOrderResult).join(', ');
}

function visualizeTree(bst) {
	const svgContainer = document.getElementById('svg-container');
	const treeHeight = bst.getHeight();
	
	if (treeHeight > 10) {
		const errorElement = document.getElementById('error-message');
		errorElement.textContent = 'Tree is too deep for visualization. Please use fewer values or a more balanced tree.';
		return;
	}
	
	const coordinates = bst.getCoordinates();
	
	const optimizedSvg = createOptimizedSvg(bst, coordinates);
	
	svgContainer.innerHTML = optimizedSvg;
	
	const existingButtonContainer = document.getElementById('svg-button-container');
	if (existingButtonContainer) {
		existingButtonContainer.remove();
	}
	
	const buttonContainer = document.createElement('div');
	buttonContainer.id = 'svg-button-container';
	buttonContainer.style.marginTop = '15px';
	buttonContainer.style.display = 'flex';
	buttonContainer.style.gap = '10px';
	buttonContainer.style.justifyContent = 'center';
	
	const downloadButton = document.createElement('button');
	downloadButton.id = 'download-png-btn';
	downloadButton.className = 'button';
	downloadButton.textContent = 'Download PNG';
	downloadButton.addEventListener('click', () => convertToPngAndDownload());
	
	const copyButton = document.createElement('button');
	copyButton.id = 'copy-png-btn';
	copyButton.className = 'button';
	copyButton.textContent = 'Copy PNG to Clipboard';
	copyButton.addEventListener('click', () => copyPngToClipboard());
	
	buttonContainer.appendChild(downloadButton);
	buttonContainer.appendChild(copyButton);
	svgContainer.after(buttonContainer);
}

function createOptimizedSvg(bst, coordinates) {
	let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
	
	function updateBounds(node) {
		if (!node || !coordinates[node.val]) return;
		
		const coord = coordinates[node.val];
		const x = coord.x * 800;
		const y = coord.y;
		const radius = 25;
		
		minX = Math.min(minX, x - radius);
		maxX = Math.max(maxX, x + radius);
		minY = Math.min(minY, y - radius);
		maxY = Math.max(maxY, y + radius);
		
		if (node.left) updateBounds(node.left);
		if (node.right) updateBounds(node.right);
	}
	
	if (bst.root) updateBounds(bst.root);
	
	if (minX === Infinity) {
		minX = 0;
		maxX = 100;
		minY = 0;
		maxY = 100;
	}
	
	const padding = 30;
	minX = Math.max(0, minX - padding);
	minY = Math.max(0, minY - padding);
	maxX = maxX + padding;
	maxY = maxY + padding;
	
	const width = maxX - minX;
	const height = maxY - minY;
	
	let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" width="${width}" height="${height}" style="background-color: white;">`;
	
	function drawConnections(node, parent = null) {
		if (!node) return;
		
		if (parent && coordinates[parent.val] && coordinates[node.val]) {
			const parentCoord = coordinates[parent.val];
			const nodeCoord = coordinates[node.val];
			
			const x1 = parentCoord.x * 800;
			const y1 = parentCoord.y;
			const x2 = nodeCoord.x * 800;
			const y2 = nodeCoord.y;
			
			svgContent += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="black" stroke-width="1.5"/>`;
		}
		
		if (node.left) drawConnections(node.left, node);
		if (node.right) drawConnections(node.right, node);
	}
	
	function drawNodes(node) {
		if (!node || !coordinates[node.val]) return;
		
		const coord = coordinates[node.val];
		const x = coord.x * 800;
		const y = coord.y;
		const radius = 20;
		
		const sanitizedValue = String(node.val)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
		
		svgContent += `
			<circle cx="${x}" cy="${y}" r="${radius}" fill="white" stroke="black" stroke-width="2"/>
			<text x="${x}" y="${y + 5}" text-anchor="middle" font-family="Roboto, Arial, sans-serif" font-size="16">${sanitizedValue}</text>
		`;
		
		if (node.left) drawNodes(node.left);
		if (node.right) drawNodes(node.right);
	}
	
	if (bst.root) drawConnections(bst.root);
	if (bst.root) drawNodes(bst.root);
	
	svgContent += '</svg>';
	return svgContent;
}

function convertToPngAndDownload() {
	const svgElement = document.querySelector('#svg-container svg');
	if (!svgElement) {
		showMessage('No SVG found to convert', true);
		return;
	}
	
	const serializer = new XMLSerializer();
	const svgString = serializer.serializeToString(svgElement);
	
	const svgData = '<?xml version="1.0" standalone="no"?>\r\n' + svgString;
	
	const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
	const svgUrl = URL.createObjectURL(svgBlob);
	
	const img = new Image();
	img.onload = function() {
		const canvas = document.createElement('canvas');
		const scale = 2;
		canvas.width = svgElement.width.baseVal.value * scale;
		canvas.height = svgElement.height.baseVal.value * scale;
		
		const ctx = canvas.getContext('2d');
		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		
		ctx.imageSmoothingEnabled = true;
		ctx.imageSmoothingQuality = 'high';
		
		ctx.scale(scale, scale);
		ctx.drawImage(img, 0, 0);
		
		canvas.toBlob(function(blob) {
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = 'binary_search_tree.png';
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		}, 'image/png', 1.0);
	};
	
	img.onerror = function() {
		showMessage('Error converting SVG to PNG', true);
		URL.revokeObjectURL(svgUrl);
	};
	
	img.src = svgUrl;
}

function copyPngToClipboard() {
	const svgElement = document.querySelector('#svg-container svg');
	if (!svgElement) {
		showMessage('No SVG found to convert', true);
		return;
	}
	
	const serializer = new XMLSerializer();
	const svgString = serializer.serializeToString(svgElement);
	
	const svgData = '<?xml version="1.0" standalone="no"?>\r\n' + svgString;
	
	const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
	const svgUrl = URL.createObjectURL(svgBlob);
	
	const img = new Image();
	img.onload = function() {
		const canvas = document.createElement('canvas');
		const scale = 2;
		canvas.width = svgElement.width.baseVal.value * scale;
		canvas.height = svgElement.height.baseVal.value * scale;
		
		const ctx = canvas.getContext('2d');
		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		
		ctx.imageSmoothingEnabled = true;
		ctx.imageSmoothingQuality = 'high';
		
		ctx.scale(scale, scale);
		ctx.drawImage(img, 0, 0);
		
		canvas.toBlob(function(blob) {
			try {
				const item = new ClipboardItem({ 'image/png': blob });
				navigator.clipboard.write([item]).then(
					function() {
						showMessage('High-quality PNG copied to clipboard!');
					},
					function(err) {
						console.error('Could not copy image: ', err);
						showMessage('Failed to copy PNG. Browser may not support clipboard images.', true);
					}
				);
			} catch (err) {
				console.error('Clipboard API error: ', err);
				showMessage('Your browser does not support copying images to clipboard.', true);
			}
		}, 'image/png', 1.0);
	};
	
	img.onerror = function() {
		showMessage('Error converting SVG to PNG', true);
		URL.revokeObjectURL(svgUrl);
	};
	
	img.src = svgUrl;
}

function showMessage(message, isError = false) {
	if (isError) {
		const errorElement = document.getElementById('error-message');
		const originalError = errorElement.textContent;
		errorElement.textContent = message;
		errorElement.style.color = 'red';
		
		setTimeout(() => {
			errorElement.textContent = originalError;
		}, 3000);
	} else {
		const buttonContainer = document.getElementById('svg-button-container');
		
		const existingMessage = buttonContainer.querySelector('.copy-success');
		if (existingMessage) {
			buttonContainer.removeChild(existingMessage);
		}
		
		const successMessage = document.createElement('div');
		successMessage.textContent = message;
		successMessage.style.color = '#4CAF50';
		successMessage.style.marginTop = '5px';
		successMessage.style.textAlign = 'center';
		successMessage.className = 'copy-success';
		
		buttonContainer.appendChild(successMessage);
		
		setTimeout(() => {
			if (successMessage.parentNode) {
				successMessage.parentNode.removeChild(successMessage);
			}
		}, 3000);
	}
}

document.getElementById('generate-btn').addEventListener('click', generateBST);
document.getElementById('input-sequence').addEventListener('keypress', function(e) {
	if (e.key === 'Enter') {
		generateBST();
	}
});
