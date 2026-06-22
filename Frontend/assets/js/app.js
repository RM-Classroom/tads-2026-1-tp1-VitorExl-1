import { api } from "./api.js";

const state = {
    activeView: "home",
    datasets: {
        clientes: [],
        fabricantes: [],
        veiculos: [],
        vendas: [],
        alugueis: []
    }
};

const configs = {
    clientes: {
        title: "Clientes",
        description: "Cadastro, edição, exclusão, busca por ID e filtros por nome, CPF e email.",
        list: () => api.getClientes(),
        getById: (id) => api.getClienteById(id),
        create: (payload) => api.createCliente(payload),
        update: (id, payload) => api.updateCliente(id, payload),
        remove: (id) => api.deleteCliente(id),
        normalize: (item) => ({ id: item.id, nome: item.nome ?? "", cpf: item.cpf ?? "", email: item.email ?? "" }),
        fields: [
            { name: "id", label: "ID", type: "number", readonly: true },
            { name: "nome", label: "Nome", type: "text", required: true },
            { name: "cpf", label: "CPF", type: "text", required: true },
            { name: "email", label: "Email", type: "email", required: true }
        ],
        filters: [
            { name: "nome", label: "Nome contém", type: "text" },
            { name: "cpf", label: "CPF contém", type: "text" },
            { name: "email", label: "Email contém", type: "text" }
        ],
        columns: [
            { key: "id", label: "ID" },
            { key: "nome", label: "Nome" },
            { key: "cpf", label: "CPF" },
            { key: "email", label: "Email" }
        ],
        serialize: (values) => ({ id: toInt(values.id), nome: values.nome.trim(), cpf: values.cpf.trim(), email: values.email.trim() }),
        filterPredicate: (item, filters) => textMatch(item.nome, filters.nome) && textMatch(item.cpf, filters.cpf) && textMatch(item.email, filters.email)
    },
    fabricantes: {
        title: "Fabricantes",
        description: "Cadastro, edição, exclusão, busca por ID e filtros por nome e quantidade de veículos.",
        list: () => api.getFabricantes(),
        getById: (id) => api.getFabricanteById(id),
        create: (payload) => api.createFabricante(payload),
        update: (id, payload) => api.updateFabricante(id, payload),
        remove: (id) => api.deleteFabricante(id),
        normalize: (item) => ({ id: item.id, nome: item.nome ?? "", veiculos: Array.isArray(item.veiculos) ? item.veiculos : [] }),
        fields: [
            { name: "id", label: "ID", type: "number", readonly: true },
            { name: "nome", label: "Nome", type: "text", required: true }
        ],
        filters: [
            { name: "nome", label: "Nome contém", type: "text" },
            { name: "minVeiculos", label: "Mínimo de veículos", type: "number" }
        ],
        columns: [
            { key: "id", label: "ID" },
            { key: "nome", label: "Nome" },
            { key: "veiculosCount", label: "Qtd. veículos" },
            { key: "veiculosResumo", label: "Modelos" }
        ],
        serialize: (values) => ({ id: toInt(values.id), nome: values.nome.trim() }),
        rowValue: (item, key) => {
            if (key === "veiculosCount") return item.veiculos.length;
            if (key === "veiculosResumo") return item.veiculos.length ? item.veiculos.map((veiculo) => veiculo.modelo).join(", ") : "Sem veículos";
            return item[key];
        },
        filterPredicate: (item, filters) => textMatch(item.nome, filters.nome) && numberMin(item.veiculos.length, filters.minVeiculos)
    },
    veiculos: {
        title: "Veículos",
        description: "Cadastro, edição, exclusão, busca por ID e filtros por modelo, fabricante, ano e quilometragem.",
        list: () => api.getVeiculos(),
        getById: (id) => api.getVeiculoById(id),
        create: (payload) => api.createVeiculo(payload),
        update: (id, payload) => api.updateVeiculo(id, payload),
        remove: (id) => api.deleteVeiculo(id),
        normalize: (item) => {
            const fabricante = state.datasets.fabricantes.find((entry) => entry.id === item.fabricanteId);
            return { id: item.id, modelo: item.modelo ?? "", anoFabricacao: item.anoFabricacao, quilometragem: item.quilometragem, fabricanteId: item.fabricanteId, fabricanteNome: fabricante?.nome ?? `Fabricante ${item.fabricanteId}` };
        },
        fields: [
            { name: "id", label: "ID", type: "number", readonly: true },
            { name: "modelo", label: "Modelo", type: "text", required: true },
            { name: "anoFabricacao", label: "Ano de fabricação", type: "number", required: true },
            { name: "quilometragem", label: "Quilometragem", type: "number", required: true, step: "0.01" },
            { name: "fabricanteId", label: "Fabricante", type: "select", required: true, options: () => state.datasets.fabricantes.map((item) => ({ value: item.id, label: `${item.id} - ${item.nome}` })) }
        ],
        filters: [
            { name: "modelo", label: "Modelo contém", type: "text" },
            { name: "fabricanteId", label: "Fabricante", type: "select", options: () => state.datasets.fabricantes.map((item) => ({ value: item.id, label: item.nome })) },
            { name: "anoMin", label: "Ano mínimo", type: "number" },
            { name: "anoMax", label: "Ano máximo", type: "number" },
            { name: "kmMax", label: "Quilometragem máxima", type: "number", step: "0.01" }
        ],
        columns: [
            { key: "id", label: "ID" },
            { key: "modelo", label: "Modelo" },
            { key: "anoFabricacao", label: "Ano" },
            { key: "quilometragem", label: "Quilometragem" },
            { key: "fabricanteNome", label: "Fabricante" }
        ],
        serialize: (values) => ({ id: toInt(values.id), modelo: values.modelo.trim(), anoFabricacao: toInt(values.anoFabricacao), quilometragem: toNumber(values.quilometragem), fabricanteId: toInt(values.fabricanteId) }),
        filterPredicate: (item, filters) => textMatch(item.modelo, filters.modelo) && equalityMatch(item.fabricanteId, filters.fabricanteId) && numberMin(item.anoFabricacao, filters.anoMin) && numberMax(item.anoFabricacao, filters.anoMax) && numberMax(item.quilometragem, filters.kmMax)
    },
    vendas: {
        title: "Vendas",
        description: "Cadastro, edição, exclusão, busca por ID e filtros por cliente, veículo, datas e valor.",
        list: () => api.getVendas(),
        getById: (id) => api.getVendaById(id),
        create: (payload) => api.createVenda(payload),
        update: (id, payload) => api.updateVenda(id, payload),
        remove: (id) => api.deleteVenda(id),
        normalize: (item) => ({ id: item.idVenda ?? item.id, dataVenda: item.data ?? item.dataVenda, valorVenda: item.valorVenda, veiculoId: item.veiculoId, veiculoNome: item.veiculo ?? item.modeloVeiculo ?? "", clienteId: item.clienteId, clienteNome: item.cliente ?? item.nomeCliente ?? "", cpfComprador: item.cpfComprador ?? clientCpf(item.clienteId) }),
        fields: [
            { name: "id", label: "ID", type: "number", readonly: true },
            { name: "clienteId", label: "Cliente", type: "select", required: true, options: () => state.datasets.clientes.map((item) => ({ value: item.id, label: `${item.id} - ${item.nome}` })) },
            { name: "veiculoId", label: "Veículo", type: "select", required: true, options: () => state.datasets.veiculos.map((item) => ({ value: item.id, label: `${item.id} - ${item.modelo}` })) },
            { name: "dataVenda", label: "Data da venda", type: "date", required: true },
            { name: "valorVenda", label: "Valor da venda", type: "number", required: true, step: "0.01" }
        ],
        filters: [
            { name: "cliente", label: "Cliente contém", type: "text" },
            { name: "veiculo", label: "Veículo contém", type: "text" },
            { name: "valorMin", label: "Valor mínimo", type: "number", step: "0.01" },
            { name: "valorMax", label: "Valor máximo", type: "number", step: "0.01" },
            { name: "dataInicio", label: "Data inicial", type: "date" },
            { name: "dataFim", label: "Data final", type: "date" }
        ],
        columns: [
            { key: "id", label: "ID" },
            { key: "clienteNome", label: "Cliente" },
            { key: "cpfComprador", label: "CPF" },
            { key: "veiculoNome", label: "Veículo" },
            { key: "dataVendaFormatada", label: "Data" },
            { key: "valorVendaFormatado", label: "Valor" }
        ],
        serialize: (values) => ({ id: toInt(values.id), clienteId: toInt(values.clienteId), veiculoId: toInt(values.veiculoId), dataVenda: toIsoDate(values.dataVenda), valorVenda: toNumber(values.valorVenda) }),
        rowValue: (item, key) => {
            if (key === "dataVendaFormatada") return formatDate(item.dataVenda);
            if (key === "valorVendaFormatado") return formatCurrency(item.valorVenda);
            return item[key];
        },
        filterPredicate: (item, filters) => textMatch(item.clienteNome, filters.cliente) && textMatch(item.veiculoNome, filters.veiculo) && numberMin(item.valorVenda, filters.valorMin) && numberMax(item.valorVenda, filters.valorMax) && dateMin(item.dataVenda, filters.dataInicio) && dateMax(item.dataVenda, filters.dataFim)
    },
    alugueis: {
        title: "Aluguéis",
        description: "Cadastro, edição, exclusão, busca por ID e filtros por cliente, veículo, status e datas.",
        list: () => api.getAlugueis(),
        getById: (id) => api.getAluguelById(id),
        create: (payload) => api.createAluguel(payload),
        update: (id, payload) => api.updateAluguel(id, payload),
        remove: (id) => api.deleteAluguel(id),
        normalize: (item) => ({ id: item.id, clienteID: item.clienteID ?? item.clienteId, clienteNome: item.cliente ?? item.nomeCliente ?? clientName(item.clienteID ?? item.clienteId), veiculoID: item.veiculoID ?? item.veiculoId, veiculoNome: item.veiculo ?? item.modeloVeiculo ?? vehicleName(item.veiculoID ?? item.veiculoId), dataInicio: item.dataInicio, dataDevolucao: item.dataDevolucao, kmInicial: item.kmInicial ?? 0, kmFinal: item.kmFinal ?? "", valorDiaria: item.valorDiaria ?? 0, valorTotal: item.valorTotal ?? 0, status: item.dataDevolucao ? "Finalizado" : "Em andamento" }),
        fields: [
            { name: "id", label: "ID", type: "number", readonly: true },
            { name: "clienteID", label: "Cliente", type: "select", required: true, options: () => state.datasets.clientes.map((item) => ({ value: item.id, label: `${item.id} - ${item.nome}` })) },
            { name: "veiculoID", label: "Veículo", type: "select", required: true, options: () => state.datasets.veiculos.map((item) => ({ value: item.id, label: `${item.id} - ${item.modelo}` })) },
            { name: "dataInicio", label: "Data de início", type: "date", required: true },
            { name: "dataDevolucao", label: "Data de devolução", type: "date" },
            { name: "kmInicial", label: "KM inicial", type: "number", required: true, step: "0.01" },
            { name: "kmFinal", label: "KM final", type: "number", step: "0.01" },
            { name: "valorDiaria", label: "Valor da diária", type: "number", required: true, step: "0.01" },
            { name: "valorTotal", label: "Valor total", type: "number", required: true, step: "0.01" }
        ],
        filters: [
            { name: "cliente", label: "Cliente contém", type: "text" },
            { name: "veiculo", label: "Veículo contém", type: "text" },
            { name: "status", label: "Status", type: "select", options: () => [{ value: "Em andamento", label: "Em andamento" }, { value: "Finalizado", label: "Finalizado" }] },
            { name: "inicioMin", label: "Início a partir de", type: "date" },
            { name: "valorMax", label: "Valor máximo", type: "number", step: "0.01" }
        ],
        columns: [
            { key: "id", label: "ID" },
            { key: "clienteNome", label: "Cliente" },
            { key: "veiculoNome", label: "Veículo" },
            { key: "statusBadge", label: "Status" },
            { key: "dataInicioFormatada", label: "Início" },
            { key: "dataDevolucaoFormatada", label: "Devolução" },
            { key: "valorTotalFormatado", label: "Valor total" }
        ],
        serialize: (values) => ({ id: toInt(values.id), clienteID: toInt(values.clienteID), veiculoID: toInt(values.veiculoID), dataInicio: toIsoDate(values.dataInicio), dataDevolucao: values.dataDevolucao ? toIsoDate(values.dataDevolucao) : null, kmInicial: toNumber(values.kmInicial), kmFinal: values.kmFinal ? toNumber(values.kmFinal) : null, valorDiaria: toNumber(values.valorDiaria), valorTotal: toNumber(values.valorTotal) }),
        rowValue: (item, key) => {
            if (key === "statusBadge") return `<span class="badge ${item.status === "Finalizado" ? "text-bg-success" : "text-bg-warning"}">${item.status}</span>`;
            if (key === "dataInicioFormatada") return formatDate(item.dataInicio);
            if (key === "dataDevolucaoFormatada") return item.dataDevolucao ? formatDate(item.dataDevolucao) : "Em aberto";
            if (key === "valorTotalFormatado") return formatCurrency(item.valorTotal);
            return item[key];
        },
        filterPredicate: (item, filters) => textMatch(item.clienteNome, filters.cliente) && textMatch(item.veiculoNome, filters.veiculo) && textMatch(item.status, filters.status) && dateMin(item.dataInicio, filters.inicioMin) && numberMax(item.valorTotal, filters.valorMax)
    }
};

