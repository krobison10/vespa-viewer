import { OAuth2Client } from "google-auth-library";
import crypto from "crypto";

import config from "../config/index.js";

import { NotFoundError, APIError } from "../utils/APIError.js";

import * as userModel from "../user/user-model.js";
import * as authModel from "./auth-model.js";

const oauth2Client = new OAuth2Client(
  config.googleClientId,
  config.googleClientSecret,
  `${config.apiBaseUrl}/auth/google`
);

/**
 * Start Google login process
 *
 * @returns {Promise<{ state: string, redirect: string }>} - The state and redirect URL
 */
export function startGoogleLogin() {
  // Generate and save state to prevent CSRF
  const state = Math.random().toString(36).substring(7);

  // Generate auth URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/userinfo.email", "openid"],
    state: state,
    redirect_uri: `${config.apiBaseUrl}/auth/google`,
  });

  return { state, redirect: authUrl };
}

/**
 * Login with Google
 *
 * @param {string} code - The code from the Google OAuth callback
 *
 * @returns {Promise<{ email: string, uid: string }>} - The user's email and uid
 */
export async function loginGoogle(code) {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Get user info
  const userInfoResponse = await oauth2Client.request({
    url: "https://www.googleapis.com/oauth2/v3/userinfo",
  });

  const userData = userInfoResponse.data;

  let user = await userModel.getByEmail(userData.email);

  if (!user) {
    user = await userModel.create(userData.email);
  }

  return {
    email: user.email,
    uid: user.uid,
    completed_onboarding: user.completed_onboarding,
  };
}

export async function signup(email, password) {
  const existingUser = await userModel.getByEmail(email);

  if (existingUser) {
    throw new APIError("User already exists", 409);
  }

  // Create user
  const user = await userModel.create(email);

  // Store credentials
  const salt = crypto.randomBytes(32).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");

  await authModel.createCredentials(user.uid, hash, salt);

  return { email: user.email, uid: user.uid };
}

/**
 * Login
 *
 * @param {string} email - The user's email
 * @param {string} password - The user's password
 */
export async function login(email, password) {
  const user = await userModel.getByEmail(email);

  if (!user) {
    throw new NotFoundError("Email or password is incorrect");
  }

  const credentials = await authModel.getCredentials(user.uid);

  const hash = crypto
    .pbkdf2Sync(password, credentials.salt, 1000, 64, "sha512")
    .toString("hex");

  if (hash !== credentials.hash) {
    throw new NotFoundError("Email or password is incorrect");
  }

  return {
    email: user.email,
    uid: user.uid,
    completed_onboarding: user.completed_onboarding,
  };
}

/**
 * Get user info
 *
 * @param {number} uid - The user's uid
 *
 * @returns {Promise<Object>} - The user object
 */
export async function me(uid) {
  const user = await userModel.get(uid);

  await userModel.updateLastSeen(user.uid);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  return user;
}

export function isPasswordStrong(password) {
  const isLongEnough = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);

  return (
    isLongEnough && hasUppercase && hasLowercase && hasNumber && hasSpecialChar
  );
}
