import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const MasterLayout = ({ children, title = '', description = '', language = 'en' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Manage sidebar state

  return (
    <html lang={language}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta name="referrer" content="always" />
        <meta name="description" content={description} />
        <title>{title}</title>
        
        {/* Replace these with your actual CSS and JS files */}
        <link rel="stylesheet" href="/css/main.css" />
        <script src="/js/main.js"></script>
      </head>
      <body>
        <div className="flex h-screen bg-gray-200 font-roboto">
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /> {/* Pass state */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header setSidebarOpen={setSidebarOpen} /> {/* Pass state to toggle sidebar */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
              <div className="container mx-auto px-6 py-8">
                {children}
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
};

export default MasterLayout;