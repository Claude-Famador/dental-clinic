<template>
  <div class="dashboard">
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>My Appointments</h1>
        <div class="filters">
        <select v-model="statusFilter">
          <option value="all">All Appointments</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
    </header>
    <div class="appointments-grid">
      <div v-for="appointment in filteredAppointments" 
           :key="appointment.id" 
           class="appointment-card"
           :class="appointment.status">
        <div class="appointment-header">
          <div class="appointment-date">
            <i class="fas fa-calendar"></i>
            {{ formatDate(appointment.appointment_date) }}
          </div>
          <div class="appointment-status">{{ appointment.status }}</div>
        </div>
        
        <div class="appointment-details">
          <p class="appointment-time">
            <i class="fas fa-clock"></i>
            {{ formatTime(appointment.appointment_date) }}
          </p>
          <p class="appointment-reason">
            <strong>Reason:</strong> {{ appointment.reason }}
          </p>
        </div>

        <div class="appointment-actions">
          <button 
            v-if="appointment.status === 'pending'"
            @click="cancelAppointment(appointment.id)"
            class="cancel-btn"
          >
            Cancel
          </button>
          <button 
            v-if="appointment.status === 'pending'"
            @click="rescheduleAppointment(appointment)"
            class="reschedule-btn"
          >
            Reschedule
          </button>
        </div>
      </div>
    </div>

    <!-- No appointments message -->
    <div v-if="filteredAppointments.length === 0" class="no-appointments">
      <i class="fas fa-calendar-times"></i>
      <p>No appointments found</p>
    </div>

    <!-- Reschedule Modal -->
    <div v-if="showReschedule" class="modal">
      <div class="modal-content">
        <h3>Reschedule Appointment</h3>
        <form @submit.prevent="handleReschedule">
          <div class="form-group">
            <label>New Date</label>
            <input 
              type="date" 
              v-model="rescheduleData.date"
              required
              :min="minDate"
            />
          </div>
          <div class="form-group">
            <label>New Time</label>
            <select v-model="rescheduleData.time" required>
              <option value="">Select time</option>
              <option v-for="time in availableTimes" :key="time" :value="time">
                {{ time }}
              </option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" @click="showReschedule = false">Cancel</button>
            <button type="submit" :disabled="loading">
              {{ loading ? 'Rescheduling...' : 'Confirm Reschedule' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabaseClient'

const appointments = ref([])
const statusFilter = ref('all')
const showReschedule = ref(false)
const loading = ref(false)
const selectedAppointmentId = ref(null)

const rescheduleData = ref({
  date: '',
  time: ''
})

const availableTimes = [
  '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'
]

const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const filteredAppointments = computed(() => {
  if (statusFilter.value === 'all') return appointments.value
  return appointments.value.filter(apt => apt.status === statusFilter.value)
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const fetchAppointments = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('user_id', user.id)
    .order('appointment_date', { ascending: true })

  if (error) {
    console.error('Error fetching appointments:', error)
    return
  }

  appointments.value = data
}

const cancelAppointment = async (id: string) => {
  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', id)

  if (error) {
    console.error('Error cancelling appointment:', error)
    return
  }

  await fetchAppointments()
}

const rescheduleAppointment = (appointment: any) => {
  selectedAppointmentId.value = appointment.id
  showReschedule.value = true
}

const handleReschedule = async () => {
  try {
    loading.value = true
    const newDateTime = `${rescheduleData.value.date} ${rescheduleData.value.time}`

    const { error } = await supabase
      .from('appointments')
      .update({ 
        appointment_date: newDateTime,
        status: 'pending'
      })
      .eq('id', selectedAppointmentId.value)

    if (error) throw error

    showReschedule.value = false
    rescheduleData.value = { date: '', time: '' }
    await fetchAppointments()
  } catch (e: any) {
    console.error('Error rescheduling appointment:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAppointments()
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
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

.appointments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.appointment-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #ddd;
}

.appointment-card.pending { border-left-color: #f39c12; }
.appointment-card.confirmed { border-left-color: #2ecc71; }
.appointment-card.completed { border-left-color: #3498db; }
.appointment-card.cancelled { border-left-color: #e74c3c; }

.appointment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.appointment-date {
  font-size: 1.1rem;
  font-weight: 500;
}

.appointment-status {
  text-transform: capitalize;
  font-size: 0.9rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  background-color: #f5f6fa;
}

.appointment-details {
  margin: 1rem 0;
}

.appointment-time {
  color: #666;
  margin: 0.5rem 0;
}

.appointment-reason {
  margin: 0.5rem 0;
}

.appointment-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.cancel-btn, .reschedule-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  background-color: #e74c3c;
  color: white;
}

.reschedule-btn {
  background-color: #3498db;
  color: white;
}

.no-appointments {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.no-appointments i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* Modal styles inherited from DashboardView */
</style>