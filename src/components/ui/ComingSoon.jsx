import { Clock } from 'lucide-react';
import PageContainer from '../layout/PageContainer';
import PageHeader from '../layout/PageHeader';

export default function ComingSoon({ moduleName }) {
  return (
    <PageContainer>
      <PageHeader 
        title={moduleName} 
        description={`${moduleName} module is currently under development.`} 
      />
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Clock className="w-16 h-16 text-[var(--brand-purple)] mb-6 animate-pulse" />
        <h2 className="text-3xl font-display font-bold text-white mb-4">
          Coming Soon
        </h2>
        <p className="text-gray-400 max-w-md mx-auto text-lg">
          The <strong>{moduleName}</strong> module is currently in development. We are working hard to bring you a completely connected and scalable experience. Check back later!
        </p>
      </div>
    </PageContainer>
  );
}
