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
  supabaseUrl: 'https://dlqpdnhelisfxkpdkymv.supabase.co',
  supabaseAnonKey: 'sb_publishable_GRCKDMtdPwfsvg73iZHiCA_CL0xLg9v',

  // EmailJS -> Account -> General (public key), Email Services, Email Templates
  // One template is used for every message. See README "EmailJS".
  emailjs: {
    publicKey: '',
    serviceId: '',
    templateId: ''
  },

  owner: {
    name: 'Ritesh Farswan',
    email: 'studio@riteshfarswan.com',
    phone: '+91 98200 41736',
    instagram: 'riteshfarswan.photo',
    city: 'Mumbai'
  },

  // Public addresses, used inside emails. Use your real domains once deployed.
  siteUrl: 'https://riteshfarswan.com/',
  clientPortalUrl: 'https://riteshfarswan.com/client/',
  studioUrl: 'https://studio.riteshfarswan.com/',

  storage: {
    portfolioBucket: 'portfolio',
    galleryBucket: 'client-galleries'
  },

  galleryDefaultDays: 90,
  currency: 'INR'
};

