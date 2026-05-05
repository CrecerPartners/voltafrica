import React, { useState } from 'react';
import { BrandProfile } from '../../types';
import { useBrandProfile } from '../../hooks/useBrandProfile';
import { motion } from 'motion/react';
import { Save, Building2, Globe, MapPin } from 'lucide-react';

export default function BrandSetup() {
  const { profile, updateProfile } = useBrandProfile();
  const [formData, setFormData] = useState<Partial<BrandProfile>>(profile || {});
  const [saving, setSaving] = useState(false);

  // Sync formData when profile loads
  React.useEffect(() => {
    if (profile) setFormData(profile);
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error: err } = await updateProfile({
        company_name: formData.company_name,
        contact_name: formData.contact_name,
        phone: formData.phone,
        website: formData.website,
        company_type: formData.company_type,
        industry: formData.industry,
        company_size: formData.company_size,
        city: formData.city,
        country: formData.country,
        primary_goal: formData.primary_goal,
      });
      if (err) {
        console.error('Failed to update profile:', err);
        alert('Failed to update company profile.');
      } else {
        alert('Company profile updated!');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
      <div className="border-b border-gray-100 bg-gray-50/50 p-6">
        <h2 className="text-xl font-bold text-[#1a1a1a]">Company Onboarding</h2>
        <p className="text-sm text-[#8e8e8e]">Tell us about your brand so we can match the best talent.</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Company Name" name="company_name" value={formData.company_name} onChange={handleChange} icon={<Building2 size={18} />} />
          <Input label="Website" name="website" value={formData.website} onChange={handleChange} icon={<Globe size={18} />} placeholder="https://company.com" />
          <Input label="Contact Person" name="contact_name" value={formData.contact_name} onChange={handleChange} />
          <Input label="Industry" name="industry" value={formData.industry} onChange={handleChange} placeholder="e.g. SaaS, E-commerce, Fintech" />

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase text-gray-500">Company Size</label>
            <select name="company_size" value={formData.company_size || ''} onChange={handleChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:outline-none">
              <option value="">Select Size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="500+">500+ employees</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase text-gray-500">Primary Goal</label>
            <select name="primary_goal" value={formData.primary_goal || ''} onChange={handleChange} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:outline-none">
              <option value="">Select Goal</option>
              <option value="campaigns">Sales Campaigns</option>
              <option value="recruitment">Long-term Recruitment</option>
              <option value="activations">Brand Activations</option>
            </select>
          </div>

          <Input label="City" name="city" value={formData.city} onChange={handleChange} icon={<MapPin size={18} />} />
          <Input label="Country" name="country" value={formData.country} onChange={handleChange} icon={<MapPin size={18} />} />
        </div>

        <div className="pt-8 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-[#2563eb] px-8 py-3 text-sm font-bold text-white hover:bg-[#1d4ed8] transition-all shadow-lg shadow-blue-100"
          >
            {saving ? 'Updating...' : 'Save Company Details'}
            <Save size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({ label, name, type = "text", value, onChange, placeholder, icon }: any) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold uppercase text-gray-500">{label}</label>
      <div className="relative">
        {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">{icon}</div>}
        <input
          type={type}
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:bg-white focus:outline-none transition-all ${icon ? 'pl-9' : ''}`}
        />
      </div>
    </div>
  );
}
