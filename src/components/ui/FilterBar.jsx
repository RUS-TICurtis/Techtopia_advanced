import React from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';

export default function FilterBar({
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  filterOptions = [],
  activeFilters = {},
  onFilterChange,
  onReset
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6 bg-[#1E293B]/40 border border-gray-800 rounded-xl p-4 backdrop-blur-sm">
      {/* Search Input */}
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3.5 top-3 text-gray-500" size={16} />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[#0F172A] border border-gray-800 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#38BDF8] transition-all"
        />
      </div>

      {/* Select Filters */}
      <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto justify-end">
        {filterOptions.map((opt) => (
          <select
            key={opt.name}
            value={activeFilters[opt.name] || ''}
            onChange={(e) => onFilterChange(opt.name, e.target.value)}
            className="bg-[#0F172A] border border-gray-800 text-gray-300 text-sm rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-[#38BDF8] transition-all"
          >
            <option value="">{opt.label}</option>
            {opt.options.map((val) => (
              <option key={val.value} value={val.value}>
                {val.label}
              </option>
            ))}
          </select>
        ))}

        {/* Reset Actions */}
        {onReset && (
          <button
            onClick={onReset}
            className="btn btn-secondary flex items-center gap-1.5 px-4 py-2.5 text-xs text-gray-400 hover:text-white"
            title="Reset Filters"
          >
            <RefreshCw size={14} />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
