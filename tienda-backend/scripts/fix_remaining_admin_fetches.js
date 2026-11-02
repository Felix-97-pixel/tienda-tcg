const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, transforms) {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [search, replace] of transforms) {
    if (typeof search === 'string') {
      if (!content.includes(search)) {
        console.warn(`Warning: string not found in ${filePath}:`, search.slice(0, 40));
      }
      content = content.split(search).join(replace);
    } else {
      content = content.replace(search, replace);
    }
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated:', filePath);
}

// 1. PosCheckoutModal.tsx
const posCheckoutPath = path.join(__dirname, '../../tienda-front/src/app/admin/pos/_components/PosCheckoutModal.tsx');
replaceInFile(posCheckoutPath, [
  [
    `      fetch(\`\${API_URL}/store-credit\`, {
        headers: {
          'x-auth-scope': 'admin',
        },
        credentials: 'include',
      })`,
    `      adminFetch('/store-credit')`
  ],
  [
    `      fetch(\`\${API_URL}/store-credit\`, {\r\n        headers: {\r\n          'x-auth-scope': 'admin',\r\n        },\r\n        credentials: 'include',\r\n      })`,
    `      adminFetch('/store-credit')`
  ]
]);

// 2. useNetworkStatus.ts
const networkPath = path.join(__dirname, '../../tienda-front/src/app/admin/pos/_lib/useNetworkStatus.ts');
replaceInFile(networkPath, [
  ['import { API_URL } from "@/utils/api";', 'import { adminFetch } from "@/utils/api";'],
  [
    `      const res = await fetch(\`\${API_URL}/pos/sales/sync-offline\`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-scope": "admin",
        },
        body: JSON.stringify({ sales }),
        credentials: "include",
      });`,
    `      const res = await adminFetch("/pos/sales/sync-offline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sales }),
      });`
  ],
  [
    `      const res = await fetch(\`\${API_URL}/pos/sales/sync-offline\`, {\r\n        method: "POST",\r\n        headers: {\r\n          "Content-Type": "application/json",\r\n          "x-auth-scope": "admin",\r\n        },\r\n        body: JSON.stringify({ sales }),\r\n        credentials: "include",\r\n      });`,
    `      const res = await adminFetch("/pos/sales/sync-offline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sales }),
      });`
  ]
]);

// 3. shipping/page.tsx
const shippingPath = path.join(__dirname, '../../tienda-front/src/app/admin/shipping/page.tsx');
replaceInFile(shippingPath, [
  ['fetch(`${API_URL}/shipping/locations`)', 'adminFetch("/shipping/locations")'],
  ['import { API_URL, adminFetch }', 'import { adminFetch }'],
]);

// 4. useStoreCreditForm.ts
const storeCreditPath = path.join(__dirname, '../../tienda-front/src/app/admin/_components/StoreCredit/hooks/useStoreCreditForm.ts');
let scContent = fs.readFileSync(storeCreditPath, 'utf8');
scContent = scContent.replace('import { API_URL } from "@/utils/api";', 'import { adminFetch } from "@/utils/api";');
scContent = scContent.replace(/fetch\(`\${API_URL}\/products\/meta\/\${endpoint}`\)/g, 'adminFetch(`/products/meta/${endpoint}`)');
scContent = scContent.replace(/fetch\(`\${API_URL}\/products\/meta\/categories\/admin\?isTcg=true`\)/g, 'adminFetch("/products/meta/categories/admin?isTcg=true")');
scContent = scContent.replace(/fetch\(`\${API_URL}\/products\/meta\/expansions\?category=\${encodeURIComponent\(selectedCategory\)}`\)/g, 'adminFetch(`/products/meta/expansions?category=${encodeURIComponent(selectedCategory)}`)');
scContent = scContent.replace(
  /fetch\(`\${API_URL}\/users\/search\?query=\${encodeURIComponent\(userSearchTerm\)}`,\s*\{\s*credentials:\s*"include",?\s*\}\)/g,
  'adminFetch(`/users/search?query=${encodeURIComponent(userSearchTerm)}`)'
);
scContent = scContent.replace(/fetch\(url\.toString\(\),\s*\{\s*credentials:\s*"include"\s*\}\)/g, 'adminFetch(url.toString())');
scContent = scContent.replace(
  /fetch\(`\${API_URL}\/store-credit\/adjust`,\s*\{\s*method:\s*"POST",\s*headers:\s*\{\s*"Content-Type":\s*"application\/json"\s*\},/g,
  'adminFetch("/store-credit/adjust", { method: "POST", headers: { "Content-Type": "application/json" },'
);
fs.writeFileSync(storeCreditPath, scContent, 'utf8');
console.log('Updated:', storeCreditPath);

