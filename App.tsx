import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ClientSection from './components/ClientSection';
import ProjectSection from './components/ProjectSection';
import FinanceSection from './components/FinanceSection';
import ReportsSection from './components/ReportsSection';
import SettingsSection from './components/SettingsSection';
import Modal from './components/Modal';
import ClientForm from './components/ClientForm';
import ProjectForm from './components/ProjectForm';
import InvoiceForm from './components/InvoiceForm';
import ConfirmationModal from './components/ConfirmationModal';
import ProfileSettingsModal from './components/ProfileSettingsModal';
import AuthPage from './components/AuthPage';
import AccessDenied from './components/AccessDenied';
import { CLIENTS as initialClients, PROJECTS as initialProjects, INVOICES as initialInvoices, DEFAULT_PROJECT_CHECKLIST, USERS as initialUsers } from './constants';
import type { Client, Project, Invoice, User } from './types';

type ModalState =
  | { type: 'CLOSED' }
  | { type: 'ADD_CLIENT' }
  | { type: 'EDIT_CLIENT'; client: Client }
  | { type: 'DELETE_CLIENT'; client: Client }
  | { type: 'ADD_PROJECT' }
  | { type: 'EDIT_PROJECT'; project: Project }
  | { type: 'DELETE_PROJECT'; project: Project }
  | { type: 'ADD_INVOICE' }
  | { type: 'EDIT_INVOICE'; invoice: Invoice }
  | { type: 'DELETE_INVOICE'; invoice: Invoice }
  | { type: 'EDIT_PROFILE'; user: User };

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [clients, setClients] = useState<Client[]>(initialClients);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [modalState, setModalState] = useState<ModalState>({ type: 'CLOSED' });
  const [activeView, setActiveView] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false); // Close mobile sidebar on larger screens
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- AUTH HANDLERS ---
  const handleLogin = (email: string, password?: string): boolean => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      const { password: _password, ...userWithoutPassword } = user;
      setCurrentUser(userWithoutPassword as User);
      return true;
    }
    return false;
  };

  const handleGuestLogin = () => {
    setCurrentUser({
      id: Date.now(),
      name: 'Guest',
      email: '',
      role: 'Guest',
      avatarUrl: 'https://picsum.photos/seed/guest/100/100',
    });
  };

  const handleRegister = (newUser: Omit<User, 'id' | 'role' | 'avatarUrl'>): boolean => {
    if (users.some(u => u.email === newUser.email)) {
      return false; // User already exists
    }
    const userToCreate: User = {
      ...newUser,
      id: Date.now(),
      role: 'User',
      avatarUrl: `https://picsum.photos/seed/${newUser.name.split(' ').join('')}/100/100`,
    };
    setUsers([...users, userToCreate]);
    const { password, ...userWithoutPassword } = userToCreate;
    setCurrentUser(userWithoutPassword as User);
    return true;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveView('Dashboard');
  };


  // Client Handlers
  const handleClientSubmit = (clientData: Omit<Client, 'id'> | Client) => {
    if ('id' in clientData) {
      setClients(clients.map(c => c.id === clientData.id ? clientData : c));
    } else {
      const newClient = { ...clientData, id: Date.now() };
      setClients([...clients, newClient]);
    }
    setModalState({ type: 'CLOSED' });
  };

  const handleConfirmDeleteClient = () => {
    if (modalState.type === 'DELETE_CLIENT') {
      setClients(clients.filter(c => c.id !== modalState.client.id));
      setProjects(projects.filter(p => p.clientName !== modalState.client.name));
      setModalState({ type: 'CLOSED' });
    }
  };

  // Project Handlers
  const handleProjectSubmit = (projectData: Omit<Project, 'id' | 'checklist'> | Project) => {
    if ('id' in projectData) {
      setProjects(projects.map(p => p.id === projectData.id ? projectData as Project : p));
    } else {
      const newProject = { ...projectData, id: Date.now(), checklist: JSON.parse(JSON.stringify(DEFAULT_PROJECT_CHECKLIST)) };
      setProjects([...projects, newProject]);
    }
    setModalState({ type: 'CLOSED' });
  };

  const handleConfirmDeleteProject = () => {
    if (modalState.type === 'DELETE_PROJECT') {
      setProjects(projects.filter(p => p.id !== modalState.project.id));
      setModalState({ type: 'CLOSED' });
    }
  };

  const handleProjectImageUpload = (projectId: number, imageUrl: string) => {
    setProjects(projects.map(p => 
      p.id === projectId 
        ? { ...p, imageUrls: [...(p.imageUrls || []), imageUrl] }
        : p
    ));
  };

  const handleProjectNotesChange = (projectId: number, notes: string) => {
    setProjects(projects.map(p => 
        p.id === projectId 
            ? { ...p, notes }
            : p
    ));
  };

  const handleProjectImageDelete = (projectId: number, imageUrl: string) => {
      setProjects(projects.map(p => 
          p.id === projectId 
              ? { ...p, imageUrls: (p.imageUrls || []).filter(url => url !== imageUrl) }
              : p
      ));
  };

  // Invoice Handlers
  const getNextInvoiceId = (): string => {
    if (invoices.length === 0) return 'BX0001';
    const lastId = invoices.reduce((maxId, inv) => {
        const idNum = parseInt(inv.id.replace('BX', ''), 10);
        return idNum > maxId ? idNum : maxId;
    }, 0);
    const nextNum = lastId + 1;
    return `BX${String(nextNum).padStart(4, '0')}`;
  };

  const handleInvoiceSubmit = (invoiceData: Invoice) => {
    const isEditing = invoices.some(i => i.id === invoiceData.id);
    if (isEditing) {
        setInvoices(invoices.map(i => i.id === invoiceData.id ? invoiceData : i));
    } else {
        setInvoices([...invoices, invoiceData]);
    }
    setModalState({ type: 'CLOSED' });
  };

  const handleConfirmDeleteInvoice = () => {
    if (modalState.type === 'DELETE_INVOICE') {
        setInvoices(invoices.filter(i => i.id !== modalState.invoice.id));
        setModalState({ type: 'CLOSED' });
    }
  };

  // User Profile Handler
  const handleProfileUpdate = (userData: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...userData };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u));
    setModalState({ type: 'CLOSED' });
  };


  const renderModal = () => {
    switch (modalState.type) {
      case 'ADD_CLIENT':
      case 'EDIT_CLIENT':
        return (
          <Modal isOpen={true} onClose={() => setModalState({ type: 'CLOSED' })} title={modalState.type === 'ADD_CLIENT' ? 'Add New Client' : 'Edit Client'}>
            <ClientForm initialData={modalState.type === 'EDIT_CLIENT' ? modalState.client : null} onSubmit={handleClientSubmit} onClose={() => setModalState({ type: 'CLOSED' })} />
          </Modal>
        );
      case 'DELETE_CLIENT':
        return (
          <ConfirmationModal isOpen={true} onClose={() => setModalState({ type: 'CLOSED' })} onConfirm={handleConfirmDeleteClient} title="Delete Client" message={`Are you sure you want to delete ${modalState.client.name}? This will also remove their associated projects.`} />
        );
      case 'ADD_PROJECT':
      case 'EDIT_PROJECT':
         return (
          <Modal isOpen={true} onClose={() => setModalState({ type: 'CLOSED' })} title={modalState.type === 'ADD_PROJECT' ? 'Add New Project' : 'Edit Project'}>
            <ProjectForm initialData={modalState.type === 'EDIT_PROJECT' ? modalState.project : null} onSubmit={handleProjectSubmit} onClose={() => setModalState({ type: 'CLOSED' })} clientNames={clients.map(c => c.name)} />
          </Modal>
        );
      case 'DELETE_PROJECT':
        return (
            <ConfirmationModal isOpen={true} onClose={() => setModalState({ type: 'CLOSED' })} onConfirm={handleConfirmDeleteProject} title="Delete Project" message={`Are you sure you want to delete the project "${modalState.project.name}"?`} />
        );
      case 'ADD_INVOICE':
      case 'EDIT_INVOICE':
        const activeProjects = projects.filter(p => p.status === 'In Progress');
        return (
          <Modal isOpen={true} onClose={() => setModalState({ type: 'CLOSED' })} title={modalState.type === 'ADD_INVOICE' ? 'Create New Invoice' : 'Edit Invoice'}>
            <InvoiceForm 
              initialData={modalState.type === 'EDIT_INVOICE' ? modalState.invoice : null} 
              onSubmit={handleInvoiceSubmit} 
              onClose={() => setModalState({ type: 'CLOSED' })} 
              clientNames={clients.map(c => c.name)} 
              nextInvoiceId={modalState.type === 'ADD_INVOICE' ? getNextInvoiceId() : undefined}
              activeProjects={activeProjects}
            />
          </Modal>
        );
      case 'DELETE_INVOICE':
        return (
            <ConfirmationModal isOpen={true} onClose={() => setModalState({ type: 'CLOSED' })} onConfirm={handleConfirmDeleteInvoice} title="Delete Invoice" message={`Are you sure you want to delete invoice ${modalState.invoice.id}?`} />
        );
       case 'EDIT_PROFILE':
        return (
          <Modal isOpen={true} onClose={() => setModalState({ type: 'CLOSED' })} title="Edit Profile">
            <ProfileSettingsModal user={currentUser!} onSave={handleProfileUpdate} onClose={() => setModalState({ type: 'CLOSED' })} />
          </Modal>
        );
      case 'CLOSED':
      default:
        return null;
    }
  };
  
  const renderView = () => {
    if (!currentUser) return null;
    const commonClientProps = {
      onAdd: () => setModalState({ type: 'ADD_CLIENT' }),
      onEdit: (client: Client) => setModalState({ type: 'EDIT_CLIENT', client }),
      onDelete: (client: Client) => setModalState({ type: 'DELETE_CLIENT', client }),
    };
    const commonProjectProps = {
      onAdd: () => setModalState({ type: 'ADD_PROJECT' }),
      onEdit: (project: Project) => setModalState({ type: 'EDIT_PROJECT', project }),
      onDelete: (project: Project) => setModalState({ type: 'DELETE_PROJECT', project }),
    };

    switch(activeView) {
      case 'Dashboard':
        return (
          <div className="space-y-8">
            <ClientSection clients={clients} {...commonClientProps} isDashboard={true} />
            <ProjectSection projects={projects} {...commonProjectProps} isDashboard={true} />
          </div>
        );
      case 'Clients':
        return <ClientSection clients={clients} {...commonClientProps} isDashboard={false} />;
      case 'Projects':
        return <ProjectSection projects={projects} {...commonProjectProps} isDashboard={false} />;
      case 'Finance':
        if (currentUser.role === 'Guest') {
          return <AccessDenied />;
        }
        return <FinanceSection 
                  invoices={invoices} 
                  projects={projects}
                  onAdd={() => setModalState({ type: 'ADD_INVOICE' })}
                  onEdit={(invoice: Invoice) => setModalState({ type: 'EDIT_INVOICE', invoice })}
                  onDelete={(invoice: Invoice) => setModalState({ type: 'DELETE_INVOICE', invoice })}
                />;
      case 'Reports':
        return <ReportsSection 
                  projects={projects} 
                  onImageUpload={handleProjectImageUpload} 
                  onNotesChange={handleProjectNotesChange}
                  onImageDelete={handleProjectImageDelete}
                />;
      case 'Settings':
        return <SettingsSection />;
      default:
        return <div className="text-center p-8">Select a view</div>;
    }
  };

  if (!currentUser) {
    return (
      <AuthPage 
        onLogin={handleLogin}
        onGuestLogin={handleGuestLogin}
        onRegister={handleRegister}
      />
    );
  }

  return (
    <div className="bg-slate-900 text-slate-300 font-sans min-h-screen">
      <div className="flex">
        <Sidebar 
            activeView={activeView} 
            onViewChange={setActiveView} 
            isOpen={isSidebarOpen}
            setIsOpen={setIsSidebarOpen}
            user={currentUser}
        />
        <main className="flex-1 flex flex-col min-w-0">
          <Header 
            user={currentUser} 
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
            onEditProfile={() => setModalState({ type: 'EDIT_PROFILE', user: currentUser })}
            onLogout={handleLogout}
          />
          <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-800">
            <div className="p-4 sm:p-6 lg:p-8">
              {renderView()}
            </div>
          </div>
        </main>
      </div>
      {renderModal()}
    </div>
  );
};

export default App;