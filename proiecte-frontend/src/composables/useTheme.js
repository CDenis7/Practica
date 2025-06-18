import { ref, watchEffect } from 'vue';

const theme = ref(localStorage.getItem('theme') || 'light');
export function useTheme() {
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
  }
  watchEffect(() => {
    localStorage.setItem('theme', theme.value);

    if (theme.value === 'dark') {
      document.documentElement.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
    }
  });

  return {
    theme,
    toggleTheme
  };
}