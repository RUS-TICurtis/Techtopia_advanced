import { useState } from 'react';
import { 
  CheckCircle, 
  ShieldCheck, 
  Lock, 
  ArrowLeft,
  Signature
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useContracts } from '../../hooks/useCrmData';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { showToast } from '../../components/ui/Toast';
import './ClientPortal.css';

export default function ClientContracts() {
  const user = useAuthStore(state => state.user);
  const companyName = user?.clientCompany || 'CloudScale Inc.';
  const displayCompany = companyName === 'ACME Corp' ? 'CloudScale Inc.' : companyName;

  const { contracts = [], isLoading, updateContract } = useContracts();

  const [selectedContract, setSelectedContract] = useState(null);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleSignClick = (contract, e) => {
    e.stopPropagation();
    setSelectedContract(contract);
    setIsSignModalOpen(true);
  };

  const handleSignSubmit = async (e) => {
    e.preventDefault();
    if (!acceptTerms) return;

    setIsSigning(true);
    showToast('Executing Cryptographic Signature', 'Registering secure transaction on audit ledger...', 'info');

    try {
      await updateContract({
        id: selectedContract.id,
        data: { status: 'Active' }
      });

      setIsSigning(false);
      setIsSignModalOpen(false);
      setSelectedContract(null);
      setAcceptTerms(false);

      showToast('Agreement Active', 'Contract signature verified and stored in compliance system!', 'success');
    } catch (err) {
      console.error(err);
      setIsSigning(false);
      showToast('Error', 'Failed to execute signature.', 'error');
    }
  };

  const getStatusVariant = (stat) => {
    switch (stat) {
      case 'Active': return 'success';
      case 'Pending Signature': return 'warning';
      default: return 'neutral';
    }
  };

  const clientContracts = contracts.filter(c => c.client === displayCompany);

  const columns = [
    {
      accessorKey: 'contractNumber',
      header: 'Contract ID',
      cell: ({ getValue }) => <span className="font-mono text-xs font-bold" style={{ color: 'var(--text-title)' }}>{getValue()}</span>
    },
    {
      accessorKey: 'title',
      header: 'Agreement Title',
      cell: ({ getValue }) => <span className="font-bold text-xs" style={{ color: 'var(--text-main)' }}>{getValue()}</span>
    },
    {
      accessorKey: 'value',
      header: 'Contract Value',
      cell: ({ getValue }) => (
        <span className="font-display font-extrabold text-xs" style={{ color: 'var(--brand-cyan)' }}>
          ${getValue()?.toLocaleString() || 0}
        </span>
      )
    },
    {
      accessorKey: 'startDate',
      header: 'Effective Date',
      cell: ({ getValue }) => <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{getValue() || 'â€”'}</span>
    },
    {
      accessorKey: 'status',
      header: 'Agreement Status',
      cell: ({ getValue }) => (
        <Badge variant={getStatusVariant(getValue())}>
          {getValue()}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: 'Execution',
      cell: ({ row }) => {
        const c = row.original;
        if (c.status === 'Active') {
          return (
            <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--success)' }}>
              <CheckCircle size={14} /> Legally Executed
            </div>
          );
        }
        return (
          <button 
            className="btn btn-primary text-xs py-1.5 px-3 flex items-center gap-1 shadow-glow"
            onClick={(e) => handleSignClick(c, e)}
          >
            <Signature size={12} /> Sign Contract
          </button>
        );
      }
    }
  ];

  return (
    <div className="page-container client-portal-page">
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Link to="/client" className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <span style={{ color: 'var(--brand-magenta)' }}>âš¡</span> Service Contracts
          </h1>
          <p className="page-subtitle">Master agreements, service level commitments and legislative compliance</p>
        </div>
      </div>

      <div className="portal-panel p-0 overflow-hidden">
        <DataTable 
          columns={columns}
          data={clientContracts}
          pageSize={10}
        />
      </div>

      {/* Signature Execution Modal */}
      <Modal
        isOpen={isSignModalOpen}
        onClose={() => !isSigning && setIsSignModalOpen(false)}
        title="Agreement Signature Terminal"
        size="lg"
      >
        <form onSubmit={handleSignSubmit} className="flex flex-col gap-4">
          
          {selectedContract && (
            <div className="flex flex-col gap-3">
              <div className="portal-modal-header-panel">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>CRYPTOGRAPHIC AGREEMENT</span>
                  <span className="font-mono font-extrabold text-sm" style={{ color: 'var(--text-title)' }}>{selectedContract.title} ({selectedContract.contractNumber})</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>ANNUAL CONTRACT VALUE</span>
                  <span className="font-display font-black text-base block" style={{ color: 'var(--brand-cyan)' }}>${selectedContract.value?.toLocaleString() || 0}</span>
                </div>
              </div>

              {/* SLA details view */}
              <div className="portal-info-box flex-col items-start gap-1">
                <span className="text-[9px] font-bold uppercase tracking-wider flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                  <ShieldCheck size={12} style={{ color: 'var(--brand-cyan)' }} /> Binding SLA Commitments & Terms
                </span>
                <p className="text-xs leading-relaxed italic" style={{ color: 'var(--text-main)' }}>
                  "{selectedContract.slaTerms || 'No specific SLA terms defined'}"
                </p>
              </div>

              {/* Simulated Legal Document Text */}
              <div className="portal-document-scroll">
                <span className="portal-document-section-title">SECTION 1. SERVICE STANDARDS</span>
                Techtopia CRM Hub agrees to provide technical and Innovation cloud dashboard services to {displayCompany} in compliance with standard SaaS parameters. High-Priority diagnostic items must be resolved within two (2) hours of receipt, or be subject to appropriate credit parameters.
                <span className="portal-document-section-title">SECTION 2. COMPLIANCE & LEGAL</span>
                This document acts as a Master Services Agreement and carries cryptographic transaction markers that represent standard e-signature execution regulations.
              </div>

              <div className="portal-alert-cyan my-1">
                <Lock size={13} />
                <span>Transaction audit ledger recorded in compliance directories.</span>
              </div>

              {/* Interactive checkbox */}
              <label className="flex items-start gap-2.5 cursor-pointer select-none mt-2">
                <input 
                  type="checkbox" 
                  className="portal-checkbox mt-0.5" 
                  checked={acceptTerms}
                  onChange={e => setAcceptTerms(e.target.checked)}
                  disabled={isSigning}
                />
                <span className="text-xs font-semibold leading-normal" style={{ color: 'var(--text-main)' }}>
                  I accept all binding SLA terms, standards and legal parameters described in {selectedContract.contractNumber}.
                </span>
              </label>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <button 
              type="button" 
              className="btn btn-secondary px-5 py-2.5 rounded-lg text-sm" 
              onClick={() => setIsSignModalOpen(false)}
              disabled={isSigning}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary px-5 py-2.5 rounded-lg text-sm flex items-center gap-1.5"
              style={{
                background: acceptTerms && !isSigning ? 'var(--brand-cyan)' : 'var(--primary)',
                color: acceptTerms && !isSigning ? '#000' : '#fff'
              }}
              disabled={isSigning || !acceptTerms}
            >
              {isSigning ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing Ledger...</span>
                </>
              ) : (
                <>
                  <Signature size={14} />
                  <span>Execute Signature</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
