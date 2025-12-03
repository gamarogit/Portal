import AssetList from '@components/AssetList';

export default function AssetsView() {
  return (
    <section>
      <header style={{ marginBottom: '1rem' }}>
        <h2 style={{ margin: '0 0 0.2rem 0' }}>Activos</h2>
        <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Catálogo actualizado con ubicación y responsable.</p>
      </header>
      <AssetList />
    </section>
  );
}
