import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

export default function Home() {
  const [apps, setApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  
  // STORE SETTINGS & ANNOUNCEMENT
  const [settings, setSettings] = useState({
    storeName: "LannApp",
    supportEmail: "",
    telegramLink: "",
    maintenanceMode: false
  });
  
  const [announcement, setAnnouncement] = useState({ text: "", enabled: true });

  // LANGUAGE (DEFAULT ENG)
  const [lang, setLang] = useState("en");

  // SEARCH & CATEGORIES
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const appsPerPage = 8; // တစ်မျက်နှာလျှင် ပြသလိုသော App အရေအတွက်

  // PHOTO VIEWER
  const [activePhoto, setActivePhoto] = useState(null);

  // FETCH DATA FROM FIRESTORE
  useEffect(() => {
    const fetchData = async () => {
      try {
        const appsSnapshot = await getDocs(collection(db, "apps"));
        setApps(appsSnapshot.docs.map((d) => ({ ...d.data(), id: d.id })));

        const settingsDoc = await getDoc(doc(db, "settings", "store"));
        if (settingsDoc.exists()) setSettings(settingsDoc.data());

        const announcementDoc = await getDoc(doc(db, "announcements", "banner"));
        if (announcementDoc.exists()) setAnnouncement(announcementDoc.data());
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  // SEARCH / CATEGORY FILTER ပြောင်းပါက စာမျက်နှာ ၁ သို့ ပြန်စမည်
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  // EXTRACT CATEGORIES
  const categories = ["All", ...new Set(apps.map((app) => app.category || "Tools").filter(Boolean))];

  // FILTER LOGIC
  const filteredApps = apps.filter((app) => {
    const matchesSearch = app.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || (app.category || "Tools") === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // PAGINATION CALCULATIONS
  const indexOfLastApp = currentPage * appsPerPage;
  const indexOfFirstApp = indexOfLastApp - appsPerPage;
  const currentApps = filteredApps.slice(indexOfFirstApp, indexOfLastApp);
  const totalPages = Math.ceil(filteredApps.length / appsPerPage);

  // MAINTENANCE MODE SCREEN
  if (settings.maintenanceMode) {
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#0f172a", color: "#ffffff", fontFamily: "sans-serif", textAlign: "center", padding: "20px" }}>
        <div style={{ fontSize: "50px", marginBottom: "16px" }}>🛠️</div>
        <h1 style={{ fontSize: "2rem", marginBottom: "8px" }}>Under Maintenance</h1>
        <p style={{ color: "#94a3b8", maxWidth: "400px" }}>We are currently updating the store. Please check back soon!</p>
      </div>
    );
  }

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', Padauk, sans-serif" }}>

      {/* HEADER NAVIGATION */}
      <header style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0", padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontWeight: "900",
            fontSize: "22px"
          }}>
            L
          </div>
          <span style={{ fontSize: "1.35rem", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.5px" }}>
            {settings.storeName || "LannApp"}
          </span>
        </div>

        <div style={{ display: "flex", background: "#f1f5f9", padding: "4px", borderRadius: "10px", gap: "4px", border: "1px solid #cbd5e1" }}>
          <button onClick={() => setLang("mm")} style={{ border: "none", padding: "6px 14px", borderRadius: "8px", background: lang === "mm" ? "#d97706" : "transparent", color: lang === "mm" ? "#ffffff" : "#64748b", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}>MM</button>
          <button onClick={() => setLang("en")} style={{ border: "none", padding: "6px 14px", borderRadius: "8px", background: lang === "en" ? "#d97706" : "transparent", color: lang === "en" ? "#ffffff" : "#64748b", fontWeight: "800", fontSize: "12px", cursor: "pointer" }}>ENG</button>
        </div>
      </header>

      {/* ANNOUNCEMENT BANNER */}
      {announcement.text && announcement.text.trim() !== "" && (
        <div style={{ background: "linear-gradient(90deg, #d97706 0%, #f59e0b 100%)", color: "#ffffff", padding: "12px 20px", textAlign: "center", fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
          <span>📢</span> {announcement.text}
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 20px" }}>
        
        {/* SEARCH BAR & CATEGORIES */}
        <div style={{ marginBottom: "28px", display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" }}>
          <div style={{ width: "100%", maxWidth: "500px" }}>
            <input
              type="text"
              placeholder={lang === "mm" ? "အက်ပ်အမည်ဖြင့် ရှာဖွေပါ..." : "Search applications or websites..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "100%", padding: "12px 18px", borderRadius: "30px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "6px 16px",
                  borderRadius: "20px",
                  background: selectedCategory === cat ? "#0f172a" : "#ffffff",
                  color: selectedCategory === cat ? "#ffffff" : "#64748b",
                  fontWeight: "700",
                  fontSize: "12px",
                  cursor: "pointer",
                  border: "1px solid #e2e8f0"
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* APP GRID */}
        {currentApps.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px", color: "#94a3b8" }}>No applications found.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px" }}>
            {currentApps.map((app) => (
              <div
                key={app.id}
                onClick={() => setSelectedApp(app)}
                style={{
                  background: "#ffffff",
                  padding: "20px",
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.04)",
                  cursor: "pointer",
                  transition: "transform 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center"
                }}
              >
                <img src={app.imageUrl || "https://via.placeholder.com/80"} alt="" style={{ width: "72px", height: "72px", borderRadius: "18px", objectFit: "cover", marginBottom: "12px" }} />
                <h3 style={{ margin: "0 0 4px 0", fontSize: "1.1rem", fontWeight: "800", color: "#0f172a" }}>{app.title}</h3>
                <span style={{ fontSize: "12px", color: "#d97706", fontWeight: "700", marginBottom: "12px" }}>By {app.developerName || "Developer"}</span>
                <span style={{ fontSize: "12px", background: "#f1f5f9", padding: "4px 10px", borderRadius: "20px", color: "#64748b", fontWeight: "600" }}>
                  v{app.version} • {app.androidReq}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* PAGINATION BUTTONS */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "40px" }}>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                background: currentPage === 1 ? "#f1f5f9" : "#ffffff",
                color: currentPage === 1 ? "#94a3b8" : "#0f172a",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                fontWeight: "700",
                fontSize: "13px"
              }}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  border: pageNum === currentPage ? "none" : "1px solid #cbd5e1",
                  background: pageNum === currentPage ? "#d97706" : "#ffffff",
                  color: pageNum === currentPage ? "#ffffff" : "#0f172a",
                  fontWeight: "800",
                  fontSize: "13px",
                  cursor: "pointer"
                }}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                background: currentPage === totalPages ? "#f1f5f9" : "#ffffff",
                color: currentPage === totalPages ? "#94a3b8" : "#0f172a",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                fontWeight: "700",
                fontSize: "13px"
              }}
            >
              Next
            </button>
          </div>
        )}

      </main>

      {/* FOOTER */}
      {(settings.supportEmail || settings.telegramLink) && (
        <footer style={{ textAlign: "center", padding: "24px", color: "#64748b", fontSize: "12px", borderTop: "1px solid #e2e8f0", marginTop: "40px" }}>
          {settings.supportEmail && <div>Support: {settings.supportEmail}</div>}
          {settings.telegramLink && (
            <div style={{ marginTop: "4px" }}>
              <a href={settings.telegramLink} target="_blank" rel="noreferrer" style={{ color: "#d97706", fontWeight: "700", textDecoration: "none" }}>
                Join Telegram Channel ↗
              </a>
            </div>
          )}
        </footer>
      )}

      {/* MODAL VIEW */}
      {selectedApp && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }} onClick={() => setSelectedApp(null)}>
          <div style={{ background: "#ffffff", width: "100%", maxWidth: "750px", maxHeight: "90vh", borderRadius: "24px", overflowY: "auto", padding: "32px", position: "relative" }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedApp(null)} style={{ position: "absolute", top: "24px", right: "24px", background: "#f1f5f9", border: "none", width: "36px", height: "36px", borderRadius: "50%", fontWeight: "800", cursor: "pointer" }}>✕</button>

            <div style={{ display: "flex", gap: "20px", alignItems: "center", marginBottom: "28px" }}>
              <img src={selectedApp.imageUrl || "https://via.placeholder.com/80"} alt="" style={{ width: "80px", height: "80px", borderRadius: "20px", objectFit: "cover" }} />
              <div>
                <h2 style={{ margin: "0 0 6px 0", fontSize: "1.6rem", fontWeight: "800", color: "#0f172a" }}>{selectedApp.title}</h2>
                <div style={{ fontSize: "14px", color: "#64748b" }}>By <a href={selectedApp.developerLink || "#"} target="_blank" rel="noreferrer" style={{ color: "#d97706", fontWeight: "700", textDecoration: "none" }}>{selectedApp.developerName || "Developer"} ↗</a></div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.9fr", gap: "20px", marginBottom: "28px" }}>
              <div style={{ display: "flex", gap: "10px", overflowX: "auto" }}>
                {selectedApp.screenshots && selectedApp.screenshots.filter(Boolean).length > 0 ? (
                  selectedApp.screenshots.filter(Boolean).map((img, idx) => (
                    <img key={idx} src={img} alt="" onClick={() => setActivePhoto(img)} style={{ width: "110px", height: "190px", borderRadius: "12px", objectFit: "cover", cursor: "pointer" }} />
                  ))
                ) : (
                  <div style={{ width: "100%", height: "180px", background: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: "12px" }}>No Screenshots</div>
                )}
              </div>

              <div style={{ background: "#fffbe2", border: "1px solid #fef08a", borderRadius: "16px", padding: "18px" }}>
                <h4 style={{ margin: "0 0 12px 0", color: "#854d0e", fontSize: "13px", fontWeight: "800", textAlign: "center", textTransform: "uppercase" }}>App Specifications</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px", color: "#475569" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span>Android Req:</span> <strong style={{ color: "#d97706" }}>{selectedApp.androidReq || "Android 6.0+"}</strong></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span>Version:</span> <strong>{selectedApp.version || "1.0.0"}</strong></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span>App Size:</span> <strong>{selectedApp.size ? `${selectedApp.size} MB` : "N/A"}</strong></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span>Category:</span> <strong>{selectedApp.category || "Tools"}</strong></div>
                </div>
              </div>
            </div>

            <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "16px", border: "1px solid #f1f5f9", marginBottom: "24px" }}>
              <h3 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "800", color: "#0f172a" }}>ABOUT THIS APP</h3>
              <div style={{ fontSize: "13px", color: "#334155", lineHeight: "1.7", whiteSpace: "pre-line" }}>
                {lang === "mm" ? (selectedApp.descMM || selectedApp.descEN) : (selectedApp.descEN || selectedApp.descMM)}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
              {selectedApp.driveUrl && <a href={selectedApp.driveUrl} target="_blank" rel="noreferrer" style={{ textAlign: "center", background: "#d97706", color: "#fff", padding: "12px", borderRadius: "12px", fontWeight: "800", textDecoration: "none", fontSize: "13px" }}>Download Primary 📥</a>}
              {selectedApp.driveUrl2 && <a href={selectedApp.driveUrl2} target="_blank" rel="noreferrer" style={{ textAlign: "center", background: "#f1f5f9", color: "#334155", padding: "12px", borderRadius: "12px", fontWeight: "700", textDecoration: "none", fontSize: "13px", border: "1px solid #cbd5e1" }}>Mirror Link 1 🔗</a>}
              {selectedApp.driveUrl3 && <a href={selectedApp.driveUrl3} target="_blank" rel="noreferrer" style={{ textAlign: "center", background: "#f1f5f9", color: "#334155", padding: "12px", borderRadius: "12px", fontWeight: "700", textDecoration: "none", fontSize: "13px", border: "1px solid #cbd5e1" }}>Mirror Link 2 🔗</a>}
            </div>
          </div>
        </div>
      )}

      {/* PHOTO VIEWER */}
      {activePhoto && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0, 0, 0, 0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "20px" }} onClick={() => setActivePhoto(null)}>
          <img src={activePhoto} alt="" style={{ maxWidth: "90%", maxHeight: "90vh", borderRadius: "12px" }} />
        </div>
      )}

    </div>
  );
}