import React, { useEffect, useState } from "react";
import {
  getProviders,
  createProvider,
  updateProvider,
  deleteProvider,
} from "./api";

const initialFormState = {
  providerName: "",
  county: "",
  status: "Active",
  licenses: [],
};

export default function ProviderManager() {
  const [providers, setProviders] = useState([]);
  const [filter, setFilter] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [expandedProviderId, setExpandedProviderId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = () => {
    getProviders(filter)
      .then((data) => setProviders(data))
      .catch((err) => console.error("Error loading providers:", err));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // License dynamic array handlers
  const handleAddLicense = () => {
    setFormData((prev) => ({
      ...prev,
      licenses: [
        ...prev.licenses,
        {
          licenseNumber: "",
          licenseStatus: "Active",
          expirationDate: "",
        },
      ],
    }));
  };

  const handleRemoveLicense = (index) => {
    setFormData((prev) => ({
      ...prev,
      licenses: prev.licenses.filter((_, i) => i !== index),
    }));
  };

  const handleLicenseChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedLicenses = [...prev.licenses];
      updatedLicenses[index] = {
        ...updatedLicenses[index],
        [field]: value,
      };
      return { ...prev, licenses: updatedLicenses };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
      await updateProvider(editingId, { ...formData, providerId: editingId });
      setEditingId(null);
    } else {
      // Format payload to ensure proper types for EF Core
      const payload = {
        ...formData,
        licenses: formData.licenses.map((l) => ({
          licenseNumber: l.licenseNumber,
          licenseStatus: l.licenseStatus,
          expirationDate: new Date(l.expirationDate).toISOString(),
        })),
      };
      await createProvider(payload);
    }

    setFormData(initialFormState);
    loadData();
  };

  const handleEdit = (provider) => {
    setEditingId(provider.providerId);
    setFormData({
      providerName: provider.providerName,
      county: provider.county,
      status: provider.status,
      licenses: [], // Kept empty during edit since PutProvider modifies Provider scalar fields
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this provider?")) {
      await deleteProvider(id);
      loadData();
    }
  };

  const toggleRow = (id) => {
    setExpandedProviderId((prev) => (prev === id ? null : id));
  };

  return (
    <div
      style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "850px" }}
    >
      <h2>Manage Providers</h2>

      {/* FORM SECTION */}
      <form
        onSubmit={handleSubmit}
        style={{
          marginBottom: "2rem",
          padding: "1.5rem",
          border: "1px solid #ccc",
          borderRadius: "6px",
          backgroundColor: "#fff",
        }}
      >
        <h3 style={{ marginTop: 0 }}>
          {editingId ? "Edit Provider" : "Add New Provider"}
        </h3>

        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <input
            name="providerName"
            placeholder="Provider Name"
            value={formData.providerName}
            onChange={handleInputChange}
            required
            style={{ flex: 2, padding: "0.5rem" }}
          />
          <input
            name="county"
            placeholder="County"
            value={formData.county}
            onChange={handleInputChange}
            required
            style={{ flex: 1, padding: "0.5rem" }}
          />
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            style={{ flex: 1, padding: "0.5rem" }}
          >
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* DYNAMIC LICENSES SECTION (CREATE ONLY) */}
        {!editingId && (
          <div
            style={{
              margin: "1.5rem 0",
              padding: "1rem",
              border: "1px dashed #bbb",
              borderRadius: "4px",
              backgroundColor: "#fafafa",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.75rem",
              }}
            >
              <strong style={{ fontSize: "0.95rem" }}>
                Associated Licenses
              </strong>
              <button
                type="button"
                onClick={handleAddLicense}
                style={{
                  padding: "0.3rem 0.75rem",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                + Add License
              </button>
            </div>

            {formData.licenses.length === 0 && (
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#666" }}>
                No licenses added yet. Click "+ Add License" to attach one or
                more licenses.
              </p>
            )}

            {formData.licenses.map((lic, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  alignItems: "center",
                  marginTop: "0.5rem",
                }}
              >
                <input
                  placeholder="License Number (e.g. RN-10293)"
                  value={lic.licenseNumber}
                  onChange={(e) =>
                    handleLicenseChange(index, "licenseNumber", e.target.value)
                  }
                  required
                  style={{ flex: 2, padding: "0.4rem" }}
                />
                <select
                  value={lic.licenseStatus}
                  onChange={(e) =>
                    handleLicenseChange(index, "licenseStatus", e.target.value)
                  }
                  style={{ flex: 1, padding: "0.4rem" }}
                >
                  <option value="Active">Active</option>
                  <option value="Expired">Expired</option>
                  <option value="Suspended">Suspended</option>
                </select>
                <input
                  type="date"
                  value={lic.expirationDate}
                  onChange={(e) =>
                    handleLicenseChange(index, "expirationDate", e.target.value)
                  }
                  required
                  style={{ flex: 1.5, padding: "0.4rem" }}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveLicense(index)}
                  style={{
                    backgroundColor: "#fee2e2",
                    color: "#b91c1c",
                    border: "1px solid #f87171",
                    padding: "0.4rem 0.6rem",
                    cursor: "pointer",
                    borderRadius: "3px",
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          style={{
            padding: "0.5rem 1.25rem",
            backgroundColor: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {editingId ? "Update" : "Create"}
        </button>

        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setFormData(initialFormState);
            }}
            style={{
              marginLeft: "0.75rem",
              padding: "0.5rem 1rem",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        )}
      </form>

      {/* REPORT FILTER SECTION */}
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ marginRight: "1rem" }}>
          <strong>View Report:</strong>
        </label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">Standard Listing (Exclude Deleted)</option>
          <option value="active">Active Providers w/ Active Licenses</option>
          <option value="expired">Active Providers w/ Expired Licenses</option>
          <option value="deleted">Audit Trail (Soft Deleted Records)</option>
        </select>
      </div>

      {/* DATA TABLE */}
      <table
        style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}
      >
        <thead>
          <tr style={{ borderBottom: "2px solid #000" }}>
            <th style={{ padding: "0.5rem" }}>ID</th>
            <th style={{ padding: "0.5rem" }}>Name</th>
            <th style={{ padding: "0.5rem" }}>County</th>
            <th style={{ padding: "0.5rem" }}>Status</th>
            <th style={{ padding: "0.5rem" }}>Licenses</th>
            <th style={{ padding: "0.5rem" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {providers.map((p) => (
            <React.Fragment key={p.providerId}>
              <tr
                style={{ borderBottom: "1px solid #ccc", cursor: "pointer" }}
                onClick={() => toggleRow(p.providerId)}
              >
                <td style={{ padding: "0.5rem" }}>{p.providerId}</td>
                <td style={{ padding: "0.5rem" }}>
                  {p.providerName}
                  {p.isDeleted && (
                    <span
                      style={{
                        color: "red",
                        marginLeft: "8px",
                        fontSize: "0.8rem",
                      }}
                    >
                      (Deleted)
                    </span>
                  )}
                </td>
                <td style={{ padding: "0.5rem" }}>{p.county}</td>
                <td style={{ padding: "0.5rem" }}>{p.status}</td>
                <td style={{ padding: "0.5rem" }}>
                  {p.licenses ? p.licenses.length : 0} license(s)
                </td>
                <td style={{ padding: "0.5rem" }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(p);
                    }}
                    disabled={p.isDeleted}
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(p.providerId);
                    }}
                    disabled={p.isDeleted}
                    style={{ marginLeft: "0.5rem" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>

              {/* EXPANDABLE ROW DETAILS */}
              {expandedProviderId === p.providerId && (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      padding: "1rem",
                      backgroundColor: "#f9fafb",
                      borderBottom: "2px solid #ddd",
                    }}
                  >
                    <h4 style={{ margin: "0 0 0.75rem 0" }}>
                      Licenses for {p.providerName}
                    </h4>
                    {p.licenses && p.licenses.length > 0 ? (
                      <table
                        style={{
                          width: "100%",
                          textAlign: "left",
                          borderCollapse: "collapse",
                          fontSize: "0.9rem",
                        }}
                      >
                        <thead>
                          <tr style={{ borderBottom: "1px solid #bbb" }}>
                            <th style={{ padding: "0.4rem" }}>
                              License Number
                            </th>
                            <th style={{ padding: "0.4rem" }}>Status</th>
                            <th style={{ padding: "0.4rem" }}>
                              Expiration Date
                            </th>
                            <th style={{ padding: "0.4rem" }}>Is Deleted?</th>
                            <th style={{ padding: "0.4rem" }}>
                              Deleted At (UTC)
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {p.licenses.map((l) => (
                            <tr
                              key={l.licenseId}
                              style={{ borderBottom: "1px solid #eee" }}
                            >
                              <td style={{ padding: "0.4rem" }}>
                                {l.licenseNumber}
                              </td>
                              <td style={{ padding: "0.4rem" }}>
                                {l.licenseStatus}
                              </td>
                              <td style={{ padding: "0.4rem" }}>
                                {new Date(
                                  l.expirationDate,
                                ).toLocaleDateString()}
                              </td>
                              <td style={{ padding: "0.4rem" }}>
                                {l.isDeleted ? "Yes" : "No"}
                              </td>
                              <td style={{ padding: "0.4rem" }}>
                                {l.deletedAtUtc
                                  ? new Date(l.deletedAtUtc).toLocaleString()
                                  : "N/A"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p
                        style={{
                          margin: 0,
                          fontStyle: "italic",
                          color: "#666",
                        }}
                      >
                        No licenses found.
                      </p>
                    )}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
          {providers.length === 0 && (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "1rem" }}>
                No providers found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
