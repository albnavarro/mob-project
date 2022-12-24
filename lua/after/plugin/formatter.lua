local prettierConfig = function()
	return {
		exe = "prettier",
		args = {
            "--search-parent-directories",
            "--stdin-filepath",
            vim.fn.shellescape(vim.api.nvim_buf_get_name(0)),
            "--single-quote"
        },
		stdin = true
	}
end

local stylelint = function()
	return {
		require("formatter.filetypes.css").stylelint
	}
end

-- Provides the Format, FormatWrite, FormatLock, and FormatWriteLock commands
require("formatter").setup {
	-- Enable or disable logging
	logging = true,
	-- Set the log level
	log_level = vim.log.levels.WARN,
	-- All formatter configurations are opt-in
	filetype = {
		scss = { prettierConfig, stylelint },
		css = { prettierConfig, stylelint },
		json = { prettierConfig },
		html = { prettierConfig },
		javascript = { prettierConfig },
		typescript = { prettierConfig },
		typescriptreact = { prettierConfig },
		-- Use the special "*" filetype for defining formatter configurations on
		-- any filetype
		["*"] = {
			require("formatter.filetypes.any").remove_trailing_whitespace
		}
	}
}


local cmd = vim.cmd

cmd [[
    augroup FormatAutogroup
      autocmd!
      autocmd BufWritePost * FormatWrite
    augroup END
]]