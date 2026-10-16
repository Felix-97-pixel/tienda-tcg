import StoreGamesForm from "./_components/StoreGamesForm";

export default function GamesPage() {
  return (
    <div className="space-y-6 pb-24 text-white">
      <div className="pb-2 border-b border-white/5">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-red shadow-[0_0_8px_rgba(225,14,14,0.8)]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-red">Catálogo & TCGs</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">Juegos Soportados</h1>
        <p className="text-xs text-white/40 mt-0.5">
          Administra qué juegos se encuentran disponibles en el catálogo de tu tienda para que tus clientes puedan comprar y vender cartas.
        </p>
      </div>
      <StoreGamesForm storeId="me" />
    </div>
  );
}
