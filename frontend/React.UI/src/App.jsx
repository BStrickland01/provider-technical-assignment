import Dashboard from "./Dashboard";
import ProviderManager from "./ProviderManager";

function App() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <ProviderManager />
      <hr style={{ width: "100%" }} />
      <Dashboard />
    </div>
  );
}

export default App;
