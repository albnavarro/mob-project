local v = vim
local smart_search_is_active = false

function Setup_smart_search()
	smart_search_is_active = true
	-- Clear search buffer
	v.cmd(':let @/ = ""')
	-- Set hightlight search
	v.cmd(":set hlsearch")
	-- remap space to '.\{-}' to concatente string and refien search.
	v.api.nvim_set_keymap("c", "<Space>", [[.\{-}]], { noremap = true, silent = false })
end

function Clear_smart_search()
	if smart_search_is_active == true then
		-- reset hightlight and space remap
		v.cmd(":set nohlsearch")
		v.api.nvim_set_keymap("c", "<Space>", "<Space>", { noremap = true })
		smart_search_is_active = false
	end
end

-- keybinding search / and ? with ignorecase.
v.api.nvim_set_keymap("n", "<Leader>d", [[<cmd>lua Setup_smart_search()<CR>/\c<left><left>]], { noremap = true })
v.api.nvim_set_keymap("n", "<Leader>u", [[<cmd>lua Setup_smart_search()<CR>?\c<left><left>]], { noremap = true })

-- clear setting on command line leave
local smartSearchGrp = v.api.nvim_create_augroup("SearchConcatenate", { clear = true })
v.api.nvim_create_autocmd("CmdlineLeave", {
	command = "lua Clear_smart_search()",
	group = smartSearchGrp,
})

-- START FAST SEARCH MOVEMENT --
-- more comfort incremental search ignorecase with hightlight
-- map("n", "<leader>d", [[:let @/ = ""<CR>:set hlsearch<CR>/\c<left><left>]], { silent = false })
-- map("n", "<leader>u", [[:let @/ = ""<CR>:set hlsearch<CR>?\c<left><left>]], { silent = false })

-- clear hightlight
-- map("n", "<leader><Esc>", [[:set nohlsearch<CR>]], { silent = true })

-- map space to '.\{-}' in search mode
-- map("c", "<Space>", [[getcmdtype() =~ '^[/?]$' ? '.\{-}' : ' ']], { silent = false, expr = true })
-- END FAST SEARCH MOVEMENT --
