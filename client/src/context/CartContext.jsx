import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])

  const addToCart = (item) => {
    setCart(prev => {
      const itemId = item._id || item.id
      const existing = prev.find(i => (i._id || i.id) === itemId)
      if (existing) {
        return prev.map(i => {
          const currentId = i._id || i.id
          if (currentId === itemId) {
            const newQty = (i.qty || i.quantity || 1) + 1
            return { ...i, qty: newQty, quantity: newQty }
          }
          return i
        })
      }
      const initialQty = item.qty || item.quantity || 1
      const normalizedItem = {
        ...item,
        id: itemId,
        _id: itemId,
        qty: initialQty,
        quantity: initialQty
      }
      return [...prev, normalizedItem]
    })
  }

  const updateQty = (itemId, delta) => {
    setCart(prev => prev.map(i => {
      const currentId = i._id || i.id
      if (currentId === itemId) {
        const newQty = Math.max(0, (i.qty || i.quantity || 1) + delta)
        return { ...i, qty: newQty, quantity: newQty }
      }
      return i
    }).filter(i => (i.qty || i.quantity) > 0))
  }

  const removeItem = (itemId) => {
    setCart(prev => prev.filter(i => (i._id || i.id) !== itemId))
  }

  const clearCart = () => setCart([])

  const cartCount = cart.reduce((s, i) => s + (i.qty || i.quantity || 1), 0)
  const cartTotal = cart.reduce((s, i) => s + i.price * (i.qty || i.quantity || 1), 0)

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQty, removeItem, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
