/* ==========================================================================
   Mock Database Layer for BankDash CRM (LocalStorage)
   ========================================================================== */

const INITIAL_CONTACTS = [
  {
    id: "c1",
    name: "Alice Vance",
    company: "CloudScale Inc.",
    email: "alice@cloudscale.com",
    phone: "+1 (555) 234-5678",
    status: "Qualified",
    value: 45000,
    owner: "Curtis Miller",
    created: "2026-05-10",
    notes: "Very interested in our core cloud optimization platform. Needs SOC2 details."
  },
  {
    id: "c2",
    name: "Bob Miller",
    company: "DevFlow.io",
    email: "bob@devflow.io",
    phone: "+1 (555) 876-5432",
    status: "In Progress",
    value: 12500,
    owner: "Curtis Miller",
    created: "2026-05-12",
    notes: "Requested a demo of the developer workspace dashboard."
  },
  {
    id: "c3",
    name: "Catherine Song",
    company: "BioGen Lab",
    email: "catherine.song@biogen.org",
    phone: "+44 20 7946 0958",
    status: "Proposal",
    value: 30000,
    owner: "Curtis Miller",
    created: "2026-05-15",
    notes: "SLA proposal sent for our AI-assisted genomics sorting api license."
  },
  {
    id: "c4",
    name: "David Kross",
    company: "FutureLogic",
    email: "d.kross@futurelogic.net",
    phone: "+49 89 2019 3456",
    status: "New",
    value: 8500,
    owner: "Sarah Jenkins",
    created: "2026-05-19",
    notes: "Inbound request for API integration seats. Schedule discovery."
  },
  {
    id: "c5",
    name: "Elena Rostova",
    company: "CyberPulse Security",
    email: "elena@cyberpulse.com",
    phone: "+1 (555) 345-6789",
    status: "Won",
    value: 75000,
    owner: "Curtis Miller",
    created: "2026-05-01",
    notes: "Closed enterprise tier support. Active onboarding starting next week."
  },
  {
    id: "c6",
    name: "Marcus Aurelius",
    company: "Roma Tech",
    email: "marcus@romatech.eu",
    phone: "+39 06 123456",
    status: "Lost",
    value: 15000,
    owner: "Sarah Jenkins",
    created: "2026-04-18",
    notes: "Chose competitor due to lack of localized EU hosting (resolved since May)."
  }
];

const INITIAL_DEALS = [
  {
    id: "d1",
    title: "Enterprise Cloud Optimization",
    company: "CloudScale Inc.",
    value: 45000,
    stage: "Qualified",
    priority: "High",
    contactId: "c1",
    date: "2026-06-30"
  },
  {
    id: "d2",
    title: "100 Dev Copilot Licenses",
    company: "DevFlow.io",
    value: 12500,
    stage: "In Progress",
    priority: "Medium",
    contactId: "c2",
    date: "2026-06-15"
  },
  {
    id: "d3",
    title: "Genomics Sorting API License",
    company: "BioGen Lab",
    value: 30000,
    stage: "Proposal",
    priority: "High",
    contactId: "c3",
    date: "2026-07-01"
  },
  {
    id: "d4",
    title: "API Integration Hub Pilot",
    company: "FutureLogic",
    value: 8500,
    stage: "Lead",
    priority: "Low",
    contactId: "c4",
    date: "2026-06-25"
  },
  {
    id: "d5",
    title: "Full Security Operations Contract",
    company: "CyberPulse Security",
    value: 75000,
    stage: "Won",
    priority: "High",
    contactId: "c5",
    date: "2026-05-18"
  }
];

const INITIAL_TASKS = [
  {
    id: "t1",
    title: "Send Cloud Migration Proposal",
    contactId: "c1",
    contactName: "Alice Vance",
    date: "2026-05-22",
    status: "Pending",
    priority: "High"
  },
  {
    id: "t2",
    title: "Schedule Platform Technical Demo",
    contactId: "c2",
    contactName: "Bob Miller",
    date: "2026-05-23",
    status: "Completed",
    priority: "Medium"
  },
  {
    id: "t3",
    title: "SOC2 Compliance Documentation Review",
    contactId: "c1",
    contactName: "Alice Vance",
    date: "2026-05-24",
    status: "Pending",
    priority: "High"
  },
  {
    id: "t4",
    title: "Follow up on API SLA Terms",
    contactId: "c3",
    contactName: "Catherine Song",
    date: "2026-05-25",
    status: "Pending",
    priority: "Medium"
  },
  {
    id: "t5",
    title: "Introductory Discovery Call",
    contactId: "c4",
    contactName: "David Kross",
    date: "2026-05-21",
    status: "Completed",
    priority: "Low"
  }
];

