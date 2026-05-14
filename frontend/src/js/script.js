// Dados dos cursos // Provisório
const courses = [
  {
    id: 1,
    title: "Desenvolvimento Web Full Stack",
    description: "Aprenda a criar aplicações web completas do zero",
    image: "https://images.unsplash.com/photo-1556792189-55769c8dfbac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9ncmFtbWluZyUyMGNvZGUlMjBkZXZlbG9wbWVudHxlbnwxfHx8fDE3NzMzMjMwNTR8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 2,
    title: "Gestão de Negócios",
    description: "Desenvolva habilidades de liderança e administração",
    image: "https://images.unsplash.com/photo-1758518732175-5d608ba3abdf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1lZXRpbmclMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzczMzE2MjcxfDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 3,
    title: "Design Gráfico",
    description: "Domine as ferramentas e princípios do design",
    image: "https://images.unsplash.com/photo-1512645592367-97ba8a9d4035?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFwaGljJTIwZGVzaWduJTIwY3JlYXRpdmUlMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzczMzYwODc3fDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 4,
    title: "Ciência de Dados",
    description: "Análise de dados e machine learning na prática",
    image: "https://images.unsplash.com/photo-1666875753105-c63a6f3bdc86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXRhJTIwc2NpZW5jZSUyMGFuYWx5dGljcyUyMGNoYXJ0c3xlbnwxfHx8fDE3NzMzNjA4Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 5,
    title: "Marketing Digital",
    description: "Estratégias modernas de marketing online",
    image: "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwbWFya2V0aW5nJTIwc29jaWFsJTIwbWVkaWF8ZW58MXx8fHwxNzczMjc1MTk3fDA&ixlib=rb-4.1.0&q=80&w=1080"
  },
  {
    id: 6,
    title: "Desenvolvimento Backend",
    description: "Aprenda a programação backend do zero",
    image: "https://images.unsplash.com/photo-1687603921109-46401b201195?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZXJ2ZXIlMjBiYWNrZW5kJTIwZGF0YWJhc2UlMjBwcm9ncmFtbWluZ3xlbnwxfHx8fDE3NzY4ODIwMDJ8MA&ixlib=rb-4.1.0&q=80&w=1080"
  }
];

// Renderizar cursos
function renderCourses() {
  const grid = document.getElementById('coursesGrid');
  if (!grid) return;
  
  grid.innerHTML = courses.map(course => `
    <div class="course-card">
      <img src="${course.image}" alt="${course.title}" class="course-image" loading="lazy" onerror="this.src='https://via.placeholder.com/400x200?text=Imagem+Indisponível'">
      <div class="course-content">
        <h3 class="course-title">${course.title}</h3>
        <p class="course-description">${course.description}</p>
        <button class="btn-outline" data-course="${course.title}">Ver Curso</button>
      </div>
    </div>
  `).join('');
}

// Gerenciamento do tema escuro
function initTheme() {
  // Verificar preferência salva
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  // Criar botão de toggle
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'theme-toggle';
  toggleBtn.setAttribute('aria-label', 'Alternar tema');
  toggleBtn.innerHTML = `
    <svg class="sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
    <svg class="moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: none;">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  `;
  
  function updateIcon() {
    const isDark = document.documentElement.classList.contains('dark');
    const sunIcon = toggleBtn.querySelector('.sun-icon');
    const moonIcon = toggleBtn.querySelector('.moon-icon');
    if (sunIcon && moonIcon) {
      sunIcon.style.display = isDark ? 'none' : 'block';
      moonIcon.style.display = isDark ? 'block' : 'none';
    }
  }
  
  toggleBtn.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateIcon();
  });
  
  updateIcon();
  document.body.appendChild(toggleBtn);
}

// Menu Mobile
function initMobileMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const closeMenu = document.getElementById('closeMenu');
  const mobileMenu = document.getElementById('mobileMenu');
  const overlay = document.getElementById('menuOverlay');
  
  if (!menuToggle || !mobileMenu || !overlay) return;
  
  function openMenu() {
    mobileMenu.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  function closeMenuFunc() {
    mobileMenu.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  menuToggle.addEventListener('click', openMenu);
  if (closeMenu) closeMenu.addEventListener('click', closeMenuFunc);
  overlay.addEventListener('click', closeMenuFunc);
}

// Eventos dos botões
function initButtons() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-primary, .btn-outline, .btn-light, .btn-login, .mobile-login-btn, .mobile-explore-btn');
    if (btn) {
      e.preventDefault();
      const text = btn.innerText || btn.textContent;
      alert(`Funcionalidade "${text}" - Em desenvolvimento!`);
    }
  });
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  renderCourses();
  initMobileMenu();
  initButtons();
  initTheme();
});