const app = document.getElementById("app-content");
const navButtons = Array.from(document.querySelectorAll(".nav-btn"));

init();

navButtons.forEach((button) => {
    button.addEventListener("click", async () => {
        state.activeView = button.dataset.view;
        setActiveNav();
        await renderCurrentView();
    });
});

document.addEventListener("click", async (event) => {
    const jumpButton = event.target.closest("[data-jump]");
    if (!jumpButton) {
        return;
    }

    state.activeView = jumpButton.dataset.jump;
    setActiveNav();
    await renderCurrentView();
});

async function init() {
    initModalListeners();
    await renderCurrentView();

    try {
        await loadAllData();
        if (state.activeView !== "home") {
            await renderCurrentView();
        }
    } catch {
    }
}

function initModalListeners() {
    const editForm = document.getElementById("edit-form");
    if (editForm) {
        editForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            const entityKey = event.currentTarget.dataset.entityKey;
            if (entityKey) {
                await saveEditEntity(entityKey);
            }
        });
    }

    const editModal = document.getElementById("edit-modal");
    if (editModal) {
        editModal.addEventListener("hidden.bs.modal", () => {
            const modalForm = document.getElementById("edit-form");
            const modalFields = document.getElementById("edit-form-fields");
            if (modalForm) {
                modalForm.reset();
                modalForm.dataset.recordId = "";
                modalForm.dataset.entityKey = "";
            }
            if (modalFields) {
                modalFields.innerHTML = "";
            }
        });
    }
}

