import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs
} from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../lib/firebase';
import {
  AuditLog,
  AuthUser,
  CompanySettings,
  Customer,
  Loan,
  LoanApplication,
  LoanApplicationStatus,
  RepaymentRecord,
  StaffUser,
  SystemNotification,
  UserRole
} from '../types';
import {
  initialAuditLogs,
  initialCompanySettings,
  initialCustomers,
  initialLoanApplications,
  initialLoans,
  initialNotifications,
  initialRepayments,
  initialStaffUsers
} from '../data/initialData';
import { calculateLoan } from '../lib/loanEngine';
import { BLACK_VECTOR_BORROWER } from '../lib/vectorIcons';

interface AppContextType {
  // Routing & View Mode
  currentPath: string;
  navigatePath: (path: string) => void;
  viewMode: 'customer' | 'admin';
  setViewMode: (mode: 'customer' | 'admin') => void;
  adminMode: 'desktop' | 'android';
  setAdminMode: (mode: 'desktop' | 'android') => void;

  // Active Users & Auth
  currentUser: AuthUser | null;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authModalTab: 'login' | 'signup';
  authModalType: 'customer' | 'staff';
  openAuthModal: (tab?: 'login' | 'signup', type?: 'customer' | 'staff') => void;
  loginWithUsernameAndPassword: (usernameOrEmail: string, pass: string, userType?: 'customer' | 'staff') => Promise<{ success: boolean; message: string; user?: AuthUser }>;
  signupCustomer: (data: { username: string; password: string; fullName: string; email: string; phone: string; nationalId?: string; address?: string; occupation?: string; monthlyIncome?: number; monthlyExpenses?: number }) => Promise<{ success: boolean; message: string; user?: AuthUser }>;
  signupStaff: (data: { username: string; password: string; name: string; email: string; role: UserRole; phone?: string; employeeCode?: string }) => Promise<{ success: boolean; message: string; user?: AuthUser }>;
  logout: () => void;

  activeCustomer: Customer | null;
  setActiveCustomer: (cust: Customer | null) => void;
  activeStaff: StaffUser;
  setActiveStaffRole: (role: UserRole) => void;
  firebaseUser: FirebaseUser | null;
  isFirebaseConnected: boolean;

  // System Data
  companySettings: CompanySettings;
  updateCompanySettings: (settings: Partial<CompanySettings>) => void;
  customers: Customer[];
  loanApplications: LoanApplication[];
  loans: Loan[];
  repayments: RepaymentRecord[];
  notifications: SystemNotification[];
  auditLogs: AuditLog[];
  staffUsers: StaffUser[];

  // Actions
  registerCustomer: (data: Omit<Customer, 'id' | 'registeredAt' | 'kycStatus' | 'accountStatus'>) => Customer;
  updateCustomerKYC: (customerId: string, kycStatus: Customer['kycStatus'], docs?: Partial<Customer>) => void;
  updateCustomerStatus: (customerId: string, status: Customer['accountStatus'], notes?: string) => void;
  updateCustomerDetails: (customerId: string, updatedData: Partial<Customer>) => void;
  deleteCustomer: (customerId: string) => void;
  
  // Loan Actions
  submitLoanApplication: (appData: Omit<LoanApplication, 'id' | 'status' | 'submittedAt'>) => LoanApplication;
  approveLoanApplication: (applicationId: string) => void;
  rejectLoanApplication: (applicationId: string, reason: string) => void;
  disburseLoan: (applicationId: string) => void;

  // Repayment Actions
  recordRepayment: (repaymentData: Omit<RepaymentRecord, 'id' | 'date'>) => RepaymentRecord;

  // Admin Logs & Notifications
  addNotification: (notif: Omit<SystemNotification, 'id' | 'date' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  addAuditLog: (action: string, target: string, details: string) => void;

  // File Upload Helper
  uploadFile: (file: File, pathFolder?: string) => Promise<string>;

  // Helper
  resetSystemData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState<string>(
    typeof window !== 'undefined' ? window.location.pathname || '/' : '/'
  );
  const [viewMode, setViewMode] = useState<'customer' | 'admin'>('customer');
  const [adminMode, setAdminMode] = useState<'desktop' | 'android'>('desktop');
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);

