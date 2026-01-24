import MarkdownRenderer from "../../components/markdown/MarkdownRenderer";

const sampleMarkdown = `
# Markdown Test Page

This page tests the markdown renderer with large tables and code blocks on small screens.

## Large Table Test

Here's a table with many columns to test horizontal scrolling:

| ID | Product Name | Category | Brand | Price | Stock | Rating | Reviews | SKU | Weight | Dimensions | Color | Material | Warranty |
|----|--------------|----------|-------|-------|-------|--------|---------|-----|--------|------------|-------|----------|----------|
| 1 | MacBook Pro 16" | Laptop | Apple | $2,499 | 45 | 4.8 | 1,234 | MBP16-2024 | 2.1kg | 35.5 x 24.8 x 1.7 cm | Space Gray | Aluminum | 1 Year |
| 2 | Dell XPS 15 | Laptop | Dell | $1,899 | 32 | 4.6 | 892 | DXPS15-24 | 1.9kg | 34.4 x 23.0 x 1.8 cm | Silver | Carbon Fiber | 2 Years |
| 3 | ThinkPad X1 Carbon | Laptop | Lenovo | $1,649 | 28 | 4.5 | 756 | TPX1C-G11 | 1.1kg | 31.5 x 22.2 x 1.5 cm | Black | Magnesium | 3 Years |
| 4 | Surface Pro 9 | Tablet | Microsoft | $1,299 | 51 | 4.4 | 623 | SP9-256 | 0.9kg | 28.7 x 20.9 x 0.9 cm | Platinum | Aluminum | 1 Year |
| 5 | ROG Zephyrus G14 | Gaming | ASUS | $1,799 | 19 | 4.7 | 445 | ROG-G14 | 1.6kg | 31.2 x 22.7 x 1.8 cm | Eclipse Gray | Magnesium | 2 Years |

## Code Block Test - JavaScript

Here's a long code block with syntax highlighting:

\`\`\`javascript
// A comprehensive React component with TypeScript
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  createdAt: Date;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    language: string;
  };
}

interface ApiResponse<T> {
  data: T;
  meta: {
    total: number;
    page: number;
    limit: number;
    hasNextPage: boolean;
  };
}

const fetchUsers = async (page: number, limit: number): Promise<ApiResponse<User[]>> => {
  const response = await axios.get(\`/api/users?page=\${page}&limit=\${limit}\`);
  return response.data;
};

const UserDashboard: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['users', 1, 10],
    queryFn: () => fetchUsers(1, 10),
    staleTime: 5 * 60 * 1000,
  });

  const filteredUsers = useMemo(() => {
    if (!data?.data) return [];
    return data.data.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const handleUserSelect = useCallback((user: User) => {
    setSelectedUser(user);
    console.log('Selected user:', user.name, user.email, user.preferences);
  }, []);

  if (isLoading) return <div className="loading-spinner">Loading users...</div>;
  if (error) return <div className="error-message">Error loading users</div>;

  return (
    <div className="user-dashboard">
      <input 
        type="text" 
        value={searchTerm} 
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search users by name or email..."
      />
      <ul>
        {filteredUsers.map(user => (
          <li key={user.id} onClick={() => handleUserSelect(user)}>
            {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserDashboard;
\`\`\`

## Python Code Block

\`\`\`python
import asyncio
from typing import List, Dict, Optional, Any
from dataclasses import dataclass, field
from datetime import datetime
import aiohttp
import logging

logger = logging.getLogger(__name__)

@dataclass
class DataPoint:
    timestamp: datetime
    value: float
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'timestamp': self.timestamp.isoformat(),
            'value': self.value,
            'metadata': self.metadata,
        }

class AsyncDataProcessor:
    def __init__(self, api_url: str, batch_size: int = 100):
        self.api_url = api_url
        self.batch_size = batch_size
        self._session: Optional[aiohttp.ClientSession] = None
        self._processing_queue: asyncio.Queue[DataPoint] = asyncio.Queue()
    
    async def __aenter__(self):
        self._session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self._session:
            await self._session.close()
    
    async def process_batch(self, data_points: List[DataPoint]) -> Dict[str, Any]:
        if not self._session:
            raise RuntimeError("Session not initialized. Use async context manager.")
        
        async with self._session.post(
            f"{self.api_url}/batch",
            json=[dp.to_dict() for dp in data_points]
        ) as response:
            response.raise_for_status()
            return await response.json()

# Usage example
async def main():
    async with AsyncDataProcessor("https://api.example.com") as processor:
        data_points = [DataPoint(datetime.now(), i * 0.5) for i in range(100)]
        result = await processor.process_batch(data_points)
        print(f"Processed {len(data_points)} data points: {result}")

if __name__ == "__main__":
    asyncio.run(main())
\`\`\`

## Another Large Table - User Data

| User ID | Username | Full Name | Email Address | Phone Number | Country | City | Registration Date | Last Login | Status | Plan | Storage Used |
|---------|----------|-----------|---------------|--------------|---------|------|-------------------|------------|--------|------|--------------|
| U001 | john_doe | John Doe | john.doe@example.com | +1-555-0101 | USA | New York | 2023-01-15 | 2024-01-20 | Active | Premium | 45.2 GB |
| U002 | jane_smith | Jane Smith | jane.smith@example.com | +1-555-0102 | USA | Los Angeles | 2023-02-20 | 2024-01-19 | Active | Basic | 12.8 GB |
| U003 | bob_wilson | Robert Wilson | bob.w@example.com | +44-20-7946-0958 | UK | London | 2023-03-10 | 2024-01-18 | Active | Premium | 78.5 GB |
| U004 | alice_brown | Alice Brown | alice.b@example.com | +49-30-12345678 | Germany | Berlin | 2023-04-05 | 2024-01-15 | Inactive | Basic | 5.1 GB |
| U005 | charlie_davis | Charlie Davis | charlie.d@example.com | +33-1-23-45-67-89 | France | Paris | 2023-05-12 | 2024-01-20 | Active | Enterprise | 156.3 GB |

## Inline Code Test

Here's some inline code: \`const longVariableName = calculateSomethingVeryComplexWithManyParameters(param1, param2, param3)\` and more text after it.

A very long URL: \`https://api.example.com/v2/users/123456789/profile/settings/notifications/preferences?include=all&format=json&timestamp=1706123456789\`

## CSS Code Block

\`\`\`css
/* Modern CSS with custom properties and complex selectors */
:root {
  --primary-color: #3b82f6;
  --secondary-color: #10b981;
  --background-gradient: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  --font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: clamp(1rem, 5vw, 3rem);
}

.card {
  background: white;
  border-radius: 1rem;
  box-shadow: var(--shadow-lg);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }
  
  .grid {
    grid-template-columns: 1fr;
  }
}
\`\`\`

## Blockquote Test

> This is a blockquote that contains some important information. It should be styled nicely with a border on the left side and a subtle background color.

## List Test

1. First ordered item with some longer text that might wrap to the next line on smaller screens
2. Second ordered item
3. Third ordered item
   - Nested unordered item
   - Another nested item
4. Fourth ordered item

---

**End of test page**
`;

const TestMarkdown = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-4">
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6">
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Test Page:</strong> Resize the browser window to test responsive behavior. 
              Tables and code blocks should scroll horizontally on small screens.
            </p>
          </div>
          <MarkdownRenderer content={sampleMarkdown} />
        </div>
      </div>
    </div>
  );
};

export default TestMarkdown;