async function loadAllData() {
    const [clientes, fabricantes, veiculos, vendas, alugueis] = await Promise.all([
        api.getClientes(),
        api.getFabricantes(),
        api.getVeiculos(),
        api.getVendas(),
        api.getAlugueis()
    ]);

    state.datasets.clientes = clientes.map(configs.clientes.normalize);
    state.datasets.fabricantes = fabricantes.map(configs.fabricantes.normalize);
    state.datasets.veiculos = veiculos.map(configs.veiculos.normalize);
    state.datasets.vendas = vendas.map(configs.vendas.normalize);
    state.datasets.alugueis = alugueis.map(configs.alugueis.normalize);
}

async function renderCurrentView() {
    setActiveNav();

    if (state.activeView === "home") {
        app.innerHTML = renderHome();
        return;
    }

    if (state.activeView === "consultas") {
        app.innerHTML = renderConsultas();
        wireConsultas();
        return;
    }

    if (configs[state.activeView]) {
        app.innerHTML = renderEntityPage(state.activeView);
        wireEntityPage(state.activeView);
    }
}

function renderHome() {
    return `
        <section class="view-card stack">
            <p class="eyebrow mb-1">Trabalho prático</p>
            <h2 class="section-title">VendaVeiculosAPI</h2>
            <p class="section-subtitle">Use o menu para abrir apenas a funcionalidade desejada.</p>
            <div class="d-flex gap-2 flex-wrap">
                <button class="btn btn-dark nav-btn" data-view="clientes">Abrir Clientes</button>
                <button class="btn btn-outline-dark nav-btn" data-view="consultas">Abrir Consultas</button>
            </div>
        </section>
    `;
}

