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
