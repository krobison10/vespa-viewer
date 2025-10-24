import InternalLayout from '@/components/layouts/internal_layout';
import InternalProviders from '@/components/providers/internal_providers';

export default function DataSourceLayout({ children }) {
  return (
    <InternalProviders>
      <InternalLayout>{children}</InternalLayout>
    </InternalProviders>
  );
}
