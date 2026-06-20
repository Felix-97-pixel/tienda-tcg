const fs = require('fs');
const path = require('path');

const targetItems = ["Brands", "Categories", "Config", "Expansions", "Games", "Stores", "Sync", "SuperAdminGuard"];

function replaceInDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            replaceInDir(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let updated = false;
            
            for (const item of targetItems) {
                // Regex to match app/admin/_components/Item
                const regex = new RegExp(`app/admin/_components/${item}`, 'g');
                if (regex.test(content)) {
                    content = content.replace(regex, `app/superadmin/_components/${item}`);
                    updated = true;
                }
            }
            
            if (updated) {
                fs.writeFileSync(fullPath, content);
                console.log('Updated ' + fullPath);
            }
        }
    }
}

replaceInDir('c:/Users/felix/Desktop/e-commerce/tienda-front/src');
