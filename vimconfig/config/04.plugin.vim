call plug#begin()
Plug 'vim-airline/vim-airline'
Plug 'joshdick/onedark.vim'
Plug 'digitaltoad/vim-pug'
Plug 'tpope/vim-commentary'
Plug 'junegunn/fzf', { 'do': { -> fzf#install() } }
Plug 'junegunn/fzf.vim'
Plug 'Yggdroot/indentLine'
Plug 'pangloss/vim-javascript'
Plug 'tpope/vim-surround'
Plug 'dense-analysis/ale'
Plug 'neoclide/coc.nvim', {'branch': 'release'}
call plug#end()


packloadall
colorscheme onedark