  // States
  const [companySettings, setCompanySettings] = useState<CompanySettings>(initialCompanySettings);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>(initialStaffUsers);
  const [activeStaff, setActiveStaff] = useState<StaffUser>(
    initialStaffUsers[0] || {
      id: 'default_admin',
      username: 'admin',
      name: 'System Admin',
      email: 'admin@cashfirstgroup.mw',
      role: 'Super Admin',
      status: 'Active',
      phone: '+265 994 169 563',
      branch: 'Lilongwe Branch',
    }
  );
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>(initialLoanApplications);
  const [loans, setLoans] = useState<Loan[]>(initialLoans);
  const [repayments, setRepayments] = useState<RepaymentRecord[]>(initialRepayments);
  const [notifications, setNotifications] = useState<SystemNotification[]>(initialNotifications);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);

  // Auth Modal & User States
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');
  const [authModalType, setAuthModalType] = useState<'customer' | 'staff'>('customer');

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('cashfirst_current_user');
        return saved ? (JSON.parse(saved) as AuthUser) : null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        if (currentUser) {
          localStorage.setItem('cashfirst_current_user', JSON.stringify(currentUser));
        } else {
          localStorage.removeItem('cashfirst_current_user');
        }
      } catch (e) {
        // ignore
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.userType === 'staff' && currentUser.staffData) {
        setActiveStaff(currentUser.staffData);
      } else if (currentUser.userType === 'customer' && currentUser.customerData) {
        setActiveCustomer(currentUser.customerData);
      }
    }
  }, []);

  const openAuthModal = (tab: 'login' | 'signup' = 'login', type: 'customer' | 'staff' = 'customer') => {
    setAuthModalTab(tab);
    setAuthModalType(type);
    setShowAuthModal(true);
  };

  const navigatePath = (newPath: string) => {
    let targetPath = newPath;
    if (newPath.startsWith('/admin')) {
      if (currentUser?.userType === 'staff') {
        setViewMode('admin');
      } else {
        targetPath = '/admin/login';
        setViewMode('admin');
      }
    } else {
      setViewMode('customer');
    }
    setCurrentPath(targetPath);
    if (typeof window !== 'undefined') {
      try {
        window.history.pushState({}, '', targetPath);
      } catch (e) {
        // ignore
      }
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = typeof window !== 'undefined' ? window.location.pathname || '/' : '/';
      if (path.startsWith('/admin')) {
        if (currentUser?.userType === 'staff') {
          setViewMode('admin');
          setCurrentPath(path);
        } else {
          setViewMode('admin');
          setCurrentPath('/admin/login');
        }
      } else {
        setViewMode('customer');
        setCurrentPath(path);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [currentUser]);

  const loginWithUsernameAndPassword = async (
    usernameOrEmail: string,
    pass: string,
    requestedType?: 'customer' | 'staff'
  ): Promise<{ success: boolean; message: string; user?: AuthUser }> => {
    const queryTerm = usernameOrEmail.trim().toLowerCase();

    let foundStaff: StaffUser | undefined;
    let foundCustomer: Customer | undefined;

    if (requestedType === 'staff') {
      foundStaff = staffUsers.find(
        (s) => (s.username && s.username.toLowerCase() === queryTerm) || s.email.toLowerCase() === queryTerm
      );
      if (!foundStaff) {
        foundCustomer = customers.find(
          (c) => (c.username && c.username.toLowerCase() === queryTerm) || c.email.toLowerCase() === queryTerm
        );
      }
    } else {
      foundCustomer = customers.find(
        (c) => (c.username && c.username.toLowerCase() === queryTerm) || c.email.toLowerCase() === queryTerm
      );
      if (!foundCustomer) {
        foundStaff = staffUsers.find(
          (s) => (s.username && s.username.toLowerCase() === queryTerm) || s.email.toLowerCase() === queryTerm
        );
      }
    }

    // Direct Firestore fallback check to guarantee accounts created in Firestore are immediately resolvable
    if (!foundStaff && !foundCustomer) {
      try {
        const staffSnap = await getDocs(collection(db, 'staff'));
        const remoteStaff = staffSnap.docs.map((d) => d.data() as StaffUser);
        foundStaff = remoteStaff.find(
          (s) => (s.username && s.username.toLowerCase() === queryTerm) || (s.email && s.email.toLowerCase() === queryTerm)
        );
        if (foundStaff) {
          setStaffUsers(remoteStaff);
        }
      } catch (e) {
        console.warn('Firestore staff query fallback error:', e);
      }
    }

    if (!foundStaff && !foundCustomer) {
      try {
        const custSnap = await getDocs(collection(db, 'customers'));
        const remoteCust = custSnap.docs.map((d) => d.data() as Customer);
        foundCustomer = remoteCust.find(
          (c) => (c.username && c.username.toLowerCase() === queryTerm) || (c.email && c.email.toLowerCase() === queryTerm)
        );
        if (foundCustomer) {
          setCustomers(remoteCust);
        }
      } catch (e) {
        console.warn('Firestore customer query fallback error:', e);
      }
    }

    if (foundStaff) {
      const expectedPass = foundStaff.password || 'password123';
      if (pass !== expectedPass) {
        return { success: false, message: 'Invalid password for staff account.' };
      }

      const authUser: AuthUser = {
        id: foundStaff.id,
        username: foundStaff.username || queryTerm,
        email: foundStaff.email,
        fullName: foundStaff.name,
        userType: 'staff',
        role: foundStaff.role,
        avatarUrl: foundStaff.avatarUrl,
        staffData: foundStaff,
      };

      setActiveStaff(foundStaff);
      setViewMode('admin');
      setCurrentUser(authUser);

      try {
        await signInWithEmailAndPassword(auth, foundStaff.email, pass);
      } catch (e) {
        // Local mode fallback
      }

      addAuditLog('STAFF_LOGIN', foundStaff.name, `Staff member logged in (${foundStaff.role})`);
      return { success: true, message: 'Logged in successfully as staff', user: authUser };
    }

    if (foundCustomer) {
      const expectedPass = foundCustomer.password || 'password123';
      if (pass !== expectedPass) {
        return { success: false, message: 'Invalid password for customer account.' };
      }

      const authUser: AuthUser = {
        id: foundCustomer.id,
        username: foundCustomer.username || queryTerm,
        email: foundCustomer.email,
        fullName: foundCustomer.fullName,
        userType: 'customer',
        avatarUrl: foundCustomer.avatarUrl,
        customerData: foundCustomer,
      };

      setActiveCustomer(foundCustomer);
      setViewMode('customer');
      setCurrentUser(authUser);

      try {
        await signInWithEmailAndPassword(auth, foundCustomer.email, pass);
      } catch (e) {
        // Local mode fallback
      }

      addAuditLog('CUSTOMER_LOGIN', foundCustomer.fullName, `Customer logged in: ${foundCustomer.email}`);
      return { success: true, message: 'Logged in successfully as customer', user: authUser };
    }

    return { success: false, message: 'Account not found. Please check your username or email.' };
  };

  const signupCustomer = async (data: {
    username: string;
    password: string;
    fullName: string;
    email: string;
    phone: string;
    nationalId?: string;
    address?: string;
    occupation?: string;
    monthlyIncome?: number;
    monthlyExpenses?: number;
  }): Promise<{ success: boolean; message: string; user?: AuthUser }> => {
    const cleanUsername = data.username.trim().toLowerCase();
    const cleanEmail = data.email.trim().toLowerCase();

    const usernameExists = customers.some((c) => c.username?.toLowerCase() === cleanUsername) ||
      staffUsers.some((s) => s.username?.toLowerCase() === cleanUsername);
    if (usernameExists) {
      return { success: false, message: 'Username is already taken. Please choose another.' };
    }

    const emailExists = customers.some((c) => c.email.toLowerCase() === cleanEmail) ||
      staffUsers.some((s) => s.email.toLowerCase() === cleanEmail);
    if (emailExists) {
      return { success: false, message: 'An account with this email already exists. Please log in.' };
    }

    let firebaseUid: string | undefined;
    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, data.password);
      firebaseUid = cred.user.uid;
    } catch (e) {
      console.warn('Firebase Auth user creation warning:', e);
    }

    const newCust: Customer = {
      id: `cust_${Date.now()}`,
      firebaseUid,
      username: cleanUsername,
      password: data.password,
      fullName: data.fullName,
      email: cleanEmail,
      phone: data.phone || '+265 999 000 000',
      nationalId: data.nationalId || `ID-${Math.floor(10000000 + Math.random() * 90000000)}`,
      address: data.address || 'Lilongwe, Malawi',
      occupation: data.occupation || 'General Practitioner',
      monthlyIncome: data.monthlyIncome || 500000,
      monthlyExpenses: data.monthlyExpenses || 200000,
      kycStatus: 'Pending',
      accountStatus: 'Active',
      registeredAt: new Date().toISOString().split('T')[0],
      avatarUrl: BLACK_VECTOR_BORROWER,
    };

    setCustomers((prev) => [newCust, ...prev]);
    setActiveCustomer(newCust);
    setViewMode('customer');

    // Save to Firestore and await confirmation to guarantee account persistence
    try {
      await setDoc(doc(db, 'customers', newCust.id), newCust);
    } catch (e) {
      console.warn('Firestore setDoc customer warning:', e);
    }

    const authUser: AuthUser = {
      id: newCust.id,
      username: cleanUsername,
      email: cleanEmail,
      fullName: newCust.fullName,
      userType: 'customer',
      avatarUrl: newCust.avatarUrl,
      customerData: newCust,
    };
    setCurrentUser(authUser);

    addAuditLog('REGISTER_CUSTOMER_SIGNUP', newCust.fullName, `New customer registered: ${cleanUsername} (${cleanEmail})`);
    addNotification({
      recipientId: 'all_staff',
      title: 'New Customer Sign Up',
      message: `${newCust.fullName} (@${cleanUsername}) created a new account.`,
      channel: 'Push',
      type: 'system',
    });

    return { success: true, message: 'Account created successfully!', user: authUser };
  };

  const signupStaff = async (data: {
    username: string;
    password: string;
    name: string;
    email: string;
    role: UserRole;
    phone?: string;
    employeeCode?: string;
  }): Promise<{ success: boolean; message: string; user?: AuthUser }> => {
    const cleanUsername = data.username.trim().toLowerCase();
    const cleanEmail = data.email.trim().toLowerCase();

    const usernameExists = staffUsers.some((s) => s.username?.toLowerCase() === cleanUsername) ||
      customers.some((c) => c.username?.toLowerCase() === cleanUsername);
    if (usernameExists) {
      return { success: false, message: 'Username is already taken.' };
    }

    const emailExists = staffUsers.some((s) => s.email.toLowerCase() === cleanEmail) ||
      customers.some((c) => c.email.toLowerCase() === cleanEmail);
    if (emailExists) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    let firebaseUid: string | undefined;
    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, data.password);
      firebaseUid = cred.user.uid;
    } catch (e) {
      console.warn('Firebase Auth staff creation warning:', e);
    }

    const newStaff: StaffUser = {
      id: `staff_${Date.now()}`,
      firebaseUid,
      username: cleanUsername,
      password: data.password,
      name: data.name,
      email: cleanEmail,
      phone: data.phone || '+265 994 169 563',
      role: data.role,
      avatarUrl: BLACK_VECTOR_BORROWER,
    };

    setStaffUsers((prev) => [newStaff, ...prev]);
    setActiveStaff(newStaff);
    setViewMode('admin');

    // Save to Firestore and await confirmation to guarantee staff account persistence
    try {
      await setDoc(doc(db, 'staff', newStaff.id), newStaff);
    } catch (e) {
      console.warn('Firestore setDoc staff warning:', e);
    }

    const authUser: AuthUser = {
      id: newStaff.id,
      username: cleanUsername,
      email: cleanEmail,
      fullName: newStaff.name,
      userType: 'staff',
      role: newStaff.role,
      avatarUrl: newStaff.avatarUrl,
      staffData: newStaff,
    };
    setCurrentUser(authUser);

    addAuditLog('REGISTER_STAFF_SIGNUP', newStaff.name, `New staff account created: ${cleanUsername} (${newStaff.role})`);
    return { success: true, message: 'Staff user created successfully!', user: authUser };
  };

  const logout = () => {
    signOut(auth).catch(() => {});
    if (currentUser) {
      addAuditLog('USER_LOGOUT', currentUser.fullName, `${currentUser.userType} logged out.`);
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('cashfirst_current_user');
      } catch (e) {
        // ignore
      }
    }
    setCurrentUser(null);
  };

  // Sync Company Settings with Firestore
  useEffect(() => {
    try {
      const docRef = doc(db, 'settings', 'companySettings');
      const unsub = onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            setCompanySettings(snapshot.data() as CompanySettings);
          } else {
            // Seed initial settings to Firestore
            setDoc(docRef, initialCompanySettings).catch((err) =>
              console.warn('Firestore settings seed error:', err)
            );
          }
        },
        (error) => {
          console.warn('Firestore settings listener error:', error);
          setIsFirebaseConnected(false);
        }
      );
      return () => unsub();
    } catch (e) {
      console.warn('Firebase connection unavailable, operating in local mode.');
    }
  }, []);

  // Sync Customers
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, 'customers'),
        (snapshot) => {
          const list: Customer[] = snapshot.docs.map((d) => {
            const data = d.data() as Customer;
            if (data.avatarUrl && data.avatarUrl.includes('unsplash')) {
              data.avatarUrl = BLACK_VECTOR_BORROWER;
            }
            if (data.selfieUrl && data.selfieUrl.includes('unsplash')) {
              data.selfieUrl = BLACK_VECTOR_BORROWER;
            }
            return data;
          });
          setCustomers(list);
          setActiveCustomer((prev) => {
            if (!prev) return list[0] || null;
            return list.find((c) => c.id === prev.id) || list[0] || null;
          });
        },
        (err) => console.warn('Customers snapshot error:', err)
      );
      return () => unsub();
    } catch (e) {}
  }, []);

  // Sync Staff
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, 'staff'),
        (snapshot) => {
          const list: StaffUser[] = snapshot.docs.map((d) => {
            const data = d.data() as StaffUser;
            if (data.avatarUrl && data.avatarUrl.includes('unsplash')) {
              data.avatarUrl = BLACK_VECTOR_BORROWER;
            }
            return data;
          });
          setStaffUsers(list);
        },
        (err) => console.warn('Staff snapshot error:', err)
      );
      return () => unsub();
    } catch (e) {}
  }, []);

  // Sync Loan Applications
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, 'loanApplications'),
        (snapshot) => {
          const list: LoanApplication[] = snapshot.docs.map((d) => {
            const data = d.data() as LoanApplication;
            if (data.clientPhotoUrl && data.clientPhotoUrl.includes('unsplash')) {
              data.clientPhotoUrl = BLACK_VECTOR_BORROWER;
            }
            return data;
          });
          setLoanApplications(list);
        },
        (err) => console.warn('Applications snapshot error:', err)
      );
      return () => unsub();
    } catch (e) {}
  }, []);

  // Sync Loans
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, 'loans'),
        (snapshot) => {
          const list: Loan[] = snapshot.docs.map((d) => d.data() as Loan);
          setLoans(list);
        },
        (err) => console.warn('Loans snapshot error:', err)
      );
      return () => unsub();
    } catch (e) {}
  }, []);

  // Sync Repayments
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, 'repayments'),
        (snapshot) => {
          const list: RepaymentRecord[] = snapshot.docs.map((d) => d.data() as RepaymentRecord);
          setRepayments(list);
        },
        (err) => console.warn('Repayments snapshot error:', err)
      );
      return () => unsub();
    } catch (e) {}
  }, []);

  // Sync Notifications
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, 'notifications'),
        (snapshot) => {
          const list: SystemNotification[] = snapshot.docs.map((d) => d.data() as SystemNotification);
          setNotifications(list);
        },
        (err) => console.warn('Notifications snapshot error:', err)
      );
      return () => unsub();
    } catch (e) {}
  }, []);

  // Sync Audit Logs
  useEffect(() => {
    try {
      const unsub = onSnapshot(
        collection(db, 'auditLogs'),
        (snapshot) => {
          const list: AuditLog[] = snapshot.docs.map((d) => d.data() as AuditLog);
          setAuditLogs(list);
        },
        (err) => console.warn('Audit logs snapshot error:', err)
      );
      return () => unsub();
    } catch (e) {}
  }, []);

  // File Upload Helper using Firebase Storage with Base64 fallback
  const uploadFile = async (file: File, pathFolder = 'uploads'): Promise<string> => {
    try {
      const storageRef = ref(storage, `${pathFolder}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (err) {
      console.warn('Firebase Storage upload failed, falling back to FileReader Data URL:', err);
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve((e.target?.result as string) || '');
        reader.readAsDataURL(file);
      });
    }
  };

  // Role switching
  const setActiveStaffRole = (role: UserRole) => {
    const found = staffUsers.find((s) => s.role === role) || staffUsers[0];
    setActiveStaff(found);
  };

  // Update Settings
  const updateCompanySettings = (partial: Partial<CompanySettings>) => {
    const updated = { ...companySettings, ...partial };
    setCompanySettings(updated);
    setDoc(doc(db, 'settings', 'companySettings'), updated).catch((e) =>
      console.warn('Firestore update error:', e)
    );
    addAuditLog('UPDATE_SETTINGS', 'Admin Settings', 'Updated company parameters/branding.');
  };

  // Customer Management
  const registerCustomer = (data: Omit<Customer, 'id' | 'registeredAt' | 'kycStatus' | 'accountStatus'>): Customer => {
    const newCust: Customer = {
      ...data,
      id: `cust_${Date.now()}`,
      registeredAt: new Date().toISOString().split('T')[0],
      kycStatus: 'Pending',
      accountStatus: 'Active',
    };
    setCustomers((prev) => [newCust, ...prev]);
    setActiveCustomer(newCust);
    setDoc(doc(db, 'customers', newCust.id), newCust).catch((e) => console.warn(e));

    addAuditLog('REGISTER_CUSTOMER', newCust.fullName, `Customer registered: ${newCust.email}`);
    addNotification({
      recipientId: 'all_staff',
      title: 'New Customer Registration',
      message: `${newCust.fullName} completed registration. KYC documents pending approval.`,
      channel: 'Push',
      type: 'system',
    });
    return newCust;
  };

  const updateCustomerKYC = (customerId: string, kycStatus: Customer['kycStatus'], docs?: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const updated = { ...c, ...docs, kycStatus, verifiedAt: kycStatus === 'Verified' ? new Date().toISOString().split('T')[0] : c.verifiedAt };
          if (activeCustomer && activeCustomer.id === customerId) setActiveCustomer(updated);
          setDoc(doc(db, 'customers', customerId), updated).catch((e) => console.warn(e));
          return updated;
        }
        return c;
      })
    );
    addAuditLog('UPDATE_KYC', customerId, `Updated KYC status to ${kycStatus}`);
  };

  const updateCustomerStatus = (customerId: string, status: Customer['accountStatus'], notes?: string) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const updated = { ...c, accountStatus: status, notes: notes || c.notes };
          setDoc(doc(db, 'customers', customerId), updated).catch((e) => console.warn(e));
          return updated;
        }
        return c;
      })
    );
    addAuditLog('UPDATE_CUSTOMER_STATUS', customerId, `Set account status to ${status}. Notes: ${notes || 'None'}`);
  };

  const updateCustomerDetails = (customerId: string, updatedData: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const updated = { ...c, ...updatedData };
          if (activeCustomer && activeCustomer.id === customerId) {
            setActiveCustomer(updated);
          }
          setDoc(doc(db, 'customers', customerId), updated).catch((e) => console.warn(e));
          return updated;
        }
        return c;
      })
    );
    addAuditLog('UPDATE_CUSTOMER_DETAILS', customerId, `Updated details for customer ${updatedData.fullName || customerId}`);
  };

  const deleteCustomer = (customerId: string) => {
    const custToDelete = customers.find((c) => c.id === customerId);
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
    
    if (activeCustomer && activeCustomer.id === customerId) {
      const remaining = customers.filter((c) => c.id !== customerId);
      setActiveCustomer(remaining[0] || null);
    }

    // Delete from Firestore
    deleteDoc(doc(db, 'customers', customerId)).catch((e) => console.warn('Firestore delete customer error:', e));
    addAuditLog('DELETE_CUSTOMER', customerId, `Deleted customer record: ${custToDelete?.fullName || customerId}`);
  };

  // Loan Application Actions
  const submitLoanApplication = (appData: Omit<LoanApplication, 'id' | 'status' | 'submittedAt'>): LoanApplication => {
    const newApp: LoanApplication = {
      ...appData,
      id: `APP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      status: 'Pending',
      submittedAt: new Date().toISOString().split('T')[0],
      riskScore: 78,
      riskLevel: 'Low',
    };

    setLoanApplications((prev) => [newApp, ...prev]);
    setDoc(doc(db, 'loanApplications', newApp.id), newApp).catch((e) => console.warn(e));

    addAuditLog('SUBMIT_APPLICATION', newApp.id, `Loan application submitted for MWK ${newApp.amount}`);

    // Notification to Staff
    addNotification({
      recipientId: 'all_staff',
      title: 'New Loan Application',
      message: `${newApp.customerName} applied for MWK ${newApp.amount.toLocaleString()} loan. Collateral: ${newApp.collateralName}.`,
      channel: 'Push',
      type: 'application',
    });

    // SMS to Customer
    const smsMsg = companySettings.messagingTemplates.applicationReceived
      .replace('{loanId}', newApp.id)
      .replace('${amount}', newApp.amount.toString());
    
    addNotification({
      recipientId: newApp.customerId,
      title: 'Application Received',
      message: smsMsg,
      channel: 'SMS',
      type: 'application',
    });

    return newApp;
  };

  const approveLoanApplication = (applicationId: string) => {
    setLoanApplications((prev) =>
      prev.map((app) => {
        if (app.id === applicationId) {
          const approved: LoanApplication = {
            ...app,
            status: 'Approved' as LoanApplicationStatus,
            approvedAt: new Date().toISOString().split('T')[0],
            approvedBy: activeStaff.name,
          };
          setDoc(doc(db, 'loanApplications', applicationId), approved).catch((e) => console.warn(e));

          const msg = companySettings.messagingTemplates.loanApproved
            .replace('{customerName}', app.customerName)
            .replace('{loanId}', app.id)
            .replace('${amount}', app.amount.toString());

          addNotification({
            recipientId: app.customerId,
            title: 'Loan Approved',
            message: msg,
            channel: 'SMS',
            type: 'approval',
          });

          return approved;
        }
        return app;
      })
    );
    addAuditLog('APPROVE_APPLICATION', applicationId, `Approved by ${activeStaff.name} (${activeStaff.role})`);
  };

  const rejectLoanApplication = (applicationId: string, reason: string) => {
    setLoanApplications((prev) =>
      prev.map((app) => {
        if (app.id === applicationId) {
          const rejected: LoanApplication = {
            ...app,
            status: 'Rejected' as LoanApplicationStatus,
            rejectedReason: reason,
          };
          setDoc(doc(db, 'loanApplications', applicationId), rejected).catch((e) => console.warn(e));

          const msg = companySettings.messagingTemplates.loanRejected
            .replace('{loanId}', app.id)
            .replace('{reason}', reason);

          addNotification({
            recipientId: app.customerId,
            title: 'Loan Application Status',
            message: msg,
            channel: 'SMS',
            type: 'approval',
          });

          return rejected;
        }
        return app;
      })
    );
    addAuditLog('REJECT_APPLICATION', applicationId, `Rejected. Reason: ${reason}`);
  };

  const disburseLoan = (applicationId: string) => {
    const app = loanApplications.find((a) => a.id === applicationId);
    if (!app) return;

    // Calculate full loan schedule
    const calc = calculateLoan(
      app.amount,
      app.periodValue,
      app.periodUnit,
      app.interestRate,
      app.interestType,
      new Date().toISOString().split('T')[0]
    );

    const startDateStr = new Date().toISOString().split('T')[0];
    const dueDateObj = new Date();
    if (app.periodUnit === 'Months') dueDateObj.setMonth(dueDateObj.getMonth() + app.periodValue);
    else if (app.periodUnit === 'Weeks') dueDateObj.setDate(dueDateObj.getDate() + app.periodValue * 7);
    else dueDateObj.setDate(dueDateObj.getDate() + app.periodValue);

    const newLoan: Loan = {
      id: `LN-${Math.floor(8000 + Math.random() * 1000)}`,
      applicationId: app.id,
      customerId: app.customerId,
      customerName: app.customerName,
      principal: app.amount,
      balance: calc.totalPayable,
      totalPaid: 0,
      totalInterest: calc.totalInterest,
      totalPayable: calc.totalPayable,
      interestType: app.interestType,
      interestRate: app.interestRate,
      penaltyType: companySettings.defaultPenaltyType,
      penaltyValue: companySettings.defaultPenaltyValue,
      status: 'Active',
      startDate: startDateStr,
      dueDate: dueDateObj.toISOString().split('T')[0],
      nextPaymentDate: calc.schedule[0]?.dueDate || startDateStr,
      schedule: calc.schedule,
      penaltiesAccrued: 0,
      daysOverdue: 0,
      signatureUrl: app.signatureUrl,
      clientPhotoUrl: app.clientPhotoUrl,
      collateralName: app.collateralName,
      collateralPhotoUrl: app.collateralPhotoUrl,
    };

    setLoans((prev) => [newLoan, ...prev]);
    setDoc(doc(db, 'loans', newLoan.id), newLoan).catch((e) => console.warn(e));

    // Update application status in Firestore
    const updatedApp = { ...app, status: 'Disbursed' as LoanApplicationStatus, disbursedAt: startDateStr };
    setDoc(doc(db, 'loanApplications', applicationId), updatedApp).catch((e) => console.warn(e));

    addAuditLog('DISBURSE_LOAN', newLoan.id, `Disbursed MWK ${app.amount} to ${app.customerName}`);

    // Notification
    const msg = companySettings.messagingTemplates.loanDisbursed
      .replace('{loanId}', newLoan.id)
      .replace('${amount}', app.amount.toString());

    addNotification({
      recipientId: app.customerId,
      title: 'Loan Disbursed',
      message: msg,
      channel: 'SMS',
      type: 'approval',
    });
  };

  // Record Repayment
  const recordRepayment = (repaymentData: Omit<RepaymentRecord, 'id' | 'date'>): RepaymentRecord => {
    const newRecord: RepaymentRecord = {
      ...repaymentData,
      id: `REC-${Math.floor(9000 + Math.random() * 1000)}`,
      date: new Date().toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    };

    setRepayments((prev) => [newRecord, ...prev]);
    setDoc(doc(db, 'repayments', newRecord.id), newRecord).catch((e) => console.warn(e));

    // Update loan balance & schedule in Firestore
    setLoans((prev) =>
      prev.map((loan) => {
        if (loan.id === repaymentData.loanId) {
          let paidRemaining = repaymentData.amount;
          const newTotalPaid = loan.totalPaid + repaymentData.amount;
          const newBalance = Math.max(0, loan.balance - repaymentData.amount);

          const updatedSchedule = loan.schedule.map((item) => {
            if (paidRemaining <= 0 || item.status === 'Paid') return item;

            const neededToClear = item.totalDue - item.paidAmount;
            if (paidRemaining >= neededToClear) {
              paidRemaining -= neededToClear;
              return {
                ...item,
                paidAmount: item.totalDue,
                status: 'Paid' as const,
                paidDate: new Date().toISOString().split('T')[0],
              };
            } else {
              const newPaid = item.paidAmount + paidRemaining;
              paidRemaining = 0;
              return {
                ...item,
                paidAmount: newPaid,
                status: 'Partial' as const,
                paidDate: new Date().toISOString().split('T')[0],
              };
            }
          });

          const nextPending = updatedSchedule.find((s) => s.status !== 'Paid');
          const isFullyPaid = newBalance <= 0;

          const updatedLoan: Loan = {
            ...loan,
            balance: newBalance,
            totalPaid: newTotalPaid,
            status: isFullyPaid ? ('Paid Off' as const) : loan.status,
            nextPaymentDate: nextPending ? nextPending.dueDate : loan.dueDate,
            schedule: updatedSchedule,
          };

          setDoc(doc(db, 'loans', loan.id), updatedLoan).catch((e) => console.warn(e));
          return updatedLoan;
        }
        return loan;
      })
    );

    addAuditLog('RECORD_REPAYMENT', repaymentData.loanId, `Recorded payment of MWK ${repaymentData.amount} via ${repaymentData.paymentMethod}`);

    // Notification
    const loanRef = loans.find((l) => l.id === repaymentData.loanId);
    const remBalance = loanRef ? Math.max(0, loanRef.balance - repaymentData.amount) : 0;

    const msg = companySettings.messagingTemplates.repaymentReceived
      .replace('{loanId}', repaymentData.loanId)
      .replace('${paidAmount}', repaymentData.amount.toString())
      .replace('${balance}', remBalance.toFixed(2));

    addNotification({
      recipientId: repaymentData.customerId,
      title: 'Payment Receipt',
      message: msg,
      channel: 'SMS',
      type: 'repayment',
    });

    return newRecord;
  };

  const addNotification = (notif: Omit<SystemNotification, 'id' | 'date' | 'read'>) => {
    const newN: SystemNotification = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      date: new Date().toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    setNotifications((prev) => [newN, ...prev]);
    setDoc(doc(db, 'notifications', newN.id), newN).catch((e) => console.warn(e));
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const updated = { ...n, read: true };
          setDoc(doc(db, 'notifications', id), updated).catch((e) => console.warn(e));
          return updated;
        }
        return n;
      })
    );
  };

  const addAuditLog = (action: string, target: string, details: string) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      actorName: activeStaff ? activeStaff.name : 'System',
      actorRole: activeStaff ? activeStaff.role : 'Super Admin',
      action,
      target,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
    setDoc(doc(db, 'auditLogs', newLog.id), newLog).catch((e) => console.warn(e));
  };

  const resetSystemData = async () => {
    setCompanySettings(initialCompanySettings);
    setCustomers(initialCustomers);
    setActiveCustomer(null);
    setStaffUsers(initialStaffUsers);
    setLoanApplications(initialLoanApplications);
    setLoans(initialLoans);
    setRepayments(initialRepayments);
    setNotifications(initialNotifications);
    setAuditLogs(initialAuditLogs);

    try {
      // Overwrite Firestore collections and clean extra docs
      const collectionsToReset = ['customers', 'loanApplications', 'loans', 'repayments', 'notifications', 'auditLogs', 'staff'];
      for (const colName of collectionsToReset) {
        const snap = await getDocs(collection(db, colName));
        for (const d of snap.docs) {
          await deleteDoc(doc(db, colName, d.id));
        }
      }

      await setDoc(doc(db, 'settings', 'companySettings'), initialCompanySettings);
      for (const c of initialCustomers) await setDoc(doc(db, 'customers', c.id), c);
      for (const s of initialStaffUsers) await setDoc(doc(db, 'staff', s.id), s);
      for (const a of initialLoanApplications) await setDoc(doc(db, 'loanApplications', a.id), a);
      for (const l of initialLoans) await setDoc(doc(db, 'loans', l.id), l);
      for (const r of initialRepayments) await setDoc(doc(db, 'repayments', r.id), r);
      for (const n of initialNotifications) await setDoc(doc(db, 'notifications', n.id), n);
      for (const al of initialAuditLogs) await setDoc(doc(db, 'auditLogs', al.id), al);
    } catch (e) {
      console.warn('Reset Firestore error:', e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentPath,
        navigatePath,
        viewMode,
        setViewMode,
        adminMode,
        setAdminMode,
        currentUser,
        showAuthModal,
        setShowAuthModal,
        authModalTab,
        authModalType,
        openAuthModal,
        loginWithUsernameAndPassword,
        signupCustomer,
        signupStaff,
        logout,
        activeCustomer,
        setActiveCustomer,
        activeStaff,
        setActiveStaffRole,
        firebaseUser,
        isFirebaseConnected,
        companySettings,
        updateCompanySettings,
        customers,
        loanApplications,
        loans,
        repayments,
        notifications,
        auditLogs,
        staffUsers,
        registerCustomer,
        updateCustomerKYC,
        updateCustomerStatus,
        updateCustomerDetails,
        deleteCustomer,
        submitLoanApplication,
        approveLoanApplication,
        rejectLoanApplication,
        disburseLoan,
        recordRepayment,
        addNotification,
        markNotificationRead,
        addAuditLog,
        uploadFile,
        resetSystemData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
