import React, { useState, useEffect } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs'
import { FaArrowLeft } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../hooks/useTranslation'
import BackButton from '../components/ui/BackButton'
import { useAppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import { useRef, useCallback } from 'react'
import Select from '../components/ui/Select'
import '../Style/ProfilePage.css'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, userPlan, language, theme, currency, setTheme, setLanguage, setCurrency, updateProfile, token, initialized } = useAppContext()
  const { t } = useTranslation(language)

  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({})
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        phone: user.phone || ''
      })
    }
  }, [user])

  if (!initialized || !token) return null

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleCancel = () => {
    if (user) {
      setForm({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
        phone: user.phone || ''
      })
    }
    setEditMode(false)
  }

  const handleSave = async e => {
    e.preventDefault()
    // Validación de campos obligatorios
    const newErrors = {}
    if (!form.firstName.trim()) newErrors.firstName = t('profile.required')
    if (!form.lastName.trim()) newErrors.lastName = t('profile.required')
    if (!form.email.trim()) newErrors.email = t('profile.required')
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return
    // Guardar cambios en backend
    const ok = await updateProfile({
      first_name: form.firstName,
      last_name: form.lastName,
      email: form.email,
      phone: form.phone
    })
    if (ok) {
      setEditMode(false)
      toast.success(t('profile.profileUpdated'))
    } else {
      setErrors({ api: t('profile.apiError') })
      toast.error(t('profile.profileUpdateError'))
    }
  }

  function ChangePasswordForm() {
    const { language } = useAppContext()
    const { t } = useTranslation(language)
    const [form, setForm] = useState({ current: '', new: '', confirm: '' })
    const [show, setShow] = useState({ current: false, new: false, confirm: false })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    const toggleShow = key => setShow(s => ({ ...s, [key]: !s[key] }))
    const handleSubmit = async e => {
      e.preventDefault()
      setError(null)
      if (!form.current || !form.new || !form.confirm) {
        setError(t('profile.passwordRequired'))
        return
      }
      if (form.new !== form.confirm) {
        setError(t('profile.passwordsDontMatch'))
        return
      }
      setLoading(true)
      try {
        const res = await fetch('http://localhost:8000/auth/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ current_password: form.current, new_password: form.new })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.detail || data.message || 'Error')
        toast.success(t('profile.passwordUpdated'))
        setForm({ current: '', new: '', confirm: '' })
      } catch (err) {
        setError(err.message)
        toast.error(err.message)
      } finally {
        setLoading(false)
      }
    }
    return (
      <form className="profile-password-form" onSubmit={handleSubmit}>
        <h2 className="profile-password-title">{t('profile.changePasswordTitle', 'Cambiar Contraseña')}</h2>
        <p className="profile-password-desc">{t('profile.changePasswordDesc', 'Actualiza tu contraseña para mantener tu cuenta segura')}</p>
        <div className="profile-password-field">
          <label className="profile-password-label">{t('profile.currentPassword', 'Contraseña Actual')}</label>
          <div className="profile-password-input-container">
            <input 
              type={show.current ? 'text' : 'password'} 
              name="current" 
              value={form.current} 
              onChange={handleChange} 
              className="profile-password-input" 
              placeholder={t('profile.currentPasswordPlaceholder', 'Ingresa tu contraseña actual')} 
              autoComplete="current-password" 
            />
            <button type="button" className="profile-password-toggle" tabIndex={-1} onClick={() => toggleShow('current')}>
              <span role="img" aria-label="Mostrar">{show.current ? '🙈' : '👁️'}</span>
            </button>
          </div>
        </div>
        <div className="profile-password-field">
          <label className="profile-password-label">{t('profile.newPassword', 'Nueva Contraseña')}</label>
          <div className="profile-password-input-container">
            <input 
              type={show.new ? 'text' : 'password'} 
              name="new" 
              value={form.new} 
              onChange={handleChange} 
              className="profile-password-input" 
              placeholder={t('profile.newPasswordPlaceholder', 'Ingresa tu nueva contraseña')} 
              autoComplete="new-password" 
            />
            <button type="button" className="profile-password-toggle" tabIndex={-1} onClick={() => toggleShow('new')}>
              <span role="img" aria-label="Mostrar">{show.new ? '🙈' : '👁️'}</span>
            </button>
          </div>
        </div>
        <div className="profile-password-field-last">
          <label className="profile-password-label">{t('profile.confirmNewPassword', 'Confirmar Nueva Contraseña')}</label>
          <div className="profile-password-input-container">
            <input 
              type={show.confirm ? 'text' : 'password'} 
              name="confirm" 
              value={form.confirm} 
              onChange={handleChange} 
              className="profile-password-input" 
              placeholder={t('profile.confirmNewPasswordPlaceholder', 'Confirma tu nueva contraseña')} 
              autoComplete="new-password" 
            />
            <button type="button" className="profile-password-toggle" tabIndex={-1} onClick={() => toggleShow('confirm')}>
              <span role="img" aria-label="Mostrar">{show.confirm ? '🙈' : '👁️'}</span>
            </button>
          </div>
        </div>
        {error && <div className="profile-password-error">{error}</div>}
        <div className="profile-password-button-container">
          <button type="submit" className="profile-password-submit" disabled={loading}>
            {loading ? t('profile.updatingPassword', 'Actualizando...') : t('profile.updatePassword', 'Actualizar Contraseña')}
          </button>
        </div>
      </form>
    )
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <BackButton onClick={() => navigate(-1)} ariaLabel={t('profile.back')} />
        <h1 className='profile-title'>{t('profile.title', 'Perfil y Configuración')}</h1>
      </div>
      <Tabs defaultValue='profile' className='space-y-6'>
        <TabsList className='grid w-full grid-cols-5'>
          <TabsTrigger value='profile'>{t('profile.tabs.profile')}</TabsTrigger>
          <TabsTrigger value='security'>{t('profile.tabs.security')}</TabsTrigger>
          <TabsTrigger value='preferences'>{t('profile.tabs.preferences', 'Preferencias')}</TabsTrigger>
          <TabsTrigger value='notifications'>{t('profile.tabs.notifications')}</TabsTrigger>
          <TabsTrigger value='billing'>{t('profile.tabs.billing')}</TabsTrigger>
                  </TabsList>
          <TabsContent value='profile' className='profile-tab-content'>
            <div className='profile-card'>
              <h2 className='profile-section-title'>{t('profile.personalInfoTitle')}</h2>
              <p className='profile-section-desc'>{t('profile.personalInfoDesc')}</p>
              <div className='flex items-center gap-6 mb-6'>
              </div>
              {!user ? (
                <div className='text-center py-8 text-gray-400'>Cargando...</div>
              ) : (
              <form className='profile-form' onSubmit={handleSave}>
                              <div className='profile-form-grid'>
                  <div>
                    <label className='profile-form-label'>
                      {t('profile.firstName')} <span className='profile-form-required'>*</span>
                    </label>
                    <input
                      name='firstName'
                      type='text'
                    className={`profile-input ${!editMode ? 'profile-input-disabled' : 'profile-input-enabled'} ${errors.firstName ? 'profile-input-error' : ''}`}
                    value={form.firstName || ''}
                    onChange={handleChange}
                    disabled={!editMode}
                  />
                  {errors.firstName && <p className='profile-error-text'>{errors.firstName}</p>}
                </div>
                <div>
                  <label className='profile-form-label'>
                    {t('profile.lastName')} <span className='profile-form-required'>*</span>
                  </label>
                  <input
                    name='lastName'
                    type='text'
                    className={`profile-input ${!editMode ? 'profile-input-disabled' : 'profile-input-enabled'} ${errors.lastName ? 'profile-input-error' : ''}`}
                    value={form.lastName || ''}
                    onChange={handleChange}
                    disabled={!editMode}
                  />
                  {errors.lastName && <p className="profile-error-text">{errors.lastName}</p>}
                </div>
                <div>
                  <label className="profile-form-label">
                    {t('profile.email')} <span className="profile-form-required">*</span>
                  </label>
                  <input 
                    name='email' 
                    type='email' 
                    className={`profile-input profile-input-disabled ${errors.email ? 'profile-input-error' : ''}`}
                    value={form.email || ''} 
                    onChange={handleChange} 
                    disabled 
                  />
                  {errors.email && <p className='profile-error-text'>{errors.email}</p>}
                </div>
                <div>
                  <label className='profile-form-label'>{t('profile.phone')}</label>
                  <input
                    name='phone'
                    type='text'
                    className={`profile-input ${!editMode ? 'profile-input-disabled' : 'profile-input-enabled'}`}
                    value={form.phone || ''}
                    onChange={handleChange}
                    disabled={!editMode}
                  />
                </div>
              </div>
              <div className="profile-button-container">
                {editMode ? (
                  <>
                    <button type="button" className="profile-button-secondary" onClick={handleCancel}>{t('profile.cancel')}</button>
                    <button type="submit" className="profile-button-primary">{t('profile.saveChanges')}</button>
                  </>
                ) : (
                  <button type="button" className="profile-button-edit" onClick={() => setEditMode(true)}>{t('profile.editProfile')}</button>
                )}
              </div>
              {errors.api && <p className="profile-error-text">{errors.api}</p>}
            </form>
            )}
          </div>
        </TabsContent>
        <TabsContent value='security' className='profile-tab-content'>
          <div className='profile-card'>
            <ChangePasswordForm />
          </div>
        </TabsContent>
        <TabsContent value='preferences' className='profile-tab-content'>
          <div className='profile-card'>
            <h2 className='profile-section-title'>{t('profile.tabs.preferences')}</h2>
            <p className='profile-section-desc'>{t('profile.tabs.preferencesContent')}</p>
            <form className='profile-form' onSubmit={e => e.preventDefault()}>
              <div className="w-full">
                <Select
                  label={t('profile.theme')}
                  value={theme}
                  options={[
                    { value: 'light', label: t('profile.light') },
                    { value: 'dark', label: t('profile.dark') }
                  ]}
                  onChange={v => setTheme(v)}
                />
              </div>
              <div className="w-full">
                <Select
                  label={t('profile.language')}
                  value={language}
                  options={[
                    { value: 'es', label: t('app.spanish') },
                    { value: 'en', label: t('app.english') }
                  ]}
                  onChange={v => setLanguage(v)}
                />
              </div>
              <div className="w-full">
                <Select
                  label={t('profile.currency')}
                  value={currency}
                  options={[
                    { value: 'EUR', label: t('profile.euro') },
                    { value: 'USD', label: t('profile.dollar') }
                  ]}
                  onChange={v => setCurrency(v)}
                />
              </div>
              <div className="profile-button-container">
                <button
                  type="button"
                  className="profile-button-primary"
                  onClick={async () => {
                    const ok = await updateProfile({
                      theme,
                      language,
                      currency
                    })
                    if (ok) {
                      toast.success(t('profile.preferencesUpdated', 'Preferencias actualizadas correctamente'))
                    } else {
                      toast.error(t('profile.preferencesUpdateError', 'Error al actualizar preferencias'))
                    }
                  }}
                >
                  {t('profile.savePreferences')}
                </button>
              </div>
            </form>
          </div>
        </TabsContent>
        <TabsContent value='notifications' className='profile-tab-content'>
          <div className='profile-card'>
            <h2 className='profile-section-title'>{t('profile.tabs.notifications', 'Notificaciones')}</h2>
            <p className='profile-section-desc'>{t('profile.tabs.notificationsContent')}</p>
          </div>
        </TabsContent>
        <TabsContent value='billing' className='profile-tab-content'>
          <div className='profile-card'>
            <h2 className='profile-section-title'>{t('profile.tabs.billing', 'Facturación')}</h2>
            <p className='profile-section-desc'>Gestiona tu plan de suscripción y facturación</p>
            
                          <div className='profile-plan-info'>
                <h3 className='profile-plan-title'>Plan Actual</h3>
                <div className='profile-plan-grid'>
                  <div className='profile-plan-row'>
                    <span className='profile-plan-label'>Plan:</span>
                    <span className='profile-plan-value'>
                    {userPlan === 'free' && 'Free'}
                    {userPlan === 'pro' && 'Pro'}
                    {userPlan === 'premium' && 'Premium'}
                  </span>
                </div>
                {user?.billing_period && (
                  <div className='profile-plan-row'>
                    <span className='profile-plan-label'>Facturación:</span>
                    <span className='profile-plan-value'>
                      {user.billing_period === 'monthly' ? 'Mensual' : 'Anual'}
                    </span>
                  </div>
                )}
                {user?.plan_end_date && (
                  <div className='profile-plan-row'>
                    <span className='profile-plan-label'>Próxima renovación:</span>
                    <span className='profile-plan-value'>
                      {new Date(user.plan_end_date).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                )}
                {user?.optimizations_used_today !== undefined && (
                  <div className="profile-plan-row">
                    <span className="profile-plan-label">Optimizaciones hoy:</span>
                    <span className="profile-plan-value">
                      {user.optimizations_used_today}
                      {userPlan === 'free' && ' / 1'}
                      {userPlan === 'pro' && ' / 3'}
                      {userPlan === 'premium' && ' / 10'}
                    </span>
                  </div>
                )}
              </div>
            </div>

                          <div className='profile-features-container'>
                <h3 className='profile-plan-title'>Características del Plan</h3>
                <div className='profile-features-grid'>
                  {userPlan === 'free' && (
                    <>
                      <div className='profile-feature-item'>
                        <svg className='profile-feature-icon' fill='currentColor' viewBox='0 0 20 20'>
                          <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                        </svg>
                        <span className='profile-feature-text'>1 Portfolio</span>
                      </div>
                    </>
                  )}
                                  {userPlan === 'pro' && (
                    <>
                      <div className='profile-feature-item'>
                        <svg className='profile-feature-icon' fill='currentColor' viewBox='0 0 20 20'>
                          <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                        </svg>
                        <span className='profile-feature-text'>Hasta 3 portfolios</span>
                      </div>
                    </>
                  )}
                                  {userPlan === 'premium' && (
                    <>
                      <div className='profile-feature-item'>
                        <svg className='profile-feature-icon' fill='currentColor' viewBox='0 0 20 20'>
                          <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                        </svg>
                        <span className='profile-feature-text'>Portfolios ilimitados</span>
                      </div>
                    </>
                  )}
              </div>
            </div>

            <div className='flex justify-end'>
              <button
                onClick={() => navigate('/change-plan')}
                className='profile-change-plan-button'
              >
                Cambiar Plan
              </button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 