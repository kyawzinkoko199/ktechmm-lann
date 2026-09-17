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
  // ADMIN AUTHENTICATION STATE
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  
  // DIRECT DEFAULT PASSWORD
  const [adminPassword, setAdminPassword] = useState("admin123");

  const [activeTab, setActiveTab] = useState("apps");

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

  // CHANGE PASSWORD STATE
  const [passForm, setPassForm] = useState({
    currentPass: "",
    newPass: "",
    confirmPass: ""
  });

  // ANNOUNCEMENT BANNER STATE
  const [bannerText, setBannerText] = useState("");

  // FETCH DATA AFTER AUTHENTICATION
  useEffect(() => {
    if (isAuthenticated) {
      fetchApps();
      fetchSettings();
      fetchBanner();
    }
  }, [isAuthenticated]);

  const fetchApps = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "apps"));
      const list = querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
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

  // LOGIN HANDLER
  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput.trim() === adminPassword.trim()) {
      setIsAuthenticated(true);
    } else {
      alert("Incorrect Admin Password! Enter: admin123");
    }
  };

  // CHANGE PASSWORD HANDLER (SAVES TO LOCAL & FIRESTORE)
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passForm.currentPass.trim() !== adminPassword.trim()) {
      alert("Current password is incorrect!");
      return;
    }
    if (passForm.newPass !== passForm.confirmPass) {
      alert("New passwords do not match!");
      return;
    }
    if (passForm.newPass.length < 6) {
      alert("New password should be at least 6 characters!");
      return;
    }

    try {
      await setDoc(doc(db, "settings", "auth"), { password: passForm.newPass.trim() });
      setAdminPassword(passForm.newPass.trim());
      alert("Admin password changed successfully! Use your new password next time.");
      setPassForm({ currentPass: "", newPass: "", confirmPass: "" });
    } catch (err) {
      console.error("Error updating password:", err);
      // Fallback if firestore rules block writing
      setAdminPassword(passForm.newPass.trim());
      alert("Password updated locally!");
      setPassForm({ currentPass: "", newPass: "", confirmPass: "" });
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
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, "settings", "store"), settings);
      alert("Store settings saved!");
    } catch (err) {
      console.error("Error saving settings:", err);
    }
  };

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

  // 🔒 ADMIN LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a", fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "20px" }}>
        <div style={{ background: "#ffffff", padding: "32px", borderRadius: "20px", width: "100%", maxWidth: "380px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)", textAlign: "center" }}>
          <div style={{ width: "50px", height: "50px", background: "linear-gradient(135deg, #f59e0b, #d97706)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "24px", fontWeight: "900", margin: "0 auto 16px" }}>L</div>
          <h2 style={{ margin: "0 0 6px 0", fontSize: "1.4rem", fontWeight: "800", color: "#0f172a" }}>Admin Access</h2>
          <p style={{ margin: "0 0 20px 0", fontSize: "12px", color: "#64748b" }}>Default Password: <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", color: "#d97706", fontWeight: "700" }}>admin123</code></p>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <input
              type="password"
              placeholder="Enter Admin Password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              required
              style={{ ...inputStyle, textAlign: "center", padding: "12px", fontSize: "14px" }}
            />
            <button type="submit" style={{ background: "#d97706", color: "#ffffff", border: "none", padding: "12px", borderRadius: "10px", fontWeight: "800", fontSize: "14px", cursor: "pointer" }}>
              Login to Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 📱 DASHBOARD LAYOUT
  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#f8fafc" }}>
      
      {/* TOP HEADER */}
      <header style={{ background: "#0f172a", color: "#ffffff", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", sticky: "top", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, #f59e0b, #d97706)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "16px" }}>L</div>
          <span style={{ fontWeight: "800", fontSize: "1.1rem" }}>{settings.storeName || "LannApp"} Admin</span>
        </div>

        <button onClick={() => setIsAuthenticated(false)} style={{ background: "#1e293b", color: "#f87171", border: "1px solid #334155", padding: "6px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}>
          Logout 🚪
        </button>
      </header>

      {/* NAVIGATION TABS */}
      <div style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0", padding: "10px 16px", display: "flex", gap: "8px", overflowX: "auto" }}>
        <button
          onClick={() => setActiveTab("apps")}
          style={{
            padding: "8px 14px",
            borderRadius: "8px",
            border: "none",
            background: activeTab === "apps" ? "#d97706" : "#f1f5f9",
            color: activeTab === "apps" ? "#ffffff" : "#475569",
            fontWeight: "700",
            fontSize: "12px",
            cursor: "pointer",
            whiteSpace: "nowrap"
          }}
        >
          📱 Apps ({apps.length})
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          style={{
            padding: "8px 14px",
            borderRadius: "8px",
            border: "none",
            background: activeTab === "settings" ? "#d97706" : "#f1f5f9",
            color: activeTab === "settings" ? "#ffffff" : "#475569",
            fontWeight: "700",
            fontSize: "12px",
            cursor: "pointer",
            whiteSpace: "nowrap"
          }}
        >
          ⚙️ Settings & Password
        </button>

        <button
          onClick={() => setActiveTab("banner")}
          style={{
            padding: "8px 14px",
            borderRadius: "8px",
            border: "none",
            background: activeTab === "banner" ? "#d97706" : "#f1f5f9",
            color: activeTab === "banner" ? "#ffffff" : "#475569",
            fontWeight: "700",
            fontSize: "12px",
            cursor: "pointer",
            whiteSpace: "nowrap"
          }}
        >
          📢 Banner
        </button>

        <a href="/" target="_blank" rel="noreferrer" style={{ marginLeft: "auto", color: "#d97706", textDecoration: "none", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>
          Live Store ↗
        </a>
      </div>

      {/* MAIN CONTENT */}
      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "20px 16px" }}>
        
        {/* TAB 1: APPS */}
        {activeTab === "apps" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            <div style={{ background: "#ffffff", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "#0f172a" }}>
                  {editingId ? "✏️ Edit Application" : "➕ Upload New Application"}
                </h3>
                {editingId && (
                  <button onClick={resetForm} style={{ background: "#f1f5f9", border: "none", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", cursor: "pointer", fontWeight: "700" }}>
                    Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmitApp} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <input type="text" name="title" placeholder="App Title *" value={form.title} onChange={handleChange} required style={inputStyle} />
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <input type="text" name="developerName" placeholder="Developer Name" value={form.developerName} onChange={handleChange} style={inputStyle} />
                  <input type="text" name="developerLink" placeholder="Developer Link (URL)" value={form.developerLink} onChange={handleChange} style={inputStyle} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                  <select name="category" value={form.category} onChange={handleChange} style={inputStyle}>
                    <option value="Tools">Tools</option>
                    <option value="Games">Games</option>
                    <option value="Social">Social</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Productivity">Productivity</option>
                    <option value="Business">Business</option>
                    <option value="Education">Education</option>
                  </select>
                  <input type="text" name="version" placeholder="Version (1.0.0)" value={form.version} onChange={handleChange} style={inputStyle} />
                  <input type="text" name="androidReq" placeholder="Android (8.0+)" value={form.androidReq} onChange={handleChange} style={inputStyle} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <input type="text" name="size" placeholder="App Size (MB)" value={form.size} onChange={handleChange} style={inputStyle} />
                  <input type="text" name="imageUrl" placeholder="App Icon Image URL *" value={form.imageUrl} onChange={handleChange} required style={inputStyle} />
                </div>

                <input type="text" name="driveUrl" placeholder="Primary Download Link (Drive/Mega) *" value={form.driveUrl} onChange={handleChange} required style={inputStyle} />
                <input type="text" name="driveUrl2" placeholder="Mirror Link 1 (Optional)" value={form.driveUrl2} onChange={handleChange} style={inputStyle} />
                <input type="text" name="driveUrl3" placeholder="Mirror Link 2 (Optional)" value={form.driveUrl3} onChange={handleChange} style={inputStyle} />

                <label style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>Screenshots Image URLs</label>
                {form.screenshots.map((s, idx) => (
                  <input key={idx} type="text" placeholder={`Screenshot ${idx + 1} URL`} value={s} onChange={(e) => handleScreenshotChange(idx, e.target.value)} style={inputStyle} />
                ))}

                <textarea name="descEN" placeholder="Description (English)" value={form.descEN} onChange={handleChange} rows={2} style={inputStyle}></textarea>
                <textarea name="descMM" placeholder="Description (Myanmar)" value={form.descMM} onChange={handleChange} rows={2} style={inputStyle}></textarea>

                <button type="submit" style={{ background: "#d97706", color: "#fff", padding: "12px", border: "none", borderRadius: "10px", fontWeight: "800", cursor: "pointer", fontSize: "13px" }}>
                  {editingId ? "Update App Data" : "Publish App"}
                </button>
              </form>
            </div>

            <div style={{ background: "#ffffff", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: "800", color: "#0f172a" }}>
                📋 Uploaded Apps ({apps.length})
              </h3>

              {apps.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px", color: "#94a3b8", fontSize: "13px" }}>No applications uploaded yet.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {currentApps.map((app) => (
                    <div key={app.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: "10px", background: "#f8fafc" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden" }}>
                        <img src={app.imageUrl || "https://via.placeholder.com/40"} alt="" style={{ width: "38px", height: "38px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }} />
                        <div style={{ overflow: "hidden" }}>
                          <div style={{ fontWeight: "800", fontSize: "13px", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{app.title}</div>
                          <div style={{ fontSize: "10px", color: "#64748b", display: "flex", gap: "6px", alignItems: "center", marginTop: "2px" }}>
                            <span style={{ background: "#e2e8f0", padding: "2px 4px", borderRadius: "4px", color: "#334155", fontWeight: "700" }}>{app.category || "Tools"}</span>
                            <span>v{app.version || "1.0.0"}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                        <button onClick={() => handleEdit(app)} style={{ background: "#3b82f6", color: "#fff", border: "none", padding: "6px 8px", borderRadius: "6px", fontSize: "11px", cursor: "pointer", fontWeight: "700" }}>Edit</button>
                        <button onClick={() => handleDelete(app.id)} style={{ background: "#ef4444", color: "#fff", border: "none", padding: "6px 8px", borderRadius: "6px", fontSize: "11px", cursor: "pointer", fontWeight: "700" }}>Delete</button>
                      </div>
                    </div>
                  ))}

                  {totalPages > 1 && (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "6px", marginTop: "14px" }}>
                      <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} style={{ border: "1px solid #cbd5e1", background: currentPage === 1 ? "#f1f5f9" : "#ffffff", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" }}>Prev</button>
                      <span style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>{currentPage} / {totalPages}</span>
                      <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} style={{ border: "1px solid #cbd5e1", background: currentPage === totalPages ? "#f1f5f9" : "#ffffff", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" }}>Next</button>
                    </div>
                  )}

                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: SETTINGS & PASSWORD CHANGE */}
        {activeTab === "settings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            <div style={{ background: "#ffffff", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: "800", color: "#0f172a" }}>⚙️ General Store Settings</h3>
              <form onSubmit={handleSaveSettings} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>Store Name</label>
                  <input type="text" value={settings.storeName} onChange={(e) => setSettings({ ...settings, storeName: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>Support Email</label>
                  <input type="email" value={settings.supportEmail} onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>Telegram Support Link</label>
                  <input type="text" value={settings.telegramLink} onChange={(e) => setSettings({ ...settings, telegramLink: e.target.value })} style={inputStyle} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                  <input type="checkbox" id="mMode" checked={settings.maintenanceMode} onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })} />
                  <label htmlFor="mMode" style={{ fontSize: "12px", fontWeight: "700", color: "#0f172a" }}>Enable Maintenance Mode</label>
                </div>
                <button type="submit" style={{ background: "#d97706", color: "#fff", padding: "10px", border: "none", borderRadius: "8px", fontWeight: "800", cursor: "pointer", marginTop: "8px", fontSize: "13px" }}>Save Settings</button>
              </form>
            </div>

            <div style={{ background: "#ffffff", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: "800", color: "#0f172a" }}>🔑 Change Admin Password</h3>
              <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>Current Password</label>
                  <input type="password" placeholder="Current Password" value={passForm.currentPass} onChange={(e) => setPassForm({ ...passForm, currentPass: e.target.value })} required style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>New Password</label>
                  <input type="password" placeholder="New Password" value={passForm.newPass} onChange={(e) => setPassForm({ ...passForm, newPass: e.target.value })} required style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "#64748b" }}>Confirm New Password</label>
                  <input type="password" placeholder="Confirm New Password" value={passForm.confirmPass} onChange={(e) => setPassForm({ ...passForm, confirmPass: e.target.value })} required style={inputStyle} />
                </div>
                <button type="submit" style={{ background: "#0f172a", color: "#fff", padding: "10px", border: "none", borderRadius: "8px", fontWeight: "800", cursor: "pointer", marginTop: "8px", fontSize: "13px" }}>Update Password</button>
              </form>
            </div>

          </div>
        )}

        {/* TAB 3: BANNER */}
        {activeTab === "banner" && (
          <div style={{ background: "#ffffff", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: "800", color: "#0f172a" }}>📢 Announcement Banner Text</h3>
            <form onSubmit={handleSaveBanner} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <textarea rows={3} value={bannerText} onChange={(e) => setBannerText(e.target.value)} placeholder="Type announcement text..." style={inputStyle}></textarea>
              <button type="submit" style={{ background: "#d97706", color: "#fff", padding: "10px", border: "none", borderRadius: "8px", fontWeight: "800", cursor: "pointer", fontSize: "13px" }}>Update Banner</button>
            </form>
          </div>
        )}

      </main>

    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  fontSize: "12px",
  outline: "none",
  boxSizing: "border-box"
};