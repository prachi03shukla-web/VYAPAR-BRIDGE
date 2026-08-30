// B2B Marketplace Cart & Inquiry Management Utility

export interface CartItem {
  id: string;
  postId: string;
  title: string;
  mediaUrl?: string;
  mediaType: 'image' | 'pdf';
  authorId?: string;
  authorName?: string;
  authorRole?: string;
  authorAvatar?: string;
  minRate?: number | string;
  maxRate?: number | string;
  unit?: string;
  quantity?: number;
  addedAt: string;
}

const CART_STORAGE_KEY = 'vyapar_b2b_cart_items_v1';

export function getCartItems(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Error reading B2B cart items:', err);
    return [];
  }
}

export function isItemInCart(postId: string | number): boolean {
  if (!postId) return false;
  const items = getCartItems();
  return items.some(item => String(item.postId) === String(postId));
}

export function addToCart(post: any, extraOptions?: { minRate?: number | string; maxRate?: number | string; quantity?: number; unit?: string }): { success: boolean; cartCount: number; item: CartItem } {
  const currentItems = getCartItems();
  const postId = String(post?.id || Date.now());
  
  const existingIdx = currentItems.findIndex(i => String(i.postId) === postId);
  
  const authorName = post?.user?.name || post?.userName || post?.authorName || 'Verified Member';
  const authorRole = post?.user?.role || post?.role || 'Dealer';
  const authorAvatar = post?.user?.avatarUrl || post?.userAvatar || post?.authorAvatar || '';
  const mediaUrl = post?.mediaUrl || post?.image || post?.imageUrl || post?.filePreview || '';
  const mediaType: 'image' | 'pdf' = (post?.type === 'pdf' || (mediaUrl && mediaUrl.match(/\.pdf(\?.*)?$/i))) ? 'pdf' : 'image';
  const title = post?.title || post?.content || post?.description || (mediaType === 'pdf' ? 'Product Catalogue' : 'B2B Catalog Item');

  const cartItem: CartItem = {
    id: `cart_${postId}`,
    postId,
    title: title.length > 80 ? title.substring(0, 77) + '...' : title,
    mediaUrl,
    mediaType,
    authorId: String(post?.userId || post?.user?.id || ''),
    authorName,
    authorRole,
    authorAvatar,
    minRate: extraOptions?.minRate ?? post?.minRate ?? '',
    maxRate: extraOptions?.maxRate ?? post?.maxRate ?? '',
    unit: extraOptions?.unit ?? post?.unit ?? 'Box / Sq.Ft',
    quantity: extraOptions?.quantity ?? 1,
    addedAt: new Date().toISOString()
  };

  if (existingIdx >= 0) {
    currentItems[existingIdx] = {
      ...currentItems[existingIdx],
      ...cartItem,
      quantity: (currentItems[existingIdx].quantity || 1) + 1
    };
  } else {
    currentItems.unshift(cartItem);
  }

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(currentItems));
  } catch (err) {
    console.error('Failed to persist cart items to localStorage:', err);
  }

  // Notify the app in real time
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cart_updated', { 
      detail: { 
        items: currentItems, 
        count: currentItems.length,
        lastAdded: cartItem 
      } 
    }));
  }

  return { success: true, cartCount: currentItems.length, item: cartItem };
}

export function removeFromCart(postId: string | number): CartItem[] {
  const currentItems = getCartItems();
  const filtered = currentItems.filter(item => String(item.postId) !== String(postId));
  
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cart_updated', { 
      detail: { 
        items: filtered, 
        count: filtered.length 
      } 
    }));
  }

  return filtered;
}

export function clearCart(): void {
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch (err) {}

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cart_updated', { 
      detail: { 
        items: [], 
        count: 0 
      } 
    }));
  }
}
