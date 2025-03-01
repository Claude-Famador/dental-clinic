<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <i class="fas fa-tooth header-icon"></i>
        <h1>Dental Clinic</h1>
      </div>
      
      <div class="auth-tabs">
        <button 
          :class="['tab-btn', { active: !isSignUp }]" 
          @click="isSignUp = false"
        >
          Login
        </button>
        <button 
          :class="['tab-btn', { active: isSignUp }]" 
          @click="isSignUp = true"
        >
          Sign Up
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <template v-if="isSignUp">
          <div class="form-group">
            <label>Full Name</label>
            <input 
              v-model="fullName" 
              type="text" 
              required 
              placeholder="Enter your full name"
            />
          </div>
        </template>

        <div class="form-group">
          <label>Email</label>
          <input 
            v-model="email" 
            type="email" 
            required 
            placeholder="Enter your email"
          />
        </div>

        <div class="form-group">
          <label>Password</label>
          <input 
            v-model="password" 
            type="password" 
            required 
            placeholder="Enter your password"
          />
        </div>

        <button type="submit" :disabled="loading" class="submit-btn">
          {{ loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Login') }}
        </button>

        <p v-if="error" class="error-message">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabaseClient'

const router = useRouter()
const isSignUp = ref(false)
const fullName = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  try {
    loading.value = true
    error.value = ''

    if (isSignUp.value) {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: {
          data: {
            full_name: fullName.value
          }
        }
      })

      if (signUpError) throw signUpError
      
      // Create a profile entry
      if (data.user) {
        await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              full_name: fullName.value,
              email: email.value
            }
          ])
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value
      })

      if (signInError) throw signInError
    }

    router.push('/dashboard')
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  background: rgba(0, 179, 219, 0.2);
  backdrop-filter: blur(15px);
}

.auth-card {
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.auth-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.header-icon {
  font-size: 3rem;
  color: #0083b0;
  margin-bottom: 1rem;
}

.auth-header h1 {
  font-size: 2rem;
  color: #2c3e50;
  font-weight: 600;
  margin: 0;
}

.auth-tabs {
  display: flex;
  margin: 0 -1rem 2rem;
  border-bottom: 2px solid #eee;
}

.tab-btn {
  flex: 1;
  padding: 1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1.1rem;
  color: #666;
  transition: all 0.3s ease;
}

.tab-btn.active {
  color: #0083b0;
  border-bottom: 3px solid #0083b0;
  margin-bottom: -2px;
  font-weight: 500;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  font-size: 0.95rem;
  color: #4a5568;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input {
  padding: 0.875rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  width: 100%;
  transition: border-color 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #0083b0;
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  background: #0083b0;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
  margin-top: 1.5rem;
}

.submit-btn:hover {
  background: #006d93;
}

.submit-btn:disabled {
  background: #cbd5e0;
  cursor: not-allowed;
}

.error-message {
  color: #e53e3e;
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
  background: #fff5f5;
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid #fed7d7;
}

/* Add smooth transitions */
* {
  transition: all 0.2s ease;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .auth-card {
    padding: 1.5rem;
  }
  
  .auth-header h1 {
    font-size: 1.75rem;
  }
  
  .tab-btn {
    font-size: 1rem;
  }
}
</style>