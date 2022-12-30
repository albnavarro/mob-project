local status_ok, lsp = pcall(require, "lsp-zero")
if not status_ok then
	return
end

lsp.preset("recommended")

lsp.ensure_installed({
    'tsserver',
    'eslint',
    'sumneko_lua',
    'rust_analyzer',
    'stylelint_lsp',
    'cssls',
})


lsp.set_preferences({
    suggest_lsp_servers = false,
    sign_icons = {
        error = 'E',
        warn = 'W',
        hint = 'H',
        info = 'I'
    }
})

lsp.configure('stylelint_lsp', {
    filetypes = { "css", "less", "scss", "sugarss", "vue", "wxss" }
})

lsp.setup()

vim.diagnostic.config({
    virtual_text = true,
})
