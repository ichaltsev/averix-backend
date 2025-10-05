import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, TrendingDown, DollarSign, Clock, Shield, Star,
  User, LogOut, BarChart3, Coins, Target, Award,
  ChevronRight, Plus, Minus, RefreshCw, Activity
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const LOGO_URL = "https://customer-assets.emergentagent.com/job_62c52c18-ca22-473e-892a-e02535fe36c2/artifacts/dtudqm3z_logo.png";

const Dashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [instruments, setInstruments] = useState([]);
  const [stakes, setStakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tradeForm, setTradeForm] = useState({
    symbol: 'BTC/USDT',
    side: 'buy',
    amount: '',
    price: '',
    stop_loss: '',
    take_profit: ''
  });
  const [stakeForm, setStakeForm] = useState({
    amount: '',
    duration_days: 30
  });

  useEffect(() => {
    fetchDashboardData();
    fetchInstruments();
    fetchStakes();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API}/user/dashboard`);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const fetchInstruments = async () => {
    try {
      const response = await axios.get(`${API}/trading/instruments`);
      setInstruments(response.data.instruments);
    } catch (error) {
      console.error('Failed to fetch instruments:', error);
    }
    setLoading(false);
  };

  const fetchStakes = async () => {
    try {
      const response = await axios.get(`${API}/staking/stakes`);
      setStakes(response.data.stakes);
    } catch (error) {
      console.error('Failed to fetch stakes:', error);
    }
  };

  const handleTrade = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/trading/place-order`, tradeForm);
      setTradeForm({
        symbol: 'BTC/USDT',
        side: 'buy',
        amount: '',
        price: '',
        stop_loss: '',
        take_profit: ''
      });
      fetchDashboardData();
      alert('Trade placed successfully!');
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to place trade');
    }
  };

  const handleStake = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/staking/stake`, stakeForm);
      setStakeForm({ amount: '', duration_days: 30 });
      fetchDashboardData();
      fetchStakes();
      alert('Staking successful!');
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to stake');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getLevelColor = (level) => {
    const colors = {
      Bronze: '#CD7F32',
      Silver: '#C0C0C0',
      Gold: '#FFD700',
      Prime: '#2EE6D6'
    };
    return colors[level] || '#2EE6D6';
  };

  const getSuccessRate = () => {
    if (!user.total_trades || user.total_trades === 0) return 0;
    return Math.round((user.successful_trades / user.total_trades) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#081F2C] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#2EE6D6]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#081F2C] text-white">
      {/* Header */}
      <header className="border-b border-[#2EE6D6]/20 glass-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3">
              <img src={LOGO_URL} alt="Averix" className="h-10 w-10" />
              <span className="text-xl font-bold font-['Space_Grotesk'] gradient-text">Averix</span>
            </Link>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getLevelColor(user.trading_level) }}
                ></div>
                <span className="text-sm font-medium">{user.trading_level}</span>
              </div>
              
              <div className="flex items-center space-x-4 text-sm">
                <span className="flex items-center">
                  <Coins className="w-4 h-4 mr-1 text-[#2EE6D6]" />
                  {user.tft_balance?.toFixed(2)} TFT
                </span>
              </div>
              
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
                data-testid="logout-btn"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-['Space_Grotesk'] mb-2">
            Welcome back, {user.first_name}!
          </h1>
          <p className="text-white/70">Manage your trading portfolio and staking rewards</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="crypto-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm mb-1">TFT Balance</p>
                <p className="text-2xl font-bold gradient-text">{user.tft_balance?.toFixed(2)}</p>
              </div>
              <DollarSign className="text-[#2EE6D6]" size={32} />
            </div>
          </div>
          
          <div className="crypto-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm mb-1">Staked Amount</p>
                <p className="text-2xl font-bold gradient-text">{dashboardData?.total_staked?.toFixed(2) || '0.00'}</p>
              </div>
              <Shield className="text-[#A4F4F9]" size={32} />
            </div>
          </div>
          
          <div className="crypto-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm mb-1">Total Trades</p>
                <p className="text-2xl font-bold gradient-text">{user.total_trades || 0}</p>
              </div>
              <BarChart3 className="text-[#2EE6D6]" size={32} />
            </div>
          </div>
          
          <div className="crypto-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm mb-1">Success Rate</p>
                <p className="text-2xl font-bold gradient-text">{getSuccessRate()}%</p>
              </div>
              <Target className="text-[#A4F4F9]" size={32} />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8 glass rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'trading', label: 'Trading', icon: TrendingUp },
            { id: 'staking', label: 'Staking', icon: Shield },
            { id: 'history', label: 'History', icon: Clock }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-[#2EE6D6] text-[#081F2C]'
                    : 'text-white/70 hover:text-white hover:bg-[#2EE6D6]/10'
                }`}
                data-testid={`${tab.id}-tab`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* Recent Trades */}
              <div className="crypto-card">
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <Activity className="mr-3 text-[#2EE6D6]" size={24} />
                  Recent Activity
                </h3>
                {dashboardData?.recent_trades?.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recent_trades.slice(0, 5).map((trade, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-[#2EE6D6]/5 rounded-lg">
                        <div className="flex items-center space-x-4">
                          {trade.pnl >= 0 ? (
                            <TrendingUp className="text-green-400" size={20} />
                          ) : (
                            <TrendingDown className="text-red-400" size={20} />
                          )}
                          <div>
                            <p className="font-medium">{trade.symbol}</p>
                            <p className="text-sm text-white/60">{formatDate(trade.created_at)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)} TFT
                          </p>
                          <p className="text-sm text-white/60 capitalize">{trade.side}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/60 text-center py-8">No trades yet. Start trading to see your activity!</p>
                )}
              </div>
              
              {/* Market Overview */}
              <div className="crypto-card">
                <h3 className="text-xl font-bold mb-6 flex items-center">
                  <BarChart3 className="mr-3 text-[#2EE6D6]" size={24} />
                  Market Overview
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {instruments.map((instrument) => (
                    <div key={instrument.symbol} className="p-4 bg-[#2EE6D6]/5 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{instrument.symbol}</span>
                        <span className={`text-sm ${instrument.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {instrument.change >= 0 ? '+' : ''}{instrument.change}%
                        </span>
                      </div>
                      <p className="text-2xl font-bold gradient-text">${instrument.price.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-8">
              {/* Quick Actions */}
              <div className="crypto-card">
                <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => setActiveTab('trading')}
                    className="w-full btn-primary flex items-center justify-between"
                    data-testid="quick-trade-btn"
                  >
                    <span>Start Trading</span>
                    <ChevronRight size={18} />
                  </button>
                  <button 
                    onClick={() => setActiveTab('staking')}
                    className="w-full btn-secondary flex items-center justify-between"
                    data-testid="quick-stake-btn"
                  >
                    <span>Stake Tokens</span>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
              
              {/* Trading Level */}
              <div className="crypto-card">
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <Star className="mr-2 text-[#2EE6D6]" size={20} />
                  Trading Level
                </h3>
                <div className="text-center">
                  <div 
                    className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-xl font-bold"
                    style={{ backgroundColor: getLevelColor(user.trading_level) }}
                  >
                    {user.trading_level.charAt(0)}
                  </div>
                  <p className="text-lg font-semibold mb-1">{user.trading_level}</p>
                  <p className="text-sm text-white/60">Continue trading to level up</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trading' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Trading Form */}
            <div className="crypto-card">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <TrendingUp className="mr-3 text-[#2EE6D6]" size={24} />
                Place Order
              </h3>
              
              <form onSubmit={handleTrade} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Instrument</label>
                    <select
                      value={tradeForm.symbol}
                      onChange={(e) => setTradeForm({...tradeForm, symbol: e.target.value})}
                      className="form-input"
                      data-testid="symbol-select"
                    >
                      {instruments.map(instrument => (
                        <option key={instrument.symbol} value={instrument.symbol}>
                          {instrument.symbol}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Side</label>
                    <select
                      value={tradeForm.side}
                      onChange={(e) => setTradeForm({...tradeForm, side: e.target.value})}
                      className="form-input"
                      data-testid="side-select"
                    >
                      <option value="buy">Buy</option>
                      <option value="sell">Sell</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Amount (TFT)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={tradeForm.amount}
                      onChange={(e) => setTradeForm({...tradeForm, amount: e.target.value})}
                      className="form-input"
                      placeholder="0.00"
                      required
                      data-testid="amount-input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={tradeForm.price}
                      onChange={(e) => setTradeForm({...tradeForm, price: e.target.value})}
                      className="form-input"
                      placeholder="0.00"
                      required
                      data-testid="price-input"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Stop Loss</label>
                    <input
                      type="number"
                      step="0.01"
                      value={tradeForm.stop_loss}
                      onChange={(e) => setTradeForm({...tradeForm, stop_loss: e.target.value})}
                      className="form-input"
                      placeholder="0.00"
                      required
                      data-testid="stop-loss-input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Take Profit</label>
                    <input
                      type="number"
                      step="0.01"
                      value={tradeForm.take_profit}
                      onChange={(e) => setTradeForm({...tradeForm, take_profit: e.target.value})}
                      className="form-input"
                      placeholder="0.00"
                      required
                      data-testid="take-profit-input"
                    />
                  </div>
                </div>
                
                <button type="submit" className="w-full btn-primary" data-testid="place-order-btn">
                  Place Order
                </button>
              </form>
              
              <div className="mt-6 p-4 bg-[#2EE6D6]/10 rounded-lg">
                <h4 className="font-semibold mb-2 text-[#2EE6D6]">Risk Management</h4>
                <ul className="text-sm text-white/70 space-y-1">
                  <li>• Maximum position size: 5% of balance</li>
                  <li>• Risk-reward ratio: ≤ 5:1</li>
                  <li>• Stop loss and take profit mandatory</li>
                </ul>
              </div>
            </div>
            
            {/* Market Data */}
            <div className="crypto-card">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <BarChart3 className="mr-3 text-[#2EE6D6]" size={24} />
                Market Data
                <button 
                  onClick={fetchInstruments}
                  className="ml-auto text-white/70 hover:text-white transition-colors"
                  data-testid="refresh-market-btn"
                >
                  <RefreshCw size={18} />
                </button>
              </h3>
              
              <div className="space-y-4">
                {instruments.map((instrument) => (
                  <div key={instrument.symbol} className="p-4 bg-[#2EE6D6]/5 rounded-lg hover:bg-[#2EE6D6]/10 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-lg">{instrument.symbol}</h4>
                        <p className="text-2xl font-bold gradient-text">${instrument.price.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-semibold ${instrument.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {instrument.change >= 0 ? '+' : ''}{instrument.change}%
                        </div>
                        <div className="flex items-center mt-2">
                          {instrument.change >= 0 ? (
                            <TrendingUp className="text-green-400" size={16} />
                          ) : (
                            <TrendingDown className="text-red-400" size={16} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'staking' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Staking Form */}
            <div className="crypto-card">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <Shield className="mr-3 text-[#2EE6D6]" size={24} />
                Stake TFT Tokens
              </h3>
              
              <form onSubmit={handleStake} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Amount to Stake</label>
                  <input
                    type="number"
                    step="0.01"
                    value={stakeForm.amount}
                    onChange={(e) => setStakeForm({...stakeForm, amount: e.target.value})}
                    className="form-input"
                    placeholder="0.00"
                    max={user.tft_balance}
                    required
                    data-testid="stake-amount-input"
                  />
                  <p className="text-xs text-white/60 mt-1">
                    Available: {user.tft_balance?.toFixed(2)} TFT
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">Lock Period</label>
                  <select
                    value={stakeForm.duration_days}
                    onChange={(e) => setStakeForm({...stakeForm, duration_days: parseInt(e.target.value)})}
                    className="form-input"
                    data-testid="duration-select"
                  >
                    <option value={14}>14 days (0.1% trading fee)</option>
                    <option value={30}>30 days (0.08% trading fee)</option>
                    <option value={90}>90 days (0.05% trading fee)</option>
                    <option value={180}>180 days (0.02% trading fee)</option>
                    <option value={360}>360 days (0% trading fee)</option>
                  </select>
                </div>
                
                <button type="submit" className="w-full btn-primary" data-testid="stake-tokens-btn">
                  Stake Tokens
                </button>
              </form>
              
              <div className="mt-6 p-4 bg-[#2EE6D6]/10 rounded-lg">
                <h4 className="font-semibold mb-2 text-[#2EE6D6]">Staking Benefits</h4>
                <ul className="text-sm text-white/70 space-y-1">
                  <li>• Unlock trading access</li>
                  <li>• Reduced trading fees</li>
                  <li>• Earn staking rewards</li>
                  <li>• Longer locks = better benefits</li>
                </ul>
              </div>
            </div>
            
            {/* Active Stakes */}
            <div className="crypto-card">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <Clock className="mr-3 text-[#2EE6D6]" size={24} />
                Active Stakes
              </h3>
              
              {stakes.length > 0 ? (
                <div className="space-y-4">
                  {stakes.filter(stake => stake.is_active).map((stake, index) => {
                    const endDate = new Date(stake.end_date);
                    const now = new Date();
                    const daysRemaining = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
                    
                    return (
                      <div key={index} className="p-4 bg-[#2EE6D6]/5 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-semibold text-lg">{stake.amount} TFT</p>
                            <p className="text-sm text-white/60">{stake.duration_days} days lock</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[#2EE6D6] font-semibold">{daysRemaining} days left</p>
                            <p className="text-sm text-white/60">Rewards: {stake.rewards_earned?.toFixed(2) || '0.00'} TFT</p>
                          </div>
                        </div>
                        
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ 
                              width: `${Math.max(0, Math.min(100, ((stake.duration_days - daysRemaining) / stake.duration_days) * 100))}%` 
                            }}
                          ></div>
                        </div>
                        
                        <p className="text-xs text-white/60 mt-2">
                          Started: {formatDate(stake.start_date)} • Ends: {formatDate(stake.end_date)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="mx-auto mb-4 text-white/30" size={48} />
                  <p className="text-white/60 mb-4">No active stakes</p>
                  <p className="text-sm text-white/50">Start staking to unlock trading and earn rewards</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="crypto-card">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <Clock className="mr-3 text-[#2EE6D6]" size={24} />
              Trading History
            </h3>
            
            {dashboardData?.recent_trades?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2EE6D6]/20">
                      <th className="text-left py-3 px-4 font-semibold text-white/80">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-white/80">Instrument</th>
                      <th className="text-left py-3 px-4 font-semibold text-white/80">Side</th>
                      <th className="text-left py-3 px-4 font-semibold text-white/80">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-white/80">Price</th>
                      <th className="text-left py-3 px-4 font-semibold text-white/80">P&L</th>
                      <th className="text-left py-3 px-4 font-semibold text-white/80">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recent_trades.map((trade, index) => (
                      <tr key={index} className="border-b border-[#2EE6D6]/10 hover:bg-[#2EE6D6]/5">
                        <td className="py-3 px-4 text-sm">{formatDate(trade.created_at)}</td>
                        <td className="py-3 px-4 font-medium">{trade.symbol}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            trade.side === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {trade.side.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4">{trade.amount}</td>
                        <td className="py-3 px-4">${trade.price}</td>
                        <td className="py-3 px-4">
                          <span className={`font-semibold ${
                            trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)} TFT
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-[#2EE6D6]/20 text-[#2EE6D6] capitalize">
                            {trade.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="mx-auto mb-4 text-white/30" size={48} />
                <p className="text-white/60 mb-4">No trading history yet</p>
                <p className="text-sm text-white/50">Your trades will appear here once you start trading</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;