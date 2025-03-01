<template>
  <div class="treatments-view">
    <div class="treatments-header">
      <h2>Treatment History</h2>
      <div class="filters">
        <select v-model="statusFilter">
          <option value="all">All Treatments</option>
          <option value="completed">Completed</option>
          <option value="ongoing">Ongoing</option>
          <option value="scheduled">Scheduled</option>
        </select>
      </div>
    </div>

    <div class="treatments-grid">
      <div v-for="treatment in filteredTreatments" 
           :key="treatment.id" 
           class="treatment-card"
           :class="treatment.status">
        <div class="treatment-header">
          <h3>{{ treatment.treatment_type }}</h3>
          <span class="status-badge">{{ treatment.status }}</span>
        </div>

        <div class="treatment-details">
          <p class="treatment-date">
            <i class="fas fa-calendar"></i>
            {{ formatDate(treatment.date) }}
          </p>
          <p class="treatment-description">
            {{ treatment.description }}
          </p>
          <p class="treatment-cost">
            <strong>Cost:</strong> ${{ treatment.cost }}
          </p>
        </div>

        <div class="treatment-notes" v-if="treatment.notes">
          <h4>Notes:</h4>
          <p>{{ treatment.notes }}</p>
        </div>

        <div class="treatment-actions" v-if="treatment.status === 'scheduled'">
          <button @click="cancelTreatment(treatment.id)" class="cancel-btn">
            Cancel Treatment
          </button>
          <button @click="rescheduleTreatment(treatment)" class="reschedule-btn">
            Reschedule
          </button>
        </div>
      </div>
    </div>

    <!-- No treatments message -->
    <div v-if="filteredTreatments.length === 0" class="no-treatments">
      <i class="fas fa-tooth"></i>
      <p>No treatments found</p>
    </div>

    <!-- Reschedule Modal -->
    <div v-if="showReschedule" class="modal">
      <div class="modal-content">
        <h3>Reschedule Treatment</h3>
        <form @submit.prevent="handleReschedule">
          <div class="form-group">
            <label>New Date</label>
            <input 
              type="date" 
              v-model="rescheduleDate"
              required
              :min="minDate"
            />
          </div>
          <div class="modal-actions">
            <button type="button" @click="showReschedule = false">Cancel</button>
            <button type="submit" :disabled="loading">
              {{ loading ? 'Rescheduling...' : 'Confirm' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'

const treatments = ref([])
const statusFilter = ref('all')
const showReschedule = ref(false)
const loading = ref(false)
const selectedTreatmentId = ref(null)
const rescheduleDate = ref('')

const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const filteredTreatments = computed(() => {
  if (statusFilter.value === 'all') return treatments.value
  return treatments.value.filter(t => t.status === statusFilter.value)
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const fetchTreatments = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data, error } = await supabase
    .from('treatments')
    .select('*')
    .eq('patient_id', user.id)
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching treatments:', error)
    return
  }

  treatments.value = data
}

const cancelTreatment = async (id: string) => {
  const { error } = await supabase
    .from('treatments')
    .update({ status: 'cancelled' })
    .eq('id', id)

  if (error) {
    console.error('Error cancelling treatment:', error)
    return
  }

  await fetchTreatments()
}

const rescheduleTreatment = (treatment: any) => {
  selectedTreatmentId.value = treatment.id
  showReschedule.value = true
}

const handleReschedule = async () => {
  try {
    loading.value = true

    const { error } = await supabase
      .from('treatments')
      .update({ 
        date: rescheduleDate.value,
        status: 'scheduled'
      })
      .eq('id', selectedTreatmentId.value)

    if (error) throw error

    showReschedule.value = false
    rescheduleDate.value = ''
    await fetchTreatments()
  } catch (e: any) {
    console.error('Error rescheduling treatment:', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTreatments()
})
</script>

<style scoped>
.treatments-view {
  padding: 1rem;
}

.treatments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.filters select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.treatments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.treatment-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.treatment-card.completed { border-left: 4px solid #2ecc71; }
.treatment-card.ongoing { border-left: 4px solid #3498db; }
.treatment-card.scheduled { border-left: 4px solid #f39c12; }
.treatment-card.cancelled { border-left: 4px solid #e74c3c; }

.treatment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.status-badge {
  text-transform: capitalize;
  font-size: 0.9rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  background-color: #f5f6fa;
}

.treatment-details {
  margin: 1rem 0;
}

.treatment-date {
  color: #666;
  margin: 0.5rem 0;
}

.treatment-cost {
  color: #2c3e50;
  font-size: 1.1rem;
  margin: 0.5rem 0;
}

.treatment-notes {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.treatment-actions {
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

.no-treatments {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.no-treatments i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* Modal styles inherited from DashboardView */
</style>