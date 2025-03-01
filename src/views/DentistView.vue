<template>
  <div class="dashboard">
    <div class="dashboard-container">
      <header class="dashboard-header">
        <h1>Dentists</h1>
        <button
          @click="openNewDentistModal"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Add New Dentist
        </button>
      </header>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading dentists...</p>
      </div>

      <div v-else class="dentists-list">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="dentist in dentists" :key="dentist.id" class="dentist-card">
            <div class="p-6">
              <h3 class="text-lg font-medium text-gray-900">{{ dentist.dentist_name }}</h3>
              <p class="mt-2 text-sm text-gray-600">
                Contact: {{ dentist.dentist_contact_no }}
              </p>
              <div class="mt-4 flex justify-end space-x-3">
                <button
                  @click="editDentist(dentist)"
                  class="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  @click="viewSchedule(dentist)"
                  class="text-green-600 hover:text-green-900 text-sm font-medium">
                  View Schedule
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- New/Edit Dentist Modal -->
        <div v-if="showDentistModal" class="modal-backdrop">
          <div class="modal-content">
            <h2 class="text-lg font-medium mb-4">
              {{ editingDentist ? 'Edit Dentist' : 'Add New Dentist' }}
            </h2>
            <form @submit.prevent="saveDentist" class="space-y-4">
              <div class="form-group">
                <label for="name" class="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  id="name"
                  v-model="dentistForm.dentist_name"
                  class="form-input"
                  required
                />
              </div>

              <div class="form-group">
                <label for="contact" class="block text-sm font-medium text-gray-700">Contact Number</label>
                <input
                  type="tel"
                  id="contact"
                  v-model="dentistForm.dentist_contact_no"
                  class="form-input"
                  required
                  pattern="[0-9]{10}"
                />
              </div>

              <div class="modal-actions">
                <button
                  type="button"
                  @click="closeDentistModal"
                  class="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" class="btn-primary" :disabled="loading">
                  {{ editingDentist ? 'Save Changes' : 'Add Dentist' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '../supabaseClient'

interface Dentist {
  id: string
  dentist_name: string
  dentist_contact_no: string
}

const dentists = ref<Dentist[]>([])
const loading = ref(false)
const showDentistModal = ref(false)
const editingDentist = ref<Dentist | null>(null)

const dentistForm = ref({
  dentist_name: '',
  dentist_contact_no: ''
})

async function fetchDentists() {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('dentist')
      .select('*')
      .order('dentist_name')

    if (error) throw error

    dentists.value = data || []
  } catch (error) {
    console.error('Error fetching dentists:', error)
  } finally {
    loading.value = false
  }
}

function openNewDentistModal() {
  editingDentist.value = null
  dentistForm.value = {
    dentist_name: '',
    dentist_contact_no: ''
  }
  showDentistModal.value = true
}

function editDentist(dentist: Dentist) {
  editingDentist.value = dentist
  dentistForm.value = {
    dentist_name: dentist.dentist_name,
    dentist_contact_no: dentist.dentist_contact_no
  }
  showDentistModal.value = true
}

function closeDentistModal() {
  showDentistModal.value = false
  editingDentist.value = null
}

async function saveDentist() {
  try {
    loading.value = true

    if (editingDentist.value) {
      const { error } = await supabase
        .from('dentist')
        .update(dentistForm.value)
        .eq('id', editingDentist.value.id)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('dentist')
        .insert([dentistForm.value])

      if (error) throw error
    }

    await fetchDentists()
    closeDentistModal()
  } catch (error) {
    console.error('Error saving dentist:', error)
  } finally {
    loading.value = false
  }
}

function viewSchedule(dentist: Dentist) {
  // Implement view schedule functionality
  console.log('View schedule for dentist:', dentist)
}

onMounted(() => {
  fetchDentists()
})
</script>

<style scoped>
.dentist-card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.dentist-card:hover {
  transform: translateY(-2px);
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  width: 100%;
  max-width: 32rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-primary {
  background-color: #4f46e5;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #4338ca;
}

.btn-secondary {
  background-color: #e5e7eb;
  color: #374151;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-secondary:hover {
  background-color: #d1d5db;
}

.form-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}
</style>