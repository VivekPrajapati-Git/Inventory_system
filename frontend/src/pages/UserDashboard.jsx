import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, Upload, LogOut, History, ChevronLeft, X, ShoppingCart, Trash2, CheckCircle, Search, ChevronDown } from 'lucide-react';
import { getStocks, uploadImage, logSale, logSalesBulk, logout, getSales } from '../api/api';

import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState('');
  const [quantity, setQuantity] = useState('');
  const [imageSrc, setImageSrc] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('new-sale');
  const [sales, setSales] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [fullSizeImage, setFullSizeImage] = useState(null);
  const [amount,setamount] = useState(0) 
  const [salesQueue, setSalesQueue] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const filteredStocks = stocks.filter(stock => 
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const selectedStockItem = stocks.find(s => s.name === selectedStock);
  const availableQty = selectedStockItem ? selectedStockItem.quantity : 0;
  const isQuantityInvalid = quantity > availableQty || quantity <= 0;
  
  const webcamRef = useRef(null);
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  useEffect(() => {
    fetchStocks();
    fetchSales();
  }, []);

  useEffect(() => {
    if (selectedStockItem && quantity) {
      setamount(selectedStockItem.price * Number(quantity));
    } else {
      setamount(0);
    }
  }, [selectedStock, quantity, stocks]);

  // Handle keyboard shortcut for Enter
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        // If focusing on quantity input, add to queue
        if (document.activeElement.tagName === 'INPUT' && document.activeElement.type === 'number') {
          // No need to do anything here as the form onSubmit will handle it
          return;
        }
        
        // If queue is not empty and no inputs focused, maybe submit queue?
        // But let's keep it simple: if Shift+Enter, submit queue
        if (e.shiftKey && salesQueue.length > 0) {
          handleSubmitQueue();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [salesQueue]);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSales = async () => {
    try {
      const data = await getSales();
      setSales(data);
    } catch (error) {
      console.error("Failed to fetch sales:", error);
    }
  };

  const fetchStocks = async () => {
    const data = await getStocks();
    setStocks(data);
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImageSrc(imageSrc);
  }, [webcamRef]);

  // Convert base64 to File
  const dataURLtoFile = (dataurl, filename) => {
    let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
  }

  const handleAddToQueue = async (e) => {
    if (e) e.preventDefault();
    if (!imageSrc || !selectedStock || !quantity) {
      setMessage('Please fill all fields and capture an image.');
      return;
    }

    if (Number(quantity) > availableQty) {
      setMessage(`Cannot sell more than available quantity (${availableQty})`);
      return;
    }

    const stockItem = stocks.find(s => s.name === selectedStock);
    
    // Add to local queue
    const newItem = {
      id: Date.now(),
      item: selectedStock,
      quantity: Number(quantity),
      price: stockItem ? stockItem.price : 0,
      imageSrc: imageSrc, // Store base64 for preview
      total: amount
    };

    setSalesQueue([...salesQueue, newItem]);
    
    // Reset form for next item
    setImageSrc(null);
    setSelectedStock('');
    setQuantity('');
    setMessage('');
  };

  const removeFromQueue = (id) => {
    setSalesQueue(salesQueue.filter(item => item.id !== id));
  };

  const handleSubmitQueue = async () => {
    if (salesQueue.length === 0) return;

    setIsUploading(true);
    setMessage('');

    try {
      const processedSales = [];
      
      for (const item of salesQueue) {
        // Upload image first
        const file = dataURLtoFile(item.imageSrc, `sale_${item.id}.jpg`);
        const uploadRes = await uploadImage(file);
        
        processedSales.push({
          item: item.item,
          quantity: item.quantity,
          price: item.price,
          imageUrl: uploadRes.url
        });
      }

      await logSalesBulk({
        username: username,
        sales: processedSales
      });

      setMessage(`${salesQueue.length} sales logged successfully!`);
      setSalesQueue([]);
      fetchStocks();
      fetchSales();
    } catch (err) {
      setMessage('Failed to log sales. Error: ' + (err.response?.data || err.message));
    } finally {
      setIsUploading(false);
    }
  };


  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-layout animate-fade-in">
      <div className="glass-nav" style={{ marginBottom: '32px', borderRadius: '16px' }}>
        <div className="logo">Inventory User</div>
        <div className="nav-links">
          <span style={{ color: 'var(--text-secondary)' }}>Welcome, {username}</span>
          <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '8px 12px' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: '24px', gap: '8px' }}>
        <button 
          className={`tab ${activeTab === 'new-sale' ? 'active' : ''}`}
          onClick={() => setActiveTab('new-sale')}
        >
          <Camera size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }}/>
          New Sale
        </button>
        <button 
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <History size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }}/>
          My Sales History
        </button>
      </div>

      {activeTab === 'new-sale' && (
        <div className="grid-2">
        <div className="glass-panel">
          <h3><Camera size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }}/> Capture Item Photo</h3>
          {imageSrc ? (
            <div style={{ position: 'relative' }}>
              <img src={imageSrc} alt="captured" style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--glass-border)' }} />
              <button 
                onClick={() => setImageSrc(null)} 
                className="btn btn-outline" 
                style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)' }}
              >
                Retake
              </button>
            </div>
          ) : (
            <div>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width="100%"
                videoConstraints={{ facingMode: "environment" }}
                style={{ borderRadius: '8px', border: '1px solid var(--glass-border)' }}
              />
              <button onClick={capture} className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>
                Capture Photo
              </button>
            </div>
          )}
        </div>

        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}><Upload size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }}/> Log Sale</h3>
            {salesQueue.length > 0 && (
              <span className="badge badge-success" style={{ padding: '4px 8px', borderRadius: '20px' }}>
                {salesQueue.length} items in queue
              </span>
            )}
          </div>

          {message && (
            <div className={`badge ${message.includes('success') ? 'badge-success' : 'badge-danger'}`} style={{ marginBottom: '16px', display: 'block', textAlign: 'center', padding: '12px' }}>
              {message}
            </div>
          )}
          <form onSubmit={handleAddToQueue}>
            <div className="form-group" style={{ position: 'relative' }} ref={dropdownRef}>
              <label>Select Item</label>
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{ 
                  width: '100%', 
                  padding: '12px 16px', 
                  borderRadius: '8px', 
                  background: 'rgba(0, 0, 0, 0.2)', 
                  border: '1px solid var(--glass-border)',
                  color: selectedStock ? 'var(--text-primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.3s ease',
                  borderColor: isDropdownOpen ? 'var(--primary-color)' : 'var(--glass-border)',
                  boxShadow: isDropdownOpen ? '0 0 0 3px var(--primary-glow)' : 'none'
                }}
              >
                <span>{selectedStock || '-- Choose Item --'}</span>
                <ChevronDown size={18} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
              </div>

              {isDropdownOpen && (
                <div style={{ 
                  position: 'absolute', 
                  top: 'calc(100% + 8px)', 
                  left: 0, 
                  right: 0, 
                  background: 'var(--glass-bg)', 
                  backdropFilter: 'blur(20px)', 
                  border: '1px solid var(--glass-border)', 
                  borderRadius: '12px', 
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)', 
                  zIndex: 100,
                  overflow: 'hidden',
                  animation: 'fade-in 0.2s ease'
                }}>
                  <div style={{ padding: '12px', borderBottom: '1px solid var(--glass-border)' }}>
                    <div style={{ position: 'relative' }}>
                      <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        autoFocus
                        type="text" 
                        placeholder="Search items..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ 
                          padding: '8px 8px 8px 34px', 
                          fontSize: '0.9rem',
                          background: 'rgba(255,255,255,0.05)'
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ maxHeight: '250px', overflowY: 'auto', padding: '4px' }}>
                    {filteredStocks.length > 0 ? (
                      filteredStocks.map(stock => (
                        <div 
                          key={stock.id} 
                          onClick={() => {
                            setSelectedStock(stock.name);
                            setIsDropdownOpen(false);
                            setSearchTerm('');
                          }}
                          style={{ 
                            padding: '10px 12px', 
                            borderRadius: '6px', 
                            cursor: 'pointer',
                            transition: 'background 0.2s ease',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: selectedStock === stock.name ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: '500', color: selectedStock === stock.name ? 'var(--primary-color)' : 'var(--text-primary)' }}>{stock.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avail: {stock.quantity}</div>
                          </div>
                          <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{stock.price} Rs.</div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        No items found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label>Quantity Sold {selectedStock && <small style={{ color: 'var(--text-muted)' }}>(Available: {availableQty})</small>}</label>
              <input 
                type="number" 
                min="1" 
                max={availableQty}
                value={quantity} 
                onChange={(e) => setQuantity(e.target.value)} 
                required 
                placeholder="Enter quantity"
                style={{ 
                  borderColor: (quantity > availableQty) ? 'var(--danger-color)' : '',
                  boxShadow: (quantity > availableQty) ? '0 0 0 3px rgba(239, 68, 68, 0.2)' : ''
                }}
              />
              <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '8px', border: '1px solid rgba(34, 197, 94, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem' }}>Item Total:</span>
                <strong style={{ fontSize: '1.2rem', color: '#4ade80' }}>{amount.toFixed(2)} Rs.</strong>
              </div>
              {quantity > availableQty && (
                <span style={{ color: 'var(--danger-color)', fontSize: '0.8rem', marginTop: '4px' }}>
                  Quantity exceeds available stock!
                </span>
              )}
            </div>
            
            <button 
              type="submit" 
              className="btn btn-outline" 
              style={{ width: '100%', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              disabled={isQuantityInvalid || !selectedStock || !imageSrc}
            >
              <ShoppingCart size={18} /> Add to Queue (Enter)
            </button>
          </form>

          {salesQueue.length > 0 && (
            <div style={{ marginTop: '32px', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
              <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingCart size={18} /> Current Queue
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHieght: '300px', overflowY: 'auto', paddingRight: '4px' }}>
                {salesQueue.map(item => (
                  <div key={item.id} className="glass-panel" style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src={item.imageSrc} alt="item" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{item.item}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Qty: {item.quantity} × {item.price} Rs.
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '600', color: '#4ade80' }}>{item.total.toFixed(2)}</div>
                      <button 
                        onClick={() => removeFromQueue(item.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', padding: '4px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span>Total Amount:</span>
                  <strong style={{ fontSize: '1.3rem', color: '#60a5fa' }}>
                    {salesQueue.reduce((sum, item) => sum + item.total, 0).toFixed(2)} Rs.
                  </strong>
                </div>
                <button 
                  onClick={handleSubmitQueue}
                  className="btn btn-primary"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  disabled={isUploading}
                >
                  {isUploading ? 'Processing...' : (
                    <>
                      <CheckCircle size={18} /> Finish Sale (Shift+Enter)
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        </div>
      )}

      {activeTab === 'history' && (
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ margin: 0 }}>My Sales History</h3>
            <div className="form-group" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ margin: 0, whiteSpace: 'nowrap' }}>Select Date:</label>
              <input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
              />
            </div>
          </div>

          {(() => {
            const userDateSales = sales.filter(sale => sale.username === username && sale.date === selectedDate);
            const totalAmount = userDateSales.reduce((sum, sale) => sum + (sale.price * sale.quantity), 0);

            if (userDateSales.length === 0) {
              return <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No sales recorded for this date.</p>;
            }

            return (
              <div>
                <div style={{ marginBottom: '20px', padding: '16px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '12px', border: '1px solid rgba(34, 197, 94, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Total sales for today:</span>
                  <strong style={{ fontSize: '1.4rem', color: '#4ade80' }}>{totalAmount.toFixed(2)} Rs.</strong>
                </div>
                <div className="grid-3">
                  {userDateSales.map(sale => (
                    <div key={sale.id} className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <img 
                        src={sale.imageUrl} 
                        alt="Sale Item" 
                        style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer' }} 
                        onClick={() => setFullSizeImage(sale.imageUrl)}
                      />
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h4 style={{ margin: 0 }}>{sale.item}</h4>
                          <span className="badge badge-success">{(sale.price * sale.quantity).toFixed(2)} Rs.</span>
                        </div>
                        <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                          Price: {sale.price} Rs. | Qty: {sale.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {fullSizeImage && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100vw', 
            height: '100vh', 
            background: 'rgba(0,0,0,0.85)', 
            zIndex: 1000, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
            animation: 'fade-in 0.3s ease'
          }}
          onClick={() => setFullSizeImage(null)}
        >
          <button 
            style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', zIndex: 1001 }}
            onClick={(e) => { e.stopPropagation(); setFullSizeImage(null); }}
          >
            <X size={40} />
          </button>
          <img 
            src={fullSizeImage} 
            alt="Full Size" 
            style={{ maxWidth: '90%', maxHeight: '90%', borderRadius: '12px', boxShadow: '0 0 50px rgba(0,0,0,0.5)', objectFit: 'contain' }} 
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
