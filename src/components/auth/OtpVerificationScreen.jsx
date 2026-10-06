import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, ArrowLeft, RefreshCw, Clock, AlertCircle, KeyRound, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { useHealthData } from '../../context/HealthDataContext';
import { translations } from '../../utils/translations';

export const OtpVerificationScreen = ({ email, onBackToLogin, onVerificationSuccess }) => {
  const navigate = useNavigate();
  const { verifyOtp, resendOtp, language, setLanguage } = useHealthData();
  
  const t = (key) => translations[language]?.[key] || translations.EN[key] || key;

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const [expirySeconds, setExpirySeconds] = useState(300); // 5 minutes
  const [errorMessage, setErrorMessage] = useState('');
  const [attemptsRemaining, setAttemptsRemaining] = useState(null);

  const inputRefs = useRef([]);

  // Auto-focus first input on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Cooldown timer (60s)
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Expiry countdown timer (300s / 5 mins)
  useEffect(() => {
    if (expirySeconds <= 0) return;
    const timer = setInterval(() => {
      setExpirySeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [expirySeconds]);

  // Handle single digit input
  const handleChange = (index, value) => {
    // Only accept numeric digit
    const cleaned = value.replace(/[^0-9]/g, '');
    if (!cleaned && value !== '') return;

    const newDigits = [...otpDigits];
    newDigits[index] = cleaned ? cleaned.slice(-1) : '';
    setOtpDigits(newDigits);
    setErrorMessage('');

    // Advance focus to next input
    if (cleaned && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle keyboard navigation (Backspace, Left/Right arrow)
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle clipboard paste of 6-digit OTP
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '');
    if (pastedData.length >= 6) {
      const sixDigits = pastedData.slice(0, 6).split('');
      setOtpDigits(sixDigits);
      setErrorMessage('');
      if (inputRefs.current[5]) {
        inputRefs.current[5].focus();
      }
    } else if (pastedData.length > 0) {
      const newDigits = [...otpDigits];
      pastedData.split('').forEach((digit, i) => {
        if (i < 6) newDigits[i] = digit;
      });
      setOtpDigits(newDigits);
      const nextIndex = Math.min(5, pastedData.length);
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
    }
  };

  // Format seconds to mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const fullOtp = otpDigits.join('');

  // Submit OTP Verification
  const handleVerify = async (e) => {
    e?.preventDefault();

    if (fullOtp.length !== 6) {
      setErrorMessage(t('enterValidOtp') || "Please enter a valid 6-digit numeric code.");
      return;
    }

    if (expirySeconds <= 0) {
      setErrorMessage("Verification code has expired. Please request a new code.");
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await verifyOtp(email, fullOtp);
      if (res && res.success) {
        if (onVerificationSuccess) {
          onVerificationSuccess(res.user);
        } else {
          navigate('/app/dashboard');
        }
      } else {
        setLoading(false);
        setErrorMessage(res?.error || "Invalid verification code.");
        if (res?.attemptsRemaining !== undefined) {
          setAttemptsRemaining(res.attemptsRemaining);
        }
        // Focus first digit box if verification failed
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }
    } catch (err) {
      setLoading(false);
      setErrorMessage(err.message || "Network error. Please try again.");
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (cooldown > 0 || resending) return;

    setResending(true);
    setErrorMessage('');
    try {
      const res = await resendOtp(email);
      if (res && res.success) {
        setCooldown(res.cooldownSeconds || 60);
        setExpirySeconds(300); // Reset 5-minute timer
        setOtpDigits(['', '', '', '', '', '']);
        setAttemptsRemaining(null);
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      } else {
        setErrorMessage(res?.error || "Failed to resend code.");
        if (res?.cooldownSeconds) {
          setCooldown(res.cooldownSeconds);
        }
      }
    } catch (err) {
      setErrorMessage("Network error while resending code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] py-8 px-6 shadow-xl rounded-2xl sm:px-8 space-y-6">
      
      {/* Top Header with Icon & Language Toggle */}
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-2xl bg-[#EEF7F1] dark:bg-[#1E2824] border border-[#D5E8DC] dark:border-[#313750] flex items-center justify-center text-[var(--color-primary)] shadow-xs">
          <ShieldCheck className="w-6 h-6 text-[#54816C] dark:text-[#6B9B85]" />
        </div>

        {/* Trilingual Language Switcher (EN / HI / GU) */}
        <div className="flex items-center gap-1 bg-[var(--bg-surface-subtle)] p-1 rounded-xl border border-[var(--border-color)] text-xs">
          <Globe className="w-3.5 h-3.5 text-[var(--text-muted)] ml-1 mr-0.5" />
          {['EN', 'HI', 'GU'].map((langKey) => (
            <button
              key={langKey}
              type="button"
              onClick={() => setLanguage(langKey)}
              className={`px-2 py-1 rounded-lg font-bold transition-all text-xs cursor-pointer ${
                language === langKey
                  ? 'bg-[var(--color-primary)] text-white shadow-2xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {langKey}
            </button>
          ))}
        </div>
      </div>

      {/* Title & Instructions */}
      <div className="space-y-1.5">
        <h3 className="text-xl font-extrabold text-[var(--text-main)] tracking-tight">
          {t('twoFactorAuth')}
        </h3>
        <p className="text-xs font-medium text-[var(--text-muted)] leading-relaxed">
          {t('otpSentToEmail')} <strong className="text-[var(--text-main)] font-semibold">{email}</strong>
        </p>
      </div>

      {/* Error / Attempt Limits Banner */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs flex items-start gap-2.5 text-rose-700 dark:text-rose-200 animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
          <div className="space-y-0.5">
            <span className="font-semibold block">{errorMessage}</span>
            {attemptsRemaining !== null && (
              <span className="text-[11px] opacity-90">
                You have {attemptsRemaining} attempt{attemptsRemaining === 1 ? '' : 's'} remaining before this code is invalidated.
              </span>
            )}
          </div>
        </div>
      )}

      {/* 6-Digit OTP Form */}
      <form onSubmit={handleVerify} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-[var(--text-main)] mb-2.5">
            {t('enterOtpCode')}
          </label>
          
          {/* Responsive 6-Digit Pin Input Grid */}
          <div 
            className="grid grid-cols-6 gap-2 sm:gap-2.5 max-w-sm mx-auto"
            onPaste={handlePaste}
          >
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                disabled={loading}
                className="w-full aspect-square text-center text-xl sm:text-2xl font-extrabold rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all shadow-2xs disabled:opacity-50"
              />
            ))}
          </div>
        </div>

        {/* Timers & Expiry Bar */}
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-1 px-1">
          <div className="flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-[var(--color-primary)]" />
            <span>
              {t('codeExpiresIn')}:{' '}
              <strong className={expirySeconds <= 60 ? "text-rose-600 font-bold" : "text-[var(--text-main)]"}>
                {formatTime(expirySeconds)}
              </strong>
            </span>
          </div>

          <div className="text-right">
            {cooldown > 0 ? (
              <span className="text-[11px] text-[var(--text-subtle)] font-medium">
                {t('resendIn')} {cooldown}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-xs font-bold text-[var(--color-primary)] hover:underline inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                <span>{resending ? 'Sending...' : t('resendCode')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || fullOtp.length !== 6 || expirySeconds <= 0}
          className="w-full py-3.5 px-4 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{t('verifying')}</span>
            </div>
          ) : (
            <>
              <span>{t('verifyAndSignIn')}</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </>
          )}
        </button>
      </form>

      {/* Back to Login & Help */}
      <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={onBackToLogin}
          className="inline-flex items-center gap-1.5 font-bold text-[var(--color-primary)] hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('backToSignIn')}</span>
        </button>

        <span className="text-[var(--text-subtle)] text-[11px]">
          {t('checkInbox')}
        </span>
      </div>

    </div>
  );
};
