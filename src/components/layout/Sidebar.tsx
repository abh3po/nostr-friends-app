import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { nip19 } from 'nostr-tools';

interface SidebarProps {
  pubkey: string;
  friends: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ pubkey, friends }) => {
  const location = useLocation();
  const npub = nip19.npubEncode(pubkey);
  const shortNpub = `${npub.substring(0, 8)}...`;

  return (
    <aside className="hidden md:block w-64 mr-8">
      <div className="sticky top-20 bg-white rounded-lg shadow-md p-4">
        <div className="mb-6">
          <Link to="/profile" className="flex items-center space-x-3 text-gray-800 hover:text-blue-600">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              {pubkey.substring(0, 2).toUpperCase()}
            </div>
            <span className="font-medium">{shortNpub}</span>
          </Link>
        </div>

        <nav className="space-y-1">
          <Link
            to="/"
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
              location.pathname === '/'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Home
          </Link>
          
          <Link
            to="/friends"
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
              location.pathname === '/friends'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            Friends ({friends.length})
          </Link>
          
          <Link
            to="/profile"
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
              location.pathname === '/profile'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            Profile
          </Link>
          
          <Link
            to="/settings"
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
              location.pathname === '/settings'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            Settings
          </Link>
        </nav>

        {friends.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Friends
            </h3>
            <div className="mt-2 space-y-1">
              {friends.slice(0, 5).map((friend) => {
                const friendNpub = nip19.npubEncode(friend);
                const shortFriendNpub = `${friendNpub.substring(0, 8)}...`;
                
                return (
                  <div key={friend} className="flex items-center space-x-2 text-sm text-gray-700 py-1 px-2 rounded-md hover:bg-gray-100">
                    <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold">
                      {friend.substring(0, 2).toUpperCase()}
                    </div>
                    <span>{shortFriendNpub}</span>
                  </div>
                );
              })}
              {friends.length > 5 && (
                <Link to="/friends" className="text-xs text-blue-600 hover:underline pl-2">
                  View all friends
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
