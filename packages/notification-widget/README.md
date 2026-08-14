# notification-widget

A framework-agnostic (React-based) UI widget for managing and sending notifications.

## Usage

This widget relies on a simple adapter interface to fetch data and send requests. This means you can drop `<NotificationPanel />` into any React app regardless of the backend (REST, GraphQL, Mock data).

```jsx
import React from 'react';
import { NotificationPanel } from 'notification-widget';
import { createRestAdapter } from 'notification-widget/adapters/restAdapter';

// Create the adapter pointing to your API
const adapter = createRestAdapter({ 
  baseUrl: 'https://api.myapp.com/v1' 
});

export default function MyDashboard() {
  return (
    <div className="container mx-auto">
      <NotificationPanel adapter={adapter} />
    </div>
  );
}
```

## The Adapter Interface

If you don't want to use the default `restAdapter` (e.g., you use GraphQL or want to mock data for tests), you can write your own adapter:

```typescript
interface FrontendAdapter {
  // Fetch users for the table
  getUsers(params: { search: string, page: number, limit: number }): Promise<{
    success: boolean;
    data: { users: any[], total: number, totalPages: number }
  }>;

  // Dispatch a notification to selected users
  sendNotification(params: { userIds: number[], message: string }): Promise<{
    success: boolean;
    data: {
      results: any[];
      summary: { totalSent: number, totalFailed: number }
    }
  }>;
}
```
