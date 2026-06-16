// Função para carregar componentes
async function loadComponent(id, url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Erro ao carregar ${url}`);
        const html = await response.text();
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
        return html;
    } catch (error) {
        console.error('Erro no componente:', error);
    }
}

// Função para carregar dados JSON
async function loadData(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erro ao carregar ${url}`);
    return await response.json();
}

// Funções de renderização (mesmas de antes)
function renderServicos(servicos, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = servicos.map(s => `
        <div class="card">
            <div class="icone">${s.icone || '🔬'}</div>
            <h3>${s.titulo}</h3>
            <p>${s.descricao}</p>
        </div>
    `).join('');
}

function renderRecursos(recursos, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = recursos.map(r => `
        <div class="card">
            <h3>${r.titulo}</h3>
            <p>${r.descricao}</p>
            <a href="${r.link}" target="_blank" class="btn-primary" style="margin-top:1rem; display:inline-block;">Acessar</a>
        </div>
    `).join('');
}

function renderDestaques(destaques, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = destaques.map(d => `
        <div class="card">
            <h3>${d.titulo}</h3>
            <p>${d.descricao}</p>
        </div>
    `).join('');
}

function renderSobre(sobre, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `
        <h2>${sobre.titulo}</h2>
        <p>${sobre.texto}</p>
        <h3>Missão</h3>
        <p>${sobre.missao}</p>
        <h3>Visão</h3>
        <p>${sobre.visao}</p>
    `;
}

function renderContato(contato, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `
        <div class="contato-info">
            <p><i class="fas fa-envelope"></i> <strong>Email:</strong> <a href="mailto:${contato.email}">${contato.email}</a></p>
            <p><i class="fas fa-phone"></i> <strong>Telefone:</strong> ${contato.telefone}</p>
            <p><i class="fas fa-map-marker-alt"></i> <strong>Endereço:</strong> ${contato.endereco}</p>
        </div>
    `;
}

// Navegação SPA
function navigateTo(sectionId) {
    // Esconder todas as seções
    document.querySelectorAll('.secao').forEach(sec => sec.classList.remove('active'));
    // Mostrar a seção alvo
    const target = document.getElementById(sectionId);
    if (target) target.classList.add('active');
    // Atualizar links ativos
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
        }
    });
    // Atualizar hash sem rolar
    if (history.pushState) {
        history.pushState(null, null, `#${sectionId}`);
    }
    // Fechar menu mobile
    document.querySelector('.main-nav')?.classList.remove('open');
}

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
    // Carregar componentes header e footer
    await Promise.all([
        loadComponent('header', 'components/header.html'),
        loadComponent('footer', 'components/footer.html')
    ]);

    // Carregar todas as seções (paralelo)
    const secoes = ['inicio', 'sobre', 'servicos', 'recursos', 'contato'];
    await Promise.all(secoes.map(sec => 
        loadComponent('content', `components/secao-${sec}.html`, true) // true para append?
    ));

    // Na verdade, precisamos carregar cada seção em um container único? Melhor: carregar cada seção dentro de #content como um todo?
    // Vou modificar: carregar todas as seções de uma vez em #content
    // Melhor: carregar o HTML de todas as seções concatenadas
    const secoesHtml = await Promise.all(secoes.map(sec => 
        fetch(`components/secao-${sec}.html`).then(r => r.text())
    ));
    document.getElementById('content').innerHTML = secoesHtml.join('');

    // Agora aplicar traduções (já que temos data-i18n nos componentes carregados)
    if (typeof applyTranslations === 'function') {
        applyTranslations();
    }

    // Carregar dados e preencher containers
    try {
        const siteData = await loadData('data/site.json');
        const servicosData = await loadData('data/servicos.json');
        const recursosData = await loadData('data/recursos.json');

        // Preencher cada seção
        renderDestaques(siteData.destaques, 'destaques-container');
        renderSobre(siteData.sobre, 'sobre-container');
        renderServicos(servicosData.servicos, 'servicos-container');
        renderRecursos(recursosData.recursos, 'recursos-container');
        renderContato(siteData, 'contato-container');

        // Preencher footer
        document.getElementById('footer-email').textContent = siteData.email;
        document.getElementById('footer-telefone').textContent = siteData.telefone;

    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }

    // Navegação inicial
    const hash = window.location.hash.replace('#', '') || 'inicio';
    navigateTo(hash);

    // Listeners para links de navegação (delegação)
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (link) {
            e.preventDefault();
            const id = link.getAttribute('href').slice(1);
            navigateTo(id);
        }
    });

    // Menu mobile toggle
    document.querySelector('.menu-toggle')?.addEventListener('click', () => {
        document.querySelector('.main-nav')?.classList.toggle('open');
    });

    // Atualizar navegação ao mudar hash (back/forward)
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace('#', '') || 'inicio';
        navigateTo(hash);
    });
});
