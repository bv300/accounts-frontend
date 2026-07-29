/**
 * Company context — tracks the currently selected company.
 */
import { createContext, useContext, useState } from 'react';

const CompanyContext = createContext(null);

export function CompanyProvider({ children }) {
    const [companyId, setCompanyId] = useState(localStorage.getItem('companyId') || null);

    const selectCompany = (id) => {
        localStorage.setItem('companyId', id);
        setCompanyId(id);
    };

    return (
        <CompanyContext.Provider value={{ companyId, selectCompany }}>
            {children}
        </CompanyContext.Provider>
    );
}

export const useCompany = () => useContext(CompanyContext);
