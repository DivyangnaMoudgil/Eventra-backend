import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../config/api";
import "../style.css";

function CreateVenueNew() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: { address: "", city: "", state: "", country: "India" },
    capacity: { min: "", max: "" },
    amenities: "",
    images: "",
    pricing: { basePrice: "", currency: "INR" },
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { auth } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [p, c] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [p]: { ...prev[p], [c]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        capacity: {
          min: Number(formData.capacity.min),
          max: Number(formData.capacity.max),
        },
        pricing: {
          ...formData.pricing,
          basePrice: Number(formData.pricing.basePrice),
        },
        amenities: formData.amenities
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),
      };

      await API.post("/venues", payload, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      navigate("/venues");
    } catch (err) {
      console.error(err);
      alert("Error creating venue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" onChange={handleChange} />
      <button disabled={loading}>
        {loading ? "Creating..." : "Create"}
      </button>
    </form>
  );
}

export default CreateVenueNew;