function renderEntityPage(entityKey) {
    const config = configs[entityKey];
    return `
        <section class="view-card stack">
            <header class="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                <div>
                    <p class="eyebrow mb-1">${config.title}</p>
                    <h2 class="section-title">${config.title}</h2>
                    <p class="section-subtitle mb-0">${config.description}</p>
                </div>
            </header>

            <div class="grid-2">
                <section class="mini-card">
                    <h3 class="card-title">Formulário de cadastro</h3>
                    <p class="subtle-note mb-3">Use este formulário apenas para novos registros.</p>
                    <form id="entity-form" class="row g-3"></form>
                </section>
                <section class="mini-card lookup-card">
                    <div class="lookup-header">
                        <div>
                            <h3 class="card-title mb-1">Busca por ID</h3>
                            <p class="subtle-note mb-0">Consulte um registro e abra a edição em modal sem mexer no cadastro.</p>
                        </div>
                        <span class="pill">Consulta rápida</span>
                    </div>
                    <form id="lookup-form" class="lookup-form">
                        <div class="lookup-controls">
                            <input class="form-control lookup-input" type="number" min="1" id="lookup-id" placeholder="ID">
                            <button class="btn btn-dark lookup-submit" type="submit">Buscar</button>
                        </div>
                        <div class="lookup-actions">
                            <button class="btn btn-sm btn-outline-dark" type="button" id="lookup-fill">Abrir edição</button>
                            <button class="btn btn-sm btn-outline-secondary" type="button" id="lookup-clear">Limpar</button>
                        </div>
                    </form>
                    <div class="lookup-result mt-1" id="lookup-result">Nenhuma consulta realizada.</div>
                </section>
            </div>

            <section class="mini-card">
                <div class="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-3">
                    <div>
                        <h3 class="card-title mb-1">Filtros personalizados</h3>
                        <p class="text-muted mb-0">Pesquisa por pelo menos dois campos.</p>
                    </div>
                    <button class="btn btn-sm btn-outline-secondary" id="clear-filters">Limpar filtros</button>
                </div>
                <form id="filters-form" class="row g-3"></form>
            </section>

            <section class="mini-card">
                <div class="d-flex justify-content-between align-items-center gap-2 flex-wrap mb-3">
                    <h3 class="card-title mb-0">Registros</h3>
                    <span class="badge text-bg-light" id="row-count">0 registros</span>
                </div>
                <div class="table-responsive">
                    <table class="table table-striped align-middle">
                        <thead id="table-head"></thead>
                        <tbody id="table-body"></tbody>
                    </table>
                </div>
            </section>
        </section>
    `;
}

