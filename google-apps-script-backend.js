// ========================================
// FITMOOD GOOGLE APPS SCRIPT BACKEND
// Enhanced with Password Authentication
// ========================================

// Configuration
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID'; // Replace with your actual sheet ID
const USER_SHEET_NAME = 'Users';
const MOOD_SHEET_NAME = 'Moods';

// Password reset token expiry (24 hours)
const RESET_TOKEN_EXPIRY_HOURS = 24;

/**
 * Main entry point for all API calls
 */
function doPost(e) {
  try {
    // Enable CORS
    const response = {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    };
    
    // Parse request
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action;
    
    // Route to appropriate handler
    let result;
    switch (action) {
      case 'register':
        result = handleRegister(requestData);
        break;
      case 'login':
        result = handleLogin(requestData);
        break;
      case 'requestPasswordReset':
        result = handlePasswordResetRequest(requestData);
        break;
      case 'resetPassword':
        result = handlePasswordReset(requestData);
        break;
      case 'getUserMoods':
        result = handleGetUserMoods(requestData);
        break;
      case 'addMood':
        result = handleAddMood(requestData);
        break;
      case 'getUserStats':
        result = handleGetUserStats(requestData);
        break;
      case 'getAllUsers':
        result = handleGetAllUsers(requestData);
        break;
      case 'updateUserRole':
        result = handleUpdateUserRole(requestData);
        break;
      case 'getUserDetails':
        result = handleGetUserDetails(requestData);
        break;
      case 'adminResetPassword':
        result = handleAdminResetPassword(requestData);
        break;
      case 'sendUserMessage':
        result = handleSendUserMessage(requestData);
        break;
      case 'deleteUser':
        result = handleDeleteUser(requestData);
        break;
      default:
        result = { success: false, error: 'Unknown action: ' + action };
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('API Error:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: 'Internal server error: ' + error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle OPTIONS requests for CORS
 */
function doOptions() {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
}

// ========================================
// USER MANAGEMENT FUNCTIONS
// ========================================

/**
 * Enhanced user registration with password support
 */
function handleRegister(data) {
  try {
    const { name, email, phone, passwordHash, salt } = data;
    
    // Validate required fields
    if (!name || !email || !phone || !passwordHash || !salt) {
      return { success: false, error: 'Missing required fields' };
    }
    
    // Validate email format
    if (!isValidEmail(email)) {
      return { success: false, error: 'Invalid email format' };
    }
    
    // Validate phone format
    if (!isValidPhone(phone)) {
      return { success: false, error: 'Invalid phone format' };
    }
    
    const sheet = getSheet(USER_SHEET_NAME);
    const data_range = sheet.getDataRange();
    const values = data_range.getValues();
    
    // Check if user already exists
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (row[2] === email || row[3] === phone) {
        return { success: false, error: 'User already exists with this email or phone' };
      }
    }
    
    // Generate unique user ID
    const userId = generateUserId();
    const now = new Date().toISOString();
    
    // Add user to sheet
    // Columns: [ID, Name, Email, Phone, Role, Created, LastActive, PasswordHash, Salt, ResetToken, ResetExpiry, MigrationStatus]
    sheet.appendRow([
      userId,
      name,
      email,
      phone,
      'user',
      now,
      now,
      passwordHash,
      salt,
      '', // ResetToken
      '', // ResetExpiry
      'completed' // MigrationStatus (new users don't need migration)
    ]);
    
    return {
      success: true,
      userId: userId,
      name: name,
      email: email,
      phone: phone,
      role: 'user'
    };
    
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Registration failed: ' + error.message };
  }
}

/**
 * Enhanced login with password validation
 */
function handleLogin(data) {
  try {
    const { identifier, identifierType, password } = data;
    
    if (!identifier || !password) {
      return { success: false, error: 'Missing credentials' };
    }
    
    const sheet = getSheet(USER_SHEET_NAME);
    const data_range = sheet.getDataRange();
    const values = data_range.getValues();
    
    // Find user by email or phone
    let userRow = null;
    let rowIndex = -1;
    
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const email = row[2];
      const phone = row[3];
      
      if ((identifierType === 'email' && email === identifier) ||
          (identifierType === 'phone' && phone === identifier)) {
        userRow = row;
        rowIndex = i + 1; // Sheet rows are 1-indexed
        break;
      }
    }
    
    if (!userRow) {
      return { success: false, error: 'Invalid login credentials' };
    }
    
    // Verify password
    const storedHash = userRow[7]; // PasswordHash column
    const salt = userRow[8]; // Salt column
    
    if (!storedHash || !salt) {
      // User exists but has no password (legacy user)
      return { 
        success: false, 
        error: 'Please set up your password first',
        needsPasswordSetup: true,
        userId: userRow[0]
      };
    }
    
    // For server-side verification, we expect the client to send the hashed password
    // The client should hash the password with salt before sending
    const expectedHash = hashPasswordServerSide(password, salt);
    
    if (expectedHash !== storedHash) {
      return { success: false, error: 'Invalid login credentials' };
    }
    
    // Update last login time
    const now = new Date().toISOString();
    sheet.getRange(rowIndex, 6).setValue(now); // LastActive column
    
    return {
      success: true,
      userId: userRow[0],
      name: userRow[1],
      email: userRow[2],
      phone: userRow[3],
      role: userRow[4],
      migrationStatus: userRow[11] || 'completed'
    };
    
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Login failed' };
  }
}

/**
 * Handle password reset request
 */
function handlePasswordResetRequest(data) {
  try {
    const { identifier, identifierType } = data;
    
    if (!identifier) {
      return { success: false, error: 'Missing identifier' };
    }
    
    const sheet = getSheet(USER_SHEET_NAME);
    const data_range = sheet.getDataRange();
    const values = data_range.getValues();
    
    // Find user
    let userRow = null;
    let rowIndex = -1;
    
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const email = row[2];
      const phone = row[3];
      
      if ((identifierType === 'email' && email === identifier) ||
          (identifierType === 'phone' && phone === identifier)) {
        userRow = row;
        rowIndex = i + 1;
        break;
      }
    }
    
    if (!userRow) {
      // Don't reveal if user exists or not
      return { success: true, message: 'If the account exists, a reset link will be sent' };
    }
    
    // Generate reset token
    const resetToken = generateResetToken();
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + RESET_TOKEN_EXPIRY_HOURS);
    
    // Store reset token and expiry
    sheet.getRange(rowIndex, 10).setValue(resetToken); // ResetToken column
    sheet.getRange(rowIndex, 11).setValue(expiryTime.toISOString()); // ResetExpiry column
    
    // In a real implementation, you would send an email/SMS here
    // For now, we'll return the token (remove this in production)
    return {
      success: true,
      message: 'Reset instructions sent',
      resetToken: resetToken // Remove this in production
    };
    
  } catch (error) {
    console.error('Password reset request error:', error);
    return { success: false, error: 'Reset request failed' };
  }
}

