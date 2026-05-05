import { useState, useEffect } from 'react';
import { supabase as _supabase } from '@digihire/shared';
import { Building2, Search, Globe, Phone, Mail } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = _supabase as any;

interface BrandProfile {
  id: string;
  company_name: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  industry?: string;
  website?: string;
  company_size?: string;
  description?: string;
  status?: string;
  updated_at: string;
}

export default function AdminBrands() {
  const [brands, setBrands] = useState<BrandProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');

  useEffect(() => {
    supabase
      .from('brand_profiles')
      .select('*')
      .order('updated_at', { ascending: false })
      .then(({ data }: { data: BrandProfile[] | null }) => {
        setBrands(data ?? []);
        setLoading(false);
      });
  }, []);

  const industries = Array.from(new Set(brands.map(b => b.industry).filter(Boolean))) as string[];

  const filtered = brands.filter(b => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !q ||
      b.company_name.toLowerCase().includes(q) ||
      (b.contact_name ?? '').toLowerCase().includes(q) ||
      (b.industry ?? '').toLowerCase().includes(q);
    const matchesIndustry = industryFilter === 'all' || b.industry === industryFilter;
    return matchesSearch && matchesIndustry;
  });

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Brand Profiles</h1>
            <p className="text-slate-500">View and manage all registered brand partners.</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex items-center px-4 py-2 text-sm font-bold text-sky-600">
            <Building2 size={18} className="mr-2" /> {brands.length} Brands
          </div>
        </header>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-8 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by company, contact, industry..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 focus:outline-none transition-all"
            />
          </div>
          <select
            value={industryFilter}
            onChange={e => setIndustryFilter(e.target.value)}
            className="bg-gray-50 border border-gray-100 rounded-lg py-2 px-3 text-xs font-medium focus:bg-white focus:outline-none focus:border-sky-500"
          >
            <option value="all">All Industries</option>
            {industries.map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-20 text-slate-400">Loading Brand Profiles...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(brand => (
              <div key={brand.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg border border-indigo-100">
                    {brand.company_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{brand.company_name}</h3>
                    {brand.industry && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{brand.industry}</span>
                    )}
                  </div>
                </div>

                {brand.description && (
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">{brand.description}</p>
                )}

                <div className="space-y-2 text-xs text-slate-500">
                  {brand.contact_name && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300">Contact:</span>
                      <span className="font-medium text-slate-700">{brand.contact_name}</span>
                    </div>
                  )}
                  {brand.contact_email && (
                    <div className="flex items-center gap-2">
                      <Mail size={12} className="text-slate-300" />
                      <span className="font-medium">{brand.contact_email}</span>
                    </div>
                  )}
                  {brand.contact_phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={12} className="text-slate-300" />
                      <span className="font-medium">{brand.contact_phone}</span>
                    </div>
                  )}
                  {brand.website && (
                    <div className="flex items-center gap-2">
                      <Globe size={12} className="text-slate-300" />
                      <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline truncate">{brand.website}</a>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  {brand.company_size && (
                    <span className="text-[10px] text-slate-400 font-medium">{brand.company_size} employees</span>
                  )}
                  <span className="text-[10px] text-slate-400 ml-auto">
                    Updated {new Date(brand.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-3 text-center py-20 text-slate-400">No brand profiles match your search.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
