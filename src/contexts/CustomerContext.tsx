import React, { createContext, useContext, useState, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./AuthContext";

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
    const { user } = useAuth(); // Read user from AuthContext
    const [selectedCustomerState, setSelectedCustomerState] = useState<any | null>(null);
    const [selectedPricingLevelIdState, setSelectedPricingLevelIdState] = useState<string>("retail");

    const { data: pricingLevels = [] } = useQuery({
        queryKey: ['pricing-levels'],
        queryFn: async () => {
            const res = await fetch('/api/pricing-levels');
            if (!res.ok) throw new Error("Failed");
            return res.json();
        }
    });

    // If user is a customer, lock their selected context to themselves
    const isCustomerPortal = user?.role === "customer";

    const selectedCustomer = isCustomerPortal ? {
        id: user.customerId,
        name: user.name,
        address: user.address,
        phone: user.phone,
        email: user.email,
        pricingLevelId: user.pricingLevelId
    } : selectedCustomerState;

    const selectedPricingLevelId = isCustomerPortal ? (user.pricingLevelId || "retail") : selectedPricingLevelIdState;

    const setSelectedCustomer = (customer: any | null) => {
        if (!isCustomerPortal) setSelectedCustomerState(customer);
    };

    const setSelectedPricingLevelId = (id: string) => {
        if (!isCustomerPortal) setSelectedPricingLevelIdState(id);
    };

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
