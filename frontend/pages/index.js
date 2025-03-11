import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import { productAPI, cartAPI } from "../utils/api";
import { useRouter } from "next/navigation";
import InfiniteImageScroll from "../components/InfiniteImageScroll";


// Extracted styles to JavaScript objects (keeping your original styles)
const styles = {
  // Update the hero style to contain the background image properly
  hero: {
    backgroundImage: "url('/images/background.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    height: "80vh",
    width: "99vw", // Set to full width
    margin: "0", // Remove any margin
    padding: "0",
    position: "relative",
    display: "flex",
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    overflow: "hidden",
  },

// Keep heroContent the same
heroContent: {
  display: "flex",
  flexDirection: "column",
  width: "100%",
},

// Other styles remain unchanged
  saleTag: {
    backgroundColor: "#e8d5c0",
    padding: "24px 36px",
    display: "inline-block",
    marginBottom: "40px",
    fontSize: "2.3rem",
    color: "#333333",
    textTransform: "uppercase",
    fontWeight: "600",
    maxWidth: "fit-content",
  },
  heroTitle: {
    fontSize: "5.5rem",
    fontWeight: "400",
    color: "#333333",
    marginBottom: "0",
    fontFamily: "serif",
    lineHeight: "1.1",
    textAlign: "left",
  },
  heroDescription: {
    fontSize: "4rem",
    color: "#5a5a5a",
    marginTop: "25px",
    marginBottom: "40px",
    lineHeight: "1.2",
    maxWidth: "65%",
    fontWeight: "300",
    textAlign: "left",
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "32px",
    alignItems: "flex-start",
  },
  primaryButton: {
    padding: "32px 0",
    backgroundColor: "#b89b7a",
    color: "white",
    border: "none",
    width: "100%",
    maxWidth: "420px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "2.4rem",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  categoryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(5, 1fr)",
    gap: "16px",
    width: "100%",
  },
  categoryCard: {
    backgroundColor: "white",
    border: "1px solid #f0f0f0",
    borderRadius: "0.5rem",
    transition: "transform 0.3s, box-shadow 0.3s",
    overflow: "hidden",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    marginBottom: "16px",
  },
  categoryImageContainer: {
    position: "relative",
    paddingTop: "100%",
    width: "100%",
    overflow: "hidden",
    borderTopLeftRadius: "0.5rem",
    borderTopRightRadius: "0.5rem",
  },
  categoryImage: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  categoryTitle: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#333333",
    margin: "0",
    lineHeight: "1.2",
    textAlign: "center",
  },
  exploreButton: {
    padding: "8px 16px",
    backgroundColor: "#c59b77",
    color: "white",
    border: "none",
    width: "90%",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "1rem",
    textAlign: "center",
    textTransform: "uppercase",
    borderRadius: "8px",
    margin: "0 auto",
    display: "inline-block",
    transition: "background-color 0.3s ease",
  },
  givaInfo: {
    fontSize: "0.85rem",
    color: "#666",
    textAlign: "center",
    padding: "0 0.5rem 0.5rem",
    fontStyle: "italic"
  },
  // Style for the global paragraph below all images
  globalMessage: {
    fontSize: "1.2rem",
    color: "#333",
    textAlign: "center",
    margin: "2rem auto",
    padding: "1rem",
    maxWidth: "900px",
    lineHeight: "1.6",
    backgroundColor: "#f9f5f0",
    borderRadius: "0.5rem",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    border: "1px solid #e8d5c0"
  },
  // New styles for contact section
  contactSection: {
    backgroundColor: "#f0e8df",
    padding: "3rem 0",
    marginTop: "3rem",
    borderTop: "1px solid #e8d5c0"
  },
  contactContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 1rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  contactTitle: {
    fontSize: "2.5rem",
    color: "#7a3e30",
    marginBottom: "2rem",
    textAlign: "center",
    fontWeight: "500"
  },
  contactGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "2rem",
    width: "100%"
  },
  contactCard: {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "0.5rem",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  contactIcon: {
    width: "3rem",
    height: "3rem",
    backgroundColor: "#c59b77",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "1rem"
  },
  contactCardTitle: {
    fontSize: "1.5rem",
    color: "#333",
    marginBottom: "0.5rem",
    fontWeight: "500"
  },
  contactInfo: {
    fontSize: "1.1rem",
    color: "#555",
    lineHeight: "1.6"
  },
  socialLinks: {
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
    marginTop: "2rem"
  },
  socialIcon: {
    width: "2.5rem",
    height: "2.5rem",
    backgroundColor: "#c59b77",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    transition: "background-color 0.3s ease",
    cursor: "pointer"
  },
  // New styles for About GIVA section
  aboutSection: {
    backgroundColor: "#fff",
    padding: "4rem 0",
    marginTop: "3rem",
    borderTop: "1px solid #e8d5c0"
  },
  aboutContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 2rem",
  },
  aboutTitle: {
    fontSize: "2.5rem",
    color: "#7a3e30",
    marginBottom: "1.5rem",
    textAlign: "center",
    fontWeight: "500",
    fontFamily: "serif"
  },
  aboutSubtitle: {
    fontSize: "1.8rem",
    color: "#c59b77",
    marginBottom: "2rem",
    textAlign: "center",
    fontWeight: "400",
    fontStyle: "italic"
  },
  aboutGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "3rem",
    alignItems: "center"
  },
  aboutImage: {
    width: "100%",
    borderRadius: "0.5rem",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  aboutContent: {
    fontSize: "1.1rem",
    color: "#555",
    lineHeight: "1.8",
  },
  aboutFeatures: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1.5rem",
    marginTop: "3rem"
  },
  featureCard: {
    backgroundColor: "#f9f5f0",
    padding: "1.5rem",
    borderRadius: "0.5rem",
    textAlign: "center",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
  },
  featureIcon: {
    width: "3rem",
    height: "3rem",
    backgroundColor: "#c59b77",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1rem auto"
  },
  featureTitle: {
    fontSize: "1.3rem",
    color: "#333",
    marginBottom: "0.5rem",
    fontWeight: "500"
  },
  featureText: {
    fontSize: "1rem",
    color: "#666",
    lineHeight: "1.6"
  }
};

