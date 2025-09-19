// Improved mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');
const body = document.body;

menuToggle.addEventListener('click', function() {
  this.classList.toggle('active');
  navMenu.classList.toggle('active');
  
  // Prevent background scrolling when menu is open
  if (navMenu.classList.contains('active')) {
    body.style.overflow = 'hidden';
  } else {
    body.style.overflow = 'auto';
  }
});

// Close menu when clicking outside
document.addEventListener('click', function(e) {
  if (navMenu.classList.contains('active') && 
      !e.target.closest('#navMenu') && 
      !e.target.closest('#menuToggle')) {
    menuToggle.classList.remove('active');
    navMenu.classList.remove('active');
    body.style.overflow = 'auto';
  }
});

    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('#navMenu a');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        // Prevent default anchor behavior
        e.preventDefault();
        
        // Get the target section
        const targetId = link.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          // Calculate position with header offset
          const headerOffset = 100;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          // Smooth scroll to section
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
        
        // Close mobile menu
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });

    // Header scroll effect
    const header = document.getElementById('header');
    window.addEventListener('scroll', function() {
      if (window.scrollY > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });

    // Back to top button
    const backToTopBtn = document.getElementById('backToTop');
    window.addEventListener('scroll', function() {
      if (window.scrollY > 500) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    });
    
    backToTopBtn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    // Animation on scroll - triggers every time element enters viewport
    function animateOnScroll() {
      const elements = document.querySelectorAll('.animate-on-scroll, .stagger-item');
      
      elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        const elementVisible = 10;
        
        // Check if element is in viewport
        if (elementTop < window.innerHeight - elementVisible && elementBottom > elementVisible) {
          element.classList.add('animated');
        } else {
          // Remove the class when element leaves viewport to allow re-animation
          element.classList.remove('animated');
        }
      });
    }

    // Initial call and event listener for animations
    animateOnScroll();
    window.addEventListener('scroll', animateOnScroll);

    // Hero button scroll to reservation
    const heroBtn = document.querySelector('.hero .btn');
    if (heroBtn) {
      heroBtn.addEventListener('click', () => {
        const targetElement = document.getElementById('reservation');
        if (targetElement) {
          const headerOffset = 100;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      });
    }

    
// Form validation and submission
const reservationForm = document.querySelector('.reservation form');
if (reservationForm) {
  // Add form validation to all inputs, selects, and textareas
  const inputs = reservationForm.querySelectorAll('input, select, textarea');
  
  inputs.forEach(input => {
    input.addEventListener('blur', function() {
      validateField(this);
    });
    
    input.addEventListener('input', function() {
      clearError(this);
    });
  });
  
  reservationForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Validate all fields
    let isValid = true;
    inputs.forEach(input => {
      if (!validateField(input)) {
        isValid = false;
      }
    });
    
    if (!isValid) {
      showNotification('Please correct the errors in the form.', 'error');
      return;
    }
    
    // Prepare form data
    const formData = new FormData(this);
    const data = {
      name: formData.get('name') || this.querySelector('input[placeholder="Full Name"]').value,
      email: formData.get('email') || this.querySelector('input[placeholder="Email Address"]').value,
      phone: formData.get('phone') || this.querySelector('input[placeholder="Phone Number"]').value,
      date: formData.get('date') || this.querySelector('input[type="date"]').value,
      time: formData.get('time') || this.querySelector('input[type="time"]').value,
      guests: formData.get('guests') || this.querySelector('select').value,
      requests: formData.get('requests') || this.querySelector('textarea').value
    };
    
    try {
      // Show loading state
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Processing...';
      submitBtn.disabled = true;
      
    // For local development
const response = await fetch('http://localhost:3001/api/reservations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data)
});
      
      if (response.ok) {
        // Show success message
        showReservationConfirmation(data);
        this.reset();
      } else {
        throw new Error('Server error: ' + response.status);
      }
      
      // Restore button state
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      
    } catch (error) {
      console.error('Error:', error);
      showNotification('Sorry, there was an error processing your reservation. Please try again later.', 'error');
      
      // Restore button state
      const submitBtn = this.querySelector('button[type="submit"]');
      submitBtn.textContent = 'Reserve Now';
      submitBtn.disabled = false;
    }
  });
}

// Field validation function
function validateField(field) {
  const value = field.value.trim();
  let isValid = true;
  let errorMessage = '';
  
  // Clear previous errors
  clearError(field);
  
  // Required field validation
  if (field.hasAttribute('required') && !value) {
    isValid = false;
    errorMessage = 'This field is required';
  }
  
  // Email validation
  if (field.type === 'email' && value) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) {
      isValid = false;
      errorMessage = 'Please enter a valid email address';
    }
  }
  
  // Phone validation
if ((field.type === 'tel' || field.getAttribute('data-field-type') === 'phone') && value) {
  const phonePattern = /^[+]?[\d\s\-\(\)]{10,}$/;
  if (!phonePattern.test(value)) {
    isValid = false;
    errorMessage = 'Please enter a valid phone number';
  }
}
  
  // Date validation (cannot be in the past)
  if (field.type === 'date' && value) {
    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      isValid = false;
      errorMessage = 'Please select a future date';
    }
  }
  
  // Time validation (within business hours)
  if (field.type === 'time' && value) {
    const time = value.split(':');
    const hours = parseInt(time[0]);
    
    // Assuming business hours are 5 PM to 11 PM (17:00 to 23:00)
    if (hours < 17 || hours > 22) { // Allow reservations until 10 PM for 1-hour dining
      isValid = false;
      errorMessage = 'Reservations are available between 5 PM and 10 PM';
    }
  }
  
  // Show error if invalid
  if (!isValid) {
    showError(field, errorMessage);
  }
  
  return isValid;
}

// Show error message
function showError(field, message) {
  // Create error element
  const error = document.createElement('div');
  error.className = 'error-message';
  error.textContent = message;
  
  // Add error class to field
  field.classList.add('error');
  
  // Insert error message after field (works with your grid layout)
  field.parentNode.appendChild(error);
}

// Clear error message
function clearError(field) {
  // Remove error class
  field.classList.remove('error');
  
  // Remove error message
  const error = field.parentNode.querySelector('.error-message');
  if (error) {
    error.remove();
  }
}

// Show notification
function showNotification(message, type = 'success') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
      <span>${message}</span>
    </div>
  `;
  
  // Add to body
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Remove after delay
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 5000);
}

// Show reservation confirmation modal
function showReservationConfirmation(data) {
  // Create modal element
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-modal">&times;</span>
      <div class="modal-icon">
        <i class="fas fa-check-circle"></i>
      </div>
      <h3>Reservation Confirmed!</h3>
      <p>Thank you for your reservation. We've sent a confirmation to your email.</p>
      <div class="reservation-details">
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Date:</strong> ${new Date(data.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${data.time}</p>
        <p><strong>Guests:</strong> ${data.guests}</p>
        ${data.requests ? `<p><strong>Special Requests:</strong> ${data.requests}</p>` : ''}
      </div>
      <button class="btn modal-close-btn">Close</button>
    </div>
  `;
  
  // Add to body
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
  
  // Show modal
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);
  
  // Close modal handlers
  const closeModal = () => {
    modal.classList.remove('show');
    setTimeout(() => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
      document.body.style.overflow = 'auto';
    }, 300);
  };
  
  modal.querySelector('.close-modal').addEventListener('click', closeModal);
  modal.querySelector('.modal-close-btn').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
}