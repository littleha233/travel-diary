import { render } from '@testing-library/react-native';
import { StatusChip } from '@/components/StatusChip';

describe('StatusChip', () => {
  it('renders the status label', async () => {
    const { getByText } = await render(<StatusChip label="已点亮" tone="mint" />);

    expect(getByText('已点亮')).toBeTruthy();
  });
});
