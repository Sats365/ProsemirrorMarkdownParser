import { Schema } from "prosemirror-model";

export const schema = new Schema({
	nodes: {
		text: { group: "inline" },
		doc: { content: "block+" },
		horizontal_rule: { group: "block" },
		table: { content: "tableRow+", group: "block" },
		tableRow: { content: "(tableCell | tableHeader)*", group: "block" },
		tableHeader: {
			content: "block+",
			group: "block",
			attrs: {
				colspan: { default: 1 },
				rowspan: { default: 1 },
				colwidth: { default: null },
			},
		},
		tableCell: {
			content: "block+",
			group: "block",
			attrs: {
				colspan: { default: 1 },
				rowspan: { default: 1 },
				colwidth: { default: null },
			},
		},
		paragraph: { content: "inline*", group: "block" },
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

		comment_block: {
			content: "block+",
			group: "block",
		},

		comment: {
			content: "block+",
			group: "block",
			attrs: {
				// mail: { default: null },
				id: { default: null },
				date: { default: null },
				time: { default: null },
				isResolved: { default: false },
			},
		},

		answer: {
			content: "block+",
			group: "block",
			attrs: {
				// mail: { default: null },
				id: { default: null },
				date: { default: null },
				time: { default: null },
			},
		},

		comment_input: {
			content: "block+",
			group: "block",
			attrs: {
				id: { default: null },
			},
		},

		answer_input: {
			content: "block+",
			group: "block",
			attrs: {
				id: { default: null },
			},
		},

		blockMd: { content: "block+", group: "block", defining: true, marks: "" },

		br: { atom: true, inline: true, group: "inline", selectable: false },

		link_component: {
			atom: true,
			inline: true,
			group: "inline",
			attrs: { text: { default: null }, href: { default: null } },
		},
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
		link: { attrs: { href: {}, title: { default: null } }, inclusive: false },

		inlineMd: {},
	},
});
