# Firebase Issues & Solutions

This document explains common Firebase issues and their solutions for MEMEFY AI.

## Common Firebase Errors

### 1. Index Errors
```
Error: The query requires an index
```

**Solution**: The app now handles this gracefully by:
- Falling back to simpler queries without complex ordering
- Using in-memory sorting when needed
- Providing demo data when Firebase is unavailable

### 2. Permission Errors
```
Error: Missing or insufficient permissions
```

**Solutions**:
1. **For Demo Mode**: The app automatically switches to demo mode
2. **For Production**: Update your Firestore security rules:

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to memes for all authenticated users (for gallery)
    // Allow write access only to the user's own memes
    match /memes/{memeId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                   request.auth.uid == request.resource.data.user_id;
      allow update, delete: if request.auth != null && 
                           request.auth.uid == resource.data.user_id;
    }
    
    // Allow users to read/write their own user documents
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 3. Missing Indexes

If you see index errors in Firebase Console, you can either:

**Option A - Automatic (Recommended)**:
1. Click the index creation link in the error message
2. Firebase Console will auto-create the required index

**Option B - Manual**:
1. Go to Firebase Console → Firestore → Indexes
2. Create composite indexes for:
   - Collection: `memes`, Fields: `user_id` (Ascending), `createdAt` (Descending)
   - Collection: `memes`, Fields: `createdAt` (Descending)

## Demo Mode Features

The app includes robust demo mode functionality:

- ✅ Works without Firebase configuration
- ✅ Local storage for demo memes
- ✅ All features functional in demo
- ✅ Automatic fallback on Firebase errors
- ✅ Clear status indicators

## Environment Setup

For production deployment with Firebase:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

For demo-only deployment, simply don't include these environment variables.

## Testing

To test both modes:

**Demo Mode**:
```bash
# Remove or comment out Firebase env vars
npm run dev
```

**Firebase Mode**:
```bash
# Add Firebase env vars
npm run dev
```

The app automatically detects the configuration and adjusts accordingly.