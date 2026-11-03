/*
  Studio configuration
  --------------------
  Fill in your Supabase and EmailJS keys below. Until supabaseUrl and
  supabaseAnonKey are set, both sites run in demo mode: everything works,
  but data is kept in this browser's localStorage instead of a database.

  This file exists in two places and both copies must match:
    website/assets/js/config.js
    studio/assets/js/config.js
*/
window.SITE_CONFIG = {
  // Supabase -> Project Settings -> API
  supabaseUrl: '',
  supabaseAnonKey: '',

  // EmailJS -> Account -> General (public key), Email Services, Email Templates
  // One template is used for every message. See README "EmailJS".
  emailjs: {
    publicKey: '',
    serviceId: '',
    templateId: ''
  },

  owner: {
    name: 'Aditi Rane',
    email: 'studio@aditirane.com',
    phone: '+91 98200 41736',
    instagram: 'aditirane.photo',
    city: 'Mumbai'
  },

  // Public addresses, used inside emails. Use your real domains once deployed.
  siteUrl: 'https://aditirane.com/',
  clientPortalUrl: 'https://aditirane.com/client/',
  studioUrl: 'https://studio.aditirane.com/',

  storage: {
    portfolioBucket: 'portfolio',
    galleryBucket: 'client-galleries'
  },

  galleryDefaultDays: 90,
  currency: 'INR'
};

