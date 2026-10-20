/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShoppingBag, Search, Heart, MapPin, 
  Check, ArrowRight, Share2, Sparkles, Star, Plus, Minus, X, Zap
} from 'lucide-react';
import { Product } from '@/adapters/types.ts';
import { useMerchantStore } from '@/mobile/store/useMerchantStore.ts';
import { usePaymentsStore } from '@/mobile/store/usePaymentsStore.ts';

export const MiniAppStorefront: React.FC = () => {
  const { tenant, addOrder } = useMerchantStore();
  const { createOrderWithPaymentIntent } = usePaymentsStore();
  const [lang, setLang] = useState<'en' | 'es'>(tenant.language === 'es' ? 'es' : 'en');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [wishlist, setWishlist] = useState<string[]>(['1']);
  const [cartItems, setCartItems] = useState<Array<{ product: Product; quantity: number }>>([
    {
      product: {
        id: '1',
        title: 'Minimalist Canvas Tote',
        description: 'Heavyweight organic cotton canvas tote with interior zip pocket.',
        handle: 'minimalist-canvas-tote',
        price: 34.00,
        currency: 'USD',
        images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80'],
        variants: [{ id: '101', title: 'Natural Ecru', price: 34.00, inventoryQuantity: 14, availableForSale: true }],
        tags: ['Bags', 'Eco'],
        category: 'Accessories',
        totalInventory: 14,
        rating: 4.9,
        reviewCount: 38,
      },
      quantity: 1,
    },
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'catalog' | 'wishlist' | 'orders' | 'profile'>('catalog');
  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null);
  const [copiedReferral, setCopiedReferral] = useState(false);

  // Customer Loyalty & Saved Address State (Benefit 5, Benefit 6, Benefit 7)
  const [loyaltyPoints, setLoyaltyPoints] = useState(350);
  const [savedAddress, setSavedAddress] = useState({
    name: 'Elena Rostova',
    address1: '450 Sutter St Suite 12',
    city: 'San Francisco, CA 94108',
    country: 'United States',
  });

  const products: Product[] = [
    {
      id: '1',
      title: 'Minimalist Canvas Tote',
      description: 'Heavyweight organic cotton canvas tote bag with reinforced shoulder straps and interior zip pocket.',
      handle: 'minimalist-canvas-tote',
      price: 34.00,
      currency: 'USD',
      images: ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=500&q=80'],
      variants: [{ id: '101', title: 'Natural Ecru', price: 34.00, inventoryQuantity: 14, availableForSale: true }],
      tags: ['Bags', 'Eco'],
      category: 'Accessories',
      totalInventory: 14,
      rating: 4.9,
      reviewCount: 38,
    },
    {
      id: '2',
      title: 'Japanese Ceramic Pour-Over Dripper',
      description: 'Precision ribbed ceramic dripper for consistent brewing temperature and clean extraction.',
      handle: 'ceramic-dripper',
      price: 42.50,
      currency: 'USD',
      images: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=500&q=80'],
      variants: [{ id: '201', title: 'Matte White', price: 42.50, inventoryQuantity: 3, availableForSale: true }],
      tags: ['Coffee', 'Kitchen'],
      category: 'Lifestyle',
      totalInventory: 3,
      rating: 5.0,
      reviewCount: 52,
    },
    {
      id: '3',
      title: 'Heavyweight Waffle Knit Overshirt',
      description: '100% carded combed cotton waffle thermal overshirt with custom horn buttons.',
      handle: 'waffle-overshirt',
      price: 88.00,
      currency: 'USD',
      images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=500&q=80'],
      variants: [{ id: '301', title: 'Olive / Medium', price: 88.00, inventoryQuantity: 6, availableForSale: true }],
      tags: ['Apparel'],
      category: 'Clothing',
      totalInventory: 6,
      rating: 4.8,
      reviewCount: 29,
    },
    {
      id: '4',
      title: 'Borosilicate Glass Cold Brew Bottle',
      description: 'Removable stainless steel micro-filter for silky 24h cold-steeped coffee and loose leaf teas.',
      handle: 'glass-cold-brew',
      price: 36.00,
      currency: 'USD',
      images: ['https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=500&q=80'],
      variants: [{ id: '401', title: '750ml Clear', price: 36.00, inventoryQuantity: 11, availableForSale: true }],
      tags: ['Coffee', 'Gear'],
      category: 'Lifestyle',
      totalInventory: 11,
      rating: 4.7,
      reviewCount: 16,
    },
  ];

  const categories = ['All', 'Accessories', 'Lifestyle', 'Clothing'];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartTotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const toggleWishlist = (id: string) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as Array<{ product: Product; quantity: number }>
    );
  };

  const handleCheckout = () => {
    const newOrderNumber = `#${Math.floor(1000 + Math.random() * 9000)}`;
    const earnedPoints = Math.round(cartTotal * 5);

    // Register in centralized Stripe Connect marketplace payments store
    const grossAmountCents = Math.round(cartTotal * 100);
    const itemsSummary = cartItems.map((i) => `${i.product.title} x${i.quantity}`).join(', ');

    addOrder({
      id: String(Date.now()),
      orderNumber: newOrderNumber,
      source: 'telegram_bot',
      customer: {
        name: savedAddress.name,
        telegramChatId: 88219412,
        telegramUsername: 'elena_r',
        shippingAddress: {
          address1: savedAddress.address1,
          city: 'San Francisco',
          postalCode: '94108',
          country: 'US',
        },
      },
      items: cartItems.map((i) => ({
        id: i.product.id,
        title: i.product.title,
        quantity: i.quantity,
        price: i.product.price,
      })),
      total: cartTotal,
      currency: 'USD',
      financialStatus: 'paid',
      fulfillmentStatus: 'unfulfilled',
      createdAt: new Date().toISOString(),
    });

    createOrderWithPaymentIntent({
      orderNumber: newOrderNumber,
      tenantId: tenant.tenantId || 'tenant_demo_shop',
      merchantStoreName: tenant.storeName || 'Artisan Goods & Co.',
      customerName: savedAddress.name,
      customerEmail: 'elena@telegram.org',
      grossAmountCents,
      itemsSummary,
    });

    setLoyaltyPoints((prev) => prev + earnedPoints);
    setCheckoutSuccess(newOrderNumber);
    setCartItems([]);
  };

  const handleOneTapReorder = (product: Product) => {
    addToCart(product);
    setIsCartOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900 overflow-hidden font-sans select-none">
      {/* Telegram Mini App Native Top Header */}
      <div className="bg-[#2481cc] text-white px-4 py-2.5 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium opacity-80">Telegram Mini App</span>
          <span className="text-xs font-bold">· {tenant.storeName || 'TeleShop Store'}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
            className="text-[10px] font-bold uppercase bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded cursor-pointer transition-colors"
          >
            {lang === 'en' ? 'ES' : 'EN'}
          </button>
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
        </div>
      </div>

      {/* Main Content Viewport */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {checkoutSuccess ? (
          <div className="p-6 rounded-2xl bg-white border border-slate-200 text-center space-y-4 shadow-xs mt-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {lang === 'en' ? 'Order Confirmed!' : '¡Pedido Confirmado!'}
              </h2>
              <div className="text-xs text-slate-500 mt-1">
                Order {checkoutSuccess} {lang === 'en' ? 'has been received and is being prepared.' : 'ha sido recibido.'}
              </div>
              <div className="mt-2 p-2 rounded-lg bg-sky-50 text-[11px] text-sky-800 border border-sky-200 text-left">
                💳 <strong>Centralized Stripe Marketplace:</strong> Payment collected securely on platform account. Funds are conditionally released to the merchant 3 business days after delivery confirmation.
              </div>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center justify-center gap-1.5 font-medium">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>+170 {lang === 'en' ? 'Loyalty Points Earned!' : 'Puntos de Lealtad Ganados!'}</span>
            </div>
            <button
              onClick={() => setCheckoutSuccess(null)}
              className="w-full py-2.5 px-4 rounded-xl bg-sky-600 text-white text-xs font-semibold cursor-pointer hover:bg-sky-500"
            >
              {lang === 'en' ? 'Continue Shopping' : 'Seguir Comprando'}
            </button>
          </div>
        ) : (
          <>
            {/* Loyalty Bar & Referral Pill (Benefit 6 & 7) */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-700 text-white shadow-xs flex items-center justify-between">
              <div>
                <div className="text-[11px] font-medium opacity-85">
                  {lang === 'en' ? 'Loyalty Rewards Balance' : 'Balance de Puntos de Lealtad'}
                </div>
                <div className="text-base font-bold flex items-center gap-1.5">
                  <span>{loyaltyPoints} pts</span>
                  <span className="text-[10px] font-normal bg-white/20 px-1.5 py-0.5 rounded">
                    =${(loyaltyPoints / 20).toFixed(2)} off
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://t.me/${tenant.botUsername}?start=ref_elena88`);
                  setCopiedReferral(true);
                  setTimeout(() => setCopiedReferral(false), 2000);
                }}
                className="py-1.5 px-3 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedReferral ? 'Copied Link' : 'Referral Link'}</span>
              </button>
            </div>

            {/* Saved Address & One-Tap Reorder Bar (Benefit 5) */}
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
                <span className="truncate text-slate-700">
                  {savedAddress.name} · {savedAddress.city}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-600 shrink-0">
                ✓ 1-Tap Ready
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder={lang === 'en' ? 'Search items, materials, sizes...' : 'Buscar productos...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredProducts.map((p) => {
                const isFaved = wishlist.includes(p.id);
                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all"
                  >
                    <div className="relative aspect-square bg-slate-100 overflow-hidden">
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => toggleWishlist(p.id)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-slate-700 hover:text-red-500 transition-colors shadow-xs cursor-pointer"
                      >
                        <Heart
                          className={`w-4 h-4 ${isFaved ? 'fill-red-500 text-red-500' : ''}`}
                        />
                      </button>
                      {p.totalInventory <= 3 && (
                        <div className="absolute bottom-1.5 left-1.5 text-[10px] font-bold bg-amber-500/90 text-white px-1.5 py-0.5 rounded">
                          Only {p.totalInventory} left!
                        </div>
                      )}
                    </div>

                    <div className="p-2.5 flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex items-center gap-1 text-[11px] text-amber-500 font-semibold">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{p.rating}</span>
                          <span className="text-slate-400 font-normal">({p.reviewCount})</span>
                        </div>
                        <div className="text-xs font-bold text-slate-900 line-clamp-1 mt-0.5">
                          {p.title}
                        </div>
                        <div className="text-xs font-semibold text-slate-700 mt-1 font-mono">
                          ${p.price.toFixed(2)}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          onClick={() => addToCart(p)}
                          className="flex-1 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                        <button
                          onClick={() => handleOneTapReorder(p)}
                          title="1-Tap Instant Reorder"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Cart Drawer / Bar */}
      {cartItems.length > 0 && !checkoutSuccess && (
        <div className="p-3 bg-white border-t border-slate-200 shrink-0 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-sky-600" />
              <span className="absolute -top-1.5 -right-2 bg-sky-600 text-white rounded-full text-[10px] font-bold w-4 h-4 flex items-center justify-center">
                {cartItems.reduce((acc, i) => acc + i.quantity, 0)}
              </span>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">Cart Total</div>
              <div className="text-sm font-bold text-slate-900 font-mono">
                ${cartTotal.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCartOpen(true)}
              className="py-2 px-3 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
            >
              Review
            </button>
            <button
              onClick={handleCheckout}
              className="py-2 px-4 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <span>{tenant.platform === 'woocommerce' ? 'Pay in Telegram' : '1-Tap Pay'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Full Cart Modal */}
      {isCartOpen && (
        <div className="absolute inset-0 bg-black/40 z-50 flex flex-col justify-end">
          <div className="bg-white rounded-t-2xl p-4 max-h-[80%] flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="font-bold text-sm text-slate-900">Your Shopping Bag</div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between gap-3 text-xs">
                  <img
                    src={item.product.images[0]}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-slate-800 line-clamp-1">{item.product.title}</div>
                    <div className="text-slate-500 font-mono">${item.product.price.toFixed(2)}</div>
                  </div>
                  <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-1">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-bold px-1">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>Subtotal</span>
                <span className="font-mono text-sm">${cartTotal.toFixed(2)}</span>
              </div>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  handleCheckout();
                }}
                className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs cursor-pointer shadow-sm flex items-center justify-center gap-2"
              >
                <span>Complete Purchase with 1-Tap Address</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
