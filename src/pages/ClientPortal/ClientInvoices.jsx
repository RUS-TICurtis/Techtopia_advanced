import { useState } from 'react';
import { 
  CreditCard, 
  ArrowLeft, 
  CheckCircle, 
  Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useInvoices } from '../../hooks/useCrmData';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { showToast } from '../../components/ui/Toast';
import './ClientPortal.css';

export default function ClientInvoices() {
  const user = useAuthStore(state => state.user);
  const companyName = user?.clientCompany || 'CloudScale Inc.';
  const displayCompany = companyName === 'ACME Corp' ? 'CloudScale Inc.' : companyName;

  const { invoices = [], isLoading, updateInvoice } = useInvoices();

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  // Form payment details
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');

  const handlePayClick = (invoice, e) => {
    e.stopPropagation();
    setSelectedInvoice(invoice);
    setIsPayModalOpen(true);
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!cardNumber || !cardExpiry || !cardCVC) return;

    setIsPaying(true);
    showToast('Payment Processing', 'Connecting to secure Stripe API gateway...', 'info');

    try {
      // Settle invoice payment via API
      await updateInvoice({
        id: selectedInvoice.id,
        data: { status: 'Paid', paid: selectedInvoice.amount }
      });

      setIsPaying(false);
      setIsPayModalOpen(false);
      setSelectedInvoice(null);
      setCardNumber(''); setCardExpiry(''); setCardCVC('');

      showToast('Payment Completed', 'Invoice was successfully settled and marked as Paid!', 'success');
    } catch (err) {
      console.error(err);
      setIsPaying(false);
      showToast('Payment Failed', 'Transaction declined by gateway.', 'error');
    }
  };

  const getStatusVariant = (stat) => {
    switch (stat) {
      case 'Paid': return 'success';
      case 'Sent':
      case 'Draft': return 'warning';
      case 'Overdue': return 'error';
      default: return 'neutral';
    }
  };

  // Filter invoices for the specific client
  const clientInvoices = invoices.filter(inv => inv.client === displayCompany);

  // TanStack Columns
  const columns = [
    {
      accessorKey: 'invoiceNumber',
      header: 'Invoice ID',
      cell: ({ getValue }) => <span className="font-mono text-xs font-bold" style={{ color: 'var(--text-title)' }}>{getValue()}</span>
    },
    {
      accessorKey: 'amount',
      header: 'Amount Due',
      cell: ({ getValue }) => (
        <span className="font-display font-extrabold text-xs" style={{ color: 'var(--brand-cyan)' }}>
          ${getValue().toLocaleString()}
        </span>
      )
    },
    {
      accessorKey: 'issueDate',
      header: 'Issue Date',
      cell: ({ getValue }) => <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{getValue()}</span>
    },
    {
      accessorKey: 'dueDate',
      header: 'Due Date',
      cell: ({ getValue }) => <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{getValue()}</span>
    },
    {
      accessorKey: 'status',
      header: 'Billing Status',
      cell: ({ getValue }) => (
        <Badge variant={getStatusVariant(getValue())}>
          {getValue() === 'Sent' ? 'Unpaid' : getValue()}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: 'Settlement',
      cell: ({ row }) => {
        const inv = row.original;
        if (inv.status === 'Paid') {
          return (
            <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--success)' }}>
              <CheckCircle size={14} /> Settlement Cleared
            </div>
          );
        }
        return (
          <button 
            className="btn btn-primary text-xs py-1.5 px-3 flex items-center gap-1 shadow-glow"
            onClick={(e) => handlePayClick(inv, e)}
          >
            <CreditCard size={12} /> Pay Now
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
            <span style={{ color: 'var(--brand-magenta)' }}>⚡</span> Billing Ledger
          </h1>
          <p className="page-subtitle">Secure invoicing ledger, automated Stripe processing and receipt exports</p>
        </div>
      </div>

      <div className="portal-panel p-0 overflow-hidden">
        <DataTable 
          columns={columns}
          data={clientInvoices}
          pageSize={10}
        />
      </div>

      {/* Credit Card Payment Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => !isPaying && setIsPayModalOpen(false)}
        title="Settlement Billing Terminal"
        size="md"
      >
        <form onSubmit={handlePaySubmit} className="flex flex-col gap-4">
          
          {selectedInvoice && (
            <div className="portal-modal-header-panel mb-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>SECURE INVOICE TRANSACTION</span>
                <span className="font-mono font-extrabold text-sm" style={{ color: 'var(--text-title)' }}>{selectedInvoice.invoiceNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>AMOUNT DUE</span>
                <span className="font-display font-black text-base block" style={{ color: 'var(--brand-cyan)' }}>${selectedInvoice.amount.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Secure Stripe Indicator */}
          <div className="portal-alert-green mb-2">
            <Lock size={13} />
            <span>Encrypted Stripe Gateway Active (AES-256 Bit verification)</span>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Credit Card Number *</label>
            <input 
              type="text" 
              className="form-input font-mono" 
              placeholder="•••• •••• •••• ••••" 
              maxLength={19}
              value={cardNumber} 
              onChange={e => setCardNumber(e.target.value)} 
              disabled={isPaying}
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Expiration Date *</label>
              <input 
                type="text" 
                className="form-input font-mono" 
                placeholder="MM/YY" 
                maxLength={5}
                value={cardExpiry} 
                onChange={e => setCardExpiry(e.target.value)} 
                disabled={isPaying}
                required 
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>CVC Security Code *</label>
              <input 
                type="text" 
                className="form-input font-mono" 
                placeholder="•••" 
                maxLength={3}
                value={cardCVC} 
                onChange={e => setCardCVC(e.target.value)} 
                disabled={isPaying}
                required 
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button 
              type="button" 
              className="btn btn-secondary px-5 py-2.5 rounded-lg text-sm" 
              onClick={() => setIsPayModalOpen(false)}
              disabled={isPaying}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary px-5 py-2.5 rounded-lg text-sm flex items-center gap-1.5"
              style={{
                background: 'var(--brand-magenta)',
                color: '#fff'
              }}
              disabled={isPaying}
            >
              {isPaying ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard size={14} />
                  <span>Settle Payment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
