import React, { useState, useEffect } from 'react';
import {
  DollarSign, Edit, Save, X, Plus, TrendingUp, TrendingDown,
  AlertCircle, CheckCircle, Clock, Filter, Download, Upload
} from 'lucide-react';

interface RateCard {
  id: string;
  bureau_id: string;
  bureau_name: string;
  category: string;
  role: string;
  seniority: 'JUNIOR' | 'MEDIOR' | 'SENIOR' | 'LEAD' | 'ARCHITECT';
  min_rate: number;
  max_rate: number;
  standard_rate: number;
  currency: string;
  unit: 'HOUR' | 'DAY' | 'MONTH';
  effective_date: string;
  expiry_date: string | null;
  margin_percentage: number;
  volume_discounts: Array<{
    min_volume: number;
    discount_percentage: number;
  }>;
  last_updated: string;
  market_comparison: number; // percentage difference from market avg
}

export default function ContractRates() {
  const [rates, setRates] = useState<RateCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [editingRate, setEditingRate] = useState<string | null>(null);
  const [filterBureau, setFilterBureau] = useState<string>('ALL');

  useEffect(() => {
    fetchRates();
  }, [selectedCategory, filterBureau]);

  const fetchRates = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/vms/contracts/rates');
      const data = await response.json();
      setRates(data);
    } catch (error) {
      // Mock data for demo
      setRates([
        {
          id: '1',
          bureau_id: 'bureau_1',
          bureau_name: 'TechRecruit Solutions',
          category: 'Software Development',
          role: 'Full Stack Developer',
          seniority: 'SENIOR',
          min_rate: 75,
          max_rate: 95,
          standard_rate: 85,
          currency: 'EUR',
          unit: 'HOUR',
          effective_date: '2025-01-01',
          expiry_date: '2025-12-31',
          margin_percentage: 18,
          volume_discounts: [
            { min_volume: 5, discount_percentage: 5 },
            { min_volume: 10, discount_percentage: 10 }
          ],
          last_updated: '2025-01-15',
          market_comparison: -5
        },
        {
          id: '2',
          bureau_id: 'bureau_1',
          bureau_name: 'TechRecruit Solutions',
          category: 'Software Development',
          role: 'Frontend Developer',
          seniority: 'MEDIOR',
          min_rate: 55,
          max_rate: 70,
          standard_rate: 62,
          currency: 'EUR',
          unit: 'HOUR',
          effective_date: '2025-01-01',
          expiry_date: '2025-12-31',
          margin_percentage: 16,
          volume_discounts: [
            { min_volume: 5, discount_percentage: 5 }
          ],
          last_updated: '2025-01-15',
          market_comparison: 2
        },
        {
          id: '3',
          bureau_id: 'bureau_2',
          bureau_name: 'Global Staffing Partners',
          category: 'Data Science',
          role: 'Data Scientist',
          seniority: 'SENIOR',
          min_rate: 80,
          max_rate: 110,
          standard_rate: 95,
          currency: 'EUR',
          unit: 'HOUR',
          effective_date: '2025-01-01',
          expiry_date: null,
          margin_percentage: 20,
          volume_discounts: [
            { min_volume: 3, discount_percentage: 7 },
            { min_volume: 8, discount_percentage: 12 }
          ],
          last_updated: '2025-01-20',
          market_comparison: 8
        },
        {
          id: '4',
          bureau_id: 'bureau_2',
          bureau_name: 'Global Staffing Partners',
          category: 'Project Management',
          role: 'Scrum Master',
          seniority: 'MEDIOR',
          min_rate: 650,
          max_rate: 850,
          standard_rate: 750,
          currency: 'EUR',
          unit: 'DAY',
          effective_date: '2025-01-01',
          expiry_date: '2025-06-30',
          margin_percentage: 15,
          volume_discounts: [],
          last_updated: '2025-01-10',
          market_comparison: -3
        },
        {
          id: '5',
          bureau_id: 'bureau_3',
          bureau_name: 'Elite Recruitment BV',
          category: 'Software Development',
          role: 'DevOps Engineer',
          seniority: 'LEAD',
          min_rate: 90,
          max_rate: 120,
          standard_rate: 105,
          currency: 'EUR',
          unit: 'HOUR',
          effective_date: '2025-02-01',
          expiry_date: '2026-01-31',
          margin_percentage: 22,
          volume_discounts: [
            { min_volume: 5, discount_percentage: 8 },
            { min_volume: 15, discount_percentage: 15 }
          ],
          last_updated: '2025-01-25',
          market_comparison: 12
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const saveRate = async (rateId: string, updates: Partial<RateCard>) => {
    try {
      await fetch(`/api/vms/contracts/rates/${rateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      setRates(rates.map(r =>
        r.id === rateId ? { ...r, ...updates, last_updated: new Date().toISOString() } : r
      ));
      setEditingRate(null);
    } catch (error) {
      console.error('Failed to save rate:', error);
    }
  };

  const categories = ['ALL', 'Software Development', 'Data Science', 'Project Management', 'Design'];
  const bureaus = ['ALL', ...Array.from(new Set(rates.map(r => r.bureau_name)))];

  const seniorityColors = {
    JUNIOR: 'bg-blue-100 text-blue-700',
    MEDIOR: 'bg-green-100 text-green-700',
    SENIOR: 'bg-purple-100 text-purple-700',
    LEAD: 'bg-orange-100 text-orange-700',
    ARCHITECT: 'bg-red-100 text-red-700'
  };

  const filteredRates = rates
    .filter(r => selectedCategory === 'ALL' || r.category === selectedCategory)
    .filter(r => filterBureau === 'ALL' || r.bureau_name === filterBureau);

  const formatRate = (value: number, currency: string, unit: string) => {
    const formatted = new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(value);
    return `${formatted}/${unit.toLowerCase()}`;
  };

  const exportRates = () => {
    console.log('Exporting rates...');
  };

  const importRates = () => {
    console.log('Importing rates...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Rate Cards</h3>
          <p className="text-sm text-gray-600 mt-1">Manage bureau rates and pricing agreements</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={importRates}
            className="px-4 py-2 border rounded-md hover:bg-gray-50 flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Import</span>
          </button>
          <button
            onClick={exportRates}
            className="px-4 py-2 border rounded-md hover:bg-gray-50 flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Rate</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 mb-6">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Bureau</label>
          <select
            value={filterBureau}
            onChange={(e) => setFilterBureau(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            {bureaus.map(bureau => (
              <option key={bureau} value={bureau}>{bureau}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Rates Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Bureau / Role
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Seniority
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Rate Range
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Standard Rate
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Margin
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Market Comp
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Valid Until
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredRates.map((rate) => (
                <tr key={rate.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{rate.role}</p>
                      <p className="text-xs text-gray-500">{rate.bureau_name}</p>
                      <p className="text-xs text-gray-400">{rate.category}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${seniorityColors[rate.seniority]}`}>
                      {rate.seniority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {editingRate === rate.id ? (
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          value={rate.min_rate}
                          onChange={(e) => setRates(rates.map(r =>
                            r.id === rate.id ? { ...r, min_rate: Number(e.target.value) } : r
                          ))}
                          className="w-16 px-1 py-1 border rounded text-sm"
                        />
                        <span>-</span>
                        <input
                          type="number"
                          value={rate.max_rate}
                          onChange={(e) => setRates(rates.map(r =>
                            r.id === rate.id ? { ...r, max_rate: Number(e.target.value) } : r
                          ))}
                          className="w-16 px-1 py-1 border rounded text-sm"
                        />
                      </div>
                    ) : (
                      <span className="text-sm">
                        {formatRate(rate.min_rate, rate.currency, rate.unit)} - {formatRate(rate.max_rate, rate.currency, rate.unit)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {editingRate === rate.id ? (
                      <input
                        type="number"
                        value={rate.standard_rate}
                        onChange={(e) => setRates(rates.map(r =>
                          r.id === rate.id ? { ...r, standard_rate: Number(e.target.value) } : r
                        ))}
                        className="w-20 px-2 py-1 border rounded text-sm"
                      />
                    ) : (
                      <span className="text-sm font-semibold">
                        {formatRate(rate.standard_rate, rate.currency, rate.unit)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-sm">{rate.margin_percentage}%</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center">
                      {rate.market_comparison > 0 ? (
                        <span className="text-red-600 flex items-center text-sm">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          +{rate.market_comparison}%
                        </span>
                      ) : (
                        <span className="text-green-600 flex items-center text-sm">
                          <TrendingDown className="h-4 w-4 mr-1" />
                          {rate.market_comparison}%
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {rate.expiry_date ? (
                      <span className="text-sm">
                        {new Date(rate.expiry_date).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">No expiry</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {editingRate === rate.id ? (
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => saveRate(rate.id, rate)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingRate(null);
                            fetchRates(); // Reset changes
                          }}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingRate(rate.id)}
                        className="p-1 text-gray-500 hover:text-primary hover:bg-gray-50 rounded"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Volume Discounts Summary */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center mb-3">
          <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
          <h4 className="font-semibold text-blue-900">Volume Discount Tiers</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from(new Set(rates.flatMap(r => r.volume_discounts))).slice(0, 3).map((discount, idx) => (
            <div key={idx} className="bg-white rounded-lg p-3">
              <p className="text-sm font-medium text-gray-900">
                {discount.min_volume}+ placements
              </p>
              <p className="text-lg font-bold text-blue-600">
                {discount.discount_percentage}% discount
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}