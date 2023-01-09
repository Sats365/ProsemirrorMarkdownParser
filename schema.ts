import { Schema } from "prosemirror-model";

export const schema = new Schema({
	nodes: {
		text: { group: "inline" },
		doc: { content: "block+" },
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
		heading: {
			attrs: { level: { default: 1 } },
			content: "(text | image)*",
			group: "block",
			defining: true,
		},

		code_block: {
			marks: "",
			code: true,
			defining: true,
			group: "block",
			content: "text*",
			attrs: { params: { default: "" } },
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

		answer: {
			content: "block+",
			group: "block",
			attrs: {
				mail: { default: null },
				dateTime: { default: null },
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
