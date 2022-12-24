local function map(mode, lhs, rhs, opts)
  local options = { noremap=true, silent=true }
  if opts then
    options = vim.tbl_extend('force', options, opts)
  end
  vim.api.nvim_set_keymap(mode, lhs, rhs, options)
end

-- Open new buffer on right move to new buffer and execute Ex command
map("n", "<A-l>", "<C-w>v<bar><C-w>l<bar>:Ex<CR>", { silent = true })

-- Open new buffer on bottom move to new buffer and execute Ex command
map("n", "<A-k>", "<C-w>s<bar><C-w>j<bar>:Ex<CR>", { silent = true })

-- Move 1 more lines up or down in normal and visual selection modes.
map("v", "<C-J>", ":m '>+1<CR>gv=gv")
map("v", "<C-k>", ":m '<-2<CR>gv=gv")
map("n", "<C-J>", ":m .+1<CR>==")
map("n", "<C-k>", ":m .-2<CR>==")

-- Move to viewport
map("n", "<TAB>", "<C-w>w")
map("n", "<S-TAB>", "<C-w>W")

-- Resize viewport
map("n", "<C-right>", ":exe 'vertical resize' . (winwidth(0) * 3/2)<CR>")
map("n", "<C-left>", ":exe 'vertical resize' . (winwidth(0) * 2/3)<CR>")
map("n", "<C-down>", ":exe 'resize' . (winheight(0) * 3/2)<CR>")
map("n", "<C-up>", ":exe 'resize' . (winheight(0) * 2/3)<CR>")

-- move split
map("n", "<Leader>j", "<C-w><S-j>")
map("n", "<Leader>k", "<C-w><S-k>")
map("n", "<Leader>l", "<C-w><S-l>")
map("n", "<Leader>h", "<C-w><S-h>")

-- Move up and down and center screen
map("n", "<C-d>", "<C-d>zz")
map("n", "<C-u>", "<C-u>zz")

-- center screen on next occurence of search
map("n", "n", "nzzzv")
map("n", "N", "Nzzzv")

--  Paste from register 0
map("n", "<Leader>p", "\"0p")
map("n", "<Leader>P", "\"0P")
map("v", "<Leader>p", "\"0p")

-- fast replace word from current line to end of file with confirm.
map("n", "<leader>s", [[:.,$s/\<<C-r><C-w>\>//gc<Left><Left><Left>]], { silent = false })

-- fast replace on whole file.
map("n", "<leader>S", [[:%s/\<<C-r><C-w>\>//gI<Left><Left><Left>]], { silent = false })

-- Shortcut :normal froms election
map("v", "<Leader>n", ":normal<Space>", { silent = false })

-- :Ex
map("n", "<Leader>e", ":Ex<CR>")

-- :w
map("n", "<Leader>w", ":w<CR>")

-- :qa
map("n", "<Leader>Q", ":qa<CR>")

-- Center horizontally
map("n", "<Leader>z", "zszH")
