import React, { useState, useEffect } from 'react';
import { Coffee, ShoppingCart, DollarSign, Package, TrendingUp, X, Plus, Minus, Trash2, Clock, Receipt, Archive, BarChart3 } from 'lucide-react';

const CoffeeShopPOS = () => {
  const [activeTab, setActiveTab] = useState('pos');
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [discountCodes, setDiscountCodes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize data
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      // Load products
      const productsResult = await window.storage.get('coffee_products');
      if (productsResult) {
        setProducts(JSON.parse(productsResult.value));
      } else {
        // Initialize with default products
        const defaultProducts = [
          { id: '1', name: 'Espresso', category: 'Coffee', price: 3.50, stock: 100, image: '☕' },
          { id: '2', name: 'Americano', category: 'Coffee', price: 4.00, stock: 100, image: '☕' },
          { id: '3', name: 'Cappuccino', category: 'Coffee', price: 4.50, stock: 100, image: '☕' },
          { id: '4', name: 'Latte', category: 'Coffee', price: 4.75, stock: 100, image: '☕' },
          { id: '5', name: 'Mocha', category: 'Coffee', price: 5.25, stock: 100, image: '☕' },
          { id: '6', name: 'Flat White', category: 'Coffee', price: 4.50, stock: 100, image: '☕' },
          { id: '7', name: 'Croissant', category: 'Pastry', price: 3.50, stock: 50, image: '🥐' },
          { id: '8', name: 'Muffin', category: 'Pastry', price: 3.00, stock: 50, image: '🧁' },
          { id: '9', name: 'Bagel', category: 'Pastry', price: 3.25, stock: 50, image: '🥯' },
          { id: '10', name: 'Cookie', category: 'Pastry', price: 2.50, stock: 60, image: '🍪' },
          { id: '11', name: 'Iced Coffee', category: 'Cold Drinks', price: 4.25, stock: 100, image: '🧊' },
          { id: '12', name: 'Iced Latte', category: 'Cold Drinks', price: 5.00, stock: 100, image: '🧊' },
          { id: '13', name: 'Cold Brew', category: 'Cold Drinks', price: 4.75, stock: 80, image: '🧊' },
          { id: '14', name: 'Smoothie', category: 'Cold Drinks', price: 6.00, stock: 40, image: '🥤' },
          { id: '15', name: 'Green Tea', category: 'Tea', price: 3.50, stock: 80, image: '🍵' },
          { id: '16', name: 'Black Tea', category: 'Tea', price: 3.50, stock: 80, image: '🍵' },
        ];
        await window.storage.set('coffee_products', JSON.stringify(defaultProducts));
        setProducts(defaultProducts);
      }

      // Load sales
      const salesResult = await window.storage.get('coffee_sales');
      if (salesResult) {
        setSales(JSON.parse(salesResult.value));
      }

      // Load discount codes
      const discountResult = await window.storage.get('coffee_discounts');
      if (discountResult) {
        setDiscountCodes(JSON.parse(discountResult.value));
      } else {
        // Initialize with default discount codes
        const defaultDiscounts = [
          { code: 'WELCOME10', type: 'percentage', value: 10, description: '10% off for new customers', active: true },
          { code: 'COFFEE20', type: 'percentage', value: 20, description: '20% off coffee drinks', active: true },
          { code: 'SAVE5', type: 'fixed', value: 5, description: '$5 off your order', active: true },
          { code: 'FREEPASTRY', type: 'fixed', value: 3.50, description: 'Free pastry (valued at $3.50)', active: true },
        ];
        await window.storage.set('coffee_discounts', JSON.stringify(defaultDiscounts));
        setDiscountCodes(defaultDiscounts);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error initializing data:', error);
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const processSale = async (paymentMethod, appliedDiscount = null) => {
    if (cart.length === 0) return;

    const sale = {
      id: Date.now().toString(),
      items: cart,
      subtotal: calculateTotal(),
      discount: appliedDiscount,
      total: appliedDiscount ? calculateTotal() - appliedDiscount.amount : calculateTotal(),
      paymentMethod,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
    };

    // Update stock
    const updatedProducts = products.map(product => {
      const cartItem = cart.find(item => item.id === product.id);
      if (cartItem) {
        return { ...product, stock: product.stock - cartItem.quantity };
      }
      return product;
    });

    try {
      await window.storage.set('coffee_products', JSON.stringify(updatedProducts));
      setProducts(updatedProducts);

      const newSales = [sale, ...sales];
      await window.storage.set('coffee_sales', JSON.stringify(newSales));
      setSales(newSales);

      setCart([]);
      alert('Sale completed successfully!');
    } catch (error) {
      console.error('Error processing sale:', error);
      alert('Error processing sale. Please try again.');
    }
  };

  const updateProduct = async (updatedProduct) => {
    const updatedProducts = products.map(p => 
      p.id === updatedProduct.id ? updatedProduct : p
    );
    try {
      await window.storage.set('coffee_products', JSON.stringify(updatedProducts));
      setProducts(updatedProducts);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const addNewProduct = async (newProduct) => {
    const productWithId = {
      ...newProduct,
      id: Date.now().toString(),
    };
    const updatedProducts = [...products, productWithId];
    try {
      await window.storage.set('coffee_products', JSON.stringify(updatedProducts));
      setProducts(updatedProducts);
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const addDiscountCode = async (newDiscount) => {
    const updatedDiscounts = [...discountCodes, newDiscount];
    try {
      await window.storage.set('coffee_discounts', JSON.stringify(updatedDiscounts));
      setDiscountCodes(updatedDiscounts);
    } catch (error) {
      console.error('Error adding discount:', error);
    }
  };

  const updateDiscountCode = async (updatedDiscount) => {
    const updatedDiscounts = discountCodes.map(d =>
      d.code === updatedDiscount.code ? updatedDiscount : d
    );
    try {
      await window.storage.set('coffee_discounts', JSON.stringify(updatedDiscounts));
      setDiscountCodes(updatedDiscounts);
    } catch (error) {
      console.error('Error updating discount:', error);
    }
  };

  const deleteDiscountCode = async (code) => {
    const updatedDiscounts = discountCodes.filter(d => d.code !== code);
    try {
      await window.storage.set('coffee_discounts', JSON.stringify(updatedDiscounts));
      setDiscountCodes(updatedDiscounts);
    } catch (error) {
      console.error('Error deleting discount:', error);
    }
  };

  const categories = [...new Set(products.map(p => p.category))];

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #2c1810 0%, #1a0f0a 100%)',
        color: '#f4e4d7',
        fontFamily: '"Crimson Pro", serif',
        fontSize: '24px',
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2c1810 0%, #1a0f0a 100%)',
      fontFamily: '"Work Sans", sans-serif',
      color: '#f4e4d7',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=Work+Sans:wght@300;400;500;600&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .product-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }

        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
        }

        .product-card:active {
          transform: translateY(-2px);
        }

        .btn {
          transition: all 0.2s ease;
          cursor: pointer;
          border: none;
          font-family: 'Work Sans', sans-serif;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .btn:active {
          transform: translateY(0);
        }

        .tab-btn {
          transition: all 0.3s ease;
          position: relative;
        }

        .tab-btn::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #d4a574, #b8884d);
          transform: scaleX(0);
          transition: transform 0.3s ease;
        }

        .tab-btn.active::after {
          transform: scaleX(1);
        }

        .cart-item {
          animation: slideIn 0.3s ease;
        }
      `}</style>

      {/* Header */}
      <header style={{
        background: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        borderBottom: '2px solid rgba(212, 165, 116, 0.2)',
        padding: '24px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Coffee size={40} color="#d4a574" />
          <div>
            <h1 style={{
              fontFamily: '"Crimson Pro", serif',
              fontSize: '32px',
              fontWeight: 700,
              color: '#f4e4d7',
              letterSpacing: '1px',
            }}>
              The Coffee House
            </h1>
            <p style={{ fontSize: '14px', color: '#b8a090', fontWeight: 300 }}>
              Point of Sale System
            </p>
          </div>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #d4a574, #b8884d)',
          padding: '12px 24px',
          borderRadius: '12px',
          fontFamily: '"Crimson Pro", serif',
          fontSize: '18px',
          fontWeight: 600,
          color: '#1a0f0a',
          boxShadow: '0 4px 12px rgba(212, 165, 116, 0.3)',
        }}>
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
          })}
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav style={{
        display: 'flex',
        gap: '8px',
        padding: '24px 32px 0',
        borderBottom: '1px solid rgba(212, 165, 116, 0.1)',
      }}>
        {[
          { id: 'pos', icon: ShoppingCart, label: 'Point of Sale' },
          { id: 'inventory', icon: Package, label: 'Inventory' },
          { id: 'discounts', icon: DollarSign, label: 'Discount Codes' },
          { id: 'sales', icon: TrendingUp, label: 'Sales History' },
          { id: 'reports', icon: BarChart3, label: 'Reports' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            style={{
              background: activeTab === tab.id 
                ? 'rgba(212, 165, 116, 0.15)' 
                : 'transparent',
              color: activeTab === tab.id ? '#d4a574' : '#b8a090',
              border: 'none',
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '15px',
              fontWeight: activeTab === tab.id ? 600 : 400,
              cursor: 'pointer',
              borderRadius: '8px 8px 0 0',
            }}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main style={{ padding: '32px' }}>
        {activeTab === 'pos' && (
          <POSTab
            products={products}
            cart={cart}
            addToCart={addToCart}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
            calculateTotal={calculateTotal}
            processSale={processSale}
            categories={categories}
            discountCodes={discountCodes}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryTab
            products={products}
            updateProduct={updateProduct}
            addNewProduct={addNewProduct}
          />
        )}

        {activeTab === 'discounts' && (
          <DiscountsTab
            discountCodes={discountCodes}
            addDiscountCode={addDiscountCode}
            updateDiscountCode={updateDiscountCode}
            deleteDiscountCode={deleteDiscountCode}
          />
        )}

        {activeTab === 'sales' && (
          <SalesTab sales={sales} />
        )}

        {activeTab === 'reports' && (
          <ReportsTab sales={sales} products={products} />
        )}
      </main>
    </div>
  );
};

// POS Tab Component
const POSTab = ({ products, cart, addToCart, updateQuantity, removeFromCart, calculateTotal, processSale, categories, discountCodes }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showPayment, setShowPayment] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountError, setDiscountError] = useState('');

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const applyDiscount = () => {
    const code = discountCode.toUpperCase().trim();
    const discount = discountCodes.find(d => d.code === code && d.active);
    
    if (!discount) {
      setDiscountError('Invalid or inactive discount code');
      return;
    }

    const subtotal = calculateTotal();
    let discountAmount = 0;

    if (discount.type === 'percentage') {
      discountAmount = (subtotal * discount.value) / 100;
    } else {
      discountAmount = discount.value;
    }

    // Ensure discount doesn't exceed total
    discountAmount = Math.min(discountAmount, subtotal);

    setAppliedDiscount({
      code: discount.code,
      type: discount.type,
      value: discount.value,
      amount: discountAmount,
    });
    setDiscountError('');
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode('');
    setDiscountError('');
  };

  const handleProcessSale = (paymentMethod) => {
    processSale(paymentMethod, appliedDiscount);
    setAppliedDiscount(null);
    setDiscountCode('');
    setShowPayment(false);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px' }}>
      {/* Products Section */}
      <div>
        {/* Category Filter */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          flexWrap: 'wrap',
        }}>
          {['All', ...categories].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className="btn"
              style={{
                padding: '12px 24px',
                background: selectedCategory === category 
                  ? 'linear-gradient(135deg, #d4a574, #b8884d)'
                  : 'rgba(212, 165, 116, 0.1)',
                color: selectedCategory === category ? '#1a0f0a' : '#d4a574',
                borderRadius: '24px',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '20px',
        }}>
          {filteredProducts.map(product => (
            <div
              key={product.id}
              onClick={() => addToCart(product)}
              className="product-card"
              style={{
                background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.08), rgba(184, 136, 77, 0.05))',
                padding: '20px',
                borderRadius: '16px',
                border: '1px solid rgba(212, 165, 116, 0.2)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>
                {product.image}
              </div>
              <h3 style={{
                fontFamily: '"Crimson Pro", serif',
                fontSize: '18px',
                fontWeight: 600,
                marginBottom: '8px',
                color: '#f4e4d7',
              }}>
                {product.name}
              </h3>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '12px',
              }}>
                <span style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#d4a574',
                }}>
                  ${product.price.toFixed(2)}
                </span>
                <span style={{
                  fontSize: '12px',
                  color: product.stock < 10 ? '#ff6b6b' : '#90b890',
                  fontWeight: 600,
                }}>
                  Stock: {product.stock}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Section */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        border: '2px solid rgba(212, 165, 116, 0.2)',
        padding: '24px',
        height: 'fit-content',
        position: 'sticky',
        top: '140px',
      }}>
        <h2 style={{
          fontFamily: '"Crimson Pro", serif',
          fontSize: '24px',
          fontWeight: 700,
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#d4a574',
        }}>
          <ShoppingCart size={24} />
          Current Order
        </h2>

        {cart.length === 0 ? (
          <p style={{
            textAlign: 'center',
            color: '#b8a090',
            padding: '40px 20px',
            fontSize: '14px',
          }}>
            Cart is empty. Add items to start an order.
          </p>
        ) : (
          <>
            <div style={{
              maxHeight: '300px',
              overflowY: 'auto',
              marginBottom: '20px',
            }}>
              {cart.map(item => (
                <div
                  key={item.id}
                  className="cart-item"
                  style={{
                    background: 'rgba(212, 165, 116, 0.05)',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '12px',
                    border: '1px solid rgba(212, 165, 116, 0.1)',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: '12px',
                  }}>
                    <div>
                      <h4 style={{
                        fontSize: '16px',
                        fontWeight: 600,
                        marginBottom: '4px',
                        color: '#f4e4d7',
                      }}>
                        {item.name}
                      </h4>
                      <p style={{
                        fontSize: '14px',
                        color: '#d4a574',
                        fontWeight: 600,
                      }}>
                        ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="btn"
                      style={{
                        background: 'transparent',
                        color: '#ff6b6b',
                        padding: '4px',
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'rgba(212, 165, 116, 0.1)',
                      borderRadius: '8px',
                      padding: '4px',
                    }}>
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="btn"
                        style={{
                          background: 'rgba(212, 165, 116, 0.2)',
                          color: '#d4a574',
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Minus size={16} />
                      </button>
                      <span style={{
                        fontSize: '16px',
                        fontWeight: 600,
                        minWidth: '32px',
                        textAlign: 'center',
                        color: '#f4e4d7',
                      }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="btn"
                        style={{
                          background: 'rgba(212, 165, 116, 0.2)',
                          color: '#d4a574',
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <span style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#d4a574',
                    }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Discount Code Section */}
            <div style={{
              background: 'rgba(212, 165, 116, 0.05)',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '20px',
              border: '1px solid rgba(212, 165, 116, 0.2)',
            }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#d4a574',
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Discount Code
              </h3>
              {!appliedDiscount ? (
                <>
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginBottom: '8px',
                  }}>
                    <input
                      type="text"
                      placeholder="Enter code"
                      value={discountCode}
                      onChange={(e) => {
                        setDiscountCode(e.target.value.toUpperCase());
                        setDiscountError('');
                      }}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(212, 165, 116, 0.3)',
                        borderRadius: '8px',
                        color: '#f4e4d7',
                        fontSize: '14px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                      }}
                    />
                    <button
                      onClick={applyDiscount}
                      className="btn"
                      style={{
                        padding: '10px 20px',
                        background: 'linear-gradient(135deg, #d4a574, #b8884d)',
                        color: '#1a0f0a',
                        fontSize: '14px',
                        fontWeight: 600,
                        borderRadius: '8px',
                      }}
                    >
                      Apply
                    </button>
                  </div>
                  {discountError && (
                    <p style={{
                      fontSize: '12px',
                      color: '#ff6b6b',
                      marginTop: '4px',
                    }}>
                      {discountError}
                    </p>
                  )}
                </>
              ) : (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(144, 184, 144, 0.1)',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(144, 184, 144, 0.3)',
                }}>
                  <div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#90b890',
                      marginBottom: '4px',
                    }}>
                      {appliedDiscount.code}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#b8a090',
                    }}>
                      {appliedDiscount.type === 'percentage' 
                        ? `${appliedDiscount.value}% off` 
                        : `$${appliedDiscount.value} off`}
                    </div>
                  </div>
                  <button
                    onClick={removeDiscount}
                    className="btn"
                    style={{
                      background: 'transparent',
                      color: '#ff6b6b',
                      padding: '4px',
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>
              )}
            </div>

            <div style={{
              borderTop: '2px solid rgba(212, 165, 116, 0.2)',
              paddingTop: '20px',
            }}>
              {/* Subtotal */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}>
                <span style={{
                  fontSize: '16px',
                  color: '#b8a090',
                  fontWeight: 500,
                }}>
                  Subtotal
                </span>
                <span style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#f4e4d7',
                }}>
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>

              {/* Discount */}
              {appliedDiscount && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}>
                  <span style={{
                    fontSize: '16px',
                    color: '#90b890',
                    fontWeight: 500,
                  }}>
                    Discount
                  </span>
                  <span style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: '#90b890',
                  }}>
                    -${appliedDiscount.amount.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Total */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                paddingTop: '12px',
                borderTop: '1px solid rgba(212, 165, 116, 0.1)',
              }}>
                <span style={{
                  fontFamily: '"Crimson Pro", serif',
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#f4e4d7',
                }}>
                  Total
                </span>
                <span style={{
                  fontFamily: '"Crimson Pro", serif',
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#d4a574',
                }}>
                  ${(calculateTotal() - (appliedDiscount?.amount || 0)).toFixed(2)}
                </span>
              </div>

              {!showPayment ? (
                <button
                  onClick={() => setShowPayment(true)}
                  className="btn"
                  style={{
                    width: '100%',
                    padding: '18px',
                    background: 'linear-gradient(135deg, #d4a574, #b8884d)',
                    color: '#1a0f0a',
                    fontSize: '16px',
                    fontWeight: 700,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <DollarSign size={20} />
                  Proceed to Payment
                </button>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}>
                  {['Cash', 'Card', 'Mobile'].map(method => (
                    <button
                      key={method}
                      onClick={() => handleProcessSale(method)}
                      className="btn"
                      style={{
                        padding: '16px',
                        background: 'rgba(212, 165, 116, 0.15)',
                        color: '#d4a574',
                        fontSize: '15px',
                        fontWeight: 600,
                        borderRadius: '10px',
                        border: '2px solid rgba(212, 165, 116, 0.3)',
                      }}
                    >
                      Pay with {method}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowPayment(false)}
                    className="btn"
                    style={{
                      padding: '12px',
                      background: 'transparent',
                      color: '#b8a090',
                      fontSize: '14px',
                      fontWeight: 500,
                      borderRadius: '8px',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Inventory Tab Component
const InventoryTab = ({ products, updateProduct, addNewProduct }) => {
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    image: '☕',
  });

  const handleAddProduct = async () => {
    if (newProduct.name && newProduct.category && newProduct.price && newProduct.stock) {
      await addNewProduct({
        ...newProduct,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
      });
      setNewProduct({ name: '', category: '', price: '', stock: '', image: '☕' });
      setShowAddForm(false);
    }
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <h2 style={{
          fontFamily: '"Crimson Pro", serif',
          fontSize: '28px',
          fontWeight: 700,
          color: '#d4a574',
        }}>
          Inventory Management
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn"
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #d4a574, #b8884d)',
            color: '#1a0f0a',
            fontSize: '15px',
            fontWeight: 600,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Plus size={18} />
          Add New Product
        </button>
      </div>

      {showAddForm && (
        <div style={{
          background: 'rgba(212, 165, 116, 0.1)',
          padding: '24px',
          borderRadius: '12px',
          marginBottom: '24px',
          border: '2px solid rgba(212, 165, 116, 0.2)',
        }}>
          <h3 style={{
            fontFamily: '"Crimson Pro", serif',
            fontSize: '20px',
            fontWeight: 600,
            marginBottom: '20px',
            color: '#f4e4d7',
          }}>
            Add New Product
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}>
            <input
              type="text"
              placeholder="Product Name"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              style={{
                padding: '12px 16px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(212, 165, 116, 0.3)',
                borderRadius: '8px',
                color: '#f4e4d7',
                fontSize: '15px',
              }}
            />
            <input
              type="text"
              placeholder="Category"
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              style={{
                padding: '12px 16px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(212, 165, 116, 0.3)',
                borderRadius: '8px',
                color: '#f4e4d7',
                fontSize: '15px',
              }}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Price"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              style={{
                padding: '12px 16px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(212, 165, 116, 0.3)',
                borderRadius: '8px',
                color: '#f4e4d7',
                fontSize: '15px',
              }}
            />
            <input
              type="number"
              placeholder="Stock"
              value={newProduct.stock}
              onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
              style={{
                padding: '12px 16px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(212, 165, 116, 0.3)',
                borderRadius: '8px',
                color: '#f4e4d7',
                fontSize: '15px',
              }}
            />
            <input
              type="text"
              placeholder="Emoji Icon"
              value={newProduct.image}
              onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
              style={{
                padding: '12px 16px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(212, 165, 116, 0.3)',
                borderRadius: '8px',
                color: '#f4e4d7',
                fontSize: '15px',
              }}
            />
          </div>
          <div style={{
            display: 'flex',
            gap: '12px',
            marginTop: '16px',
          }}>
            <button
              onClick={handleAddProduct}
              className="btn"
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #d4a574, #b8884d)',
                color: '#1a0f0a',
                fontSize: '15px',
                fontWeight: 600,
                borderRadius: '8px',
              }}
            >
              Add Product
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="btn"
              style={{
                padding: '12px 24px',
                background: 'rgba(212, 165, 116, 0.1)',
                color: '#d4a574',
                fontSize: '15px',
                fontWeight: 600,
                borderRadius: '8px',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '2px solid rgba(212, 165, 116, 0.2)',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{
              background: 'rgba(212, 165, 116, 0.15)',
              borderBottom: '2px solid rgba(212, 165, 116, 0.2)',
            }}>
              <th style={{ padding: '16px', textAlign: 'left', color: '#d4a574', fontWeight: 600 }}>Icon</th>
              <th style={{ padding: '16px', textAlign: 'left', color: '#d4a574', fontWeight: 600 }}>Product</th>
              <th style={{ padding: '16px', textAlign: 'left', color: '#d4a574', fontWeight: 600 }}>Category</th>
              <th style={{ padding: '16px', textAlign: 'left', color: '#d4a574', fontWeight: 600 }}>Price</th>
              <th style={{ padding: '16px', textAlign: 'left', color: '#d4a574', fontWeight: 600 }}>Stock</th>
              <th style={{ padding: '16px', textAlign: 'left', color: '#d4a574', fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                style={{
                  borderBottom: '1px solid rgba(212, 165, 116, 0.1)',
                }}
              >
                <td style={{ padding: '16px', fontSize: '32px' }}>{product.image}</td>
                <td style={{ padding: '16px', color: '#f4e4d7', fontWeight: 500 }}>{product.name}</td>
                <td style={{ padding: '16px', color: '#b8a090' }}>{product.category}</td>
                <td style={{ padding: '16px', color: '#d4a574', fontWeight: 600 }}>${product.price.toFixed(2)}</td>
                <td style={{ padding: '16px' }}>
                  {editingId === product.id ? (
                    <input
                      type="number"
                      value={product.stock}
                      onChange={(e) => updateProduct({ ...product, stock: parseInt(e.target.value) || 0 })}
                      style={{
                        padding: '8px 12px',
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(212, 165, 116, 0.3)',
                        borderRadius: '6px',
                        color: '#f4e4d7',
                        width: '80px',
                      }}
                    />
                  ) : (
                    <span style={{
                      color: product.stock < 10 ? '#ff6b6b' : '#90b890',
                      fontWeight: 600,
                    }}>
                      {product.stock}
                    </span>
                  )}
                </td>
                <td style={{ padding: '16px' }}>
                  <button
                    onClick={() => setEditingId(editingId === product.id ? null : product.id)}
                    className="btn"
                    style={{
                      padding: '8px 16px',
                      background: editingId === product.id 
                        ? 'linear-gradient(135deg, #90b890, #70a870)'
                        : 'rgba(212, 165, 116, 0.2)',
                      color: editingId === product.id ? '#1a0f0a' : '#d4a574',
                      fontSize: '14px',
                      fontWeight: 600,
                      borderRadius: '6px',
                    }}
                  >
                    {editingId === product.id ? 'Save' : 'Edit Stock'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Discounts Tab Component
const DiscountsTab = ({ discountCodes, addDiscountCode, updateDiscountCode, deleteDiscountCode }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDiscount, setNewDiscount] = useState({
    code: '',
    type: 'percentage',
    value: '',
    description: '',
    active: true,
  });

  const handleAddDiscount = async () => {
    if (newDiscount.code && newDiscount.value) {
      await addDiscountCode({
        ...newDiscount,
        code: newDiscount.code.toUpperCase(),
        value: parseFloat(newDiscount.value),
      });
      setNewDiscount({ code: '', type: 'percentage', value: '', description: '', active: true });
      setShowAddForm(false);
    }
  };

  const toggleActive = (discount) => {
    updateDiscountCode({ ...discount, active: !discount.active });
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <h2 style={{
          fontFamily: '"Crimson Pro", serif',
          fontSize: '28px',
          fontWeight: 700,
          color: '#d4a574',
        }}>
          Discount Codes Management
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn"
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #d4a574, #b8884d)',
            color: '#1a0f0a',
            fontSize: '15px',
            fontWeight: 600,
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Plus size={18} />
          Add New Code
        </button>
      </div>

      {showAddForm && (
        <div style={{
          background: 'rgba(212, 165, 116, 0.1)',
          padding: '24px',
          borderRadius: '12px',
          marginBottom: '24px',
          border: '2px solid rgba(212, 165, 116, 0.2)',
        }}>
          <h3 style={{
            fontFamily: '"Crimson Pro", serif',
            fontSize: '20px',
            fontWeight: 600,
            marginBottom: '20px',
            color: '#f4e4d7',
          }}>
            Create New Discount Code
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '16px',
          }}>
            <input
              type="text"
              placeholder="CODE (e.g., SAVE20)"
              value={newDiscount.code}
              onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })}
              style={{
                padding: '12px 16px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(212, 165, 116, 0.3)',
                borderRadius: '8px',
                color: '#f4e4d7',
                fontSize: '15px',
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            />
            <select
              value={newDiscount.type}
              onChange={(e) => setNewDiscount({ ...newDiscount, type: e.target.value })}
              style={{
                padding: '12px 16px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(212, 165, 116, 0.3)',
                borderRadius: '8px',
                color: '#f4e4d7',
                fontSize: '15px',
              }}
            >
              <option value="percentage">Percentage Off</option>
              <option value="fixed">Fixed Amount Off</option>
            </select>
            <input
              type="number"
              step="0.01"
              placeholder={newDiscount.type === 'percentage' ? 'Percentage (e.g., 10)' : 'Amount (e.g., 5.00)'}
              value={newDiscount.value}
              onChange={(e) => setNewDiscount({ ...newDiscount, value: e.target.value })}
              style={{
                padding: '12px 16px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(212, 165, 116, 0.3)',
                borderRadius: '8px',
                color: '#f4e4d7',
                fontSize: '15px',
              }}
            />
          </div>
          <input
            type="text"
            placeholder="Description (optional)"
            value={newDiscount.description}
            onChange={(e) => setNewDiscount({ ...newDiscount, description: e.target.value })}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(212, 165, 116, 0.3)',
              borderRadius: '8px',
              color: '#f4e4d7',
              fontSize: '15px',
              marginBottom: '16px',
            }}
          />
          <div style={{
            display: 'flex',
            gap: '12px',
          }}>
            <button
              onClick={handleAddDiscount}
              className="btn"
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #d4a574, #b8884d)',
                color: '#1a0f0a',
                fontSize: '15px',
                fontWeight: 600,
                borderRadius: '8px',
              }}
            >
              Create Code
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="btn"
              style={{
                padding: '12px 24px',
                background: 'rgba(212, 165, 116, 0.1)',
                color: '#d4a574',
                fontSize: '15px',
                fontWeight: 600,
                borderRadius: '8px',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{
        display: 'grid',
        gap: '16px',
      }}>
        {discountCodes.map((discount) => (
          <div
            key={discount.code}
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '12px',
              padding: '24px',
              border: `2px solid ${discount.active ? 'rgba(144, 184, 144, 0.3)' : 'rgba(212, 165, 116, 0.2)'}`,
              opacity: discount.active ? 1 : 0.6,
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'start',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px',
                }}>
                  <h3 style={{
                    fontFamily: '"Crimson Pro", serif',
                    fontSize: '28px',
                    fontWeight: 700,
                    color: '#d4a574',
                    letterSpacing: '1px',
                  }}>
                    {discount.code}
                  </h3>
                  <span style={{
                    background: discount.active 
                      ? 'rgba(144, 184, 144, 0.2)' 
                      : 'rgba(255, 107, 107, 0.2)',
                    color: discount.active ? '#90b890' : '#ff6b6b',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}>
                    {discount.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  gap: '24px',
                  marginBottom: '12px',
                }}>
                  <div>
                    <div style={{
                      fontSize: '12px',
                      color: '#b8a090',
                      marginBottom: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      Discount Type
                    </div>
                    <div style={{
                      fontSize: '16px',
                      color: '#f4e4d7',
                      fontWeight: 600,
                    }}>
                      {discount.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                    </div>
                  </div>
                  <div>
                    <div style={{
                      fontSize: '12px',
                      color: '#b8a090',
                      marginBottom: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}>
                      Value
                    </div>
                    <div style={{
                      fontSize: '24px',
                      color: '#d4a574',
                      fontWeight: 700,
                    }}>
                      {discount.type === 'percentage' ? `${discount.value}%` : `$${discount.value.toFixed(2)}`}
                    </div>
                  </div>
                </div>
                {discount.description && (
                  <p style={{
                    fontSize: '14px',
                    color: '#b8a090',
                    fontStyle: 'italic',
                  }}>
                    {discount.description}
                  </p>
                )}
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}>
                <button
                  onClick={() => toggleActive(discount)}
                  className="btn"
                  style={{
                    padding: '10px 20px',
                    background: discount.active 
                      ? 'rgba(255, 107, 107, 0.2)' 
                      : 'rgba(144, 184, 144, 0.2)',
                    color: discount.active ? '#ff6b6b' : '#90b890',
                    fontSize: '14px',
                    fontWeight: 600,
                    borderRadius: '8px',
                    border: `1px solid ${discount.active ? 'rgba(255, 107, 107, 0.3)' : 'rgba(144, 184, 144, 0.3)'}`,
                  }}
                >
                  {discount.active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => deleteDiscountCode(discount.code)}
                  className="btn"
                  style={{
                    padding: '10px 20px',
                    background: 'rgba(212, 165, 116, 0.1)',
                    color: '#ff6b6b',
                    fontSize: '14px',
                    fontWeight: 600,
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 107, 107, 0.2)',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Sales Tab Component
const SalesTab = ({ sales }) => {
  return (
    <div>
      <h2 style={{
        fontFamily: '"Crimson Pro", serif',
        fontSize: '28px',
        fontWeight: 700,
        marginBottom: '24px',
        color: '#d4a574',
      }}>
        Sales History
      </h2>

      {sales.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '12px',
          border: '2px solid rgba(212, 165, 116, 0.2)',
        }}>
          <Archive size={48} color="#b8a090" style={{ marginBottom: '16px' }} />
          <p style={{ color: '#b8a090', fontSize: '16px' }}>No sales recorded yet</p>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {sales.map((sale) => (
            <div
              key={sale.id}
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '12px',
                padding: '24px',
                border: '2px solid rgba(212, 165, 116, 0.2)',
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: '16px',
              }}>
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px',
                  }}>
                    <Receipt size={20} color="#d4a574" />
                    <span style={{
                      fontFamily: '"Crimson Pro", serif',
                      fontSize: '20px',
                      fontWeight: 600,
                      color: '#f4e4d7',
                    }}>
                      Order #{sale.id}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    fontSize: '14px',
                    color: '#b8a090',
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} />
                      {sale.date} at {sale.time}
                    </span>
                    <span style={{
                      background: 'rgba(212, 165, 116, 0.15)',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#d4a574',
                    }}>
                      {sale.paymentMethod}
                    </span>
                  </div>
                </div>
                <div style={{
                  fontFamily: '"Crimson Pro", serif',
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#d4a574',
                }}>
                  ${sale.total.toFixed(2)}
                </div>
              </div>

              <div style={{
                borderTop: '1px solid rgba(212, 165, 116, 0.1)',
                paddingTop: '16px',
              }}>
                {sale.items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      fontSize: '15px',
                    }}
                  >
                    <span style={{ color: '#f4e4d7' }}>
                      {item.quantity}x {item.name}
                    </span>
                    <span style={{ color: '#d4a574', fontWeight: 600 }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                
                {/* Discount Info */}
                {sale.discount && (
                  <div style={{
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid rgba(212, 165, 116, 0.1)',
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      fontSize: '15px',
                    }}>
                      <span style={{ color: '#b8a090' }}>
                        Subtotal
                      </span>
                      <span style={{ color: '#f4e4d7', fontWeight: 600 }}>
                        ${sale.subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      fontSize: '15px',
                    }}>
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#90b890',
                      }}>
                        Discount ({sale.discount.code})
                        <span style={{
                          background: 'rgba(144, 184, 144, 0.2)',
                          padding: '2px 8px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: 600,
                        }}>
                          {sale.discount.type === 'percentage' 
                            ? `${sale.discount.value}%` 
                            : `$${sale.discount.value}`}
                        </span>
                      </span>
                      <span style={{ color: '#90b890', fontWeight: 600 }}>
                        -${sale.discount.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Reports Tab Component
const ReportsTab = ({ sales, products }) => {
  const today = new Date().toLocaleDateString();
  const todaySales = sales.filter(sale => sale.date === today);
  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
  const totalOrders = sales.length;
  const averageOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Product sales analysis
  const productSales = {};
  sales.forEach(sale => {
    sale.items.forEach(item => {
      if (!productSales[item.name]) {
        productSales[item.name] = { quantity: 0, revenue: 0 };
      }
      productSales[item.name].quantity += item.quantity;
      productSales[item.name].revenue += item.price * item.quantity;
    });
  });

  const topProducts = Object.entries(productSales)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5);

  const lowStockProducts = products.filter(p => p.stock < 20);

  return (
    <div>
      <h2 style={{
        fontFamily: '"Crimson Pro", serif',
        fontSize: '28px',
        fontWeight: 700,
        marginBottom: '24px',
        color: '#d4a574',
      }}>
        Business Reports
      </h2>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '32px',
      }}>
        {[
          { label: "Today's Revenue", value: `$${todayRevenue.toFixed(2)}`, icon: DollarSign, color: '#90b890' },
          { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: TrendingUp, color: '#d4a574' },
          { label: "Total Orders", value: totalOrders, icon: Receipt, color: '#b8884d' },
          { label: "Average Order", value: `$${averageOrder.toFixed(2)}`, icon: BarChart3, color: '#c9a66b' },
        ].map((stat, idx) => (
          <div
            key={idx}
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '24px',
              borderRadius: '12px',
              border: `2px solid ${stat.color}40`,
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px',
            }}>
              <stat.icon size={24} color={stat.color} />
              <h3 style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#b8a090',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {stat.label}
              </h3>
            </div>
            <p style={{
              fontFamily: '"Crimson Pro", serif',
              fontSize: '32px',
              fontWeight: 700,
              color: stat.color,
            }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Top Products */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        border: '2px solid rgba(212, 165, 116, 0.2)',
      }}>
        <h3 style={{
          fontFamily: '"Crimson Pro", serif',
          fontSize: '22px',
          fontWeight: 700,
          marginBottom: '20px',
          color: '#d4a574',
        }}>
          Top Selling Products
        </h3>
        {topProducts.length > 0 ? (
          topProducts.map(([name, data], idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                background: 'rgba(212, 165, 116, 0.05)',
                borderRadius: '8px',
                marginBottom: '12px',
                border: '1px solid rgba(212, 165, 116, 0.1)',
              }}
            >
              <div>
                <span style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#f4e4d7',
                }}>
                  {idx + 1}. {name}
                </span>
                <span style={{
                  fontSize: '14px',
                  color: '#b8a090',
                  marginLeft: '12px',
                }}>
                  {data.quantity} sold
                </span>
              </div>
              <span style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#d4a574',
              }}>
                ${data.revenue.toFixed(2)}
              </span>
            </div>
          ))
        ) : (
          <p style={{ color: '#b8a090', textAlign: 'center', padding: '20px' }}>
            No sales data available
          </p>
        )}
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div style={{
          background: 'rgba(255, 107, 107, 0.1)',
          borderRadius: '12px',
          padding: '24px',
          border: '2px solid rgba(255, 107, 107, 0.3)',
        }}>
          <h3 style={{
            fontFamily: '"Crimson Pro", serif',
            fontSize: '22px',
            fontWeight: 700,
            marginBottom: '20px',
            color: '#ff6b6b',
          }}>
            Low Stock Alert
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '12px',
          }}>
            {lowStockProducts.map(product => (
              <div
                key={product.id}
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 107, 107, 0.3)',
                }}
              >
                <div style={{
                  fontSize: '32px',
                  marginBottom: '8px',
                  textAlign: 'center',
                }}>
                  {product.image}
                </div>
                <h4 style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#f4e4d7',
                  marginBottom: '4px',
                  textAlign: 'center',
                }}>
                  {product.name}
                </h4>
                <p style={{
                  fontSize: '14px',
                  color: '#ff6b6b',
                  fontWeight: 600,
                  textAlign: 'center',
                }}>
                  Only {product.stock} left
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CoffeeShopPOS;
