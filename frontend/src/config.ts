// In DDEV, we expose the backend on port 5000 (HTTPS) or 5001 (HTTP)
// When accessing via investia.ddev.site, the router handles the mapping.
export const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : `${window.location.protocol}//${window.location.hostname}:5000`;
