import AssetList from '@components/AssetList';

export default function AssetsView() {
  return (
    <section>
      <header style={{ marginBottom: '1rem' }}>
        <h2 style={{ margin: '0 0 0.2rem 0' }}>Activos</h2>
        <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '1.1rem', color: 'var(--color-primary, #555)' }}>Crear activo</h3>
      </header>
      <AssetList />
    </section>
  );
}
