document.addEventListener('DOMContentLoaded', () => {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    document.body.appendChild(tooltip);

    // Show tooltip on mouseover
    document.body.addEventListener('mouseover', (e) => {
        const img = e.target.closest('img[alt]');
        if (img && img.alt) {
            tooltip.textContent = img.alt;
            tooltip.style.display = 'block';
        }
    });

    // Move tooltip with mouse
    document.body.addEventListener('mousemove', (e) => {
        if (tooltip.style.display === 'block') {
            tooltip.style.left = (e.clientX + 12) + 'px';
            tooltip.style.top = (e.clientY + 12) + 'px';
        }
    });

    // Hide tooltip on mouseout
    document.body.addEventListener('mouseout', (e) => {
        const img = e.target.closest('img[alt]');
        if (img) {
            tooltip.style.display = 'none';
        }
    });

    // Prevent default browser tooltip
    document.querySelectorAll('img[alt]').forEach(img => {
        img.addEventListener('mouseenter', () => img.setAttribute('title', ''));
    });
});