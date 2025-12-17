import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Logo and Title */}
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <img src="/assets/logo.svg" alt="SSU Academy Logo" className="h-6 w-6" />
            <span className="text-white font-semibold font-ssu">
              Special Security Unit (SSU) Academy
            </span>
          </div>

          {/* Copyright */}
          <p className="text-sm">
            &copy; {new Date().getFullYear()} SSU Academy. Elite Protective Security Training.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