// GIVA product information
const givaProductInfo = {
  "Finger rings": "GIVA 925 sterling silver rings with BIS hallmark. Tarnish-resistant and hypoallergenic.",
  "Neckwear": "GIVA premium necklaces crafted with 925 sterling silver. Ethically sourced gemstones.",
  "Nose pin": "GIVA signature nose pins in 18K gold plating. Perfect for everyday wear.",
  "Pendants": "GIVA handcrafted pendants with premium zircon stones. Each piece is unique.",
  "Watch jewellary": "GIVA luxury timepieces with Swiss movement. Limited edition designs.",
  // Add info for other categories
  "Ankle wear": "GIVA silver anklets with traditional and modern designs. Adjustable fit for comfort.",
  "Bangles": "GIVA handcrafted bangles with intricate details. Available in multiple sizes.",
  "Bracelets": "GIVA premium bracelets with secure clasps. Ideal for gifting and daily wear.",
  "Chains": "GIVA delicate chains crafted with precision. Various lengths available.",
  "Ear rings": "GIVA elegant earrings with premium stones. Suitable for all occasions."
};

export default function HomePage() {
  const [showCategories, setShowCategories] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoverStates, setHoverStates] = useState({
    categoryCards: {},
    exploreButtons: {},
    socialIcons: {}
  });
  const [addedToCart, setAddedToCart] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
const collectionImages = [
  "/images/bracelets.jpeg",
  "/images/bracelets.jpeg",
  "/images/bracelets.jpeg",
  "/images/bracelets.jpeg",
];

const prevSlide = () => {
  setCurrentIndex((prev) => (prev === 0 ? collectionImages.length - 1 : prev - 1));
};

const nextSlide = () => {
  setCurrentIndex((prev) => (prev + 1) % collectionImages.length);
};

