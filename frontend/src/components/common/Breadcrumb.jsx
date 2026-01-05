import React from 'react';
import { Link } from 'react-router-dom';

const Breadcrumb = ({ items }) => {
  return (
    <div className="flex items-center gap-2 mb-6">
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <Link to="/" className="flex items-center text-slate-400 hover:text-blue-500 transition-colors">
          <span className="material-symbols-outlined text-[20px]">home</span>
        </Link>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <span className="text-slate-300 dark:text-slate-600 font-light text-xs">&gt;</span>
            <span className="text-sm font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
              {item.label}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Breadcrumb;
