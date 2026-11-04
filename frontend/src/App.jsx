import { useCallback, useEffect, useRef, useState } from "react";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";

import Navbar from "./components/Navbar";
import SectionDetails from "./components/SectionDetails";

import { apiRequest, setAccessToken } from "./services/api";
import "./styles/global.css";

// Render free tier so jata hai, pehli request pe 30-60 sec lag sakte hain.
// Isliye session restore me network/5xx error pe thoda retry karte hain.
const RESTORE_MAX_TRIES = 4;
const RESTORE_RETRY_DELAY = 5000;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// NOTE: apiRequest error ka status kaise deta hai uske hisab se ye adjust karna
const isUnauthorized = (error) =>
  error?.status === 401 || error?.response?.status === 401;

function App() {
  const [currentRoute, setCurrentRoute] = useState("landing");
  const [activePage, setActivePage] = useState("Home");
  const [activeSectionId, setActiveSectionId] = useState(null);

  const [user, setUser] = useState(null);
  const [accessToken, setAccessTokenState] = useState(null);
  const [sections, setSections] = useState([]);

  const [loading, setLoading] = useState(true);
  const [serverWaking, setServerWaking] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);
  const [sectionError, setSectionError] = useState("");

  const restoreStarted = useRef(false);

  // Logout, session expire, restore fail - teeno jagah yahi reset chahiye,
  // pehle ye code 3 jagah copy tha
  const resetSession = useCallback(() => {
    setAccessToken(null);
    setAccessTokenState(null);
    setUser(null);
    setSections([]);
    setActiveSectionId(null);
    setActivePage("Home");
    setCurrentRoute("landing");
  }, []);

  // Restore existing login session
  useEffect(() => {
    if (restoreStarted.current) return;
    restoreStarted.current = true;

    const tryRestore = async () => {
      const response = await apiRequest("/auth/refresh", { method: "POST" });
      const token = response.accessToken;

      if (!token) {
        throw new Error("Access token not received.");
      }

      setAccessToken(token);
      setAccessTokenState(token);

      const userResponse = await apiRequest(
        "/auth/me",
        { method: "GET" },
        token
      );

      setUser(userResponse.user);
      setCurrentRoute("dashboard");
    };

    const restoreSession = async () => {
      for (let attempt = 1; attempt <= RESTORE_MAX_TRIES; attempt++) {
        try {
          await tryRestore();
          break;
        } catch (error) {
          const lastTry = attempt === RESTORE_MAX_TRIES;

          // 401 = cookie nahi hai / token invalid -> sach me logout hai, retry ka fayda nahi
          // baaki errors (network, 502, timeout) = server shayad abhi jaag raha hai
          if (isUnauthorized(error) || lastTry) {
            resetSession();
            break;
          }

          setServerWaking(true);
          await wait(RESTORE_RETRY_DELAY);
        }
      }

      setServerWaking(false);
      setLoading(false);
    };

    restoreSession();
  }, [resetSession]);

  // Handle expired refresh session
  useEffect(() => {
    window.addEventListener("auth:session-expired", resetSession);

    return () => {
      window.removeEventListener("auth:session-expired", resetSession);
    };
  }, [resetSession]);

  // Fetch sections after login or session restoration
  useEffect(() => {
    if (currentRoute !== "dashboard" || !accessToken) return;

    // agar beech me logout ho gaya to purani request ka result state me na jaye
    let cancelled = false;

    const fetchSections = async () => {
      try {
        setLoadingSections(true);
        setSectionError("");

        const response = await apiRequest(
          "/sections",
          { method: "GET" },
          accessToken
        );

        if (cancelled) return;

        const formattedSections = (response.sections || []).map((section) => ({
          ...section,
          id: section._id,
        }));

        setSections(formattedSections);
      } catch (error) {
        if (!cancelled) {
          setSectionError(error.message || "Failed to load sections.");
        }
      } finally {
        if (!cancelled) {
          setLoadingSections(false);
        }
      }
    };

    fetchSections();

    return () => {
      cancelled = true;
    };
  }, [currentRoute, accessToken]);

  // Login handler
  const handleLogin = (response) => {
    setAccessToken(response.accessToken);
    setAccessTokenState(response.accessToken);

    setUser(response.user);
    setActivePage("Home");
    setActiveSectionId(null);
    setCurrentRoute("dashboard");
  };

  // Navigation handlers
  const handleLoginNavigation = () => setCurrentRoute("login");
  const handleSignupNavigation = () => setCurrentRoute("signup");

  // Logout handler
  const handleLogout = async () => {
    try {
      await apiRequest("/auth/logout", { method: "POST" }, accessToken);
    } catch (error) {
      // server pe fail bhi ho jaye to bhi local session clear karna hai
      console.error("Logout error:", error.message);
    } finally {
      resetSession();
    }
  };

  // Create section
  const handleCreateSection = async (sectionData) => {
    const response = await apiRequest(
      "/sections",
      {
        method: "POST",
        data: sectionData,
      },
      accessToken
    );

    const newSection = {
      ...response.section,
      id: response.section._id,
    };

    setSections((previous) => [...previous, newSection]);

    return newSection;
  };

  // Update section
  const handleUpdateSection = (updatedSection) => {
    setSections((previous) =>
      previous.map((section) =>
        section.id === updatedSection.id
          ? { ...section, ...updatedSection }
          : section
      )
    );
  };

  // Find active section
  const activeSection = sections.find(
    (section) => section.id === activeSectionId
  );

  // Dashboard page rendering
  const renderDashboard = () => {
    const page = String(activePage || "Home").trim().toLowerCase();

    if (page === "about") {
      return <About />;
    }

    if (page === "contact") {
      return <Contact />;
    }

    if (activeSectionId) {
      if (loadingSections) {
        return <p>Loading section...</p>;
      }

      if (!activeSection) {
        return <p>Section not found.</p>;
      }

      return (
        <SectionDetails
          section={activeSection}
          accessToken={accessToken}
          onBack={() => setActiveSectionId(null)}
          onUpdateSection={handleUpdateSection}
        />
      );
    }

    if (loadingSections) {
      return <p>Loading sections...</p>;
    }

    return (
      <>
        {sectionError && <p className="error-message">{sectionError}</p>}

        <Home
          sections={sections}
          onCreateSection={handleCreateSection}
          onOpenSection={setActiveSectionId}
        />
      </>
    );
  };

  // Initial loading
  if (loading) {
    return (
      <p>
        {serverWaking
          ? "Server start ho raha hai, thoda wait karo (30-60 sec lag sakte hain)..."
          : "Loading application..."}
      </p>
    );
  }

  // Landing page
  if (currentRoute === "landing") {
    return (
      <LandingPage
        onLogin={handleLoginNavigation}
        onSignup={handleSignupNavigation}
      />
    );
  }

  // Login page
  if (currentRoute === "login") {
    return <LoginPage onLogin={handleLogin} onNavigate={setCurrentRoute} />;
  }

  // Signup page
  if (currentRoute === "signup") {
    return <SignupPage onLogin={handleLoginNavigation} />;
  }

  // Main dashboard
  if (currentRoute === "dashboard") {
    return (
      <div className="app-container">
        <Navbar
          activePage={activePage}
          setActivePage={(page) => {
            setActiveSectionId(null);
            setActivePage(page);
          }}
          onLogout={handleLogout}
        />

        {renderDashboard()}
      </div>
    );
  }

  return null;
}

export default App;