const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;
            
            // Replace simple shadow-* classes
            content = content.replace(/shadow-(sm|md|lg|xl|2xl|none)\s?/g, '');
            content = content.replace(/shadow-[a-zA-Z0-9-]+\/[0-9]+\s?/g, '');
            
            // Replace opacity-* classes
            content = content.replace(/opacity-([0-9]+)\s?/g, '');
            
            // Replace color/opacity like bg-white/20 or bg-aether-primary/20
            content = content.replace(/bg-([a-zA-Z0-9-]+)\/([0-9]+)\s?/g, '');
            content = content.replace(/text-([a-zA-Z0-9-]+)\/([0-9]+)\s?/g, '');
            
            // Replace active:bg-aether-primary/20 hover:bg-aether-primary/20
            content = content.replace(/(hover|active):bg-([a-zA-Z0-9-]+)\/([0-9]+)\s?/g, '');
            
            // Cleanup any multiple spaces inside className
            content = content.replace(/className=\"\s+/g, 'className=\"');
            content = content.replace(/\s+\"/g, '\"');
            content = content.replace(/className=\"\"/g, ''); // Remove empty classNames
            
            if (content !== original) {
                fs.writeFileSync(fullPath, content);
                console.log('Updated: ' + fullPath);
            }
        }
    }
}

processDir('aether-frontend/app');
console.log('Done!');
