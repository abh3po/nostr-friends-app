import { useState, useEffect } from 'react';
import AddFriend from './components/AddFriend';
import CreatePost from './components/CreatePost';
import PostList from './components/PostList';
import { useNostr } from './hooks/useNostr';
import './App.css';

import type { WindowNostr } from 'nostr-tools/nip07'

declare global {
  interface Window {
    nostr?: WindowNostr;
  }
}

const App: React.FC = () => {
  const { pubkey, relay, login, viewKey, generateViewKey } = useNostr();
  const [friends, setFriends] = useState<string[]>(() => JSON.parse(localStorage.getItem('friends') || '[]'));
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    localStorage.setItem('friends', JSON.stringify(friends));
  }, [friends]);

  return (
    <div className="app">
      <h1>Nostr Friends App</h1>
      {pubkey ? (
        viewKey ? (
          <>
            <AddFriend relay={relay} pubkey={pubkey} viewKey={viewKey} setFriends={setFriends} />
            <CreatePost relay={relay} pubkey={pubkey} friends={friends} viewKey={viewKey} />
            <PostList relay={relay} friends={friends} setPosts={setPosts} pubkey={pubkey} viewKey={viewKey} />
            <p>Your pubkey: {pubkey.slice(0, 8)}...</p>
          </>
        ) : (
          <div>
            <p>No view key found. Generate one to start sharing private posts.</p>
            <button onClick={generateViewKey}>Generate View Key</button>
          </div>
        )
      ) : (
        <div>
          <p>Please sign in with a NIP-07 extension (e.g., Alby).</p>
          <button onClick={login}>Login with NIP-07</button>
        </div>
      )}
    </div>
  );
};

export default App;