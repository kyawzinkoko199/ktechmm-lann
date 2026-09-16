import { useState, useEffect } from "react";
import { db } from "../firebase";
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  setDoc 
} from "firebase/firestore";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("apps"); // 'apps' | 'settings' | 'banner'
  const [lang, setLang] = useState("en");

  // APP FORM STATE
  const [apps, setApps] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    developerName: "",
    developerLink: "",
    category: "Tools",
    version: "1.0.0",
    androidReq: "Android 8.0+",
    size: "",
    imageUrl: "",
    driveUrl: "",
    driveUrl2: "",
    driveUrl3: "",
    descEN: "",
    descMM: "",
    screenshots: ["", "", ""]
  });

  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const appsPerPage = 5;

  // STORE SETTINGS STATE
  const [settings, setSettings] = useState({
    storeName: "LannApp",
    supportEmail: "",
    telegramLink: "",
    maintenanceMode: false
  });

  // ANNOUNCEMENT BANNER STATE
  const [bannerText, setBannerText] = useState("");

  // FETCH DATA
  useEffect(() => {
    fetchApps();
    fetchSettings();
    fetchBanner();
  }, []);

  const fetchApps = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "apps"));
      const list = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setApps(list);
    } catch (err) {
      console.error("Error fetching apps:", err);
    }
  };

  const fetchSettings = async () => {
    try {
      const docSnap = await getDoc(doc(db, "settings", "store"));
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    }
  };

  const fetchBanner = async () => {
    try {
      const docSnap = await getDoc(doc(db, "announcements", "banner"));
      if (docSnap.exists()) {
        setBannerText(docSnap.data().text || "");
      }
    } catch (err) {
      console.error("Error fetching banner:", err);
    }
  };

  // FORM HANDLERS
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleScreenshotChange = (index, value) => {
    const updatedScreenshots = [...form.screenshots];
    updatedScreenshots[index] = value;
    setForm({ ...form, screenshots: updatedScreenshots });
  };

  const handleSubmitApp = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, "apps", editingId), form);
        alert("App updated successfully!");
      } else {
        await addDoc(collection(db, "apps"), form);
        alert("App published successfully!");
      }
      resetForm();
      fetchApps();
    } catch (err) {
      console.error("Error saving app:", err);
      alert("Failed to save app.");
    }
  };

  const handleEdit = (app) => {
    setEditingId(app.id);
    setForm({
      title: app.title || "",
      developerName: app.developerName || "",
      developerLink: app.developerLink || "",
      category: app.category || "Tools",
      version: app.version || "1.0.0",
      androidReq: app.androidReq || "Android 8.0+",
      size: app.size || "",
      imageUrl: app.imageUrl || "",
      driveUrl: app.driveUrl || "",
      driveUrl2: app.driveUrl2 || "",
      driveUrl3: app.driveUrl3 || "",
      descEN: app.descEN || "",
      descMM: app.descMM || "",
      screenshots: app.screenshots || ["", "", ""]
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this app?")) {
      try {
        await deleteDoc(doc(db, "apps", id));
        alert("App deleted!");
        fetchApps();
      } catch (err) {
        console.error("Error deleting app:", err);
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      title: "",
      developerName: "",
      developerLink: "",
      category: "Tools",
      version: "1.0.0",
      androidReq: "Android 8.0+",
      size: "",
      imageUrl: "",
      driveUrl: "",
      driveUrl2: "",
      driveUrl3: "",
      descEN: "",
      descMM: "",
      screenshots: ["", "", ""]
    });
  };

  // SAVE SETTINGS
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, "settings", "store"), settings);
      alert("Store settings saved!");
    } catch (err) {
      console.error("Error saving settings:", err);
    }
  };

  // SAVE BANNER
  const handleSaveBanner = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, "announcements", "banner"), { text: bannerText, enabled: true });
      alert("Announcement banner updated!");
    } catch (err) {
      console.error("Error saving banner:", err);
    }
  };

  // PAGINATION LOGIC
  const indexOfLastApp = currentPage * appsPerPage;
  const indexOfFirstApp = indexOfLastApp - appsPerPage;
  const currentApps = apps.slice(indexOfFirstApp, indexOfLastApp);
  const totalPages = Math.ceil(apps.length / appsPerPage);

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#f8fafc" }}>
      
      {/* SIDEBAR NAVIGATION */}
      <aside style={{ width: "260px", background: "#0f172a", color: "#fff", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px" }}>
            <div style={{ width: "36px", height: "36px", background: "linear-gradient(135deg, #f59e0b, #d97706)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "18px" }}>L</div>
            <span style={{ fontWeight: "800", fontSize: "1.1rem" }}>{settings.storeName || "LannApp"} Admin</span>
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <button
              onClick={() => setActiveTab("apps")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 16px",
                borderRadius: "10px",
                border: "none",
                background: activeTab === "apps" ? "#d97706" : "transparent",
                color: "#ffffff",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                textAlign: "left"
              }}
            >
              📱 App Management ({apps.length})
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 16px",
                borderRadius: "10px",
                border: "none",
                background: activeTab === "settings" ? "#d97706" : "transparent",
                color: "#ffffff",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                textAlign: "left"
              }}
            >
              ⚙️ Store Settings
            </button>

            <button
              onClick={() => setActiveTab("banner")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 16px",
                borderRadius: "10px",
                border: "none",
                background: activeTab === "banner" ? "#d97706" : "transparent",
                color: "#ffffff",
                fontWeight: "700",
                fontSize: "13px",
                cursor: "pointer",
                textAlign: "left"
              }}
            >
              📢 Announcement Banner
            </button>
          </nav>
        </div>

        <div>
          <a href="/" target="_blank" rel="noreferrer" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "12px", display: "block", marginBottom: "16px" }}>
            🌐 View Live Store ↗
          </a>
          <div style={{ display: "flex", background: "#1e293b", padding: "4px", borderRadius: "8px", gap: "4px" }}>
            <button onClick={() => setLang("mm")} style={{ flex: 1, border: "none", padding: "6px", borderRadius: "6px", background: lang === "mm" ? "#d97706" : "transparent", color: "#fff", fontWeight: "700", fontSize: "11px", cursor: "pointer" }}>MM</button>
            <button onClick={() => setLang("en")} style={{ flex: 1, border: "none", padding: "6px", borderRadius: "6px", background: lang === "en" ? "#d97706" : "transparent", color: "#fff", fontWeight: "700", fontSize: "11px", cursor: "pointer" }}>EN</button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
        
        {/* TAB 1: APP MANAGEMENT SIDE BY SIDE */}
        {activeTab === "apps" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px", alignItems: "start" }}>
            
            {/* LEFT COLUMN: UPLOAD / EDIT APP FORM */}
            <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "800", color: "#0f172a" }}>
                  {editingId ? "✏️ Edit Application" : "➕ Upload New Application"}
                </h2>
                {editingId && (
                  <button onClick={resetForm} style={{ background: "#f1f5f9", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", cursor: "pointer", fontWeight: "700" }}>
                    Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmitApp} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <input type="text" name="title" placeholder="App Title *" value={form.title} onChange={handleChange} required style={inputStyle} />
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <input type="text" name="developerName" placeholder="Developer Name" value={form.developerName} onChange={handleChange} style={inputStyle} />
                  <input type="text" name="developerLink" placeholder="Developer Link (URL)" value={form.developerLink} onChange={handleChange} style={inputStyle} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                  <select name="category" value={form.category} onChange={handleChange} style={inputStyle}>
                    <option value="Tools">Tools</option>
                    <option value="Games">Games</option>
                    <option value="Social">Social</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Productivity">Productivity</option>
                    <option value="Business">Business</option>
                    <option value="Education">Education</option>
                  </select>
                  <input type="text" name="version" placeholder="Version (e.g. 1.0.0)" value={form.version} onChange={handleChange} style={inputStyle} />
                  <input type="text" name="androidReq" placeholder="Android (e.g. 8.0+)" value={form.androidReq} onChange={handleChange} style={inputStyle} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <input type="text" name="size" placeholder="App Size (MB)" value={form.size} onChange={handleChange} style={inputStyle} />
                  <input type="text" name="imageUrl" placeholder="App Icon Image URL *" value={form.imageUrl} onChange={handleChange} required style={inputStyle} />
                </div>

                <input type="text" name="driveUrl" placeholder="Primary Download Link (Drive/Mega) *" value={form.driveUrl} onChange={handleChange} required style={inputStyle} />
                <input type="text" name="driveUrl2" placeholder="Mirror Link 1 (Optional)" value={form.driveUrl2} onChange={handleChange} style={inputStyle} />
                <input type="text" name="driveUrl3" placeholder="Mirror Link 2 (Optional)" value={form.driveUrl3} onChange={handleChange} style={inputStyle} />

                <label style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", marginTop: "4px" }}>Screenshots Image URLs (Optional)</label>
                {form.screenshots.map((s, idx) => (
                  <input key={idx} type="text" placeholder={`Screenshot ${idx + 1} URL`} value={s} onChange={(e) => handleScreenshotChange(idx, e.target.value)} style={inputStyle} />
                ))}

                <textarea name="descEN" placeholder="Description (English)" value={form.descEN} onChange={handleChange} rows={3} style={inputStyle}></textarea>
                <textarea name="descMM" placeholder="Description (Myanmar)" value={form.descMM} onChange={handleChange} rows={3} style={inputStyle}></textarea>

                <button type="submit" style={{ background: "#d97706", color: "#fff", padding: "12px", border: "none", borderRadius: "10px", fontWeight: "800", cursor: "pointer", marginTop: "8px" }}>
                  {editingId ? "Update App Data" : "Publish App"}
                </button>
              </form>
            </div>

            {/* RIGHT COLUMN: APP LIST WITH PAGINATION & CATEGORY */}
            <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <h2 style={{ margin: "0 0 20px 0", fontSize: "1.2rem", fontWeight: "800", color: "#0f172a" }}>
                📋 Uploaded Apps List ({apps.length})
              </h2>

              {apps.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8", fontSize: "14px" }}>No applications uploaded yet.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {currentApps.map((app) => (
                    <div key={app.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", border: "1px solid #e2e8f0", borderRadius: "12px", background: "#f8fafc" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <img src={app.imageUrl || "https://via.placeholder.com/40"} alt="" style={{ width: "42px", height: "42px", borderRadius: "10px", objectFit: "cover" }} />
                        <div>
                          <div style={{ fontWeight: "800", fontSize: "14px", color: "#0f172a" }}>{app.title}</div>
                          <div style={{ fontSize: "11px", color: "#64748b", display: "flex", gap: "8px", alignItems: "center", marginTop: "2px" }}>
                            <span style={{ background: "#e2e8f0", padding: "2px 6px", borderRadius: "4px", color: "#334155", fontWeight: "700" }}>
                              🏷️ {app.category || "Tools"}
                            </span>
                            <span>v{app.version || "1.0.0"}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => handleEdit(app)} style={{ background: "#3b82f6", color: "#fff", border: "none", padding: "6px 10px", borderRadius: "6px", fontSize: "12px", cursor: "pointer", fontWeight: "700" }}>
                          Edit
                        </button>
                        <button onClick={() => handleDelete(app.id)} style={{ background: "#ef4444", color: "#fff", border: "none", padding: "6px 10px", borderRadius: "6px", fontSize: "12px", cursor: "pointer", fontWeight: "700" }}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* PAGINATION CONTROLS */}
                  {totalPages > 1 && (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginTop: "16px" }}>
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        style={{ border: "1px solid #cbd5e1", background: currentPage === 1 ? "#f1f5f9" : "#ffffff", padding: "6px 12px", borderRadius: "6px", cursor: currentPage === 1 ? "not-allowed" : "pointer", fontSize: "12px", fontWeight: "700" }}
                      >
                        Prev
                      </button>

                      <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>
                        Page {currentPage} of {totalPages}
                      </span>

                      <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        style={{ border: "1px solid #cbd5e1", background: currentPage === totalPages ? "#f1f5f9" : "#ffffff", padding: "6px 12px", borderRadius: "6px", cursor: currentPage === totalPages ? "not-allowed" : "pointer", fontSize: "12px", fontWeight: "700" }}
                      >
                        Next
                      </button>
                    </div>
                  )}

                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: STORE SETTINGS */}
        {activeTab === "settings" && (
          <div style={{ maxWidth: "600px", background: "#ffffff", padding: "28px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <h2 style={{ margin: "0 0 20px 0", fontSize: "1.2rem", fontWeight: "800", color: "#0f172a" }}>⚙️ Store Settings</h2>
            <form onSubmit={handleSaveSettings} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>Store Name</label>
                <input type="text" value={settings.storeName} onChange={(e) => setSettings({ ...settings, storeName: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>Support Email</label>
                <input type="email" value={settings.supportEmail} onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>Telegram Support Link</label>
                <input type="text" value={settings.telegramLink} onChange={(e) => setSettings({ ...settings, telegramLink: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px" }}>
                <input type="checkbox" id="mMode" checked={settings.maintenanceMode} onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })} />
                <label htmlFor="mMode" style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>Enable Maintenance Mode</label>
              </div>
              <button type="submit" style={{ background: "#d97706", color: "#fff", padding: "12px", border: "none", borderRadius: "10px", fontWeight: "800", cursor: "pointer", marginTop: "12px" }}>Save Settings</button>
            </form>
          </div>
        )}

        {/* TAB 3: ANNOUNCEMENT BANNER */}
        {activeTab === "banner" && (
          <div style={{ maxWidth: "600px", background: "#ffffff", padding: "28px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <h2 style={{ margin: "0 0 20px 0", fontSize: "1.2rem", fontWeight: "800", color: "#0f172a" }}>📢 Announcement Banner Text</h2>
            <form onSubmit={handleSaveBanner} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <textarea rows={4} value={bannerText} onChange={(e) => setBannerText(e.target.value)} placeholder="Type announcement text to show on Home page header..." style={inputStyle}></textarea>
              <button type="submit" style={{ background: "#d97706", color: "#fff", padding: "12px", border: "none", borderRadius: "10px", fontWeight: "800", cursor: "pointer" }}>Update Banner</button>
            </form>
          </div>
        )}

      </main>

    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  fontSize: "13px",
  outline: "none",
  boxSizing: "border-box"
};
