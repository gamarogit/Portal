import AssetList from '@components/AssetList';

export default function AssetsView() {
  return (
    <section>
      <header>
        <h2>Activos</h2>
        <p>Catálogo actualizado con ubicación y responsable.</p>
      </header>
      <AssetList />
    </section>
  );
}
