
import { useEffect, useRef, useState } from "react";

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

function App() {
  const [currentRoute, setCurrentRoute] = useState("landing");
  const [activePage, setActivePage] = useState("Home");
  const [activeSectionId, setActiveSectionId] = useState(null);

  const [user, setUser] = useState(null);
  const [accessToken, setAccessTokenState] = useState(null);
  const [sections, setSections] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingSections, setLoadingSections] = useState(false);
  const [sectionError, setSectionError] = useState("");

  const restoreStarted = useRef(false);

  // Restore existing login session
  useEffect(() => {
    if (restoreStarted.current) return;

    restoreStarted.current = true;

    const restoreSession = async () => {
      try {
        const response = await apiRequest("/auth/refresh", {
          method: "POST",
        });

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

      } catch (error) {
        setAccessToken(null);
        setAccessTokenState(null);
        setUser(null);
        setCurrentRoute("landing");

      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);


  // Handle expired refresh session
  useEffect(() => {
    const handleSessionExpired = () => {
      setAccessToken(null);
      setAccessTokenState(null);
      setUser(null);
      setSections([]);
      setActiveSectionId(null);
      setActivePage("Home");
      setCurrentRoute("landing");
    };

    window.addEventListener(
      "auth:session-expired",
      handleSessionExpired
    );

    return () => {
      window.removeEventListener(
        "auth:session-expired",
        handleSessionExpired
      );
    };
  }, []);

  // Fetch all sections
  const fetchSections = async (token = accessToken) => {
    if (!token) return;

    try {
      setLoadingSections(true);
      setSectionError("");

      const response = await apiRequest(
        "/sections",
        { method: "GET" },
        token
      );

      const formattedSections = (response.sections || []).map((section) => ({
        ...section,
        id: section._id,
      }));

      setSections(formattedSections);

    } catch (error) {
      setSectionError(error.message || "Failed to load sections.");

    } finally {
      setLoadingSections(false);
    }
  };

  // Fetch sections after login or session restoration
  useEffect(() => {
    if (currentRoute === "dashboard" && accessToken) {
      fetchSections(accessToken);
    }
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
  const handleLoginNavigation = () => {
    setCurrentRoute("login");
  };

  const handleSignupNavigation = () => {
    setCurrentRoute("signup");
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await apiRequest(
        "/auth/logout",
        { method: "POST" },
        accessToken
      );

    } catch (error) {
      console.error("Logout error:", error.message);

    } finally {
      setAccessToken(null);
      setAccessTokenState(null);

      setUser(null);
      setSections([]);
      setActiveSectionId(null);
      setActivePage("Home");
      setCurrentRoute("landing");
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
        {sectionError && (
          <p className="error-message">{sectionError}</p>
        )}

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
    return <p>Loading application...</p>;
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
    return (
      <LoginPage
        onLogin={handleLogin}
        onNavigate={setCurrentRoute}
      />
    );
  }

  // Signup page
  if (currentRoute === "signup") {
    return (
      <SignupPage onLogin={handleLoginNavigation} />
    );
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
