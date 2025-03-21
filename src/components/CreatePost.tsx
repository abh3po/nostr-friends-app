import { useState } from 'react';
import { Relay, UnsignedEvent, getPublicKey, nip44 } from 'nostr-tools';
import { hexToBytes } from '@noble/hashes/utils';

interface CreatePostProps {
  relay: Relay | null;
  pubkey: string;
  friends: string[];
  viewKey: string;
}

const CreatePost: React.FC<CreatePostProps> = ({ relay, pubkey, viewKey }) => {
  const [postContent, setPostContent] = useState('');
  const createPrivatePost = async () => {
    if (!relay || !postContent || !window.nostr) return;

    const UIntViewKey = hexToBytes(viewKey);
    const conversationKey = nip44.getConversationKey(UIntViewKey, getPublicKey(UIntViewKey) );
    const encryptedContent = nip44.encrypt(postContent, conversationKey) ;

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
    console.log('Post published');
  };

  return (
    <div>
      <h2>Create Private Post</h2>
      <textarea
        value={postContent}
        onChange={(e) => setPostContent(e.target.value)}
        placeholder="Write something for your friends..."
      />
      <button onClick={createPrivatePost}>Post</button>
    </div>
  );
};

export default CreatePost;