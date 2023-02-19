local v = vim

-- Search status
local smart_search_is_active = false

-- Initial scrolloff value
local scrolloffValue = v.api.nvim_get_option("scrolloff")

-- Termcode convert utils
local function t(str)
	return v.api.nvim_replace_termcodes(str, true, true, true)
end

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
		return t("<Space>")
	end
end

function Get_line_num()
	return v.api.nvim_win_get_cursor(0)[1]
end

function Get_window_line(use_first_line)
	if use_first_line == true then
		return v.api.nvim_win_call(0, function()
			return v.fn.line("w0") + scrolloffValue
		end)
	else
		return v.api.nvim_win_call(0, function()
			return v.fn.line("w$") - scrolloffValue
		end)
	end
end

v.api.nvim_set_keymap("n", "<Leader>d", "", {
	noremap = true,
	silent = false,
	expr = true,
	callback = function()
		Setup_smart_search()
		return [[/\c\%>]] .. Get_line_num() - 1 .. [[l\%<]] .. Get_window_line(false) .. [[l]] .. t("<C-b>")
	end,
})

v.api.nvim_set_keymap("n", "<Leader>u", "", {
	noremap = true,
	expr = true,
	callback = function()
		Setup_smart_search()
		return [[?\c\%<]] .. Get_line_num() - 1 .. [[l\%>]] .. Get_window_line(true) .. [[l]] .. t("<C-b>")
	end,
})

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
