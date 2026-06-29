import React, { useState } from 'react';
import { useOpportunities, useCompanies, useContacts } from '../../hooks/useCrmData';
import { 
  LineChart, 
  Plus, 
  Search, 
  MoreHorizontal, 
  DollarSign, 
  Calendar as CalendarIcon, 
  Building2,
  User,
  ArrowRight
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../../components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '../../components/ui/dropdown-menu';
import { Skeleton } from '../../components/ui/Skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent } from '../../components/ui/card';

const STAGES = [
  { id: 'Discovery', label: 'Discovery', color: 'bg-slate-100 border-slate-200 text-slate-700' },
  { id: 'Qualified', label: 'Qualified', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { id: 'Proposal', label: 'Proposal', color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { id: 'Won', label: 'Closed Won', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
];

export default function Pipeline() {
  const { data: opportunities = [], isLoading, createOpportunity, updateOpportunity, deleteOpportunity } = useOpportunities();
  const { data: companies = [] } = useCompanies();
  const { data: contacts = [] } = useContacts();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    stage: 'Discovery',
    closeDate: '',
    companyId: 'none',
    contactId: 'none'
  });

  const [searchTerm, setSearchTerm] = useState('');

  const filteredOpps = opportunities.filter(o => 
    o.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewClick = () => {
    setEditingOpportunity(null);
    setFormData({ name: '', amount: '', stage: 'Discovery', closeDate: '', companyId: 'none', contactId: 'none' });
    setIsDialogOpen(true);
  };

  const handleEditClick = (opp) => {
    setEditingOpportunity(opp);
    setFormData({
      name: opp.name || '',
      amount: opp.amount || '',
      stage: opp.stage || 'Discovery',
      closeDate: opp.closeDate ? new Date(opp.closeDate).toISOString().split('T')[0] : '',
      companyId: opp.companyId || 'none',
      contactId: opp.contactId || 'none'
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount) || 0,
        companyId: formData.companyId === 'none' ? null : formData.companyId,
        contactId: formData.contactId === 'none' ? null : formData.contactId
      };
      
      if (editingOpportunity) {
        await updateOpportunity({ id: editingOpportunity.id, data: payload });
      } else {
        await createOpportunity(payload);
      }
      setIsDialogOpen(false);
      setEditingOpportunity(null);
      setFormData({ name: '', amount: '', stage: 'Discovery', closeDate: '', companyId: 'none', contactId: 'none' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this deal?')) {
      await deleteOpportunity(id);
    }
  };

  const handleMoveStage = async (oppId, newStage) => {
    const opp = opportunities.find(o => o.id === oppId);
    if (!opp) return;
    await updateOpportunity({ id: oppId, data: { ...opp, stage: newStage } });
  };

  return (
    <div className="p-8 h-full flex flex-col space-y-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <LineChart className="h-8 w-8 text-indigo-600" />
            Sales Pipeline
          </h1>
          <p className="text-slate-500 mt-1">Track and manage your active deals and opportunities.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleNewClick}>
              <Plus className="h-4 w-4 mr-2" />
              New Deal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingOpportunity ? 'Edit Deal' : 'Create New Deal'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Deal Name *</label>
                <Input 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g. Enterprise License Expansion" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount ($)</label>
                  <Input 
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amount} 
                    onChange={e => setFormData({...formData, amount: e.target.value})} 
                    placeholder="0.00" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Stage</label>
                  <Select value={formData.stage} onValueChange={val => setFormData({...formData, stage: val})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGES.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Expected Close Date</label>
                <Input 
                  type="date"
                  value={formData.closeDate} 
                  onChange={e => setFormData({...formData, closeDate: e.target.value})} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Related Company</label>
                <Select value={formData.companyId} onValueChange={val => setFormData({...formData, companyId: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Company</SelectItem>
                    {companies.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Related Contact</label>
                <Select value={formData.contactId} onValueChange={val => setFormData({...formData, contactId: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a contact" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Contact</SelectItem>
                    {contacts.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.firstName} {c.lastName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pt-4 flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); setEditingOpportunity(null); }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating} className="bg-indigo-600 hover:bg-indigo-700">
                  {isCreating ? 'Saving...' : (editingOpportunity ? 'Save Changes' : 'Create Deal')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters & Search */}
      <div className="flex items-center space-x-2 bg-white p-3 rounded-lg border border-slate-200 shadow-sm shrink-0">
        <Search className="h-5 w-5 text-slate-400 ml-2" />
        <Input 
          placeholder="Search deals by name..." 
          className="border-0 shadow-none focus-visible:ring-0 px-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto min-h-0 pb-4">
        <div className="flex gap-6 h-full min-w-max">
          {STAGES.map(stage => {
            const stageOpps = filteredOpps.filter(o => o.stage === stage.id);
            const stageTotal = stageOpps.reduce((sum, o) => sum + (o.amount || 0), 0);

            return (
              <div key={stage.id} className="w-80 flex flex-col h-full bg-slate-50 rounded-xl border border-slate-200">
                {/* Stage Header */}
                <div className={`p-4 border-b rounded-t-xl ${stage.color}`}>
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-semibold text-sm uppercase tracking-wider">{stage.label}</h3>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/50 border border-black/5">
                      {stageOpps.length}
                    </span>
                  </div>
                  <div className="text-sm font-medium opacity-80">
                    ${stageTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                {/* Stage Cards */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {isLoading ? (
                    Array.from({ length: 2 }).map((_, i) => (
                      <Card key={i} className="shadow-sm border-slate-200">
                        <CardContent className="p-4 space-y-3">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-8 w-full mt-2" />
                        </CardContent>
                      </Card>
                    ))
                  ) : stageOpps.length === 0 ? (
                    <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                      <span className="text-sm text-slate-400 font-medium">No deals in this stage</span>
                    </div>
                  ) : (
                    stageOpps.map(opp => {
                      const comp = companies.find(c => c.id === opp.companyId);
                      const cont = contacts.find(c => c.id === opp.contactId);
                      
                      return (
                        <Card key={opp.id} className="shadow-sm border-slate-200 hover:border-indigo-300 transition-colors group relative cursor-pointer">
                          <CardContent className="p-4 flex flex-col gap-3">
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="font-semibold text-slate-900 leading-tight">{opp.name}</h4>
                              
                              {/* Card Actions Dropdown */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-6 w-6 p-0 -mt-1 -mr-1 text-slate-400 hover:text-slate-600 transition-colors">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem onClick={() => handleEditClick(opp)}>Edit Deal</DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(opp.id)}>Delete Deal</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Move to Stage</div>
                                  {STAGES.filter(s => s.id !== opp.stage).map(s => (
                                    <DropdownMenuItem 
                                      key={s.id} 
                                      onClick={() => handleMoveStage(opp.id, s.id)}
                                      className="flex justify-between"
                                    >
                                      {s.label}
                                      <ArrowRight className="h-3 w-3 text-slate-400" />
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                              <DollarSign className="h-4 w-4" />
                              {(opp.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>

                            {(comp || cont) && (
                              <div className="flex flex-col gap-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                                {comp && (
                                  <div className="flex items-center gap-1.5 truncate">
                                    <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    <span className="truncate">{comp.name}</span>
                                  </div>
                                )}
                                {cont && (
                                  <div className="flex items-center gap-1.5 truncate">
                                    <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    <span className="truncate">{cont.firstName} {cont.lastName}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {opp.closeDate && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 w-fit px-2 py-1 rounded-md mt-1">
                                <CalendarIcon className="h-3.5 w-3.5" />
                                {new Date(opp.closeDate).toLocaleDateString()}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
