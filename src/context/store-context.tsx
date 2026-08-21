import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { supabase } from '@/src/lib/supabase';
import {
  listProducts,
  createProduct as repoCreateProduct,
  updateProduct as repoUpdateProduct,
  deleteProduct as repoDeleteProduct,
  markProductSold as repoMarkProductSold,
} from '@/src/lib/repo/products';
import {
  listOrdersForBuyer,
  listOrdersForSeller,
  createOrder as repoCreateOrder,
  updateOrderStatus as repoUpdateOrderStatus,
} from '@/src/lib/repo/orders';
import { listCartLines, upsertCartLine, deleteCartLine } from '@/src/lib/repo/cart';
import { toggleFavorite as repoToggleFavorite } from '@/src/lib/repo/favorites';
import {
  listAddresses,
  createAddress as repoCreateAddress,
  updateAddress as repoUpdateAddress,
  deleteAddress as repoDeleteAddress,
} from '@/src/lib/repo/addresses';
import {
  listChatThreads,
  createChatThread as repoCreateChatThread,
  sendMessage as repoSendMessage,
} from '@/src/lib/repo/chat';
import { listNotifications, markAllNotificationsRead as repoMarkAllNotificationsRead } from '@/src/lib/repo/notifications';
import { createReview as repoCreateReview } from '@/src/lib/repo/reviews';
import {
  AppNotification,
  CartLine,
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
  favoriteIds: string[];
};

