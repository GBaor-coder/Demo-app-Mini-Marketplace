import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { DEMO_USERS, INITIAL_ORDERS, INITIAL_PRODUCTS } from '@/src/data/seed';
import {
  CartLine,
  DeliveryMethod,
  LocationPoint,
  Order,
  OrderStatus,
  Product,
  ProductInput,
  User,
} from '@/src/types';

const STORAGE_KEY = '@uniloop/demo-state-v1';

type PersistedState = {
  currentUserId: string | null;
  products: Product[];
  cart: CartLine[];
  orders: Order[];
  favoriteIds: string[];
};

type StoreContextValue = {
  hydrated: boolean;
  currentUser: User | null;
  products: Product[];
  cart: CartLine[];
  orders: Order[];
  favoriteIds: string[];
  login: (email: string, password: string) => boolean;
  logout: () => void;
  getUserById: (id: string) => User | undefined;
  addToCart: (productId: string) => boolean;
  changeCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  toggleFavorite: (productId: string) => void;
  addProduct: (input: ProductInput) => Product | null;
  updateProduct: (id: string, input: ProductInput) => boolean;
  deleteProduct: (id: string) => void;
  markProductSold: (id: string) => void;
  createOrders: (
    location: LocationPoint,
    note: string,
    deliveryMethod: DeliveryMethod
  ) => number;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  resetDemoData: () => void;
};

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export function StoreProvider({ children }: PropsWithChildren) {
  const [hydrated, setHydrated] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    async function hydrate() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as PersistedState;
          setCurrentUserId(saved.currentUserId);
          setProducts(saved.products?.length ? saved.products : INITIAL_PRODUCTS);
          setCart(saved.cart ?? []);
          setOrders(saved.orders ?? INITIAL_ORDERS);
          setFavoriteIds(saved.favoriteIds ?? []);
        }
      } catch {
        await AsyncStorage.removeItem(STORAGE_KEY);
      } finally {
        setHydrated(true);
      }
    }

    void hydrate();
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const state: PersistedState = {
      currentUserId,
      products,
      cart,
      orders,
      favoriteIds,
    };
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [cart, currentUserId, favoriteIds, hydrated, orders, products]);

  const currentUser = useMemo(
    () => DEMO_USERS.find((user) => user.id === currentUserId) ?? null,
    [currentUserId]
  );

  const login = useCallback((email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = DEMO_USERS.find(
      (item) => item.email.toLowerCase() === normalizedEmail && item.password === password
    );

    if (!user) {
      return false;
    }

    setCurrentUserId(user.id);
    setCart([]);
    return true;
  }, []);

  const logout = useCallback(() => {
    setCurrentUserId(null);
    setCart([]);
  }, []);

  const getUserById = useCallback(
    (id: string) => DEMO_USERS.find((user) => user.id === id),
    []
  );

  const addToCart = useCallback(
    (productId: string) => {
      if (currentUser?.role !== 'buyer') {
        return false;
      }

      const product = products.find((item) => item.id === productId);
      if (!product || product.status !== 'active' || product.stock <= 0) {
        return false;
      }

      setCart((current) => {
        const line = current.find((item) => item.productId === productId);
        if (!line) {
          return [...current, { productId, quantity: 1 }];
        }

        return current.map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item
        );
      });
      return true;
    },
    [currentUser?.role, products]
  );

  const changeCartQuantity = useCallback(
    (productId: string, quantity: number) => {
      const stock = products.find((item) => item.id === productId)?.stock ?? 0;
      if (quantity <= 0) {
        setCart((current) => current.filter((item) => item.productId !== productId));
        return;
      }

      setCart((current) =>
        current.map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.min(quantity, stock) }
            : item
        )
      );
    },
    [products]
  );

  const removeFromCart = useCallback((productId: string) => {
    setCart((current) => current.filter((item) => item.productId !== productId));
  }, []);

  const toggleFavorite = useCallback((productId: string) => {
    setFavoriteIds((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId]
    );
  }, []);

  const addProduct = useCallback(
    (input: ProductInput) => {
      if (currentUser?.role !== 'seller') {
        return null;
      }

      const product: Product = {
        ...input,
        id: `product-${Date.now()}`,
        sellerId: currentUser.id,
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      setProducts((current) => [product, ...current]);
      return product;
    },
    [currentUser]
  );

  const updateProduct = useCallback(
    (id: string, input: ProductInput) => {
      const product = products.find((item) => item.id === id);
      if (!product || product.sellerId !== currentUser?.id) {
        return false;
      }

      setProducts((current) =>
        current.map((item) => (item.id === id ? { ...item, ...input } : item))
      );
      return true;
    },
    [currentUser?.id, products]
  );

  const deleteProduct = useCallback(
    (id: string) => {
      setProducts((current) =>
        current.filter((item) => item.id !== id || item.sellerId !== currentUser?.id)
      );
      setCart((current) => current.filter((item) => item.productId !== id));
    },
    [currentUser?.id]
  );

  const markProductSold = useCallback(
    (id: string) => {
      setProducts((current) =>
        current.map((item) =>
          item.id === id && item.sellerId === currentUser?.id
            ? { ...item, stock: 0, status: 'sold' }
            : item
        )
      );
      setCart((current) => current.filter((item) => item.productId !== id));
    },
    [currentUser?.id]
  );

  const createOrders = useCallback(
    (location: LocationPoint, note: string, deliveryMethod: DeliveryMethod) => {
      if (currentUser?.role !== 'buyer' || cart.length === 0) {
        return 0;
      }

      const validLines = cart.flatMap((line) => {
        const product = products.find((item) => item.id === line.productId);
        if (!product || product.status !== 'active' || product.stock <= 0) {
          return [];
        }
        return [{ product, quantity: Math.min(line.quantity, product.stock) }];
      });

      const grouped = new Map<string, typeof validLines>();
      validLines.forEach((line) => {
        grouped.set(line.product.sellerId, [
          ...(grouped.get(line.product.sellerId) ?? []),
          line,
        ]);
      });

      const now = Date.now();
      const newOrders: Order[] = Array.from(grouped.entries()).map(
        ([sellerId, lines], index) => {
          const items = lines.map(({ product, quantity }) => ({
            productId: product.id,
            title: product.title,
            image: product.image,
            price: product.price,
            quantity,
          }));
          const shippingFee = deliveryMethod === 'cod' ? 20000 : 0;

          return {
            id: `UL${String(now).slice(-7)}${index + 1}`,
            buyerId: currentUser.id,
            sellerId,
            items,
            shippingFee,
            total:
              items.reduce((sum, item) => sum + item.price * item.quantity, 0) +
              shippingFee,
            status: 'pending',
            deliveryMethod,
            deliveryLocation: location,
            note: note.trim(),
            createdAt: new Date().toISOString(),
          };
        }
      );

      setProducts((current) =>
        current.map((product) => {
          const purchased = validLines.find((line) => line.product.id === product.id);
          if (!purchased) {
            return product;
          }
          const stock = Math.max(0, product.stock - purchased.quantity);
          return { ...product, stock, status: stock === 0 ? 'sold' : 'active' };
        })
      );
      setOrders((current) => [...newOrders, ...current]);
      setCart([]);
      return newOrders.length;
    },
    [cart, currentUser, products]
  );

  const updateOrderStatus = useCallback(
    (id: string, status: OrderStatus) => {
      setOrders((current) =>
        current.map((order) =>
          order.id === id && order.sellerId === currentUser?.id
            ? { ...order, status }
            : order
        )
      );
    },
    [currentUser?.id]
  );

  const resetDemoData = useCallback(() => {
    setProducts(INITIAL_PRODUCTS);
    setCart([]);
    setOrders(INITIAL_ORDERS);
    setFavoriteIds([]);
  }, []);

  const value = useMemo<StoreContextValue>(
    () => ({
      hydrated,
      currentUser,
      products,
      cart,
      orders,
      favoriteIds,
      login,
      logout,
      getUserById,
      addToCart,
      changeCartQuantity,
      removeFromCart,
      toggleFavorite,
      addProduct,
      updateProduct,
      deleteProduct,
      markProductSold,
      createOrders,
      updateOrderStatus,
      resetDemoData,
    }),
    [
      addProduct,
      addToCart,
      cart,
      changeCartQuantity,
      createOrders,
      currentUser,
      deleteProduct,
      favoriteIds,
      getUserById,
      hydrated,
      login,
      logout,
      markProductSold,
      orders,
      products,
      removeFromCart,
      resetDemoData,
      toggleFavorite,
      updateOrderStatus,
      updateProduct,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used inside StoreProvider');
  }
  return context;
}
