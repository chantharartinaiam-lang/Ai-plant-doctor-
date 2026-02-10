document.addEventListener('DOMContentLoaded', function() {
  // Ensure there's a container for the app
  let appContainer = document.getElementById('ai-plant-doctor-app');
  if (!appContainer) {
    appContainer = document.createElement('div');
    appContainer.id = 'ai-plant-doctor-app';
    document.body.insertBefore(appContainer, document.body.firstChild);
  }

  // Create upload form if it doesn't exist
  const existingForm = document.getElementById('apd-upload-form');
  if (!existingForm) {
    const form = document.createElement('div');
    form.id = 'apd-upload-form';
    form.innerHTML = `
      <h2>Upload an image of your plant</h2>
      <input type="file" id="apd-file-input" accept="image/*" />
      <div id="apd-preview" style="margin-top:12px"></div>
      <button id="apd-submit" class="button" style="margin-top:10px">Analyze</button>
      <div id="apd-result" style="margin-top:14px"></div>
    `;
    appContainer.appendChild(form);
  }

  const fileInput = document.getElementById('apd-file-input');
  const preview = document.getElementById('apd-preview');
  const submitBtn = document.getElementById('apd-submit');
  const resultBox = document.getElementById('apd-result');

  function clearResult() {
    resultBox.innerHTML = '';
  }

  function showPreview(file) {
    preview.innerHTML = '';
    const img = document.createElement('img');
    img.style.maxWidth = '320px';
    img.style.borderRadius = '8px';
    img.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)';

    const reader = new FileReader();
    reader.onload = function(e) {
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
    preview.appendChild(img);
  }

  fileInput.addEventListener('change', function(e) {
    clearResult();
    const files = e.target.files;
    if (files && files[0]) showPreview(files[0]);
  });

  submitBtn.addEventListener('click', function() {
    clearResult();
    const files = fileInput.files;
    if (!files || !files[0]) {
      resultBox.innerText = 'Please select an image file first.';
      return;
    }

    const file = files[0];
    const formData = new FormData();
    formData.append('image', file);

    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerText = 'Analyzing...';

    // Replace this URL with your backend diagnose endpoint when ready
    const API_URL = '/api/diagnose';

    fetch(API_URL, {
      method: 'POST',
      body: formData
    })
    .then(async response => {
      submitBtn.disabled = false;
      submitBtn.innerText = 'Analyze';
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Server error');
      }
      return response.json();
    })
    .then(data => {
      // Expected shape: { label: 'blight', confidence: 0.92, advice: '...' }
      const label = data.label || data.prediction || 'Unknown';
      const confidence = typeof data.confidence === 'number' ? (data.confidence * 100).toFixed(1) + '%' : '';
      const advice = data.advice || data.recommendation || '';

      resultBox.innerHTML = `\
        <div class="card">\
          <h3>Diagnosis: ${label}</h3>\
          <p><strong>Confidence:</strong> ${confidence}</p>\
          <p>${advice}</p>\
        </div>`;
    })
    .catch(err => {
      resultBox.innerText = 'Analysis failed: ' + err.message;
      submitBtn.disabled = false;
      submitBtn.innerText = 'Analyze';
      console.error(err);
    });
  });
});
