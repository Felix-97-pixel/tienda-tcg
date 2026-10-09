import StoreGamesForm from "./_components/StoreGamesForm";

export default function GamesPage() {
  return (
    <div className="flex-1 w-full flex flex-col items-center bg-[#0d0f14] min-h-screen">
      <div className="w-full max-w-5xl px-8 py-10">
        <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Juegos Soportados</h1>
        <p className="text-sm text-gray-4 font-medium mb-8">Administra qué juegos se encuentran disponibles en el catálogo de tu tienda para que tus clientes puedan comprar y vender cartas.</p>
        <StoreGamesForm storeId="me" />
      </div>
    </div>
  );
}
