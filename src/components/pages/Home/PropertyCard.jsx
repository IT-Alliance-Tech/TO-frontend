// src/components/cards/PropertyCard/PropertyCard.jsx
import React, { useState } from "react";
import "./PropertyCard.css";
import bed from "../../../assets/images/Bed.png";
import bath from "../../../assets/images/Bath.png";
import areaImg from "../../../assets/images/area.png";
import { styled } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import FavoriteOutlined from "@mui/icons-material/FavoriteOutlined";
import Favorite from "@mui/icons-material/Favorite";
import { useWishlist } from "../../../context/Wishlist";
import watermark from "../../../assets/images/water1.png";
import fallbackImg from "../../../assets/images/Errorimg.png";

const WishlistButton = styled(IconButton)(({ theme, isWishlisted }) => ({
  position: "absolute",
  top: 8,
  right: 8,
  backgroundColor: "rgba(255, 255, 255, 0.9)",
  color: isWishlisted ? "#d32f2f" : "#666",
  zIndex: 1,
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 1)",
    color: "#d32f2f",
    transform: "scale(1.1)",
  },
}));

const PropertyCard = ({
  property,
  isAuthenticated,
  onLoginRequired,
  onViewDetails,
  onWishlistToggle,
  postType,
}) => {
  const { isIn, toggle } = useWishlist();
  const isGuest = !isAuthenticated; // Guest flag

  if (!property) {
    console.error("PropertyCard: No property data provided");
    return (
      <div className="property-card property-card--error">
        <div className="property-card__content">
          <p>Property data unavailable</p>
        </div>
      </div>
    );
  }

  const capitalizeText = (text) => {
    if (!text) return "";
    return text
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // ⭐ ONLY LOCATION IS HIDDEN FOR GUEST
  const getLocationString = (location) => {
    try {
      if (isGuest) return "Login to view location";

      if (typeof location === "string" && location.trim()) return capitalizeText(location);

      if (location && typeof location === "object") {
        if (location.address) return capitalizeText(location.address);
        if (location.street) return capitalizeText(location.street);
        if (location.city && location.state)
          return capitalizeText(`${location.city}, ${location.state}`);
        if (location.city) return capitalizeText(location.city);
      }

      return "Location Not Specified";
    } catch {
      return "Location Not Specified";
    }
  };

  // ⭐ AMENITIES SHOULD NOT BE HIDDEN ANYMORE
  const formatNumber = (value) => {
    const num = parseInt(value, 10) || 0;
    return num === 0 ? "N/A" : String(num);
  };

  const formatCurrency = (amount) => {
    const num = parseInt(amount, 10) || 0;
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(0)}K`;
    return `₹${num.toLocaleString()}`;
  };

  const getSafeImages = (images) => {
    if (!Array.isArray(images)) return [];
    return images.filter(
      (img) =>
        img &&
        typeof img === "string" &&
        img.trim() &&
        !img.toLowerCase().includes("car") &&
        !img.toLowerCase().includes("vehicle") &&
        !img.toLowerCase().includes("auto")
    );
  };

  const getPropertyId = () => {
    if (!property.id && !property._id) return null;
    let id = property.id || property._id;

    if (typeof id === "object") {
      if (id.toString) id = id.toString();
      else if (id.$oid) id = id.$oid;
      else return null;
    }
    return String(id);
  };

  const handleViewDetailsClick = (e) => {
    e.stopPropagation();
    const propertyId = getPropertyId();
    if (!propertyId) return;

    if (!isAuthenticated) {
      localStorage.setItem("redirectAfterLogin", `/property/${propertyId}`);
      onLoginRequired?.();
      return;
    }

    onViewDetails?.(propertyId);
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    const propertyId = getPropertyId();
    if (!propertyId) return;

    if (!isAuthenticated) {
      onLoginRequired?.();
      return;
    }

    const currentState = isIn(propertyId);
    toggle(propertyId);
    onWishlistToggle?.(!currentState);
  };

  const propertyId = getPropertyId();
  const safeImages = getSafeImages(property?.images);

  const wishlisted = propertyId ? isIn(propertyId) : false;

  return (
    <div className="property-card" onClick={handleViewDetailsClick}>
      <div className="property-card__media-container">
        <div className="property-card__badge">
          {property?.propertyType || "Property"}
        </div>

        <WishlistButton
          onClick={handleWishlistClick}
          size="small"
          isWishlisted={wishlisted && !isGuest}
        >
          {wishlisted && !isGuest ? <Favorite sx={{ color: "#d32f2f" }} /> : <FavoriteOutlined />}
        </WishlistButton>

        {safeImages.length > 0 ? (
          <div style={{ position: "relative", width: "100%" }}>
            <img
              className="property-card__image"
              src={safeImages[0]}
              alt={property?.title || "Property"}
              onError={(e) => (e.currentTarget.src = fallbackImg)}
            />
            <img src={watermark} alt="Watermark" className="property-overlay" />
          </div>
        ) : (
          <div style={{ position: "relative", width: "100%" }}>
            <img className="property-card__image" src={fallbackImg} alt="Fallback" />
            <img src={watermark} alt="Watermark" className="property-overlay" />
          </div>
        )}
      </div>

      <div className="property-card__content">
        <div className="property-card__pricing">
          <span className="property-card__price">{formatCurrency(property?.rent)}</span>
          <span className="property-card__status-all">{postType}</span>
        </div>

        <h3 className="property-card__title">
          {capitalizeText(property?.title) || "Untitled Property"}
        </h3>

        {/* ⭐ ONLY LOCATION IS HIDDEN — NOT AMENITIES */}
        <div
          className={`property-card__location ${isGuest ? "blur-text" : ""}`}
          title={getLocationString(property?.location)}
        >
          <span>{getLocationString(property?.location)}</span>
        </div>

        {/* ⭐ Amenities contain NO BLUR now */}
        <div className="property-card__specs">
          <div className="property-card__spec">
            <img src={bed} alt="bedrooms" />
            <span>{formatNumber(property?.bedrooms)}</span>
          </div>

          <div className="property-card__spec">
            <img src={bath} alt="bathrooms" />
            <span>{formatNumber(property?.bathrooms)}</span>
          </div>

          <div className="property-card__spec">
            <img src={areaImg} alt="area" />
            <span>{formatNumber(property?.area)}</span>
          </div>
        </div>

        <div className="property-card__actions">
          <button
            className={`property-card__action-btn ${
              isAuthenticated ? "authenticated" : "unauthenticated"
            }`}
            onClick={handleViewDetailsClick}
            type="button"
          >
            {isAuthenticated ? "View Details" : "Login to View Details"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
