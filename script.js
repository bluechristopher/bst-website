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
    }
    
    insert(val) {
        const newNode = new TreeNode(val);
        
        if (!this.root) {
            this.root = newNode;
            return;
        }
        
        const insertNode = (node, newNode) => {
            if (typeof newNode.val === 'string') {
                if (newNode.val < node.val) {
                    if (node.left === null) {
                        node.left = newNode;
                    } else {
                        insertNode(node.left, newNode);
                    }
                } else {
                    if (node.right === null) {
                        node.right = newNode;
                    } else {
                        insertNode(node.right, newNode);
                    }
                }
            } else {
                if (newNode.val < node.val) {
                    if (node.left === null) {
                        node.left = newNode;
                    } else {
                        insertNode(node.left, newNode);
                    }
                } else {
                    if (node.right === null) {
                        node.right = newNode;
                    } else {
                        insertNode(node.right, newNode);
                    }
                }
            }
        };
        
        insertNode(this.root, newNode);
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
    
    const isNumeric = values.every(val => !isNaN(val) && val !== '');
    
    values.forEach(val => {
        if (isNumeric) {
            const numVal = parseFloat(val);
            if (numVal > Number.MAX_SAFE_INTEGER || numVal < Number.MIN_SAFE_INTEGER) {
                errorElement.textContent = 'Number values too large. Please use smaller numbers.';
                return;
            }
            bst.insert(numVal);
        } else {
            bst.insert(val);
        }
    });
    
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
    
    const svgWidth = 800;
    const svgHeight = Math.max(treeHeight * 80 + 50, 200);
    
    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}" style="background-color: white;">`;
    
    function drawConnections(node, parent = null) {
        if (!node) return;
        
        if (parent && coordinates[parent.val] && coordinates[node.val]) {
            const parentCoord = coordinates[parent.val];
            const nodeCoord = coordinates[node.val];
            
            const x1 = parentCoord.x * svgWidth;
            const y1 = parentCoord.y;
            const x2 = nodeCoord.x * svgWidth;
            const y2 = nodeCoord.y;
            
            svgContent += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="black" stroke-width="1.5"/>`;
        }
        
        if (node.left) drawConnections(node.left, node);
        if (node.right) drawConnections(node.right, node);
    }
    
    function drawNodes(node) {
        if (!node || !coordinates[node.val]) return;
        
        const coord = coordinates[node.val];
        const x = coord.x * svgWidth;
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
            <text x="${x}" y="${y + 5}" text-anchor="middle" font-family="Arial" font-size="14">${sanitizedValue}</text>
        `;
        
        if (node.left) drawNodes(node.left);
        if (node.right) drawNodes(node.right);
    }
    
    if (bst.root) drawConnections(bst.root);
    if (bst.root) drawNodes(bst.root);
    
    svgContent += '</svg>';
    svgContainer.innerHTML = svgContent;
}

document.getElementById('generate-btn').addEventListener('click', generateBST);
document.getElementById('input-sequence').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        generateBST();
    }
});
