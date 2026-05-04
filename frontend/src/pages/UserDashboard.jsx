import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, Upload, LogOut } from 'lucide-react';
import { getStocks, uploadImage, logSale, logout } from '../api/api';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const [stocks, setStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState('');
  const [quantity, setQuantity] = useState('');
  const [imageSrc, setImageSrc] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  
  const selectedStockItem = stocks.find(s => s.name === selectedStock);
  const availableQty = selectedStockItem ? selectedStockItem.quantity : 0;
  const isQuantityInvalid = quantity > availableQty || quantity <= 0;
  
  const webcamRef = useRef(null);
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  useEffect(() => {
    fetchStocks();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageSrc || !selectedStock || !quantity) {
      setMessage('Please fill all fields and capture an image.');
      return;
    }

    if (Number(quantity) > availableQty) {
      setMessage(`Cannot sell more than available quantity (${availableQty})`);
      return;
    }

    setIsUploading(true);
    setMessage('');

    try {
      const file = dataURLtoFile(imageSrc, 'sale_image.jpg');
      
      // Upload to real backend
      const uploadRes = await uploadImage(file);
      const imageUrl = uploadRes.url;

      const stockItem = stocks.find(s => s.name === selectedStock);

      // Log sale to mock backend
      await logSale({
        username: username,
        item: selectedStock,
        quantity: Number(quantity),
        price: stockItem ? stockItem.price : 0,
        imageUrl: imageUrl
      });

      setMessage('Sale logged successfully!');
      setImageSrc(null);
      setSelectedStock('');
      setQuantity('');
      fetchStocks(); // Refresh stock count
    } catch (err) {
      setMessage('Failed to log sale. Error: ' + (err.response?.data || err.message));
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
          <h3><Upload size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }}/> Log Sale</h3>
          {message && (
            <div className={`badge ${message.includes('success') ? 'badge-success' : 'badge-danger'}`} style={{ marginBottom: '16px', display: 'block', textAlign: 'center', padding: '12px' }}>
              {message}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Select Item</label>
              <select value={selectedStock} onChange={(e) => setSelectedStock(e.target.value)} required>
                <option value="">-- Choose Item --</option>
                {stocks.map(stock => (
                  <option key={stock.id} value={stock.name}>
                    {stock.name} (Avail: {stock.quantity}) - ${stock.price}
                  </option>
                ))}
              </select>
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
              {quantity > availableQty && (
                <span style={{ color: 'var(--danger-color)', fontSize: '0.8rem', marginTop: '4px' }}>
                  Quantity exceeds available stock!
                </span>
              )}
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '16px' }}
              disabled={isUploading || isQuantityInvalid}
            >
              {isUploading ? 'Uploading & Logging...' : 'Submit Sale'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
