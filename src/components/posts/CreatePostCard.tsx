import React, { useState } from 'react';
import { Relay, UnsignedEvent, getPublicKey, nip44 } from 'nostr-tools';
import { hexToBytes } from '@noble/hashes/utils';

interface CreatePostCardProps {
  relay: Relay | null;
  pubkey: string;
  friends: string[];
  viewKey: string;
}

const CreatePostCard: React.FC<CreatePostCardProps> = ({ relay, pubkey, friends, viewKey }) => {
  const [postContent, setPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const createPrivatePost = async () => {
    if (!relay || !postContent || !window.nostr) return;
    
    try {
      setIsPosting(true);
      
      const UIntViewKey = hexToBytes(viewKey);
      const conversationKey = nip44.getConversationKey(UIntViewKey, getPublicKey(UIntViewKey));
      const encryptedContent = nip44.encrypt(postContent, conversationKey);

      const postEvent: UnsignedEvent = {
        kind: 9876,
        pubkey,
        created_at: Math.floor(Date.now() / 1000),
        tags: [],
        content: encryptedContent,
      };
      
      const signedPostEvent = await window.nostr.signEvent(postEvent);
      await relay.publish(signedPostEvent);

      setPostContent('');
      setIsPosting(false);
    } catch (error) {
      console.error('Error creating post:', error);
      setIsPosting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
          {pubkey.substring(0, 2).toUpperCase()}
        </div>
        <div className="flex-1">
          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[80px]"
          />
          
          <div className="mt-3 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {friends.length === 0 ? (
                <span>Add friends to share your posts with them</span>
              ) : (
                <span>Sharing with {friends.length} friend{friends.length !== 1 ? 's' : ''}</span>
              )}
            </div>
            
            <button
              onClick={createPrivatePost}
              disabled={!postContent.trim() || isPosting}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                !postContent.trim() || isPosting
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isPosting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostCard;