/**
 * Handle password reset with token
 */
function handlePasswordReset(data) {
  try {
    const { token, passwordHash, salt } = data;
    
    if (!token || !passwordHash || !salt) {
      return { success: false, error: 'Missing required fields' };
    }
    
    const sheet = getSheet(USER_SHEET_NAME);
    const data_range = sheet.getDataRange();
    const values = data_range.getValues();
    
    // Find user with matching reset token
    let userRow = null;
    let rowIndex = -1;
    
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const storedToken = row[9]; // ResetToken column
      
      if (storedToken === token) {
        userRow = row;
        rowIndex = i + 1;
        break;
      }
    }
    
    if (!userRow) {
      return { success: false, error: 'Invalid or expired reset token' };
    }
    
    // Check token expiry
    const expiryTime = new Date(userRow[10]); // ResetExpiry column
    const now = new Date();
    
    if (now > expiryTime) {
      return { success: false, error: 'Reset token has expired' };
    }
    
    // Update password
    sheet.getRange(rowIndex, 8).setValue(passwordHash); // PasswordHash column
    sheet.getRange(rowIndex, 9).setValue(salt); // Salt column
    
    // Clear reset token
    sheet.getRange(rowIndex, 10).setValue(''); // ResetToken column
    sheet.getRange(rowIndex, 11).setValue(''); // ResetExpiry column
    
    return {
      success: true,
      message: 'Password reset successfully'
    };
    
  } catch (error) {
    console.error('Password reset error:', error);
    return { success: false, error: 'Password reset failed' };
  }
}

// ========================================
// MOOD MANAGEMENT FUNCTIONS (Updated)
// ========================================

/**
 * Get user moods
 */
