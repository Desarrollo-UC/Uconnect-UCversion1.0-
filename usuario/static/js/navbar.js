document.addEventListener("DOMContentLoaded", function () {
    const activeLink = localStorage.getItem('activeLink');
    const links = document.querySelectorAll('.menusidebar .nav-link');
  
    if (!activeLink) {
      const inicioLink = document.querySelector('#inicioLink');
      if (inicioLink) {
        inicioLink.classList.add('active');
      }
    }
    if (activeLink) {
      const link = document.querySelector(`.menusidebar .nav-link[href="${activeLink}"]`);
      if (link) {
        link.classList.add('active');
        let parentSubMenu = link.closest('.collapse');
        while (parentSubMenu) {
          parentSubMenu.classList.add('show');
          parentSubMenu = parentSubMenu.parentElement.closest('.collapse');
        }
      }
    }
    links.forEach(link => {
      link.addEventListener('click', function (event) {
        links.forEach(link => {
          link.classList.remove('active');
        });
        this.classList.add('active');
        localStorage.setItem('activeLink', this.getAttribute('href'));
      });
    });
    const toggleLinks = document.querySelectorAll('.toggleLink');

  toggleLinks.forEach(link => {
    link.addEventListener('click', function () {
      const icon = this.querySelector('i.right');
      icon.classList.toggle('fa-angle-right');
      icon.classList.toggle('fa-angle-down');
    });
  });
  });