const fs = require('fs');
const path = require('path');

const envFiles = ['.env.local', '.env', '.env.development'];
envFiles.forEach(file => {
    const envPath = path.join(process.cwd(), file);
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        console.log(`--- Checking ${file} ---`);
        const lines = content.split('\n');
        lines.forEach((line, i) => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [key] = trimmed.split('=');
                console.log(`Line ${i + 1}: Key="${key.trim()}"`);
            }
        });
    }
});
