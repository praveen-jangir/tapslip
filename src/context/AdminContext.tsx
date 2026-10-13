import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type {
  AdminData,
  Employee,
  ExtraCharge,
  MenuItem,
  Offer,
  RestaurantSettings,
} from '../services/adminRepo';
import { adminRepo } from '../services/adminRepo';

/** Customer-facing view of the restaurant. Owner edits live in the Owner Web Admin. */
export interface AdminContextValue {
  settings: RestaurantSettings;
  menu: MenuItem[];
  offers: Offer[];
  extraCharges: ExtraCharge[];
  employees: Employee[];
  visibleMenu: MenuItem[];
  getMenuItem: (id: string) => MenuItem | undefined;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AdminData>(() => adminRepo.currentData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const repo = adminRepo;
    void repo.init().finally(() => setLoading(false));
    const unsubscribe = repo.subscribe(() => setData(repo.currentData));
    return unsubscribe;
  }, []);

  const settings = data.settings;
  const menu = data.menu;
  const offers = data.offers;
  const extraCharges = data.extraCharges;
  const employees = data.employees;

  const visibleMenu = useMemo(() => menu.filter((item) => item.available), [menu]);

  const getMenuItem = useCallback(
    (id: string) => menu.find((item) => item.id === id),
    [menu]
  );

  const value = useMemo<AdminContextValue>(
    () => ({
      settings,
      menu,
      offers,
      extraCharges,
      employees,
      visibleMenu,
      getMenuItem,
    }),
    [settings, menu, offers, extraCharges, employees, visibleMenu, getMenuItem]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within an AdminProvider');
  return ctx;
}

export function useBillingConfig() {
  const { settings, offers, extraCharges } = useAdmin();
  return useMemo(
    () => ({ gstPercent: settings.gstPercent, offers, extraCharges }),
    [settings.gstPercent, offers, extraCharges]
  );
}