//  Add useEffect HERE (before return)
useEffect(() => {
  const interval = setInterval(() => {
    setCurrentIndex((prev) => (prev + 1) % collectionImages.length);
  }, 3000);
  return () => clearInterval(interval);
}, []);

  
  // Create refs for scrolling
  const categoryRef = useRef(null);
  const aboutRef = useRef(null);
 
  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  // Fetch products from API when component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productAPI.getAll();
        
        if (response.data && response.data.success) {
          setProducts(response.data.products);
        } else {
          setError("Failed to fetch products");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Error connecting to the server");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > window.innerHeight / 2) {
        setShowCategories(true);
      } else {
        setShowCategories(false);
      }
    };
 
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
 
  // Handlers for hover states
  const handleCardMouseOver = (id) => {
    setHoverStates(prev => ({
      ...prev,
      categoryCards: {
        ...prev.categoryCards,
        [id]: true
      }
    }));
  };

  const handleCardMouseOut = (id) => {
    setHoverStates(prev => ({
      ...prev,
      categoryCards: {
        ...prev.categoryCards,
        [id]: false
      }
    }));
  };

  const handleButtonMouseOver = (id) => {
    setHoverStates(prev => ({
      ...prev,
      exploreButtons: {
        ...prev.exploreButtons,
        [id]: true
      }
    }));
  };

  const handleButtonMouseOut = (id) => {
    setHoverStates(prev => ({
      ...prev,
      exploreButtons: {
        ...prev.exploreButtons,
        [id]: false
      }
    }));
  };

  // New handlers for social icon hover states
  const handleSocialIconMouseOver = (id) => {
    setHoverStates(prev => ({
      ...prev,
      socialIcons: {
        ...prev.socialIcons,
        [id]: true
      }
    }));
  };

  const handleSocialIconMouseOut = (id) => {
    setHoverStates(prev => ({
      ...prev,
      socialIcons: {
        ...prev.socialIcons,
        [id]: false
      }
    }));
  };

  // Handle adding product to cart - UPDATED
  const handleAddToCart = async (productId) => {
    // Check if user is logged in
    if (!isLoggedIn) {
      // Redirect to login page instead of showing modal
      router.push('/login');
      return;
    }
    
    try {
      const response = await cartAPI.addItem(productId);
      console.log('Product added to cart:', response.data);
      // Show temporary "Added to cart" confirmation
      setAddedToCart(prev => ({ ...prev, [productId]: true }));
      
      // Reset confirmation after 2 seconds
      setTimeout(() => {
        setAddedToCart(prev => ({ ...prev, [productId]: false }));
      }, 2000);
    } catch (err) {
      console.error('Error adding product to cart:', err);
      // If we get a 401 error, the user's token might be invalid
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        router.push('/login');
      }
    }
  };
  

  // Scroll handling for navigation buttons
  const scrollToCategories = () => {
    if (categoryRef.current) {
      categoryRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToAbout = () => {
    if (aboutRef.current) {
      aboutRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navbar component */}
      <Navbar />
      
      {/* Adding a spacer to account for the fixed navbar */}
      <div className="h-20"></div>
      {/* Hero Section */}
<div style={{ 
  position: "relative", 
  width: "100%", 
  height: "100vh", 
  display: "flex", 
  alignItems: "center", 
  justifyContent: "left", 
  paddingLeft: "5%", 
}}>
  {/* Background Image with Opacity */}
  <div style={{
    position: "absolute",
    top: 0,
    left: 0,
    width: "96.5%",
    height: "100%",
    backgroundImage: "url('/images/background.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    filter: "brightness(60%)",  // Makes background dull
  }}></div>

  {/* Content (Text & Buttons) */}
  <div style={{
    position: "relative",
    color: "white",
    textAlign: "left",
    maxWidth: "500px",
  }}>
    {/* Sale Tag */}
    <div style={{
      background: "rgba(255, 215, 0, 0.8)", // Gold with transparency
      padding: "10px 18px",
      fontWeight: "bold",
      fontSize: "1.4rem",
      marginBottom: "25px",
      display: "inline-block",
      borderRadius: "5px",
      color: "#333"
    }}>
      SAVE UP TO 30%
    </div>

    {/* Title & Description */}
    <h1 style={{
      fontSize: "4.5rem",  // Increased size
      fontWeight: "bold",
      marginBottom: "15px",
    }}>
      Find Your <br /> New <br /> Heirloom
    </h1>
    
    <p style={{
      fontSize: "1.4rem",  // Bigger text for readability
      maxWidth: "80%",
      marginBottom: "25px",
      fontWeight: "500"
    }}>
      Certain things are made to be cherished for a lifetime—now's the time to own one you can treasure yours.
    </p>

    {/* Buttons */}
    <div style={{
      display: "flex",
      gap: "20px"
    }}>
      <button
      style={{
        padding: "16px 26px",
        backgroundColor: "#8B0000", // Deep red
        color: "white",
        border: "none",
        borderRadius: "5px",
        fontSize: "1.3rem",
        fontWeight: "bold",
        cursor: "pointer",
        transition: "0.3s",
      }}
      onMouseOver={(e) => e.target.style.backgroundColor = "#A52A2A"}
      onMouseOut={(e) => e.target.style.backgroundColor = "#8B0000"}
      onClick={scrollToCategories} // Scroll to products
    >
      SHOP NOW
    </button>

    <button
      style={{
        padding: "16px 26px",
        backgroundColor: "#DAA520", // Golden color
        color: "black",
        border: "none",
        borderRadius: "5px",
        fontSize: "1.3rem",
        fontWeight: "bold",
        cursor: "pointer",
        transition: "0.3s",
      }}
      onMouseOver={(e) => e.target.style.backgroundColor = "#B8860B"}
      onMouseOut={(e) => e.target.style.backgroundColor = "#DAA520"}
      onClick={scrollToAbout} // Scroll to about section
    >
      LEARN MORE
    </button>
    </div>
  </div>
</div>
<h3 style={{ fontSize: "2.5rem", color: "#7a3e30", marginBottom: "1.5rem", textAlign: "center" }}>Shop By Category</h3>
<InfiniteImageScroll />

      {/* Category Grid Section (Appears After Scrolling) */}
      <div
        ref={categoryRef}
        className={`transition-opacity duration-700 ${
          showCategories ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        } w-full py-16 max-w-6xl mx-auto`}
      >
        <div className="container mx-auto px-4 py-16"></div>
        <div className="text-center mb-12"></div>
        <h2 
  className="text-4xl font-semibold text-center text-[#7a3e30] mb-6 flex justify-center items-center" 
  style={{ 
    textAlign: "center", 
    fontSize: "2.5rem", 
    fontWeight: "bold", 
    color: "#7a3e30", 
    marginBottom: "1.5rem", 
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center" 
  }}
>
  Our Collections
</h2>


        <div className="flex justify-center my-4">
          <div className="w-24 h-1 bg-[#c59b77] rounded"></div>
          <div className="w-24 h-1 bg-[#c59b77] rounded"></div>
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#c59b77]"></div>
            <p className="mt-4 text-gray-600">Loading products...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <button 
              className="mt-4 px-4 py-2 bg-[#c59b77] text-white rounded"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        )}
 
        {/* Products Grid - Using the fetched data */}
        {!loading && !error && (
          <div id="items-section" className="w-full px-4 mt-8">
            <div style={styles.categoryGrid}>
              {products.map((product) => (
                <div 
                  key={product._id} 
                  style={{
                    ...styles.categoryCard,
                    transform: hoverStates.categoryCards[product._id] ? "translateY(-4px)" : "translateY(0)",
                    boxShadow: hoverStates.categoryCards[product._id] 
                      ? "0 4px 8px rgba(0,0,0,0.1)" 
                      : "0 1px 2px rgba(0,0,0,0.05)"
                  }}
                  onMouseOver={() => handleCardMouseOver(product._id)}
                  onMouseOut={() => handleCardMouseOut(product._id)}
                >
                  <div style={styles.categoryImageContainer}>
                    <img 
                      src={product.image}
                      alt={product.name} 
                      style={styles.categoryImage}
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = "/images/placeholder.jpg";
                      }}
                    />
                  </div>
                  <div style={{ padding: "0.5rem" }}>
                    <h3 style={styles.categoryTitle}>{product.name}</h3>
                    <p className="text-center text-gray-700">${product.price.toFixed(2)}</p>
                    
                    {/* GIVA Product Info */}
                    {givaProductInfo[product.name] && (
                      <p style={styles.givaInfo}>
                        {givaProductInfo[product.name]}
                      </p>
                    )}
                    
                    <div style={{ textAlign: "center", marginTop: "8px" }}>
                      <button 
                        style={{
                          ...styles.exploreButton,
                          backgroundColor: addedToCart[product._id] 
                            ? "#4CAF50" // Green when added to cart
                            : hoverStates.exploreButtons[product._id] 
                              ? "#b38e22" 
                              : "#c59b77"
                        }}
                        onMouseOver={() => handleButtonMouseOver(product._id)}
                        onMouseOut={() => handleButtonMouseOut(product._id)}
                        onClick={() => handleAddToCart(product._id)}
                      >
                        {addedToCart[product._id] ? "ADDED!" : "ADD TO CART"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Global paragraph below all product images */}
            <div style={styles.globalMessage}>
              Our jewelry collection features handcrafted pieces made with premium materials. Each item comes with a certificate of authenticity and a 30-day satisfaction guarantee. Enjoy free shipping on orders over $100 and complimentary gift wrapping for all purchases. Join our rewards program to earn points with every purchase and receive exclusive member-only discounts.
            </div>
          </div>
        )}

        {/* Show fallback message if no products are available */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No products found. Please check back later.</p>
          </div>
        )}
      </div>

      {/* New About GIVA Section */}
      <div style={styles.aboutSection} ref={aboutRef}>
        <div style={styles.aboutContainer}>
          <h2 style={styles.aboutTitle}>About GIVA</h2>
          <p style={styles.aboutSubtitle}>Crafting Timeless Elegance Since 2019</p>
          
          <div style={styles.aboutGrid}>
            <div>
              <img 
                src="https://assets.website-files.com/62c7d8a855813a2bbe39ae10/62d546eca73d90f3c3ae78ff_Case%20Study%20Banners%20(7).png" 
                alt="GIVA Craftsmanship" 
                style={styles.aboutImage}
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = "/images/placeholder.jpg";
                }}
              />
            </div>
            
            <div style={styles.aboutContent}>
              <p>
                Founded in 2019, GIVA has quickly established itself as India's premier silver jewelry brand, offering exquisite pieces that blend traditional craftsmanship with contemporary design sensibilities.
              </p>
              <p style={{ marginTop: "1rem" }}>
                Our 925 sterling silver jewelry collection is crafted by skilled artisans with decades of experience. We source only the highest quality materials, including ethically mined gemstones and premium zircon for that perfect sparkle.
              </p>
              <p style={{ marginTop: "1rem" }}>
                GIVA proudly holds the Bureau of Indian Standards (BIS) hallmark certification, guaranteeing the authenticity and purity of our silver. Every piece undergoes rigorous quality testing and is finished with a protective layer to prevent tarnishing.
              </p>
              <p style={{ marginTop: "1rem" }}>
                Whether you're looking for everyday elegance or statement pieces for special occasions, GIVA offers versatile designs that complement every style and personality. From traditional motifs to minimalist contemporary pieces, our collections cater to diverse tastes.
              </p>
            </div>
          </div>
          <div style={styles.aboutFeatures}>
            {/* Premium Quality */}
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
              </div>
              <h3 style={styles.featureTitle}>Premium Quality</h3>
              <p style={styles.featureText}>
                All GIVA jewelry is crafted with 925 sterling silver, 18K gold plating, and premium gemstones. Our pieces are hypoallergenic and tarnish-resistant for lasting beauty.
              </p>
            </div>
            
            {/* Ethical Sourcing */}
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h3 style={styles.featureTitle}>Ethical Sourcing</h3>
              <p style={styles.featureText}>
                We're committed to responsible sourcing of all our materials. GIVA works with suppliers who uphold fair labor practices and environmental standards.
              </p>
            </div>
            
            {/* Artisan Craftsmanship */}
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 10h18"></path>
                  <path d="M3 14h18"></path>
                  <path d="M12 3v18"></path>
                  <path d="M8 6L8.45 8.27"></path>
                  <path d="M16 6L15.55 8.27"></path>
                  <path d="M4.5 19.5L8.5 14.5"></path>
                  <path d="M19.5 19.5L15.5 14.5"></path>
                </svg>
              </div>
              <h3 style={styles.featureTitle}>Artisan Craftsmanship</h3>
              <p style={styles.featureText}>
                Each GIVA piece is handcrafted by skilled artisans who bring generations of jewelry-making expertise. Our designs celebrate India's rich heritage of craftsmanship.
              </p>
            </div>
          </div>
          
          <div style={{ marginTop: "3rem", textAlign: "center" }}>
            
            <div style={{ marginTop: "3rem", textAlign: "center" }}>
  
  
  
  
