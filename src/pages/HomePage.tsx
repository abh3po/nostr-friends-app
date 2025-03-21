import React from 'react';
import { Relay, Event } from 'nostr-tools';
import CreatePostCard from '../components/posts/CreatePostCard';
import PostCard from '../components/posts/PostCard';
import PostList from '../components/PostList'; 

type DecryptedEvent = Event & { decryptedContent?: string };

interface HomePageProps {
  relay: Relay | null;
  pubkey: string;
  friends: string[];
  viewKey: string;
  posts: DecryptedEvent[];
  setPosts: React.Dispatch<React.SetStateAction<DecryptedEvent[]>>;
  viewKeyMap: Map<string, string>;
}

const HomePage: React.FC<HomePageProps> = ({
  relay,
  pubkey,
  friends,
  viewKey,
  posts,
  setPosts,
  viewKeyMap
}) => {
  return (
    <div className="space-y-4">
      <CreatePostCard 
        relay={relay} 
        pubkey={pubkey} 
        friends={friends} 
        viewKey={viewKey} 
      />
      
      <PostList
        relay={relay}
        friends={friends}
        setPosts={setPosts}
        pubkey={pubkey}
        viewKey={viewKey}
        viewKeyMap={viewKeyMap}
        posts={posts}
      />
      
      {posts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h3 className="text-xl font-medium text-gray-800 mb-2">No Posts Yet</h3>
          <p className="text-gray-600">
            Create a post or add friends to see their updates here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
