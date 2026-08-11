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

import {
  DEMO_USERS,
  INITIAL_ADDRESSES,
  INITIAL_CHATS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_REVIEWS,
  PLATFORM_FEE,
} from '@/src/data/seed';
import {
  AppNotification,
  CartLine,
  ChatMessage,
  ChatThread,
  DeliveryMethod,
  LocationPoint,
  Order,
  OrderStatus,
  Product,
  ProductInput,
  Review,
  SavedAddress,
  User,
  UserRole,
} from '@/src/types';

const STORAGE_KEY = '@uniloop/demo-state-v1';

type PersistedState = {
  currentUserId: string | null;
  products: Product[];
  cart: CartLine[];
  orders: Order[];
  favoriteIds: string[];
  addresses: SavedAddress[];
  notifications: AppNotification[];
  chats: ChatThread[];
  reviews: Review[];
};

type StoreContextValue = {
  hydrated: boolean;
  currentUser: User | null;
  products: Product[];
  cart: CartLine[];
  orders: Order[];
  favoriteIds: string[];
  addresses: SavedAddress[];
  notifications: AppNotification[];
  chats: ChatThread[];
  reviews: Review[];
  login: (email: string, password: string, role?: UserRole) => boolean;
  loginGuest: (role?: UserRole) => User;
  register: (
    input: Pick<User, 'name' | 'email' | 'phone' | 'password' | 'campus'>,
    role: UserRole
  ) => User;
  logout: () => void;
  getUserById: (id: string) => User | undefined;
  addToCart: (productId: string) => boolean;
  changeCartQuantity: (productId: string, quantity: number) => void;
  toggleCartSelected: (productId: string, selected?: boolean) => void;
  selectAllCart: (selected: boolean) => void;
  removeFromCart: (productId: string) => void;
  toggleFavorite: (productId: string) => void;
  addProduct: (input: ProductInput) => Product | null;
  updateProduct: (id: string, input: ProductInput) => boolean;
  deleteProduct: (id: string) => void;
  markProductSold: (id: string) => void;
  createOrders: (
    location: LocationPoint,
    note: string,
    deliveryMethod: DeliveryMethod,
    sellerIds?: string[]
  ) => number;
  updateOrderStatus: (id: string, status: OrderStatus, reason?: string) => void;
  addAddress: (address: Omit<SavedAddress, 'id'>) => void;
  updateAddress: (id: string, address: Partial<SavedAddress>) => void;
  deleteAddress: (id: string) => void;
  markNotificationsRead: () => void;
  unreadCount: number;
  sendMessage: (threadId: string, text: string, offerLocation?: LocationPoint) => void;
  startChat: (sellerId: string, productId: string) => string;
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
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
  const [addresses, setAddresses] = useState<SavedAddress[]>(INITIAL_ADDRESSES);
  const [notifications, setNotifications] =
    useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [chats, setChats] = useState<ChatThread[]>(INITIAL_CHATS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);

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
          setAddresses(saved.addresses ?? INITIAL_ADDRESSES);
          setNotifications(saved.notifications ?? INITIAL_NOTIFICATIONS);
          setChats(saved.chats ?? INITIAL_CHATS);
          setReviews(saved.reviews ?? INITIAL_REVIEWS);
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
      addresses,
      notifications,
      chats,
      reviews,
    };
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [
    addresses,
    cart,
    chats,
    currentUserId,
    favoriteIds,
    hydrated,
    notifications,
    orders,
    products,
    reviews,
  ]);

  const currentUser = useMemo(() => {
    const user = DEMO_USERS.find((item) => item.id === currentUserId) ?? null;
    return user;
  }, [currentUserId]);

  const login = useCallback((email: string, password: string, role?: UserRole) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = DEMO_USERS.find(
      (item) => item.email.toLowerCase() === normalizedEmail && item.password === password
    );

    if (!user) {
      return false;
    }

    if (role && user.role !== role) {
      return false;
    }

    setCurrentUserId(user.id);
    setCart([]);
    return true;
  }, []);

  const loginGuest = useCallback((role: UserRole = 'buyer') => {
    const guest =
      DEMO_USERS.find((user) => user.role === role) ?? DEMO_USERS.find((user) => user.id === 'buyer-1') ?? DEMO_USERS[0];
    setCurrentUserId(guest.id);
    setCart([]);
    return guest;
  }, []);

  const register = useCallback(
    (input: Pick<User, 'name' | 'email' | 'phone' | 'password' | 'campus'>, role: UserRole) => {
      const existing = DEMO_USERS.find(
        (item) => item.email.toLowerCase() === input.email.trim().toLowerCase()
      );
      if (existing) {
        throw new Error('Email này đã được sử dụng.');
      }

      const user: User = {
        id: `user-${Date.now()}`,
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        password: input.password,
        phone: input.phone.trim(),
        avatar:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300',
        campus: input.campus.trim() || 'Đại học Bách Khoa TP.HCM',
        verified: false,
        role,
        rating: 0,
        reviewCount: 0,
      };
      DEMO_USERS.push(user);
      setCurrentUserId(user.id);
      setCart([]);
      return user;
    },
    []
  );

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
          return [...current, { productId, quantity: 1, selected: true }];
        }

        return current.map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: Math.min(item.quantity + 1, product.stock),
                selected: true,
              }
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

  const toggleCartSelected = useCallback((productId: string, selected?: boolean) => {
    setCart((current) =>
      current.map((item) =>
        item.productId === productId
          ? { ...item, selected: selected ?? !item.selected }
          : item
      )
    );
  }, []);

  const selectAllCart = useCallback((selected: boolean) => {
    setCart((current) => current.map((item) => ({ ...item, selected })));
  }, []);

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
    (
      location: LocationPoint,
      note: string,
      deliveryMethod: DeliveryMethod,
      sellerIds?: string[]
    ) => {
      if (currentUser?.role !== 'buyer' || cart.length === 0) {
        return 0;
      }

      const selectedLines = cart.filter((line) => line.selected !== false);
      const validLines = selectedLines.flatMap((line) => {
        const product = products.find((item) => item.id === line.productId);
        if (!product || product.status !== 'active' || product.stock <= 0) {
          return [];
        }
        return [{ product, quantity: Math.min(line.quantity, product.stock) }];
      });

      const filtered = sellerIds?.length
        ? validLines.filter((line) => sellerIds.includes(line.product.sellerId))
        : validLines;

      const grouped = new Map<string, typeof filtered>();
      filtered.forEach((line) => {
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
            condition: product.condition,
          }));
          const shippingFee = deliveryMethod === 'cod' ? 15000 : 0;
          const subtotal = items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          return {
            id: `UL${String(now).slice(-7)}${index + 1}`,
            buyerId: currentUser.id,
            sellerId,
            items,
            shippingFee,
            platformFee: PLATFORM_FEE,
            total: subtotal + shippingFee + PLATFORM_FEE,
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
          const purchased = filtered.find((line) => line.product.id === product.id);
          if (!purchased) {
            return product;
          }
          const stock = Math.max(0, product.stock - purchased.quantity);
          return { ...product, stock, status: stock === 0 ? 'sold' : 'active' };
        })
      );
      setOrders((current) => [...newOrders, ...current]);
      setCart((current) =>
        current.filter((line) => line.selected === false || !filtered.some((f) => f.product.id === line.productId))
      );
      return newOrders.length;
    },
    [cart, currentUser, products]
  );

  const updateOrderStatus = useCallback(
    (id: string, status: OrderStatus, reason?: string) => {
      setOrders((current) =>
        current.map((order) => {
          if (order.id !== id) {
            return order;
          }
          const patch: Partial<Order> = { status };
          if (status === 'cancelled' || status === 'rejected') {
            patch.cancelReason = reason;
            patch.cancelledAt = new Date().toISOString();
          }
          if (status === 'completed') {
            patch.completedAt = new Date().toISOString();
          }
          return { ...order, ...patch };
        })
      );
    },
    []
  );

  const addAddress = useCallback((address: Omit<SavedAddress, 'id'>) => {
    setAddresses((current) => {
      const next = [
        ...current.map((item) =>
          address.isDefault ? { ...item, isDefault: false } : item
        ),
        { ...address, id: `address-${Date.now()}` },
      ];
      return next;
    });
  }, []);

  const updateAddress = useCallback((id: string, patch: Partial<SavedAddress>) => {
    setAddresses((current) =>
      current.map((item) => {
        if (item.id !== id) {
          return item;
        }
        const next = { ...item, ...patch };
        if (patch.isDefault) {
          return { ...next, isDefault: true };
        }
        return next;
      })
    );
  }, []);

  const deleteAddress = useCallback((id: string) => {
    setAddresses((current) => current.filter((item) => item.id !== id));
  }, []);

  const markNotificationsRead = useCallback(() => {
    setNotifications((current) =>
      current.map((item) => ({ ...item, read: true }))
    );
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

  const sendMessage = useCallback(
    (threadId: string, text: string, offerLocation?: LocationPoint) => {
      if (!currentUser) {
        return;
      }
      const message: ChatMessage = {
        id: `msg-${Date.now()}`,
        senderId: currentUser.id,
        text,
        createdAt: new Date().toISOString(),
        read: false,
        offerLocation,
      };
      setChats((current) =>
        current.map((thread) =>
          thread.id === threadId
            ? {
                ...thread,
                messages: [...thread.messages, message],
                updatedAt: new Date().toISOString(),
              }
            : thread
        )
      );
    },
    [currentUser]
  );

  const startChat = useCallback(
    (sellerId: string, productId: string) => {
      if (!currentUser) {
        return '';
      }
      const existing = chats.find(
        (thread) =>
          thread.participants.includes(sellerId) &&
          thread.participants.includes(currentUser.id) &&
          thread.productId === productId
      );
      if (existing) {
        return existing.id;
      }
      const threadId = `chat-${Date.now()}`;
      const thread: ChatThread = {
        id: threadId,
        participants: [currentUser.id, sellerId],
        productId,
        messages: [],
        updatedAt: new Date().toISOString(),
      };
      setChats((current) => [thread, ...current]);
      return threadId;
    },
    [chats, currentUser]
  );

  const addReview = useCallback((review: Omit<Review, 'id' | 'createdAt'>) => {
    setReviews((current) => [
      { ...review, id: `review-${Date.now()}`, createdAt: new Date().toISOString() },
      ...current,
    ]);
  }, []);

  const resetDemoData = useCallback(() => {
    setProducts(INITIAL_PRODUCTS);
    setCart([]);
    setOrders(INITIAL_ORDERS);
    setFavoriteIds([]);
    setAddresses(INITIAL_ADDRESSES);
    setNotifications(INITIAL_NOTIFICATIONS);
    setChats(INITIAL_CHATS);
    setReviews(INITIAL_REVIEWS);
  }, []);

  const value = useMemo<StoreContextValue>(
    () => ({
      hydrated,
      currentUser,
      products,
      cart,
      orders,
      favoriteIds,
      addresses,
      notifications,
      chats,
      reviews,
      login,
      loginGuest,
      register,
      logout,
      getUserById,
      addToCart,
      changeCartQuantity,
      toggleCartSelected,
      selectAllCart,
      removeFromCart,
      toggleFavorite,
      addProduct,
      updateProduct,
      deleteProduct,
      markProductSold,
      createOrders,
      updateOrderStatus,
      addAddress,
      updateAddress,
      deleteAddress,
      markNotificationsRead,
      unreadCount,
      sendMessage,
      startChat,
      addReview,
      resetDemoData,
    }),
    [
      addAddress,
      addProduct,
      addReview,
      addToCart,
      addresses,
      cart,
      changeCartQuantity,
      chats,
      createOrders,
      currentUser,
      deleteAddress,
      deleteProduct,
      favoriteIds,
      getUserById,
      hydrated,
      login,
      loginGuest,
      logout,
      markNotificationsRead,
      markProductSold,
      notifications,
      orders,
      products,
      register,
      removeFromCart,
      resetDemoData,
      reviews,
      selectAllCart,
      sendMessage,
      startChat,
      toggleCartSelected,
      toggleFavorite,
      unreadCount,
      updateAddress,
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
