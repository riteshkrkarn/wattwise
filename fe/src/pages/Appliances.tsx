import React, { useState } from 'react';
import { AnimatedNavBar } from '../components/AnimatedNavBar';
import { Link } from 'react-router-dom';
import { 
  Wind, 
  Refrigerator, 
  WashingMachine, 
  Droplet, 
  Tv, 
  Microwave,
  Fan,
  Lightbulb,
  Shirt,
  Monitor,
  Plug
} from 'lucide-react';
import './Appliances.css';

interface Appliance {
  id: string;
  category: string;
  customName: string;
  brand: string;
  powerRating: number;
  dailyUsage: number;
  monthlyConsumption: number;
  monthlyCost: number;
}

const applianceCategories = [
  { value: 'air_conditioner', label: 'Air Conditioner', icon: Wind },
  { value: 'refrigerator', label: 'Refrigerator', icon: Refrigerator },
  { value: 'washing_machine', label: 'Washing Machine', icon: WashingMachine },
  { value: 'water_heater', label: 'Water Heater (Geyser)', icon: Droplet },
  { value: 'television', label: 'Television', icon: Tv },
  { value: 'microwave', label: 'Microwave', icon: Microwave },
  { value: 'fan', label: 'Fan', icon: Fan },
  { value: 'lighting', label: 'Lighting', icon: Lightbulb },
  { value: 'iron', label: 'Iron', icon: Shirt },
  { value: 'computer', label: 'Computer/Laptop', icon: Monitor },
  { value: 'other', label: 'Other', icon: Plug },
];

