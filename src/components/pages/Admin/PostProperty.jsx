// PostProperty.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { buildApiUrl, API_CONFIG } from '../../../config/api';
import { uploadFile, generateFileName } from '../../../config/supabase';
import { handleApiError, getErrorMessage, validateApiResponse } from '../../../utils/errorHandler';
import Compressor from 'compressorjs';
import './PostProperty.css';

const PostProperty = ({ onSuccess }) => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    owner: { name: '', email: '', phone: '' },
    title: '',
    description: '',
    location: { address: '', city: '', state: '', country: '', pincode: '', googleMapsLink: '' },
    rent: '',
    deposit: '',
    propertyType: 'apartment',
    bedrooms: '',
    bathrooms: '',
    area: '',
    amenities: []
  });

  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const amenitiesList = [
    'WiFi', 'Parking', 'Gym', 'Swimming Pool', 'Security', 'Elevator',
    'Balcony', 'Garden', 'Furnished', 'Air Conditioning', 'Heating',
    'Laundry', 'Pet Friendly', 'Near Metro', 'Shopping Mall', 'Hospital'
  ];

  const allowedTypes = {
    images: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    videos: ['video/mp4', 'video/webm', 'video/mov', 'video/avi']
  };

  // ---------------- Input Handlers ----------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (['name', 'email', 'phone'].includes(name)) {
      setFormData(prev => ({ ...prev, owner: { ...prev.owner, [name]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (error) setError('');
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, location: { ...prev.location, [name]: value } }));
    if (error) setError('');
  };

  const handleGoogleMapsLinkPaste = (e) => {
    const link = e.target.value;
    setFormData(prev => ({ ...prev, location: { ...prev.location, googleMapsLink: link } }));
    if (link.includes('maps.google.com') || link.includes('goo.gl/maps')) setError('');
  };

  const openGoogleMaps = () => {
    const { address, city, state, country } = formData.location;
    const encodedAddress = encodeURIComponent(`${address} ${city} ${state} ${country}`.trim() || 'current location');
    window.open(`https://www.google.com/maps/search/${encodedAddress}`, '_blank');
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  // ---------------- Media ----------------
  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const errors = [];

    files.forEach(file => {
      const isImage = allowedTypes.images.includes(file.type);
      const isVideo = allowedTypes.videos.includes(file.type);
      const maxSize = isImage ? 10 * 1024 * 1024 : 100 * 1024 * 1024;

      if (!isImage && !isVideo) {
        errors.push(`${file.name}: Invalid type`);
        return;
      }

      if (isImage) {
        new Compressor(file, {
          quality: 0.6,
          maxWidth: 1920,
          maxHeight: 1080,
          success(compressedFile) {
            if (compressedFile.size > maxSize) errors.push(`${file.name}: too large even after compression`);
            else addValidFile(compressedFile, 'image');
          },
          error() { errors.push(`${file.name}: Compression failed`); }
        });
      } else if (isVideo) {
        if (file.size > maxSize) errors.push(`${file.name}: Video too large`);
        else addValidFile(file, 'video');
      }
    });

    if (errors.length) setError(errors.join('\n'));

    function addValidFile(file, type) {
      setMediaFiles(prev => [...prev, file]);
      const reader = new FileReader();
      reader.onload = (event) => {
        const preview = { id: Date.now() + Math.random(), file, type, url: event.target.result, name: file.name };
        setMediaPreviews(prev => [...prev, preview]);
      };
      reader.readAsDataURL(file);
    }

    e.target.value = '';
  };

  const removeMedia = (id) => {
    setMediaPreviews(prev => prev.filter(p => p.id !== id));
    setMediaFiles(prev => {
      const preview = mediaPreviews.find(p => p.id === id);
      return prev.filter(file => file !== preview?.file);
    });
  };

  const uploadAllMedia = async () => {
    if (!mediaFiles.length) return [];
    setUploadingMedia(true);
    const uploadedUrls = [];

    try {
      for (let i = 0; i < mediaFiles.length; i++) {
        const file = mediaFiles[i];
        const fileName = generateFileName(file.name, formData.title || 'property');
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        const uploadResult = await uploadFile(file, fileName);
        if (uploadResult.success) {
          uploadedUrls.push(uploadResult.url);
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        } else throw new Error(`Failed to upload ${file.name}`);
      }
      return uploadedUrls;
    } catch (err) {
      throw err;
    } finally {
      setUploadingMedia(false);
      setUploadProgress({});
    }
  };

  // ---------------- Validation ----------------
  const validateForm = () => {
    const { title, description, location, rent, deposit, bedrooms, bathrooms, area, owner } = formData;
    if (!title.trim()) return setError('Title required') && false;
    if (!description.trim()) return setError('Description required') && false;
    if (!location.address.trim()) return setError('Address required') && false;
    if (!location.city.trim()) return setError('City required') && false;
    if (!location.state.trim()) return setError('State required') && false;
    if (!location.country.trim()) return setError('Country required') && false;
    if (!location.pincode.trim()) return setError('Pincode required') && false;
    if (!rent || rent <= 0) return setError('Valid rent required') && false;
    if (!deposit || deposit <= 0) return setError('Valid deposit required') && false;
    if (!bedrooms || bedrooms <= 0) return setError('Bedrooms required') && false;
    if (!bathrooms || bathrooms <= 0) return setError('Bathrooms required') && false;
    if (!area || area <= 0) return setError('Area required') && false;
    if (!owner.name.trim() || !owner.email.trim() || !owner.phone.trim()) return setError('Owner info required') && false;
    if (!mediaFiles.length) return setError('At least one media required') && false;
    return true;
  };

  // ---------------- Submit ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const mediaUrls = await uploadAllMedia();

      const response = await fetch(buildApiUrl(API_CONFIG.OWNER.PROPERTIES), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...formData, images: mediaUrls })
      });

      const data = await response.json();
      validateApiResponse(data);

      if (!response.ok) throw new Error(data.error || handleApiError(null, response));
      if (data.success) {
        if (onSuccess) onSuccess({ property: data.data });
        navigate('/properties');
      } else throw new Error(getErrorMessage(data));
    } catch (err) {
      setError(err.message || 'Failed to add property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-modal property-modal">
        <div className="auth-header">
          <h2>Post New Property</h2>
          <p>List your property and reach thousands of potential tenants</p>
          <button className="auth-close" onClick={() => navigate('/properties')}>×</button>
        </div>

        <form className="auth-form property-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error"><span>⚠️</span><div style={{whiteSpace:'pre-line'}}>{error}</div></div>}

          {/* Owner Info */}
          <div className="form-section">
            <h3 className="section-title">Owner Information</h3>

            <div className="two-col">
              <input type="text" name="name" value={formData.owner.name} onChange={handleInputChange} placeholder="Name" required />
              <input type="email" name="email" value={formData.owner.email} onChange={handleInputChange} placeholder="Email" required />
            </div>

            <input type="text" name="phone" value={formData.owner.phone} onChange={handleInputChange} placeholder="Phone Number" required />
          </div>

          {/* Basic Info */}
          <div className="form-section">
            <h3 className="section-title">Basic Information</h3>
            <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="Property Title" required />
            <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Property Description" rows="4" required />
          </div>

          {/* Location */}
          <div className="form-section">
            <h3 className="section-title">Location</h3>

            <div className="two-col">
              <input type="text" name="address" value={formData.location.address} onChange={handleLocationChange} placeholder="Street Address" required />
              <input type="text" name="city" value={formData.location.city} onChange={handleLocationChange} placeholder="City" required />
            </div>

            <div className="two-col">
              <input type="text" name="state" value={formData.location.state} onChange={handleLocationChange} placeholder="State" required />
              <input type="text" name="country" value={formData.location.country} onChange={handleLocationChange} placeholder="Country" required />
            </div>

            <input type="text" name="pincode" value={formData.location.pincode} onChange={handleLocationChange} placeholder="Pincode" required />

            <div className="maps-row">
              <input type="url" name="googleMapsLink" value={formData.location.googleMapsLink} onChange={handleGoogleMapsLinkPaste} placeholder="Google Maps Link (Optional)" />
              <button type="button" onClick={openGoogleMaps}>Open Maps</button>
            </div>
          </div>

          {/* Property Details (2 column layout) */}
          <div className="form-section">
            <h3 className="section-title">Property Details</h3>

            <div className="two-col">
              {/* Left side */}
              <div className="col">
                <select name="propertyType" value={formData.propertyType} onChange={handleInputChange}>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="condo">Condo</option>
                  <option value="villa">Villa</option>
                </select>

                <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleInputChange} placeholder="Bedrooms" required />

                <input type="number" name="bathrooms" value={formData.bathrooms} onChange={handleInputChange} placeholder="Bathrooms" required />
              </div>

              {/* Right side */}
              <div className="col">
                <input type="number" name="area" value={formData.area} onChange={handleInputChange} placeholder="Area (sq ft)" required />

                <input type="number" name="rent" value={formData.rent} onChange={handleInputChange} placeholder="Monthly Rent" required />

                <input type="number" name="deposit" value={formData.deposit} onChange={handleInputChange} placeholder="Security Deposit" required />
              </div>
            </div>
          </div>

          {/* Amenities (2 rows × 8 items) */}
          <div className="form-section">
            <h3 className="section-title">Amenities</h3>

            <div className="amenities-grid">
              {amenitiesList.map(a => (
                <label key={a} className="amenity-item">
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(a)}
                    onChange={() => handleAmenityToggle(a)}
                  /> 
                  {a}
                </label>
              ))}
            </div>
          </div>

          {/* Media Upload */}
          <div className="form-section">
            <h3 className="section-title">Media Upload</h3>

            <input
              type="file"
              multiple
              accept={[...allowedTypes.images, ...allowedTypes.videos].join(',')}
              onChange={handleMediaChange}
            />

            {mediaPreviews.length > 0 && (
              <div className="media-previews">
                {mediaPreviews.map(p => (
                  <div key={p.id}>
                    {p.type === 'image'
                      ? <img src={p.url} alt={p.name} />
                      : <video src={p.url} controls />}
                    <button type="button" onClick={() => removeMedia(p.id)}>×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit">
            {uploadingMedia ? 'Uploading Media...' : loading ? 'Posting Property...' : 'Post Property'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostProperty;
