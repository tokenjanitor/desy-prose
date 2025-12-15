// Compiled to examples/theme-lab.js; edit this TypeScript source.
(() => {
  const controls = document.querySelector('[data-theme-controls]');
  const mode = document.querySelector('#theme-mode');
  const stylesheet = document.querySelector('#shared-theme');
  const status = document.querySelector('#theme-status');

  if (!(controls instanceof HTMLElement) || !(mode instanceof HTMLSelectElement) ||
      !(stylesheet instanceof HTMLLinkElement) || !(status instanceof HTMLElement)) return;
  const descriptions = {
    shared: 'Shared colors and Source fonts are active.',
    default: 'Standalone defaults are active; the shared stylesheet is disabled.',
    overrides: 'The shared theme is active; explicit host overrides take precedence.',
  };
  const update = (): void => {
    const value = mode.value;
    if (value !== 'shared' && value !== 'default' && value !== 'overrides') throw new Error('Unknown theme mode.');
    stylesheet.disabled = value === 'default';
    document.documentElement.dataset.themeMode = value;
    status.textContent = descriptions[value];
  };
  controls.hidden = false;
  mode.addEventListener('change', update);
  update();
})();
