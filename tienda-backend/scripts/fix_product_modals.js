const fs = require('fs');
const path = require('path');

function normalizeContent(c) {
  return c.replace(/\r\n/g, '\n');
}

// 1. CreateProductModal.tsx
const createPath = path.join(__dirname, '../../tienda-front/src/app/admin/_components/Products/CreateProductModal.tsx');
let createContent = normalizeContent(fs.readFileSync(createPath, 'utf8'));
createContent = createContent.replace('import { API_URL } from "@/utils/api";', 'import { adminFetch } from "@/utils/api";');
createContent = createContent.replace(
`      const res = await fetch(\`\${API_URL}/products\`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-scope": "admin",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });`,
`      const res = await adminFetch("/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });`
);
fs.writeFileSync(createPath, createContent, 'utf8');
console.log('CreateProductModal updated.');

// 2. EditProductModal.tsx
const editPath = path.join(__dirname, '../../tienda-front/src/app/admin/_components/Products/EditProductModal.tsx');
let editContent = normalizeContent(fs.readFileSync(editPath, 'utf8'));
editContent = editContent.replace('import { API_URL } from "@/utils/api";', 'import { adminFetch } from "@/utils/api";');
editContent = editContent.replace(
`      const res = await fetch(\`\${API_URL}/products/\${item.productId}\`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-auth-scope": "admin",
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: form.price,
          stock: form.stock,
          categoryId: form.categoryId,
          brandId: form.brandId || null,
          imageUrl: form.imageUrl || null,
          weightGram: form.weightGram ? parseFloat(form.weightGram as string) : null,
          widthCm: form.widthCm ? parseFloat(form.widthCm as string) : null,
          heightCm: form.heightCm ? parseFloat(form.heightCm as string) : null,
          lengthCm: form.lengthCm ? parseFloat(form.lengthCm as string) : null,
        }),
        credentials: "include",
      });`,
`      const res = await adminFetch(\`/products/\${item.productId}\`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: form.price,
          stock: form.stock,
          categoryId: form.categoryId,
          brandId: form.brandId || null,
          imageUrl: form.imageUrl || null,
          weightGram: form.weightGram ? parseFloat(form.weightGram as string) : null,
          widthCm: form.widthCm ? parseFloat(form.widthCm as string) : null,
          heightCm: form.heightCm ? parseFloat(form.heightCm as string) : null,
          lengthCm: form.lengthCm ? parseFloat(form.lengthCm as string) : null,
        }),
      });`
);
fs.writeFileSync(editPath, editContent, 'utf8');
console.log('EditProductModal updated.');
