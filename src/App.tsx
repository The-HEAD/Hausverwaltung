import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { PropertyProvider } from "./context/PropertyContext";
import { Toaster } from "@/components/ui/toaster";

import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import Apartments from "./pages/Apartments";
import ApartmentDetail from "./pages/ApartmentDetail";
import Tenants from "./pages/Tenants";
import TenantDetail from "./pages/TenantDetail";
import Contracts from "./pages/Contracts";
import ContractDetail from "./pages/ContractDetail";
import ContractNew from "./pages/ContractNew";

function App() {
  return (
    <PropertyProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/properties/:id" element={<PropertyDetail />} />
            <Route path="/apartments" element={<Apartments />} />
            <Route path="/apartments/:id" element={<ApartmentDetail />} />
            <Route path="/tenants" element={<Tenants />} />
            <Route path="/tenants/:id" element={<TenantDetail />} />
            <Route path="/contracts" element={<Contracts />} />
            <Route path="/contracts/new" element={<ContractNew />} />
            <Route path="/contracts/:id" element={<ContractDetail />} />
          </Routes>
        </Layout>
        <Toaster />
      </Router>
    </PropertyProvider>
  );
}

export default App;
