'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const cartActions = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART'
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case cartActions.ADD_ITEM:
      const existingItemIndex = state.items.findIndex(item => 
        item.id === action.payload.id && 
        item.selectedSize === action.payload.selectedSize
      );

      if (existingItemIndex !== -1) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += 1;
        return {
          ...state,
          items: updatedItems
        };
      } else {
        return {
          ...state,
          items: [...state.items, action.payload]
        };
      }

    case cartActions.REMOVE_ITEM:
      return {
        ...state,
        items: state.items.filter(item => item.cartId !== action.payload)
      };

    case cartActions.UPDATE_QUANTITY:
      return {
        ...state,
        items: state.items.map(item =>
          item.cartId === action.payload.cartId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ).filter(item => item.quantity > 0)
      };

    case cartActions.CLEAR_CART:
      return {
        items: []
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  useEffect(() => {
    const savedCart = localStorage.getItem('penroseCart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      parsedCart.items.forEach(item => {
        dispatch({ type: cartActions.ADD_ITEM, payload: item });
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('penroseCart', JSON.stringify(state));
  }, [state]);

  const addToCart = (product, selectedSize, quantity = 1) => {
    const cartItem = {
      id: product.id,
      cartId: `${product.id}_${selectedSize}_${Date.now()}`,
      name: product.name,
      price: selectedSize ? selectedSize.price : product.price,
      selectedSize: selectedSize ? selectedSize.size : null,
      quantity: quantity,
      images: product.images,
      mainImage: product.mainImage
    };
    
    dispatch({ type: cartActions.ADD_ITEM, payload: cartItem });
  };

  const removeFromCart = (cartId) => {
    dispatch({ type: cartActions.REMOVE_ITEM, payload: cartId });
  };

  const updateQuantity = (cartId, quantity) => {
    dispatch({ 
      type: cartActions.UPDATE_QUANTITY, 
      payload: { cartId, quantity } 
    });
  };

  const clearCart = () => {
    dispatch({ type: cartActions.CLEAR_CART });
  };

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getItemCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    items: state.items,
    cartItems: state.items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getItemCount,
    itemCount: getItemCount(),
    total: getTotalPrice()
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
};

export default CartContext;