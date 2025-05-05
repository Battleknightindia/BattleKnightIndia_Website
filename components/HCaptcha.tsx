'use client';

import { useRef, useEffect } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';

interface HCaptchaProps {
  onVerify: (token: string) => void;
  onError?: (error: unknown) => void;
  onExpire?: () => void;
}

export function HCaptchaComponent({ onVerify, onError, onExpire }: HCaptchaProps) {
  const captchaRef = useRef<HCaptcha>(null);

  useEffect(() => {
    // Log the site key when component mounts
    console.log('HCaptcha Site Key:', process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY);
  }, []);

  const handleVerify = (token: string) => {
    console.log('Captcha verified, token:', token);
    onVerify(token);
  };

  const handleError = (error: unknown) => {
    console.error('Captcha error:', error);
    if (onError) {
      onError(error);
    }
  };

  const handleExpire = () => {
    console.log('Captcha expired');
    if (onExpire) {
      onExpire();
    }
  };

  return (
    <div>
      <HCaptcha
        ref={captchaRef}
        sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
        onVerify={handleVerify}
        onError={handleError}
        onExpire={handleExpire}
        theme="dark"
        size="normal"
        languageOverride="en"
      />
    </div>
  );
}
