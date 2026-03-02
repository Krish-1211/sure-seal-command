import React, { createContext, useContext, useState, ReactNode } from "react";
import { Product, ProductVariant } from "@/lib/products";

interface CartItem {
    product: Product;
    variant: ProductVariant;
    quantity: number;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product, variant: ProductVariant, quantity: number) => void;
    removeFromCart: (variantSku: string) => void;
    updateQuantity: (variantSku: string, delta: number) => void;
    clearCart: () => void;
    loadCart: (items: CartItem[]) => void;
    subtotal: number;
    totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>([]);

    const addToCart = (product: Product, variant: ProductVariant, quantity: number) => {
        if (quantity <= 0) return;
        setCart((prev) => {
            const existing = prev.find((item) => item.variant.sku === variant.sku);
            if (existing) {
                return prev.map((item) =>
                    item.variant.sku === variant.sku
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { product, variant, quantity }];
        });
    };

    const removeFromCart = (variantSku: string) => {
        setCart((prev) => prev.filter((item) => item.variant.sku !== variantSku));
    };

    const updateQuantity = (variantSku: string, delta: number) => {
        setCart((prev) =>
            prev.map((item) =>
                item.variant.sku === variantSku
                    ? { ...item, quantity: Math.max(0, item.quantity + delta) }
                    : item
            ).filter(item => item.quantity > 0)
        );
    };

    const clearCart = () => setCart([]);
    const loadCart = (items: CartItem[]) => setCart(items);

    const subtotal = cart.reduce((acc, item) => acc + item.variant.price * item.quantity, 0);
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                loadCart,
                subtotal,
                totalItems,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};
