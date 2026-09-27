import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    theme: 'dark',
    notifications: true,
    fontSize: 'medium',
    language: 'English',
    voiceSpeed: 'Normal', // Slow / Normal
    medicineReminders: true,
    voiceReminders: true,
    reminderRepeatTime: 5, // 5 / 10 min
    dailySummary: true,
    emergencyContact: '',
    caregiverName: 'Not Linked',
    age: ''
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);


  // Load user and settings from localStorage on init
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
        localStorage.removeItem('user');
        setUser(null);
      }
    }

    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error("Failed to parse settings from localStorage:", error);
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateProfile = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const updateSettings = (newSettings) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('settings', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      login, 
      logout, 
      updateProfile, 
      settings, 
      updateSettings, 
      loading,
      sidebarCollapsed,
      setSidebarCollapsed
    }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