function renderConsultas() {
    return `
        <section class="view-card stack">
            <header>
                <p class="eyebrow mb-1">Consultas</p>
                <h2 class="section-title">Consultas e visualizações</h2>
                <p class="section-subtitle mb-0">Rotas dedicadas do backend e uma visualização complementar para vendas por modelo.</p>
            </header>

            <div class="grid-2">
                ${queryCard("compras-cliente", "Compras por cliente", state.datasets.clientes, "nome", "Cliente")}
                ${queryCard("veiculos-fabricante", "Veículos por fabricante", state.datasets.fabricantes, "nome", "Fabricante")}
                ${queryCard("vendas-fabricante", "Vendas por fabricante", state.datasets.fabricantes, "nome", "Fabricante")}
                ${queryCard("alugueis-cliente", "Aluguéis por cliente", state.datasets.clientes, "nome", "Cliente")}
                ${queryCard("faturamento-veiculo", "Faturamento por veículo", state.datasets.veiculos, "modelo", "Veículo")}
            </div>

            <section class="mini-card">
                <h3 class="card-title">Vendas por modelo</h3>
                <div id="sales-by-model"></div>
            </section>
        </section>
    `;
}

function queryCard(key, title, items, labelKey, label) {
    return `
        <article class="mini-card">
            <h3 class="card-title">${title}</h3>
            <form class="query-form d-grid gap-2" data-query="${key}">
                <label class="form-label">${label}</label>
                <select class="form-select">
                    <option value="">Selecione</option>
                    ${items.map((item) => `<option value="${item.id}">${item.id} - ${item[labelKey]}</option>`).join("")}
                </select>
                <div class="d-flex gap-2 flex-wrap">
                    <button class="btn btn-dark" type="submit">Executar</button>
                    <button class="btn btn-outline-secondary clear-query-btn" type="button">Limpar</button>
                </div>
            </form>
            <div class="result-box mt-3" id="query-result-${key}">Selecione um registro para consultar.</div>
        </article>
    `;
}

function wireEntityPage(entityKey) {
    const config = configs[entityKey];
    const form = document.getElementById("entity-form");
    const filtersForm = document.getElementById("filters-form");

    renderFields(form, config.fields, entityKey, true);
    renderFields(filtersForm, config.filters, entityKey, false);
    populateSelects(entityKey, form, filtersForm);
    renderTable(entityKey);

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        await saveEntity(entityKey);
    });

    const clearFiltersButton = document.getElementById("clear-filters");
    if (clearFiltersButton) {
        clearFiltersButton.addEventListener("click", () => {
            filtersForm.reset();
            renderTable(entityKey);
        });
    }

    document.getElementById("lookup-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        await lookupEntity(entityKey, false);
    });

    document.getElementById("lookup-fill").addEventListener("click", async () => {
        await lookupEntity(entityKey, true);
    });

    document.getElementById("lookup-clear").addEventListener("click", () => {
        document.getElementById("lookup-result").textContent = "Nenhuma consulta realizada.";
        document.getElementById("lookup-id").value = "";
    });

    filtersForm.querySelectorAll("input, select").forEach((element) => {
        element.addEventListener("input", () => renderTable(entityKey));
        element.addEventListener("change", () => renderTable(entityKey));
    });

    const refreshSection = document.getElementById("refresh-section");
    if (refreshSection) {
        refreshSection.addEventListener("click", async () => {
            await loadAllData();
            await renderCurrentView();
        });
    }

}

function renderFields(container, fields, entityKey, isForm, options = {}) {
    container.innerHTML = "";
    const prefix = isForm ? (options.idPrefix || "form") : "filter";

    fields.forEach((field) => {
        if (field.readonly) {
            const hidden = document.createElement("input");
            hidden.type = "hidden";
            hidden.name = field.name;
            hidden.id = `${prefix}-${entityKey}-${field.name}`;
            container.appendChild(hidden);
            return;
        }

        const wrapper = document.createElement("div");
        wrapper.className = "col-12 col-md-6";

        const label = document.createElement("label");
        label.className = "form-label";
        label.setAttribute("for", `${prefix}-${entityKey}-${field.name}`);
        label.textContent = field.label;

        const control = field.type === "select" ? buildSelect(field, entityKey, prefix) : buildInput(field, entityKey, prefix);
        wrapper.append(label, control);
        container.appendChild(wrapper);
    });

    if (isForm && options.includeActions !== false) {
        const actions = document.createElement("div");
        actions.className = "col-12 d-flex gap-2 flex-wrap";
        actions.innerHTML = `
            <button class="btn btn-dark" type="submit">Cadastrar</button>
        `;
        container.appendChild(actions);
    }
}

function buildInput(field, entityKey, prefix) {
    const input = document.createElement("input");
    input.className = "form-control";
    input.id = `${prefix}-${entityKey}-${field.name}`;
    input.name = field.name;
    input.type = field.type;
    input.readOnly = !!field.readonly;
    input.required = !!field.required && prefix !== "filter";
    if (field.step) input.step = field.step;
    return input;
}

