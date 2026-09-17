import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

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
    <div style={{ display: "flex", justifyContent: "center", margin: "16px 0" }}>
      <div id="banner-ad-container" style={{ minWidth: "320px", minHeight: "50px" }}></div>
    </div>
  );
};

// 📰 2. NATIVE AD WIDGET (App Modal တိုင်း၏ အောက်ဆုံးတွင် ပြသရန်)
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
    <div style={{ marginTop: "24px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "12px", textAlign: "center" }}>
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
  const [telegramLink, setTelegramLink] = useState("");

  const [selectedApp, setSelectedApp] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "apps"));
        const list = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        setApps(list);

        const docSnap = await getDoc(doc(db, "settings", "store"));
        if (docSnap.exists() && docSnap.data().telegramLink) {
          setTelegramLink(docSnap.data().telegramLink);
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

  // 🔗 Smart Link Trigger & Redirection
  const handleSmartLink = (targetUrl) => {
    window.open("https://www.profitableratecpmnetwork.com/zxhnp4977?key=c96a6296152a43fed0bd850c48f7aa1d", "_blank");
    if (targetUrl) {
      setTimeout(() => {
        window.open(targetUrl, "_blank");
      }, 500);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      
      {/* 🚀 HEADER / NAVBAR */}
      <header style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "38px", height: "38px", background: "linear-gradient(135deg, #f59e0b, #d97706)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "20px", fontWeight: "900" }}>L</div>
          <span style={{ fontWeight: "800", fontSize: "1.4rem", color: "#0f172a" }}>LannApp</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* WATCH ADS TO CONTINUE / TELEGRAM BUTTON */}
          <button
            onClick={() => handleSmartLink(telegramLink || "https://t.me")}
            style={{
              border: "none",
              background: "linear-gradient(135deg, #229ED9, #0088cc)",
              color: "#ffffff",
              padding: "8px 14px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "800",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer"
            }}
          >
            <span>✈️</span>
            <span>Join Telegram (Watch Ads to Continue)</span>
          </button>

          <div style={{ display: "flex", background: "#f1f5f9", padding: "3px", borderRadius: "8px" }}>
            <button onClick={() => setLang("MM")} style={{ padding: "6px 12px", border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: "800", cursor: "pointer", background: lang === "MM" ? "#d97706" : "transparent", color: lang === "MM" ? "#ffffff" : "#64748b" }}>MM</button>
            <button onClick={() => setLang("ENG")} style={{ padding: "6px 12px", border: "none", borderRadius: "6px", fontSize: "11px", fontWeight: "800", cursor: "pointer", background: lang === "ENG" ? "#d97706" : "transparent", color: lang === "ENG" ? "#ffffff" : "#64748b" }}>ENG</button>
          </div>
        </div>
      </header>

      {/* 💰 TOP BANNER AD */}
      <BannerAd />

      {/* 🔍 SEARCH & CATEGORIES */}
      <main style={{ flex: 1, maxWidth: "1200px", width: "100%", margin: "0 auto", padding: "16px" }}>
        <div style={{ maxWidth: "500px", margin: "0 auto 24px" }}>
          <input
            type="text"
            placeholder={lang === "MM" ? "အပလီကေးရှင်းများ ရှာဖွေပါ..." : "Search applications or websites..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "14px 20px", borderRadius: "30px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
          {categories.map((cat) => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} style={{ padding: "8px 18px", borderRadius: "20px", border: "none", fontSize: "12px", fontWeight: "700", cursor: "pointer", background: selectedCategory === cat ? "#0f172a" : "#ffffff", color: selectedCategory === cat ? "#ffffff" : "#64748b" }}>
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "20px" }}>
            {filteredApps.map((app) => (
              <div
                key={app.id}
                onClick={() => setSelectedApp(app)}
                style={{ background: "#ffffff", borderRadius: "20px", padding: "20px", textAlign: "center", border: "1px solid #e2e8f0", cursor: "pointer" }}
              >
                <img src={app.imageUrl || "https://via.placeholder.com/80"} alt={app.title} style={{ width: "80px", height: "80px", borderRadius: "18px", objectFit: "cover", marginBottom: "14px" }} />
                <h3 style={{ margin: "0 0 6px 0", fontSize: "1.1rem", fontWeight: "800", color: "#0f172a" }}>{app.title}</h3>
                <p style={{ margin: "0 0 12px 0", fontSize: "12px", color: "#d97706", fontWeight: "700" }}>By {app.developerName || "Developer"}</p>
                <span style={{ display: "inline-block", background: "#f1f5f9", padding: "4px 10px", borderRadius: "12px", fontSize: "11px", color: "#475569", fontWeight: "700" }}>
                  v{app.version || "1.0.0"} • {app.androidReq || "Android 8.0+"}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 🪟 COMPLETE APP DETAILS POP-UP MODAL */}
      {selectedApp && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }} onClick={() => setSelectedApp(null)}>
          <div style={{ background: "#ffffff", borderRadius: "24px", padding: "28px", maxWidth: "680px", width: "100%", maxHeight: "88vh", overflowY: "auto", position: "relative", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }} onClick={(e) => e.stopPropagation()}>
            
            {/* CLOSE BUTTON */}
            <button onClick={() => setSelectedApp(null)} style={{ position: "absolute", top: "18px", right: "18px", background: "#f1f5f9", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", fontWeight: "800", color: "#64748b" }}>✕</button>

            {/* HEADER SECTION */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
              <img src={selectedApp.imageUrl || "https://via.placeholder.com/80"} alt="" style={{ width: "72px", height: "72px", borderRadius: "16px", objectFit: "cover" }} />
              <div>
                <h2 style={{ margin: 0, fontSize: "1.6rem", fontWeight: "900", color: "#0f172a" }}>{selectedApp.title}</h2>
                <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#d97706", fontWeight: "700" }}>By {selectedApp.developerName || "Developer"} ↗</p>
              </div>
            </div>

            {/* 🖼️ SCREENSHOTS & SPECIFICATIONS GRID */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 240px", gap: "16px", marginBottom: "24px" }}>
              
              {/* SCREENSHOTS ROW */}
              <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "6px" }}>
                {selectedApp.screenshots && selectedApp.screenshots.filter(Boolean).length > 0 ? (
                  selectedApp.screenshots.filter(Boolean).map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt="screenshot"
                      onClick={() => setPreviewImage(img)}
                      style={{ height: "180px", borderRadius: "12px", objectFit: "cover", cursor: "pointer", border: "1px solid #e2e8f0" }}
                    />
                  ))
                ) : (
                  <div style={{ fontSize: "12px", color: "#94a3b8", display: "flex", alignItems: "center" }}>No screenshots available</div>
                )}
              </div>

              {/* APP SPECIFICATIONS CARD */}
              <div style={{ background: "#fffbeb", border: "1px solid #fef3c7", borderRadius: "16px", padding: "16px" }}>
                <h4 style={{ margin: "0 0 12px 0", fontSize: "11px", color: "#b45309", fontWeight: "800", textAlign: "center", letterSpacing: "0.5px" }}>APP SPECIFICATIONS</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Android Req:</span><span style={{ fontWeight: "700", color: "#d97706" }}>{selectedApp.androidReq || "8.0+"}</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Version:</span><span style={{ fontWeight: "700", color: "#334155" }}>{selectedApp.version || "1.0"}</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>App Size:</span><span style={{ fontWeight: "700", color: "#334155" }}>{selectedApp.size ? `${selectedApp.size} MB` : "N/A"}</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748b" }}>Category:</span><span style={{ fontWeight: "700", color: "#334155" }}>{selectedApp.category || "General"}</span></div>
                </div>
              </div>

            </div>

            {/* 📝 ABOUT THIS APP SECTION */}
            <div style={{ background: "#f8fafc", borderRadius: "16px", padding: "20px", marginBottom: "20px" }}>
              <h3 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "800", color: "#0f172a", textAlign: "center" }}>ABOUT THIS APP</h3>
              <p style={{ margin: 0, fontSize: "13px", color: "#475569", lineHeight: "1.6", whiteSpace: "pre-line" }}>
                {lang === "MM" ? (selectedApp.descMM || selectedApp.descEN) : (selectedApp.descEN || selectedApp.descMM)}
              </p>
            </div>

            {/* 📥 DOWNLOAD BUTTONS */}
            <div style={{ display: "flex", gap: "10px" }}>
              {selectedApp.driveUrl && (
                <a href={selectedApp.driveUrl} target="_blank" rel="noreferrer" onClick={() => handleSmartLink()} style={{ flex: 1, textDecoration: "none", background: "#d97706", color: "#ffffff", padding: "14px", borderRadius: "12px", textAlign: "center", fontWeight: "800", fontSize: "13px" }}>
                  🚀 Download Link 1
                </a>
              )}
              {selectedApp.driveUrl2 && (
                <a href={selectedApp.driveUrl2} target="_blank" rel="noreferrer" onClick={() => handleSmartLink()} style={{ flex: 1, textDecoration: "none", background: "#0f172a", color: "#ffffff", padding: "14px", borderRadius: "12px", textAlign: "center", fontWeight: "800", fontSize: "13px" }}>
                  📥 Download Link 2
                </a>
              )}
            </div>

            {/* 📰 APP DETAIL POP UP BOX အောက်ဆုံးတွင် ပြသထားသော ကြော်ငြာ */}
            <ModalAd />

          </div>
        </div>
      )}

      {/* 🖼️ FULL IMAGE LIGHTBOX / PREVIEW MODAL */}
      {previewImage && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.85)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }} onClick={() => setPreviewImage(null)}>
          <div style={{ position: "relative", maxWidth: "90%", maxHeight: "90%" }}>
            <img src={previewImage} alt="Full View" style={{ maxWidth: "100%", maxHeight: "85vh", borderRadius: "12px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)" }} />
            <button onClick={() => setPreviewImage(null)} style={{ position: "absolute", top: "-40px", right: "0", background: "none", border: "none", color: "#ffffff", fontSize: "24px", cursor: "pointer", fontWeight: "bold" }}>✕ Close</button>
          </div>
        </div>
      )}

      {/* 👨‍💻 FOOTER WITH DEVELOPER NAME & LINK */}
      <footer style={{ background: "#ffffff", borderTop: "1px solid #e2e8f0", padding: "20px", textAlign: "center", marginTop: "auto" }}>
        <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
          © {new Date().getFullYear()} LannApp. Developed by{" "}
          <a
            href="https://kyawzinko.portfolio.app"
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