import { imageToken } from "../../../../extensions/markdown/elements/image/edit/model/imageToken";
import { linkToken } from "../../../../extensions/markdown/elements/link/edit/model/linkToken";
import Context from "../../Context/Context";

function listIsTight(tokens, i) {
	while (++i < tokens.length) if (tokens[i].type != "list_item_open") return tokens[i].hidden;
	return false;
}

const getTokensByContext = (context?: Context) => {
	return {
		link: linkToken(context),
		image: imageToken(context),
	};
};

export const getTokens = (context?: Context) => {
	const contextTokens = context ? getTokensByContext(context) : {};
	return {
		br: { node: "br" },

		cut: {
			block: "cut",
			getAttrs: (tok) => {
				return { ...tok.attrs, isInline: false };
			},
		},
		note: { block: "note", getAttrs: (tok) => tok.attrs },
		comment_block: { block: "comment_block", getAttrs: (tok) => tok.attrs },
		comment: { block: "comment", getAttrs: (tok) => tok.attrs },
		answer: { block: "answer", getAttrs: (tok) => tok.attrs },
		comment_input: { block: "comment_input", getAttrs: (tok) => tok.attrs },
		blockMd: { block: "blockMd" },
		table: { block: "table" },
		tableRow: { block: "tableRow" },
		tableCell: { block: "tableCell", getAttrs: (tok) => tok.attrs },
		tableHeader: { block: "tableHeader", getAttrs: (tok) => tok.attrs },
		blockquote: { block: "blockquote" },
		paragraph: { block: "paragraph" },
		error: { block: "error" },
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

		hardbreak: { node: "hard_break" },
		s: { mark: "s" },
		em: { mark: "em" },
		inlineMd: { mark: "inlineMd" },
		inlineCut: {
			mark: "inlineCut",
			getAttrs: (tok) => {
				return { ...tok.attrs, isInline: true };
			},
		},

		strong: { mark: "strong" },
		code_inline: { mark: "code", noCloseToken: true },

		...contextTokens,
	};
};
