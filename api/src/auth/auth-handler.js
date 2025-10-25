import config from "../config/index.js";

import { respond } from "../utils/respond.js";

import Validate from "../utils/validate.js";

import * as authService from "./auth-service.js";

import * as userModel from "../user/user-model.js";

export async function login(req, res, next) {
  try {
    const email = Validate.requireEmail(req.body.email, "email");

    res.cookie("loginEmail", email, {
      maxAge: 1000 * 60 * 60, // 1 hour
      httpOnly: false,
      secure: false,
    });

    // Get or create user
    let existingUser = await userModel.getByEmail(email);

    if (!existingUser) {
      // Automatically create user if they don't exist
      existingUser = await userModel.create(email);
    }

    // User found or created, complete login
    req.session.email = existingUser.email;
    req.session.uid = existingUser.uid;
    req.session.isLoggedIn = true;

    return respond.ok(res);

    // const credentials = await authModel.getCredentials(existingUser.uid);
    // if (!credentials) {
    //   const { state, redirect } = authService.startGoogleLogin();
    //   req.session.oauthState = state;
    //   return respond.data(res, { redirect: redirect });
    // }

    // Initial request
    // if (!req.body.password) {
    //   return respond.ok(res);
    // }

    // // Second request
    // let user;

    // try {
    //   user = await authService.login(email, req.body.password);
    // } catch (error) {
    //   console.error("Login error:", error);
    //   return respond.data(
    //     res,
    //     {
    //       status: "fail",
    //       message: "Invalid email or password",
    //       code: "invalid_credentials",
    //     },
    //     403
    //   );
    // }

    // req.session.email = user.email;
    // req.session.uid = user.uid;
    // req.session.isLoggedIn = true;

    // return respond.ok(res);
  } catch (error) {
    next(error);
  }
}

export async function loginGoogle(req, res) {
  try {
    // If there's no code, this is the initial request
    if (!req.query.code) {
      const { state, redirect } = authService.startGoogleLogin();

      req.session.oauthState = state;

      // Redirect to Google
      return res.redirect(redirect);
    }

    const { state } = req.query;
    const { oauthState } = req.session;

    // If there is a code, this is the callback
    // Verify state to prevent CSRF
    if (state !== oauthState) {
      return res.redirect(`${config.webBaseUrl}/login?error=invalid_state`);
    }

    delete req.session.oauthState;

    // Exchange code for tokens
    const { code } = req.query;

    const { email, uid } = await authService.loginGoogle(code);

    res.clearCookie("loginEmail");

    // Create session
    req.session.email = email;
    req.session.uid = uid;
    req.session.isLoggedIn = true;

    // Redirect to dashboard
    res.redirect(`${config.webBaseUrl}/`);
  } catch (error) {
    console.error("Login Google error:", error);
    res.redirect(`${config.webBaseUrl}/login?error=auth_failed`);
  }
}

export async function me(req, res, next) {
  try {
    const { uid } = req.session;
    const user = await authService.me(uid);

    return respond.data(res, { user });
  } catch (error) {
    next(error);
  }
}

export function check(req, res, next) {
  try {
    const { isLoggedIn = false } = req.session;
    return respond.data(res, { isLoggedIn });
  } catch (error) {
    next(error);
  }
}

export function logout(req, res, next) {
  try {
    req.session.destroy();
    return respond.message(res, "Logged out");
  } catch (error) {
    next(error);
  }
}
