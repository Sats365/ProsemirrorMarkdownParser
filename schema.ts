import { Schema } from "prosemirror-model";

import answer from "../../../../extensions/markdown/elements/answer/edit/answerSchema";
import doc from "../../../../extensions/markdown/elements/aricle/edit/doc";
import code_block from "../../../../extensions/markdown/elements/fence/edit/model/codeBlockSchema";

import c4Diagram from "../../../../extensions/markdown/elements/diagrams/diagrams/c4Diagram/model/c4DiagramSchema";
import mermaid from "../../../../extensions/markdown/elements/diagrams/diagrams/mermaid/model/mermaidSchema";
import plantUml from "../../../../extensions/markdown/elements/diagrams/diagrams/plantUml/model/plantUmlSchema";
import tsDiagram from "../../../../extensions/markdown/elements/diagrams/diagrams/tsDiagram/model/tsDiagramSchema";
import diagrams from "../../../../extensions/markdown/elements/diagrams/edit/models/diagramsSchema";

export const schema = new Schema({
	nodes: {
		doc,
		answer,
		code_block,

		diagrams,
		mermaid,
		"plant-uml": plantUml,
		"c4-diagram": c4Diagram,
		"ts-diagram": tsDiagram,

		text: { group: "inline" },
		horizontal_rule: { group: "block" },
		table: { content: "tableRow+", group: "block" },
		tableRow: { content: "(tableCell | tableHeader)*", group: "block" },
		tableCell: {
			content: "block+",
			group: "block",
			attrs: {
				colspan: { default: 1 },
				rowspan: { default: 1 },
				colwidth: { default: null },
			},
		},
		tableHeader: {
			content: "block+",
			group: "block",
			attrs: {
				colspan: { default: 1 },
				rowspan: { default: 1 },
				colwidth: { default: null },
			},
		},
		tableCell_simple: { content: "inline+", group: "block" },
		tableHeader_simple: { content: "inline+", group: "block" },
		tableBodyRow_simple: { content: "tableCell_simple+", group: "block" },
		tableHeaderRow_simple: { content: "tableHeader_simple+", group: "block" },
		table_simple: { content: "(tableHeader_simple | tableCell_simple)*", group: "block" },
		paragraph: { content: "inline*", group: "block" },
		error: { content: "inline*", group: "block" },
		blockquote: { content: "block+", group: "block" },
		list_item: { content: "paragraph block*", defining: true },
		bullet_list: { content: "list_item+", group: "block", attrs: { tight: { default: false } } },
		video: {
			group: "block",
			attrs: {
				title: { default: null },
				path: { default: null },
				isLink: { default: true },
			},
		},
		heading: {
			attrs: { level: { default: 1 } },
			content: "(text | image)*",
			group: "block",
			defining: true,
		},

		ordered_list: {
			group: "block",
			content: "list_item+",
			attrs: { order: { default: 1 }, tight: { default: false } },
		},

		hard_break: { inline: true, group: "inline", selectable: false },

		image: {
			inline: true,
			group: "inline",
			draggable: true,
			attrs: { src: {}, alt: { default: null }, title: { default: null } },
		},

		note: {
			content: "block+",
			group: "block",
			attrs: { type: { default: null }, title: { default: null } },
		},

		drawio: {
			group: "block",
			attrs: { src: { default: null }, title: { default: null } },
		},

		cut: {
			content: "block+",
			group: "block",
			attrs: { text: { default: "Раскрыть" }, expanded: { default: true }, isInline: { default: false } },
		},
		inlineCut_component: {
			group: "block",
			content: "inline*",
			attrs: { text: { default: "Раскрыть" }, expanded: { default: true }, isInline: { default: false } },
		},

		comment_block: {
			content: "block+",
			group: "block",
		},

		comment: {
			content: "block+",
			group: "block",
			attrs: {
				mail: { default: null },
				dateTime: { default: null },
				isResolved: { default: false },
			},
		},

		style_wrapper: {
			group: "block",
			content: "block+",
			attrs: {
				style: { default: null },
			},
		},

		comment_input: {
			content: "block+",
			group: "block",
			attrs: {
				mail: { default: null },
			},
		},

		blockMd: { content: "block+", group: "block", defining: true, marks: "" },

		br: { atom: true, inline: true, group: "inline", selectable: false },

		inlineMd_component: {
			atom: true,
			inline: true,
			group: "inline",
			attrs: { text: { default: null }, tag: { default: null } },
		},
		blockMd_component: {
			marks: "",
			group: "block",
			defining: true,
			content: "text*",
			attrs: { text: { default: null }, tag: { default: null } },
		},
	},
	marks: {
		s: {},
		em: {},
		code: {},
		strong: {},
		link: { attrs: { href: {}, hash: {}, resourcePath: {} }, inclusive: false },
		inlineMd: {},
		inlineCut: {
			attrs: { text: { default: "Раскрыть" }, expanded: { default: true }, isInline: { default: true } },
		},
	},
});