</div>

            
            
          </div>
        </div>
      </div>
      

      {/* Contact Section */}
      <div style={styles.contactSection}>
        <div style={styles.contactContainer}>
          <h2 style={styles.contactTitle}>Contact Us</h2>
          
          <div style={styles.contactGrid}>
            {/* Customer Service */}
            <div style={styles.contactCard}>
              <div style={styles.contactIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
              <h3 style={styles.contactCardTitle}>Customer Service</h3>
              <div style={styles.contactInfo}>
                <p>1-800-JEWELRY (1-800-539-3579)</p>
                <p>Available 24/7</p>
                <p>support@jewelry.com</p>
              </div>
            </div>
            
            {/* Store Locations */}
            <div style={styles.contactCard}>
              <div style={styles.contactIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <h3 style={styles.contactCardTitle}>Store Locations</h3>
              <div style={styles.contactInfo}>
                <p>New York: 123 5th Avenue</p>
                <p>Los Angeles: 456 Rodeo Drive</p>
                <p>Chicago: 789 Michigan Avenue</p>
                <p>Find a store near you</p>
              </div>
            </div>
            
            {/* Corporate Office */}
            <div style={styles.contactCard}>
              <div style={styles.contactIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
              </div>
              <h3 style={styles.contactCardTitle}>Corporate Office</h3>
              <div style={styles.contactInfo}>
                <p>Jewelry Headquarters</p>
                <p>1000 Diamond Street, Suite 500</p>
                <p>San Francisco, CA 94103</p>
                <p>corporate@jewelry.com</p>
              </div>
            </div>
          </div>
          
          {/* Social Media Links */}
          <div style={styles.socialLinks}>
            {/* Facebook */}
            <div 
              style={{
                ...styles.socialIcon,
                backgroundColor: hoverStates.socialIcons['facebook'] ? "#3b5998" : "#c59b77"
              }}
              onMouseOver={() => handleSocialIconMouseOver('facebook')}
              onMouseOut={() => handleSocialIconMouseOut('facebook')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 24 24">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </div>
            
            {/* Instagram */}
            <div 
              style={{
                ...styles.socialIcon,
                backgroundColor: hoverStates.socialIcons['instagram'] ? "#e1306c" : "#c59b77"
              }}
              onMouseOver={() => handleSocialIconMouseOver('instagram')}
              onMouseOut={() => handleSocialIconMouseOut('instagram')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </div>
            
            {/* Twitter */}
            <div 
              style={{
                ...styles.socialIcon,
                backgroundColor: hoverStates.socialIcons['twitter'] ? "#1DA1F2" : "#c59b77"
              }}
              onMouseOver={() => handleSocialIconMouseOver('twitter')}
              onMouseOut={() => handleSocialIconMouseOut('twitter')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
              </svg>
            </div>
            
            {/* Pinterest */}
            <div 
              style={{
                ...styles.socialIcon,
                backgroundColor: hoverStates.socialIcons['pinterest'] ? "#E60023" : "#c59b77"
              }}
              onMouseOver={() => handleSocialIconMouseOver('pinterest')}
              onMouseOut={() => handleSocialIconMouseOut('pinterest')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 24 24">
                <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 0 1-5-1.7v-.6c.5-1.8 1.9-3.3 3.7-3.3.4 0 .8.1 1.2.2-.1.2-.1.4-.1.7 0 1.4 1.1 2.5 2.5 2.5s2.5-1.1 2.5-2.5-1.1-2.5-2.5-2.5c-.3 0-.7.1-1 .2.2-.5.3-1 .3-1.5 0-2.2-1.8-4-4-4s-4 1.8-4 4c0 .5.1 1 .3 1.5 1.5-.2 2.7-1.4 2.7-2.9 0-.3-.1-.5-.1-.8.4-.5.8-.8 1.4-.8.9 0 1.6.8 1.6 1.6 0 1.2-1.3 2.4-1.3 3.6 0 .4.1.9.3 1.3-1.5.7-2.6 2.2-2.6 4 0 .3 0 .5.1.7A8 8 0 0 1 12 4a8 8 0 0 1 0 16z"></path>
              </svg>
            </div>
            
            {/* YouTube */}
            <div 
              style={{
                ...styles.socialIcon,
                backgroundColor: hoverStates.socialIcons['youtube'] ? "#FF0000" : "#c59b77"
              }}
              onMouseOver={() => handleSocialIconMouseOver('youtube')}
              onMouseOut={() => handleSocialIconMouseOut('youtube')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 24 24">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
