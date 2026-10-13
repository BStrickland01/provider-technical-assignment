import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5264/api/providers")
      .then((res) => res.json())
      .then((data) => {
        setProviders(data);
        setLoading(false);
      })
      .catch((err) => console.error("Error fetching providers:", err));
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  const hasLicenseStatus = (provider, statusOptions) => {
    if (!provider.licenses || provider.licenses.length === 0) return false;
    return provider.licenses.some((l) =>
      statusOptions.includes(l.licenseStatus),
    );
  };

  const hasNoLicenses = (provider) => {
    return !provider.licenses || provider.licenses.length === 0;
  };

  // Original Categories
  const activeWithActive = providers.filter(
    (p) => p.status === "Active" && hasLicenseStatus(p, ["Active"]),
  ).length;

  const activeWithExpired = providers.filter(
    (p) => p.status === "Active" && hasLicenseStatus(p, ["Expired"]),
  ).length;

  const activeWithInactive = providers.filter(
    (p) =>
      p.status === "Active" && hasLicenseStatus(p, ["Inactive", "Suspended"]),
  ).length;

  const inactiveWithExpired = providers.filter(
    (p) => p.status === "Inactive" && hasLicenseStatus(p, ["Expired"]),
  ).length;

  const inactiveWithInactive = providers.filter(
    (p) =>
      p.status === "Inactive" && hasLicenseStatus(p, ["Inactive", "Suspended"]),
  ).length;

  // New Categories for completeness
  const activeWithNoLicense = providers.filter(
    (p) => p.status === "Active" && hasNoLicenses(p),
  ).length;

  const inactiveWithNoLicense = providers.filter(
    (p) => p.status === "Inactive" && hasNoLicenses(p),
  ).length;

  const pendingProviders = providers.filter(
    (p) => p.status === "Pending",
  ).length;

  const chartData = [
    {
      name: "Active Prov / Active Lic",
      value: activeWithActive,
      color: "#4ade80",
    },
    {
      name: "Active Prov / Expired Lic",
      value: activeWithExpired,
      color: "#facc15",
    },
    {
      name: "Active Prov / Inactive Lic",
      value: activeWithInactive,
      color: "#fb923c",
    },
    {
      name: "Active Prov / No Lic",
      value: activeWithNoLicense,
      color: "#2dd4bf",
    }, // Teal
    {
      name: "Inactive Prov / Expired Lic",
      value: inactiveWithExpired,
      color: "#f87171",
    },
    {
      name: "Inactive Prov / Inactive Lic",
      value: inactiveWithInactive,
      color: "#b91c1c",
    },
    {
      name: "Inactive Prov / No Lic",
      value: inactiveWithNoLicense,
      color: "#f472b6",
    }, // Pink
    { name: "Pending Providers", value: pendingProviders, color: "#a78bfa" }, // Purple
  ];

  const totalProviders = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>Provider Dashboard</h1>

      <div
        style={{ height: 350, width: "100%", maxWidth: 650, marginTop: "2rem" }}
      >
        <h3>Providers by License Status</h3>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              outerRadius={110}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend layout="vertical" verticalAlign="middle" align="right" />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: "2rem", maxWidth: "650px" }}>
        <table
          style={{
            width: "100%",
            textAlign: "left",
            borderCollapse: "collapse",
            border: "1px solid #ddd",
          }}
        >
          <thead style={{ backgroundColor: "#f9fafb" }}>
            <tr style={{ borderBottom: "2px solid #ccc" }}>
              <th style={{ padding: "0.75rem" }}>Color</th>
              <th style={{ padding: "0.75rem" }}>Category</th>
              <th style={{ padding: "0.75rem" }}>Count</th>
              <th style={{ padding: "0.75rem" }}>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((row, index) => {
              const percentage =
                totalProviders > 0
                  ? ((row.value / totalProviders) * 100).toFixed(0)
                  : 0;

              return (
                <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "0.75rem" }}>
                    <div
                      style={{
                        width: "20px",
                        height: "20px",
                        backgroundColor: row.color,
                        borderRadius: "4px",
                      }}
                    />
                  </td>
                  <td style={{ padding: "0.75rem", fontWeight: "500" }}>
                    {row.name}
                  </td>
                  <td style={{ padding: "0.75rem" }}>{row.value}</td>
                  <td style={{ padding: "0.75rem" }}>{percentage}%</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr
              style={{
                borderTop: "2px solid #ccc",
                fontWeight: "bold",
                backgroundColor: "#f9fafb",
              }}
            >
              <td
                colSpan="2"
                style={{ padding: "0.75rem", textAlign: "right" }}
              >
                Total:
              </td>
              <td style={{ padding: "0.75rem" }}>{totalProviders}</td>
              <td style={{ padding: "0.75rem" }}>
                {totalProviders > 0 ? "100%" : "0%"}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
