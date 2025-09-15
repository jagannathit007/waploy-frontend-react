# Socket.IO Frontend Implementation (utils/socket.js)

This implementation provides real-time communication between the frontend React application and the backend **utils/socket.js** implementation.

## Features

- **Automatic Connection**: Socket connects automatically when user is authenticated
- **Company Room Management**: Automatically joins company-specific rooms
- **Real-time Messaging**: Send messages to specific companies or broadcast to all
- **Private Status Control**: Toggle customer privacy settings
- **Connection Status**: Visual indicator of socket connection status
- **Error Handling**: Comprehensive error handling and logging
- **Simple Implementation**: Uses the lightweight utils/socket.js backend

## Backend Compatibility

This frontend implementation is specifically designed to work with the **utils/socket.js** backend implementation, which provides:

- **Company-to-socket mapping** (companyId -> socketId)
- **Room-based messaging** (`company_${companyId}`)
- **Database integration** for privacy settings
- **Simple CORS configuration** (origin: "*")
- **No authentication middleware** (simpler implementation)

## Components

### 1. SocketContext (`src/context/SocketContext.tsx`)
- Manages socket connection lifecycle
- Provides socket utilities to child components
- Handles authentication-based connection/disconnection
- **Matches utils/socket.js logging format**

### 2. useSocketEvents Hook (`src/hooks/useSocketEvents.ts`)
- Custom hook for easier socket event handling
- Provides safe wrapper functions with error handling
- Allows custom event handlers for different message types
- **Validates parameters like utils/socket.js**

### 3. SocketStatus Component (`src/components/common/SocketStatus.tsx`)
- Visual indicator of connection status
- Shows socket ID and connection state
- Displays in the application header

### 4. SocketDemo Component (`src/components/common/SocketDemo.tsx`)
- Interactive demo of socket functionality
- Test all socket features
- Real-time message display
- **Shows backend events documentation**

## Usage

### Basic Usage
```tsx
import { useSocket } from '../context/SocketContext';

function MyComponent() {
  const { socket, isConnected, sendToCompany } = useSocket();
  
  const handleSendMessage = () => {
    if (isConnected) {
      sendToCompany('company-id', { text: 'Hello!' });
    }
  };
  
  return (
    <div>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <button onClick={handleSendMessage}>Send Message</button>
    </div>
  );
}
```

### Advanced Usage with Event Handlers
```tsx
import { useSocketEvents } from '../hooks/useSocketEvents';

function MyComponent() {
  const { sendToCompany, joinRoom } = useSocketEvents({
    onCompanyMessage: (message) => {
      console.log('Received company message:', message);
      // Handle company-specific messages
    },
    onGlobalMessage: (message) => {
      console.log('Received global message:', message);
      // Handle global messages
    },
    onPrivateStatusChange: (status) => {
      console.log('Private status changed:', status);
      // Handle privacy status changes
    }
  });
  
  return <div>...</div>;
}
```

## Socket Events (utils/socket.js)

### Client to Server Events
- `joinRoom` - Join a company-specific room
- `leaveRoom` - Leave a company-specific room
- `sendToCompany` - Send message to specific company
- `sendToAll` - Broadcast message to all connected clients
- `isPrivateOn` - Set customer privacy to ON
- `isPrivateOff` - Set customer privacy to OFF

### Server to Client Events
- `message` - Global messages
- `companyMessage` - Company-specific messages
- `connect` - Socket connection established
- `disconnect` - Socket disconnected

## Configuration

The socket connection uses the following configuration:
- **Backend URL**: Retrieved from `VITE_API_BASE` environment variable
- **Transports**: WebSocket and polling fallback
- **Timeout**: 20 seconds
- **Auto-reconnection**: Enabled by default
- **CORS**: Matches utils/socket.js configuration

## Environment Variables

Add to your `.env` file:
```env
VITE_API_BASE=http://localhost:3090/api/web
```

## Integration

The socket functionality is automatically integrated into the application:

1. **App.tsx**: SocketProvider wraps the entire application
2. **AppHeader.tsx**: SocketStatus component shows connection status
3. **Home.tsx**: SocketDemo component for testing functionality

## Backend Events Flow

### Connection Flow
```
1. User authenticates → Token available
2. Socket connects to backend
3. Automatically calls joinRoom with companyId
4. Backend stores company-to-socket mapping
5. Ready for real-time communication
```

### Message Flow
```
Client → Server: sendToCompany({ companyId, message })
Server → Client: companyMessage (to company room)
```

### Privacy Control Flow
```
Client → Server: isPrivateOn({ companyId, customerId })
Server → Database: Update customer.isPrivate = true
Server → Client: companyMessage "isPrivate set to true"
```

## Error Handling

All socket operations include error handling:
- Connection failures are logged and displayed
- Invalid operations are caught and logged
- Graceful fallbacks for network issues
- Automatic cleanup on component unmount
- **Parameter validation matching utils/socket.js**

## Testing

Use the SocketDemo component on the dashboard to test:
- Connection status
- Room joining/leaving
- Message sending (company and global)
- Privacy status changes
- Real-time message reception

## Key Differences from services/socket.services.js

This implementation uses the **simpler utils/socket.js** backend instead of the more complex services/socket.services.js:

- ✅ **No authentication middleware**
- ✅ **Simpler CORS configuration**
- ✅ **Direct company-to-socket mapping**
- ✅ **Basic room management**
- ✅ **Database integration for privacy only**
- ✅ **Comprehensive logging**