const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  "src/app/admin/currencies/page.tsx",
  "src/app/admin/shipping/page.tsx",
  "src/components/Admin/Categories/CategoryModal.tsx",
  "src/components/Admin/Games/GameFormModal.tsx",
  "src/components/Admin/Products/ProductFilters.tsx",
  "src/components/Checkout/Billing.tsx",
  "src/components/Checkout/PaymentMethod.tsx",
  "src/components/Checkout/ShippingMethod.tsx",
  "src/components/ShopDetails/index.tsx"
];

filesToUpdate.forEach(file => {
  const filepath = path.join(__dirname, file);
  if (fs.existsSync(filepath)) {
    let content = fs.readFileSync(filepath, 'utf-8');
    // Replace import
    content = content.replace(/import\s+{\s*Checkbox\s*}\s+from\s+["']@\/components\/ui\/Checkbox["'];?/g, 'import { Switch } from "@/components/ui/Switch";');
    // Replace components
    content = content.replace(/<Checkbox/g, '<Switch');
    content = content.replace(/<\/Checkbox>/g, '</Switch>');
    fs.writeFileSync(filepath, content);
    console.log("Updated", file);
  } else {
    console.log("File not found:", file);
  }
});

const oldPath = path.join(__dirname, "src/components/ui/Checkbox.tsx");
const newPath = path.join(__dirname, "src/components/ui/Switch.tsx");
if (fs.existsSync(oldPath)) {
  let content = fs.readFileSync(oldPath, 'utf-8');
  content = content.replace(/CheckboxProps/g, 'SwitchProps');
  content = content.replace(/Checkbox/g, 'Switch');
  content = content.replace(/type="checkbox"/g, 'type="checkbox"'); // keep type=checkbox
  fs.writeFileSync(newPath, content);
  fs.unlinkSync(oldPath);
  console.log("Renamed Checkbox.tsx to Switch.tsx");
} else {
  console.log("Checkbox.tsx not found");
}
