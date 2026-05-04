import { useState, useEffect } from 'react';
import { LogOut, PackageSearch, History, Plus, List, Edit, UserPlus, Search } from 'lucide-react';
import { getStocks, addStock, updateStock, getSales, logout, signup } from '../api/api';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('all-stocks');
  const [stocks, setStocks] = useState([]);
  const [sales, setSales] = useState([]);
  
  // Add Stock Form State
  const [newStockName, setNewStockName] = useState('');
  const [newStockQuantity, setNewStockQuantity] = useState('');
  const [newStockPrice, setNewStockPrice] = useState('');

  // Update Stock State
  const [searchTerm, setSearchTerm] = useState('');

  // Add User Form State
  const [newUsername, setNewUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const stockData = await getStocks();
      const salesData = await getSales();
      setStocks(stockData);
      // Sort sales newest first
      setSales(salesData.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    if (!newStockName || !newStockQuantity || !newStockPrice) return;
    
    try {
      await addStock({
        name: newStockName,
        quantity: Number(newStockQuantity),
        price: Number(newStockPrice)
      });
      
      setNewStockName('');
      setNewStockQuantity('');
      setNewStockPrice('');
      fetchData();
      alert('Stock added successfully!');
    } catch (error) {
      alert('Failed to add stock.');
    }
  };

  const handleUpdateStockQuantity = async (id, currentQty) => {
    const additionalQty = window.prompt(`Enter amount to ADD to stock (current: ${currentQty}):`, "0");
    if (additionalQty && !isNaN(additionalQty)) {
      try {
        await updateStock(id, Number(additionalQty));
        fetchData();
      } catch (error) {
        alert('Failed to update stock quantity.');
      }
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUsername || !newUserPassword) return;
    
    try {
      await signup(newUsername, newUserPassword, newUserRole);
      alert('User created successfully!');
      setNewUsername('');
      setNewUserPassword('');
      setNewUserRole('user');
    } catch (err) {
      alert('Failed to create user. It might already exist.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredStocks = stocks.filter(stock => 
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-layout animate-fade-in">
      <div className="glass-nav" style={{ marginBottom: '32px', borderRadius: '16px' }}>
        <div className="logo">Admin Portal</div>
        <div className="nav-links">
          <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '8px 12px' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      <div className="tabs" style={{ flexWrap: 'wrap', gap: '8px' }}>
        <button 
          className={`tab ${activeTab === 'all-stocks' ? 'active' : ''}`}
          onClick={() => setActiveTab('all-stocks')}
        >
          <List size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }}/>
          All Stocks
        </button>
        <button 
          className={`tab ${activeTab === 'add-stock' ? 'active' : ''}`}
          onClick={() => setActiveTab('add-stock')}
        >
          <Plus size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }}/>
          Add Stock
        </button>
        <button 
          className={`tab ${activeTab === 'update-stock' ? 'active' : ''}`}
          onClick={() => setActiveTab('update-stock')}
        >
          <Edit size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }}/>
          Update Stock
        </button>
        <button 
          className={`tab ${activeTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          <History size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }}/>
          Sales Log
        </button>
        <button 
          className={`tab ${activeTab === 'add-user' ? 'active' : ''}`}
          onClick={() => setActiveTab('add-user')}
        >
          <UserPlus size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }}/>
          Add User
        </button>
      </div>

      {activeTab === 'all-stocks' && (
        <div className="glass-panel">
          <h3>All Stocks in Inventory</h3>
          {stocks.length === 0 ? (
            <p>No stock available.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Qty</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map(stock => (
                    <tr key={stock.id}>
                      <td style={{ fontWeight: 500 }}>{stock.name}</td>
                      <td>
                        <span className={`badge ${stock.quantity > 5 ? 'badge-success' : 'badge-danger'}`} style={{ background: stock.quantity > 5 ? '' : 'rgba(239, 68, 68, 0.2)'}}>
                          {stock.quantity}
                        </span>
                      </td>
                      <td>{stock.price} /-</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'add-stock' && (
        <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h3><Plus size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }}/> Add New Stock</h3>
          <form onSubmit={handleAddStock}>
            <div className="form-group">
              <label>Item Name</label>
              <input type="text" value={newStockName} onChange={e => setNewStockName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Initial Quantity</label>
              <input type="number" min="1" value={newStockQuantity} onChange={e => setNewStockQuantity(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Price Per Unit</label>
              <input type="number" min="0" step="0.01" value={newStockPrice} onChange={e => setNewStockPrice(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Add to Inventory</button>
          </form>
        </div>
      )}

      {activeTab === 'update-stock' && (
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Update Stock Quantity</h3>
            <div className="search-container" style={{ position: 'relative', width: '250px' }}>
              <Search size={18} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search stocks..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
              />
            </div>
          </div>
          
          {filteredStocks.length === 0 ? (
            <p>No stocks found matching your search.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Qty</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStocks.map(stock => (
                    <tr key={stock.id}>
                      <td style={{ fontWeight: 500 }}>{stock.name}</td>
                      <td>
                        <span className={`badge ${stock.quantity > 5 ? 'badge-success' : 'badge-danger'}`} style={{ background: stock.quantity > 5 ? '' : 'rgba(239, 68, 68, 0.2)'}}>
                          {stock.quantity}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => handleUpdateStockQuantity(stock.id, stock.quantity)} className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.8rem' }}>
                          Update Qty
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'sales' && (
        <div className="glass-panel">
          <h3>Recent Sales Activity</h3>
          {sales.length === 0 ? (
            <p>No sales have been logged yet.</p>
          ) : (
            <div className="grid-3">
              {sales.map(sale => (
                <div key={sale.id} className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <img src={sale.imageUrl} alt="Sale Item" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0 }}>{sale.item}</h4>
                      <span className="badge badge-success">${sale.price * sale.quantity}</span>
                    </div>
                    <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem' }}>
                      Sold by: <strong style={{ color: 'var(--primary-color)'}}>{sale.username}</strong>
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Quantity: {sale.quantity} | {new Date(sale.date).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'add-user' && (
        <div className="glass-panel" style={{ maxWidth: '400px', margin: '0 auto' }}>
          <h3><UserPlus size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }}/> Register New User</h3>
          <form onSubmit={handleAddUser}>
            <div className="form-group">
              <label>Username</label>
              <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select 
                value={newUserRole} 
                onChange={e => setNewUserRole(e.target.value)} 
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
              >
                <option value="user" style={{ color: 'black' }}>Standard User</option>
                <option value="admin" style={{ color: 'black' }}>Administrator</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>Create User</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
