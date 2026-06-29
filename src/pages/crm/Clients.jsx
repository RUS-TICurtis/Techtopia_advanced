import React, { useState } from 'react';
import { useCompanies } from '../../hooks/useCrmData';
import {
  Building2,
  Plus,
  Search,
  MoreHorizontal,
  Globe,
  Phone,
  MapPin,
  Building
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
  DropdownMenuTrigger
} from '../../components/ui/dropdown-menu';
import { Skeleton } from '../../components/ui/Skeleton';

export default function Clients() {
  const { data: companies = [], isLoading, createCompany, updateCompany, deleteCompany } = useCompanies();
  const [isCreating, setIsCreating] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    website: '',
    phone: '',
    address: ''
  });

  const [searchTerm, setSearchTerm] = useState('');

  const filteredCompanies = companies.filter(c =>
    c.type === 'Client' &&
    (c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.industry?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleNewClick = () => {
    setEditingCompany(null);
    setFormData({ name: '', type: 'Client', industry: '', website: '', phone: '', address: '' });
    setIsDialogOpen(true);
  };

  const handleEditClick = (company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name || '',
      type: company.type || 'Client',
      industry: company.industry || '',
      website: company.website || '',
      phone: company.phone || '',
      address: company.address || ''
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      if (editingCompany) {
        await updateCompany({ id: editingCompany.id, data: formData });
      } else {
        await createCompany(formData);
      }
      setIsDialogOpen(false);
      setEditingCompany(null);
      setFormData({ name: '', type: 'Client', industry: '', website: '', phone: '', address: '' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this company?')) {
      await deleteCompany(id);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Building className="h-8 w-8 text-indigo-600" />
            Clients
          </h1>
          <p className="text-slate-500 mt-1">Manage your active clients and won accounts.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleNewClick}>
              <Plus className="h-4 w-4 mr-2" />
              New Client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingCompany ? 'Edit Client' : 'Create New Client'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Company Name *</label>
                <Input
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Acme Corp"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Industry</label>
                <Input
                  value={formData.industry}
                  onChange={e => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="e.g. Software"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Website</label>
                <Input
                  type="url"
                  value={formData.website}
                  onChange={e => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Address</label>
                <Input
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder="123 Main St"
                />
              </div>
              <div className="pt-4 flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); setEditingCompany(null); }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating} className="bg-indigo-600 hover:bg-indigo-700">
                  {isCreating ? 'Saving...' : (editingCompany ? 'Save Changes' : 'Create Client')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters & Search */}
      <div className="flex items-center space-x-2p-3 rounded-lg border border-slate-200 shadow-sm">
        <Search className="h-5 w-5 ml-2" />
        <Input
          placeholder="Search clients by name or industry..."
          className="border-0 shadow-none focus-visible:ring-0 px-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex-1 rounded-xl border  shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase  border-b">
              <tr>
                <th className="px-6 py-4 font-semibold">Client Name</th>
                <th className="px-6 py-4 font-semibold">Industry</th>
                <th className="px-6 py-4 font-semibold">Contact Info</th>
                <th className="px-6 py-4 font-semibold">Location</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y ">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></td>
                  </tr>
                ))
              ) : filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Building className="h-12 w-12 text-indigo-600 mb-3" />
                      <p className="text-lg font-medium">No clients found</p>
                      <p className="text-sm text-slate-500 mt-1">Get started by creating a new client account.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCompanies.map((company) => (
                  <tr key={company.id} className=" transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg  border flex items-center justify-center text-indigo-600 font-bold">
                          {company.name?.charAt(0).toUpperCase() || <Building className="h-5 w-5" />}
                        </div>
                        <div>
                          <div className="font-semibold ">{company.name}</div>
                          <div className="text-xs  mt-0.5">Added {new Date(company.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 ">
                      {company.industry ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          {company.industry}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5  text-xs">
                        {company.website && (
                          <div className="flex items-center gap-2">
                            <Globe className="h-3.5 w-3.5 " />
                            <a href={company.website} target="_blank" rel="noreferrer" className="hover:text-indigo-600 hover:underline">
                              {company.website.replace(/^https?:\/\//, '')}
                            </a>
                          </div>
                        )}
                        {company.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5" />
                            {company.phone}
                          </div>
                        )}
                        {!company.website && !company.phone && '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 ">
                      {company.address ? (
                        <div className="flex items-center gap-2 text-xs">
                          <MapPin className="h-3.5 w-3.5 " />
                          <span className="truncate max-w-[150px]" title={company.address}>{company.address}</span>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0  transition-colors">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem onClick={() => handleEditClick(company)}>Edit Company</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(company.id)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
