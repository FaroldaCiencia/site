// Função para carregar um componente HTML
async function loadComponent(id, url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erro ao carregar ${url}`);
        const html = await response.text();
        document.getElementById(id).innerHTML = html;
    } catch (error) {
        console.error('Erro no componente:', error);
    }
}

// Carregamento paralelo de todos os componentes
document.addEventListener('DOMContentLoaded', () => {
    const components = [
        { id: 'header', url: 'components/header.html' },
        { id: 'footer', url: 'components/footer.html' },
        { id: 'menu', url: 'components/menu.html' }
    ];

    // Promise.all para carregar tudo em paralelo
    Promise.all(components.map(comp => loadComponent(comp.id, comp.url)))
        .then(() => console.log('Componentes carregados com sucesso!'));
});