function buildSelect(field, entityKey, prefix) {
    const select = document.createElement("select");
    select.className = "form-select";
    select.id = `${prefix}-${entityKey}-${field.name}`;
    select.name = field.name;
    select.innerHTML = `<option value="">Selecione</option>`;
    return select;
}

function populateSelects(entityKey, form = document.getElementById("entity-form"), filtersForm = document.getElementById("filters-form")) {

    configs[entityKey].fields.filter((field) => field.type === "select").forEach((field) => {
        const select = form ? form.querySelector(`[name="${field.name}"]`) : null;
        fillSelect(select, selectOptionsFor(field.name));
    });

    configs[entityKey].filters.filter((field) => field.type === "select").forEach((field) => {
        const select = filtersForm ? filtersForm.querySelector(`[name="${field.name}"]`) : null;
        fillSelect(select, typeof field.options === "function" ? field.options() : []);
    });
}

function selectOptionsFor(name) {
    if (name === "fabricanteId") {
        return state.datasets.fabricantes.map((item) => ({ value: item.id, label: `${item.id} - ${item.nome}` }));
    }
    if (name === "clienteId" || name === "clienteID") {
        return state.datasets.clientes.map((item) => ({ value: item.id, label: `${item.id} - ${item.nome}` }));
    }
    if (name === "veiculoId" || name === "veiculoID") {
        return state.datasets.veiculos.map((item) => ({ value: item.id, label: `${item.id} - ${item.modelo}` }));
    }
    return [];
}

function fillSelect(select, items) {
    if (!select) {
        return;
    }
    const current = select.value;
    select.innerHTML = `<option value="">Selecione</option>`;
    items.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.value;
        option.textContent = item.label;
        select.appendChild(option);
    });
    select.value = current;
}

function renderTable(entityKey) {
    const config = configs[entityKey];
    const filters = readFilters();
    const rows = state.datasets[entityKey].filter((item) => config.filterPredicate(item, filters));

    document.getElementById("row-count").textContent = `${rows.length} registro(s)`;
    document.getElementById("table-head").innerHTML = `<tr>${config.columns.map((column) => `<th>${column.label}</th>`).join("")}<th>Ações</th></tr>`;
    document.getElementById("table-body").innerHTML = rows.length
        ? rows.map((item) => `
            <tr>
                ${config.columns.map((column) => `<td>${getValue(config, item, column.key)}</td>`).join("")}
                <td>
                    <div class="d-flex gap-2 flex-wrap">
                        <button class="btn btn-sm btn-outline-dark" data-edit-id="${item.id}">Editar no modal</button>
                        <button class="btn btn-sm btn-outline-danger" data-delete-id="${item.id}">Excluir</button>
                    </div>
                </td>
            </tr>
        `).join("")
        : `<tr><td colspan="${config.columns.length + 1}"><div class="empty-state">Nenhum registro encontrado.</div></td></tr>`;

    document.querySelectorAll("[data-edit-id]").forEach((button) => {
        button.addEventListener("click", () => openEditModal(entityKey, Number(button.dataset.editId)));
    });

    document.querySelectorAll("[data-delete-id]").forEach((button) => {
        button.addEventListener("click", async () => deleteEntity(entityKey, Number(button.dataset.deleteId)));
    });
}

function readFilters() {
    const form = document.getElementById("filters-form");
    if (!form) {
        return {};
    }
    const values = Object.fromEntries(new FormData(form).entries());
    return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== ""));
}

function getValue(config, item, key) {
    if (typeof config.rowValue === "function") {
        return config.rowValue(item, key);
    }
    return item[key] ?? "-";
}

async function saveEntity(entityKey) {
    const config = configs[entityKey];
    const values = Object.fromEntries(new FormData(document.getElementById("entity-form")).entries());
    const payload = config.serialize(values);

    try {
        delete payload.id;
        await config.create(payload);
        showToast("Registro cadastrado.", "success");
        await loadAllData();
        await renderCurrentView();
    } catch (error) {
        showToast(error.message, "danger");
    }
}

async function saveEditEntity(entityKey) {
    const config = configs[entityKey];
    const form = document.getElementById("edit-form");
    const values = Object.fromEntries(new FormData(form).entries());
    const payload = config.serialize(values);
    const recordId = Number(form.dataset.recordId || payload.id);

    if (!recordId) {
        showToast("Selecione um registro válido.", "warning");
        return;
    }

    try {
        await config.update(recordId, { ...payload, id: recordId });
        showToast("Registro atualizado.", "success");
        bootstrap.Modal.getOrCreateInstance(document.getElementById("edit-modal")).hide();
        await loadAllData();
        await renderCurrentView();
    } catch (error) {
        showToast(error.message, "danger");
    }
}

