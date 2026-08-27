'use client';

import React, { createContext, useContext } from 'react';
import type { ConfiguracionOrganizacion } from '@/types/configuracion';
import { DEFAULT_TIME_ZONE } from '@/lib/dates';

type OrganizacionContextValue = {
  configuracion: ConfiguracionOrganizacion | null;
  zonaHoraria: string;
};

const OrganizacionContext = createContext<OrganizacionContextValue>({
  configuracion: null,
  zonaHoraria: DEFAULT_TIME_ZONE,
});

export function OrganizacionProvider({
  configuracion,
  children,
}: {
  configuracion: ConfiguracionOrganizacion | null;
  children: React.ReactNode;
}) {
  const zonaHoraria = configuracion?.zonaHoraria ?? DEFAULT_TIME_ZONE;

  return (
    <OrganizacionContext.Provider value={{ configuracion, zonaHoraria }}>
      {children}
    </OrganizacionContext.Provider>
  );
}

export function useOrganizacion() {
  return useContext(OrganizacionContext);
}

export default OrganizacionProvider;
