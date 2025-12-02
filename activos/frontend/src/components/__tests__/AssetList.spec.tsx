import { render, screen, waitFor } from '@testing-library/react';
import AssetList from '../AssetList';
import { assetService } from '@services/api';

vi.mock('@services/api', () => ({
  assetService: {
    list: vi.fn(),
  },
}));

const listMock = vi.mocked(assetService.list);

describe('AssetList', () => {
  beforeEach(() => {
    listMock.mockReset();
  });

  it('muestra la lista de activos', async () => {
    const mockAssets = [
      {
        id: '1',
        name: 'Laptop',
        state: 'ACTIVO',
        assetType: { name: 'Laptop' },
        location: { name: 'HQ' },
        responsible: { name: 'Ana' },
      },
    ];
    listMock.mockResolvedValueOnce(mockAssets);

    render(<AssetList />);

    await waitFor(() => expect(listMock).toHaveBeenCalled());
    expect(screen.getAllByText('Laptop')).toHaveLength(2);
    expect(screen.getByText('HQ')).toBeInTheDocument();
  });

  it('muestra mensaje si no hay activos', async () => {
    listMock.mockResolvedValueOnce([]);
    render(<AssetList />);
    await waitFor(() => expect(listMock).toHaveBeenCalled());
    expect(screen.getByText('No hay activos registrados.')).toBeInTheDocument();
  });
});
