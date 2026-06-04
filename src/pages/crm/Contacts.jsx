import { useState } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  X,
  User,
  Phone,
  Mail,
  Building2,
  Briefcase,
  SlidersHorizontal,
  ChevronRight,
  Eye,
  FileText,
  CheckCircle,
  MoreVertical
} from 'lucide-react';
import { useContacts } from '../../hooks/useCrmData';
import DataTable from '../../components/ui/DataTable';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import './Contacts.css';

export default function Contacts({ searchValue = '' }) {
  const { contacts = [], isLoading, createContact, updateContact, deleteContact } = useContacts();
  const [selectedContact, setSelectedContact] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('New');
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [editId, setEditId] = useState(null);

  // Sync selected contact with updated list data
  const selectedContactDetails = selectedContact 
    ? (contacts.find(c => c.id === selectedContact.id) || selectedContact)
    : null;

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!name || !company) return;

    try {
      await createContact({
        name,
        company,
        email,
        phone,
        status,
        value: parseFloat(value) || 0,
        notes
      });

      // Reset forms & close
      setName('');
      setCompany('');
      setEmail('');
      setPhone('');
      setStatus('New');
      setValue('');
      setNotes('');
      setIsAddModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (contact, e) => {
    if (e) e.stopPropagation();
    setEditId(contact.id);
    setName(contact.name);
    setCompany(contact.company);
    setEmail(contact.email);
    setPhone(contact.phone);
    setStatus(contact.status);
    setValue(contact.value ? contact.value.toString() : '0');
    setNotes(contact.notes || '');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!name || !company) return;

    try {
      await updateContact({
        id: editId,
        data: {
          name,
          company,
          email,
          phone,
          status,
          value: parseFloat(value) || 0,
          notes
        }
      });

      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteClick = async (id, e) => {
    if (e) e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this contact?")) {
      try {
        await deleteContact(id);
        if (selectedContact && selectedContact.id === id) {
          setSelectedContact(null);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const changeStatusQuick = async (contact, newStatus) => {
    try {
      await updateContact({
        id: contact.id,
        data: {
          status: newStatus
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Status mapping to badge variants
  const statusVariants = {
    'New': 'info',
    'Qualified': 'purple',
    'In Progress': 'warning',
    'Proposal': 'info',
    'Won': 'success',
    'Lost': 'error'
  };

  // Context Menu Items per Row
  const getRowContextMenuItems = (contact) => [
    {
      label: 'View Dossier',
      icon: Eye,
      onClick: () => setSelectedContact(contact)
    },
    {
      label: 'Edit Lead Details',
      icon: Edit3,
      onClick: (e) => handleEditClick(contact, e)
    },
    {
      label: 'Quick Transition Status',
      icon: SlidersHorizontal,
      children: [
        { label: 'New', onClick: () => changeStatusQuick(contact, 'New') },
        { label: 'Qualified', onClick: () => changeStatusQuick(contact, 'Qualified') },
        { label: 'In Progress', onClick: () => changeStatusQuick(contact, 'In Progress') },
        { label: 'Proposal', onClick: () => changeStatusQuick(contact, 'Proposal') },
        { label: 'Won', onClick: () => changeStatusQuick(contact, 'Won') },
        { label: 'Lost', onClick: () => changeStatusQuick(contact, 'Lost') }
      ]
    },
    { type: 'separator' },
    {
      label: 'Delete Lead Profile',
      icon: Trash2,
      variant: 'danger',
      onClick: (e) => handleDeleteClick(contact.id, e)
    }
  ];

  // TanStack table columns
  const columns = [
    {
      accessorKey: 'name',
      header: 'Contact Name',
      cell: ({ row }) => {
        const contact = row.original;
        return (
          <div className="flex items-center gap-3 py-1">
            <div className="w-8 h-8 rounded-full bg-[#8A4FFF]/10 border border-[#8A4FFF]/25 text-[#8A4FFF] flex items-center justify-center font-bold text-sm">
              {contact.name.charAt(0)}
            </div>
            <span className="font-bold text-white text-sm hover:text-[#01FDF6] transition-colors">{contact.name}</span>
          </div>
        );
      }
    },
    {
      accessorKey: 'company',
      header: 'Company / Org',
      cell: ({ row }) => {
        const contact = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-gray-300 text-xs">{contact.company}</span>
            <span className="text-[10px] text-gray-500 font-mono">{contact.email}</span>
          </div>
        );
      }
    },
    {
      accessorKey: 'phone',
      header: 'Phone Connection',
      cell: ({ getValue }) => <span className="font-mono text-xs text-gray-400">{getValue() || '—'}</span>
    },
    {
      accessorKey: 'value',
      header: 'Deal Value',
      cell: ({ getValue }) => (
        <span className="font-display font-extrabold text-[#01FDF6] text-xs">
          ${getValue().toLocaleString()}
        </span>
      )
    },
    {
      accessorKey: 'owner',
      header: 'Owner',
      cell: ({ getValue }) => <span className="text-xs text-gray-400 font-medium">{getValue()}</span>
    },
    {
      accessorKey: 'status',
      header: 'Lead Stage',
      cell: ({ getValue }) => (
        <Badge variant={statusVariants[getValue()] || 'neutral'}>
          {getValue()}
        </Badge>
      )
    }
  ];

  // Filters setup
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchValue.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchValue.toLowerCase()) ||
      contact.phone.includes(searchValue);

    const matchesFilter = activeFilter === 'All' || contact.status === activeFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <PageContainer className="contacts-page">
      <PageHeader
        title="Lead Ledger"
        subtitle="Unified customer records with Radix right-click execution & dossiers"
        icon={<span className="text-[#8A4FFF] text-xl">⚡</span>}
        actions={
          <button className="btn btn-primary shadow-glow flex items-center gap-2" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={18} /> Add New Lead
          </button>
        }
      />

      {/* Filter Tabs & Counter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
          {['All', 'New', 'Qualified', 'In Progress', 'Proposal', 'Won', 'Lost'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                activeFilter === tab 
                  ? 'bg-[#8A4FFF] border-[#8A4FFF] text-white shadow-glow' 
                  : 'bg-[#0f1629]/40 border-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="text-xs text-gray-500 font-mono">
          Showing <span className="text-[#01FDF6] font-bold">{filteredContacts.length}</span> leads in roster
        </div>
      </div>

      {/* Grid Layout (List vs Drawer Split) */}
      <div className="contacts-grid-wrapper flex flex-col xl:flex-row gap-6">
        
        {/* Table Container */}
        <div className="flex-1 min-w-0 bg-[#0f1629]/30 border border-gray-800/80 rounded-xl overflow-hidden backdrop-blur-md">
          <DataTable 
            columns={columns}
            data={filteredContacts}
            onRowClick={(row) => setSelectedContact(row)}
            getRowContextMenuItems={getRowContextMenuItems}
            pageSize={10}
          />
        </div>

        {/* Sliding Panel / Drawer style card when contact selected */}
        {selectedContactDetails && (
          <div className="dossier-card card xl:w-[400px] flex-shrink-0 animate-fade-in flex flex-col gap-5 border border-gray-800/85 bg-[#0f1629]/80 backdrop-blur-lg">
            <div className="flex justify-between items-center border-b border-gray-850 pb-4">
              <h3 className="card-title text-white font-black font-display text-base tracking-wide m-0">Client Dossier</h3>
              <button 
                onClick={() => setSelectedContact(null)} 
                className="text-gray-400 hover:text-white p-1 hover:bg-gray-800 rounded-lg transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Profile Avatar & Title */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#8A4FFF]/20 border border-[#8A4FFF]/40 text-[#8A4FFF] flex items-center justify-center font-display font-black text-xl shadow-glow">
                {selectedContactDetails.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-white font-extrabold text-base tracking-tight truncate">{selectedContactDetails.name}</h4>
                <p className="text-gray-400 text-xs font-semibold flex items-center gap-1.5 mt-0.5 truncate">
                  <Building2 size={12} className="text-gray-500" />
                  {selectedContactDetails.company}
                </p>
              </div>
            </div>

            {/* Metadata Fields */}
            <div className="flex flex-col gap-2.5 p-4 bg-[#0a0f1e]/80 border border-gray-850 rounded-xl">
              <div className="flex items-center gap-3 text-xs text-gray-300">
                <Mail size={14} className="text-gray-500 w-4" />
                <span className="truncate">{selectedContactDetails.email || '—'}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-300">
                <Phone size={14} className="text-gray-500 w-4" />
                <span className="font-mono">{selectedContactDetails.phone || '—'}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-300 border-t border-gray-850/50 pt-2.5 mt-1">
                <Briefcase size={14} className="text-gray-500 w-4" />
                <span>
                  Deal Value:{' '}
                  <strong className="text-[#01FDF6] font-display font-black ml-1">
                    ${(selectedContactDetails.value || 0).toLocaleString()}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-300">
                <User size={14} className="text-gray-500 w-4" />
                <span>Account Manager: <span className="font-semibold">{selectedContactDetails.owner || 'Curtis Miller'}</span></span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-300">
                <FileText size={14} className="text-gray-500 w-4" />
                <span>First Contact: <span className="font-mono">{selectedContactDetails.created || 'Just now'}</span></span>
              </div>
            </div>

            {/* Notes Section */}
            <div className="flex flex-col gap-1.5">
              <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Administrative Dossier Notes</h5>
              <div className="p-3 bg-[#E4FF1A]/5 border-l-4 border-[#E4FF1A] rounded-r-lg text-xs text-gray-300 leading-relaxed italic">
                {selectedContactDetails.notes || "No administrative intelligence records filed for this customer."}
              </div>
            </div>

            {/* Drawer Actions Footer */}
            <div className="mt-auto border-t border-gray-850 pt-4 flex gap-3">
              <button 
                className="btn btn-primary flex-1 py-3 text-xs" 
                onClick={(e) => handleEditClick(selectedContactDetails, e)}
              >
                Edit Dossier
              </button>
              <button 
                className="btn btn-outline text-red-500 hover:text-white hover:bg-red-950/20 border-red-950/60 hover:border-red-800 flex items-center justify-center p-3"
                onClick={(e) => handleDeleteClick(selectedContactDetails.id, e)}
                title="Delete Lead"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Contact Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Customer Lead Profile"
        size="md"
      >
        <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Contact Name *</label>
              <input 
                type="text" 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#8A4FFF]" 
                placeholder="e.g. Alice Vance" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Company / Org *</label>
              <input 
                type="text" 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#8A4FFF]" 
                placeholder="e.g. CloudScale Inc." 
                value={company} 
                onChange={e => setCompany(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
              <input 
                type="email" 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#8A4FFF]" 
                placeholder="e.g. alice@cloudscale.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</label>
              <input 
                type="text" 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#8A4FFF]" 
                placeholder="e.g. +1 (555) 234-5678" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Funnel Stage Status</label>
              <select 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#8A4FFF]" 
                value={status} 
                onChange={e => setStatus(e.target.value)}
              >
                <option value="New">New</option>
                <option value="Qualified">Qualified</option>
                <option value="In Progress">In Progress</option>
                <option value="Proposal">Proposal</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Estimated Account Value ($)</label>
              <input 
                type="number" 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#8A4FFF]" 
                placeholder="e.g. 45000" 
                value={value} 
                onChange={e => setValue(e.target.value)} 
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Dossier Intelligence Notes</label>
            <textarea 
              className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#8A4FFF] h-20 resize-none" 
              placeholder="e.g. Prefers email connection. Requires SOC2 documentation for proposal..." 
              value={notes} 
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button 
              type="button" 
              className="px-5 py-2.5 rounded-lg text-sm bg-gray-950 border border-gray-850 text-gray-300 hover:text-white transition-all" 
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 py-2.5 rounded-lg text-sm bg-[#8A4FFF] hover:bg-[#783eeb] text-white font-bold shadow-glow transition-all"
            >
              Create Dossier
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Contact Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modify Lead Dossier"
        size="md"
      >
        <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Contact Name *</label>
              <input 
                type="text" 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#8A4FFF]" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Company / Org *</label>
              <input 
                type="text" 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#8A4FFF]" 
                value={company} 
                onChange={e => setCompany(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
              <input 
                type="email" 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#8A4FFF]" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</label>
              <input 
                type="text" 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#8A4FFF]" 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Funnel Stage Status</label>
              <select 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#8A4FFF]" 
                value={status} 
                onChange={e => setStatus(e.target.value)}
              >
                <option value="New">New</option>
                <option value="Qualified">Qualified</option>
                <option value="In Progress">In Progress</option>
                <option value="Proposal">Proposal</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Estimated Account Value ($)</label>
              <input 
                type="number" 
                className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#8A4FFF]" 
                value={value} 
                onChange={e => setValue(e.target.value)} 
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Dossier Intelligence Notes</label>
            <textarea 
              className="w-full bg-[#0a0f1e] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#8A4FFF] h-20 resize-none" 
              value={notes} 
              onChange={e => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button 
              type="button" 
              className="px-5 py-2.5 rounded-lg text-sm bg-gray-950 border border-gray-850 text-gray-300 hover:text-white transition-all" 
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 py-2.5 rounded-lg text-sm bg-[#8A4FFF] hover:bg-[#783eeb] text-white font-bold shadow-glow transition-all"
            >
              Save Dossier
            </button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
}
