import React, { createContext, useContext, useState, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

interface CustomerContextType {
    selectedCustomer: any | null;
    setSelectedCustomer: (customer: any | null) => void;
    pricingLevels: any[];
    selectedPricingLevelId: string;
    setSelectedPricingLevelId: (id: string) => void;
    getAdjustedPrice: (sku: string, basePrice: number) => number;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export const CustomerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
    const [selectedPricingLevelId, setSelectedPricingLevelId] = useState<string>("retail");

    const { data: pricingLevels = [] } = useQuery({
        queryKey: ['pricing-levels'],
        queryFn: async () => {
            const res = await fetch('/api/pricing-levels');
            if (!res.ok) throw new Error("Failed");
            return res.json();
        }
    });

    // Helper: look up price for a given SKU using the current pricing level
    const getAdjustedPrice = (sku: string, basePrice: number): number => {
        if (selectedPricingLevelId === "retail") return basePrice;
        const level = pricingLevels.find((l: any) => l.id === selectedPricingLevelId);
        if (!level || !level.prices || !level.prices[sku]) return basePrice;
        return level.prices[sku];
    };

    return (
        <CustomerContext.Provider value={{
            selectedCustomer,
            setSelectedCustomer,
            pricingLevels,
            selectedPricingLevelId,
            setSelectedPricingLevelId,
            getAdjustedPrice,
        }}>
            {children}
        </CustomerContext.Provider>
    );
};

export const useCustomer = () => {
    const context = useContext(CustomerContext);
    if (context === undefined) {
        throw new Error("useCustomer must be used within a CustomerProvider");
    }
    return context;
};
