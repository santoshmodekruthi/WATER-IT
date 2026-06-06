import React, { useState, useEffect } from "react";
import { 
  Search, 
  Droplets, 
  ShieldCheck, 
  Activity, 
  Info, 
  MapPin, 
  AlertTriangle, 
  Waves,
  ChevronRight,
  Menu,
  X,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PREDEFINED_AREAS = [
  "MVP Colony", "Gajuwaka", "Madhurawada", "Rushikonda", "Seethammadhara",
  "Dwaraka Nagar", "NAD Junction", "Simhachalam", "Anakapalle", "Bheemili",
  "Srikakulam", "Vizianagaram", "Kakinada", "Rajahmundry", "Eluru",
  "Vijayawada", "Guntur", "Tenali", "Nellore", "Tirupati"
];

// Helper functions for water quality calculation
const getTDSStatus = (val) => {
  if (val < 300) return { label: "Low", color: "text-green-400", quality: "Safe" };
  if (val <= 600) return { label: "Moderate", color: "text-yellow-400", quality: "Moderate" };
  return { label: "High", color: "text-red-400", quality: "Unsafe" };
};

const getPHStatus = (val) => {
  if (val < 6.5) return { label: "Acidic", color: "text-red-400", quality: "Unsafe" };
  if (val <= 8.5) return { label: "Normal", color: "text-green-400", quality: "Safe" };
  return { label: "Alkaline", color: "text-red-400", quality: "Unsafe" };
};

const getFluorideStatus = (val) => {
  if (val < 1.0) return { label: "Safe", color: "text-green-400", quality: "Safe" };
  if (val <= 1.5) return { label: "Moderate", color: "text-yellow-400", quality: "Moderate" };
  return { label: "High", color: "text-red-400", quality: "Unsafe" };
};

const getLeadStatus = (val) => {
  if (val < 0.01) return { label: "Safe", color: "text-green-400", quality: "Safe" };
  if (val <= 0.05) return { label: "Moderate", color: "text-yellow-400", quality: "Moderate" };
  return { label: "High", color: "text-red-400", quality: "Unsafe" };
};

const getTurbidityStatus = (val) => {
  if (val < 1.0) return { label: "Low", color: "text-green-400", quality: "Safe" };
  if (val <= 5.0) return { label: "Moderate", color: "text-yellow-400", quality: "Moderate" };
  return { label: "High", color: "text-red-400", quality: "Unsafe" };
};

const calculateOverallQuality = (tds, ph, fluoride, lead, turbidity) => {
  const statuses = [
    getTDSStatus(tds).quality,
    getPHStatus(ph).quality,
    getFluorideStatus(fluoride).quality,
    getLeadStatus(lead).quality,
    getTurbidityStatus(turbidity).quality
  ];

  if (statuses.includes("Unsafe")) return "Unsafe";
  if (statuses.includes("Moderate")) return "Moderate";
  return "Safe";
};

function App() {
  const [search, setSearch] = useState("");
  const [result, setResult] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // New States for CRUD
  const [records, setRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    area: "",
    customArea: "",
    tds: "",
    ph: "",
    fluoride: "",
    lead: "",
    turbidity: ""
  });
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);

  // Load records from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("hydrocare_records");
    if (saved) {
      setRecords(JSON.parse(saved));
    }
  }, []);

  // Save records to localStorage
  useEffect(() => {
    localStorage.setItem("hydrocare_records", JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!formData.area) newErrors.area = "Area is required";
    if (formData.area === "custom" && !formData.customArea) newErrors.customArea = "Custom area name is required";
    if (!formData.tds || formData.tds < 0) newErrors.tds = "Valid TDS is required";
    if (!formData.ph || formData.ph < 0 || formData.ph > 14) newErrors.ph = "Valid pH (0-14) is required";
    if (!formData.fluoride || formData.fluoride < 0) newErrors.fluoride = "Valid Fluoride is required";
    if (!formData.lead || formData.lead < 0) newErrors.lead = "Valid Lead is required";
    if (!formData.turbidity || formData.turbidity < 0) newErrors.turbidity = "Valid Turbidity is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveRecord = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const areaName = formData.area === "custom" ? formData.customArea : formData.area;
    const overall = calculateOverallQuality(
      parseFloat(formData.tds),
      parseFloat(formData.ph),
      parseFloat(formData.fluoride),
      parseFloat(formData.lead),
      parseFloat(formData.turbidity)
    );

    const newRecord = {
      id: editingId || Date.now(),
      area: areaName,
      tds: parseFloat(formData.tds),
      ph: parseFloat(formData.ph),
      fluoride: parseFloat(formData.fluoride),
      lead: parseFloat(formData.lead),
      turbidity: parseFloat(formData.turbidity),
      overall: overall,
      timestamp: new Date().toISOString()
    };

    if (editingId) {
      setRecords(records.map(r => r.id === editingId ? newRecord : r));
      setEditingId(null);
    } else {
      setRecords([newRecord, ...records]);
    }

    // Reset form
    setFormData({ area: "", customArea: "", tds: "", ph: "", fluoride: "", lead: "", turbidity: "" });
    setShowForm(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      setRecords(records.filter(r => r.id !== id));
      if (result && result.id === id) setResult(null);
    }
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    setFormData({
      area: PREDEFINED_AREAS.includes(record.area) ? record.area : "custom",
      customArea: PREDEFINED_AREAS.includes(record.area) ? "" : record.area,
      tds: record.tds,
      ph: record.ph,
      fluoride: record.fluoride,
      lead: record.lead,
      turbidity: record.turbidity
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = () => {
    if (!search.trim()) return;
    const found = records.find(
      (item) => item.area.toLowerCase().includes(search.toLowerCase())
    );
    setResult(found || "notfound");
    setTimeout(() => {
      document.getElementById("search-results")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-brand-dark text-white selection:bg-brand-accent selection:text-brand-dark">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-accent/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "glass py-3" : "py-6"}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="p-2 bg-brand-accent rounded-lg group-hover:shadow-glow transition-shadow">
              <Droplets className="text-brand-dark w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-glow">HydroCare</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-brand-accent text-brand-dark font-bold text-sm hover:shadow-glow hover:scale-105 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Details
            </button>
            <a href="#records" className="text-sm font-medium hover:text-brand-accent transition-colors">Records</a>
          </div>

          <button className="md:hidden p-2 glass rounded-lg" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden glass border-t border-white/10 overflow-hidden"
            >
              <div className="flex flex-col p-6 gap-4">
                <button 
                  onClick={() => { setShowForm(true); setIsMenuOpen(false); }}
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-brand-accent text-brand-dark font-bold hover:shadow-glow transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Details
                </button>
                <a href="#records" className="text-lg text-center py-2" onClick={() => setIsMenuOpen(false)}>Records</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero & Search Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase rounded-full glass border-brand-accent/30 text-brand-accent">
              Water Intelligence Hub
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              Monitor <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-blue-400">Water Quality</span><br />
              With Precision
            </h1>
          </motion.div>

          {/* Search Bar */}
          <motion.div 
            className="max-w-xl mx-auto flex gap-3 p-2 rounded-2xl glass border-white/10 mt-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="flex-1 flex items-center gap-3 px-4">
              <Search className="text-brand-accent w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search saved area records..." 
                className="w-full bg-transparent border-none outline-none text-white placeholder:text-gray-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button 
              onClick={handleSearch}
              className="bg-brand-accent text-brand-dark px-6 py-3 rounded-xl font-bold hover:shadow-glow transition-all active:scale-95"
            >
              Search
            </button>
          </motion.div>
        </div>
      </section>

      {/* Add/Edit Form Section */}
      <AnimatePresence>
        {showForm && (
          <motion.section 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-6 pb-20 overflow-hidden"
          >
            <div className="container mx-auto max-w-2xl">
              <div className="glass-card p-8 rounded-[2.5rem] border-brand-accent/20">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-bold flex items-center gap-3">
                    <Plus className="text-brand-accent" />
                    {editingId ? "Edit Water Details" : "Add Water Details"}
                  </h2>
                  <button onClick={() => { setShowForm(false); setEditingId(null); }} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X />
                  </button>
                </div>

                <form onSubmit={handleSaveRecord} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">Area Name</label>
                      <select 
                        className={`w-full glass p-3 rounded-xl outline-none border transition-colors ${errors.area ? 'border-red-500/50' : 'border-white/10 focus:border-brand-accent/50'}`}
                        value={formData.area}
                        onChange={(e) => setFormData({...formData, area: e.target.value})}
                      >
                        <option value="" className="bg-brand-dark">Select Area</option>
                        {PREDEFINED_AREAS.map(area => <option key={area} value={area} className="bg-brand-dark">{area}</option>)}
                        <option value="custom" className="bg-brand-dark">Other (Custom Input)</option>
                      </select>
                      {errors.area && <p className="text-red-400 text-xs">{errors.area}</p>}
                    </div>

                    {formData.area === "custom" && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Custom Area Name</label>
                        <input 
                          type="text"
                          className={`w-full glass p-3 rounded-xl outline-none border transition-colors ${errors.customArea ? 'border-red-500/50' : 'border-white/10 focus:border-brand-accent/50'}`}
                          placeholder="Enter area name"
                          value={formData.customArea}
                          onChange={(e) => setFormData({...formData, customArea: e.target.value})}
                        />
                        {errors.customArea && <p className="text-red-400 text-xs">{errors.customArea}</p>}
                      </div>
                    )}

                    <InputGroup label="TDS (ppm)" value={formData.tds} error={errors.tds} onChange={(val) => setFormData({...formData, tds: val})} placeholder="e.g. 250" />
                    <InputGroup label="pH Level" value={formData.ph} error={errors.ph} onChange={(val) => setFormData({...formData, ph: val})} placeholder="0 - 14" />
                    <InputGroup label="Fluoride (ppm)" value={formData.fluoride} error={errors.fluoride} onChange={(val) => setFormData({...formData, fluoride: val})} placeholder="e.g. 0.8" />
                    <InputGroup label="Lead (ppm)" value={formData.lead} error={errors.lead} onChange={(val) => setFormData({...formData, lead: val})} placeholder="e.g. 0.01" />
                    <InputGroup label="Turbidity (NTU)" value={formData.turbidity} error={errors.turbidity} onChange={(val) => setFormData({...formData, turbidity: val})} placeholder="e.g. 0.5" />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 rounded-2xl bg-brand-accent text-brand-dark font-black text-lg hover:shadow-glow hover:scale-[1.02] transition-all"
                  >
                    {editingId ? "Update Record" : "Save Water Analysis"}
                  </button>
                </form>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Results Section */}
      <AnimatePresence>
        {result && (
          <motion.section 
            id="search-results"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="py-10 px-6"
          >
            <div className="container mx-auto">
              {result === "notfound" ? (
                <div className="max-w-md mx-auto glass-card p-10 rounded-[2rem] text-center border-red-500/20">
                  <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Record Not Found</h2>
                  <p className="text-gray-400">No saved records found for "{search}".</p>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto">
                   <div className="glass-card p-8 rounded-[2.5rem] relative overflow-hidden group">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <MapPin className="text-brand-accent" />
                            <h2 className="text-4xl font-bold">{result.area}</h2>
                          </div>
                          <div className="flex gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(result.timestamp).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(result.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                        <div className={`px-8 py-3 rounded-full font-black text-xl flex items-center gap-2 ${result.overall === 'Safe' ? 'bg-green-500/20 text-green-400' : result.overall === 'Moderate' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                          {result.overall === 'Safe' ? <CheckCircle2 /> : <AlertCircle />}
                          {result.overall}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatusMetric label="TDS" value={result.tds} unit="ppm" status={getTDSStatus(result.tds)} />
                        <StatusMetric label="pH Level" value={result.ph} unit="" status={getPHStatus(result.ph)} />
                        <StatusMetric label="Fluoride" value={result.fluoride} unit="ppm" status={getFluorideStatus(result.fluoride)} />
                        <StatusMetric label="Lead" value={result.lead} unit="ppm" status={getLeadStatus(result.lead)} />
                        <StatusMetric label="Turbidity" value={result.turbidity} unit="NTU" status={getTurbidityStatus(result.turbidity)} />
                      </div>
                   </div>
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Records Table Section */}
      <section id="records" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
            <div>
              <h2 className="text-4xl font-bold mb-2">Recent Records</h2>
              <p className="text-gray-400">Management hub for all monitored area data.</p>
            </div>
            <button 
              onClick={() => { setEditingId(null); setFormData({ area: "", customArea: "", tds: "", ph: "", fluoride: "", lead: "", turbidity: "" }); setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl glass border-brand-accent/30 text-brand-accent font-bold hover:bg-brand-accent/10 transition-all"
            >
              <Plus className="w-5 h-5" /> Add New Record
            </button>
          </div>

          <div className="glass-card rounded-[2rem] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="p-6 text-sm font-bold text-gray-400 uppercase tracking-wider">Area</th>
                    <th className="p-6 text-sm font-bold text-gray-400 uppercase tracking-wider">Quality</th>
                    <th className="p-6 text-sm font-bold text-gray-400 uppercase tracking-wider">Parameters (TDS/pH)</th>
                    <th className="p-6 text-sm font-bold text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="p-6 text-sm font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {records.length > 0 ? records.map((record) => (
                    <tr key={record.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-6">
                        <span className="font-bold block">{record.area}</span>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${record.overall === 'Safe' ? 'bg-green-500/20 text-green-400' : record.overall === 'Moderate' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                          {record.overall}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex gap-3 text-sm">
                          <span className="text-gray-400">TDS: <span className="text-white font-medium">{record.tds}</span></span>
                          <span className="text-gray-400">pH: <span className="text-white font-medium">{record.ph}</span></span>
                        </div>
                      </td>
                      <td className="p-6 text-sm text-gray-400">
                        {new Date(record.timestamp).toLocaleDateString()}
                      </td>
                      <td className="p-6">
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(record)} className="p-2 glass hover:text-brand-accent rounded-lg transition-all"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(record.id)} className="p-2 glass hover:text-red-400 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                          <button onClick={() => { setResult(record); document.getElementById("search-results")?.scrollIntoView({ behavior: "smooth" }); }} className="p-2 glass hover:text-blue-400 rounded-lg transition-all"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="p-20 text-center text-gray-500 italic">No records found. Add your first water quality analysis.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 px-6 bg-black/20">
        <div className="container mx-auto text-center">
          <div className="flex justify-center items-center gap-2 mb-6">
            <div className="p-2 bg-brand-accent rounded-lg">
              <Droplets className="text-brand-dark w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">HydroCare</span>
          </div>
          <p className="text-gray-500 text-sm max-w-sm mx-auto mb-8">
            Empowering communities with real-time water quality intelligence and historical monitoring.
          </p>
          <div className="pt-8 border-t border-white/5 text-gray-600 text-xs">
            © 2026 HydroCare Intelligence Systems. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function InputGroup({ label, value, onChange, placeholder, error }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-400">{label}</label>
      <input 
        type="number"
        step="0.01"
        className={`w-full glass p-3 rounded-xl outline-none border transition-colors ${error ? 'border-red-500/50' : 'border-white/10 focus:border-brand-accent/50'}`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

function StatusMetric({ label, value, unit, status }) {
  return (
    <div className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-brand-accent/20 transition-all group">
      <p className="text-xs text-gray-500 mb-1 uppercase tracking-widest font-bold">{label}</p>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-3xl font-black text-white">{value}</span>
        <span className="text-sm text-gray-500">{unit}</span>
      </div>
      <div className={`flex items-center gap-1 text-sm font-bold ${status.color}`}>
        <Activity className="w-3 h-3" />
        {status.label}
      </div>
    </div>
  );
}

export default App;
