<template>
  <div class="medical-history-container">
    <div class="page-header">
      <h2>Medical History</h2>
      <div class="header-buttons">
        <button @click="showAddForm = true" class="add-btn">
          <i class="fas fa-plus"></i>
          Add Medical Record
        </button>
      </div>
    </div>

    <div class="records-list" v-if="medicalRecords.length > 0">
      <div v-for="record in medicalRecords" :key="record.id" class="record-card">
        <div class="record-header">
          <h3>{{ formatDate(record.created_at) }}</h3>
          <span :class="['status', record.status]">{{ record.status }}</span>
        </div>
        <div class="record-details">
          <p><strong>Chief Complaint:</strong> {{ record.chief_complaint }}</p>
          <p><strong>Diagnosis:</strong> {{ record.diagnosis }}</p>
          <p><strong>Treatment Plan:</strong> {{ record.treatment_plan }}</p>
          <p><strong>Notes:</strong> {{ record.notes }}</p>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <i class="fas fa-notes-medical"></i>
      <p>No medical records found</p>
    </div>

    <!-- Add Medical Record Modal -->
    <div v-if="showAddForm" class="modal">
      <div class="modal-content">
        <h3>Add Medical Record</h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>Chief Complaint</label>
            <input 
              v-model="newRecord.chief_complaint" 
              type="text" 
              required 
              placeholder="Enter chief complaint"
            />
          </div>

          <div class="form-group">
            <label>Diagnosis</label>
            <textarea 
              v-model="newRecord.diagnosis" 
              required 
              placeholder="Enter diagnosis"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Treatment Plan</label>
            <textarea 
              v-model="newRecord.treatment_plan" 
              required 
              placeholder="Enter treatment plan"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Notes</label>
            <textarea 
              v-model="newRecord.notes" 
              placeholder="Enter additional notes"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Status</label>
            <select v-model="newRecord.status" required>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div class="modal-actions">
            <button type="button" @click="showAddForm = false">Cancel</button>
            <button type="submit" :disabled="loading">
              {{ loading ? 'Saving...' : 'Save Record' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '../supabaseClient'

interface MedicalRecord {
  id: string
  created_at: string
  chief_complaint: string
  diagnosis: string
  treatment_plan: string
  notes: string
  status: 'active' | 'completed' | 'pending'
  patient_id: string
}

const medicalRecords = ref<MedicalRecord[]>([])
const showAddForm = ref(false)
const loading = ref(false)

const newRecord = ref({
  chief_complaint: '',
  diagnosis: '',
  treatment_plan: '',
  notes: '',
  status: 'active'
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const fetchMedicalRecords = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .eq('patient_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    medicalRecords.value = data
  } catch (error) {
    console.error('Error fetching medical records:', error)
  }
}

const handleSubmit = async () => {
  try {
    loading.value = true
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('medical_records')
      .insert([
        {
          ...newRecord.value,
          patient_id: user.id
        }
      ])

    if (error) throw error

    // Reset form and refresh records
    newRecord.value = {
      chief_complaint: '',
      diagnosis: '',
      treatment_plan: '',
      notes: '',
      status: 'active'
    }
    showAddForm.value = false
    await fetchMedicalRecords()
  } catch (error) {
    console.error('Error adding medical record:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchMedicalRecords()
})
</script>

<style scoped>
.medical-history-container {
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h2 {
  font-size: 1.8rem;
  color: #2c3e50;
  margin: 0;
}

.header-buttons {
  display: flex;
  gap: 1rem;
}

.add-btn {
  background: #0083b0;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  transition: background 0.3s ease;
}

.add-btn:hover {
  background: #006d93;
}

.book-appointment {
  background: #00b300;
}

.book-appointment:hover {
  background: #009900;
}

.records-list {
  display: grid;
  gap: 1.5rem;
}

.record-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.record-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status.active {
  background: #e6f6ff;
  color: #0083b0;
}

.status.completed {
  background: #e6ffe6;
  color: #00b300;
}

.status.pending {
  background: #fff3e6;
  color: #ff9900;
}

.record-details p {
  margin: 0.75rem 0;
  color: #4a5568;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #a0aec0;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h3 {
  margin: 0 0 1.5rem;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #4a5568;
  font-weight: 500;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #0083b0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.modal-actions button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-actions button[type="button"] {
  background: #e2e8f0;
  border: none;
  color: #4a5568;
}

.modal-actions button[type="submit"] {
  background: #0083b0;
  border: none;
  color: white;
}

.modal-actions button[type="button"]:hover {
  background: #cbd5e0;
}

.modal-actions button[type="submit"]:hover {
  background: #006d93;
}

.modal-actions button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .medical-history-container {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .header-buttons {
    width: 100%;
    flex-direction: column;
  }

  .modal-content {
    margin: 1rem;
    padding: 1.5rem;
  }
}
</style>