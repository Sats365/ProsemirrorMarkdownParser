export const tokens = {
	br: { node: "br" },
	error: {
		node: "error",
		getAttrs: (tok) => tok.meta,
	},

	// cmd: { node: "cmd", getAttrs: (tok) => tok.attrs },
	note: { block: "note", getAttrs: (tok) => tok.attrs },
	blockMd: { block: "blockMd" },

	table: { block: "table", getAttrs: (_, tokens, i) => ({ tight: listIsTight(tokens, i) }) },
	thead: { block: "thead", getAttrs: (_, tokens, i) => ({ tight: listIsTight(tokens, i) }) },
	tbody: { block: "tbody", getAttrs: (_, tokens, i) => ({ tight: listIsTight(tokens, i) }) },
	tr: { block: "tr", getAttrs: (_, tokens, i) => ({ tight: listIsTight(tokens, i) }) },
	th: { block: "th", getAttrs: (_, tokens, i) => ({ tight: listIsTight(tokens, i) }) },
	td: { block: "td", getAttrs: (_, tokens, i) => ({ tight: listIsTight(tokens, i) }) },
	blockquote: { block: "blockquote" },
	paragraph: { block: "paragraph" },
	list_item: { block: "list_item" },
	bullet_list: { block: "bullet_list", getAttrs: (_, tokens, i) => ({ tight: listIsTight(tokens, i) }) },
	ordered_list: {
		block: "ordered_list",
		getAttrs: (tok, tokens, i) => ({
			order: +tok.attrGet("start") || 1,
			tight: listIsTight(tokens, i),
		}),
	},
	heading: { block: "heading", getAttrs: (tok) => ({ level: +tok.tag.slice(1) }) },
	code_block: { block: "code_block", noCloseToken: true },
	fence: { block: "code_block", getAttrs: (tok) => ({ params: tok.info || "" }), noCloseToken: true },
	hr: { node: "horizontal_rule" },
	image: {
		node: "image",
		getAttrs: (tok) => ({
			src: tok.attrGet("src"),
			title: tok.attrGet("title") || null,
			alt: (tok.children[0] && tok.children[0].content) || null,
		}),
	},
	hardbreak: { node: "hard_break" },
	s: { mark: "s" },
	em: { mark: "em" },
	inlineMd: { mark: "inlineMd" },

	strong: { mark: "strong" },
	link: {
		mark: "link",
		getAttrs: (tok) => ({
			href: tok.attrGet("href"),
			title: tok.attrGet("title") || null,
		}),
	},
	code_inline: { mark: "code", noCloseToken: true },
};
function listIsTight(tokens, i) {
	while (++i < tokens.length) if (tokens[i].type != "list_item_open") return tokens[i].hidden;
	return false;
}
