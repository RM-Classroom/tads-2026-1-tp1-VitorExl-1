const JSON_HEADERS = {
    "Content-Type": "application/json"
};

async function request(path, options = {}) {
    const response = await fetch(path, {
        headers: options.body ? JSON_HEADERS : undefined,
        ...options
    });

    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

    if (!response.ok) {
        const message = typeof data === "string"
            ? data
            : data?.title || data?.message || JSON.stringify(data);
        const error = new Error(message || "Falha ao processar a requisicao.");
        error.status = response.status;
        throw error;
    }

    return data;
}

export const api = {
    getClientes: () => request("/api/cliente"),
    getClienteById: (id) => request(`/api/cliente/${id}`),
    createCliente: (payload) => request("/api/cliente", { method: "POST", body: JSON.stringify(payload) }),
    updateCliente: (id, payload) => request(`/api/cliente/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
    deleteCliente: (id) => request(`/api/cliente/${id}`, { method: "DELETE" }),

    getFabricantes: () => request("/api/fabricante"),
    getFabricanteById: (id) => request(`/api/fabricante/${id}`),
    createFabricante: (payload) => request("/api/fabricante", { method: "POST", body: JSON.stringify(payload) }),
    updateFabricante: (id, payload) => request(`/api/fabricante/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
    deleteFabricante: (id) => request(`/api/fabricante/${id}`, { method: "DELETE" }),

    getVeiculos: () => request("/api/veiculo"),
    getVeiculoById: (id) => request(`/api/veiculo/${id}`),
    createVeiculo: (payload) => request("/api/veiculo", { method: "POST", body: JSON.stringify(payload) }),
    updateVeiculo: (id, payload) => request(`/api/veiculo/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
    deleteVeiculo: (id) => request(`/api/veiculo/${id}`, { method: "DELETE" }),

    getVendas: () => request("/api/venda"),
    getVendaById: (id) => request(`/api/venda/${id}`),
    createVenda: (payload) => request("/api/venda", { method: "POST", body: JSON.stringify(payload) }),
    updateVenda: (id, payload) => request(`/api/venda/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
    deleteVenda: (id) => request(`/api/venda/${id}`, { method: "DELETE" }),

    getAlugueis: () => request("/api/aluguel"),
    getAluguelById: (id) => request(`/api/aluguel/${id}`),
    createAluguel: (payload) => request("/api/aluguel", { method: "POST", body: JSON.stringify(payload) }),
    updateAluguel: (id, payload) => request(`/api/aluguel/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
    deleteAluguel: (id) => request(`/api/aluguel/${id}`, { method: "DELETE" }),

    getComprasCliente: (clienteId) => request(`/api/consultas/compras-cliente/${clienteId}`),
    getVeiculosFabricante: (fabricanteId) => request(`/api/consultas/veiculos-fabricante/${fabricanteId}`),
    getVendasFabricante: (fabricanteId) => request(`/api/consultas/vendas-por-fabricante/${fabricanteId}`),
    getAlugueisCliente: (clienteId) => request(`/api/consultas/alugueis-cliente/${clienteId}`),
    getFaturamentoVeiculo: (veiculoId) => request(`/api/consultas/faturamento-veiculo/${veiculoId}`)
};