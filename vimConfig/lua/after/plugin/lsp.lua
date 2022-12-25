local lsp = require("lsp-zero")
-- local null_ls = require('null-ls')

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

-- local augroup = vim.api.nvim_create_augroup("LspFormatting", {})
-- local null_opts = lsp.build_options('null-ls', {})
--
-- null_ls.setup({
--     on_attach = function(client, bufnr)
--         if client.supports_method("textDocument/formatting") then
--             vim.api.nvim_clear_autocmds({ group = augroup, buffer = bufnr })
--             vim.api.nvim_create_autocmd("BufWritePre", {
--                 group = augroup,
--                 buffer = bufnr,
--                 callback = function()
--                     -- on 0.8, you should use vim.lsp.buf.format({ bufnr = bufnr }) instead
--                     vim.lsp.buf.format({ bufnr = bufnr })
--                 end,
--             })
--         end
--     end,
--     sources = {
--         null_ls.builtins.formatting.prettier,
--         null_ls.builtins.formatting.stylelint
--     }
-- })

vim.diagnostic.config({
    virtual_text = true,
})
