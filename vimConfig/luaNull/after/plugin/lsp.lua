local status_ok, lsp = pcall(require, "lsp-zero")
if not status_ok then
	return
end

local status_null, null_ls = pcall(require, "null-ls")
if not status_null then
	return
end

local mason_null_ls_status, mason_null_ls = pcall(require, "mason-null-ls")
if not mason_null_ls_status then
	return
end

lsp.preset("recommended")

lsp.ensure_installed({
	"tsserver",
	"sumneko_lua",
	"stylelint_lsp",
	"cssls",
})

lsp.set_preferences({
	suggest_lsp_servers = false,
	sign_icons = {
		error = "E",
		warn = "W",
		hint = "H",
		info = "I",
	},
})

lsp.configure("stylelint_lsp", {
	filetypes = { "css", "less", "scss", "sugarss", "vue", "wxss" },
})

lsp.setup()

vim.diagnostic.config({
	virtual_text = true,
})

---
-- null_ls support
---

mason_null_ls.setup({
	ensure_installed = {
		"prettierd",
		"stylua",
		"eslint_d",
		"stylelint",
	},
})

local formatting = null_ls.builtins.formatting
local diagnostics = null_ls.builtins.diagnostics

local augroup = vim.api.nvim_create_augroup("LspFormatting", {})

local lsp_formatting = function(bufnr)
	vim.lsp.buf.format({
		filter = function(client)
			-- apply whatever logic you want (in this example, we'll only use null-ls)
			return client.name == "null-ls"
		end,
		bufnr = bufnr,
	})
end

null_ls.setup({
	sources = {
		-- formatting.stylelint,
		formatting.eslint_d,
		formatting.prettierd,
		formatting.stylua,
		diagnostics.eslint_d,
		diagnostics.stylelint,
	},
	-- you can reuse a shared lspconfig on_attach callback here
	on_attach = function(client, bufnr)
		if client.supports_method("textDocument/formatting") then
			vim.api.nvim_clear_autocmds({ group = augroup, buffer = bufnr })
			vim.api.nvim_create_autocmd("BufWritePre", {
				group = augroup,
				buffer = bufnr,
				callback = function()
					lsp_formatting(bufnr)
				end,
			})
		end
	end,
})