function handleGetUserMoods(data) {
  try {
    const { userId } = data;
    
    if (!userId) {
      return { success: false, error: 'Missing user ID' };
    }
    
    const sheet = getSheet(MOOD_SHEET_NAME);
    const data_range = sheet.getDataRange();
    const values = data_range.getValues();
    
    const moods = [];
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (row[1] === userId) { // UserId column
        moods.push({
          id: row[0],
          userId: row[1],
          moodLevel: row[2],
          notes: row[3],
          timestamp: row[4],
          activities: row[5] ? JSON.parse(row[5]) : [],
          customEmoji: row[6] || null
        });
      }
    }
    
    // Sort by timestamp (newest first)
    moods.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return { success: true, moods: moods };
    
  } catch (error) {
    console.error('Get moods error:', error);
    return { success: false, error: 'Failed to retrieve moods' };
  }
}

/**
 * Add new mood entry
 */
function handleAddMood(data) {
  try {
    const { userId, moodLevel, notes, activities, customEmoji } = data;
    
    if (!userId || moodLevel === undefined) {
      return { success: false, error: 'Missing required fields' };
    }
    
    const sheet = getSheet(MOOD_SHEET_NAME);
    const moodId = generateMoodId();
    const timestamp = new Date().toISOString();
    
    // Add mood entry
    // Columns: [ID, UserId, MoodLevel, Notes, Timestamp, Activities, CustomEmoji]
    sheet.appendRow([
      moodId,
      userId,
      moodLevel,
      notes || '',
      timestamp,
      activities ? JSON.stringify(activities) : '[]',
      customEmoji || ''
    ]);
    
    return {
      success: true,
      moodId: moodId,
      timestamp: timestamp
    };
    
  } catch (error) {
    console.error('Add mood error:', error);
    return { success: false, error: 'Failed to add mood entry' };
  }
}

/**
 * Get user statistics
 */
function handleGetUserStats(data) {
  try {
    const { userId } = data;
    
    if (!userId) {
      return { success: false, error: 'Missing user ID' };
    }
    
    const sheet = getSheet(MOOD_SHEET_NAME);
    const data_range = sheet.getDataRange();
    const values = data_range.getValues();
    
    const userMoods = [];
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (row[1] === userId) {
        userMoods.push({
          moodLevel: row[2],
          timestamp: row[4]
        });
      }
    }
    
    if (userMoods.length === 0) {
      return {
        success: true,
        stats: {
          totalEntries: 0,
          avgMood: 0,
          streak: 0
        }
      };
    }
    
    // Calculate statistics
    const totalEntries = userMoods.length;
    const avgMood = userMoods.reduce((sum, mood) => sum + mood.moodLevel, 0) / totalEntries;
    
    // Calculate streak (simplified)
    const sortedMoods = userMoods.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    let streak = 0;
    const today = new Date().toDateString();
    
    for (let mood of sortedMoods) {
      const moodDate = new Date(mood.timestamp).toDateString();
      if (moodDate === today || streak === 0) {
        streak++;
      } else {
        break;
      }
    }
    
    return {
      success: true,
      stats: {
        totalEntries: totalEntries,
        avgMood: Math.round(avgMood * 10) / 10,
        streak: streak
      }
    };
    
  } catch (error) {
    console.error('Get stats error:', error);
    return { success: false, error: 'Failed to retrieve statistics' };
  }
}

// ========================================
// ADMIN FUNCTIONS (Updated)
// ========================================

/**
 * Get all users (admin only)
 */
function handleGetAllUsers(data) {
  try {
    const { requestingUserId } = data;
    
    // Verify admin permissions
    if (!isAdmin(requestingUserId)) {
      return { success: false, error: 'Insufficient permissions' };
    }
    
    const sheet = getSheet(USER_SHEET_NAME);
    const data_range = sheet.getDataRange();
    const values = data_range.getValues();
    
    const users = [];
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      users.push({
        userId: row[0],
        name: row[1],
        email: row[2],
        phone: row[3],
        role: row[4],
        createdAt: row[5],
        lastActive: row[6],
        hasPassword: !!(row[7] && row[8]), // Has both hash and salt
        migrationStatus: row[11] || 'pending'
      });
    }
    
    return { success: true, users: users };
    
  } catch (error) {
    console.error('Get all users error:', error);
    return { success: false, error: 'Failed to retrieve users' };
  }
}

/**
 * Get detailed user information (admin only)
 */
