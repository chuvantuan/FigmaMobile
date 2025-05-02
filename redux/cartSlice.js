import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
  },
  reducers: {
    setCart: (state, action) => {
      state.items = action.payload;
    },
    addToCart: (state, action) => {
      const { userId, productId, quantity } = action.payload;
      const existingItem = state.items.find(
        (item) => item.userId === userId && item.productId === productId
      );
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({ userId, productId, quantity });
      }
    },
    updateCartItem: (state, action) => {
      const { userId, productId, quantity } = action.payload;
      const item = state.items.find(
        (item) => item.userId === userId && item.productId === productId
      );
      if (item) {
        item.quantity = quantity;
      }
    },
    removeFromCart: (state, action) => {
      const { userId, productId } = action.payload;
      state.items = state.items.filter(
        (item) => !(item.userId === userId && item.productId === productId)
      );
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { setCart, addToCart, updateCartItem, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;