const INITIAL_PROFILE = {
  name: "Curtis Tungsten",
  email: "curtis.tungsten@techcorp.io",
  company: "TechCorp Labs",
  role: "Sales Director & Account lead",
  phone: "+1 (555) 901-2345",
  theme: "light",
  notifications: {
    dealUpdates: true,
    taskReminders: true,
    weeklyReports: false
  }
};

const INITIAL_COMPANIES = [
  { id: "comp1", name: "CloudScale Inc.", industry: "Technology", location: "San Francisco, CA", website: "cloudscale.com", employees: "500-1000", status: "Customer", value: 45000 },
  { id: "comp2", name: "DevFlow.io", industry: "Software", location: "Austin, TX", website: "devflow.io", employees: "50-200", status: "Prospect", value: 12500 },
  { id: "comp3", name: "BioGen Lab", industry: "Healthcare", location: "London, UK", website: "biogen.org", employees: "1000+", status: "Customer", value: 30000 },
  { id: "comp4", name: "FutureLogic", industry: "Consulting", location: "Berlin, DE", website: "futurelogic.net", employees: "10-50", status: "Lead", value: 8500 },
  { id: "comp5", name: "CyberPulse Security", industry: "Security", location: "New York, NY", website: "cyberpulse.com", employees: "200-500", status: "Customer", value: 75000 }
];

const INITIAL_INVOICES = [
  { id: "INV-2026-001", client: "CyberPulse Security", amount: 75000, issueDate: "2026-05-01", dueDate: "2026-05-31", status: "Paid" },
  { id: "INV-2026-002", client: "CloudScale Inc.", amount: 45000, issueDate: "2026-05-10", dueDate: "2026-06-10", status: "Sent" },
  { id: "INV-2026-003", client: "BioGen Lab", amount: 30000, issueDate: "2026-05-15", dueDate: "2026-06-15", status: "Draft" },
  { id: "INV-2026-004", client: "Roma Tech", amount: 15000, issueDate: "2026-04-01", dueDate: "2026-05-01", status: "Overdue" }
];

const INITIAL_EVENTS = [
  { id: "e1", title: "Product Demo: CloudScale", date: "2026-05-22", time: "10:00 AM - 11:00 AM", type: "Meeting", attendees: ["Alice Vance", "Curtis Miller"] },
  { id: "e2", title: "Discovery Call: DevFlow", date: "2026-05-23", time: "2:00 PM - 2:30 PM", type: "Call", attendees: ["Bob Miller", "Curtis Miller"] },
  { id: "e3", title: "Contract Review: BioGen", date: "2026-05-24", time: "1:00 PM - 2:00 PM", type: "Meeting", attendees: ["Catherine Song", "Legal Team"] }
];

const INITIAL_MESSAGES = [
  { id: "th1", name: "Alice Vance", avatar: "A", lastMessage: "Yes, the SOC2 details look good.", time: "10:42 AM", unread: true },
  { id: "th2", name: "Sales Team", avatar: "S", lastMessage: "Don't forget the weekly sync at 3.", time: "Yesterday", unread: false },
  { id: "th3", name: "Bob Miller", avatar: "B", lastMessage: "Can we reschedule the demo?", time: "Mon", unread: false }
];

const INITIAL_TICKETS = [
  { id: "TK-2026-001", subject: "API Integration Error - 401 Unauthorized", client: "FutureLogic", priority: "High", status: "Open", lastUpdated: "10 mins ago" },
  { id: "TK-2026-002", subject: "Dashboard loading slowly", client: "DevFlow.io", priority: "Medium", status: "In Progress", lastUpdated: "1 hour ago" },
  { id: "TK-2026-003", subject: "Need help setting up user roles", client: "BioGen Lab", priority: "Low", status: "Resolved", lastUpdated: "1 day ago" }
];

const getStorageItem = (key, initialValue) => {
  const item = localStorage.getItem(key);
  if (!item) {
    localStorage.setItem(key, JSON.stringify(initialValue));
    return initialValue;
  }
  try {
    return JSON.parse(item);
  } catch {
    return initialValue;
  }
};

