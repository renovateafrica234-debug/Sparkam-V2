import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Initialize Supabase client (client-side)
const SUPABASE_URL = // https://avlbrhnsjylaaokjofoo.supabase.co
const SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2bGJyaG5zanlsYWFva2pvZm9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMDIwODYsImV4cCI6MjA4ODg3ODA4Nn0.veYbgIVokeEVx_2M0AXAYF50g5IWVdymVFjtLKz5_d8

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth Helper Functions
export const auth = {
  // Sign up new user
  async signup(email, password, artistName, phoneNumber) {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            artist_name: artistName,
            phone_number: phoneNumber
          }
        }
      });

      if (authError) throw authError;

      // Create user profile in database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email,
            artist_name: artistName,
            phone_number: phoneNumber,
            is_beta_tester: true,
            tier: 'essential'
          }
        ])
        .select()
        .single();

      if (userError) throw userError;

      return { success: true, user: authData.user };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error.message };
    }
  },

  // Login existing user
  async login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id);

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  },

  // Logout
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      window.location.href = '/login.html';
    }
  },

  // Get current user
  async getUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  // Check if user is logged in
  async isAuthenticated() {
    const user = await this.getUser();
    return !!user;
  },

  // Get user profile data
  async getUserProfile() {
    const user = await this.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  }
};

// Campaign Helper Functions
export const campaigns = {
  // Save campaign
  async create(campaignData) {
    const user = await auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('campaigns')
      .insert([
        {
          user_id: user.id,
          ...campaignData
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Update user's campaign count
    await supabase.rpc('increment_campaign_count', { user_id: user.id });

    return data;
  },

  // Get user's campaigns
  async list() {
    const user = await auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get specific campaign
  async get(campaignId) {
    const user = await auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data;
  }
};

// Workflow Helper Functions
export const workflows = {
  // Create workflow
  async create(workflowData) {
    const user = await auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('workflows')
      .insert([
        {
          user_id: user.id,
          ...workflowData
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get workflow
  async get(workflowId) {
    const user = await auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('id', workflowId)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return data;
  },

  // Update workflow progress
  async updateProgress(workflowId, updates) {
    const user = await auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('workflows')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', workflowId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Activity Logging
export const activity = {
  async log(action, metadata = {}) {
    const user = await auth.getUser();
    if (!user) return;

    await supabase
      .from('activity_log')
      .insert([
        {
          user_id: user.id,
          action,
          metadata
        }
      ]);
  }
};

// Auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event);
  
  if (event === 'SIGNED_IN') {
    console.log('User signed in:', session.user.email);
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  }
});
                    
