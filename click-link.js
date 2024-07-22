document.querySelectorAll('.neumorphic-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const link = this.querySelector('a').href;
        window.location.href = link;
    });
});