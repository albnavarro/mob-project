-- Run Stylelint from node modules
vim.api.nvim_create_user_command('StylelintFix',':! npx stylelint % --fix ',{})
