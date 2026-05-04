import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../api/api';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [phone_number, setPhoneNumber] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await signup(username, password, role, phone_number);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data || 'Signup failed. Please try again.');
    }
  };

  return (
    <div className="dashboard-layout" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div className="glass-panel" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Create Account</h2>
        {error && <div className="badge badge-danger" style={{ marginBottom: '16px', display: 'block', textAlign: 'center', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid #ef4444' }}>{error}</div>}
        {success && <div className="badge badge-success" style={{ marginBottom: '16px', display: 'block', textAlign: 'center' }}>Account created! Redirecting to login...</div>}
        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
              placeholder="Choose a username"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="Choose a password"
            />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input 
              type="text" 
              value={phone_number} 
              onChange={(e) => setPhoneNumber(e.target.value)} 
              required 
              placeholder="Enter your phone number"
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} required>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Sign Up
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)' }}>Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
