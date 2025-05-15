// Add at the beginning of your server.js or where you configure Express

// Increase server timeout for SSE connections
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Set higher timeout for SSE connections (2 hours)
server.setTimeout(7200000);

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
});