type StoreContextValue = {
  hydrated: boolean;
  currentUser: User | null;
  activeRole: UserRole;
  switchRole: (role: UserRole) => void;
  products: Product[];
  cart: CartLine[];
  orders: Order[];
  favoriteIds: string[];
  addresses: SavedAddress[];
  notifications: AppNotification[];
  chats: ChatThread[];
  reviews: Review[];
  login: (email: string, password: string) => Promise<User>;
  register: (
    input: Pick<User, 'name' | 'email' | 'phone' | 'password' | 'campus'>
  ) => Promise<{ needsVerification: boolean }>;
  logout: () => Promise<void>;
  getUserById: (id: string) => User | undefined;
  addToCart: (productId: string) => Promise<boolean>;
  changeCartQuantity: (productId: string, quantity: number) => Promise<void>;
  toggleCartSelected: (productId: string, selected?: boolean) => Promise<void>;
  selectAllCart: (selected: boolean) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  toggleFavorite: (productId: string) => Promise<void>;
  addProduct: (input: ProductInput) => Promise<Product | null>;
  updateProduct: (id: string, input: ProductInput) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<void>;
  markProductSold: (id: string) => Promise<void>;
  createOrders: (
    location: LocationPoint,
    note: string,
    deliveryMethod: DeliveryMethod,
    sellerIds?: string[]
  ) => Promise<number>;
  updateOrderStatus: (id: string, status: OrderStatus, reason?: string) => Promise<void>;
  addAddress: (address: Omit<SavedAddress, 'id'>) => Promise<void>;
  updateAddress: (id: string, address: Partial<SavedAddress>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  markNotificationsRead: () => Promise<void>;
  unreadCount: number;
  sendMessage: (threadId: string, text: string, offerLocation?: LocationPoint) => Promise<void>;
  startChat: (sellerId: string, productId: string) => Promise<string>;
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => Promise<void>;
  refreshProducts: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshCart: () => Promise<void>;
  refreshAddresses: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  refreshChats: () => Promise<void>;
};

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

function mapProfileToUser(profile: Record<string, unknown>): User {
  return {
    id: profile.id as string,
    name: (profile.name as string) || '',
    email: (profile.email as string) || '',
    password: '',
    role: ((profile.role as string) || 'buyer') as UserRole,
    phone: (profile.phone as string) || '',
    avatar:
      (profile.avatar as string) ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300',
    campus:
      (profile.campus as string) || 'Đại học Bách Khoa TP.HCM',
    verified: (profile.verified as boolean) || false,
    rating: (profile.rating as number) || 0,
    reviewCount: (profile.review_count as number) || 0,
    bio: profile.bio as string | undefined,
    sellerSince: profile.seller_since as string | undefined,
  };
}

export function StoreProvider({ children }: PropsWithChildren) {
  const [hydrated, setHydrated] = useState(false);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [chats, setChats] = useState<ChatThread[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeRole, setActiveRole] = useState<UserRole>('buyer');

  const mountedRef = useRef(true);

  const fetchUserProfile = useCallback(async (userId: string, retries = 2) => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (data && !error && mountedRef.current) {
          setUserProfile(mapProfileToUser(data));
          return data;
        }

        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
          continue;
        }
      } catch {
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
          continue;
        }
      }
      break;
    }
    return null;
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user && mountedRef.current) {
          await fetchUserProfile(session.user.id);
        }
      } catch {
        // ignore
      } finally {
        if (mountedRef.current) {
          setHydrated(true);
        }
      }
    }

    void init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mountedRef.current) return;

        if (event === 'SIGNED_IN' && session?.user) {
          await fetchUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUserProfile(null);
        }
      }
    );

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const state: PersistedState = {
      favoriteIds,
    };
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [favoriteIds, hydrated]);

  useEffect(() => {
    async function hydrateData() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as PersistedState;
          setFavoriteIds(saved.favoriteIds ?? []);
        }
      } catch {
        await AsyncStorage.removeItem(STORAGE_KEY);
      }
    }

    void hydrateData();
  }, []);

  const currentUser = useMemo(() => userProfile, [userProfile]);

  const refreshProducts = useCallback(async () => {
    const items = await listProducts({ status: 'active' });
    setProducts(items);
  }, []);

  const refreshOrders = useCallback(async () => {
    if (!currentUser) return;
    const buyerOrders = await listOrdersForBuyer(currentUser.id);
    const sellerOrders = await listOrdersForSeller(currentUser.id);
    const merged = [...buyerOrders, ...sellerOrders];
    const unique = Array.from(new Map(merged.map((o) => [o.id, o])).values());
    unique.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setOrders(unique);
  }, [currentUser]);

  const refreshCart = useCallback(async () => {
    if (!currentUser) return;
    const lines = await listCartLines(currentUser.id);
    setCart(lines);
  }, [currentUser]);

  const refreshAddresses = useCallback(async () => {
    if (!currentUser) return;
    const items = await listAddresses(currentUser.id);
    setAddresses(items);
  }, [currentUser]);

  const refreshNotifications = useCallback(async () => {
    if (!currentUser) return;
    const items = await listNotifications(currentUser.id);
    setNotifications(items);
  }, [currentUser]);

  const refreshChats = useCallback(async () => {
    if (!currentUser) return;
    const threads = await listChatThreads(currentUser.id);
    setChats(threads);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      setProducts([]);
      setCart([]);
      setOrders([]);
      setAddresses([]);
      setNotifications([]);
      setChats([]);
      setReviews([]);
      return;
    }

    let cancelled = false;

    async function load() {
      if (!currentUser) return;
      const [prods, cartLines, addrs, notifs, chatThreads] = await Promise.all([
        listProducts({ status: 'active' }),
        listCartLines(currentUser.id),
        listAddresses(currentUser.id),
        listNotifications(currentUser.id),
        listChatThreads(currentUser.id),
      ]);

      if (!cancelled) {
        setProducts(prods);
        setCart(cartLines);
        setAddresses(addrs);
        setNotifications(notifs);
        setChats(chatThreads);
      }

      const buyerOrders = await listOrdersForBuyer(currentUser.id);
      const sellerOrders = await listOrdersForSeller(currentUser.id);
      const merged = [...buyerOrders, ...sellerOrders];
      const unique = Array.from(new Map(merged.map((o) => [o.id, o])).values());
      unique.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      if (!cancelled) {
        setOrders(unique);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  const login = useCallback(
    async (email: string, password: string): Promise<User> => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          throw new Error(
            'Email chưa được xác thực. Vui lòng kiểm tra hộp thư và nhấn vào liên kết xác thực để kích hoạt tài khoản.'
          );
        }
        throw new Error('Email hoặc mật khẩu không đúng.');
      }

      if (data.user) {
        const profile = await fetchUserProfile(data.user.id);
        if (profile) {
          return mapProfileToUser(profile);
        }
      }

      throw new Error('Không thể tải thông tin tài khoản. Vui lòng thử lại.');
    },
    [fetchUserProfile]
  );

  const register = useCallback(
    async (input: Pick<User, 'name' | 'email' | 'phone' | 'password' | 'campus'>) => {
      const { data, error } = await supabase.auth.signUp({
        email: input.email.trim(),
        password: input.password,
        options: {
          data: {
            name: input.name.trim(),
            phone: input.phone.trim(),
            campus: input.campus,
          },
          emailRedirectTo: 'uniloop://verify-email',
        },
      });

      if (error) {
        const message = error.message.toLowerCase();
        if (
          message.includes('already registered') ||
          message.includes('already been registered') ||
          message.includes('user already registered') ||
          message.includes('email already exists') ||
          message.includes('duplicate key') ||
          message.includes('email_address_not_authorized')
        ) {
          throw new Error('Email này đã được sử dụng.');
        }
        if (message.includes('password')) {
          throw new Error('Mật khẩu không đạt yêu cầu.');
        }
        if (message.includes('invalid email') || message.includes('email')) {
          throw new Error('Email không hợp lệ.');
        }
        if (message.includes('rate limit') || message.includes('too many requests')) {
          throw new Error('Bạn đã gửi yêu cầu quá nhiều lần. Vui lòng thử lại sau.');
        }
        throw new Error(`Đăng ký thất bại: ${error.message}`);
      }

      if (!data.user) {
        throw new Error('Đăng ký thất bại. Vui lòng thử lại.');
      }

      if (!data.session) {
        return { needsVerification: true };
      }

      return { needsVerification: false };
    },
    []
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUserProfile(null);
    setCart([]);
  }, []);

  const getUserById = useCallback(
    (id: string) => {
      if (currentUser?.id === id) return currentUser;
      return undefined;
    },
    [currentUser]
  );

  const addToCart = useCallback(
    async (productId: string) => {
      const product = products.find((item) => item.id === productId);
      if (!product || product.status !== 'active' || product.stock <= 0 || !currentUser) {
        return false;
      }

      const existing = cart.find((item) => item.productId === productId);
      const nextQuantity = existing ? existing.quantity + 1 : 1;
      const finalQuantity = Math.min(nextQuantity, product.stock);

      await upsertCartLine(currentUser.id, productId, finalQuantity, true);
      await refreshCart();
      return true;
    },
    [cart, currentUser, products, refreshCart]
  );

  const changeCartQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (!currentUser) return;
      const stock = products.find((item) => item.id === productId)?.stock ?? 0;

      if (quantity <= 0) {
        await deleteCartLine(currentUser.id, productId);
      } else {
        await upsertCartLine(currentUser.id, productId, Math.min(quantity, stock), true);
      }

      await refreshCart();
    },
    [currentUser, products, refreshCart]
  );

  const toggleCartSelected = useCallback(async (productId: string, selected?: boolean) => {
    if (!currentUser) return;
    const line = cart.find((item) => item.productId === productId);
    if (!line) return;

    await upsertCartLine(currentUser.id, productId, line.quantity, selected ?? !line.selected);
    await refreshCart();
  }, [cart, currentUser, refreshCart]);

  const selectAllCart = useCallback(async (selected: boolean) => {
    if (!currentUser) return;
    await Promise.all(
      cart.map((line) =>
        upsertCartLine(currentUser.id, line.productId, line.quantity, selected)
      )
    );
    await refreshCart();
  }, [cart, currentUser, refreshCart]);

  const removeFromCart = useCallback(async (productId: string) => {
    if (!currentUser) return;
    await deleteCartLine(currentUser.id, productId);
    await refreshCart();
  }, [currentUser, refreshCart]);

  const toggleFavorite = useCallback(async (productId: string) => {
    if (!currentUser) return;
    const next = await repoToggleFavorite(currentUser.id, productId);
    setFavoriteIds((current) =>
      next
        ? [...current, productId]
        : current.filter((id) => id !== productId)
    );
  }, [currentUser]);

  const addProduct = useCallback(
    async (input: ProductInput) => {
      if (!currentUser) {
        return null;
      }

      try {
        const product = await repoCreateProduct({
          ...input,
          sellerId: currentUser.id,
        });
        setProducts((current) => [product, ...current]);
        return product;
      } catch {
        return null;
      }
    },
    [currentUser]
  );

  const updateProduct = useCallback(
    async (id: string, input: ProductInput) => {
      const product = products.find((item) => item.id === id);
      if (!product || product.sellerId !== currentUser?.id) {
        return false;
      }

      const updated = await repoUpdateProduct(id, input);
      if (!updated) return false;

      setProducts((current) =>
        current.map((item) => (item.id === id ? updated : item))
      );
      return true;
    },
    [currentUser?.id, products]
  );

  const deleteProduct = useCallback(async (id: string) => {
    await repoDeleteProduct(id);
    setProducts((current) => current.filter((item) => item.id !== id));
    setCart((current) => current.filter((item) => item.productId !== id));
  }, []);

  const markProductSold = useCallback(async (id: string) => {
    await repoMarkProductSold(id);
    setProducts((current) =>
      current.map((item) =>
        item.id === id && item.sellerId === currentUser?.id
          ? { ...item, stock: 0, status: 'sold' }
          : item
      )
    );
    setCart((current) => current.filter((item) => item.productId !== id));
  }, [currentUser?.id]);

  const createOrders = useCallback(
    async (
      location: LocationPoint,
      note: string,
      deliveryMethod: DeliveryMethod,
      sellerIds?: string[]
    ) => {
      if (!currentUser || cart.length === 0) {
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
      const newOrders: Order[] = [];

      for (const [sellerId, lines] of grouped.entries()) {
        const items = lines.map(({ product, quantity }) => ({
          productId: product.id,
          title: product.title,
          image: product.image,
          price: product.price,
          quantity,
          condition: product.condition,
        }));
        const shippingFee = deliveryMethod === 'cod' ? 15000 : 0;
        const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const order = await repoCreateOrder({
          orderCode: `UL${String(now).slice(-7)}${newOrders.length + 1}`,
          buyerId: currentUser.id,
          sellerId,
          items,
          shippingFee,
          platformFee: 0,
          total: subtotal + shippingFee,
          deliveryMethod,
          deliveryLocation: location,
          note: note.trim(),
        });

        newOrders.push(order);
      }

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

      if (currentUser) {
        const purchasedIds = filtered.map((f) => f.product.id);
        setCart((current) =>
          current.filter(
            (line) =>
              line.selected === false ||
              !purchasedIds.includes(line.productId)
          )
        );
      }

      return newOrders.length;
    },
    [cart, currentUser, products]
  );

  const updateOrderStatus = useCallback(
    async (id: string, status: OrderStatus, reason?: string) => {
      const updated = await repoUpdateOrderStatus(id, status, reason);
      if (updated) {
        setOrders((current) =>
          current.map((order) => (order.id === id ? updated : order))
        );
      }
    },
    []
  );

  const addAddress = useCallback(async (address: Omit<SavedAddress, 'id'>) => {
    if (!currentUser) return;
    const saved = await repoCreateAddress({ ...address, userId: currentUser.id });
    setAddresses((current) => {
      const next = current.map((item) =>
        address.isDefault ? { ...item, isDefault: false } : item
      );
      return [saved, ...next];
    });
  }, [currentUser]);

  const updateAddress = useCallback(async (id: string, patch: Partial<SavedAddress>) => {
    const updated = await repoUpdateAddress(id, patch);
    if (updated) {
      setAddresses((current) =>
        current.map((item) => (item.id === id ? updated : item))
      );
    }
  }, []);

  const deleteAddress = useCallback(async (id: string) => {
    await repoDeleteAddress(id);
    setAddresses((current) => current.filter((item) => item.id !== id));
  }, []);

  const markNotificationsRead = useCallback(async () => {
    if (!currentUser) return;
    await repoMarkAllNotificationsRead(currentUser.id);
    setNotifications((current) =>
      current.map((item) => ({ ...item, read: true }))
    );
  }, [currentUser]);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

  const sendMessage = useCallback(
    async (threadId: string, text: string, offerLocation?: LocationPoint) => {
      if (!currentUser) return;
      const message = await repoSendMessage({
        threadId,
        senderId: currentUser.id,
        text,
        offerLocation,
      });
      setChats((current) =>
        current.map((thread) =>
          thread.id === threadId
            ? {
                ...thread,
                messages: [...thread.messages, message],
                updatedAt: message.createdAt,
              }
            : thread
        )
      );
    },
    [currentUser]
  );

  const startChat = useCallback(async (sellerId: string, productId: string) => {
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

    const thread = await repoCreateChatThread({
      participant1: currentUser.id,
      participant2: sellerId,
      productId,
    });

    setChats((current) => [thread, ...current]);
    return thread.id;
  }, [chats, currentUser]);

  const addReview = useCallback(async (review: Omit<Review, 'id' | 'createdAt'>) => {
    const created = await repoCreateReview(review);
    setReviews((current) => [created, ...current]);
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    setActiveRole(role);
  }, []);

  const value = useMemo<StoreContextValue>(
    () => ({
      hydrated,
      currentUser,
      activeRole,
      switchRole,
      products,
      cart,
      orders,
      favoriteIds,
      addresses,
      notifications,
      chats,
      reviews,
      login,
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
      refreshProducts,
      refreshOrders,
      refreshCart,
      refreshAddresses,
      refreshNotifications,
      refreshChats,
    }),
    [
      hydrated,
      currentUser,
      activeRole,
      switchRole,
      products,
      cart,
      orders,
      favoriteIds,
      addresses,
      notifications,
      chats,
      reviews,
      login,
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
      refreshProducts,
      refreshOrders,
      refreshCart,
      refreshAddresses,
      refreshNotifications,
      refreshChats,
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
