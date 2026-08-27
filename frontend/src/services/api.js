import { fetchAuthSession } from 'aws-amplify/auth';

// Replace this with your actual API Gateway URL once deployed
const API_URL = import.meta.env.VITE_API_URL || 'https://mock-api.local';

export const fetchTransactions = async () => {
  // If no real API URL is provided, return mock data for local testing
  if (API_URL === 'https://mock-api.local') {
    return generateMockData();
  }

  try {
    const { tokens } = await fetchAuthSession();
    const token = tokens?.idToken?.toString();
    
    const response = await fetch(`${API_URL}/api/transactions`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      const errText = await response.text().catch(() => 'Unknown Error');
      throw new Error(`HTTP ${response.status}: ${errText} (URL: ${API_URL})`);
    }
    const data = await response.json();
    return data.transactions;
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    throw error;
  }
};

const generateMockData = () => {
  const networks = ['MTN', 'TELECEL', 'AT'];
  const data = [];
  
  for(let i=0; i<20; i++) {
    const network = networks[Math.floor(Math.random() * networks.length)];
    const amount = Math.floor(Math.random() * 500) + 10;
    
    data.push({
      PK: 'MERCHANT#MOCK_123',
      SK: `TX#REF${Math.floor(Math.random() * 1000000)}`,
      Network: network,
      Amount: amount,
      Status: 'COMPLETED',
      CreatedAt: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString()
    });
  }
  
  // Sort descending
  return data.sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
};
