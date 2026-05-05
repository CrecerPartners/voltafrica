import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, supabase as _supabase } from '@digihire/shared';
import { motion } from 'motion/react';
import { Building2, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react';

const supabase = _supabase as any;

export default function Signup() {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
    setLoading(true);
    setError('');
    try {
      const { data: signUpData, error: signUpErr } = await signUp(formData.email, formData.password, formData.contactName, undefined, 'brand');
      if (signUpErr) throw signUpErr;
      const newUser = signUpData?.user;
      if (newUser) {
        const { error: upsertErr } = await supabase.from('brand_profiles').upsert({
          id: newUser.id,
          company_name: formData.companyName,
          contact_name: formData.contactName,
          phone: formData.phoneNumber,
        });
        if (upsertErr) throw upsertErr;
      }
      navigate('/verify-email');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#fafafa] px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl grid md:grid-cols-2 overflow-hidden rounded-xl bg-white shadow-sm border border-gray-200"
      >
        <div className="bg-slate-900 p-10 text-white flex flex-col justify-between">
          <div>
            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-sky-500 font-bold text-xl mb-12">D</div>
            <h2 className="text-3xl font-bold leading-tight">Elite Sales Talent for your Brand</h2>
            <p className="mt-4 text-slate-400 text-sm leading-relaxed">Create a brand account and start hiring the top 1% of sales experts for your growth.</p>
          </div>
          <div className="mt-12 space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-full border border-sky-500/30 flex items-center justify-center text-[10px] font-bold text-sky-400">01</div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-sky-400">Step 01</span>
                <span className="text-xs font-bold">Brand Registration</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-10">
          <form className="space-y-4" onSubmit={handleSignup}>
            {error && <div className="rounded-lg bg-red-50 p-4 text-[10px] font-bold text-red-500 uppercase tracking-widest border border-red-100">{error}</div>}

            <div className="space-y-3.5">
              <InputField label="Company Name" name="companyName" type="text" placeholder="Acme Inc" icon={<Building2 size={16} />} value={formData.companyName} onChange={handleChange} />
              <InputField label="Contact Name" name="contactName" type="text" placeholder="John Smith" icon={<User size={16} />} value={formData.contactName} onChange={handleChange} />
              <InputField label="Work Email" name="email" type="email" placeholder="hr@acme.com" icon={<Mail size={16} />} value={formData.email} onChange={handleChange} />
              <InputField label="Phone" name="phoneNumber" type="tel" placeholder="+1 234 567 890" icon={<Phone size={16} />} value={formData.phoneNumber} onChange={handleChange} />
              <InputField label="Password" name="password" type="password" placeholder="••••••••" icon={<Lock size={16} />} value={formData.password} onChange={handleChange} />
              <InputField label="Confirm" name="confirmPassword" type="password" placeholder="••••••••" icon={<Lock size={16} />} value={formData.confirmPassword} onChange={handleChange} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full justify-center rounded-lg bg-sky-600 py-4 text-xs font-bold text-white hover:bg-sky-700 focus:outline-none disabled:opacity-50 transition-all shadow-lg shadow-sky-100 uppercase tracking-widest mt-4"
            >
              {loading ? 'Registering...' : 'Start Hiring Elite Talent'}
              {!loading && <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" size={14} />}
            </button>
          </form>

          <div className="mt-8 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 border-t border-gray-50 pt-6">
            <span>Already have an account? </span>
            <Link to="/login" className="text-sky-600 hover:text-sky-700 ml-1">
              Login here
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function InputField({ label, name, type, placeholder, icon, value, onChange }: any) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-300">
          {icon}
        </div>
        <input
          name={name}
          type={type}
          required
          className="block w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm font-medium focus:border-sky-500 focus:bg-white focus:outline-none transition-all placeholder-slate-300"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
}
