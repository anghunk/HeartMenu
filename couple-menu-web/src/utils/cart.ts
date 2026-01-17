/**
 * 本地购物车管理工具
 * 使用 localStorage 存储购物车数据
 */

export interface CartItem {
  menu_id: number
  name: string
  desc?: string
  image?: string
  qty: number
}

const CART_KEY = 'couple_menu_cart'

/**
 * 获取购物车数据
 */
export function getCart(): CartItem[] {
  try {
    const data = localStorage.getItem(CART_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

/**
 * 保存购物车数据
 */
export function saveCart(cart: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
}

/**
 * 添加菜品到购物车
 */
export function addToCart(item: Omit<CartItem, 'qty'>, qty: number = 1): CartItem[] {
  const cart = getCart()
  const existingIndex = cart.findIndex(c => c.menu_id === item.menu_id)

  if (existingIndex >= 0) {
    // 已存在，增加数量
    cart[existingIndex].qty += qty
  } else {
    // 新增
    cart.push({
      ...item,
      qty,
    })
  }

  saveCart(cart)
  return cart
}

/**
 * 从购物车移除菜品
 */
export function removeFromCart(menuId: number): CartItem[] {
  const cart = getCart().filter(item => item.menu_id !== menuId)
  saveCart(cart)
  return cart
}

/**
 * 更新菜品数量
 */
export function updateCartItemQty(menuId: number, qty: number): CartItem[] {
  const cart = getCart()
  const index = cart.findIndex(item => item.menu_id === menuId)

  if (index >= 0) {
    if (qty <= 0) {
      // 数量小于等于0，移除
      cart.splice(index, 1)
    } else {
      cart[index].qty = qty
    }
  }

  saveCart(cart)
  return cart
}

/**
 * 增加菜品数量
 */
export function increaseCartItemQty(menuId: number): CartItem[] {
  const cart = getCart()
  const item = cart.find(c => c.menu_id === menuId)
  if (item) {
    item.qty += 1
  }
  saveCart(cart)
  return cart
}

/**
 * 减少菜品数量
 */
export function decreaseCartItemQty(menuId: number): CartItem[] {
  const cart = getCart()
  const index = cart.findIndex(c => c.menu_id === menuId)
  if (index >= 0) {
    if (cart[index].qty <= 1) {
      cart.splice(index, 1)
    } else {
      cart[index].qty -= 1
    }
  }
  saveCart(cart)
  return cart
}

/**
 * 清空购物车
 */
export function clearCart(): void {
  localStorage.removeItem(CART_KEY)
}

/**
 * 获取购物车商品总数
 */
export function getCartCount(): number {
  return getCart().reduce((sum, item) => sum + item.qty, 0)
}

/**
 * 获取购物车商品种类数
 */
export function getCartItemCount(): number {
  return getCart().length
}
