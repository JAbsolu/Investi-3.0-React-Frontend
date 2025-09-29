import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../../../theme';
import { 
  CheckCircle, 
  Star, 
  TrendingUp, 
  BarChart3, 
  Shield,
  Zap,
  Building2,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardSidebar from '../components/DashboardSidebar';

const PricingPlans = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const navigate = useNavigate();

  const bronzeFeatures = [
    { text: "Access to daily movers (Gainers, Losers, Most Traded)", limited: false },
    { text: "Stock Key indicators", limited: false },
    { text: "Analysis consensus", limited: true },
    { text: "Recent analyst ratings", limited: true },
    { text: "Price Targets", limited: false },
    { text: "Latest Market, stock, crypto, and Forex News", limited: false },
    { text: "Congress Trade Reports", limited: true },
    { text: "Company Income Statement Data", limited: true },
    { text: "Company Balance Sheet Data", limited: true },
    { text: "Company Cashflow Data", limited: true },
    { text: "Insider Trade Data", limited: true },
  ];

  const silverFeatures = [
    { text: "Access to daily movers (Gainers, Losers, Most Traded)", limited: false },
    { text: "Stock Key indicators", limited: false },
    { text: "Full Analysis consensus", limited: false },
    { text: "All recent analyst ratings", limited: false },
    { text: "Price Targets", limited: false },
    { text: "Latest Market, stock, crypto, and Forex News", limited: false },
    { text: "Full Congress Trade Reports", limited: false },
    { text: "Full Company Income Statement Data", limited: false },
    { text: "Full Company Balance Sheet Data", limited: false },
    { text: "Full Company Cashflow Data", limited: false },
    { text: "Full Insider Trades Data", limited: false },
  ];

  const goldFeatures = [
    { text: "Everything in Silver", limited: false },
    { text: "Advanced portfolio analytics", limited: false },
    { text: "Real-time alerts and notifications", limited: false },
    { text: "Custom screening tools", limited: false },
    { text: "API access", limited: false },
    { text: "Priority customer support", limited: false },
    { text: "Advanced charting tools", limited: false },
    { text: "Institutional-grade research", limited: false },
  ];

  const FeatureList = ({ features, planType }) => (
    <ul className="space-y-3 mb-8">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start">
          <CheckCircle 
            style={{ color: planType === 'gold' ? theme.palette.primary.main : planType === 'silver' ? theme.palette.secondary.main : theme.palette.text.primary }}
            className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0"
          />
          <div className="flex items-center justify-between w-full">
            <span 
              style={{ color: feature.limited ? theme.palette.text.secondary : theme.palette.text.primary, opacity: feature.limited ? 0.7 : 1 }}
              className="text-sm"
            >
              {feature.text}
            </span>
            {feature.limited && (
              <span style={{ background: theme.palette.secondary.main + '20', color: theme.palette.secondary.main }} className="ml-2 px-2 py-1 text-xs font-semibold rounded-md whitespace-nowrap">
                LIMITED
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );

  const PlanCard = ({ 
    planName, 
    price, 
    description, 
    features, 
    buttonText, 
    popular = false,
    comingSoon = false,
    planType,
    icon,
    gradientClass,
    buttonClass,
    priceId
  }) => (
    <div
      className={`relative h-full transform transition-all duration-500 ${
        hoveredCard === planName ? 'scale-105 -translate-y-2' : ''
      }`}
      onMouseEnter={() => setHoveredCard(planName)}
      onMouseLeave={() => setHoveredCard(null)}
    >
      <div className={`
        relative h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 
        shadow-2xl hover:shadow-3xl transition-all duration-500
        ${popular ? 'border-gray-300/30 border-2' : ''}
        ${comingSoon ? 'overflow-hidden' : ''}
      `}>
        {/* Top gradient bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${gradientClass} rounded-t-2xl`} />
        
        {/* Popular badge */}
        {popular && (
          <div className="absolute -top-3 right-6 flex items-center bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
            <Star className="w-4 h-4 mr-1" />
            Most Popular
          </div>
        )}
        
        {/* Coming soon overlay */}
        {comingSoon && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10 rounded-2xl">
            <h2 className="text-4xl font-bold text-yellow-400 uppercase tracking-wider">
              Coming Soon
            </h2>
          </div>
        )}

        {/* Plan header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            {icon}
            <h3 className={`text-2xl font-bold ml-3 ${
              planType === 'gold' ? 'text-yellow-400' : 
              planType === 'silver' ? 'text-gray-300' : 'text-blue-400'
            }`}>
              {planName}
            </h3>
          </div>
          
          <div className={`text-5xl font-bold mb-2 ${
            planType === 'gold' ? 'text-yellow-400' : 
            planType === 'silver' ? 'text-gray-300' : 'text-blue-400'
          }`}>
            ${price}
            <span className="text-lg font-normal text-gray-400">/month</span>
          </div>
          
          <p className="text-gray-400 text-base">
            {description}
          </p>
        </div>

        {/* Features list */}
        <FeatureList features={features} planType={planType} />

        {/* CTA Button */}
        <button
          className={`
            w-full py-4 px-6 font-semibold uppercase tracking-wide rounded-xl transition-all duration-300
            ${comingSoon 
              ? 'border-2 border-yellow-400/50 text-yellow-400 cursor-not-allowed opacity-60' 
              : buttonClass + ' hover:shadow-xl hover:-translate-y-1'
            }
          `}
          disabled={comingSoon}
          onClick={() => {
            if (planType === 'free') {
              navigate('/dashboard');
            }
            if (!comingSoon) {
              navigate('/dashboard/checkout', { state: { stripePriceId: priceId } });
            }
          }}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );

  return (
    <div className='flex'>
      <DashboardSidebar />
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div style={{ minHeight: '100vh', background: theme.palette.background.default, position: 'relative', overflow: 'hidden' }}>
          {/* Floating Background Elements */}
          <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
            <div style={{ position: 'absolute', top: '25%', left: '25%', width: 192, height: 192, background: theme.palette.primary.main + '10', borderRadius: '50%', filter: 'blur(48px)', animation: 'pulse 2s infinite' }} />
            <div style={{ position: 'absolute', bottom: '25%', right: '25%', width: 256, height: 256, background: theme.palette.secondary.main + '10', borderRadius: '50%', filter: 'blur(48px)', animation: 'pulse 2s infinite 1s' }} />
            <div style={{ position: 'absolute', top: '75%', left: '33%', width: 128, height: 128, background: '#a259ff10', borderRadius: '50%', filter: 'blur(48px)', animation: 'pulse 2s infinite 2s' }} />
          </div>

          <div className="relative z-10 container mx-auto px-6 py-0">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 style={{ fontSize: theme.typography.h1.fontSize, fontWeight: theme.typography.h1.fontWeight, background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, WebkitBackgroundClip: 'text', color: 'transparent' }} className="mb-6">
                Select A Plan
              </h1>
              <p style={{ color: theme.palette.text.secondary, fontSize: theme.typography.h5.fontSize }} className="max-w-2xl mx-auto leading-relaxed">
                Access comprehensive financial data, analytics, and insights to make informed investment decisions
              </p>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
              {/* Bronze Plan */}
              <PlanCard
                planName="Bronze"
                price="10"
                description="Perfect for getting started with market insights"
                features={bronzeFeatures}
                buttonText="Continue with Bronze"
                planType="bronze"
                priceId="price_1SCUnPFUQWEqeOOpFrmW6SQF" // Live price id
                icon={<TrendingUp className="w-8 h-8" style={{ color: theme.palette.primary.main }} />}
                gradientClass="bg-gradient-to-r from-blue-500 to-cyan-400"
                buttonClass="bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg hover:from-blue-400 hover:to-cyan-300"
              />

              {/* Silver Plan */}
              <PlanCard
                planName="Silver"
                price="20"
                description="Complete access to all financial data and analytics"
                features={silverFeatures}
                buttonText="Upgrade to Silver"
                popular={true}
                planType="silver"
                // priceId="price_1SC5GIFUQWEqeOOpgXTmxfSB" //for testing
                priceId="price_1S8uqgFUQWEqeOOp8c4aQF3a" // Live price id
                icon={<BarChart3 className="w-8 h-8" style={{ color: theme.palette.secondary.main }} />}
                gradientClass="bg-gradient-to-r from-gray-400 to-gray-200"
                buttonClass="bg-gradient-to-r from-gray-400 to-gray-200 text-slate-900 shadow-lg hover:from-gray-300 hover:to-gray-100"
              />

              {/* Gold Plan */}
              <PlanCard
                planName="Gold"
                price="40"
                description="Premium features for professional traders"
                features={goldFeatures}
                buttonText="Coming Soon"
                comingSoon={true}
                planType="gold"
                // priceId="price_1SC5HDFUQWEqeOOpyToROeAm" // For testing
                priceId="price_1SC2S3FUQWEqeOOpLror5Ozp" // Live price id
                icon={<Shield className="w-8 h-8" style={{ color: theme.palette.primary.main }} />}
                gradientClass="bg-gradient-to-r from-yellow-400 to-yellow-600"
                buttonClass=""
              />
            </div>

            {/* Additional Features Section */}
            <div style={{ background: theme.palette.background.paper, border: `1px solid ${theme.palette.text.secondary}20`, borderRadius: '1rem', padding: '2rem', backdropFilter: 'blur(12px)' }}>
              <h2 style={{ fontSize: theme.typography.h2.fontSize, fontWeight: theme.typography.h2.fontWeight, color: theme.palette.text.primary }} className="text-center mb-8">
                Why Choose Our Platform?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <Zap className="w-16 h-16 mx-auto mb-4" style={{ color: theme.palette.primary.main }} />
                  <h3 style={{ fontSize: theme.typography.h5.fontSize, fontWeight: theme.typography.h5.fontWeight, color: theme.palette.text.primary }} className="mb-2">
                    Real-Time Data
                  </h3>
                  <p style={{ color: theme.palette.text.secondary }}>
                    Get the most up-to-date market information and analytics
                  </p>
                </div>
                <div className="text-center">
                  <Building2 className="w-16 h-16 mx-auto mb-4" style={{ color: theme.palette.primary.main }} />
                  <h3 style={{ fontSize: theme.typography.h5.fontSize, fontWeight: theme.typography.h5.fontWeight, color: theme.palette.text.primary }} className="mb-2">
                    Institutional Grade
                  </h3>
                  <p style={{ color: theme.palette.text.secondary }}>
                    Professional-level tools used by financial institutions
                  </p>
                </div>
                <div className="text-center">
                  <Sparkles className="w-16 h-16 mx-auto mb-4" style={{ color: theme.palette.primary.main }} />
                  <h3 style={{ fontSize: theme.typography.h5.fontSize, fontWeight: theme.typography.h5.fontWeight, color: theme.palette.text.primary }} className="mb-2">
                    Latest Insights
                  </h3>
                  <p style={{ color: theme.palette.text.secondary }}>
                    Stay ahead with cutting-edge financial analysis and reports
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
};

export default PricingPlans;