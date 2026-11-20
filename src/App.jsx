import React, { useState, useEffect, useMemo, useCallback, createContext, useContext, useRef } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { DataProvider } from "./context/DataContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppShell } from "./layouts/AppShell";
import { LoginScreen, PasswordRecoveryScreen, InvalidRecoveryLinkScreen } from "./pages/auth/AuthPages";
import { Logo } from "./components/ui";
import { LanguageProvider, LanguageSwitcher } from "./i18n/LanguageContext";


function SplashScreen() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Logo size={68} />
    </div>
  );
}

function Root() {
  const auth = useAuth();
  if (auth.loading) return <SplashScreen />;
  // A password-recovery landing takes precedence over any session that may have loaded, so the
  // user always chooses a new password before reaching the app.
  // Signed-out screens have no header bar, so the language switch floats top-right there; once
  // signed in it lives in the app header.
  const withSwitcher = (screen) => (
    <>
      <div className="fixed top-3 right-3 z-[60]"><LanguageSwitcher /></div>
      {screen}
    </>
  );
  if (auth.passwordRecovery) return withSwitcher(<PasswordRecoveryScreen />);
  if (auth.recoveryLinkInvalid) return withSwitcher(<InvalidRecoveryLinkScreen />);
  if (!auth.currentUser) return withSwitcher(<LoginScreen />);
  return <AppShell />;
}

function App() {
  return (
    <LanguageProvider>
    <ThemeProvider>
    <ToastProvider>
      <DataProvider>
        <AuthProvider>
          <Root />
        </AuthProvider>
      </DataProvider>
    </ToastProvider>
    </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;
