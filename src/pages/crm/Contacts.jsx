import React, { useState } from 'react';
import { useContacts, useCompanies } from '../../hooks/useCrmData';
import {
  Users,
  Plus,
  Search,
  MoreHorizontal,
  Mail,
  Phone,
  Briefcase,
  User,
  Building2
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

export default function Contacts() {
  const { data: contacts = [], isLoading, createContact, updateContact, deleteContact } = useContacts();
  const { data: companies = [] } = useCompanies();
  const [isCreating, setIsCreating] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    title: '',
    companyId: ''
  });

  const [searchTerm, setSearchTerm] = useState('');

  const filteredContacts = contacts.filter(c =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewClick = () => {
    setEditingContact(null);
    setFormData({ firstName: '', lastName: '', email: '', phone: '', title: '', companyId: 'none' });
    setIsDialogOpen(true);
  };

  const handleEditClick = (contact) => {
    setEditingContact(contact);
    setFormData({
      firstName: contact.firstName || '',
      lastName: contact.lastName || '',
      email: contact.email || '',
      phone: contact.phone || '',
      title: contact.title || '',
      companyId: contact.companyId || 'none'
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const payload = {
        ...formData,
        companyId: formData.companyId === 'none' ? null : formData.companyId
      };

      if (editingContact) {
        await updateContact({ id: editingContact.id, data: payload });
      } else {
        await createContact(payload);
      }
      setIsDialogOpen(false);
      setEditingContact(null);
      setFormData({ firstName: '', lastName: '', email: '', phone: '', title: '', companyId: 'none' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this contact?')) {
      await deleteContact(id);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-indigo-600" />
            Contacts
          </h1>
          <p className="text-slate-500 mt-1">Manage people and stakeholders across your organizations.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleNewClick}>
              <Plus className="h-4 w-4 mr-2" />
              New Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingContact ? 'Edit Contact' : 'Create New Contact'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name *</label>
                  <Input
                    required
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="Jane"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name *</label>
                  <Input
                    required
                    value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Job Title</label>
                <Input
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. CTO"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Company</label>
                <Select value={formData.companyId} onValueChange={val => setFormData({ ...formData, companyId: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Company (Independent)</SelectItem>
                    {companies.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="jane.doe@example.com"
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

              <div className="pt-4 flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); setEditingContact(null); }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating} className="bg-indigo-600 hover:bg-indigo-700">
                  {isCreating ? 'Saving...' : (editingContact ? 'Save Changes' : 'Create Contact')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters & Search */}
      <div className="flex items-center space-x-2 p-3 rounded-lg border border-slate-200 shadow-sm">
        <Search className="h-5 w-5 ml-2" />
        <Input
          placeholder="Search contacts by name or email..."
          className="border-0 shadow-none focus-visible:ring-0 px-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex-1 rounded-xl border  shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm text-left">
            <thead className="text-xs   uppercase border-b">
              <tr>
                <th className="px-6 py-4 font-semibold">Contact Name</th>
                <th className="px-6 py-4 font-semibold">Company / Title</th>
                <th className="px-6 py-4 font-semibold">Contact Info</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></td>
                  </tr>
                ))
              ) : filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center ">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="h-12 w-12 mb-3" />
                      <p className="text-lg font-medium ">No contacts found</p>
                      <p>Get started by creating a new contact record.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => {
                  // Find company name if backend didn't join it
                  const comp = companies.find(c => c.id === contact.companyId);
                  const companyName = contact.companyName || comp?.name || '-';

                  return (
                    <tr key={contact.id} className=" transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full  border border-slate-200 flex items-center justify-center  font-bold">
                            {contact.firstName?.charAt(0)}{contact.lastName?.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold ">{contact.firstName} {contact.lastName}</div>
                            <div className="text-xs  mt-0.5">Added {new Date(contact.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5 ">
                          {companyName !== '-' && (
                            <div className="flex items-center gap-2 font-medium ">
                              <Building2 className="h-3.5 w-3.5 " />
                              {companyName}
                            </div>
                          )}
                          {contact.title && (
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-3.5 w-3.5 " />
                              {contact.title}
                            </div>
                          )}
                          {companyName === '-' && !contact.title && '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5  text-xs">
                          {contact.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5 " />
                              <a href={`mailto:${contact.email}`} className="hover:text-indigo-600 hover:underline">
                                {contact.email}
                              </a>
                            </div>
                          )}
                          {contact.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-3.5 w-3.5" />
                              {contact.phone}
                            </div>
                          )}
                          {!contact.email && !contact.phone && '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 transition-colors">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[160px]">
                            <DropdownMenuItem onClick={() => handleEditClick(contact)}>Edit Contact</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(contact.id)}>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
