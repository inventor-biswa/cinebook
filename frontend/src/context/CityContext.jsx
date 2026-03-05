import { createContext, useContext, useState } from 'react';

// ─── CONTEXT DEFINITION ────────────────────────────────────────────────────────
// CityContext holds the currently selected city.
// When the user changes city in the Navbar dropdown, this updates globally,
// and pages like Home, AllMovies, MovieDetail re-fetch filtered content.
const CityContext = createContext(null);

// ─── PROVIDER ──────────────────────────────────────────────────────────────────
export function CityProvider({ children }) {
    // Default to city_id: 1 (Mumbai) until the user picks something
    const [selectedCity, setSelectedCity] = useState(() => {
        const saved = localStorage.getItem('selectedCity');
        return saved ? JSON.parse(saved) : { city_id: 1, name: 'Mumbai' };
    });

    const changeCity = (cityObj) => {
        setSelectedCity(cityObj);
        localStorage.setItem('selectedCity', JSON.stringify(cityObj));
    };

    return (
        <CityContext.Provider value={{ selectedCity, changeCity }}>
            {children}
        </CityContext.Provider>
    );
}

// ─── CUSTOM HOOK ───────────────────────────────────────────────────────────────
// Usage:  const { selectedCity, changeCity } = useCity();
export const useCity = () => useContext(CityContext);
