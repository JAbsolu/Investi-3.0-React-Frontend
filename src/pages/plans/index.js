import { useEffect, useState } from 'react';
import theme from '../../theme';
import { 
  CheckCircle, 
  Star, 
  // TrendingUp, 
  BarChart3, 
  Shield,
  // Zap,
  // Building2,
  // Sparkles
} from 'lucide-react';
import CheckoutModal from '../dashboard/stripeCheckout';
import StripeWrapper from '../dashboard/stripeWrapper';

const PricingPlans = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedPlanPriceId, setSelectedPlanPriceId] = useState(null);
  const [showStripeModal, setShowStripeModal] = useState(false);

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
    priceId,
    onSelect,
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
          type="button"
          aria-label={`Select ${planName} plan`}
          className={`
            w-full py-4 px-6 font-semibold uppercase tracking-wide rounded-xl transition-all duration-300
            ${comingSoon 
              ? 'border-2 border-yellow-400/50 text-yellow-400 cursor-not-allowed opacity-60' 
              : buttonClass + ' hover:shadow-xl hover:-translate-y-1'
            }
          `}
          disabled={comingSoon}
          onClick={() => {
            if (!comingSoon && priceId) {
              onSelect(priceId);
            }
          }}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: theme.palette.background.default}}>
      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 sm:w-48 sm:h-48 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 sm:w-64 sm:h-64 bg-green-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-3/4 left-1/3 w-24 h-24 sm:w-32 sm:h-32 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-xl sm:text-start sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 px-4 bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent leading-relaxed">
            Start Making Smarter Investment Decisions with AI-Powered Market Intelligence Today
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-400 max-w-3xl mx-auto px-4 leading-relaxed">
            Get instant access to comprehensive stock analysis, real-time market data, insider trades, congressional activity, and AI-driven insights—all in one powerful platform. Stop guessing. Start investing with confidence.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16 max-w-6xl mx-auto">
          {/* Bronze Plan */}
          {/* <PlanCard
            planName="Bronze"
            price="10"
            description="Perfect for getting started with market insights"
            features={bronzeFeatures}
            buttonText="Continue with Bronze"
            planType="bronze"
            priceId="price_1SCUnPFUQWEqeOOpFrmW6SQF"
            icon={<TrendingUp className="w-8 h-8" style={{ color: theme.palette.primary.main }} />}
            gradientClass="bg-gradient-to-r from-blue-500 to-cyan-400"
            buttonClass="bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg hover:from-blue-400 hover:to-cyan-300"
            onSelect={(priceId) => setCheckoutModalInfo({ show: true, stripePriceId: priceId })}
          /> */}

          {/* Silver Plan */}
          <PlanCard
            planName="Silver"
            price="20"
            description="Complete access to all financial data and analytics"
            features={silverFeatures}
            buttonText="Upgrade to Silver"
            popular={true}
            planType="silver"
            priceId="price_1S8uqgFUQWEqeOOp8c4aQF3a"
            // priceId="price_1SDJSCF0Aklm0cssVTKgyfBN"v // test id
            icon={<BarChart3 className="w-8 h-8" style={{ color: theme.palette.secondary.main }} />}
            gradientClass="bg-gradient-to-r from-gray-400 to-gray-200"
            buttonClass="bg-gradient-to-r from-gray-400 to-gray-200 text-slate-900 shadow-lg hover:from-gray-300 hover:to-gray-100"
            onSelect={(priceId) => {
              setShowStripeModal(true);
              setSelectedPlanPriceId(priceId);
            }}
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
            priceId="price_1SC2S3FUQWEqeOOpLror5Ozp"
            icon={<Shield className="w-8 h-8" style={{ color: theme.palette.primary.main }} />}
            gradientClass="bg-gradient-to-r from-yellow-400 to-yellow-600"
            buttonClass=""
            onSelect={(priceId) => {
              setSelectedPlanPriceId(priceId);
              setShowStripeModal(true);
            }}
          />
        </div>
      </div>

      {/* Checkout Modal */}
        <StripeWrapper>
          <CheckoutModal 
            open={showStripeModal} 
            handleClose={() => setShowStripeModal(false)} 
            stripePriceId={selectedPlanPriceId}
          />
        </StripeWrapper>
    </div>
  );
};

export default PricingPlans;