local status_ok, telescope = pcall(require, "telescope")
if not status_ok then
	return
end

local builtin = require("telescope.builtin")
local actions = require("telescope.actions")

vim.keymap.set("n", "<leader>ff", builtin.find_files, {})
vim.keymap.set("n", "<leader>fg", builtin.live_grep, {})
vim.keymap.set("n", "<leader>fs", builtin.grep_string, {})
vim.keymap.set("n", "<leader>fb", builtin.buffers, {})
vim.keymap.set("n", "<leader>fh", builtin.help_tags, {})
vim.keymap.set("n", "<leader>fj", builtin.jumplist, {})
vim.keymap.set("n", "<leader>fr", builtin.lsp_references, {})
vim.keymap.set("n", "<C-h>", builtin.oldfiles, {})

telescope.setup({
	defaults = {
		mappings = {
			i = {
				-- Open quicklis with multiple files
				["<C-o>"] = actions.send_selected_to_qflist + actions.open_qflist,
			},
			n = {
				-- Open quicklis with multiple files
				["<C-o>"] = actions.send_selected_to_qflist + actions.open_qflist,
			},
		},
	},
})
