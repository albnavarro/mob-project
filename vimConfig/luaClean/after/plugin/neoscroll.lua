local neoscroll_status_ok, neoscroll = pcall(require, "neoscroll")
if not neoscroll_status_ok then
	return
end

neoscroll.setup({
	mappings = { "<C-u>", "<C-d>" },
})

local t = {}
t["<C-k>"] = { "scroll", { "-0.10", "true", "150" } }
t["<C-j>"] = { "scroll", { "0.10", "true", "150" } }

require("neoscroll.config").set_mappings(t)