function handleGetUserDetails(data) {
  try {
    const { requesterId, userId } = data;
    
    // Verify admin permissions
    if (!isAdmin(requesterId)) {
      return { success: false, error: 'Insufficient permissions' };
    }
    
    // Get user info
    const userData = getUserById(userId);
    
    if (!userData) {
      return { success: false, error: 'User not found' };
    }
    
    // Get user's mood data
    const moodSheet = getSheet(MOOD_SHEET_NAME);
    const moodData = moodSheet.getDataRange().getValues();
    const userMoods = [];
    
    for (let i = 1; i < moodData.length; i++) {
      const row = moodData[i];
      if (row[1] === userId) { // UserID column
        userMoods.push({
          id: row[0],
          userId: row[1],
          mood: row[2], // MoodLevel
          moodLevel: row[2], // MoodLevel (for compatibility)
          notes: row[3] || 'No notes provided',
          timestamp: row[4],
          activities: row[5] ? (typeof row[5] === 'string' ? row[5] : JSON.stringify(row[5])) : '',
          triggers: '', // Not stored in current schema
          moodEmoji: row[6] || getMoodEmoji(row[2])
        });
      }
    }
    
    // Sort moods by timestamp (newest first)
    userMoods.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Calculate stats
    const stats = calculateUserStats(userMoods, userData);
    
    // Calculate analytics
    const analytics = calculateUserAnalytics(userMoods);
    
    // Generate activity log
    const activityLog = generateActivityLog(userData, userMoods);
    
    return {
      success: true,
      user: {
        userId: userData.userId,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: userData.role,
        createdAt: userData.createdAt,
        lastActive: userData.lastActive
      },
      moods: userMoods,
      stats: stats,
      analytics: analytics,
      activityLog: activityLog
    };
    
  } catch (error) {
    console.error('Get user details error:', error);
    return { success: false, error: 'Failed to get user details: ' + error.message };
  }
}

/**
 * Admin reset user password
 */
function handleAdminResetPassword(data) {
  try {
    const { requestingUserId, targetUserId } = data;
    
    // Verify admin permissions
    if (!isAdmin(requestingUserId)) {
      return { success: false, error: 'Insufficient permissions' };
    }
    
    const sheet = getSheet(USER_SHEET_NAME);
    const data_range = sheet.getDataRange();
    const values = data_range.getValues();
    
    // Find user
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (row[0] === targetUserId) {
        // Clear password hash and salt
        sheet.getRange(i + 1, 8).setValue(''); // PasswordHash column
        sheet.getRange(i + 1, 9).setValue(''); // Salt column
        
        return { success: true, message: 'Password reset successfully' };
      }
    }
    
    return { success: false, error: 'User not found' };
    
  } catch (error) {
    console.error('Admin reset password error:', error);
    return { success: false, error: 'Failed to reset password' };
  }
}

/**
 * Send message to user (placeholder - would integrate with email service)
 */
function handleSendUserMessage(data) {
  try {
    const { requestingUserId, targetUserId, message } = data;
    
    // Verify admin permissions
    if (!isAdmin(requestingUserId)) {
      return { success: false, error: 'Insufficient permissions' };
    }
    
    // Get user details
    const targetUser = getUserById(targetUserId);
    if (!targetUser) {
      return { success: false, error: 'User not found' };
    }
    
    // In a real implementation, you would send an email here
    // For now, we'll just log it and return success
    console.log(`Admin message to ${targetUser.email}: ${message}`);
    
    // You could integrate with Gmail API or other email service here
    // Example: GmailApp.sendEmail(targetUser.email, 'Message from FitMood Admin', message);
    
    return { 
      success: true, 
      message: 'Message sent successfully',
      note: 'Email integration not configured - message logged to console'
    };
    
  } catch (error) {
    console.error('Send user message error:', error);
    return { success: false, error: 'Failed to send message' };
  }
}

/**
 * Calculate comprehensive user statistics
 */
