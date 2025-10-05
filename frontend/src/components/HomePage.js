import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, TrendingUp, Shield, Users, Zap, Star, ArrowRight, Menu, X } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const LOGO_URL = "https://customer-assets.emergentagent.com/job_62c52c18-ca22-473e-892a-e02535fe36c2/artifacts/dtudqm3z_logo.png";

const HomePage = ({ user, onLogout }) => {
  const [stats, setStats] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    fetchStats();
    
    // Intersection Observer for section highlighting
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/public/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#081F2C] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-dark border-b border-[#2EE6D6]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <img src={LOGO_URL} alt="Averix" className="h-12 w-12 animate-glow" />
              <span className="text-2xl font-bold font-['Space_Grotesk'] gradient-text">Averix</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('about')} className={`nav-link ${activeSection === 'about' ? 'active' : ''}`}>About</button>
              <button onClick={() => scrollToSection('tokenomics')} className={`nav-link ${activeSection === 'tokenomics' ? 'active' : ''}`}>Tokenomics</button>
              <button onClick={() => scrollToSection('ecosystem')} className={`nav-link ${activeSection === 'ecosystem' ? 'active' : ''}`}>Ecosystem</button>
              <button onClick={() => scrollToSection('roadmap')} className={`nav-link ${activeSection === 'roadmap' ? 'active' : ''}`}>Roadmap</button>
              <button onClick={() => scrollToSection('team')} className={`nav-link ${activeSection === 'team' ? 'active' : ''}`}>Team</button>
              
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link to="/dashboard" className="btn-primary">Dashboard</Link>
                  <button onClick={onLogout} className="text-white/70 hover:text-white transition-colors">Logout</button>
                </div>
              ) : (
                <Link to="/auth" className="btn-primary">Get Started</Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-dark border-t border-[#2EE6D6]/20">
            <div className="px-4 py-6 space-y-4">
              <button onClick={() => scrollToSection('about')} className="block w-full text-left nav-link">About</button>
              <button onClick={() => scrollToSection('tokenomics')} className="block w-full text-left nav-link">Tokenomics</button>
              <button onClick={() => scrollToSection('ecosystem')} className="block w-full text-left nav-link">Ecosystem</button>
              <button onClick={() => scrollToSection('roadmap')} className="block w-full text-left nav-link">Roadmap</button>
              <button onClick={() => scrollToSection('team')} className="block w-full text-left nav-link">Team</button>
              {user ? (
                <div className="space-y-2">
                  <Link to="/dashboard" className="block btn-primary text-center">Dashboard</Link>
                  <button onClick={onLogout} className="block w-full text-center text-white/70">Logout</button>
                </div>
              ) : (
                <Link to="/auth" className="block btn-primary text-center">Get Started</Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="hero" className="pt-20 min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2EE6D6]/10 via-transparent to-[#A4F4F9]/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="animate-fadeInUp">
            <img src={LOGO_URL} alt="Averix" className="h-24 w-24 mx-auto mb-8 animate-float" />
            <h1 className="text-5xl md:text-7xl font-bold font-['Space_Grotesk'] mb-6 leading-tight">
              The Future of 
              <span className="gradient-text block">Decentralized Trading</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
              Revolutionizing prop trading through risk-enforced, transparent, on-chain trading with Web3 incentives and community-driven growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a href="https://customer-assets.emergentagent.com/job_62c52c18-ca22-473e-892a-e02535fe36c2/artifacts/ij2bxvcq_Averix%20%E2%80%94%20Whitepaper%20v2.pdf" 
                 target="_blank" rel="noopener noreferrer" 
                 className="btn-primary inline-flex items-center" 
                 data-testid="whitepaper-btn">
                Read Whitepaper <ArrowRight size={20} />
              </a>
              {!user && (
                <Link to="/auth" className="btn-secondary" data-testid="get-started-btn">
                  Join Community
                </Link>
              )}
            </div>
            
            {stats && (
              <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                <div className="text-center animate-slideInLeft" style={{animationDelay: '0.2s'}}>
                  <div className="text-3xl font-bold gradient-text">{stats.total_traders}+</div>
                  <div className="text-white/60">Active Traders</div>
                </div>
                <div className="text-center animate-slideInLeft" style={{animationDelay: '0.4s'}}>
                  <div className="text-3xl font-bold gradient-text">{stats.total_volume}</div>
                  <div className="text-white/60">Trading Volume</div>
                </div>
                <div className="text-center animate-slideInRight" style={{animationDelay: '0.6s'}}>
                  <div className="text-3xl font-bold gradient-text">{stats.active_stakes}+</div>
                  <div className="text-white/60">Active Stakes</div>
                </div>
                <div className="text-center animate-slideInRight" style={{animationDelay: '0.8s'}}>
                  <div className="text-3xl font-bold gradient-text">{stats.tft_price}</div>
                  <div className="text-white/60">TFT Price</div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="text-[#2EE6D6]" size={32} />
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-['Space_Grotesk'] mb-6 gradient-text">About Averix</h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Merging disciplined trading practices with innovative Web3 incentives
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-slideInLeft">
              <h3 className="text-3xl font-bold mb-6">Our Vision</h3>
              <p className="text-lg text-white/80 mb-8 leading-relaxed">
                To revolutionize prop trading by creating a transparent, on-chain, risk-enforced trading environment that rewards skill, discipline, and community engagement through a fully decentralized platform.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <Shield className="text-[#2EE6D6] mt-1 flex-shrink-0" size={24} />
                  <div>
                    <h4 className="font-semibold mb-2">Risk-Managed Trading</h4>
                    <p className="text-white/70">Enforced risk parameters at the order layer with mandatory stop-loss and take-profit orders.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <TrendingUp className="text-[#2EE6D6] mt-1 flex-shrink-0" size={24} />
                  <div>
                    <h4 className="font-semibold mb-2">Seasonal Competitions</h4>
                    <p className="text-white/70">30-day trading seasons with public leaderboards showcasing top performers.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Users className="text-[#2EE6D6] mt-1 flex-shrink-0" size={24} />
                  <div>
                    <h4 className="font-semibold mb-2">Community Driven</h4>
                    <p className="text-white/70">Copy-trading marketplace and mentor programs connecting experienced traders.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="animate-slideInRight">
              <div className="crypto-card">
                <h4 className="text-2xl font-bold mb-6 text-center">Core Features</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#2EE6D6]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="text-[#2EE6D6]" size={32} />
                    </div>
                    <h5 className="font-semibold mb-2">Risk Controls</h5>
                    <p className="text-sm text-white/70">Automated risk management</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#2EE6D6]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="text-[#2EE6D6]" size={32} />
                    </div>
                    <h5 className="font-semibold mb-2">NFT Levels</h5>
                    <p className="text-sm text-white/70">Verifiable trader identity</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#2EE6D6]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="text-[#2EE6D6]" size={32} />
                    </div>
                    <h5 className="font-semibold mb-2">Copy Trading</h5>
                    <p className="text-sm text-white/70">Follow top traders</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#2EE6D6]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="text-[#2EE6D6]" size={32} />
                    </div>
                    <h5 className="font-semibold mb-2">Mentorship</h5>
                    <p className="text-sm text-white/70">Learn from experts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tokenomics Section */}
      <section id="tokenomics" className="py-20 bg-gradient-to-br from-[#2EE6D6]/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-['Space_Grotesk'] mb-6 gradient-text">TFT Tokenomics</h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              The native utility token powering the Averix ecosystem
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-slideInLeft">
              <div className="crypto-card">
                <h3 className="text-2xl font-bold mb-8 text-center">Token Distribution</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-[#2EE6D6]/10 rounded-lg">
                    <span className="font-semibold">Trader Rewards</span>
                    <span className="text-[#2EE6D6] font-bold">35%</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-[#A4F4F9]/10 rounded-lg">
                    <span className="font-semibold">Liquidity</span>
                    <span className="text-[#A4F4F9] font-bold">15%</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-[#2EE6D6]/10 rounded-lg">
                    <span className="font-semibold">Staking/Copy</span>
                    <span className="text-[#2EE6D6] font-bold">15%</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-[#A4F4F9]/10 rounded-lg">
                    <span className="font-semibold">Team (24m vesting)</span>
                    <span className="text-[#A4F4F9] font-bold">10%</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-[#2EE6D6]/10 rounded-lg">
                    <span className="font-semibold">Airdrop/Referrals</span>
                    <span className="text-[#2EE6D6] font-bold">10%</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-[#A4F4F9]/10 rounded-lg">
                    <span className="font-semibold">Dev/Reserve</span>
                    <span className="text-[#A4F4F9] font-bold">8%</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-[#2EE6D6]/10 rounded-lg">
                    <span className="font-semibold">Marketing</span>
                    <span className="text-[#2EE6D6] font-bold">7%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="animate-slideInRight space-y-8">
              <div className="crypto-card">
                <h4 className="text-xl font-bold mb-4 flex items-center">
                  <Zap className="text-[#2EE6D6] mr-3" size={24} />
                  Utility & Access
                </h4>
                <ul className="space-y-3 text-white/80">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-[#2EE6D6] rounded-full mr-3"></div>
                    Stake TFT to unlock trading access
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-[#A4F4F9] rounded-full mr-3"></div>
                    Longer stakes = lower trading fees
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-[#2EE6D6] rounded-full mr-3"></div>
                    Earn rewards through platform activities
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-[#A4F4F9] rounded-full mr-3"></div>
                    Governance participation rights
                  </li>
                </ul>
              </div>
              
              <div className="crypto-card">
                <h4 className="text-xl font-bold mb-4 flex items-center">
                  <TrendingUp className="text-[#2EE6D6] mr-3" size={24} />
                  Fee Structure
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>14 days staking</span>
                    <span className="text-[#A4F4F9]">0.1% fee</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>90 days staking</span>
                    <span className="text-[#A4F4F9]">0.05% fee</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>360 days staking</span>
                    <span className="text-[#2EE6D6] font-bold">0% fee</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ecosystem Section */}
      <section id="ecosystem" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-['Space_Grotesk'] mb-6 gradient-text">Ecosystem Features</h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              A comprehensive trading ecosystem designed for disciplined growth
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="crypto-card animate-fadeInUp" style={{animationDelay: '0.1s'}}>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#2EE6D6] to-[#A4F4F9] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="text-[#081F2C]" size={32} />
                </div>
                <h3 className="text-xl font-bold mb-4">Staking System</h3>
                <p className="text-white/70 mb-6">Lock TFT for 14-360 days to gain trading access. Longer periods unlock better fee structures and enhanced rewards.</p>
                <ul className="text-sm text-white/60 space-y-2">
                  <li>• Flexible lock periods</li>
                  <li>• Progressive fee reduction</li>
                  <li>• Compounding rewards</li>
                </ul>
              </div>
            </div>
            
            <div className="crypto-card animate-fadeInUp" style={{animationDelay: '0.2s'}}>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#A4F4F9] to-[#2EE6D6] rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="text-[#081F2C]" size={32} />
                </div>
                <h3 className="text-xl font-bold mb-4">Risk-Managed Trading</h3>
                <p className="text-white/70 mb-6">Execute trades within strict, enforced risk parameters. All orders require mandatory stop-loss and take-profit levels.</p>
                <ul className="text-sm text-white/60 space-y-2">
                  <li>• Position size limits (5% max)</li>
                  <li>• Risk-reward ratios ≤ 5:1</li>
                  <li>• Automated compliance</li>
                </ul>
              </div>
            </div>
            
            <div className="crypto-card animate-fadeInUp" style={{animationDelay: '0.3s'}}>
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-[#2EE6D6] to-[#A4F4F9] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Star className="text-[#081F2C]" size={32} />
                </div>
                <h3 className="text-xl font-bold mb-4">Level NFTs</h3>
                <p className="text-white/70 mb-6">Progress through Bronze, Silver, Gold, and Prime tiers based on trading performance and rule adherence.</p>
                <ul className="text-sm text-white/60 space-y-2">
                  <li>• Verifiable trader identity</li>
                  <li>• Unlock advanced features</li>
                  <li>• Enhanced benefits per tier</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-16 grid md:grid-cols-2 gap-12">
            <div className="crypto-card animate-slideInLeft">
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <Users className="text-[#2EE6D6] mr-3" size={28} />
                Copy-Trading Marketplace
              </h3>
              <p className="text-white/80 mb-6">
                Prime traders can create public strategy profiles with audited metrics. Follow top performers and learn from their approaches.
              </p>
              <div className="space-y-3">
                <div className="flex items-center text-white/70">
                  <div className="w-2 h-2 bg-[#2EE6D6] rounded-full mr-3"></div>
                  Transparent performance metrics
                </div>
                <div className="flex items-center text-white/70">
                  <div className="w-2 h-2 bg-[#A4F4F9] rounded-full mr-3"></div>
                  Risk guardrails for followers
                </div>
                <div className="flex items-center text-white/70">
                  <div className="w-2 h-2 bg-[#2EE6D6] rounded-full mr-3"></div>
                  Revenue sharing with strategy providers
                </div>
              </div>
            </div>
            
            <div className="crypto-card animate-slideInRight">
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <Zap className="text-[#2EE6D6] mr-3" size={28} />
                Mentor Program
              </h3>
              <p className="text-white/80 mb-6">
                Gold and Prime tier traders with "Risk Purist" badges can mentor up to 20 individuals, earning rewards while contributing to community growth.
              </p>
              <div className="space-y-3">
                <div className="flex items-center text-white/70">
                  <div className="w-2 h-2 bg-[#A4F4F9] rounded-full mr-3"></div>
                  Structured learning programs
                </div>
                <div className="flex items-center text-white/70">
                  <div className="w-2 h-2 bg-[#2EE6D6] rounded-full mr-3"></div>
                  Performance-based rewards
                </div>
                <div className="flex items-center text-white/70">
                  <div className="w-2 h-2 bg-[#A4F4F9] rounded-full mr-3"></div>
                  Community reputation building
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section id="roadmap" className="py-20 bg-gradient-to-br from-[#A4F4F9]/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-['Space_Grotesk'] mb-6 gradient-text">Development Roadmap</h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Our journey to revolutionize decentralized prop trading
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="crypto-card animate-fadeInUp" style={{animationDelay: '0.1s'}}>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#2EE6D6] mb-4">Q4 2025</div>
                <h3 className="text-xl font-bold mb-4">MVP Launch</h3>
                <ul className="text-sm text-white/70 space-y-2 text-left">
                  <li>• Web application</li>
                  <li>• Risk Engine v1</li>
                  <li>• Bronze/Silver tiers</li>
                  <li>• Leaderboard v1</li>
                  <li>• SBT framework</li>
                  <li>• Admin tools</li>
                </ul>
              </div>
            </div>
            
            <div className="crypto-card animate-fadeInUp" style={{animationDelay: '0.2s'}}>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#A4F4F9] mb-4">Q1 2026</div>
                <h3 className="text-xl font-bold mb-4">Enhanced Features</h3>
                <ul className="text-sm text-white/70 space-y-2 text-left">
                  <li>• Gold/Prime tiers</li>
                  <li>• Copy-trading marketplace</li>
                  <li>• AI Risk Advisor</li>
                  <li>• Quests v2</li>
                  <li>• On-chain attestations</li>
                  <li>• Tournament v1</li>
                </ul>
              </div>
            </div>
            
            <div className="crypto-card animate-fadeInUp" style={{animationDelay: '0.3s'}}>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#2EE6D6] mb-4">Q2 2026</div>
                <h3 className="text-xl font-bold mb-4">Community & Governance</h3>
                <ul className="text-sm text-white/70 space-y-2 text-left">
                  <li>• Mentor program</li>
                  <li>• Treasury governance</li>
                  <li>• Expanded achievements</li>
                  <li>• Performance dashboard 2.0</li>
                  <li>• Advanced analytics</li>
                  <li>• Mobile optimization</li>
                </ul>
              </div>
            </div>
            
            <div className="crypto-card animate-fadeInUp" style={{animationDelay: '0.4s'}}>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#A4F4F9] mb-4">Q3-Q4 2026</div>
                <h3 className="text-xl font-bold mb-4">Scale & Expansion</h3>
                <ul className="text-sm text-white/70 space-y-2 text-left">
                  <li>• PWA integration</li>
                  <li>• Tournaments 2.0</li>
                  <li>• Copy analytics</li>
                  <li>• Internationalization</li>
                  <li>• Advanced DAO features</li>
                  <li>• White-label program</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-['Space_Grotesk'] mb-6 gradient-text">Team & Contact</h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Building the future of decentralized prop trading
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="crypto-card text-center animate-fadeInUp" style={{animationDelay: '0.1s'}}>
              <div className="w-24 h-24 bg-gradient-to-br from-[#2EE6D6] to-[#A4F4F9] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-[#081F2C]">IC</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Ivan Chaltsev</h3>
              <p className="text-[#2EE6D6] font-semibold mb-4">Founder</p>
              <p className="text-white/70 text-sm">Visionary leader driving the decentralized trading revolution</p>
            </div>
            
            <div className="crypto-card text-center animate-fadeInUp" style={{animationDelay: '0.2s'}}>
              <div className="w-24 h-24 bg-gradient-to-br from-[#A4F4F9] to-[#2EE6D6] rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="text-[#081F2C]" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Core Team</h3>
              <p className="text-[#A4F4F9] font-semibold mb-4">Coming Soon</p>
              <p className="text-white/70 text-sm">Expanding our team of blockchain and trading experts</p>
            </div>
            
            <div className="crypto-card text-center animate-fadeInUp" style={{animationDelay: '0.3s'}}>
              <div className="w-24 h-24 bg-gradient-to-br from-[#2EE6D6] to-[#A4F4F9] rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="text-[#081F2C]" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Advisors</h3>
              <p className="text-[#2EE6D6] font-semibold mb-4">TBA</p>
              <p className="text-white/70 text-sm">Industry veterans guiding our strategic direction</p>
            </div>
          </div>
          
          <div className="text-center mt-16">
            <div className="crypto-card max-w-md mx-auto">
              <h3 className="text-xl font-bold mb-4">Get in Touch</h3>
              <div className="space-y-3">
                <a href="mailto:averix.found@gmail.com" className="block text-[#2EE6D6] hover:text-[#A4F4F9] transition-colors">
                  averix.found@gmail.com
                </a>
                <a href="https://t.me/averix_founder" target="_blank" rel="noopener noreferrer" 
                   className="block text-[#A4F4F9] hover:text-[#2EE6D6] transition-colors">
                  @averix_founder (Telegram)
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[#2EE6D6]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <img src={LOGO_URL} alt="Averix" className="h-8 w-8" />
              <span className="text-xl font-bold font-['Space_Grotesk'] gradient-text">Averix</span>
            </div>
            
            <div className="flex space-x-6 mb-4 md:mb-0">
              <a href="#" className="text-white/70 hover:text-[#2EE6D6] transition-colors">Terms</a>
              <a href="#" className="text-white/70 hover:text-[#2EE6D6] transition-colors">Privacy</a>
              <a href="#" className="text-white/70 hover:text-[#2EE6D6] transition-colors">Risk Disclosure</a>
            </div>
            
            <div className="text-white/60 text-sm text-center">
              © 2025 Averix. All rights reserved.
            </div>
          </div>
          
          <div className="mt-8 text-center text-xs text-white/50">
            <p>This document describes a product concept. Parameters are illustrative and subject to change. Not financial advice.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;