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

  // Profile / Settings
  getProfile: () => getStorageItem("crm_profile", INITIAL_PROFILE),
  saveProfile: (profile) => setStorageItem("crm_profile", profile),

  // Clear Database Reset
  resetDb: () => {
    localStorage.removeItem("crm_contacts");
    localStorage.removeItem("crm_deals");
    localStorage.removeItem("crm_tasks");
    localStorage.removeItem("crm_profile");
    return {
      contacts: mockDb.getContacts(),
      deals: mockDb.getDeals(),
      tasks: mockDb.getTasks(),
      profile: mockDb.getProfile()
    };
  }
};
