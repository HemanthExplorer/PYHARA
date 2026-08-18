/**
 * PYHARA — Location & PIN Code Service Layer
 */

import { API_BASE_URL } from '../config';

export async function lookupPincode(pincode) {
  if (!pincode || pincode.trim().length !== 6) {
    return { valid: false, error: 'Please enter a valid 6-digit PIN code.' };
  }

  const cleanPin = pincode.trim();
  const url = `${API_BASE_URL}/api/location/pincode/${encodeURIComponent(cleanPin)}`;

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
  const url = `${API_BASE_URL}/api/location/serviceability/${encodeURIComponent(cleanPin)}`;

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
  const url = `${API_BASE_URL}/api/location/active`;

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
  const extractCleanPIN = (val) => {
    if (!val) return null;
    const digits = String(val).replace(/\D/g, '');
    if (digits.length === 6 && /^[1-9][0-9]{5}$/.test(digits)) {
      return digits;
    }
    return null;
  };

  const tryIPLocationFallback = async () => {
    try {
      // 1. BigDataCloud IP reverse-geocode
      const bdcResp = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=en');
      if (bdcResp.ok) {
        const bdcData = await bdcResp.json();
        const pin = extractCleanPIN(bdcData.postcode || bdcData.postalCode);
        if (pin) {
          return { success: true, pincode: pin, locality: bdcData.locality || bdcData.city || '' };
        }
      }
    } catch (e) {
      console.warn('BigDataCloud IP location fallback failed:', e);
    }

    try {
      // 2. ipapi.co IP reverse-geocode
      const ipResp = await fetch('https://ipapi.co/json/');
      if (ipResp.ok) {
        const ipData = await ipResp.json();
        const pin = extractCleanPIN(ipData.postal);
        if (pin) {
          return { success: true, pincode: pin, locality: ipData.city || '' };
        }
      }
    } catch (e) {
      console.warn('ipapi IP location fallback failed:', e);
    }

    return {
      success: false,
      error: 'Could not automatically detect your location. Please enter your PIN code manually or select from active locations.',
    };
  };

  return new Promise((resolve) => {
    if (!navigator || !navigator.geolocation) {
      tryIPLocationFallback().then(resolve);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // 1. BigDataCloud reverse geocode with lat/lon
          const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
          const bdcResp = await fetch(bdcUrl);
          if (bdcResp.ok) {
            const bdcData = await bdcResp.json();
            const pin = extractCleanPIN(bdcData.postcode || bdcData.postalCode);
            if (pin) {
              resolve({ success: true, pincode: pin, locality: bdcData.locality || bdcData.city || '' });
              return;
            }
          }

          // 2. OpenStreetMap Nominatim reverse geocode
          const nomUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;
          const nomResp = await fetch(nomUrl, { headers: { 'User-Agent': 'PYHARA-Eco-Marketplace/1.0' } });
          if (nomResp.ok) {
            const nomData = await nomResp.json();
            const pin = extractCleanPIN(nomData.address?.postcode);
            if (pin) {
              resolve({ success: true, pincode: pin, locality: nomData.address?.suburb || nomData.address?.city || '' });
              return;
            }
          }

          // If GPS coords did not yield a 6-digit PIN code, fallback to IP location
          const fallbackRes = await tryIPLocationFallback();
          resolve(fallbackRes);
        } catch (err) {
          console.warn('GPS Reverse geocoding network error, trying IP location fallback...', err);
          const fallbackRes = await tryIPLocationFallback();
          resolve(fallbackRes);
        }
      },
      async (error) => {
        console.warn('Browser Geolocation error/denied, trying IP location fallback...', error);
        const fallbackRes = await tryIPLocationFallback();
        resolve(fallbackRes);
      },
      { timeout: 6000, enableHighAccuracy: false, maximumAge: 300000 }
    );
  });
}
