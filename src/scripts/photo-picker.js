const uploadButton = document.getElementById('image-upload-button');
const uploadInput = document.getElementById('image-upload');
const headshotData = document.getElementById('headshot-data');
const headshot = document.getElementById('headshot');

uploadButton.addEventListener('click', function() {
  uploadInput.click();
});

uploadInput.addEventListener('change', function(e) {
  if (e.target.files && e.target.files[0]) {
    const reader = new FileReader();
    reader.onload = function(readerEvent) {
      headshot.onload = function(imageEvent) {
        // resize into a canvas incase it is large
        const canvas = new OffscreenCanvas(headshot.width * 2, headshot.height * 2);
        const context = canvas.getContext('2d');
        context.drawImage(headshot, 0, 0, canvas.width, canvas.height); 
         canvas.convertToBlob({ type: 'image/png', quality: 0.9 })
          .then(blob => {
              const reader = new FileReader();
              reader.onloadend = function() {
                  // store as a data url for uploading in the form
                  headshotData.value = reader.result;
              };
              reader.readAsDataURL(blob);
          });
      };
      // load image into letter so user can see it
      headshot.src = readerEvent.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);
  }
});