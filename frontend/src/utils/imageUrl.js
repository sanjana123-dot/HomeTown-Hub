/**
 * Convert relative upload URLs to absolute URLs
 * Handles both development (relative) and production (absolute) URLs
 */
export const getImageUrl = (url) => {
  if (!url) return null
  
  // If already an absolute URL (starts with http:// or https://), return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  
  // If relative URL (starts with /uploads/), construct absolute URL
  if (url.startsWith('/uploads/') || url.startsWith('/api/uploads/')) {
    // Get base URL from environment variable
    const apiUrl = import.meta.env.VITE_API_URL || '/api'
    
    // Remove /api suffix if present to get base backend URL
    let baseUrl = apiUrl.replace(/\/api$/, '')
    
    // If no VITE_API_URL is set (development), use relative path
    if (!import.meta.env.VITE_API_URL) {
      return url
    }
    
    // Remove /api from the path if it's there
    const cleanPath = url.replace(/^\/api/, '')
    
    // Construct full URL
    return `${baseUrl}${cleanPath}`
  }
  
  // Return as is if it doesn't match expected patterns
  return url
}
