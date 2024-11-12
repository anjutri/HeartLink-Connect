const fs = require('fs');
const path = require('path');

const requiredFiles = [
    'public/login.html',
    'public/js/login.js',
    'public/css/styles.css',
    'public/index.html',
    'public/404.html'
];

function verifyFiles() {
    console.log('Verifying required files...');
    const missingFiles = [];

    requiredFiles.forEach(file => {
        const filePath = path.join(__dirname, '..', file);
        if (!fs.existsSync(filePath)) {
            missingFiles.push(file);
            console.log(`❌ Missing: ${file}`);
        } else {
            console.log(`✅ Found: ${file}`);
        }
    });

    if (missingFiles.length > 0) {
        console.log('\nMissing files detected! Please create these files:');
        missingFiles.forEach(file => console.log(`- ${file}`));
    } else {
        console.log('\nAll required files are present!');
    }
}

verifyFiles(); 