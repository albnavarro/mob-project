require'nvim-treesitter.configs'.setup {
    ensure_installed = { "javascript", "typescript", "jsdoc", "css", "scss", "twig", "pug", "json" },
    sync_install = false,
    highlight = {
        enable = true,
        additional_vim_regex_highlighting = true,
    },
    indent = {
        enable = true,
    },
    rainbow = {
        enable = true,
        extended_mode = true,
    },
    auto_tag = {
        enable = true,
    },
    context_commentstring = {
        enable = true,
    },
}
