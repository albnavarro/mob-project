vim.cmd([[

let g:ale_fixers = {
    \   '*': ['remove_trailing_lines', 'trim_whitespace'],
    \   'javascript': ['prettier'],
    \   'scss': ['prettier', 'stylelint'],
    \   'sass': ['prettier'],
    \}

let g:ale_linters = {
    \   'javascript': ['eslint'],
    \   'scss': ['stylelint'],
    \}

let g:ale_fix_on_save = 1
let g:ale_disable_lsp = 1

]])
