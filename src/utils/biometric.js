export const isBiometricSupported = () => {
  return window.PublicKeyCredential !== undefined && 
         typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function';
};

export const checkBiometricAvailability = async () => {
  if (!isBiometricSupported()) return { available: false, reason: 'WebAuthn not supported in this browser' };
  try {
    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    return { available, reason: available ? 'Platform authenticator available' : 'No platform authenticator found (no fingerprint/face ID on device)' };
  } catch (e) {
    return { available: false, reason: 'Error checking biometric availability' };
  }
};

export const performBiometricAuth = async (userId, userName) => {
  const { available } = await checkBiometricAvailability();
  if (!available) return { success: false, method: 'unavailable' };
  
  try {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: 'BioPay Nexus', id: window.location.hostname },
        user: { id: new TextEncoder().encode(userId), name: userName, displayName: userName },
        pubKeyCredParams: [{ alg: -7, type: 'public-key' }, { alg: -257, type: 'public-key' }],
        authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
        timeout: 60000,
        attestation: 'none',
      },
    });
    return { success: true, method: 'webauthn', credentialId: credential.id };
  } catch (e) {
    if (e.name === 'NotAllowedError') return { success: false, method: 'cancelled', error: 'Biometric authentication was cancelled' };
    return { success: false, method: 'error', error: e.message };
  }
};

export const verifyBiometric = async (userId) => {
  const { available } = await checkBiometricAvailability();
  if (!available) return { success: false, method: 'unavailable' };
  
  try {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        rpId: window.location.hostname,
        userVerification: 'required',
        timeout: 60000,
      },
    });
    return { success: true, method: 'webauthn' };
  } catch (e) {
    // Fall back to demo mode
    return { success: false, method: 'error', error: e.message };
  }
};
