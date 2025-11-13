// Avatar Preview
  const avatarInput = document.getElementById('avatarInput');
  const profileAvatar = document.getElementById('profileAvatar');

  avatarInput.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        profileAvatar.src = e.target.result;
      }
      reader.readAsDataURL(file);
    }
  });

  // Simple form submit (replace with actual backend logic)
  const profileForm = document.getElementById('profileForm');
  profileForm.addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Profile updated successfully!');
  });