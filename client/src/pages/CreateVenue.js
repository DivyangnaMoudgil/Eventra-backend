import React, { useState, useCallback } from "react";
import API from "../config/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MapLocationPicker from "../components/MapLocationPicker";
import "../style.css";

function CreateVenue() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: {
      address: "",
      city: "",
      state: "",
      country: "India",
      coordinates: { lat: 28.6139, lng: 77.209 },
    },
    capacity: {
      min: "",
      max: "",
    },
    amenities: "",
    images: "",
    contactInfo: {
      phone: "",
      email: "",
      website: "",
    },
    pricing: {
      basePrice: "",
      currency: "INR",
    },
  });

  const [loading, setLoading] = useState(false);
  const [venueCreated, setVenueCreated] = useState(false);
  const [createdVenue, setCreatedVenue] = useState(null);

  const navigate = useNavigate();
  const { auth } = useAuth();

  const handleMapLocationSelect = useCallback(
    ({ coordinates, address, city, state, country }) => {
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          coordinates: coordinates || prev.location.coordinates,
          address: address || prev.location.address,
          city: city || prev.location.city,
          state: state || prev.location.state,
          country: country || prev.location.country,
        },
      }));
    },
    []
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");

      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const venueData = {
        ...formData,
        capacity: {
          min: parseInt(formData.capacity.min),
          max: parseInt(formData.capacity.max),
        },
        pricing: {
          ...formData.pricing,
          basePrice: parseFloat(formData.pricing.basePrice) || 0,
        },
        amenities: formData.amenities
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean),
      };

      const response = await API.post("/venues", venueData, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      setCreatedVenue(response.data);
      setVenueCreated(true);
    } catch (error) {
      console.error("Error creating venue:", error);
      alert("Error creating venue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-venue">
      <form onSubmit={handleSubmit}>
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Venue Name"
        />

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
        />

        <input
          name="location.address"
          value={formData.location.address}
          onChange={handleChange}
          placeholder="Address"
        />

        <input
          name="location.city"
          value={formData.location.city}
          onChange={handleChange}
          placeholder="City"
        />

        <input
          name="capacity.min"
          value={formData.capacity.min}
          onChange={handleChange}
          placeholder="Min Capacity"
        />

        <input
          name="capacity.max"
          value={formData.capacity.max}
          onChange={handleChange}
          placeholder="Max Capacity"
        />

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Venue"}
        </button>
      </form>

      {venueCreated && (
        <div>
          <h3>Venue Created: {createdVenue?.name}</h3>
          <button onClick={() => navigate("/venues")}>Go to Venues</button>
        </div>
      )}
    </div>
  );
}

export default CreateVenue;