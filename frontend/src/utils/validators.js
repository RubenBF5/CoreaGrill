export const validators = {
  isRequired: (value) => {
    return value !== null && value !== undefined && value.toString().trim() !== ''
  },
  
  isEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  },
  
  minLength: (value, min) => {
    return value && value.length >= min
  },
  
  maxLength: (value, max) => {
    return value && value.length <= max
  },
  
  isNumber: (value) => {
    return !isNaN(parseFloat(value)) && isFinite(value)
  },
  
  isPositive: (value) => {
    return parseFloat(value) > 0
  },
  
  validateProduct: (product) => {
    const errors = {}
    
    if (!validators.isRequired(product.name)) {
      errors.name = 'El nombre es requerido'
    }
    
    if (!validators.isNumber(product.price) || !validators.isPositive(product.price)) {
      errors.price = 'El precio debe ser mayor a 0'
    }
    
    if (!validators.isNumber(product.cost) || !validators.isPositive(product.cost)) {
      errors.cost = 'El costo debe ser mayor a 0'
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  },
  
  validateUser: (user) => {
    const errors = {}
    
    if (!validators.isRequired(user.name)) {
      errors.name = 'El nombre es requerido'
    }
    
    if (!validators.isRequired(user.user)) {
      errors.user = 'El usuario es requerido'
    }
    
    if (!validators.minLength(user.pass, 4)) {
      errors.pass = 'La contraseña debe tener al menos 4 caracteres'
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }
}