async function deleteEntity(entityKey, id) {
    if (!window.confirm(`Confirma a exclusão do registro ${id}?`)) {
        return;
    }

    try {
        await configs[entityKey].remove(id);
        showToast("Registro excluído.", "success");
        await loadAllData();
        await renderCurrentView();
    } catch (error) {
        if (error?.status === 404) {
            showToast("Registro não encontrado no backend. A lista foi sincronizada.", "warning");
            await loadAllData();
            await renderCurrentView();
            return;
        }
        showToast(error.message, "danger");
    }
}

async function lookupEntity(entityKey, loadIntoForm) {
    const id = Number(document.getElementById("lookup-id").value);
    if (!id) {
        showToast("Informe um ID válido.", "warning");
        return;
    }

    try {
        const result = await configs[entityKey].getById(id);
        document.getElementById("lookup-result").innerHTML = renderResultMarkup(result);
        if (loadIntoForm) {
            openEditModal(entityKey, result);
        }
    } catch (error) {
        document.getElementById("lookup-result").textContent = `Falha na consulta: ${error.message}`;
        showToast(error.message, "danger");
    }
}

function openEditModal(entityKey, itemOrId) {
    const rawItem = typeof itemOrId === "object"
        ? itemOrId
        : state.datasets[entityKey].find((entry) => entry.id === itemOrId);

    if (!rawItem) {
        showToast("Registro não encontrado.", "warning");
        return;
    }

    const config = configs[entityKey];
    const item = typeof config.normalize === "function" ? config.normalize(rawItem) : rawItem;
    const modalElement = document.getElementById("edit-modal");
    const modalForm = document.getElementById("edit-form");
    const modalFields = document.getElementById("edit-form-fields");
    const modalTitle = document.getElementById("edit-modal-title");

    if (!modalElement || !modalForm || !modalFields || !modalTitle) {
        return;
    }

    modalTitle.textContent = `Editar ${config.title}`;
    modalForm.dataset.recordId = String(item.id ?? "");
    modalForm.dataset.entityKey = entityKey;
    renderFields(modalFields, config.fields, entityKey, true, { includeActions: false, idPrefix: "edit" });
    populateSelects(entityKey, modalForm, null);
    fillFormValues(modalForm, config.fields, item);
    bootstrap.Modal.getOrCreateInstance(modalElement).show();
}

function fillFormValues(form, fields, item) {
    fields.forEach((field) => {
        const control = form.elements[field.name];
        if (!control) {
            return;
        }
        if (field.type === "date") {
            control.value = toInputDate(item[field.name]);
            return;
        }
        control.value = item[field.name] ?? "";
    });
}

async function runQuery(key, id) {
    const target = document.getElementById(`query-result-${key}`);
    target.textContent = "Consultando...";

    try {
        let result = null;
        if (key === "compras-cliente") result = await api.getComprasCliente(id);
        if (key === "veiculos-fabricante") result = await api.getVeiculosFabricante(id);
        if (key === "vendas-fabricante") result = await api.getVendasFabricante(id);
        if (key === "alugueis-cliente") result = await api.getAlugueisCliente(id);
        if (key === "faturamento-veiculo") result = await api.getFaturamentoVeiculo(id);
        target.innerHTML = renderResultMarkup(result);
    } catch (error) {
        target.textContent = `Falha na consulta: ${error.message}`;
        showToast(error.message, "danger");
    }
}

function renderSalesByModel() {
    const container = document.getElementById("sales-by-model");
    const grouped = state.datasets.vendas.reduce((acc, venda) => {
        const key = venda.veiculoNome || "Não informado";
        acc[key] = (acc[key] || 0) + Number(venda.valorVenda || 0);
        return acc;
    }, {});

    const rows = Object.entries(grouped).sort((a, b) => b[1] - a[1]);
    container.innerHTML = rows.length
        ? rows.map(([modelo, total]) => `<div class="mini-row"><span>${modelo}</span><strong>${formatCurrency(total)}</strong></div>`).join("")
        : `<div class="empty-state">Cadastre vendas para ver o resumo por modelo.</div>`;
}

function wireConsultas() {
    document.querySelectorAll(".query-form").forEach((form) => {
        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            const id = Number(form.querySelector("select").value);
            if (!id) {
                showToast("Selecione um item para consultar.", "warning");
                return;
            }
            await runQuery(form.dataset.query, id);
        });
    });

    document.querySelectorAll(".clear-query-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const key = btn.closest("article").querySelector(".query-form").dataset.query;
            document.getElementById(`query-result-${key}`).textContent = "Selecione um registro para consultar.";
            btn.closest("article").querySelector("select").value = "";
        });
    });
}

function setActiveNav() {
    navButtons.forEach((button) => button.classList.toggle("active", button.dataset.view === state.activeView));
}

