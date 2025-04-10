import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiDatabase, FiAlertTriangle, FiCheckCircle, FiRefreshCw, FiClipboard, FiExternalLink } from 'react-icons/fi';

const MongoDBStatus = () => {
  const [status, setStatus] = useState(null);
  const [helpInfo, setHelpInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetchMongoStatus();
  }, []);

  const fetchMongoStatus = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5555/api/mongodb/status', { timeout: 3000 });
      setStatus(response.data);
      
      // Only fetch help info if there's an error
      if (response.data.status !== 'connected') {
        fetchHelpInfo();
      }
    } catch (error) {
      console.error('Error fetching MongoDB status:', error);
      setStatus({
        status: 'unreachable',
        error: {
          message: 'Could not connect to status endpoint',
          type: 'ConnectionError'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchHelpInfo = async () => {
    try {
      const response = await axios.get('http://localhost:5555/api/mongodb/whitelist-help');
      setHelpInfo(response.data);
    } catch (error) {
      console.error('Error fetching MongoDB help information:', error);
    }
  };

  const copyIpToClipboard = () => {
    if (!helpInfo?.currentIp) return;
    
    navigator.clipboard.writeText(helpInfo.currentIp)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      })
      .catch(err => console.error('Failed to copy:', err));
  };

  // Status indicator color
  const getStatusColor = () => {
    if (!status) return 'bg-gray-300';
    
    switch (status.status) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      case 'exhausted': return 'bg-red-600';
      case 'unreachable': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  if (!status && !loading) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()} mr-3`}></div>
            <h3 className="text-lg font-medium text-gray-700 flex items-center">
              <FiDatabase className="mr-2" /> MongoDB Connection Status
            </h3>
          </div>
          <button 
            onClick={fetchMongoStatus}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Refresh status"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-6 text-center text-gray-500">
          <FiRefreshCw className="animate-spin inline-block mb-2 text-3xl" />
          <p>Checking MongoDB connection status...</p>
        </div>
      ) : (
        <>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className={`w-4 h-4 rounded-full ${getStatusColor()} mr-3 animate-pulse`}></div>
              <span className="font-medium text-lg">
                Status: {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
              </span>
            </div>

            {(status.status === 'failed' || status.status === 'exhausted' || status.status === 'unreachable') && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <div className="flex">
                  <FiAlertTriangle className="text-red-500 text-xl flex-shrink-0 mr-3" />
                  <div>
                    <p className="font-medium text-red-700">Connection Error</p>
                    <p className="text-red-600 text-sm">{status.error?.message || 'Connection to MongoDB failed.'}</p>
                    
                    {status.error?.message?.includes('whitelist') && helpInfo && (
                      <div className="mt-3">
                        <p className="font-medium text-red-700">IP Whitelisting Required</p>
                        <p className="text-sm text-red-600 mb-2">
                          Your current IP address needs to be added to MongoDB Atlas whitelist:
                        </p>
                        <div className="flex items-center bg-white p-2 rounded border border-red-200 mb-3">
                          <code className="text-red-800">{helpInfo.currentIp}</code>
                          <button 
                            onClick={copyIpToClipboard}
                            className="ml-2 text-red-600 hover:text-red-800 transition-colors"
                            title="Copy IP address"
                          >
                            <FiClipboard />
                          </button>
                          {copied && <span className="text-xs text-green-600 ml-2">Copied!</span>}
                        </div>
                        <button
                          onClick={() => setExpanded(!expanded)}
                          className="text-sm text-red-700 hover:text-red-900 flex items-center"
                        >
                          {expanded ? 'Hide instructions' : 'Show instructions for whitelisting your IP'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {expanded && helpInfo && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                <h4 className="font-medium text-gray-700 mb-2">How to whitelist your IP in MongoDB Atlas:</h4>
                <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-600">
                  {helpInfo.instructions.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
                <div className="mt-4 flex">
                  <a 
                    href={helpInfo.links.atlas} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <FiExternalLink className="mr-1" /> Open MongoDB Atlas
                  </a>
                  <span className="mx-3 text-gray-300">|</span>
                  <a 
                    href={helpInfo.links.documentation} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <FiExternalLink className="mr-1" /> Read Documentation
                  </a>
                </div>
              </div>
            )}

            {status.status === 'connected' && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4">
                <div className="flex">
                  <FiCheckCircle className="text-green-500 text-xl flex-shrink-0 mr-3" />
                  <div>
                    <p className="font-medium text-green-700">MongoDB Connection Successful</p>
                    <p className="text-sm text-green-600">Database is properly connected and operational.</p>
                  </div>
                </div>
              </div>
            )}

            {status.status === 'connecting' && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <FiRefreshCw className="text-yellow-500 text-xl flex-shrink-0 mr-3 animate-spin" />
                  <div>
                    <p className="font-medium text-yellow-700">Connecting to MongoDB</p>
                    <p className="text-sm text-yellow-600">
                      Attempt {status.attempts} of {status.maxAttempts}. Please wait...
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {status.status !== 'connected' && (
            <div className="px-6 pb-4">
              <button
                onClick={fetchMongoStatus}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center justify-center"
              >
                <FiRefreshCw className={`mr-2 ${loading ? "animate-spin" : ""}`} />
                Check Connection Again
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MongoDBStatus;
