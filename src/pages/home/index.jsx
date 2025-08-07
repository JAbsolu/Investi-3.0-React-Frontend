import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer";
import { green, grey, teal } from "@mui/material/colors";


// Constants for colors matching dashboard
const darkBg = "#0d0d0d";
const darkGradient = 'linear-gradient(to bottom, #121212, #0d0d0d)';
const white = "#ffffff";

const featureCards = [
  {
    title: "AI Stock Picker",
    description: "AI Stock Picker leverages the extensive data-processing capabilities of AI models to analyze all the latest market events each day.",
    visual: (
      <div style={{ position: 'relative', height: '120px', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: '20%',
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${teal[500]}, transparent)`,
          transform: 'rotate(-10deg)'
        }} />
        <div style={{
          position: 'absolute',
          top: '60%',
          left: 0,
          right: 0,
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${teal[300]}, transparent)`,
          transform: 'rotate(15deg)'
        }} />
        <div style={{ position: 'absolute', top: 10, left: 10 }}>
          <div style={{ color: teal[300], fontSize: '0.7rem', marginBottom: '4px' }}>
            • Daily Top Stock  +18.78%
          </div>
          <div style={{ color: grey[400], fontSize: '0.7rem' }}>
            • S&P 500  +8.57%
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Swing Trading",
    description: "Swing Trading leverages advanced algorithms to provide insights into the optimal trading timing for stocks and cryptos.",
    visual: (
      <div style={{ position: 'relative', height: '120px', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: '70%',
          left: '10%',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: teal[500],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ color: white, fontSize: '0.6rem', fontWeight: 'bold' }}>Buy</span>
        </div>
        <div style={{
          position: 'absolute',
          top: '30%',
          right: '20%',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: teal[300],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ color: darkBg, fontSize: '0.6rem', fontWeight: 'bold' }}>Sell</span>
        </div>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '20%',
          right: '30%',
          height: '2px',
          background: teal[400],
          borderRadius: '1px'
        }} />
      </div>
    )
  },
  {
    title: "Crypto & Stock Technical Analysis",
    description: "Each crypto asset includes an 'Analysis' button that leads investors into recent insights and performance trends.",
    visual: (
      <div style={{ position: 'relative', height: '120px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 8, right: 8 }}>
          <div style={{ color: teal[300], fontSize: '0.65rem', marginBottom: '3px' }}>
            TSLA  +11.6%
          </div>
          <div style={{ color: teal[400], fontSize: '0.65rem' }}>
            BTC  +7.2%
          </div>
        </div>
        <div style={{
          position: 'absolute',
          bottom: '20%',
          left: '10%',
          right: '10%',
          height: '3px',
          background: `linear-gradient(90deg, ${teal[600]}, ${teal[400]})`,
          borderRadius: '2px',
          transform: 'rotate(10deg)'
        }} />
      </div>
    )
  },
  {
    title: "Stock Monitor",
    description: "Gain real-time insights into over 500+ daily stock signals, making it an essential tool for investors wanting to stay ahead of market movements.",
    visual: (
      <div style={{ height: '120px', padding: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: teal[500], marginRight: '8px' }} />
          <span style={{ color: teal[300], fontSize: '0.7rem' }}>SLDG.O  +4.42%</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: teal[400], marginRight: '8px' }} />
          <span style={{ color: grey[400], fontSize: '0.7rem' }}>HCA.N  +2.1%</span>
        </div>
        <div style={{ color: grey[500], fontSize: '0.6rem', marginTop: '8px' }}>
          Monitor the pulse of the market with real-time alerts and data navigation tools.
        </div>
      </div>
    )
  },
  {
    title: "Copy Top Investor Portfolios",
    description: "Explore the trading strategies of over 500 politicians and 1000+ top hedge fund managers.",
    visual: (
      <div style={{ height: '120px', padding: '12px', display: 'flex', alignItems: 'center' }}>
        <div style={{ marginRight: '16px' }}>
          <div style={{ 
            width: 40, 
            height: 40, 
            borderRadius: '50%', 
            background: `linear-gradient(135deg, ${teal[600]}, ${teal[700]})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ color: white, fontSize: '0.8rem', fontWeight: 'bold' }}>DS</span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: white, fontSize: '0.8rem', fontWeight: 'bold' }}>Dan Sullivan</div>
          <div style={{ color: teal[300], fontSize: '0.7rem' }}>Win Rate: 78.41%</div>
          <div style={{ color: grey[400], fontSize: '0.6rem' }}>Past Year Trades (82)</div>
        </div>
      </div>
    )
  },
  {
    title: "Financial AI Agent",
    description: "The AI Financial Agent leverages advanced AI models, comprehensive financial databases, and real-time data to provide accurate answers.",
    visual: (
      <div style={{ height: '120px', padding: '12px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'end', height: '70px', gap: '2px' }}>
          {[30, 60, 45, 80, 65, 90, 75, 85].map((height, index) => (
            <div
              key={index}
              style={{
                flex: 1,
                height: `${height}%`,
                background: index === 5 ? teal[400] : teal[700],
                borderRadius: '2px 2px 0 0'
              }}
            />
          ))}
        </div>
        <div style={{ color: grey[400], fontSize: '0.6rem', marginTop: '8px' }}>
          Revenue • Growth Margin • Net Margin • ROE
        </div>
      </div>
    )
  }
];

const testimonials = [
  {
    quote: "InvestiAI has completely transformed how I analyze stocks. The real-time insights are incredible and have helped me make much better investment decisions.",
    name: "Sarah Johnson",
    role: "Portfolio Manager",
    initial: "S"
  },
  {
    quote: "The AI-powered analysis is spot-on. I've seen a 30% improvement in my portfolio performance since I started using InvestiAI. Highly recommended!",
    name: "Michael Chen",
    role: "Day Trader",
    initial: "M"
  },
  {
    quote: "As a beginner investor, InvestiAI made complex market analysis accessible. The platform is intuitive and the insights are easy to understand.",
    name: "Emily Rodriguez",
    role: "New Investor",
    initial: "E"
  },
  {
    quote: "The swing trading signals have been incredibly accurate. I've improved my timing significantly since using this platform.",
    name: "David Park",
    role: "Swing Trader",
    initial: "D"
  },
  {
    quote: "Having access to politician and hedge fund portfolios has given me a competitive edge in the market.",
    name: "Lisa Thompson",
    role: "Investment Advisor",
    initial: "L"
  }
];

export default function Home() {
  const isSignedIn = false;
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const testimonialsPerPage = isMobile ? 1 : 3;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setCurrentTestimonialIndex(0); // Reset to first page on resize
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextTestimonials = () => {
    const maxIndex = Math.ceil(testimonials.length / testimonialsPerPage) - 1;
    setCurrentTestimonialIndex(prev => prev < maxIndex ? prev + 1 : 0);
  };

  const prevTestimonials = () => {
    const maxIndex = Math.ceil(testimonials.length / testimonialsPerPage) - 1;
    setCurrentTestimonialIndex(prev => prev > 0 ? prev - 1 : maxIndex);
  };

  const getCurrentTestimonials = () => {
    const startIndex = currentTestimonialIndex * testimonialsPerPage;
    return testimonials.slice(startIndex, startIndex + testimonialsPerPage);
  };

  return (
    <div style={{ 
      minWidth: "100vw", 
      minHeight: "100vh", 
      backgroundColor: darkBg,
      color: white,
      background: darkGradient
    }}>
      {/* App Bar */}
      <Navbar />

      {/* Hero Section */}
      <div style={{ 
        textAlign: "center", 
        marginTop: isMobile ? '40px' : '64px', 
        paddingTop: '48px',
        paddingBottom: '64px',
        maxWidth: "1200px",
        margin: '0 auto',
        padding: '48px 24px 64px',
        position: "relative",
        zIndex: 1
      }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div style={{
              display: "flex",
              justifyContent: "start",
              backgroundColor: 'rgba(20, 30, 20, 0.5)',
              padding: '12px',
              borderRadius: "80px",
              minWidth: isMobile ? "80%" : "16em",
              border: `1px solid ${grey[900]}`,
            }}>
              <span style={{
                backgroundColor: teal[700],
                color: white,
                padding: '4px 16px',
                borderRadius: "40px",
                fontSize: isMobile ? "10pt" : "11pt",
                marginRight: '8px',
              }}>
                New
              </span>
              <span style={{ 
                fontSize: isMobile ? "10pt" : "11pt",
                color: grey[300]
              }}>
                Join the best platform for AI stock analysis
              </span>
            </div>
          </div>
          <h1 style={{ 
            fontWeight: "bold", 
            marginTop: '24px',
            fontSize: isMobile ? '2rem' : '3rem',
            lineHeight: 1.2,
            marginBottom: '16px'
          }}>
            Grow your wealth with{" "}
            <span style={{ color: teal[400] }}>real-time <br /> insights</span>
          </h1>
          <p style={{ 
            color: grey[400], 
            marginTop: '16px',
            maxWidth: '600px',
            margin: '16px auto 0',
            fontSize: isMobile ? '0.9rem' : '1rem'
          }}>
            Track your investments, make informed decisions, and watch your portfolio thrive—all in one app.
          </p>
          
          {/* Get started button */}
          <div style={{ display: "flex", justifyContent: "center", margin: "32px 0" }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: isMobile ? "12px 24px" : "16px 32px",
                backgroundColor: teal[600],
                color: "white",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                cursor: "pointer",
                border: "none",
                fontSize: isMobile ? "0.9rem" : "1rem",
              }}
            >
              Get Started <span style={{ marginLeft: "8px" }}>→</span>
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* AI Powered Insights Section */}
      <div style={{ 
        background: darkGradient,
        padding: isMobile ? '1em 0' : '1.5em 2em',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
      }}>
        <div style={{ 
          maxWidth: "100%",
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
          textAlign: "center",
          // paddingBottom: '1em'
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 style={{ 
              fontWeight: "bold", 
              textAlign: "center",
              marginBottom: isMobile ? '1em' : '1em',
              color: white,
              fontSize: isMobile ? '2rem' : '2.5rem',
            }}>
              Gen AI-Powered Insights for{" "}
              <span style={{ color: teal[400]}}>
                Investors
              </span>
            </h2>
          </motion.div>
        </div>

        {/* Scrolling Cards Container */}
        <div style={{ 
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
          height: isMobile ? 'auto' : '420px'
        }}>
          <motion.div
            animate={{
              x: !isMobile ? [0, -50 + '%'] : ""
            }}
            transition={{
              x: !isMobile ? {
                repeat: Infinity,
                repeatType: "loop",
                duration: 20,
                ease: "linear",
              } : "",
            }}
            style={{
              display: isMobile ? 'block' : 'flex',
              gap: '24px',
              paddingLeft: isMobile ? '0' : '24px',
              padding: isMobile ? '0 1em' : '',
              width: isMobile ? '100%' : `${200}%`
            }}
          >
            {/* Render cards twice for seamless loop */}
            {[...featureCards, ...featureCards].map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: (index % featureCards.length) * 0.1 }}
                viewport={{ once: true }}
                style={{
                  background: 'rgba(10, 20, 15, 0.9)',
                  border: `1px solid ${teal[800]}40`,
                  borderRadius: '16px',
                  padding: '24px',
                  width: isMobile ? '100%' : '340px',
                  height: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  flexShrink: 0,
                  transition: 'all 0.3s ease',
                  marginBottom: isMobile ? '20px' : '0',
                }}
                whileHover={{
                  y: -8,
                  boxShadow: `0 16px 40px ${teal[900]}40`,
                }}
              >
                {/* Visual Element */}
                <div style={{ 
                  height: '120px', 
                  marginBottom: '24px', 
                  background: `linear-gradient(135deg, ${teal[900]}20, transparent)`,
                  borderRadius: '12px',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {card.visual}
                </div>
                
                <h3 style={{ 
                  color: white, 
                  fontWeight: 'bold', 
                  marginBottom: '16px',
                  fontSize: '1.25rem'
                }}>
                  {card.title}
                </h3>
                <p style={{ 
                  color: grey[400], 
                  lineHeight: 1.6,
                  flex: 1,
                  fontSize: '0.95rem'
                }}>
                  {card.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div style={{ 
        background: `linear-gradient(135deg, ${teal[900]}cc, ${teal[800]}99, ${darkBg})`,
        padding: isMobile ? '32px 24px' : '64px 48px',
        position: 'relative',
        width: '100%',
      }}>
        <div style={{ 
          maxWidth: "1200px",
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 style={{ 
              fontWeight: "bold", 
              textAlign: "center",
              marginBottom: isMobile ? '32px' : '48px',
              color: white,
              fontSize: isMobile ? '1.8rem' : '2.5rem'
            }}>
              Trusted by{" "}
              <span style={{ color: teal[400] }}>
                Smart Investors
              </span>
            </h2>
          </motion.div>

          {/* Testimonials Grid with Pagination */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile 
              ? '1fr' 
              : 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: isMobile ? '24px' : '32px',
            maxWidth: '100%',
            minHeight: '240px'
          }}>
            {getCurrentTestimonials().map((testimonial, index) => (
              <motion.div
                key={`${currentTestimonialIndex}-${index}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{
                  y: -8,
                  boxShadow: `0 16px 40px ${teal[900]}60`,
                }}
                style={{ 
                  background: `rgba(${parseInt(teal[900].slice(1, 3), 16)}, ${parseInt(teal[900].slice(3, 5), 16)}, ${parseInt(teal[900].slice(5, 7), 16)}, 0.4)`,
                  border: `1px solid ${teal[700]}40`,
                  borderRadius: '16px',
                  padding: '32px',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  minHeight: '200px'
                }}
              >
                <p style={{ 
                  color: grey[300], 
                  marginBottom: '24px',
                  fontStyle: 'italic',
                  lineHeight: 1.6,
                  fontSize: '1.05rem',
                  flex: 1
                }}>
                  "{testimonial.quote}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: '50%', 
                    background: `linear-gradient(135deg, ${teal[600]}, ${teal[700]})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '16px'
                  }}>
                    <span style={{ color: white, fontWeight: 'bold', fontSize: '1.2rem' }}>
                      {testimonial.initial}
                    </span>
                  </div>
                  <div>
                    <div style={{ color: white, fontWeight: 'bold', fontSize: '1rem' }}>
                      {testimonial.name}
                    </div>
                    <div style={{ color: teal[300], fontSize: '0.9rem' }}>
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '32px',
            gap: '16px'
          }}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={prevTestimonials}
              style={{
                padding: '10px',
                background: `rgba(${parseInt(teal[700].slice(1, 3), 16)}, ${parseInt(teal[700].slice(3, 5), 16)}, ${parseInt(teal[700].slice(5, 7), 16)}, 0.8)`,
                border: `1px solid ${teal[600]}`,
                borderRadius: '50%',
                color: white,
                cursor: 'pointer',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                width: '40px',
                height: '40px'
              }}
            >
              ‹
            </motion.button>

            {/* Pagination Dots */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {Array.from({ length: Math.ceil(testimonials.length / testimonialsPerPage) }, (_, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.2 }}
                  onClick={() => setCurrentTestimonialIndex(index)}
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: currentTestimonialIndex === index ? teal[400] : `${teal[600]}60`,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={nextTestimonials}
              style={{
                padding: '10px',
                background: `rgba(${parseInt(teal[700].slice(1, 3), 16)}, ${parseInt(teal[700].slice(3, 5), 16)}, ${parseInt(teal[700].slice(5, 7), 16)}, 0.8)`,
                border: `1px solid ${teal[600]}`,
                borderRadius: '50%',
                color: white,
                cursor: 'pointer',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                width: '40px',
                height: '40px'
              }}
            >
              ›
            </motion.button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        borderTop: `1px solid ${grey[900]}`,
        position: 'relative',
        background: 'rgba(10, 15, 10, 0.8)'
      }}>
        <Footer />
      </div>
    </div>
  );
}