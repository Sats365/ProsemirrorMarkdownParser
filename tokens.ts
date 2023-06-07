import c4DiagramToken from "../../../../extensions/markdown/elements/diagrams/diagrams/c4Diagram/c4DiagramToken";
import mermaidToken from "../../../../extensions/markdown/elements/diagrams/diagrams/mermaid/mermaidToken";
import plantUmlToken from "../../../../extensions/markdown/elements/diagrams/diagrams/plantUml/plantUmlToken";
import tsDiagramToken from "../../../../extensions/markdown/elements/diagrams/diagrams/tsDiagram/tsDiagramToken";

import diagramsToken from "../../../../extensions/markdown/elements/diagrams/edit/models/diagramsToken";
import drawioToken from "../../../../extensions/markdown/elements/drawio/edit/model/drawioToken";
import codeBlockToken from "../../../../extensions/markdown/elements/fence/edit/model/codeBlockToken";
import imageToken from "../../../../extensions/markdown/elements/image/edit/model/imageToken";
import linkToken from "../../../../extensions/markdown/elements/link/edit/model/linkToken";
import video from "../../../../extensions/markdown/elements/video/edit/model/videoToken";
import ParserContext from "../../ParserContext/ParserContext";

function listIsTight(tokens, i) {
	while (++i < tokens.length) if (tokens[i].type != "list_item_open") return tokens[i].hidden;
	return false;
}

const getTokensByContext = (context?: ParserContext) => {
	return {};
};

export const getTokens = (context?: ParserContext) => {
	const contextTokens = context ? getTokensByContext(context) : {};
	return {
		link: linkToken(context),
		image: imageToken(),
		drawio: drawioToken(),
		code_block: codeBlockToken,

		mermaid: mermaidToken,
		diagrams: diagramsToken,
		"plant-uml": plantUmlToken,
		"c4-diagram": c4DiagramToken,
		"ts-diagram": tsDiagramToken,

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

		video,
		...contextTokens,
	};
};
