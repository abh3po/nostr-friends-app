import React from "react";
import { Link, useLocation } from "react-router-dom";
import { nip19 } from "nostr-tools";

interface NavbarProps {
  pubkey: string;
}

const Navbar: React.FC<NavbarProps> = ({ pubkey }) => {
  const location = useLocation();
  const npub = nip19.npubEncode(pubkey);
  const shortNpub = `${npub.substring(0, 8)}...${npub.substring(
    npub.length - 4
  )}`;

  return (
    <nav className="bg-blue-600 fixed w-full z-10 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-white text-2xl font-bold">
                nostrfriends
              </span>
            </Link>
          </div>

          <div className="hidden md:flex space-x-4">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === "/"
                  ? "bg-blue-700 text-white"
                  : "text-blue-100 hover:bg-blue-500 hover:text-white"
              }`}
            >
              Home
            </Link>
            <Link
              to="/profile"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === "/profile"
                  ? "bg-blue-700 text-white"
                  : "text-blue-100 hover:bg-blue-500 hover:text-white"
              }`}
            >
              Profile
            </Link>
            <Link
              to="/friends"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === "/friends"
                  ? "bg-blue-700 text-white"
                  : "text-blue-100 hover:bg-blue-500 hover:text-white"
              }`}
            >
              Friends
            </Link>
          </div>

          <div className="flex items-center">
            <Link
              to="/settings"
              className="flex items-center space-x-2 text-white bg-blue-500 hover:bg-blue-700 px-3 py-2 rounded-full text-sm"
            >
              <div className="w-8 h-8 rounded-full bg-blue-300 flex items-center justify-center font-bold">
                {pubkey.substring(0, 2).toUpperCase()}
              </div>
              <span className="hidden md:inline-block">{shortNpub}</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