function calculateUserStats(moods, userData) {
  if (!moods || moods.length === 0) {
    return {
      totalEntries: 0,
      totalMoods: 0,
      avgMood: 0,
      streakDays: 0,
      lastActive: userData.lastActive
    };
  }
  
  // Calculate average mood (assuming mood is numeric 1-5)
  const numericMoods = moods.filter(m => !isNaN(parseFloat(m.moodLevel || m.mood))).map(m => parseFloat(m.moodLevel || m.mood));
  const avgMood = numericMoods.length > 0 ? numericMoods.reduce((a, b) => a + b, 0) / numericMoods.length : 0;
  
  // Calculate streak (consecutive days with entries)
  const dates = [...new Set(moods.map(m => {
    const date = new Date(m.timestamp);
    return date.toISOString().split('T')[0];
  }))].sort().reverse();
  
  let streakDays = 0;
  const today = new Date().toISOString().split('T')[0];
  
  for (let i = 0; i < dates.length; i++) {
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() - i);
    const expectedDateStr = expectedDate.toISOString().split('T')[0];
    
    if (dates[i] === expectedDateStr) {
      streakDays++;
    } else {
      break;
    }
  }
  
  return {
    totalEntries: moods.length,
    totalMoods: moods.length,
    avgMood: Math.round(avgMood * 10) / 10,
    streakDays: streakDays,
    lastActive: userData.lastActive
  };
}

/**
 * Calculate user analytics
 */
function calculateUserAnalytics(moods) {
  if (!moods || moods.length === 0) {
    return {
      moodDistribution: {},
      topActivities: []
    };
  }
  
  // Mood distribution
  const moodDistribution = {};
  moods.forEach(mood => {
    const moodValue = mood.moodLevel || mood.mood || 'unknown';
    moodDistribution[moodValue] = (moodDistribution[moodValue] || 0) + 1;
  });
  
  // Top activities
  const activityCount = {};
  moods.forEach(mood => {
    if (mood.activities) {
      let activities = [];
      
      try {
        // Handle different activity formats
        if (typeof mood.activities === 'string') {
          if (mood.activities.startsWith('[') || mood.activities.startsWith('{')) {
            activities = JSON.parse(mood.activities);
          } else {
            activities = mood.activities.split(',').map(a => a.trim());
          }
        } else if (Array.isArray(mood.activities)) {
          activities = mood.activities;
        }
      } catch (e) {
        // If JSON parsing fails, treat as comma-separated string
        activities = String(mood.activities).split(',').map(a => a.trim());
      }
      
      if (Array.isArray(activities)) {
        activities.forEach(activity => {
          if (activity && activity.trim()) {
            const activityName = activity.trim();
            activityCount[activityName] = (activityCount[activityName] || 0) + 1;
          }
        });
      }
    }
  });
  
  const topActivities = Object.entries(activityCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  
  return {
    moodDistribution,
    topActivities
  };
}

/**
 * Generate activity log for user
 */
function generateActivityLog(userData, moods) {
  const activities = [];
  
  // User registration
  activities.push({
    icon: '👤',
    action: 'User registered',
    timestamp: userData.createdAt
  });
  
  // Recent mood entries (last 10)
  const recentMoods = moods.slice(0, 10);
  recentMoods.forEach(mood => {
    const moodValue = mood.moodLevel || mood.mood || 'Unknown';
    activities.push({
      icon: mood.moodEmoji || getMoodEmoji(moodValue),
      action: `Logged mood: ${moodValue}`,
      timestamp: mood.timestamp
    });
  });
  
  // Sort by timestamp (newest first)
  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  return activities.slice(0, 20); // Return last 20 activities
}

/**
 * Get mood emoji based on mood value
 */
function getMoodEmoji(mood) {
  const moodEmojis = {
    '1': '😢',
    '2': '😔',
    '3': '😐',
    '4': '😊',
    '5': '😄',
    'sad': '😢',
    'down': '😔',
    'neutral': '😐',
    'good': '😊',
    'happy': '😄',
    'excited': '🤩',
    'angry': '😠',
    'anxious': '😰',
    'calm': '😌',
    'energetic': '⚡'
  };
  
  return moodEmojis[String(mood).toLowerCase()] || '😐';
}
function handleUpdateUserRole(data) {
  try {
    const { requestingUserId, targetUserId, newRole } = data;
    
    // Verify admin permissions
    if (!isAdmin(requestingUserId)) {
      return { success: false, error: 'Insufficient permissions' };
    }
    
    if (!['user', 'admin'].includes(newRole)) {
      return { success: false, error: 'Invalid role' };
    }
    
    const sheet = getSheet(USER_SHEET_NAME);
    const data_range = sheet.getDataRange();
    const values = data_range.getValues();
    
    // Find target user
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (row[0] === targetUserId) {
        sheet.getRange(i + 1, 5).setValue(newRole); // Role column
        return { success: true, message: 'User role updated' };
      }
    }
    
    return { success: false, error: 'User not found' };
    
  } catch (error) {
    console.error('Update user role error:', error);
    return { success: false, error: 'Failed to update user role' };
  }
}