const Appliances: React.FC = () => {
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    category: '',
    customName: '',
    brand: '',
    powerRating: '',
    dailyUsage: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const calculateConsumption = (power: number, hours: number) => {
    const monthlyKWh = (power * hours * 30) / 1000; // Convert Wh to kWh
    const monthlyCost = monthlyKWh * 7; // ₹7 per kWh
    return { monthlyKWh, monthlyCost };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const { monthlyKWh, monthlyCost } = calculateConsumption(
      Number(formData.powerRating),
      Number(formData.dailyUsage)
    );

    const newAppliance: Appliance = {
      id: editingId || Date.now().toString(),
      category: formData.category,
      customName: formData.customName,
      brand: formData.brand,
      powerRating: Number(formData.powerRating),
      dailyUsage: Number(formData.dailyUsage),
      monthlyConsumption: Math.round(monthlyKWh),
      monthlyCost: Math.round(monthlyCost),
    };

    if (editingId) {
      setAppliances(prev => prev.map(app => app.id === editingId ? newAppliance : app));
      setEditingId(null);
    } else {
      setAppliances(prev => [...prev, newAppliance]);
    }

    // Reset form
    setFormData({
      category: '',
      customName: '',
      brand: '',
      powerRating: '',
      dailyUsage: '',
    });
    setShowForm(false);
  };

  const handleEdit = (appliance: Appliance) => {
    setFormData({
      category: appliance.category,
      customName: appliance.customName,
      brand: appliance.brand,
      powerRating: appliance.powerRating.toString(),
      dailyUsage: appliance.dailyUsage.toString(),
    });
    setEditingId(appliance.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setAppliances(prev => prev.filter(app => app.id !== id));
  };

  const handleCancel = () => {
    setFormData({
      category: '',
      customName: '',
      brand: '',
      powerRating: '',
      dailyUsage: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const toTitleCase = (text: string) => {
    return text
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const getCategoryLabel = (value: string) => {
    return applianceCategories.find(cat => cat.value === value)?.label || toTitleCase(value);
  };

  const getCategoryIcon = (value: string) => {
    const IconComponent = applianceCategories.find(cat => cat.value === value)?.icon || Plug;
    return <IconComponent size={40} strokeWidth={1.5} className="appliance-icon-svg" />;
  };

  const totalConsumption = appliances.reduce((sum, app) => sum + app.monthlyConsumption, 0);
  const totalCost = appliances.reduce((sum, app) => sum + app.monthlyCost, 0);

  return (
    <div className="appliances-page">
      <AnimatedNavBar />
      
      <div className="appliances-container">
        <div className="appliances-header">
          <div>
            <h1>Appliances</h1>
            <p className="appliances-subtitle">Add your appliances manually or upload your electricity bill</p>
          </div>
          {!showForm && (
            <button className="add-appliance-btn" onClick={() => setShowForm(true)}>
              + Add Appliance
            </button>
          )}
        </div>

        {/* Two Options */}
        {appliances.length === 0 && !showForm && (
          <div className="input-options">
            <div className="option-card" onClick={() => setShowForm(true)}>
              <div className="option-icon">
                <Monitor size={48} strokeWidth={1.5} />
              </div>
              <h3>Manual Entry</h3>
              <p>Add appliance details manually</p>
              <button className="option-btn">Start Adding</button>
            </div>
            
            <div className="option-card">
              <div className="option-icon">
                <Lightbulb size={48} strokeWidth={1.5} />
              </div>
              <h3>Upload Bill</h3>
              <p>AI will extract appliance data from your bill</p>
              <Link to="/bills" className="option-btn">Go to Bills</Link>
            </div>
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="appliance-form-card">
            <h2>{editingId ? 'Edit Appliance' : 'Add New Appliance'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="category">Appliance Type *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select type</option>
                    {applianceCategories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="customName">Custom Name (Optional)</label>
                  <input
                    type="text"
                    id="customName"
                    name="customName"
                    value={formData.customName}
                    onChange={handleInputChange}
                    placeholder="e.g., Bedroom AC"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="brand">Brand (Optional)</label>
                  <input
                    type="text"
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    placeholder="e.g., Samsung"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="powerRating">Power Rating (Watts) *</label>
                  <input
                    type="number"
                    id="powerRating"
                    name="powerRating"
                    value={formData.powerRating}
                    onChange={handleInputChange}
                    placeholder="e.g., 1500"
                    required
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="dailyUsage">Daily Usage (Hours) *</label>
                  <input
                    type="number"
                    id="dailyUsage"
                    name="dailyUsage"
                    value={formData.dailyUsage}
                    onChange={handleInputChange}
                    placeholder="e.g., 8"
                    required
                    min="0"
                    max="24"
                    step="0.5"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={handleCancel}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingId ? 'Update' : 'Add'} Appliance
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Appliances List */}
        {appliances.length > 0 && (
          <>
            <div className="appliances-summary">
              <div className="summary-item">
                <span className="summary-label">Total Appliances</span>
                <span className="summary-value">{appliances.length}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Monthly Consumption</span>
                <span className="summary-value">{totalConsumption} kWh</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Estimated Monthly Cost</span>
                <span className="summary-value highlight">₹{totalCost}</span>
              </div>
            </div>

            <div className="appliances-grid">
              {appliances.map(appliance => (
                <div key={appliance.id} className="appliance-card">
                  <div className="appliance-card-header">
                    <div className="appliance-icon-name">
                      <div className="appliance-icon-large">
                        {getCategoryIcon(appliance.category)}
                      </div>
                      <div>
                        <h3 className="appliance-name">
                          {appliance.customName || getCategoryLabel(appliance.category)}
                        </h3>
                        {appliance.customName && (
                          <p className="appliance-type">{getCategoryLabel(appliance.category)}</p>
                        )}
                        {appliance.brand && (
                          <p className="appliance-brand">{appliance.brand}</p>
                        )}
                      </div>
                    </div>
                    <div className="appliance-actions">
                      <button className="edit-btn" onClick={() => handleEdit(appliance)} title="Edit">
                        ✏️
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(appliance.id)} title="Delete">
                        ×
                      </button>
                    </div>
                  </div>

                  <div className="appliance-stats">
                    <div className="stat-item">
                      <span className="stat-label">Power</span>
                      <span className="stat-value">{appliance.powerRating}W</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Daily Usage</span>
                      <span className="stat-value">{appliance.dailyUsage}h</span>
                    </div>
                  </div>

                  <div className="appliance-consumption">
                    <div className="consumption-row">
                      <span>Monthly Consumption</span>
                      <span className="consumption-value">{appliance.monthlyConsumption} kWh</span>
                    </div>
                    <div className="consumption-row">
                      <span>Estimated Cost</span>
                      <span className="cost-value">₹{appliance.monthlyCost}/mo</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Appliances;
