/**
 * PYHARA — Location & PIN Code Service Layer
 */

const getHost = () => (typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : '127.0.0.1');

export async function lookupPincode(pincode) {
  if (!pincode || pincode.trim().length !== 6) {
    return { valid: false, error: 'Please enter a valid 6-digit PIN code.' };
  }

  const cleanPin = pincode.trim();
  const host = getHost();
  const url = `http://${host}:8000/api/location/pincode/${encodeURIComponent(cleanPin)}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        valid: false,
        pincode: cleanPin,
        error: data.detail || 'Invalid Indian PIN code.',
      };
    }

    return data;
  } catch (err) {
    console.error('Pincode lookup network error:', err);
    return {
      valid: false,
      pincode: cleanPin,
      error: 'Unable to connect to postal verification service.',
    };
  }
}

export async function checkServiceability(pincode) {
  if (!pincode || pincode.trim().length !== 6) {
    return {
      serviceable: false,
      pincode: pincode ? pincode.trim() : '',
      message: 'Please enter a valid 6-digit Indian PIN code.',
    };
  }

  const cleanPin = pincode.trim();
  const host = getHost();
  const url = `http://${host}:8000/api/location/serviceability/${encodeURIComponent(cleanPin)}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        serviceable: false,
        pincode: cleanPin,
        message: data.detail || 'Delivery is currently unavailable for this location.',
      };
    }

    return data;
  } catch (err) {
    console.error('Serviceability check network error:', err);
    return {
      serviceable: false,
      pincode: cleanPin,
      message: 'Unable to verify delivery serviceability at this time.',
    };
  }
}

export async function fetchActiveLocations() {
  const host = getHost();
  const url = `http://${host}:8000/api/location/active`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to load active delivery locations.');
    return data;
  } catch (err) {
    console.error('Failed to fetch active locations:', err);
    throw err;
  }
}

export async function getCurrentLocationPIN() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ success: false, error: 'Geolocation is not supported by your browser.' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Free reverse-geocoding via BigDataCloud API
          const geoUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
          const resp = await fetch(geoUrl);
          if (resp.ok) {
            const geoData = await resp.json();
            const pincode = geoData.postcode || geoData.postalCode;
            if (pincode && /^[1-9][0-9]{5}$/.test(pincode.trim())) {
              resolve({
                success: true,
                pincode: pincode.trim(),
                locality: geoData.locality || geoData.city || '',
              });
              return;
            }
          }

          // Fallback: OpenStreetMap Nominatim API
          const nomUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
          const nomResp = await fetch(nomUrl);
          if (nomResp.ok) {
            const nomData = await nomResp.json();
            const nomPin = nomData.address?.postcode;
            if (nomPin && /^[1-9][0-9]{5}$/.test(nomPin.trim())) {
              resolve({
                success: true,
                pincode: nomPin.trim(),
                locality: nomData.address?.suburb || nomData.address?.city || '',
              });
              return;
            }
          }

          resolve({
            success: false,
            error: 'Could not automatically extract a 6-digit Indian PIN code from your current location. Please enter your PIN manually.',
          });
        } catch (err) {
          resolve({
            success: false,
            error: 'Reverse geocoding failed. Please enter your PIN code manually.',
          });
        }
      },
      (error) => {
        let msg = 'Unable to retrieve location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please enter your PIN code manually.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Location information is unavailable. Please enter your PIN code manually.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out. Please enter your PIN code manually.';
        }
        resolve({ success: false, error: msg });
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  });
}
