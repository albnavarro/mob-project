" Custom remap
" Open new buffer on right move to new buffer and execute Ex command
nnoremap <silent><nowait> <F2> <C-w>v<bar><C-w>l<bar>:Ex<CR>

" Open new buffer on bottom move to new buffer and execute Ex command
nnoremap <silent><nowait> <F3> <C-w>s<bar><C-w>j<bar>:Ex<CR>

" Move to viewport
nnoremap <silent><nowait> <C-h> <C-w>h
nnoremap <silent><nowait> <C-j> <C-w>j
nnoremap <silent><nowait> <C-k> <C-w>k
nnoremap <silent><nowait> <C-l> <C-w>l
nnoremap <silent><nowait> <TAB> <C-w>w
nnoremap <silent><nowait> <S-TAB> <C-w>W
nnoremap <silent> <C-right> :exe "vertical resize " . (winwidth(0) * 3/2)<CR>
nnoremap <silent> <C-left> :exe "vertical resize " . (winwidth(0) * 2/3)<CR>
nnoremap <silent> <C-down> :exe "resize " . (winheight(0) * 3/2)<CR>
nnoremap <silent> <C-up> :exe "resize " . (winheight(0) * 2/3)<CR>

" Retab to 4 spaces
:command RetabToFour :set ts=2 sts=2 noet <bar> :retab! <bar> :set ts=4 sts=4 et <bar> :retab
