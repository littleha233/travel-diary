describe('serviceConfig data source switching', () => {
  const originalDataSource = process.env.EXPO_PUBLIC_TRAVEL_DATA_SOURCE;

  afterEach(() => {
    process.env.EXPO_PUBLIC_TRAVEL_DATA_SOURCE = originalDataSource;
    jest.resetModules();
  });

  it('defaults to mock mode', () => {
    delete process.env.EXPO_PUBLIC_TRAVEL_DATA_SOURCE;
    jest.resetModules();

    const { serviceConfig } = require('@/services/config') as typeof import('@/services/config');

    expect(serviceConfig.dataSource).toBe('mock');
  });

  it('switches to real API mode from EXPO_PUBLIC_TRAVEL_DATA_SOURCE', () => {
    process.env.EXPO_PUBLIC_TRAVEL_DATA_SOURCE = 'api';
    jest.resetModules();

    const { serviceConfig } = require('@/services/config') as typeof import('@/services/config');

    expect(serviceConfig.dataSource).toBe('api');
  });
});
