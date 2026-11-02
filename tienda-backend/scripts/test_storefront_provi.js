async function main() {
  const res = await fetch('http://localhost:3001/api/v1/stores/public/demo-provi');
  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Store public data:', {
    id: data.id,
    name: data.name,
    subdomain: data.subdomain,
  });

  const productsRes = await fetch(`http://localhost:3001/api/v1/products?page=1&limit=24&storeId=${data.id}`);
  console.log('Products status:', productsRes.status);
  const productsData = await productsRes.json();
  console.log('Products count:', productsData.data?.length);
  console.log('Products:', productsData.data?.map(p => ({
    id: p.id,
    name: p.name,
    items: p.items?.map(i => ({ id: i.id, storeId: i.storeId, price: i.price, stock: i.stock })),
  })));
}

main().catch(console.error);

