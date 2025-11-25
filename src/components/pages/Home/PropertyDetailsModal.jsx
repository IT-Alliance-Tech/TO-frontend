
import React, { useState } from 'react'
import './HomePage.css'

const PropertyDetailsModal = ({ 
  property, 
  onClose, 
  isInWishlist, 
  onWishlistToggle, 
  isAuthenticated, 
  onAuthPrompt,
  onNextPage,
  onPrevPage,
  currentPage,
  totalPages
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getSafeImages = (images) => {
    if (Array.isArray(images)) {
      return images.filter(img => img && typeof img === 'string' && img.trim())
    }
    return []
  }

  const getSafeAmenities = (amenities) => {
    if (Array.isArray(amenities)) {
      return amenities.filter(amenity => amenity && typeof amenity === 'string' && amenity.trim())
    }
    return []
  }

  const handleWishlistClick = () => {
    if (!isAuthenticated) {
      onAuthPrompt()
      return
    }
    onWishlistToggle()
  }

  const handleContactOwner = () => {
    window.location.href = '/subscription-plans'
  }

  const safeImages = getSafeImages(property.images)
  const safeAmenities = getSafeAmenities(property.amenities)

  return (
    <div className="property-details-overlay">
      <div className="property-details-modal">
        <div className="modal-header">
          <h2>{property.title || 'Property Details'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          {safeImages.length > 0 && (
            <div className="image-gallery">
              <div className="main-image">
                <img 
                  src={safeImages[currentImageIndex]} 
                  alt={`${property.title} - Image ${currentImageIndex + 1}`}
                  onError={(e) => { e.target.src = '/placeholder-property.jpg' }}
                />

                {safeImages.length > 1 && (
                  <>
                    <button 
                      className="image-nav prev"
                      onClick={() => setCurrentImageIndex(prev => prev === 0 ? safeImages.length - 1 : prev - 1)}
                    >
                      ‹
                    </button>
                    <button 
                      className="image-nav next"
                      onClick={() => setCurrentImageIndex(prev => prev === safeImages.length - 1 ? 0 : prev + 1)}
                    >
                      ›
                    </button>
                  </>
                )}
              </div>

              {safeImages.length > 1 && (
                <div className="image-thumbnails">
                  {safeImages.map((image, index) => (
                    <button
                      key={index}
                      className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <img src={image} alt={`Thumbnail ${index + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="property-info">
            <div className="property-header">
              <div className="property-basic-info">
                <h1>{property.title || 'Untitled Property'}</h1>

                {/* LOCATION HIDDEN */}

                <div className="property-specs">
                  <span>{property.bedrooms || 0} Bedrooms</span>
                  <span>{property.bathrooms || 0} Bathrooms</span>
                  <span>{property.area || 0} sq ft</span>
                  <span className="property-type">{property.propertyType || 'Property'}</span>
                </div>
              </div>

              <div className="property-actions">
                <button 
                  className={`wishlist-btn large ${isInWishlist ? 'active' : ''}`}
                  onClick={handleWishlistClick}
                >
                  {isInWishlist ? '❤️' : '🤍'}
                </button>
              </div>
            </div>

            <div className="pricing-section">
              <div className="rent-info">
                <div className="rent">
                  <strong>{formatCurrency(property.rent)}</strong>
                  <span>/month</span>
                </div>
                <div className="deposit">
                  Security Deposit: {formatCurrency(property.deposit)}
                </div>
              </div>

              <button 
                className="btn btn-primary btn-large contact-btn"
                onClick={handleContactOwner}
              >
                Contact Owner
              </button>
            </div>

            <div className="description-section">
              <h3>Description</h3>
              <p>{property.description || 'No description provided'}</p>
            </div>

            {safeAmenities.length > 0 && (
              <div className="amenities-section">
                <h3>Amenities</h3>
                <div className="amenities-grid">
                  {safeAmenities.map(amenity => (
                    <span key={amenity} className="amenity-item">✓ {amenity}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="property-meta">
              <div className="meta-item">
                <strong>Property ID:</strong> {property.id}
              </div>
              <div className="meta-item">
                <strong>Listed on:</strong> {formatDate(property.createdAt)}
              </div>
              <div className="meta-item">
                <strong>Status:</strong> <span className="status-live">🟢 Available</span>
              </div>
            </div>
          </div>
        </div>

        {/* PAGINATION ADDED */}
        <div className="pagination-controls">
          <button 
            className="btn btn-secondary"
            onClick={onPrevPage}
            disabled={currentPage === 1}
          >
            Prev
          </button>

          <span className="pagination-status">Page {currentPage} of {totalPages}</span>

          <button 
            className="btn btn-secondary"
            onClick={onNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={handleContactOwner}>Contact Owner</button>
        </div>
      </div>
    </div>
  )
}

export default PropertyDetailsModal
