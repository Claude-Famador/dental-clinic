<template>
  <div class="dashboard">
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>Profile Settings</h1>
      </header>
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading your profile...</p>
      </div>
      <div v-else class="profile-card">
        <form @submit.prevent="updateProfile" class="space-y-4">
          <div class="form-group">
            <label for="name" class="block text-sm font-medium text-gray-700">Full Name <span class="required">*</span></label>
            <input
              type="text"
              id="name"
              v-model="profile.full_name"
              class="form-input"
              :class="{ 'error': errors.full_name }"
              required
              @blur="validateField('full_name')"
            />
            <span v-if="errors.full_name" class="error-message">{{ errors.full_name }}</span>
            <span class="helper-text">Enter your full name as it appears on official documents</span>
          </div>

          <div class="form-group">
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              v-model="profile.email"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              disabled
            />
          </div>

          <div class="form-group">
            <label for="phone" class="block text-sm font-medium text-gray-700">Phone Number <span class="required">*</span></label>
            <input
              type="tel"
              id="phone"
              v-model="profile.phone"
              class="form-input"
              :class="{ 'error': errors.phone }"
              required
              pattern="[0-9]{10}"
              @blur="validateField('phone')"
            />
            <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
            <span class="helper-text">Enter a valid 10-digit phone number</span>
          </div>

          <div class="form-group">
            <label for="address" class="block text-sm font-medium text-gray-700">Address <span class="required">*</span></label>
            <textarea
              id="address"
              v-model="profile.address"
              rows="3"
              class="form-input"
              :class="{ 'error': errors.address }"
              required
              @blur="validateField('address')"
            ></textarea>
            <span v-if="errors.address" class="error-message">{{ errors.address }}</span>
            <span class="helper-text">Enter your complete mailing address</span>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              type="submit"
              class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              :disabled="loading"
            >
              Save Changes
            </button>
          </div>
        </form>

        <div v-if="message" :class="['mt-4 p-4 rounded', messageClass]">
          {{ message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabaseClient'

interface Profile {
  id: string
  full_name: string
  email: string
  phone: string
  address: string
}

const profile = ref<Profile>({
  id: '',
  full_name: '',
  email: '',
  phone: '',
  address: ''
})

const loading = ref(false)
const message = ref('')
const messageClass = ref('')
const errors = ref({
  full_name: '',
  phone: '',
  address: ''
})

const validateField = (field: keyof typeof errors.value) => {
  errors.value[field] = ''
  
  switch (field) {
    case 'full_name':
      if (!profile.value.full_name) {
        errors.value.full_name = 'Full name is required'
      } else if (profile.value.full_name.length < 2) {
        errors.value.full_name = 'Full name must be at least 2 characters long'
      }
      break
    
    case 'phone':
      if (!profile.value.phone) {
        errors.value.phone = 'Phone number is required'
      } else if (!/^[0-9]{10}$/.test(profile.value.phone)) {
        errors.value.phone = 'Please enter a valid 10-digit phone number'
      }
      break
    
    case 'address':
      if (!profile.value.address) {
        errors.value.address = 'Address is required'
      } else if (profile.value.address.length < 10) {
        errors.value.address = 'Please enter a complete address'
      }
      break
  }
}

async function getProfile() {
  try {
    loading.value = true
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('No user found')

    const { data, error } = await supabase
      .from('profiles')
      .select()
      .eq('id', user.id)
      .single()

    if (error) throw error

    if (data) {
      profile.value = {
        id: data.id,
        full_name: data.full_name || '',
        email: user.email || '',
        phone: data.phone || '',
        address: data.address || ''
      }
    }
  } catch (error) {
    console.error('Error loading user profile:', error)
    showMessage('Error loading profile', true)
  } finally {
    loading.value = false
  }
}

async function updateProfile() {
  try {
    loading.value = true
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('No user found')

    const updates = {
      id: user.id,
      full_name: profile.value.full_name,
      phone: profile.value.phone,
      address: profile.value.address,
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('profiles')
      .upsert(updates)

    if (error) throw error
    showMessage('Profile updated successfully')
  } catch (error) {
    console.error('Error updating profile:', error)
    showMessage('Error updating profile', true)
  } finally {
    loading.value = false
  }
}

function showMessage(text: string, isError = false) {
  message.value = text
  messageClass.value = isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

onMounted(() => {
  getProfile()
})
</script>

<style scoped>
.profile-settings {
  padding: 2rem;
  background-color: #f8fafc;
  min-height: 100vh;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
  text-align: center;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #64748b;
  font-size: 1.1rem;
}

.loading-state {
  text-align: center;
  padding: 2rem;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.profile-form-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.form-section h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: #475569;
  margin-bottom: 0.5rem;
}

.required {
  color: #dc2626;
  margin-left: 0.25rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.error {
  border-color: #dc2626;
}

.form-input.disabled {
  background-color: #f8fafc;
  cursor: not-allowed;
}

.helper-text {
  display: block;
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.5rem;
}

.error-message {
  display: block;
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
  border: none;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: #e2e8f0;
  color: #475569;
  border: none;
}
.dashboard {
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  flex: 1;
  overflow-y: auto;
  height: 100%;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  color: #2c3e50;
  font-size: 2rem;
  margin: 0;
}

.profile-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-bottom: 2rem;
  overflow-y: auto;
  max-height: calc(100vh - 8rem);
}

.form-group {
  margin-bottom: 1.5rem;
}
</style>