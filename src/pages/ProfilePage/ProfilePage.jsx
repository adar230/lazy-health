import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutError, setCheckoutError] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        // Check if we need to apply a pending upgrade
        if (searchParams.get('upgraded') === 'true') {
          console.log("Detected ?upgraded=true. Initiating Premium Update...");
          const now = new Date();
          const nextMonth = new Date();
          nextMonth.setMonth(now.getMonth() + 1);
          
          console.log("Executing Supabase Upsert for user:", user.id);
          const { error } = await supabase.from('subscriptions').upsert({
            user_id: user.id,
            type: 'premium',
            is_active: true,
            start_date: now.toISOString(),
            end_date: nextMonth.toISOString(),
            updated_at: now.toISOString()
          }, { onConflict: 'user_id' });
          
          if (error) {
            console.error("Supabase Upsert Error:", error);
          } else {
            console.log("Supabase Upsert Success! Subscription is now Premium.");
          }
          
          // Clean up the URL to prevent re-triggering on refresh
          searchParams.delete('upgraded');
          setSearchParams(searchParams, { replace: true });
        }

        const [profileRes, subRes] = await Promise.all([
          supabase.from('profiles').select('name, profile_image_url').eq('user_id', user.id).single(),
          supabase.from('subscriptions').select('type, start_date, end_date, is_active').eq('user_id', user.id).single()
        ]);
        
        if (profileRes.data) {
          setProfileData(profileRes.data);
        }
        if (subRes.data) {
          setSubscriptionData(subRes.data);
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user, searchParams, setSearchParams]);

  const handleUpgrade = () => {
    console.log("Upgrade button clicked");
    setCheckoutError('');
    setIsRedirecting(true);
    
    // Redirect to Stripe Payment Link
    const paymentLink = import.meta.env.VITE_STRIPE_PAYMENT_LINK;
    console.log("Payment link from env:", paymentLink);
    
    if (!paymentLink) {
      setCheckoutError("Stripe Payment Link is missing. Please add VITE_STRIPE_PAYMENT_LINK to your .env file.");
      setIsRedirecting(false);
      return;
    }
    
    try {
      // Optional: Pass the user ID as a client_reference_id for webhooks, or email for prefill
      const url = new URL(paymentLink.trim());
      if (user?.email) {
        url.searchParams.append('prefilled_email', user.email);
      }
      if (user?.id) {
        url.searchParams.append('client_reference_id', user.id);
      }
      
      console.log("Redirecting to URL:", url.toString());
      localStorage.setItem('pending_premium_upgrade', 'true');
      window.location.href = url.toString();
    } catch (err) {
      console.error("Error creating redirect URL:", err);
      setCheckoutError("The configured payment link is invalid.");
      setIsRedirecting(false);
    }
  };

  if (loading) return <div className="loading">טוען פרופיל...</div>;

  const displayName = profileData?.name || user?.user_metadata?.full_name || user?.email;
  const initial = displayName ? displayName.charAt(0).toUpperCase() : 'U';
  const isPremium = subscriptionData?.type === 'premium' && subscriptionData?.is_active;

  return (
    <div className="profile-page">
      <h2 className="profile-page-title">הפרופיל שלי</h2>
      <div className="profile-card">
        <div className="profile-header">
          {profileData?.profile_image_url ? (
            <img src={profileData.profile_image_url} alt="Profile" className="profile-avatar-img" />
          ) : (
            <div className="profile-avatar">{initial}</div>
          )}
          <div className="profile-info">
            <h3 className="profile-name">{displayName}</h3>
            <p className="profile-email">{user?.email}</p>
          </div>
        </div>

        <div className="subscription-section">
          <h4 className="subscription-title">מצב מנוי</h4>
          
          {isPremium ? (
            <div className="premium-status">
              <div className="premium-badge">
                <span className="material-symbols-outlined">stars</span>
                Premium Member
              </div>
              {subscriptionData?.start_date && (
                <p className="subscription-date">תחילת מנוי: {new Date(subscriptionData.start_date).toLocaleDateString('he-IL')}</p>
              )}
              {subscriptionData?.end_date && (
                <p className="subscription-date">סיום מנוי: {new Date(subscriptionData.end_date).toLocaleDateString('he-IL')}</p>
              )}
            </div>
          ) : (
            <div className="free-status">
              <span className="free-badge">חינמי</span>
              <p className="upgrade-prompt">שדרגו לפרימיום כדי לקבל גישה מלאה לכל הפיצ'רים המיוחדים שלנו.</p>
              
              {checkoutError && <div className="checkout-error">{checkoutError}</div>}
              
              <button className="upgrade-btn" onClick={handleUpgrade} disabled={isRedirecting}>
                {isRedirecting ? 'מעביר לתשלום...' : 'שדרוג לפרימיום'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
