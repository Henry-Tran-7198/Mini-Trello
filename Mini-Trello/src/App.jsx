import AppRoutes from "./routes/AppRoutes";
import { CustomThemeProvider } from "./contexts/ThemeContext";

function App() {
  return (
    <CustomThemeProvider>
      <AppRoutes />
    </CustomThemeProvider>
  );
}

export default App;