const setStorageItem = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// export Db
export const mockDb = {
  // Contacts
  getContacts: () => getStorageItem("crm_contacts", INITIAL_CONTACTS),
  saveContacts: (contacts) => setStorageItem("crm_contacts", contacts),
  addContact: (contact) => {
    const contacts = mockDb.getContacts();
    const newContact = {
      id: "c_" + Date.now(),
      created: new Date().toISOString().split('T')[0],
      owner: mockDb.getProfile().name || "Curtis Tungsten",
      ...contact
    };
    contacts.push(newContact);
    mockDb.saveContacts(contacts);
    return newContact;
  },
  updateContact: (updatedContact) => {
    const contacts = mockDb.getContacts();
    const index = contacts.findIndex(c => c.id === updatedContact.id);
    if (index !== -1) {
      contacts[index] = updatedContact;
      mockDb.saveContacts(contacts);
      return true;
    }
    return false;
  },
  deleteContact: (id) => {
    const contacts = mockDb.getContacts();
    const filtered = contacts.filter(c => c.id !== id);
    mockDb.saveContacts(filtered);
  },
  updateUserProfile: (updatedProfile) => {
    const profile = mockDb.getProfile();
    const newProfile = { ...profile, ...updatedProfile };
    mockDb.saveProfile(newProfile);
    return true;
  },

  // Deals
  getDeals: () => getStorageItem("crm_deals", INITIAL_DEALS),
  saveDeals: (deals) => setStorageItem("crm_deals", deals),
  addDeal: (deal) => {
    const deals = mockDb.getDeals();
    const newDeal = {
      id: "d_" + Date.now(),
      ...deal
    };
    deals.push(newDeal);
    mockDb.saveDeals(deals);
    return newDeal;
  },
  updateDeal: (updatedDeal) => {
    const deals = mockDb.getDeals();
    const index = deals.findIndex(d => d.id === updatedDeal.id);
    if (index !== -1) {
      deals[index] = updatedDeal;
      mockDb.saveDeals(deals);
      return true;
    }
    return false;
  },
  deleteDeal: (id) => {
    const deals = mockDb.getDeals();
    const filtered = deals.filter(d => d.id !== id);
    mockDb.saveDeals(filtered);
  },

  // Tasks
  getTasks: () => getStorageItem("crm_tasks", INITIAL_TASKS),
  saveTasks: (tasks) => setStorageItem("crm_tasks", tasks),
  addTask: (task) => {
    const tasks = mockDb.getTasks();
    const newTask = {
      id: "t_" + Date.now(),
      status: "Pending",
      ...task
    };
    tasks.push(newTask);
    mockDb.saveTasks(tasks);
    return newTask;
  },
  updateTask: (updatedTask) => {
    const tasks = mockDb.getTasks();
    const index = tasks.findIndex(t => t.id === updatedTask.id);
    if (index !== -1) {
      tasks[index] = updatedTask;
      mockDb.saveTasks(tasks);
      return true;
    }
    return false;
  },
  deleteTask: (id) => {
    const tasks = mockDb.getTasks();
    const filtered = tasks.filter(t => t.id !== id);
    mockDb.saveTasks(filtered);
  },

  // Companies
  getCompanies: () => getStorageItem("crm_companies", INITIAL_COMPANIES),
  saveCompanies: (companies) => setStorageItem("crm_companies", companies),
  
  // Invoices
  getInvoices: () => getStorageItem("crm_invoices", INITIAL_INVOICES),
  saveInvoices: (invoices) => setStorageItem("crm_invoices", invoices),
  
  // Events
  getEvents: () => getStorageItem("crm_events", INITIAL_EVENTS),
  saveEvents: (events) => setStorageItem("crm_events", events),
  
  // Messages
  getMessages: () => getStorageItem("crm_messages", INITIAL_MESSAGES),
  saveMessages: (messages) => setStorageItem("crm_messages", messages),
  
  // Tickets
  getTickets: () => getStorageItem("crm_tickets", INITIAL_TICKETS),
  saveTickets: (tickets) => setStorageItem("crm_tickets", tickets),

  // Profile / Settings
  getProfile: () => getStorageItem("crm_profile", INITIAL_PROFILE),
  saveProfile: (profile) => setStorageItem("crm_profile", profile),

  // Clear Database Reset
  resetDb: () => {
    localStorage.removeItem("crm_contacts");
    localStorage.removeItem("crm_deals");
    localStorage.removeItem("crm_tasks");
    localStorage.removeItem("crm_companies");
    localStorage.removeItem("crm_invoices");
    localStorage.removeItem("crm_events");
    localStorage.removeItem("crm_messages");
    localStorage.removeItem("crm_tickets");
    localStorage.removeItem("crm_profile");
    return {
      contacts: mockDb.getContacts(),
      deals: mockDb.getDeals(),
      tasks: mockDb.getTasks(),
      companies: mockDb.getCompanies(),
      invoices: mockDb.getInvoices(),
      events: mockDb.getEvents(),
      messages: mockDb.getMessages(),
      tickets: mockDb.getTickets(),
      profile: mockDb.getProfile()
    };
  }
};
