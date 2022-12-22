" Custom remap
" Open new buffer on right move to new buffer and execute Ex command
nnoremap <silent><nowait> <F2> <C-w>v<bar><C-w>l<bar>:Ex<CR>

" Open new buffer on bottom move to new buffer and execute Ex command
nnoremap <silent><nowait> <F3> <C-w>s<bar><C-w>j<bar>:Ex<CR>

" Align all document
nnoremap <silent><nowait> <F4> gg=G

" Move to viewport
nnoremap <silent><nowait> <TAB> <C-w>w
nnoremap <silent><nowait> <S-TAB> <C-w>W

" Resize viewport
nnoremap <silent> <C-right> :exe "vertical resize " . (winwidth(0) * 3/2)<CR>
nnoremap <silent> <C-left> :exe "vertical resize " . (winwidth(0) * 2/3)<CR>
nnoremap <silent> <C-down> :exe "resize " . (winheight(0) * 3/2)<CR>
nnoremap <silent> <C-up> :exe "resize " . (winheight(0) * 2/3)<CR>

" move split
nnoremap <Leader>j <C-w><S-j>
nnoremap <Leader>k <C-w><S-k>
nnoremap <Leader>l <C-w><S-l>
nnoremap <Leader>h <C-w><S-h>

" Open fuzzy finder history
nnoremap <silent> <C-h> :History<CR>

" Retab to 4 spaces
:command RetabToFour :set ts=2 sts=2 noet <bar> :retab! <bar> :set ts=4 sts=4 et <bar> :retab

" Move up and down and center screen
nnoremap <C-d> <C-d>zz
nnoremap <C-u> <C-u>zz

" center screen on next occurence of search
nnoremap n nzzzv
nnoremap N Nzzzv

" Paste from register 0
noremap <Leader>p "0p
noremap <Leader>P "0P
vnoremap <Leader>p "0p

" fast replace word from current line to end of file with confirm.
" noremap <Leader>s :.,$s/\<<C-r><C-w>\>/<C-r><C-w>/gc<Left><Left><Left>
noremap <Leader>s :.,$s/\<<C-r><C-w>\>//gc<Left><Left><Left>

" fast replace on whole file.
noremap <Leader>S :%s/\<<C-r><C-w>\>/<C-r><C-w>/gI<Left><Left><Left>

" Move 1 more lines up or down in normal and visual selection modes.
nnoremap <C-k> :m .-2<CR>==
nnoremap <C-j> :m .+1<CR>==
vnoremap <C-k> :m '<-2<CR>gv=gv
vnoremap <C-j> :m '>+1<CR>gv=gv

"Shortcut :normal froms election
vnoremap <Leader>n :normal<Space>

":Ex
nnoremap <Leader>e :Ex<CR>

":w
nnoremap <Leader>w :w<CR>

":qa
nnoremap <Leader>Q :qa<CR>

" Center horizontally
nnoremap <silent> <leader>z zszH
