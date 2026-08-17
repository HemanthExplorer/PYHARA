import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

const CART_STORAGE_KEY = 'pyhara_cart_v1';

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error('Failed to parse cart from localStorage:', err);
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Sync cart state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (err) {
      console.error('Failed to save cart to localStorage:', err);
    }
  }, [cartItems]);

  const showToast = (msg) => {
    setToastMessage(msg);
  };

  const hideToast = () => {
    setToastMessage(null);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);

  const openProductDetail = (product) => setSelectedProductDetail(product);
  const closeProductDetail = () => setSelectedProductDetail(null);

  const addToCart = (product, quantityToAdd = 1) => {
    if (!product) return;

    const isComingSoon = product.availability === 'Coming Soon';
    const isOutOfStock = !isComingSoon && (product.stock_quantity === 0 || product.availability === 'Out of Stock');

    if (isComingSoon) {
      showToast(`"${product.name}" is coming soon to PYHARA.`);
      return;
    }

    if (isOutOfStock) {
      showToast(`"${product.name}" is currently out of stock.`);
      return;
    }

    const availableStock = product.stock_quantity !== undefined ? product.stock_quantity : 999;

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.product.id === product.id);

      if (existingIndex > -1) {
        const currentQty = prevItems[existingIndex].quantity;
        const desiredQty = currentQty + quantityToAdd;

        if (desiredQty > availableStock) {
          showToast(`Only ${availableStock} items available.`);
          const updated = [...prevItems];
          updated[existingIndex].quantity = availableStock;
          return updated;
        } else {
          showToast(`"${product.name}" quantity updated in cart.`);
          const updated = [...prevItems];
          updated[existingIndex].quantity = desiredQty;
          return updated;
        }
      } else {
        if (quantityToAdd > availableStock) {
          showToast(`Only ${availableStock} items available.`);
          return [...prevItems, { product, quantity: availableStock }];
        } else {
          showToast(`"${product.name}" added to your cart.`);
          return [...prevItems, { product, quantity: quantityToAdd }];
        }
      }
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Item removed from cart.');
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const availableStock = item.product.stock_quantity !== undefined ? item.product.stock_quantity : 999;
          if (newQuantity > availableStock) {
            showToast(`Only ${availableStock} items available.`);
            return { ...item, quantity: availableStock };
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        isSearchOpen,
        selectedProductDetail,
        toastMessage,
        openCart,
        closeCart,
        openSearch,
        closeSearch,
        openProductDetail,
        closeProductDetail,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        showToast,
        hideToast,
        totalCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