function showToast(message, type = "primary") {
    const stack = document.getElementById("toast-stack");
    if (!stack) {
        return;
    }

    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-bg-${type} border-0 show`;
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" aria-label="Fechar"></button>
        </div>
    `;
    toast.querySelector("button").addEventListener("click", () => toast.remove());
    stack.appendChild(toast);
    window.setTimeout(() => toast.remove(), 4000);
}

function clientName(id) {
    return state.datasets.clientes.find((item) => item.id === id)?.nome ?? "";
}

function clientCpf(id) {
    return state.datasets.clientes.find((item) => item.id === id)?.cpf ?? "";
}

function vehicleName(id) {
    return state.datasets.veiculos.find((item) => item.id === id)?.modelo ?? "";
}

function textMatch(value, filterValue) {
    if (!filterValue) return true;
    return String(value ?? "").toLowerCase().includes(String(filterValue).toLowerCase());
}

function equalityMatch(value, filterValue) {
    if (!filterValue) return true;
    return String(value) === String(filterValue);
}

function numberMin(value, filterValue) {
    if (filterValue === undefined || filterValue === null || filterValue === "") return true;
    return Number(value) >= Number(filterValue);
}

function numberMax(value, filterValue) {
    if (filterValue === undefined || filterValue === null || filterValue === "") return true;
    return Number(value) <= Number(filterValue);
}

function dateMin(value, filterValue) {
    if (!filterValue) return true;
    return new Date(value) >= new Date(filterValue);
}

function dateMax(value, filterValue) {
    if (!filterValue) return true;
    return new Date(value) <= new Date(filterValue);
}

function formatDate(value) {
    if (!value) return "-";
    return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}

function formatCurrency(value) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value || 0));
}

function toInt(value) {
    return value === "" || value === null || value === undefined ? 0 : Number.parseInt(value, 10);
}

function toNumber(value) {
    return value === "" || value === null || value === undefined ? 0 : Number(value);
}

function toIsoDate(value) {
    if (!value) {
        return value;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return `${value}T00:00:00`;
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
}

function stringifyWithPtBrDates(value) {
    return JSON.stringify(mapDatesToPtBr(value), null, 2);
}

function mapDatesToPtBr(value) {
    if (Array.isArray(value)) {
        return value.map((item) => mapDatesToPtBr(item));
    }

    if (value && typeof value === "object") {
        return Object.fromEntries(
            Object.entries(value).map(([key, item]) => [key, mapDatesToPtBr(item)])
        );
    }

    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}(T.*)?$/.test(value)) {
        return formatDate(value);
    }

    return value;
}

function toInputDate(value) {
    if (!value) {
        return "";
    }

    const matched = String(value).match(/^(\d{4}-\d{2}-\d{2})/);
    if (matched) {
        return matched[1];
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return "";
    }

    const year = parsed.getUTCFullYear();
    const month = String(parsed.getUTCMonth() + 1).padStart(2, "0");
    const day = String(parsed.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function renderResultMarkup(value) {
    const normalized = mapDatesToPtBr(value);

    if (normalized === null || normalized === undefined) {
        return `<div class="empty-state">Sem dados para exibir.</div>`;
    }

    if (Array.isArray(normalized)) {
        if (normalized.length === 0) {
            return `<div class="empty-state">Nenhum registro encontrado.</div>`;
        }

        const allObjects = normalized.every((item) => item && typeof item === "object" && !Array.isArray(item));
        if (allObjects) {
            const headers = Object.keys(normalized[0]);
            return `
                <div class="table-responsive">
                    <table class="table table-sm align-middle mb-0">
                        <thead>
                            <tr>${headers.map((header) => `<th>${escapeHtml(startCase(header))}</th>`).join("")}</tr>
                        </thead>
                        <tbody>
                            ${normalized.map((row) => `<tr>${headers.map((header) => `<td>${escapeHtml(toDisplayText(row[header]))}</td>`).join("")}</tr>`).join("")}
                        </tbody>
                    </table>
                </div>
            `;
        }

        return `<ul class="result-list mb-0 ps-3">${normalized.map((item) => `<li>${escapeHtml(toDisplayText(item))}</li>`).join("")}</ul>`;
    }

    if (typeof normalized === "object") {
        return `
            <dl class="result-grid mb-0">
                ${Object.entries(normalized).map(([key, item]) => `
                    <div class="result-grid-cell">
                        <dt>${escapeHtml(startCase(key))}</dt>
                        <dd>${escapeHtml(toDisplayText(item))}</dd>
                    </div>
                `).join("")}
            </dl>
        `;
    }

    return `<p class="mb-0">${escapeHtml(toDisplayText(normalized))}</p>`;
}

function toDisplayText(value) {
    if (value === null || value === undefined || value === "") {
        return "-";
    }
    if (typeof value === "number") {
        return String(value);
    }
    if (typeof value === "boolean") {
        return value ? "Sim" : "Não";
    }
    return String(value);
}

function startCase(value) {
    return String(value)
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[_-]+/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
