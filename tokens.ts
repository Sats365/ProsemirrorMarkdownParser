import Context from "../../Context/Context";

import br from "../../../../extensions/markdown/elements/br/edit/brToken";
import drawioToken from "../../../../extensions/markdown/elements/drawio/edit/model/drawioToken";
import heading from "../../../../extensions/markdown/elements/heading/edit/model/headingToken";
import imageToken from "../../../../extensions/markdown/elements/image/edit/model/imageToken";
import linkToken from "../../../../extensions/markdown/elements/link/edit/model/linkToken";
import bullet_list from "../../../../extensions/markdown/elements/list/edit/models/bulletList/bulletListToken";
import ordered_list from "../../../../extensions/markdown/elements/list/edit/models/orderList/orderListToken";
import video from "../../../../extensions/markdown/elements/video/edit/model/videoToken";

const getTokensByContext = (context?: Context) => {
	return {
		link: linkToken(context),
		image: imageToken(context),
		drawio: drawioToken(context),
	};
};

export const getTokens = (context?: Context) => {
	const contextTokens = context ? getTokensByContext(context) : {};
	return {
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

		br,
		video,
		heading,
		bullet_list,
		ordered_list,
		...contextTokens,
	};
};
