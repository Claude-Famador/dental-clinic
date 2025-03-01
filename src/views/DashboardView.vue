<template>
  <div class="dashboard-layout">
    <aside class="sidebar">
      <div class="logo">
        <h2>Dental Clinic</h2>
      </div>
      <nav class="nav-menu">
        <router-link to="/dashboard" class="nav-item" exact>
          <i class="fas fa-home"></i>
          Overview
        </router-link>
        <router-link to="/dashboard/appointments" class="nav-item">
          <i class="fas fa-calendar-alt"></i>
          Appointments
        </router-link>
        <router-link to="/dashboard/medical-history" class="nav-item">
          <i class="fas fa-notes-medical"></i>
          Medical History
        </router-link>
        <router-link to="/dashboard/profile" class="nav-item">
          <i class="fas fa-user"></i>
          Profile
        </router-link>
      </nav>
      <div class="logout-section">
        <button @click="handleLogout" class="logout-btn">
          <i class="fas fa-sign-out-alt"></i>
          Logout
        </button>
      </div>
    </aside>

    <main class="main-content">
      <header class="top-bar">
        <div class="welcome-text">
          Welcome, {{ userFullName }}
        </div>
        <div class="quick-actions">
          <button @click="showBooking = true" class="action-btn">
            <i class="fas fa-plus"></i>
            Book Appointment
          </button>
        </div>
      </header>

      <div class="content-area">
        <router-view></router-view>
      </div>
    </main>

    <!-- Book Appointment Modal -->
    <div v-if="showBooking" class="modal">
      <div class="modal-content">
        <h3>Book an Appointment</h3>
        <form @submit.prevent="handleBookAppointment">
          <div class="form-group">
            <label>Preferred Date</label>
            <input 
              type="date" 
              v-model="appointment.date"
              required
              :min="minDate"
            />
          </div>
          <div class="form-group">
            <label>Preferred Time</label>
            <select v-model="appointment.time" required>
              <option value="">Select time</option>
              <option v-for="time in availableTimes" :key="time" :value="time">
                {{ time }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Reason for Visit</label>
            <textarea 
              v-model="appointment.reason"
              required
              placeholder="Please describe your dental concern"
            ></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showBooking = false">Cancel</button>
            <button type="submit" :disabled="loading">
              {{ loading ? 'Booking...' : 'Book Appointment' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/supabaseClient'

const router = useRouter()
const userFullName = ref('')
const showBooking = ref(false)
const loading = ref(false)
const appointment = ref({
  date: '',
  time: '',
  reason: ''
})

const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const availableTimes = [
  '09:00',
  '10:00',
  '11:00',
  '14:00',
  '15:00',
  '16:00'
]

const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push('/login')
}

const handleBookAppointment = async () => {
  try {
    loading.value = true
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('appointments')
      .insert([
        {
          user_id: user.id,
          appointment_date: `${appointment.value.date} ${appointment.value.time}:00`,
          reason: appointment.value.reason,
          status: 'pending'
        }
      ])

    if (error) throw error

    showBooking.value = false
    appointment.value = { date: '', time: '', reason: '' }
    // TODO: Add success notification
  } catch (error: any) {
    console.error('Error booking appointment:', error.message)
    // TODO: Add error notification
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.user_metadata?.full_name) {
    userFullName.value = user.user_metadata.full_name
  }
})
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  min-width: 100vw;
}

.sidebar {
  width: 250px;
  background-color: #2c3e50;
  color: white;
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

.logo {
  margin-bottom: 2rem;
  text-align: center;
}

.nav-menu {
  flex-grow: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: white;
  text-decoration: none;
  margin-bottom: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-item:hover,
.nav-item.router-link-active {
  background-color: #34495e;
}

.nav-item i {
  margin-right: 0.75rem;
}

.main-content {
  flex-grow: 1;
  padding: 1rem;
  background-color: #f5f6fa;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.welcome-text {
  font-size: 1.25rem;
  font-weight: 500;
}

.action-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-btn:hover {
  background-color: #2980b9;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.modal-actions button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.modal-actions button[type="button"] {
  background-color: #e0e0e0;
  border: none;
}

.modal-actions button[type="submit"] {
  background-color: #3498db;
  color: white;
  border: none;
}

.modal-actions button[type="submit"]:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.logout-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.logout-btn:hover {
  background-color: #c0392b;
}
</style>