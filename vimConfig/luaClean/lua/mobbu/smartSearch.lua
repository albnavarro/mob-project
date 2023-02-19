local v = vim
local smart_search_is_active = false

function Setup_smart_search()
	smart_search_is_active = true
	v.cmd(':let @/ = ""')
	v.cmd(":set hlsearch")
end

function Clear_smart_search()
	if smart_search_is_active == true then
		smart_search_is_active = false
		v.cmd(":set nohlsearch")
	end
end

function Command_space_pressed()
	if smart_search_is_active == true then
		return [[.\{-}]]
	else
		return " "
	end
end

-- keybinding search / and ? with ignorecase.
v.api.nvim_set_keymap("n", "<Leader>d", [[<cmd>lua Setup_smart_search()<CR>/\c<left><left>]], { noremap = true })
v.api.nvim_set_keymap("n", "<Leader>u", [[<cmd>lua Setup_smart_search()<CR>?\c<left><left>]], { noremap = true })
v.api.nvim_set_keymap("c", "<Space>", "", {
	noremap = true,
	expr = true,
	callback = Command_space_pressed,
})

-- clear setting on commandline leave
local smartSearchGrp = v.api.nvim_create_augroup("SearchConcatenate", { clear = true })
v.api.nvim_create_autocmd("CmdlineLeave", {
	callback = Clear_smart_search,
	group = smartSearchGrp,
})

-- more comfort incremental search ignorecase with hightlight
-- map("n", "<leader>d", [[:let @/ = ""<CR>:set hlsearch<CR>/\c<left><left>]], { silent = false })
-- map("n", "<leader>u", [[:let @/ = ""<CR>:set hlsearch<CR>?\c<left><left>]], { silent = false })

-- clear hightlight
-- map("n", "<leader><Esc>", [[:set nohlsearch<CR>]], { silent = true })

-- map space to '.\{-}' in search mode
-- map("c", "<Space>", [[getcmdtype() =~ '^[/?]$' ? '.\{-}' : ' ']], { silent = false, expr = true })
-- END FAST SEARCH MOVEMENT --
