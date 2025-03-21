import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useNostr } from "./hooks/useNostr";

import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import FriendsPage from "./pages/FriendsPage";
import SettingsPage from "./pages/SettingsPage";

import { WindowNostr } from "nostr-tools/nip07";

declare global {
  interface Window {
    nostr?: WindowNostr;
  }
}

const App: React.FC = () => {
  const { pubkey, relay, login, viewKey, generateViewKey, viewKeyMap } = useNostr();
  const [friends, setFriends] = useState<string[]>(() =>
    JSON.parse(localStorage.getItem("friends") || "[]")
  );
  // todo: fix no explicit any later
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    localStorage.setItem("friends", JSON.stringify(friends));
  }, [friends]);

  if (!pubkey) {
    return (
      <div className="min-h-screen bg-gray-100">
        <LoginPage login={login} />
      </div>
    );
  }

  if (!viewKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-semibold text-blue-600 mb-4">Almost there!</h1>
          <p className="mb-6 text-gray-600">
            You need to generate a view key to start sharing private posts with friends.
          </p>
          <button
            onClick={generateViewKey}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
          >
            Generate View Key
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar pubkey={pubkey} />
        <div className="container mx-auto pt-16 pb-8 px-4 md:px-0 flex">
          <Sidebar pubkey={pubkey} friends={friends} />
          <main className="flex-1 max-w-2xl mx-auto">
            <Routes>
              <Route
                path="/"
                element={
                  <HomePage
                    relay={relay}
                    pubkey={pubkey}
                    friends={friends}
                    viewKey={viewKey}
                    posts={posts}
                    setPosts={setPosts}
                    viewKeyMap={viewKeyMap}
                  />
                }
              />
              <Route path="/profile" element={<ProfilePage pubkey={pubkey} viewKey={viewKey} />} />
              <Route
                path="/friends"
                element={
                  <FriendsPage
                    relay={relay}
                    pubkey={pubkey}
                    viewKey={viewKey}
                    friends={friends}
                    setFriends={setFriends}
                  />
                }
              />
              <Route
                path="/settings"
                element={<SettingsPage pubkey={pubkey} viewKey={viewKey} />}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
