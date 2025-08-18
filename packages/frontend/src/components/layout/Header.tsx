import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ChevronDown, LogOut, Settings, User } from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import Avatar from '../ui/Avatar';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = (): void => {
    logout();
    setIsDropdownOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">FP</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Financial Pipeline</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/dashboard"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/instruments"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
            >
              Markets
            </Link>
            <Link
              to="/portfolio"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
            >
              Portfolio
            </Link>
            <Link
              to="/watchlist"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
            >
              Watchlist
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell className="h-5 w-5" />
            </button>

            {/* User dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Avatar
                  src={user?.avatar || ''}
                  name={`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username || ''}
                  size="sm"
                />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user?.username
                    }
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {/* Dropdown menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <User className="mr-3 h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <Settings className="mr-3 h-4 w-4" />
                      Settings
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation overlay */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-25 md:hidden"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;