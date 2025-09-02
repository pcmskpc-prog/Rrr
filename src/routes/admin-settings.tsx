// Admin Settings Save Script
export const adminSettingsScript = `
<script>
  // Handle hero slides
  let slidesData = [];
  
  function collectSlides() {
    slidesData = [];
    const slideElements = document.querySelectorAll('[data-slide-id]');
    
    slideElements.forEach(elem => {
      const slideId = elem.dataset.slideId;
      const imageUrl = document.querySelector(\`input[name="slide_url_\${slideId}"]\`)?.value;
      const title = document.querySelector(\`input[name="slide_title_\${slideId}"]\`)?.value || '';
      const description = document.querySelector(\`input[name="slide_description_\${slideId}"]\`)?.value || '';
      const link = document.querySelector(\`input[name="slide_link_\${slideId}"]\`)?.value || '/';
      
      if (imageUrl) {
        slidesData.push({
          image_url: imageUrl,
          title: title,
          description: description,
          link: link
        });
      }
    });
  }
  
  function addHeroSlide() {
    const container = document.getElementById('hero-slides-container');
    const slideId = 'new-' + Date.now();
    const slideHtml = \`
      <div class="border rounded-lg p-4" data-slide-id="\${slideId}">
        <div class="flex justify-between items-start mb-4">
          <h3 class="font-medium">New Hero Image</h3>
          <button type="button" onclick="removeSlideElement(this)" class="text-red-500">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        <input type="url" name="slide_url_\${slideId}" 
               placeholder="Image URL (Required)" 
               class="w-full px-4 py-2 border rounded-lg mb-2">
        <input type="text" name="slide_title_\${slideId}" 
               placeholder="Title (optional)" 
               class="w-full px-4 py-2 border rounded-lg mb-2">
        <input type="text" name="slide_description_\${slideId}" 
               placeholder="Description (optional)" 
               class="w-full px-4 py-2 border rounded-lg mb-2">
        <input type="text" name="slide_link_\${slideId}" 
               placeholder="Link URL (default: /)" 
               class="w-full px-4 py-2 border rounded-lg">
      </div>
    \`;
    container.insertAdjacentHTML('beforeend', slideHtml);
  }
  
  function removeSlideElement(button) {
    button.closest('[data-slide-id]').remove();
  }
  
  async function deleteSlide(slideId) {
    if (!confirm('Are you sure you want to delete this slide?')) return;
    
    try {
      const response = await fetch('/admin/api/slides/' + slideId, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        document.querySelector(\`[data-slide-id="\${slideId}"]\`).remove();
        alert('Slide deleted successfully');
      }
    } catch (error) {
      alert('Error deleting slide');
    }
  }
  
  function changePassword() {
    const newPassword = prompt('Enter new admin password:');
    if (newPassword && newPassword.length >= 6) {
      fetch('/admin/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      }).then(response => {
        if (response.ok) {
          alert('Password changed successfully');
        } else {
          alert('Error changing password');
        }
      });
    } else if (newPassword) {
      alert('Password must be at least 6 characters');
    }
  }
  
  // Form submission
  document.getElementById('settings-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Collect form data
    const formData = new FormData(e.target);
    const settings = {};
    
    // Extract regular settings
    const settingFields = [
      'site_name', 'site_logo', 'phone_number', 'whatsapp_number',
      'email', 'address', 'facebook_url', 'instagram_url',
      'whatsapp_chat_url', 'whatsapp_logo_url', 'primary_color',
      'secondary_color', 'footer_text'
    ];
    
    settingFields.forEach(field => {
      const value = formData.get(field);
      if (value !== null) {
        settings[field] = value;
      }
    });
    
    // Collect slides data
    collectSlides();
    
    // Send to server
    try {
      const response = await fetch('/admin/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: settings,
          slides: slidesData
        })
      });
      
      if (response.ok) {
        alert('Settings saved successfully!');
        setTimeout(() => location.reload(), 1000);
      } else {
        const error = await response.json();
        alert('Error saving settings: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error saving settings: ' + error.message);
    }
  });
  
  // Update color input displays
  document.querySelectorAll('input[type="color"]').forEach(input => {
    input.addEventListener('change', (e) => {
      const display = e.target.parentElement.querySelector('input[type="text"]');
      if (display) {
        display.value = e.target.value;
      }
    });
  });
</script>
`