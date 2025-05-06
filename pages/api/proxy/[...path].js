// pages/api/proxy/[...path].js
export default async function handler(req, res) {
    const { path } = req.query;
    const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    const apiUrl = `http://ec2-13-239-62-109.ap-southeast-2.compute.amazonaws.com/${path.join('/')}${queryString}`;
    
    console.log(`Proxying request to: ${apiUrl}`);
    
    try {
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      console.error(`Proxy error:`, error);
      res.status(500).json({ error: 'Failed to fetch data from API', message: error.message });
    }
  }