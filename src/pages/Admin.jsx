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

const DEFAULT_CATEGORIES = ["Business", "Entertainment", "Games", "Productivity", "Social", "Tools"];

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [adminPassword, setAdminPassword] = useState(() => {
    return localStorage.getItem("lann_admin_pass") || "17041995";
  });

  const [activeTab, setActiveTab] = useState("apps");
  const [apps, setApps] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // 🌐 appType ("App" | "Website") ပါဝင်သော Initial Form State
  const initialFormState = {
    title: "",
    developerName: "",
    developerLink: "",
    category: "Business",
    appType: "App", // "App" သို့မဟုတ် "Website"
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
  };

  const [form, setForm] = useState(initialFormState);

  const [currentPage, setCurrentPage] = useState(1);
  const appsPerPage = 6;

  const [settings, setSettings] = useState({
    storeName: "LannApp",
    supportEmail: "",
    telegramLink: "",
    maintenanceMode: false
  });

  const [passForm, setPassForm] = useState({ currentPass: "", newPass: "", confirmPass: "" });

  useEffect(() => {
    fetchPassword();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchApps();
      fetchSettings();
      fetchCategories();
    }
  }, [isAuthenticated]);

  const fetchPassword = async () => {
    try {
      const docSnap = await getDoc(doc(db, "settings", "auth"));
      if (docSnap.exists() && docSnap.data().password) {
        const dbPass = String(docSnap.data().password).trim();
        setAdminPassword(dbPass);
        localStorage.setItem("lann_admin_pass", dbPass);
      }
    } catch (err) {
      console.warn("Firestore Auth error, using local fallback:", err);
    }
  };

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
      if (docSnap.exists()) setSettings(docSnap.data());
    } catch (err) {
      console.error("Error fetching settings:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const docSnap = await getDoc(doc(db, "settings", "categories"));
      if (docSnap.exists() && docSnap.data().list) {
        const sortedCategories = [...docSnap.data().list].sort((a, b) => a.localeCompare(b));
        setCategories(sortedCategories);
        if (sortedCategories.length > 0) {
          setForm((prev) => ({ ...prev, category: sortedCategories[0] }));
        }
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;

    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      alert("Category already exists!");
      return;
    }

    const updatedList = [...categories, trimmed].sort((a, b) => a.localeCompare(b));
    setCategories(updatedList);
    setNewCategoryInput("");

    try {
      await setDoc(doc(db, "settings", "categories"), { list: updatedList });
      alert("✅ Custom category added successfully!");
    } catch (err) {
      console.error("Error saving categories:", err);
    }
  };

  const handleDeleteCategory = async (catToDelete) => {
    if (categories.length <= 1) {
      alert("You must keep at least one category!");
      return;
    }
    if (window.confirm(`Delete category "${catToDelete}"?`)) {
      const updatedList = categories.filter((c) => c !== catToDelete);
      setCategories(updatedList);
      try {
        await setDoc(doc(db, "settings", "categories"), { list: updatedList });
        alert("Category deleted!");
      } catch (err) {
        console.error("Error deleting category:", err);
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const enteredPass = passwordInput.trim();
    
    if (enteredPass === adminPassword.trim()) {
      setIsAuthenticated(true);
      return;
    }

    try {
      const docSnap = await getDoc(doc(db, "settings", "auth"));
      if (docSnap.exists()) {
        const dbPass = String(docSnap.data().password).trim();
        if (enteredPass === dbPass) {
          setIsAuthenticated(true);
          return;
        }
      }
    } catch (err) {
      console.error(err);
    }

    alert("❌ Incorrect Password!");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passForm.currentPass.trim() !== adminPassword.trim()) {
      alert("❌ Current password is incorrect!");
      return;
    }
    if (passForm.newPass.trim() !== passForm.confirmPass.trim()) {
      alert("❌ New passwords do not match!");
      return;
    }

    const targetPass = passForm.newPass.trim();
    localStorage.setItem("lann_admin_pass", targetPass);
    setAdminPassword(targetPass);

    try {
      await setDoc(doc(db, "settings", "auth"), { password: targetPass }, { merge: true });
      alert("✅ Password changed successfully!");
    } catch (err) {
      alert("⚠️ Updated locally, Firestore blocked.");
    }
    setPassForm({ currentPass: "", newPass: "", confirmPass: "" });
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileUpload = (e, targetField) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2) + " MB";

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({
        ...prev,
        [targetField]: reader.result,
        size: prev.size || fileSizeMB
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleScreenshotUpload = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = [...form.screenshots];
      updated[index] = reader.result;
      setForm({ ...form, screenshots: updated });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitApp = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, "apps", editingId), form);
        alert("Item updated successfully!");
      } else {
        await addDoc(collection(db, "apps"), {
          ...form,
          downloadCount: 0,
          analytics: {
            devices: { Android: 0, iOS: 0, Windows: 0, Other: 0 },
            locations: {}
          }
        });
        alert(`${form.appType === "Website" ? "Website" : "App"} published successfully!`);
      }
      resetForm();
      setShowFormModal(false);
      fetchApps();
    } catch (err) {
      console.error("Error saving data:", err);
      alert("Failed to save.");
    }
  };

  const handleEdit = (app) => {
    setEditingId(app.id);
    setForm({
      title: app.title || "",
      developerName: app.developerName || "",
      developerLink: app.developerLink || "",
      category: app.category || categories[0] || "Business",
      appType: app.appType || "App",
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
    setShowFormModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteDoc(doc(db, "apps", id));
        alert("Item deleted!");
        fetchApps();
      } catch (err) {
        console.error("Error deleting item:", err);
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({
      ...initialFormState,
      category: categories[0] || "Business"
    });
  };

  const indexOfLastApp = currentPage * appsPerPage;
  const indexOfFirstApp = indexOfLastApp - appsPerPage;
  const currentApps = apps.slice(indexOfFirstApp, indexOfLastApp);
  const totalPages = Math.ceil(apps.length / appsPerPage);

  // 🔒 LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a", fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "20px" }}>
        <div style={{ background: "#ffffff", padding: "32px", borderRadius: "20px", width: "100%", maxWidth: "380px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3)", textAlign: "center" }}>
          <div style={{ width: "50px", height: "50px", background: "linear-gradient(135deg, #f59e0b, #d97706)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "24px", fontWeight: "900", margin: "0 auto 16px" }}>L</div>
          <h2 style={{ margin: "0 0 20px 0", fontSize: "1.4rem", fontWeight: "800", color: "#0f172a" }}>Admin Access</h2>
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

  // 📱 DASHBOARD
  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#f8fafc" }}>
      <header style={{ background: "#0f172a", color: "#ffffff", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, #f59e0b, #d97706)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "16px" }}>L</div>
          <span style={{ fontWeight: "800", fontSize: "1.1rem" }}>{settings.storeName || "LannApp"} Admin</span>
        </div>
        <button onClick={() => setIsAuthenticated(false)} style={{ background: "#1e293b", color: "#f87171", border: "1px solid #334155", padding: "6px 12px", borderRadius: "8px", fontSize: "11px", fontWeight: "700", cursor: "pointer" }}>
          Logout 🚪
        </button>
      </header>

      {/* TOP NAVIGATION */}
      <div style={{ background: "#ffffff", borderBottom: "1px solid #e2e8f0", padding: "10px 16px", display: "flex", gap: "8px", alignItems: "center", overflowX: "auto" }}>
        <button onClick={() => setActiveTab("apps")} style={{ padding: "8px 14px", borderRadius: "8px", border: "none", background: activeTab === "apps" ? "#d97706" : "#f1f5f9", color: activeTab === "apps" ? "#ffffff" : "#475569", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}>
          📋 Uploaded Items ({apps.length})
        </button>
        <button onClick={() => setActiveTab("settings")} style={{ padding: "8px 14px", borderRadius: "8px", border: "none", background: activeTab === "settings" ? "#d97706" : "#f1f5f9", color: activeTab === "settings" ? "#ffffff" : "#475569", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}>
          ⚙️ Settings & Categories
        </button>

        <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
          <a 
            href="/" 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ textDecoration: "none", background: "#3b82f6", color: "#ffffff", padding: "8px 14px", borderRadius: "8px", fontWeight: "800", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
            👁️ View Live Store
          </a>

          <button 
            onClick={() => { resetForm(); setShowFormModal(true); }}
            style={{ background: "#10b981", color: "#ffffff", border: "none", padding: "8px 14px", borderRadius: "8px", fontWeight: "800", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
            ➕ Add New Item
          </button>
        </div>
      </div>

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "20px 16px" }}>
        
        {/* TAB 1: UPLOADED APPS & WEBSITES LIST */}
        {activeTab === "apps" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "800", color: "#0f172a" }}>📋 Manage Applications & Websites</h3>
            </div>

            {apps.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", background: "#fff", borderRadius: "16px", color: "#94a3b8" }}>No items found. Click "Add New Item" to publish.</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "16px" }}>
                {currentApps.map((app) => (
                  <div key={app.id} style={{ background: "#ffffff", padding: "16px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
                        <img src={app.imageUrl || "https://via.placeholder.com/50"} alt="" style={{ width: "48px", height: "48px", borderRadius: "10px", objectFit: "cover" }} />
                        <div style={{ overflow: "hidden" }}>
                          <div style={{ fontWeight: "800", fontSize: "14px", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {app.appType === "Website" ? "🌐 " : "📱 "}{app.title}
                          </div>
                          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>{app.category} • v{app.version}</div>
                        </div>
                      </div>

                      <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "8px", border: "1px solid #f1f5f9", marginBottom: "12px", fontSize: "11px", display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "700" }}>
                          <span>📥 {app.appType === "Website" ? "Visits:" : "Downloads:"}</span>
                          <span style={{ color: "#d97706", fontWeight: "800" }}>{app.downloadCount || 0} times</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", color: "#475569" }}>
                          <span>📱 Top Devices:</span>
                          <span>Android ({app.analytics?.devices?.Android || 0}), iOS ({app.analytics?.devices?.iOS || 0})</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => handleEdit(app)} style={{ flex: 1, background: "#3b82f6", color: "#fff", border: "none", padding: "8px", borderRadius: "8px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>✏️ Edit</button>
                      <button onClick={() => handleDelete(app.id)} style={{ flex: 1, background: "#ef4444", color: "#fff", border: "none", padding: "8px", borderRadius: "8px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>🗑️ Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "16px" }}>
                <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} style={{ border: "1px solid #cbd5e1", background: "#fff", padding: "6px 12px", borderRadius: "6px", fontSize: "12px" }}>Prev</button>
                <span style={{ fontSize: "12px", fontWeight: "700", alignSelf: "center" }}>{currentPage} / {totalPages}</span>
                <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} style={{ border: "1px solid #cbd5e1", background: "#fff", padding: "6px 12px", borderRadius: "6px", fontSize: "12px" }}>Next</button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SETTINGS & CUSTOM CATEGORY MANAGEMENT */}
        {activeTab === "settings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            <div style={{ background: "#ffffff", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
              <h3 style={{ margin: "0 0 6px 0", fontSize: "1.1rem", fontWeight: "800" }}>📂 Custom App Categories</h3>
              <p style={{ margin: "0 0 16px 0", fontSize: "12px", color: "#64748b" }}>Add, customize, or remove categories. Categories are ordered alphabetically.</p>
              
              <form onSubmit={handleAddCategory} style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                <input 
                  type="text" 
                  placeholder="Enter custom category name..." 
                  value={newCategoryInput} 
                  onChange={(e) => setNewCategoryInput(e.target.value)} 
                  style={inputStyle} 
                />
                <button type="submit" style={{ background: "#10b981", color: "#fff", padding: "8px 16px", border: "none", borderRadius: "8px", fontWeight: "800", fontSize: "12px", cursor: "pointer", whiteSpace: "nowrap" }}>
                  ➕ Add Category
                </button>
              </form>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {categories.map((cat, idx) => (
                  <span key={idx} style={{ background: "#f1f5f9", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700", color: "#334155", display: "flex", alignItems: "center", gap: "6px" }}>
                    {cat}
                    <button onClick={() => handleDeleteCategory(cat)} style={{ border: "none", background: "none", color: "#ef4444", cursor: "pointer", fontWeight: "800", fontSize: "12px", padding: 0 }}>✕</button>
                  </span>
                ))}
              </div>
            </div>

            <div style={{ background: "#ffffff", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: "800" }}>🔑 Change Admin Password</h3>
              <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <input type="password" placeholder="Current Password" value={passForm.currentPass} onChange={(e) => setPassForm({ ...passForm, currentPass: e.target.value })} required style={inputStyle} />
                <input type="password" placeholder="New Password" value={passForm.newPass} onChange={(e) => setPassForm({ ...passForm, newPass: e.target.value })} required style={inputStyle} />
                <input type="password" placeholder="Confirm Password" value={passForm.confirmPass} onChange={(e) => setPassForm({ ...passForm, confirmPass: e.target.value })} required style={inputStyle} />
                <button type="submit" style={{ background: "#0f172a", color: "#fff", padding: "10px", border: "none", borderRadius: "8px", fontWeight: "800", cursor: "pointer" }}>Update Password</button>
              </form>
            </div>
          </div>
        )}

      </main>

      {/* ➕ MODAL FORM FOR NEW / EDIT APP OR WEBSITE */}
      {showFormModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", zIndex: 1000 }}>
          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontWeight: "800", fontSize: "1.2rem", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#d97706" }}>➕</span> {editingId ? "Edit Item" : "Upload New Item"}
              </h3>
              <button onClick={() => setShowFormModal(false)} style={{ border: "none", background: "none", fontSize: "18px", cursor: "pointer", color: "#64748b" }}>✕</button>
            </div>

            <form onSubmit={handleSubmitApp} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              
              {/* 🌐 TYPE SELECTION (App OR Website) */}
              <div style={{ display: "flex", gap: "10px", marginBottom: "4px" }}>
                <label style={{ flex: 1, cursor: "pointer", padding: "8px", borderRadius: "8px", border: "1px solid #cbd5e1", textAlign: "center", background: form.appType === "App" ? "#d97706" : "#f8fafc", color: form.appType === "App" ? "#fff" : "#0f172a", fontWeight: "700", fontSize: "12px" }}>
                  <input type="radio" name="appType" value="App" checked={form.appType === "App"} onChange={handleChange} style={{ display: "none" }} />
                  📱 Application
                </label>
                <label style={{ flex: 1, cursor: "pointer", padding: "8px", borderRadius: "8px", border: "1px solid #cbd5e1", textAlign: "center", background: form.appType === "Website" ? "#d97706" : "#f8fafc", color: form.appType === "Website" ? "#fff" : "#0f172a", fontWeight: "700", fontSize: "12px" }}>
                  <input type="radio" name="appType" value="Website" checked={form.appType === "Website"} onChange={handleChange} style={{ display: "none" }} />
                  🌐 Website
                </label>
              </div>

              <input type="text" name="title" placeholder={form.appType === "Website" ? "Website Title *" : "App Title *"} value={form.title} onChange={handleChange} required style={inputStyle} />
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <input type="text" name="developerName" placeholder="Developer / Owner Name" value={form.developerName} onChange={handleChange} style={inputStyle} />
                <input type="text" name="developerLink" placeholder="Developer Link (URL)" value={form.developerLink} onChange={handleChange} style={inputStyle} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: form.appType === "App" ? "1fr 1fr 1fr" : "1fr 1fr", gap: "10px" }}>
                {/* CATEGORY DROPDOWN */}
                <select name="category" value={form.category} onChange={handleChange} style={inputStyle}>
                  {categories.map((cat, i) => (
                    <option key={i} value={cat}>{cat}</option>
                  ))}
                </select>

                <input type="text" name="version" placeholder={form.appType === "Website" ? "Status (e.g. Live / v1.0)" : "1.0.0"} value={form.version} onChange={handleChange} style={inputStyle} />
                
                {form.appType === "App" && (
                  <input type="text" name="androidReq" placeholder="Android 8.0+" value={form.androidReq} onChange={handleChange} style={inputStyle} />
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: form.appType === "App" ? "1fr 1fr" : "1fr", gap: "10px" }}>
                {form.appType === "App" && (
                  <input type="text" name="size" placeholder="App Size (e.g., 25 MB)" value={form.size} onChange={handleChange} style={inputStyle} />
                )}
                
                <div>
                  <label style={{ fontSize: "11px", color: "#64748b", fontWeight: "700" }}>Upload Logo / Icon *</label>
                  <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "imageUrl")} style={inputStyle} />
                </div>
              </div>

              {form.imageUrl && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <img src={form.imageUrl} alt="Preview" style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover" }} />
                  <span style={{ fontSize: "11px", color: "#10b981", fontWeight: "700" }}>Icon Selected</span>
                </div>
              )}

              {/* LINKS SECTION */}
              <input type="text" name="driveUrl" placeholder={form.appType === "Website" ? "Primary Website Link *" : "Primary Download Link (Drive/Mega) *"} value={form.driveUrl} onChange={handleChange} required style={inputStyle} />
              <input type="text" name="driveUrl2" placeholder={form.appType === "Website" ? "Mirror Link 1 (Optional)" : "Mirror Link 1 (Optional)"} value={form.driveUrl2} onChange={handleChange} style={inputStyle} />
              <input type="text" name="driveUrl3" placeholder={form.appType === "Website" ? "Mirror Link 2 (Optional)" : "Mirror Link 2 (Optional)"} value={form.driveUrl3} onChange={handleChange} style={inputStyle} />

              <div style={{ textAlign: "center", fontSize: "11px", fontWeight: "700", color: "#64748b", margin: "4px 0" }}>
                Upload Screenshots (Optional)
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {form.screenshots.map((s, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input type="file" accept="image/*" onChange={(e) => handleScreenshotUpload(idx, e)} style={inputStyle} />
                    {s && <img src={s} alt="Screenshot" style={{ width: "32px", height: "32px", borderRadius: "6px", objectFit: "cover" }} />}
                  </div>
                ))}
              </div>

              <textarea name="descEN" placeholder="Description (English)" value={form.descEN} onChange={handleChange} rows={3} style={inputStyle}></textarea>
              <textarea name="descMM" placeholder="Description (Myanmar)" value={form.descMM} onChange={handleChange} rows={3} style={inputStyle}></textarea>

              <button type="submit" style={{ background: "#d97706", color: "#fff", padding: "12px", border: "none", borderRadius: "8px", fontWeight: "800", cursor: "pointer", fontSize: "14px", marginTop: "8px" }}>
                {editingId ? "Update Item" : "Publish Item"}
              </button>
            </form>
          </div>
        </div>
      )}
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