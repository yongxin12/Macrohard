/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

// Configuration for authentication using Microsoft Authentication Library (MSAL)

export const msalConfig = {
  auth: {
    clientId: "demo-client-id", // Demo client ID
    authority: "https://login.microsoftonline.com/common", // This allows users from any Microsoft work or school account to sign in
    redirectUri: window.location.origin, // Redirect URI after authentication
    postLogoutRedirectUri: window.location.origin, // Redirect URI after logout
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case 0:
            console.error(message);
            return;
          case 1:
            console.warn(message);
            return;
          case 2:
            console.info(message);
            return;
          case 3:
            console.debug(message);
            return;
          default:
            return;
        }
      }
    }
  }
};

// Scopes that you want to request access token for
export const loginRequest = {
  scopes: ["User.Read"]
};

// API endpoints that you want to call
export const apiConfig = {
  baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
  endpoints: {
    documents: '/documents',
    assistant: '/assistant/query',
    reports: '/reports/generate',
    clients: '/clients'
  },
  scopes: ["api://demo-api-client-id/access_as_user"] // Demo API client ID
};

// Helper function to get access token for API calls
export async function getTokenForAPI(instance, accounts, scopes) {
  // For demo purposes, return a fake token
  if (process.env.DEMO_MODE === "true") {
    console.log("Demo mode: Returning fake token");
    return "fake-access-token-for-demo";
  }
  
  // Get active account
  const activeAccount = accounts[0];

  // Silent token acquisition
  const request = {
    scopes: scopes,
    account: activeAccount
  };

  try {
    const response = await instance.acquireTokenSilent(request);
    return response.accessToken;
  } catch (error) {
    // If silent token acquisition fails, try interactive method
    if (error.name === "InteractionRequiredAuthError") {
      try {
        const response = await instance.acquireTokenPopup(request);
        return response.accessToken;
      } catch (popupError) {
        console.error("Error acquiring token interactively:", popupError);
        throw popupError;
      }
    } else {
      console.error("Error acquiring token silently:", error);
      throw error;
    }
  }
} 