/**
 * Delete user (admin only)
 */
function handleDeleteUser(data) {
  try {
    const { requestingUserId, targetUserId } = data;
    
    // Verify admin permissions
    if (!isAdmin(requestingUserId)) {
      return { success: false, error: 'Insufficient permissions' };
    }
    
    // Don't allow deleting self
    if (requestingUserId === targetUserId) {
      return { success: false, error: 'Cannot delete your own account' };
    }
    
    const userSheet = getSheet(USER_SHEET_NAME);
    const moodSheet = getSheet(MOOD_SHEET_NAME);
    
    // Delete user
    const userData = userSheet.getDataRange();
    const userValues = userData.getValues();
    
    for (let i = 1; i < userValues.length; i++) {
      const row = userValues[i];
      if (row[0] === targetUserId) {
        userSheet.deleteRow(i + 1);
        break;
      }
    }
    
    // Delete user's moods
    const moodData = moodSheet.getDataRange();
    const moodValues = moodData.getValues();
    
    for (let i = moodValues.length - 1; i >= 1; i--) {
      const row = moodValues[i];
      if (row[1] === targetUserId) {
        moodSheet.deleteRow(i + 1);
      }
    }
    
    return { success: true, message: 'User deleted successfully' };
    
  } catch (error) {
    console.error('Delete user error:', error);
    return { success: false, error: 'Failed to delete user' };
  }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Get or create sheet
 */
function getSheet(sheetName) {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  let sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    
    // Set up headers based on sheet type
    if (sheetName === USER_SHEET_NAME) {
      sheet.getRange(1, 1, 1, 12).setValues([[
        'ID', 'Name', 'Email', 'Phone', 'Role', 'Created', 'LastActive', 
        'PasswordHash', 'Salt', 'ResetToken', 'ResetExpiry', 'MigrationStatus'
      ]]);
    } else if (sheetName === MOOD_SHEET_NAME) {
      sheet.getRange(1, 1, 1, 7).setValues([[
        'ID', 'UserId', 'MoodLevel', 'Notes', 'Timestamp', 'Activities', 'CustomEmoji'
      ]]);
    }
  }
  
  return sheet;
}

/**
 * Generate unique user ID
 */
function generateUserId() {
  return 'user_' + Utilities.getUuid().replace(/-/g, '');
}

/**
 * Generate unique mood ID
 */
function generateMoodId() {
  return 'mood_' + Utilities.getUuid().replace(/-/g, '');
}

/**
 * Generate secure reset token
 */
function generateResetToken() {
  return Utilities.getUuid().replace(/-/g, '') + Date.now().toString(36);
}

/**
 * Server-side password hashing (simplified)
 * Note: In production, use proper password hashing libraries
 */
function hashPasswordServerSide(password, salt) {
  // This is a simplified hash - in production use proper PBKDF2 or bcrypt
  const combined = password + salt;
  return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, combined));
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone format
 */
function isValidPhone(phone) {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)\.]/g, ''));
}

/**
 * Check if user is admin
 */
function isAdmin(userId) {
  try {
    const sheet = getSheet(USER_SHEET_NAME);
    const data_range = sheet.getDataRange();
    const values = data_range.getValues();
    
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (row[0] === userId && row[4] === 'admin') {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Admin check error:', error);
    return false;
  }
}

/**
 * Get user by ID
 */
function getUserById(userId) {
  try {
    const sheet = getSheet(USER_SHEET_NAME);
    const data_range = sheet.getDataRange();
    const values = data_range.getValues();
    
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (row[0] === userId) {
        return {
          userId: row[0],
          name: row[1],
          email: row[2],
          phone: row[3],
          role: row[4],
          createdAt: row[5],
          lastActive: row[6],
          hasPassword: !!(row[7] && row[8]),
          migrationStatus: row[11] || 'pending'
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Get user by ID error:', error);
    return null;
  }
}

/**
 * Initialize sheets with proper structure
 */
function initializeSheets() {
  getSheet(USER_SHEET_NAME);
  getSheet(MOOD_SHEET_NAME);
  console.log('Sheets initialized successfully');
}