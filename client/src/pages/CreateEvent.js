import React, { useState, useEffect, useCallback } from "react";
import API from "../config/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import VenueSelector from "../components/VenueSelector";
import "./../style.css";

function CreateEvent() {
  const [step, setStep] = useState(1);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [searchParams] = useSearchParams();
  const [showPreview, setShowPreview] = useState(false);

  const navigate = useNavigate();
  const { auth } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tags: "",
    image: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    capacity: "",
    venueName: "",
    address: "",
    city: "",
    currency: "USD",
    ticketPrice: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVenueSelect = (venue) => {
    setSelectedVenue(venue);
    if (venue) {
      setFormData((prev) => ({
        ...prev,
        venueName: venue.name,
        address: venue.location.address,
        city: venue.location.city,
      }));
    }
  };

  const handleCustomVenue = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const fetchVenueDetails = useCallback(async (venueId) => {
    try {
      const response = await API.get(`/venues/${venueId}`);
      const venue = response.data;

      setSelectedVenue(venue);

      setFormData((prev) => ({
        ...prev,
        venueName: venue.name,
        address: venue.location?.address || "",
        city: venue.location?.city || "",
      }));
    } catch (error) {
      console.error("Error fetching venue:", error);
    }
  }, []);

  useEffect(() => {
    const venueId = searchParams.get("venueId");
    const venueName = searchParams.get("venueName");

    if (venueId && venueName) {
      fetchVenueDetails(venueId);
      setStep(3);
    }
  }, [searchParams, fetchVenueDetails]);

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handlePublish = async () => {
    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tags.split(","),
        image: formData.image,
        date: formData.startDate,
        location: {
          venue: formData.venueName,
          address: formData.address,
          city: formData.city,
        },
        tickets: [
          {
            type: "General",
            price: formData.ticketPrice,
            available: formData.capacity || 100,
          },
        ],
      };

      if (selectedVenue) eventData.venueId = selectedVenue._id;

      const res = await API.post("/events", eventData, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      alert("Event Created Successfully!");
      navigate(`/event/${res.data._id}`);
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Error creating event");
    }
  };

  return (
    <div className="create-event">
      <h1>Create Event</h1>

      {step === 1 && (
        <div>
          <input name="title" value={formData.title} onChange={handleChange} placeholder="Title" />
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" />
          <button onClick={nextStep}>Next</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} />
          <button onClick={prevStep}>Back</button>
          <button onClick={nextStep}>Next</button>
        </div>
      )}

      {step === 3 && (
        <div>
          <VenueSelector
            selectedVenue={selectedVenue}
            onVenueSelect={handleVenueSelect}
            onCustomVenue={handleCustomVenue}
          />
          <button onClick={prevStep}>Back</button>
          <button onClick={nextStep}>Next</button>
        </div>
      )}

      {step === 4 && (
        <div>
          <input
            type="number"
            name="ticketPrice"
            value={formData.ticketPrice}
            onChange={handleChange}
            placeholder="Price"
          />

          <button onClick={prevStep}>Back</button>
          <button onClick={handlePublish}>Publish</button>
        </div>
      )}
    </div>
  );
}

export default CreateEvent;