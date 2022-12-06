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
nnoremap <silent> <C-right> :exe "vertical resize " . (winwidth(0) * 3/2)<CR>
nnoremap <silent> <C-left> :exe "vertical resize " . (winwidth(0) * 2/3)<CR>
nnoremap <silent> <C-down> :exe "resize " . (winheight(0) * 3/2)<CR>
nnoremap <silent> <C-up> :exe "resize " . (winheight(0) * 2/3)<CR>
nnoremap <silent> <C-h> :History<CR>
nnoremap <silent> <leader>z zszH

" Retab to 4 spaces
:command RetabToFour :set ts=2 sts=2 noet <bar> :retab! <bar> :set ts=4 sts=4 et <bar> :retab

" Move up and down and center screen
nnoremap <C-d> <C-d>zz
nnoremap <C-u> <C-u>zz

" center screen on next occurence of search
nnoremap n nzzzv
nnoremap N Nzzzv
