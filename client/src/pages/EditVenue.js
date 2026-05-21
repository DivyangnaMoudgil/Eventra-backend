import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../config/api";
import "../style.css";

function EditVenue() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: { address: "", city: "", state: "", country: "India" },
    capacity: { min: "", max: "" },
    amenities: "",
    images: "",
    pricing: { basePrice: "", currency: "INR" },
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const res = await API.get(`/venues/${id}`);
        const v = res.data;

        setFormData({
          ...v,
          amenities: v.amenities.join(", "),
          images: v.images?.[0] || "",
        });

        setLoading(false);
      } catch (err) {
        console.error(err);
        navigate("/venues");
      }
    };

    fetchVenue();
  }, [id]);

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

      await API.put(`/venues/${id}`, payload, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      navigate("/venues");
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" value={formData.name} onChange={handleChange} />
      <button>Update</button>
    </form>
  );
}

export default EditVenue;