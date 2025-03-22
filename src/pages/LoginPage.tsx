import React from 'react';

interface LoginPageProps {
  login: () => Promise<void>;
}

const LoginPage: React.FC<LoginPageProps> = ({ login }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-blue-600 mb-2">nostrbook</h1>
        <p className="text-xl text-gray-600">Connect with friends on the decentralized web.</p>
      </div>
      
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Sign In</h2>
        
        <p className="mb-6 text-gray-600">
          Please sign in with your NIP-07 extension (such as Alby) to access your account.
        </p>
        
        <button
          onClick={login}
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 
                     transition duration-200 font-medium text-lg"
        >
          Login with NIP-07
        </button>
        
        <div className="mt-6 pt-6 border-t border-gray-200 text-sm text-gray-500">
          <p>
            Don't have a NIP-07 extension? 
            <a href="https://getalby.com" target="_blank" rel="noopener noreferrer" 
               className="text-blue-600 hover:underline ml-1">
              Get Alby Extension
            </a>
          </p>
        </div>
      </div>
      
      <div className="mt-8 text-sm text-gray-500">
        <p>Fully encrypted. Your data is only accessible to you and your friends.</p>
      </div>
    </div>
  );
};

export default LoginPage;
