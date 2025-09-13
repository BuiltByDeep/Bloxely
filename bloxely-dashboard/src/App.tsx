import "./App.css";
import { ThemeProvider } from "./context/ThemeContext";
import { WallpaperProvider } from "./context/WallpaperContext";
import { NotificationProvider } from "./context/NotificationContext";
import { DashboardProvider } from "./context/DashboardContext";
import Dashboard from "./components/Dashboard";
import NotificationContainer from "./components/NotificationContainer";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <WallpaperProvider>
          <NotificationProvider>
            <DashboardProvider>
              <div className="min-h-screen text-slate-900 dark:text-white transition-colors duration-300" style={{ background: 'transparent' }}>
                <Dashboard />
                <NotificationContainer />
              </div>
            </DashboardProvider>
          </NotificationProvider>
        </WallpaperProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
