
import { useEffect, useRef, useState } from "react";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";

import Navbar from "./components/Navbar";
import SectionDetails from "./components/SectionDetails";

import { apiRequest } from "./services/api";
import "./styles/global.css";

function App() {
  const [currentRoute, setCurrentRoute] = useState("landing");
  const [activePage, setActivePage] = useState("Home");
  const [activeSectionId, setActiveSectionId] = useState(null);

  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
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

        setAccessToken(token);

        const userResponse = await apiRequest(
          "/auth/me",
          { method: "GET" },
          token
        );

        setUser(userResponse.user);
        setCurrentRoute("dashboard");
      } catch (error) {
        setAccessToken(null);
        setUser(null);
        setCurrentRoute("landing");
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
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
        {
          method: "POST",
        },
        accessToken
      );
    } catch (error) {
      console.error("Logout error:", error.message);
    } finally {
      setAccessToken(null);
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
        body: JSON.stringify(sectionData),
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

    // About page
    if (page === "about") {
      return <About />;
    }

    // Contact page
    if (page === "contact") {
      return <Contact />;
    }

    // Active section
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

    // Loading sections
    if (loadingSections) {
      return <p>Loading sections...</p>;
    }

    // Home dashboard
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
        onSignup={handleSignupNavigation}
      />
    );
  }

  // Signup page
  if (currentRoute === "signup") {
    return (
      <SignupPage
        onLogin={handleLoginNavigation}
      />
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
