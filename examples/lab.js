"use strict";
// Compiled to examples/lab.js; edit this TypeScript source.
(() => {
    const form = document.querySelector('[data-controls]');
    const canvas = document.querySelector('[data-canvas]');
    const nav = document.querySelector('[data-view-nav]');
    if (!(form instanceof HTMLFormElement) || !(canvas instanceof HTMLElement) || !(nav instanceof HTMLElement))
        return;
    const font = form.elements.namedItem('font');
    const paragraphs = form.elements.namedItem('paragraphs');
    const alignment = form.elements.namedItem('alignment');
    const measure = form.elements.namedItem('measure');
    const leading = form.elements.namedItem('leading');
    const size = form.elements.namedItem('size');
    const fluid = form.elements.namedItem('fluid');
    if (!(font instanceof HTMLSelectElement) || !(paragraphs instanceof HTMLSelectElement) ||
        !(alignment instanceof HTMLSelectElement) || !(measure instanceof HTMLInputElement) ||
        !(leading instanceof HTMLInputElement) || !(size instanceof HTMLInputElement) ||
        !(fluid instanceof HTMLInputElement))
        return;
    const specimens = [...canvas.querySelectorAll('[data-specimen]')].filter((element) => element instanceof HTMLElement);
    const tabs = [...nav.querySelectorAll('[data-view]')].filter((element) => element instanceof HTMLButtonElement);
    const disclosure = form.querySelector('[data-controls-disclosure]');
    if (disclosure instanceof HTMLDetailsElement) {
        const compact = matchMedia('(max-width: 55rem)');
        const updateDisclosure = () => { disclosure.open = !compact.matches; };
        updateDisclosure();
        compact.addEventListener('change', updateDisclosure);
    }
    const profiles = {
        serif: "'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', Palatino, serif",
        sans: 'system-ui, sans-serif',
    };
    const setOutput = (name, value) => {
        const output = form.querySelector(`[data-output="${name}"]`);
        if (output instanceof HTMLOutputElement)
            output.value = value;
    };
    const number = (value, maximumFractionDigits = 1) => value.toLocaleString('de-DE', { maximumFractionDigits });
    const metrics = () => {
        const specimen = specimens.find(element => !element.closest('[hidden]'));
        if (!specimen)
            return;
        const style = getComputedStyle(specimen);
        for (const [key, value] of Object.entries({
            size: `${number(parseFloat(style.fontSize))} px`,
            leading: `${number(parseFloat(style.lineHeight))} px`,
            measure: `${number(specimen.getBoundingClientRect().width, 0)} px`,
        })) {
            const output = form.querySelector(`[data-metric="${key}"]`);
            if (output)
                output.textContent = value;
        }
    };
    const update = () => {
        const profile = font.value;
        if (profile !== 'serif' && profile !== 'sans')
            throw new Error('Unknown font profile.');
        canvas.style.setProperty('--prose-font-family', profiles[profile]);
        canvas.style.setProperty('--prose-measure', `${measure.value}ch`);
        canvas.style.setProperty('--prose-line-height', leading.value);
        if (fluid.checked)
            canvas.style.removeProperty('--prose-font-size');
        else
            canvas.style.setProperty('--prose-font-size', `${size.value}rem`);
        size.disabled = fluid.checked;
        for (const specimen of specimens) {
            specimen.dataset.paragraphs = paragraphs.value;
            specimen.dataset.alignment = alignment.value;
        }
        setOutput('measure', `${measure.value} ch`);
        setOutput('leading', Number(leading.value).toLocaleString('de-DE', { minimumFractionDigits: 2 }));
        setOutput('size', fluid.checked ? '1–1,25 rem' : `${number(Number(size.value), 4)} rem`);
        metrics();
    };
    const select = (tab, focus = false) => {
        for (const candidate of tabs) {
            const active = candidate === tab;
            candidate.setAttribute('aria-selected', String(active));
            candidate.tabIndex = active ? 0 : -1;
            const panelId = candidate.getAttribute('aria-controls');
            const panel = panelId ? document.getElementById(panelId) : null;
            if (panel)
                panel.hidden = !active;
        }
        if (focus)
            tab.focus();
        metrics();
    };
    for (const tab of tabs) {
        tab.addEventListener('click', () => select(tab));
        tab.addEventListener('keydown', event => {
            const index = tabs.indexOf(tab);
            const next = event.key === 'ArrowRight' ? (index + 1) % tabs.length
                : event.key === 'ArrowLeft' ? (index + tabs.length - 1) % tabs.length
                    : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : -1;
            const nextTab = next >= 0 ? tabs[next] : undefined;
            if (nextTab) {
                event.preventDefault();
                select(nextTab, true);
            }
        });
    }
    form.addEventListener('input', update);
    form.addEventListener('change', update);
    form.addEventListener('submit', event => event.preventDefault());
    form.addEventListener('reset', () => requestAnimationFrame(update));
    const button = document.querySelector('[data-demo-button]');
    if (button instanceof HTMLButtonElement)
        button.addEventListener('click', () => {
            const active = button.getAttribute('aria-pressed') !== 'true';
            button.setAttribute('aria-pressed', String(active));
            button.textContent = active ? 'Beispiel ist aktiv' : 'Beispiel umschalten';
        });
    form.hidden = false;
    nav.hidden = false;
    update();
    new ResizeObserver(metrics).observe(canvas);
})();
