import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

// 📱 1. IFRAME BANNER AD COMPONENT (320x50)
const BannerAd = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.highrevenueformat.com/c4ccc59e36d7eda4b666db60e6760f19/invoke.js";
    script.async = true;

    window.atOptions = {
      key: "c4ccc59e36d7eda4b666db60e6760f19",
      format: "iframe",
      height: 50,
      width: 320,
      params: {}
    };

    const adContainer = document.getElementById("banner-ad-container");
    if (adContainer && !adContainer.hasChildNodes()) {
      adContainer.appendChild(script);
    }
  }, []);

  return (
    <div style={{ display: "flex", justifyContent: "center", margin: "12px 0" }}>
      <div id="banner-ad-container" style={{ minWidth: "320px", minHeight: "50px" }}></div>
    </div>
  );
};

// 📰 2. NATIVE AD WIDGET
const ModalAd = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://pl31383703.profitableratecpmnetwork.com/4e4c597934b061cbb8060b4eebeeaeb4/invoke.js";
    script.async = true;
    script.setAttribute("data-cfasync", "false");

    const nativeContainer = document.getElementById("container-modal-4e4c597934b061cbb8060b4eebeeaeb4");
    if (nativeContainer && !nativeContainer.hasChildNodes()) {
      nativeContainer.appendChild(script);
    }
  }, []);

  return (
    <div style={{ marginTop: "20px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "12px", textAlign: "center" }}>
      <span style={{ fontSize: "10px", fontWeight: "800", color: "#94a3b8", letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
        — Sponsored Content —
      </span>
      <div id="container-modal-4e4c597934b061cbb8060b4eebeeaeb4" style={{ minHeight: "120px" }}></div>
    </div>
  );
};

export default function Home() {
  const [apps, setApps] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [lang, setLang] = useState("MM");

  const [selectedApp, setSelectedApp] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Responsive Mobile Check State
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 🚀 FAST & RELIABLE DATA FETCHING (LocalStorage First + Firestore Sync)
  useEffect(() => {
    const fetchData = async () => {
      // 1. Instant load from LocalStorage
      const localData = localStorage.getItem("lann_apps_cache");
      if (localData) {
        try {
          setApps(JSON.parse(localData));
        } catch (e) {
          console.error("Local storage parse error:", e);
        }
      }

      // 2. Safely fetch updated data from Firestore
      try {
        const querySnapshot = await getDocs(collection(db, "apps"));
        const list = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

        if (list.length > 0) {
          setApps(list);
          localStorage.setItem("lann_apps_cache", JSON.stringify(list));
        }
      } catch (err) {
        console.error("Error fetching home data:", err);
      }
    };

    fetchData();
  }, []);

  const categories = ["All", ...new Set(apps.map((a) => a.category).filter(Boolean))];

  const filteredApps = apps.filter((app) => {
    const matchesSearch = app.title?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* 🚀 HEADER / NAVBAR */}
      <header style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
        
        {/* LOGO */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "36px", height: "36px", background: "linear-gradient(135deg, #f59e0b, #d97706)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "18px", fontWeight: "900" }}>L</div>
          <span style={{ fontWeight: "800", fontSize: "1.3rem", color: "#0f172a" }}>LannApp</span>
        </div>

        {/* HEADER NAVIGATION & ACTIONS */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          
          {/* TELEGRAM LINK */}
          <a
            href="https://t.me/lannappMM"
            target="_blank"
            rel="noreferrer"
            style={{
              textDecoration: "none",
              background: "linear-gradient(135deg, #229ED9, #0088cc)",
              color: "#ffffff",
              padding: isMobile ? "8px 12px" : "8px 14px",
              borderRadius: "10px",
              fontSize: "12px",
              fontWeight: "800",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 2px 8px rgba(34, 158, 217, 0.2)"
            }}
          >
            <span style={{ fontSize: "14px" }}>✈️</span>
            {!isMobile && <span>Join Telegram</span>}
          </a>

          {/* LANGUAGE TOGGLE */}
          <div style={{ display: "flex", background: "#f1f5f9", padding: "3px", borderRadius: "8px" }}>
            <button onClick={() => setLang("MM")} style={{ padding: "5px 10px", border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: "800", cursor: "pointer", background: lang === "MM" ? "#d97706" : "transparent", color: lang === "MM" ? "#ffffff" : "#64748b" }}>MM</button>
            <button onClick={() => setLang("ENG")} style={{ padding: "5px 10px", border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: "800", cursor: "pointer", background: lang === "ENG" ? "#d97706" : "transparent", color: lang === "ENG" ? "#ffffff" : "#64748b" }}>ENG</button>
          </div>

        </div>
      </header>

      {/* 💰 TOP BANNER AD */}
      <BannerAd />

      {/* 🔍 SEARCH & CATEGORIES */}
      <main style={{ flex: 1, maxWidth: "1200px", width: "100%", margin: "0 auto", padding: "16px" }}>
        <div style={{ maxWidth: "500px", margin: "0 auto 20px" }}>
          <input
            type="text"
            placeholder={lang === "MM" ? "အပလီကေးရှင်းများ ရှာဖွေပါ..." : "Search applications or websites..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "12px 18px", borderRadius: "30px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
          {categories.map((cat) => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} style={{ padding: "6px 14px", borderRadius: "20px", border: "none", fontSize: "12px", fontWeight: "700", cursor: "pointer", background: selectedCategory === cat ? "#0f172a" : "#ffffff", color: selectedCategory === cat ? "#ffffff" : "#64748b" }}>
              {cat}
            </button>
          ))}
        </div>

        {/* 📱 APP GRID */}
        {filteredApps.length === 0 ? (
          <div style={{ textAlign: "center", color: "#94a3b8", marginTop: "40px", fontSize: "14px" }}>
            {lang === "MM" ? "မည်သည့် အပလီကေးရှင်းမှ မရှိသေးပါ။" : "No applications found."}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "16px" }}>
            {filteredApps.map((app) => (
              <div
                key={app.id}
                onClick={() => setSelectedApp(app)}
                style={{ background: "#ffffff", borderRadius: "18px", padding: "16px", textAlign: "center", border: "1px solid #e2e8f0", cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}
              >
                <img src={app.imageUrl || "https://via.placeholder.com/80"} alt={app.title} style={{ width: "68px", height: "68px", borderRadius: "16px", objectFit: "cover", marginBottom: "10px" }} />
                <h3 style={{ margin: "0 0 4px 0", fontSize: "1rem", fontWeight: "800", color: "#0f172a" }}>{app.title}</h3>
                <p style={{ margin: "0 0 8px 0", fontSize: "11px", color: "#d97706", fontWeight: "700" }}>By {app.developerName || "Developer"}</p>
                
                {/* ⚡ CARD BADGE: App Type အလိုက် Dynamic ပြသခြင်း */}
                <span style={{ display: "inline-block", background: "#f1f5f9", padding: "3px 8px", borderRadius: "10px", fontSize: "10px", color: "#475569", fontWeight: "700" }}>
                  {app.appType === "Window App"
                    ? `💻 ${app.architecture || "PC"}`
                    : app.appType === "Website"
                    ? "🌐 Website"
                    : `v${app.version || "1.0.0"} ${app.androidReq && app.androidReq !== "-" ? `• ${app.androidReq}` : ""}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 🪟 COMPLETE APP DETAILS POP-UP MODAL */}
      {selectedApp && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }} onClick={() => setSelectedApp(null)}>
          <div style={{ background: "#ffffff", borderRadius: "24px", padding: "20px", maxWidth: "680px", width: "100%", maxHeight: "85vh", overflowY: "auto", position: "relative", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }} onClick={(e) => e.stopPropagation()}>
            
            {/* CLOSE BUTTON */}
            <button onClick={() => setSelectedApp(null)} style={{ position: "absolute", top: "16px", right: "16px", background: "#f1f5f9", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", fontWeight: "800", color: "#64748b" }}>✕</button>

            {/* HEADER SECTION */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
              <img src={selectedApp.imageUrl || "https://via.placeholder.com/80"} alt="" style={{ width: "64px", height: "64px", borderRadius: "16px", objectFit: "cover" }} />
              <div>
                <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: "900", color: "#0f172a" }}>{selectedApp.title}</h2>
                <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "#d97706", fontWeight: "700" }}>By {selectedApp.developerName || "Developer"}</p>
              </div>
            </div>

            {/* 🖼️ SCREENSHOTS & SPECIFICATIONS */}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 220px", gap: "14px", marginBottom: "20px" }}>
              
              <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "6px" }}>
                {selectedApp.screenshots && selectedApp.screenshots.filter(Boolean).length > 0 ? (
                  selectedApp.screenshots.filter(Boolean).map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt="screenshot"
                      onClick={() => setPreviewImage(img)}
                      style={{ height: "160px", borderRadius: "10px", objectFit: "cover", cursor: "pointer", border: "1px solid #e2e8f0" }}
                    />
                  ))
                ) : (
                  <div style={{ fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center" }}>No screenshots available</div>
                )}
              </div>

              {/* SPECIFICATIONS BOX */}
              <div style={{ background: "#fffbeb", border: "1px solid #fef3c7", borderRadius: "14px", padding: "12px" }}>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "10px", color: "#b45309", fontWeight: "800", textAlign: "center", letterSpacing: "0.5px" }}>SPECIFICATIONS</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "11px" }}>
                  
                  {/* 📱 1. Android App Specification */}
                  {selectedApp.appType === "Android App" && selectedApp.androidReq && selectedApp.androidReq !== "-" && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>Android:</span>
                      <span style={{ fontWeight: "700", color: "#d97706" }}>{selectedApp.androidReq}</span>
                    </div>
                  )}

                  {/* 💻 2. Window App Specification */}
                  {selectedApp.appType === "Window App" && (
                    <>
                      {selectedApp.osReq && (
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#64748b" }}>OS:</span>
                          <span style={{ fontWeight: "700", color: "#d97706" }}>{selectedApp.osReq}</span>
                        </div>
                      )}
                      {selectedApp.architecture && (
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#64748b" }}>Arch:</span>
                          <span style={{ fontWeight: "700", color: "#2563eb" }}>{selectedApp.architecture}</span>
                        </div>
                      )}
                    </>
                  )}

                  {/* Version */}
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>Version:</span>
                    <span style={{ fontWeight: "700", color: "#334155" }}>{selectedApp.version || "1.0"}</span>
                  </div>

                  {/* Size (Website မဟုတ်ပါကမှ ပြမည်) */}
                  {selectedApp.size && selectedApp.size !== "-" && selectedApp.size !== "N/A" && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "#64748b" }}>Size:</span>
                      <span style={{ fontWeight: "700", color: "#334155" }}>{selectedApp.size} MB</span>
                    </div>
                  )}

                  {/* Category */}
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>Category:</span>
                    <span style={{ fontWeight: "700", color: "#334155" }}>{selectedApp.category || "General"}</span>
                  </div>

                </div>
              </div>

            </div>

            {/* 📝 ABOUT SECTION */}
            <div style={{ background: "#f8fafc", borderRadius: "14px", padding: "16px", marginBottom: "16px" }}>
              <h3 style={{ margin: "0 0 8px 0", fontSize: "13px", fontWeight: "800", color: "#0f172a" }}>
                {selectedApp.appType === "Website"
                  ? "ABOUT THIS WEBSITE"
                  : selectedApp.appType === "Window App"
                  ? "ABOUT THIS SOFTWARE"
                  : "ABOUT THIS APP"}
              </h3>
              <p style={{ margin: 0, fontSize: "12px", color: "#475569", lineHeight: "1.6", whiteSpace: "pre-line" }}>
                {lang === "MM" ? (selectedApp.descMM || selectedApp.descEN) : (selectedApp.descEN || selectedApp.descMM)}
              </p>
            </div>

            {/* 📥 DOWNLOAD / VISIT BUTTONS */}
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "8px" }}>
              {(selectedApp.driveUrl || selectedApp.driveUrl1) && (
                <a
                  href={selectedApp.driveUrl || selectedApp.driveUrl1}
                  target="_blank"
                  rel="noreferrer"
                  style={{ flex: 1, textDecoration: "none", background: "#d97706", color: "#ffffff", padding: "12px", borderRadius: "10px", textAlign: "center", fontWeight: "800", fontSize: "12px" }}
                >
                  🚀 {selectedApp.appType === "Website" ? "Visit Website" : selectedApp.appType === "Window App" ? "Download Setup 1" : "Download Link 1"}
                </a>
              )}
              {selectedApp.driveUrl2 && (
                <a
                  href={selectedApp.driveUrl2}
                  target="_blank"
                  rel="noreferrer"
                  style={{ flex: 1, textDecoration: "none", background: "#0f172a", color: "#ffffff", padding: "12px", borderRadius: "10px", textAlign: "center", fontWeight: "800", fontSize: "12px" }}
                >
                  📥 {selectedApp.appType === "Window App" ? "Download Setup 2" : "Download Link 2"}
                </a>
              )}
              {selectedApp.driveUrl3 && (
                <a
                  href={selectedApp.driveUrl3}
                  target="_blank"
                  rel="noreferrer"
                  style={{ flex: 1, textDecoration: "none", background: "#2563eb", color: "#ffffff", padding: "12px", borderRadius: "10px", textAlign: "center", fontWeight: "800", fontSize: "12px" }}
                >
                  ⚡ {selectedApp.appType === "Window App" ? "Download Setup 3" : "Download Link 3"}
                </a>
              )}
            </div>

            {/* 📰 ADVERTISEMENT */}
            <ModalAd />

          </div>
        </div>
      )}

      {/* 🖼️ PREVIEW LIGHTBOX */}
      {previewImage && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.85)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }} onClick={() => setPreviewImage(null)}>
          <div style={{ position: "relative", maxWidth: "90%", maxHeight: "90%" }}>
            <img src={previewImage} alt="Full View" style={{ maxWidth: "100%", maxHeight: "85vh", borderRadius: "12px" }} />
            <button onClick={() => setPreviewImage(null)} style={{ position: "absolute", top: "-36px", right: "0", background: "none", border: "none", color: "#ffffff", fontSize: "20px", cursor: "pointer", fontWeight: "bold" }}>✕ Close</button>
          </div>
        </div>
      )}

      {/* 👨‍💻 FOOTER */}
      <footer style={{ background: "#ffffff", borderTop: "1px solid #e2e8f0", padding: "16px", textAlign: "center", marginTop: "auto" }}>
        <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
          © {new Date().getFullYear()} LannApp. Developed by{" "}
          <a
            href="https://kyawxinndev.netlify.app/"
            target="_blank"
            rel="noreferrer"
            style={{ color: "#d97706", textDecoration: "none", fontWeight: "800" }}
          >
            KyawZinKo
          </a>
        </p>
      </footer>
    </div>
  );
}